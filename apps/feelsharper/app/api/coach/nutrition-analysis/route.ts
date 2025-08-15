import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
// TODO: Re-implement nutrition analysis without @sharpened/ai-core dependency
// import { NutritionCoachAgent } from '@sharpened/ai-core';

export const runtime = 'edge';

// POST /api/coach/nutrition-analysis
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { analysisType, dateRange, includeRecommendations } = body;

    // Default to last 7 days if no date range provided
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (dateRange?.days || 7));

    // Get comprehensive nutrition data
    const [profileData, nutritionLogs, bodyWeightData, workoutData, userGoals] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('nutrition_logs')
        .select(`
          *,
          foods (
            id,
            description,
            brand_name,
            calories_per_100g,
            protein_g,
            carbs_g,
            fat_g,
            fiber_g,
            verified
          )
        `)
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false }),
      supabase.from('body_weight')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false }),
      supabase.from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false }),
      supabase.from('nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
    ]);

    // TODO: Re-implement AI nutrition analysis without @sharpened/ai-core dependency
    // const nutritionAgent = new NutritionCoachAgent();

    // Prepare comprehensive context
    const nutritionContext = {
      profile: profileData.data,
      logs: nutritionLogs.data || [],
      bodyWeight: bodyWeightData.data || [],
      workouts: workoutData.data || [],
      goals: userGoals.data || [],
      analysisType: analysisType || 'comprehensive',
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days: dateRange?.days || 7
      }
    };

    // Mock analysis for now until AI agents are re-implemented
    // const analysis = await nutritionAgent.analyzeNutrition(nutritionContext);
    const analysis = {
      overallScore: 78,
      immediateActions: ['Increase water intake', 'Add more vegetables to meals'],
      shortTermGoals: ['Achieve consistent meal timing', 'Optimize post-workout nutrition'],
      longTermStrategies: ['Build sustainable eating habits', 'Maintain macro balance'],
      micronutrientRecommendations: ['Consider vitamin D supplement', 'Increase iron-rich foods'],
      hydrationAdvice: ['Aim for 8-10 glasses of water daily'],
      mealTimingAdvice: ['Eat within 2 hours of waking', 'Have protein within 30 minutes post-workout']
    };

    // Calculate key metrics
    const dailyAverages = calculateDailyAverages(nutritionLogs.data || []);
    const macroDistribution = calculateMacroDistribution(nutritionLogs.data || []);
    const nutrientTrends = calculateNutrientTrends(nutritionLogs.data || []);
    const mealPatterns = analyzeMealPatterns(nutritionLogs.data || []);

    // TODO: Re-implement nutrition insights generation without @sharpened/ai-core dependency
    // const insights = await nutritionAgent.generateNutritionInsights(...);
    
    // Mock insights for now
    const insights = [
      {
        type: 'macro_balance',
        title: 'Protein Distribution',
        description: 'Your protein intake is well-distributed throughout the day.',
        severity: 'positive',
        recommendations: ['Continue current protein timing', 'Maintain protein quality'],
        confidence: 0.85,
        dataPoints: dailyAverages.protein
      },
      {
        type: 'calorie_consistency',
        title: 'Calorie Intake Variation',
        description: 'Your daily calorie intake shows good consistency.',
        severity: 'neutral',
        recommendations: ['Maintain current eating pattern', 'Monitor weekend intake'],
        confidence: 0.78,
        dataPoints: nutrientTrends.consistency
      }
    ];

    // Generate meal plan recommendations if requested
    let mealPlan = null;
    if (includeRecommendations) {
      // TODO: Re-implement meal plan generation without @sharpened/ai-core dependency
      // mealPlan = await nutritionAgent.generateMealPlan(...);
      
      // Mock meal plan for now
      mealPlan = {
        title: `7-Day Nutrition Plan - ${analysisType || 'Comprehensive'}`,
        description: 'A balanced meal plan tailored to your goals and preferences',
        weeklyPlan: [
          {
            day: 1,
            meals: {
              breakfast: { name: 'Protein Oatmeal', calories: 350, protein: 20, carbs: 45, fat: 8 },
              lunch: { name: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 25, fat: 18 },
              dinner: { name: 'Salmon with Sweet Potato', calories: 520, protein: 40, carbs: 35, fat: 22 },
              snacks: [{ name: 'Greek Yogurt with Berries', calories: 180, protein: 15, carbs: 20, fat: 5 }]
            }
          }
        ],
        tips: ['Prep meals in advance', 'Stay hydrated throughout the day', 'Listen to your hunger cues'],
        substitutions: {
          'Grilled Chicken': ['Turkey breast', 'Tofu', 'Lean beef'],
          'Sweet Potato': ['Brown rice', 'Quinoa', 'Regular potato']
        }
      };
    }

    // Calculate nutrition score
    const nutritionScore = calculateNutritionScore(analysis, userGoals.data || []);

    // Prepare comprehensive response
    const response = {
      analysis: {
        period: nutritionContext.dateRange,
        totalDays: dateRange?.days || 7,
        logsAnalyzed: nutritionLogs.data?.length || 0,
        overallScore: nutritionScore.overall,
        scoreBreakdown: nutritionScore.breakdown
      },
      metrics: {
        dailyAverages: {
          calories: dailyAverages.calories,
          protein: dailyAverages.protein,
          carbs: dailyAverages.carbs,
          fat: dailyAverages.fat,
          fiber: dailyAverages.fiber,
          water: (dailyAverages as any).water || 0
        },
        macroDistribution: {
          proteinPercent: macroDistribution.proteinPercent,
          carbsPercent: macroDistribution.carbsPercent,
          fatPercent: macroDistribution.fatPercent,
          isBalanced: macroDistribution.isBalanced
        },
        nutrientTrends: {
          caloriesTrend: nutrientTrends.calories,
          proteinTrend: nutrientTrends.protein,
          consistency: nutrientTrends.consistency
        },
        mealPatterns: {
          avgMealsPerDay: mealPatterns.avgMealsPerDay,
          mealTiming: mealPatterns.timing,
          skippedMeals: mealPatterns.skipped,
          lateNightEating: mealPatterns.lateNight
        }
      },
      insights: insights.map(insight => ({
        type: insight.type,
        title: insight.title,
        description: insight.description,
        severity: insight.severity,
        recommendations: insight.recommendations,
        confidence: insight.confidence,
        dataPoints: insight.dataPoints
      })),
      recommendations: {
        immediate: analysis.immediateActions || [],
        shortTerm: analysis.shortTermGoals || [],
        longTerm: analysis.longTermStrategies || [],
        micronutrients: analysis.micronutrientRecommendations || [],
        hydration: analysis.hydrationAdvice || [],
        timing: analysis.mealTimingAdvice || []
      },
      mealPlan,
      progressIndicators: {
        goalsAlignment: calculateGoalsAlignment(analysis, userGoals.data || []),
        improvementAreas: identifyImprovementAreas(analysis),
        strengths: identifyNutritionStrengths(analysis),
        nextMilestones: generateNextMilestones(analysis, userGoals.data || [])
      }
    };

    // Save analysis results and insights to database
    await saveAnalysisResults(supabase, user.id, response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Nutrition analysis error:', error);
    return NextResponse.json({ 
      error: 'Failed to analyze nutrition data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/coach/nutrition-analysis - Get saved analysis results
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');

    // Get recent analysis results
    const { data: analyses, error } = await supabase
      .from('nutrition_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 });
    }

    return NextResponse.json({ analyses });

  } catch (error) {
    console.error('Nutrition analysis GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition analysis' }, { status: 500 });
  }
}

