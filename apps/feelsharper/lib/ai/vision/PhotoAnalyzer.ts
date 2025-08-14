import OpenAI from 'openai';
import { ModelConfig } from '@/lib/ai/types';

export class PhotoAnalyzer {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async process(
    imageUrl: string,
    context: any,
    config: ModelConfig
  ): Promise<{ data: any; confidence: number; tokens_used: number }> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Analyze with GPT-4 Vision
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        max_tokens: config.max_tokens || 1000,
        temperature: config.temperature || 0.3,
        messages: [
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: systemPrompt
              },
              { 
                type: 'image_url', 
                image_url: { 
                  url: imageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ]
      });

      const response = completion.choices[0].message.content;
      const parsed = this.parseVisionResponse(response || '');
      
      return {
        data: parsed,
        confidence: this.calculateConfidence(parsed),
        tokens_used: completion.usage?.total_tokens || 0
      };

    } catch (error) {
      console.error('Photo analysis error:', error);
      throw new Error('Failed to analyze photo');
    }
  }

  private buildSystemPrompt(context: any): string {
    const userPreferences = context.patterns
      ?.filter((p: any) => p.pattern_type === 'food_preference')
      .map((p: any) => p.pattern_key)
      .join(', ');

    return `Analyze this food photo and identify all visible food items with portion estimates.

USER CONTEXT:
- Common foods: ${userPreferences || 'varied'}
- Average daily calories: ${context.profile?.avg_daily_calories || 2000}

ANALYSIS REQUIREMENTS:
1. Identify ALL visible food items
2. Estimate portion size in grams or standard units
3. Identify cooking methods (grilled, fried, baked, raw)
4. Note any visible condiments or toppings
5. Assess overall meal composition (balanced, protein-heavy, etc.)
6. Estimate total calories

PORTION ESTIMATION GUIDE:
- Compare to common objects (tennis ball = 1 cup, deck of cards = 3oz meat)
- Account for plate size (standard dinner plate = 10-12 inches)
- Consider food density and stacking
- Be conservative with hidden ingredients (oil, butter)

OUTPUT FORMAT:
Provide a JSON response with:
{
  "foods": [
    {
      "name": "specific food name",
      "quantity": number,
      "unit": "grams or standard unit",
      "cooking_method": "grilled/fried/baked/raw/etc",
      "visible_additions": ["list of toppings/condiments"],
      "confidence": 0.0-1.0
    }
  ],
  "meal_type": "breakfast/lunch/dinner/snack",
  "meal_composition": {
    "protein_sources": ["list"],
    "carb_sources": ["list"],
    "vegetable_sources": ["list"],
    "fat_sources": ["list"]
  },
  "estimated_totals": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number
  },
  "overall_confidence": 0.0-1.0
}`;
  }

  private parseVisionResponse(response: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: create structured data from text response
      return this.extractStructuredData(response);
    } catch (error) {
      console.error('Failed to parse vision response:', error);
      return {
        foods: [],
        error: 'Failed to parse response',
        raw_response: response
      };
    }
  }

  private extractStructuredData(text: string): any {
    // Basic extraction if JSON parsing fails
    const foods: any[] = [];
    
    // Look for food items mentioned
    const foodPattern = /(?:(?:\d+(?:\.\d+)?)\s*(?:g|grams|oz|ounces|cup|cups|piece|pieces|slice|slices))?\s*(?:of\s+)?([a-zA-Z\s]+?)(?:,|\.|;|$)/gi;
    let match;
    
    while ((match = foodPattern.exec(text)) !== null) {
      const quantity = match[1] ? parseFloat(match[1]) : 1;
      const unit = match[2] || 'serving';
      const name = match[3]?.trim();
      
      if (name && name.length > 2) {
        foods.push({
          name,
          quantity,
          unit,
          confidence: 0.5
        });
      }
    }
    
    return {
      foods,
      meal_type: 'unknown',
      overall_confidence: 0.5
    };
  }

  private calculateConfidence(parsed: any): number {
    if (!parsed.foods || parsed.foods.length === 0) {
      return 0.3;
    }
    
    // Use overall_confidence if provided
    if (parsed.overall_confidence) {
      return parsed.overall_confidence;
    }
    
    // Calculate average confidence from individual items
    const avgConfidence = parsed.foods.reduce(
      (sum: number, food: any) => sum + (food.confidence || 0.5),
      0
    ) / parsed.foods.length;
    
    return avgConfidence;
  }
}