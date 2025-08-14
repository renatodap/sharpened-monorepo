import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIOrchestrator } from '@/lib/ai/core/AIOrchestrator';
import { ParsedWorkout } from '@/lib/ai/types';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const { input, save = true } = await request.json();
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    // Process with AI
    const orchestrator = new AIOrchestrator();
    const result = await orchestrator.processRequest<ParsedWorkout>(
      'parse_workout',
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
      const workout = {
        user_id: user.id,
        date: new Date().toISOString(),
        exercises: result.data.exercises,
        total_volume: result.data.total_volume,
        estimated_calories: result.data.estimated_calories,
        workout_type: result.data.workout_type,
        intensity_score: result.data.intensity_score,
        ai_parsed: true,
        raw_input: input
      };

      const { data: saved, error: saveError } = await supabase
        .from('workouts')
        .insert(workout)
        .select()
        .single();

      if (saveError) {
        console.error('Failed to save workout:', saveError);
      } else {
        result.data = { ...result.data, id: saved.id };
      }
    }

    // Check if user should be prompted to upgrade
    const shouldUpgrade = await orchestrator.shouldPromptUpgrade(user.id);

    return NextResponse.json({
      success: true,
      workout: result.data,
      confidence: result.confidence,
      tokens_used: result.tokens_used,
      cost_cents: result.cost_cents,
      processing_time_ms: result.processing_time_ms,
      prompt_upgrade: shouldUpgrade
    });

  } catch (error) {
    console.error('Parse workout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}