// Helper functions
function calculateDailyAverages(nutritionLogs: any[]) {
  if (nutritionLogs.length === 0) return {};

  const dailyTotals = nutritionLogs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) {
      acc[date] = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    }
    
    acc[date].calories += log.calories || 0;
    acc[date].protein += log.protein_g || 0;
    acc[date].carbs += log.carbs_g || 0;
    acc[date].fat += log.fat_g || 0;
    acc[date].fiber += log.fiber_g || 0;
    
    return acc;
  }, {});

  const days = Object.keys(dailyTotals);
  const avgCalories = days.reduce((sum, day) => sum + dailyTotals[day].calories, 0) / days.length;
  const avgProtein = days.reduce((sum, day) => sum + dailyTotals[day].protein, 0) / days.length;
  const avgCarbs = days.reduce((sum, day) => sum + dailyTotals[day].carbs, 0) / days.length;
  const avgFat = days.reduce((sum, day) => sum + dailyTotals[day].fat, 0) / days.length;
  const avgFiber = days.reduce((sum, day) => sum + dailyTotals[day].fiber, 0) / days.length;

  return {
    calories: Math.round(avgCalories),
    protein: Math.round(avgProtein * 10) / 10,
    carbs: Math.round(avgCarbs * 10) / 10,
    fat: Math.round(avgFat * 10) / 10,
    fiber: Math.round(avgFiber * 10) / 10
  };
}

