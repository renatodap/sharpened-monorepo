/**
 * EnhancedFoodParser - Natural language and photo-based food parsing
 * Maps to PRD: Photo Analysis + Food Parsing
 */

import { createClient } from '@supabase/supabase-js';

export interface FoodParseResult {
  foods: ParsedFood[];
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  confidence: number;
  recipe_detected?: boolean;
  suggestions?: string[];
}

export interface ParsedFood {
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  usda_match?: USDAMatch;
  confidence: number;
}

export interface USDAMatch {
  fdc_id: string;
  description: string;
  match_score: number;
  data_type: string;
}

export interface PhotoAnalysisResult {
  detected_foods: DetectedFood[];
  meal_context: string;
  portion_estimates: PortionEstimate[];
  plate_analysis?: PlateAnalysis;
  confidence: number;
}

export interface DetectedFood {
  name: string;
  category: string;
  visible_portion: string;
  cooking_method?: string;
  confidence: number;
  bounding_box?: { x: number; y: number; width: number; height: number };
}

export interface PortionEstimate {
  food_name: string;
  estimated_amount: number;
  unit: string;
  reference: string; // e.g., "palm-sized", "fist-sized", "deck of cards"
}

export interface PlateAnalysis {
  plate_composition: {
    protein_percentage: number;
    carbs_percentage: number;
    vegetables_percentage: number;
    fats_percentage: number;
  };
  meal_balance_score: number;
  recommendations: string[];
}

export class EnhancedFoodParser {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  private usdaDatabase: Map<string, any> = new Map();

  /**
   * Parse natural language food description
   */
  async parseNaturalLanguage(input: string): Promise<FoodParseResult> {
    // Clean and normalize input
    const normalized = this.normalizeInput(input);
    
    // Extract quantities and units
    const extractedItems = this.extractFoodItems(normalized);
    
    // Match with USDA database
    const matchedFoods = await Promise.all(
      extractedItems.map(item => this.matchWithUSDA(item))
    );
    
    // Calculate totals
    const totals = this.calculateTotals(matchedFoods);
    
    // Determine meal type
    const mealType = this.detectMealType(normalized);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(matchedFoods, totals);
    
    return {
      foods: matchedFoods,
      meal_type: mealType,
      total_calories: totals.calories,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fat: totals.fat,
      confidence: this.calculateOverallConfidence(matchedFoods),
      recipe_detected: this.detectRecipe(normalized),
      suggestions
    };
  }

  /**
   * Analyze food photo using GPT-4 Vision
   */
  async analyzePhoto(imageBase64: string): Promise<PhotoAnalysisResult> {
    try {
      // Simulate GPT-4 Vision API call (would use OpenAI API in production)
      const mockAnalysis = await this.mockPhotoAnalysis(imageBase64);
      
      // Process detected foods
      const detectedFoods = mockAnalysis.foods.map(food => ({
        name: food.name,
        category: this.categorizeFood(food.name),
        visible_portion: food.portion,
        cooking_method: food.cooking_method,
        confidence: food.confidence,
        bounding_box: food.bbox
      }));
      
      // Estimate portions
      const portionEstimates = this.estimatePortions(detectedFoods);
      
      // Analyze plate composition
      const plateAnalysis = this.analyzePlateComposition(detectedFoods);
      
      return {
        detected_foods: detectedFoods,
        meal_context: mockAnalysis.context,
        portion_estimates: portionEstimates,
        plate_analysis: plateAnalysis,
        confidence: mockAnalysis.overall_confidence
      };
    } catch (error) {
      console.error('Photo analysis failed:', error);
      throw new Error('Failed to analyze food photo');
    }
  }

