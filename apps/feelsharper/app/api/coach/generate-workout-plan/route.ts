import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
// TODO: Re-implement fitness coaching without @sharpened/ai-core dependency
// import { FitnessCoachAgent } from '@sharpened/ai-core';

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

    // TODO: Re-implement AI fitness agent without @sharpened/ai-core dependency
    // const fitnessAgent = new FitnessCoachAgent();

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

    // Mock workout plan generation for now
    // const workoutPlan = await fitnessAgent.generateWorkoutPlan(userContext);
    const workoutPlan = {
      title: `${goal} Training Plan - ${durationWeeks} Weeks`,
      description: `A ${experienceLevel}-level ${goal} program designed for ${daysPerWeek} days per week`,
      confidence: 0.85,
      notes: [`Tailored for ${experienceLevel} level`, `Equipment: ${equipment || 'gym'}`],
      phases: [
        {
          name: 'Foundation Phase',
          startWeek: 1,
          endWeek: Math.ceil(parseInt(durationWeeks) / 2),
          focus: `Building ${goal} foundation`,
          intensity: experienceLevel === 'beginner' ? 'low' : 'moderate',
          exercises: getPhaseExercises(goal, experienceLevel, equipment || 'gym')
        },
        {
          name: 'Progressive Phase', 
          startWeek: Math.ceil(parseInt(durationWeeks) / 2) + 1,
          endWeek: parseInt(durationWeeks),
          focus: `Advanced ${goal} development`,
          intensity: experienceLevel === 'beginner' ? 'moderate' : 'high',
          exercises: getPhaseExercises(goal, experienceLevel, equipment || 'gym', true)
        }
      ],
      recommendations: [
        'Start with proper warm-up',
        'Focus on form over weight',
        'Progressive overload principle',
        'Allow adequate recovery time'
      ],
      primaryMovements: getPrimaryMovements(goal),
      expectedOutcomes: getExpectedOutcomes(goal, durationWeeks)
    };

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
          // TODO: Re-implement workout template generation without @sharpened/ai-core dependency
          // const template = await fitnessAgent.generateWorkoutTemplate(...);
          
          // Mock template generation for now
          const template = {
            title: `${phase.name} - Week ${week}, Day ${day}`,
            description: `${phase.focus} workout for ${experienceLevel} level`,
            estimatedDuration: getDurationForPhase(phase.intensity, experienceLevel),
            exercises: generateWorkoutExercises(phase.exercises, day, week),
            warmUp: ['5-10 minutes light cardio', 'Dynamic stretching', 'Joint mobility'],
            coolDown: ['Static stretching', '5-10 minutes walking', 'Deep breathing'],
            notes: [`Focus on ${phase.focus}`, `Intensity: ${phase.intensity}`],
            difficulty: phase.intensity
          };

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

    // TODO: Re-implement plan insights generation without @sharpened/ai-core dependency
    // const insights = await fitnessAgent.generatePlanInsights(...);
    
    // Mock insights for now
    const insights = [
      {
        type: 'plan_structure',
        text: `This ${goal} plan is well-suited for your ${experienceLevel} experience level`,
        confidence: 0.88,
        dataPoints: `${daysPerWeek} days per week for ${durationWeeks} weeks`,
        recommendations: ['Maintain consistency', 'Track your progress', 'Adjust intensity as needed']
      },
      {
        type: 'progression',
        text: 'The plan includes progressive overload to ensure continued improvement',
        confidence: 0.82,
        dataPoints: 'Two-phase structure with increasing intensity',
        recommendations: ['Start conservatively', 'Increase weights gradually', 'Listen to your body']
      }
    ];

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

// Helper functions for mock workout plan generation
function getPhaseExercises(goal: string, experienceLevel: string, equipment: string, advanced = false): string[] {
  const baseExercises: Record<string, string[]> = {
    strength: ['Squats', 'Deadlifts', 'Bench Press', 'Rows', 'Overhead Press'],
    endurance: ['Running', 'Cycling', 'Swimming', 'Rowing', 'Circuit Training'],
    flexibility: ['Yoga', 'Stretching', 'Pilates', 'Foam Rolling', 'Mobility Work'],
    hybrid: ['Squats', 'Deadlifts', 'Running', 'Yoga', 'Circuit Training']
  };
  
  const exercises = baseExercises[goal] || baseExercises.hybrid;
  
  if (advanced) {
    return exercises.map(ex => `Advanced ${ex}`);
  }
  
  return exercises;
}

function getPrimaryMovements(goal: string): string[] {
  const movements: Record<string, string[]> = {
    strength: ['Squat', 'Hinge', 'Push', 'Pull'],
    endurance: ['Aerobic Base', 'Threshold', 'VO2 Max', 'Recovery'],
    flexibility: ['Hip Mobility', 'Shoulder Mobility', 'Spine Mobility', 'Full Body Flow'],
    hybrid: ['Compound Movements', 'Cardio Intervals', 'Flexibility', 'Functional Training']
  };
  
  return movements[goal] || movements.hybrid;
}

function getExpectedOutcomes(goal: string, durationWeeks: string): string[] {
  const duration = parseInt(durationWeeks);
  const outcomes: Record<string, string[]> = {
    strength: [`Increased strength by 15-25%`, `Improved muscle mass`, `Better movement patterns`],
    endurance: [`Improved cardiovascular fitness`, `Increased endurance capacity`, `Better recovery`],
    flexibility: [`Increased range of motion`, `Reduced muscle tension`, `Better posture`],
    hybrid: [`Overall fitness improvement`, `Balanced strength and cardio`, `Enhanced mobility`]
  };
  
  const baseOutcomes = outcomes[goal] || outcomes.hybrid;
  
  if (duration >= 12) {
    return [...baseOutcomes, 'Significant body composition changes'];
  } else if (duration >= 8) {
    return [...baseOutcomes, 'Noticeable fitness improvements'];
  }
  
  return baseOutcomes;
}

function getDurationForPhase(intensity: string, experienceLevel: string): number {
  const baseDuration = experienceLevel === 'beginner' ? 35 : 45;
  const intensityModifier = intensity === 'high' ? 1.2 : intensity === 'low' ? 0.8 : 1;
  
  return Math.round(baseDuration * intensityModifier);
}

function generateWorkoutExercises(phaseExercises: string[], day: number, week: number): any[] {
  // Simple exercise generation based on day
  const exercisePool = phaseExercises;
  const exercisesPerDay = Math.min(5, exercisePool.length);
  
  return exercisePool.slice(0, exercisesPerDay).map((exercise, index) => ({
    name: exercise,
    sets: 3 + (week > 4 ? 1 : 0), // Progressive sets
    reps: getRepRange(exercise, week),
    rest: '60-90 seconds',
    notes: `Week ${week} progression`
  }));
}

function getRepRange(exercise: string, week: number): string {
  // Simple rep range logic
  if (exercise.toLowerCase().includes('cardio') || exercise.toLowerCase().includes('running')) {
    return `${Math.min(20 + week * 2, 30)} minutes`;
  }
  
  const baseReps = 8;
  const maxReps = Math.min(baseReps + week, 12);
  
  return `${baseReps}-${maxReps}`;
}