function calculateMacroDistribution(nutritionLogs: any[]) {
  const totals = nutritionLogs.reduce((acc, log) => {
    acc.protein += (log.protein_g || 0) * 4; // 4 calories per gram
    acc.carbs += (log.carbs_g || 0) * 4; // 4 calories per gram
    acc.fat += (log.fat_g || 0) * 9; // 9 calories per gram
    return acc;
  }, { protein: 0, carbs: 0, fat: 0 });

  const totalCalories = totals.protein + totals.carbs + totals.fat;
  
  if (totalCalories === 0) return { proteinPercent: 0, carbsPercent: 0, fatPercent: 0, isBalanced: false };

  const proteinPercent = Math.round((totals.protein / totalCalories) * 100);
  const carbsPercent = Math.round((totals.carbs / totalCalories) * 100);
  const fatPercent = Math.round((totals.fat / totalCalories) * 100);

  // Check if distribution is balanced (rough guidelines)
  const isBalanced = proteinPercent >= 15 && proteinPercent <= 35 &&
                    carbsPercent >= 30 && carbsPercent <= 65 &&
                    fatPercent >= 20 && fatPercent <= 35;

  return { proteinPercent, carbsPercent, fatPercent, isBalanced };
}

function calculateNutrientTrends(nutritionLogs: any[]) {
  // Simple trend calculation
  const dailyCalories = nutritionLogs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) acc[date] = 0;
    acc[date] += log.calories || 0;
    return acc;
  }, {});

  const dates = Object.keys(dailyCalories).sort();
  const values = dates.map(date => dailyCalories[date]);
  
  const trend = values.length > 1 
    ? values[values.length - 1] > values[0] ? 'increasing' : 'decreasing'
    : 'stable';

  return {
    calories: trend,
    protein: trend, // Simplified
    consistency: calculateConsistency(values)
  };
}

function calculateConsistency(values: number[]) {
  if (values.length < 2) return 100;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = standardDeviation / mean;
  
  // Convert to consistency score (lower CV = higher consistency)
  return Math.max(0, Math.min(100, 100 - (coefficientOfVariation * 100)));
}

function analyzeMealPatterns(nutritionLogs: any[]) {
  const mealsByDate = nutritionLogs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const dates = Object.keys(mealsByDate);
  const avgMealsPerDay = dates.length > 0 
    ? dates.reduce((sum, date) => sum + mealsByDate[date].length, 0) / dates.length 
    : 0;

  return {
    avgMealsPerDay: Math.round(avgMealsPerDay * 10) / 10,
    timing: 'regular', // Simplified
    skipped: 0, // Simplified
    lateNight: false // Simplified
  };
}

function calculateNutritionScore(analysis: any, goals: any[]) {
  // Simplified nutrition scoring
  let overall = 85; // Base score
  
  const breakdown = {
    calories: 90,
    macros: 85,
    micronutrients: 80,
    timing: 85,
    variety: 88,
    consistency: 92
  };

  return { overall, breakdown };
}

function calculateGoalsAlignment(analysis: any, goals: any[]) {
  // Simplified goals alignment calculation
  return goals.map(goal => ({
    goalType: goal.goal_type,
    currentProgress: 75,
    alignment: 'good',
    recommendations: ['Continue current approach', 'Minor adjustments needed']
  }));
}

function identifyImprovementAreas(analysis: any) {
  return [
    { area: 'Meal Timing', priority: 'medium', impact: 'moderate' },
    { area: 'Vegetable Intake', priority: 'high', impact: 'high' },
    { area: 'Hydration', priority: 'medium', impact: 'moderate' }
  ];
}

function identifyNutritionStrengths(analysis: any) {
  return [
    'Consistent protein intake',
    'Good meal consistency',
    'Appropriate caloric intake for goals'
  ];
}

function generateNextMilestones(analysis: any, goals: any[]) {
  return [
    { milestone: 'Increase daily vegetable servings to 5', target: '2 weeks' },
    { milestone: 'Achieve 90% nutrition goal adherence', target: '4 weeks' },
    { milestone: 'Optimize post-workout nutrition timing', target: '1 week' }
  ];
}

async function saveAnalysisResults(supabase: any, userId: string, analysis: any) {
  try {
    // Save main analysis
    await supabase
      .from('nutrition_analyses')
      .insert({
        user_id: userId,
        analysis_type: 'comprehensive',
        period_days: analysis.analysis.totalDays,
        overall_score: analysis.analysis.overallScore,
        metrics: analysis.metrics,
        insights_count: analysis.insights.length,
        recommendations_count: analysis.recommendations.immediate.length + 
                                analysis.recommendations.shortTerm.length + 
                                analysis.recommendations.longTerm.length
      });

    // Save individual insights
    const insightRecords = analysis.insights.map((insight: any) => ({
      user_id: userId,
      insight_type: insight.type,
      insight_text: `${insight.title}: ${insight.description}`,
      confidence_score: insight.confidence,
      data_points_used: insight.dataPoints,
      recommendations: insight.recommendations,
      category: 'nutrition_analysis'
    }));

    if (insightRecords.length > 0) {
      await supabase
        .from('user_insights')
        .insert(insightRecords);
    }
  } catch (error) {
    console.error('Error saving analysis results:', error);
  }
}