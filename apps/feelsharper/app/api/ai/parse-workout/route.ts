import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { WorkoutParser } from '@/lib/ai/parsers/WorkoutParser';
import type { AIContext, ParsedWorkout, ModelConfig } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const supabase = await createServerClient();
    
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

    // Load user context for better parsing
    const [recentWorkouts, userPatterns, userProfile] = await Promise.all([
      supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10),
      supabase
        .from('user_patterns')
        .select('*')
        .eq('user_id', user.id)
        .eq('pattern_type', 'exercise_alias'),
      supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
    ]);

    const context: AIContext = {
      userId: user.id,
      profile: userProfile.data || { 
        id: user.id, 
        email: user.email!, 
        subscription_tier: 'free' 
      } as any,
      recentWorkouts: recentWorkouts.data || [],
      recentNutrition: [],
      bodyMetrics: [],
      goals: [],
      patterns: userPatterns.data || [],
      conversations: []
    };

    const config: ModelConfig = {
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 1000
    };

    // Parse with AI
    const parser = new WorkoutParser();
    const result = await parser.process(input, context, config);

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
      }
    }

    // Store AI usage for tracking
    const costCents = result.tokens_used * 0.00015; // GPT-4o-mini cost
    await supabase
      .from('ai_usage_tracking')
      .insert({
        user_id: user.id,
        endpoint: 'parse_workout',
        tokens_used: result.tokens_used,
        cost_cents: costCents,
        tier: context.profile.subscription_tier
      });

    return NextResponse.json({
      success: true,
      workout: result.data,
      confidence: result.confidence,
      tokens_used: result.tokens_used,
      cost_cents: costCents,
      processing_time_ms: Date.now() - startTime
    });

  } catch (error) {
    console.error('Parse workout error:', error);
    return NextResponse.json(
      { error: 'Failed to parse workout' },
      { status: 500 }
    );
  }
}