  /**
   * Parse recipe with ingredient breakdown
   */
  async parseRecipe(recipeText: string, servings: number = 1): Promise<FoodParseResult> {
    // Extract ingredients
    const ingredients = this.extractIngredients(recipeText);
    
    // Parse each ingredient
    const parsedIngredients = await Promise.all(
      ingredients.map(ing => this.parseIngredient(ing))
    );
    
    // Calculate per-serving nutrition
    const totalNutrition = this.calculateTotals(parsedIngredients);
    const perServing = {
      calories: totalNutrition.calories / servings,
      protein: totalNutrition.protein / servings,
      carbs: totalNutrition.carbs / servings,
      fat: totalNutrition.fat / servings
    };
    
    return {
      foods: parsedIngredients.map(food => ({
        ...food,
        quantity: food.quantity / servings,
        calories: food.calories / servings,
        protein_g: food.protein_g / servings,
        carbs_g: food.carbs_g / servings,
        fat_g: food.fat_g / servings
      })),
      total_calories: perServing.calories,
      total_protein: perServing.protein,
      total_carbs: perServing.carbs,
      total_fat: perServing.fat,
      confidence: 0.85,
      recipe_detected: true
    };
  }

  /**
   * Smart meal suggestions based on user goals
   */
  async generateMealSuggestions(
    currentMacros: { protein: number; carbs: number; fat: number },
    dailyGoals: { calories: number; protein: number; carbs: number; fat: number },
    mealType: string
  ): Promise<string[]> {
    const remaining = {
      calories: dailyGoals.calories - currentMacros.protein * 4 - currentMacros.carbs * 4 - currentMacros.fat * 9,
      protein: dailyGoals.protein - currentMacros.protein,
      carbs: dailyGoals.carbs - currentMacros.carbs,
      fat: dailyGoals.fat - currentMacros.fat
    };
    
    const suggestions: string[] = [];
    
    // Protein suggestions
    if (remaining.protein > 20) {
      suggestions.push(`Add ${Math.round(remaining.protein)}g more protein (e.g., chicken breast, Greek yogurt, protein shake)`);
    }
    
    // Carb suggestions
    if (remaining.carbs > 30 && mealType !== 'dinner') {
      suggestions.push(`Include complex carbs for energy (e.g., oatmeal, sweet potato, quinoa)`);
    }
    
    // Fat suggestions
    if (remaining.fat > 10) {
      suggestions.push(`Add healthy fats (e.g., avocado, nuts, olive oil)`);
    }
    
    // Vegetable suggestions
    if (mealType === 'lunch' || mealType === 'dinner') {
      suggestions.push('Add more vegetables for fiber and micronutrients');
    }
    
    // Hydration reminder
    suggestions.push('Remember to stay hydrated - aim for 8-10 glasses of water daily');
    
    return suggestions;
  }

  /**
   * Extract food items from normalized text
   */
  private extractFoodItems(text: string): Array<{ name: string; quantity: number; unit: string }> {
    const items: Array<{ name: string; quantity: number; unit: string }> = [];
    
    // Common patterns
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(cups?|oz|ounces?|grams?|g|pounds?|lbs?|tablespoons?|tbsp|teaspoons?|tsp|pieces?|slices?|servings?)\s+(?:of\s+)?([^,\n]+)/gi,
      /([^,\n]+?)\s*[(-]\s*(\d+(?:\.\d+)?)\s*(cups?|oz|ounces?|grams?|g|calories?|cal)/gi,
      /(\d+(?:\.\d+)?)\s+([^,\n]+)/gi
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const quantity = parseFloat(match[1]) || 1;
        const unit = match[2] || 'serving';
        const name = match[3] || match[2];
        
        if (name && !items.some(item => item.name === name)) {
          items.push({
            name: name.trim(),
            quantity,
            unit: unit.toLowerCase()
          });
        }
      }
    }
    
