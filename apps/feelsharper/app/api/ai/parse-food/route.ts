import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIOrchestrator } from '@/lib/ai/core/AIOrchestrator';
import { ParsedFood } from '@/lib/ai/types';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const { input, meal_type, save = true } = await request.json();
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    // Process with AI
    const orchestrator = new AIOrchestrator();
    const result = await orchestrator.processRequest<ParsedFood>(
      'parse_food',
      input,
      user.id
    );

    if (!result.success) {
      // Check if it's a usage limit error
      if (result.error?.includes('limit reached')) {
        return NextResponse.json(
          { 
            error: result.error,
            upgrade_required: true,
            usage: await orchestrator.getUserUsageSummary(user.id)
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Optionally save to database
    if (save && result.data) {
      const foodLog = {
        user_id: user.id,
        date: new Date().toISOString(),
        meal_type: meal_type || result.data.meal_type || 'snack',
        foods: result.data.foods,
        total_calories: result.data.total_calories,
        total_protein: result.data.total_protein,
        total_carbs: result.data.total_carbs,
        total_fat: result.data.total_fat,
        ai_parsed: true,
        raw_input: input
      };

      const { data: saved, error: saveError } = await supabase
        .from('food_logs')
        .insert(foodLog)
        .select()
        .single();

      if (saveError) {
        console.error('Failed to save food log:', saveError);
      } else {
        (result.data as any).id = saved.id;
      }
    }

    // Check if user should be prompted to upgrade
    const shouldUpgrade = await orchestrator.shouldPromptUpgrade(user.id);

    return NextResponse.json({
      success: true,
      food: result.data,
      confidence: result.confidence,
      tokens_used: result.tokens_used,
      cost_cents: result.cost_cents,
      processing_time_ms: result.processing_time_ms,
      prompt_upgrade: shouldUpgrade
    });

  } catch (error) {
    console.error('Parse food error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}