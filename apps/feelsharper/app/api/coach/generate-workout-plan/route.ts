import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { FitnessCoachAgent } from '@sharpened/ai-core';

export const runtime = 'edge';

// POST /api/coach/generate-workout-plan
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      goal, 
      experienceLevel, 
      daysPerWeek, 
      durationWeeks, 
      equipment, 
      limitations,
      preferences 
    } = body;

    // Validate required fields
    if (!goal || !experienceLevel || !daysPerWeek || !durationWeeks) {
      return NextResponse.json({ 
        error: 'Missing required fields: goal, experienceLevel, daysPerWeek, durationWeeks' 
      }, { status: 400 });
    }

    // Get user profile and recent workout data
    const [profileData, recentWorkouts, bodyWeightData, pastPlans] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10),
      supabase.from('body_weight')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5),
      supabase.from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', false)
        .limit(3)
    ]);

    // Initialize AI agent
    const fitnessAgent = new FitnessCoachAgent();

    // Prepare context for AI
    const userContext = {
      profile: profileData.data,
      recentWorkouts: recentWorkouts.data || [],
      bodyWeightHistory: bodyWeightData.data || [],
      pastPlans: pastPlans.data || [],
      preferences: {
        goal,
        experienceLevel,
        daysPerWeek: parseInt(daysPerWeek),
        durationWeeks: parseInt(durationWeeks),
        equipment: equipment || 'gym',
        limitations: limitations || [],
        preferences: preferences || []
      }
    };

    // Generate workout plan using AI
    const workoutPlan = await fitnessAgent.generateWorkoutPlan(userContext);

    // Structure the plan data
    const planData = {
      user_id: user.id,
      title: workoutPlan.title,
      description: workoutPlan.description,
      goal_type: goal,
      experience_level: experienceLevel,
      duration_weeks: parseInt(durationWeeks),
      days_per_week: parseInt(daysPerWeek),
      phases: workoutPlan.phases,
      created_by: 'ai_coach',
      is_active: false, // User needs to activate it
      metadata: {
        generation_context: userContext.preferences,
        ai_confidence: workoutPlan.confidence,
        customization_notes: workoutPlan.notes
      }
    };

    // Save plan to database
    const { data: savedPlan, error: saveError } = await supabase
      .from('workout_plans')
      .insert(planData)
      .select()
      .single();

    if (saveError) {
      console.error('Error saving workout plan:', saveError);
      return NextResponse.json({ error: 'Failed to save workout plan' }, { status: 500 });
    }

    // Generate detailed workout templates for each week
    const workoutTemplates = [];
    
    for (const phase of workoutPlan.phases) {
      for (let week = phase.startWeek; week <= phase.endWeek; week++) {
        for (let day = 1; day <= parseInt(daysPerWeek); day++) {
          const template = await fitnessAgent.generateWorkoutTemplate({
            phase: phase.name,
            week,
            day,
            focus: phase.focus,
            intensity: phase.intensity,
            exercises: phase.exercises,
            userLevel: experienceLevel,
            equipment: equipment || 'gym'
          });

          workoutTemplates.push({
            plan_id: savedPlan.id,
            week_number: week,
            day_number: day,
            phase_name: phase.name,
            title: template.title,
            description: template.description,
            estimated_duration: template.estimatedDuration,
            exercises: template.exercises,
            warm_up: template.warmUp,
            cool_down: template.coolDown,
            notes: template.notes,
            difficulty_level: template.difficulty
          });
        }
      }
    }

    // Save workout templates
    if (workoutTemplates.length > 0) {
      const { error: templatesError } = await supabase
        .from('workout_templates')
        .insert(workoutTemplates);

      if (templatesError) {
        console.error('Error saving workout templates:', templatesError);
        // Continue anyway, plan is still saved
      }
    }

    // Generate initial insights and recommendations
    const insights = await fitnessAgent.generatePlanInsights({
      plan: workoutPlan,
      userContext,
      historicalData: {
        workouts: recentWorkouts.data || [],
        bodyWeight: bodyWeightData.data || []
      }
    });

    // Save insights
    const insightRecords = insights.map(insight => ({
      user_id: user.id,
      insight_type: insight.type,
      insight_text: insight.text,
      confidence_score: insight.confidence,
      data_points_used: insight.dataPoints,
      recommendations: insight.recommendations,
      plan_id: savedPlan.id,
      category: 'workout_plan_generation'
    }));

    if (insightRecords.length > 0) {
      await supabase
        .from('user_insights')
        .insert(insightRecords);
    }

    // Return the complete plan with templates
    const completeResponse = {
      plan: savedPlan,
      phases: workoutPlan.phases,
      templates: workoutTemplates,
      insights: insights,
      recommendations: workoutPlan.recommendations,
      keyMetrics: {
        totalWorkouts: workoutTemplates.length,
        averageDuration: workoutTemplates.reduce((sum, t) => sum + (t.estimated_duration || 45), 0) / workoutTemplates.length,
        primaryMovements: workoutPlan.primaryMovements,
        expectedOutcomes: workoutPlan.expectedOutcomes
      },
      nextSteps: [
        'Review the complete workout plan',
        'Activate the plan when ready to start',
        'Schedule your first workout',
        'Set up progress tracking'
      ]
    };

    return NextResponse.json(completeResponse);

  } catch (error) {
    console.error('Workout plan generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate workout plan',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}