    // If no patterns matched, try to extract food names
    if (items.length === 0) {
      const foods = text.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0);
      foods.forEach(food => {
        items.push({ name: food, quantity: 1, unit: 'serving' });
      });
    }
    
    return items;
  }

  /**
   * Match food item with USDA database
   */
  private async matchWithUSDA(item: { name: string; quantity: number; unit: string }): Promise<ParsedFood> {
    // Search USDA database
    const { data: matches } = await this.supabase
      .from('foods')
      .select('*')
      .textSearch('name', item.name)
      .limit(5);
    
    let bestMatch = matches?.[0];
    let matchScore = 0;
    
    if (matches && matches.length > 0) {
      // Find best match based on similarity
      bestMatch = matches.reduce((best, current) => {
        const score = this.calculateSimilarity(item.name, current.name);
        if (score > matchScore) {
          matchScore = score;
          return current;
        }
        return best;
      }, matches[0]);
    }
    
    // Convert quantity to standard units
    const standardQuantity = this.convertToStandardUnit(item.quantity, item.unit, bestMatch);
    
    // Calculate nutrition based on quantity
    const nutrition = bestMatch ? {
      calories: (bestMatch.calories || 0) * standardQuantity,
      protein_g: (bestMatch.protein_g || 0) * standardQuantity,
      carbs_g: (bestMatch.carbs_g || 0) * standardQuantity,
      fat_g: (bestMatch.fat_g || 0) * standardQuantity,
      fiber_g: (bestMatch.fiber_g || 0) * standardQuantity,
      sugar_g: (bestMatch.sugar_g || 0) * standardQuantity,
      sodium_mg: (bestMatch.sodium_mg || 0) * standardQuantity
    } : this.estimateNutrition(item.name, standardQuantity);
    
    return {
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      ...nutrition,
      usda_match: bestMatch ? {
        fdc_id: bestMatch.fdc_id || bestMatch.id,
        description: bestMatch.name,
        match_score: matchScore,
        data_type: bestMatch.data_type || 'SR'
      } : undefined,
      confidence: bestMatch ? matchScore : 0.5
    };
  }

  /**
   * Calculate similarity between two strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // Exact match
    if (s1 === s2) return 1.0;
    
    // Contains match
    if (s2.includes(s1) || s1.includes(s2)) return 0.8;
    
    // Levenshtein distance
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    return Math.max(0, 1 - distance / maxLength);
  }

  /**
   * Levenshtein distance algorithm
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Convert quantity to standard units
   */
  private convertToStandardUnit(quantity: number, unit: string, food: any): number {
    const conversions: Record<string, number> = {
      'cup': 240,
      'cups': 240,
      'tablespoon': 15,
      'tablespoons': 15,
      'tbsp': 15,
      'teaspoon': 5,
      'teaspoons': 5,
      'tsp': 5,
      'ounce': 28.35,
      'ounces': 28.35,
      'oz': 28.35,
      'pound': 453.6,
      'pounds': 453.6,
      'lb': 453.6,
      'lbs': 453.6,
      'gram': 1,
      'grams': 1,
      'g': 1,
      'serving': 100,
      'servings': 100,
      'piece': 100,
      'pieces': 100,
      'slice': 30,
      'slices': 30
    };
    
    const grams = quantity * (conversions[unit.toLowerCase()] || 100);
    return grams / 100; // Convert to 100g portions
  }

  /**
   * Estimate nutrition when no match found
   */
  private estimateNutrition(foodName: string, quantity: number): any {
    // Basic estimates based on food categories
    const estimates: Record<string, any> = {
      'chicken': { calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
      'beef': { calories: 250, protein_g: 26, carbs_g: 0, fat_g: 15 },
      'rice': { calories: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3 },
      'pasta': { calories: 160, protein_g: 6, carbs_g: 31, fat_g: 1 },
      'bread': { calories: 265, protein_g: 9, carbs_g: 49, fat_g: 3 },
      'vegetable': { calories: 25, protein_g: 1, carbs_g: 5, fat_g: 0.2 },
      'fruit': { calories: 60, protein_g: 0.5, carbs_g: 15, fat_g: 0.2 },
      'dairy': { calories: 150, protein_g: 8, carbs_g: 12, fat_g: 8 }
    };
    
    // Find matching category
    const lowerName = foodName.toLowerCase();
    for (const [category, nutrition] of Object.entries(estimates)) {
      if (lowerName.includes(category)) {
        return {
          calories: nutrition.calories * quantity,
          protein_g: nutrition.protein_g * quantity,
          carbs_g: nutrition.carbs_g * quantity,
          fat_g: nutrition.fat_g * quantity
        };
      }
    }
    
    // Default estimate
    return {
      calories: 100 * quantity,
      protein_g: 3 * quantity,
      carbs_g: 15 * quantity,
      fat_g: 3 * quantity
    };
  }

  /**
   * Calculate total nutrition
   */
  private calculateTotals(foods: ParsedFood[]): any {
    return foods.reduce((totals, food) => ({
      calories: totals.calories + food.calories,
      protein: totals.protein + food.protein_g,
      carbs: totals.carbs + food.carbs_g,
      fat: totals.fat + food.fat_g
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }

  /**
   * Detect meal type from text
   */
  private detectMealType(text: string): 'breakfast' | 'lunch' | 'dinner' | 'snack' | undefined {
    const lower = text.toLowerCase();
    if (lower.includes('breakfast') || lower.includes('morning')) return 'breakfast';
    if (lower.includes('lunch') || lower.includes('midday')) return 'lunch';
    if (lower.includes('dinner') || lower.includes('evening')) return 'dinner';
    if (lower.includes('snack')) return 'snack';
    
    // Time-based detection
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'lunch';
    if (hour >= 17 && hour < 21) return 'dinner';
    return 'snack';
  }

  /**
   * Generate nutrition suggestions
   */
  private generateSuggestions(foods: ParsedFood[], totals: any): string[] {
    const suggestions: string[] = [];
    
    // Protein check
    if (totals.protein < 20) {
      suggestions.push('Consider adding more protein to this meal');
    }
    
    // Vegetable check
    const hasVeggies = foods.some(f => 
      f.name.toLowerCase().match(/vegetable|salad|broccoli|carrot|spinach|lettuce/)
    );
    if (!hasVeggies) {
      suggestions.push('Add vegetables for fiber and micronutrients');
    }
    
    // Calorie density
    if (totals.calories > 800) {
      suggestions.push('This is a calorie-dense meal - consider portion control');
    }
    
    // Balance check
    const proteinRatio = (totals.protein * 4) / totals.calories;
    const carbRatio = (totals.carbs * 4) / totals.calories;
    const fatRatio = (totals.fat * 9) / totals.calories;
    
    if (proteinRatio < 0.15) {
      suggestions.push('This meal is low in protein relative to calories');
    }
    if (carbRatio > 0.6) {
      suggestions.push('This meal is very high in carbohydrates');
    }
    if (fatRatio > 0.4) {
      suggestions.push('This meal is high in fat - ensure they are healthy fats');
    }
    
    return suggestions;
  }

  /**
   * Other helper methods
   */
  private normalizeInput(input: string): string {
    return input
      .toLowerCase()
      .replace(/[\n\r]+/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private detectRecipe(text: string): boolean {
    const recipeKeywords = ['recipe', 'ingredients', 'instructions', 'serves', 'servings', 'yield'];
    return recipeKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private calculateOverallConfidence(foods: ParsedFood[]): number {
    if (foods.length === 0) return 0;
    return foods.reduce((sum, food) => sum + food.confidence, 0) / foods.length;
  }

  private extractIngredients(recipeText: string): string[] {
    const lines = recipeText.split('\n');
    const ingredients: string[] = [];
    let inIngredients = false;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('ingredient')) {
        inIngredients = true;
        continue;
      }
      if (line.toLowerCase().includes('instruction') || line.toLowerCase().includes('direction')) {
        break;
      }
      if (inIngredients && line.trim()) {
        ingredients.push(line.trim());
      }
    }
    
    return ingredients;
  }

  private async parseIngredient(ingredient: string): Promise<ParsedFood> {
    const items = this.extractFoodItems(ingredient);
    if (items.length > 0) {
      return this.matchWithUSDA(items[0]);
    }
    return this.matchWithUSDA({ name: ingredient, quantity: 1, unit: 'serving' });
  }

  private categorizeFood(name: string): string {
    const categories: Record<string, string[]> = {
      protein: ['chicken', 'beef', 'fish', 'pork', 'turkey', 'egg', 'tofu', 'beans'],
      carbs: ['rice', 'pasta', 'bread', 'potato', 'oats', 'quinoa'],
      vegetables: ['broccoli', 'carrot', 'spinach', 'lettuce', 'tomato', 'cucumber'],
      fruits: ['apple', 'banana', 'orange', 'berries', 'grape'],
      dairy: ['milk', 'cheese', 'yogurt', 'butter'],
      fats: ['oil', 'nuts', 'avocado', 'seeds']
    };
    
    const lower = name.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        return category;
      }
    }
    return 'other';
  }

  private estimatePortions(foods: DetectedFood[]): PortionEstimate[] {
    return foods.map(food => ({
      food_name: food.name,
      estimated_amount: this.estimatePortionSize(food.visible_portion),
      unit: 'grams',
      reference: this.getPortionReference(food.visible_portion)
    }));
  }

  private estimatePortionSize(portion: string): number {
    const portionSizes: Record<string, number> = {
      'small': 50,
      'medium': 100,
      'large': 200,
      'handful': 30,
      'palm-sized': 85,
      'fist-sized': 150,
      'deck of cards': 85,
      'tennis ball': 150
    };
    return portionSizes[portion.toLowerCase()] || 100;
  }

  private getPortionReference(portion: string): string {
    const references: Record<string, string> = {
      'small': 'golf ball',
      'medium': 'tennis ball',
      'large': 'baseball',
      'protein': 'palm of hand',
      'carbs': 'cupped hand',
      'fats': 'thumb',
      'vegetables': 'fist'
    };
    return references[portion.toLowerCase()] || portion;
  }

  private analyzePlateComposition(foods: DetectedFood[]): PlateAnalysis {
    const composition = {
      protein_percentage: 0,
      carbs_percentage: 0,
      vegetables_percentage: 0,
      fats_percentage: 0
    };
    
    let total = 0;
    foods.forEach(food => {
      const category = food.category;
      const amount = 1;
      total += amount;
      
      if (category === 'protein') composition.protein_percentage += amount;
      else if (category === 'carbs') composition.carbs_percentage += amount;
      else if (category === 'vegetables') composition.vegetables_percentage += amount;
      else if (category === 'fats') composition.fats_percentage += amount;
    });
    
    // Convert to percentages
    if (total > 0) {
      composition.protein_percentage = (composition.protein_percentage / total) * 100;
      composition.carbs_percentage = (composition.carbs_percentage / total) * 100;
      composition.vegetables_percentage = (composition.vegetables_percentage / total) * 100;
      composition.fats_percentage = (composition.fats_percentage / total) * 100;
    }
    
    // Calculate balance score
    const idealComposition = { protein: 25, carbs: 25, vegetables: 40, fats: 10 };
    const balanceScore = 100 - Math.abs(composition.protein_percentage - idealComposition.protein) 
                              - Math.abs(composition.carbs_percentage - idealComposition.carbs)
                              - Math.abs(composition.vegetables_percentage - idealComposition.vegetables)
                              - Math.abs(composition.fats_percentage - idealComposition.fats);
    
    // Generate recommendations
    const recommendations: string[] = [];
    if (composition.vegetables_percentage < 30) {
      recommendations.push('Add more vegetables to your plate');
    }
    if (composition.protein_percentage < 20) {
      recommendations.push('Include a lean protein source');
    }
    if (composition.fats_percentage > 20) {
      recommendations.push('Consider reducing high-fat foods');
    }
    
    return {
      plate_composition: composition,
      meal_balance_score: Math.max(0, balanceScore),
      recommendations
    };
  }

  private async mockPhotoAnalysis(imageBase64: string): Promise<any> {
    // Mock implementation for photo analysis
    // In production, this would call GPT-4 Vision API
    return {
      foods: [
        {
          name: 'grilled chicken breast',
          portion: 'palm-sized',
          cooking_method: 'grilled',
          confidence: 0.9,
          bbox: { x: 100, y: 100, width: 200, height: 150 }
        },
        {
          name: 'brown rice',
          portion: 'fist-sized',
          confidence: 0.85,
          bbox: { x: 320, y: 120, width: 180, height: 140 }
        },
        {
          name: 'steamed broccoli',
          portion: 'large',
          confidence: 0.88,
          bbox: { x: 150, y: 280, width: 160, height: 120 }
        }
      ],
      context: 'lunch',
      overall_confidence: 0.87
    };
  }
}