import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { 
  AIContext, 
  ParsedFood, 
  FoodItem,
  ModelConfig 
} from '@/lib/ai/types';

export class FoodParser {
  private openai: OpenAI;
  private supabase;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.supabase = createClient();
  }

  async process(
    input: string, 
    context: AIContext, 
    config: ModelConfig
  ): Promise<{ data: ParsedFood; confidence: number; tokens_used: number }> {
    try {
      // Build system prompt with user patterns
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Call GPT for structured extraction
      const completion = await this.openai.chat.completions.create({
        model: config.model,
        temperature: config.temperature || 0.2,
        max_tokens: config.max_tokens || 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ],
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0].message.content;
      const parsed = JSON.parse(response || '{}');
      
      // Match to USDA database
      const matched = await this.matchToUSDA(parsed.foods || []);
      
      // Apply user portion patterns
      const withPortions = this.applyPortionPatterns(matched, context.patterns);
      
      // Calculate totals
      const enhanced = this.calculateNutrition(withPortions, parsed.meal_type);
      
      // Calculate confidence scores
      const confidence = this.calculateConfidence(enhanced);
      
      return {
        data: enhanced,
        confidence,
        tokens_used: completion.usage?.total_tokens || 0
      };
      
    } catch (error) {
      console.error('Food parsing error:', error);
      throw new Error('Failed to parse food');
    }
  }

  private buildSystemPrompt(context: AIContext): string {
    const recentFoods = this.extractRecentFoods(context.recentNutrition);
    const portionPatterns = context.patterns
      .filter(p => p.pattern_type === 'portion_size')
      .map(p => `${p.pattern_key}: typically ${p.pattern_value.quantity} ${p.pattern_value.unit}`)
      .join(', ');

    return `You are an expert nutritionist that parses natural language food descriptions into structured nutritional data.

USER CONTEXT:
- Frequently eaten foods: ${recentFoods.join(', ')}
- Common portion sizes: ${portionPatterns || 'standard'}
- Average daily calories: ${context.profile?.avg_daily_calories || 2000}

PARSING RULES:
1. Extract all food items with quantities and units
2. Identify meal type (breakfast, lunch, dinner, snack) if mentioned
3. Handle various quantity formats: "1 cup", "handful", "large bowl", "medium plate"
4. Handle brand names and restaurant items
5. Handle recipes and compound foods (break down into ingredients when possible)
6. Handle liquid measurements: oz, ml, cups, tablespoons
7. Handle weight measurements: grams, ounces, pounds
8. Handle colloquial descriptions: "bite", "piece", "slice", "serving"

PORTION ESTIMATES:
- handful = 30g (nuts), 25g (berries), 40g (chips)
- small bowl = 150g, medium bowl = 250g, large bowl = 350g
- small plate = 200g, medium plate = 300g, large plate = 400g
- slice (bread) = 30g, slice (pizza) = 100g, slice (cake) = 80g
- piece (fruit) = 150g (apple/orange), 120g (banana)

OUTPUT FORMAT (JSON):
{
  "foods": [
    {
      "name": "food name (specific, searchable)",
      "brand": "brand name or null",
      "quantity": number,
      "unit": "g|oz|cup|tbsp|tsp|ml|serving|piece|slice",
      "meal_component": "main|side|condiment|beverage",
      "confidence": 0.0-1.0
    }
  ],
  "meal_type": "breakfast|lunch|dinner|snack|unknown",
  "is_homemade": boolean,
  "total_items": number
}

EXAMPLES:
Input: "Had a bowl of oatmeal with banana and almond butter for breakfast"
Output: 3 foods - oatmeal (250g), banana (120g), almond butter (30g), meal_type: breakfast

Input: "Chipotle bowl with chicken, rice, beans, salsa"
Output: 4 foods with Chipotle brand, standard portions

Input: "2 eggs scrambled with cheese and toast"
Output: eggs (100g/2 large), cheese (30g), bread (30g/1 slice)`;
  }

  private extractRecentFoods(nutrition: any[]): string[] {
    const foods = new Set<string>();
    
    for (const log of nutrition.slice(0, 20)) {
      if (log.foods) {
        log.foods.forEach((food: any) => {
          foods.add(food.name);
        });
      }
    }
    
    return Array.from(foods).slice(0, 15);
  }

  private async matchToUSDA(foods: any[]): Promise<FoodItem[]> {
    const matched: FoodItem[] = [];
    
    for (const food of foods) {
      // Search USDA database
      const { data: usdaFoods } = await this.supabase
        .from('foods')
        .select('*')
        .textSearch('name', food.name)
        .limit(3);
      
      let bestMatch = usdaFoods?.[0];
      
      // If brand specified, try to find brand match
      if (food.brand && usdaFoods) {
        const brandMatch = usdaFoods.find((f: any) => 
          f.brand?.toLowerCase().includes(food.brand.toLowerCase())
        );
        if (brandMatch) bestMatch = brandMatch;
      }
      
      if (bestMatch) {
        // Calculate nutrition based on quantity
        const factor = this.calculatePortionFactor(food.quantity, food.unit, bestMatch);
        
        matched.push({
          name: bestMatch.name,
          brand: bestMatch.brand,
          quantity: food.quantity,
          unit: food.unit,
          calories: Math.round(bestMatch.calories_per_100g * factor),
          protein_g: Math.round(bestMatch.protein_g * factor * 10) / 10,
          carbs_g: Math.round(bestMatch.carbs_g * factor * 10) / 10,
          fat_g: Math.round(bestMatch.fat_g * factor * 10) / 10,
          usda_id: bestMatch.id
        });
      } else {
        // Fallback: estimate nutrition
        const estimated = this.estimateNutrition(food.name, food.quantity, food.unit);
        matched.push({
          name: food.name,
          brand: food.brand,
          quantity: food.quantity,
          unit: food.unit,
          ...estimated
        });
      }
    }
    
    return matched;
  }

  private calculatePortionFactor(quantity: number, unit: string, food: any): number {
    // Convert everything to grams for calculation
    let grams = quantity;
    
    switch(unit) {
      case 'oz':
        grams = quantity * 28.35;
        break;
      case 'cup':
        // Depends on food density, use serving_size if available
        grams = quantity * (food.grams_per_cup || 240);
        break;
      case 'tbsp':
        grams = quantity * 15;
        break;
      case 'tsp':
        grams = quantity * 5;
        break;
      case 'ml':
        grams = quantity; // Approximate 1ml = 1g
        break;
      case 'serving':
        grams = quantity * (food.serving_size_g || 100);
        break;
      case 'piece':
      case 'slice':
        grams = quantity * (food.piece_weight_g || 50);
        break;
    }
    
    // Return factor for per-100g values
    return grams / 100;
  }

  private estimateNutrition(name: string, quantity: number, unit: string): Partial<FoodItem> {
    // Rough estimates based on food categories
    const estimates: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
      // Proteins
      chicken: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      beef: { calories: 250, protein: 26, carbs: 0, fat: 15 },
      fish: { calories: 150, protein: 28, carbs: 0, fat: 5 },
      eggs: { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      
      // Carbs
      rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      pasta: { calories: 160, protein: 6, carbs: 31, fat: 1 },
      bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
      oatmeal: { calories: 70, protein: 2.5, carbs: 12, fat: 1.5 },
      
      // Vegetables
      vegetables: { calories: 30, protein: 2, carbs: 6, fat: 0.2 },
      salad: { calories: 20, protein: 1.5, carbs: 3.5, fat: 0.2 },
      
      // Default
      default: { calories: 150, protein: 5, carbs: 20, fat: 5 }
    };
    
    // Find best category match
    let category = 'default';
    for (const key of Object.keys(estimates)) {
      if (name.toLowerCase().includes(key)) {
        category = key;
        break;
      }
    }
    
    const est = estimates[category];
    const factor = this.calculatePortionFactor(quantity, unit, { serving_size_g: 100 });
    
    return {
      calories: Math.round(est.calories * factor),
      protein_g: Math.round(est.protein * factor * 10) / 10,
      carbs_g: Math.round(est.carbs * factor * 10) / 10,
      fat_g: Math.round(est.fat * factor * 10) / 10
    };
  }

  private applyPortionPatterns(foods: FoodItem[], patterns: any[]): FoodItem[] {
    const portionPatterns = patterns.filter(p => p.pattern_type === 'portion_size');
    
    return foods.map(food => {
      const pattern = portionPatterns.find(p => 
        p.pattern_key.toLowerCase() === food.name.toLowerCase()
      );
      
      if (pattern && !food.quantity) {
        // Apply user's typical portion
        return {
          ...food,
          quantity: pattern.pattern_value.typical_quantity,
          unit: pattern.pattern_value.typical_unit
        };
      }
      
      return food;
    });
  }

  private calculateNutrition(foods: FoodItem[], mealType?: string): ParsedFood {
    const totals = foods.reduce((acc, food) => ({
      calories: acc.calories + (food.calories || 0),
      protein: acc.protein + (food.protein_g || 0),
      carbs: acc.carbs + (food.carbs_g || 0),
      fat: acc.fat + (food.fat_g || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    
    const confidenceScores: Record<string, number> = {};
    foods.forEach(food => {
      confidenceScores[food.name] = food.usda_id ? 0.9 : 0.6;
    });
    
    return {
      foods,
      meal_type: mealType,
      total_calories: Math.round(totals.calories),
      total_protein: Math.round(totals.protein * 10) / 10,
      total_carbs: Math.round(totals.carbs * 10) / 10,
      total_fat: Math.round(totals.fat * 10) / 10,
      confidence_scores: confidenceScores
    };
  }

  private calculateConfidence(parsed: ParsedFood): number {
    let confidence = 0.5;
    
    // Higher confidence for USDA matched foods
    const usdaMatched = parsed.foods.filter(f => f.usda_id).length;
    confidence += (usdaMatched / parsed.foods.length) * 0.3;
    
    // Higher confidence for complete nutrition data
    const complete = parsed.foods.filter(f => 
      f.calories && f.protein_g && f.carbs_g && f.fat_g
    ).length;
    confidence += (complete / parsed.foods.length) * 0.2;
    
    return Math.min(1, confidence);
  }
}