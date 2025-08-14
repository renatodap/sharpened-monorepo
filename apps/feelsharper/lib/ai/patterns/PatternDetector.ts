import { createClient } from '@/lib/supabase/server';
import { AIContext } from '@/lib/ai/types';

export class PatternDetector {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  async process(
    userId: string,
    context: AIContext,
    config: any
  ): Promise<{ data: any; confidence: number; tokens_used: number }> {
    try {
      const patterns = await this.detectAllPatterns(userId, context);
      
      // Store detected patterns
      await this.storePatterns(userId, patterns);
      
      // Generate insights from patterns
      const insights = await this.generateInsights(userId, patterns);
      
      return {
        data: {
          patterns,
          insights
        },
        confidence: 0.8,
        tokens_used: 0 // Local processing, no API calls
      };
      
    } catch (error) {
      console.error('Pattern detection error:', error);
      throw new Error('Failed to detect patterns');
    }
  }

  private async detectAllPatterns(userId: string, context: AIContext) {
    const [
      workoutPatterns,
      nutritionPatterns,
      schedulePatterns,
      progressPatterns
    ] = await Promise.all([
      this.detectWorkoutPatterns(context.recentWorkouts),
      this.detectNutritionPatterns(context.recentNutrition),
      this.detectSchedulePatterns(context.recentWorkouts),
      this.detectProgressPatterns(context.bodyMetrics)
    ]);

    return {
      workout: workoutPatterns,
      nutrition: nutritionPatterns,
      schedule: schedulePatterns,
      progress: progressPatterns
    };
  }

  private detectWorkoutPatterns(workouts: any[]) {
    const patterns: any = {
      frequency: {},
      volume_trends: {},
      exercise_pairs: {},
      intensity_patterns: {},
      recovery_time: {}
    };

    // Exercise frequency
    const exerciseCounts: Record<string, number> = {};
    const exerciseDays: Record<string, Set<string>> = {};
    
    workouts.forEach(workout => {
      const date = new Date(workout.date).toISOString().split('T')[0];
      
      workout.exercises?.forEach((ex: any) => {
        exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1;
        
        if (!exerciseDays[ex.name]) {
          exerciseDays[ex.name] = new Set();
        }
        exerciseDays[ex.name].add(date);
      });
    });

    // Find frequently paired exercises
    workouts.forEach(workout => {
      const exercises = workout.exercises?.map((e: any) => e.name) || [];
      
      for (let i = 0; i < exercises.length; i++) {
        for (let j = i + 1; j < exercises.length; j++) {
          const pair = [exercises[i], exercises[j]].sort().join(' + ');
          patterns.exercise_pairs[pair] = (patterns.exercise_pairs[pair] || 0) + 1;
        }
      }
    });

    // Volume progression
    const exerciseVolumes: Record<string, number[]> = {};
    
    workouts.forEach(workout => {
      workout.exercises?.forEach((ex: any) => {
        if (ex.sets && ex.reps && ex.weight_kg) {
          const volume = ex.sets * ex.reps * ex.weight_kg;
          if (!exerciseVolumes[ex.name]) {
            exerciseVolumes[ex.name] = [];
          }
          exerciseVolumes[ex.name].push(volume);
        }
      });
    });

    // Calculate trends
    Object.entries(exerciseVolumes).forEach(([exercise, volumes]) => {
      if (volumes.length >= 3) {
        const trend = this.calculateTrend(volumes);
        patterns.volume_trends[exercise] = trend;
      }
    });

    // Most frequent exercises
    patterns.top_exercises = Object.entries(exerciseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return patterns;
  }

  private detectNutritionPatterns(nutrition: any[]) {
    const patterns: any = {
      meal_timing: {},
      common_foods: {},
      calorie_patterns: {},
      macro_distribution: {},
      consistency: {}
    };

    // Meal timing patterns
    const mealTimes: Record<string, number> = {};
    nutrition.forEach(log => {
      const type = log.meal_type || 'unknown';
      mealTimes[type] = (mealTimes[type] || 0) + 1;
    });
    patterns.meal_timing = mealTimes;

    // Common foods
    const foodFrequency: Record<string, number> = {};
    nutrition.forEach(log => {
      log.foods?.forEach((food: any) => {
        foodFrequency[food.name] = (foodFrequency[food.name] || 0) + 1;
      });
    });
    
    patterns.common_foods = Object.entries(foodFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));

    // Calorie patterns
    const dailyCalories = nutrition.map(log => log.total_calories || 0);
    patterns.calorie_patterns = {
      average: Math.round(dailyCalories.reduce((a, b) => a + b, 0) / dailyCalories.length),
      min: Math.min(...dailyCalories),
      max: Math.max(...dailyCalories),
      std_dev: this.calculateStdDev(dailyCalories)
    };

    // Macro distribution
    const avgProtein = nutrition.reduce((sum, log) => sum + (log.total_protein || 0), 0) / nutrition.length;
    const avgCarbs = nutrition.reduce((sum, log) => sum + (log.total_carbs || 0), 0) / nutrition.length;
    const avgFat = nutrition.reduce((sum, log) => sum + (log.total_fat || 0), 0) / nutrition.length;
    
    const totalMacros = avgProtein * 4 + avgCarbs * 4 + avgFat * 9;
    patterns.macro_distribution = {
      protein_percent: Math.round((avgProtein * 4 / totalMacros) * 100),
      carbs_percent: Math.round((avgCarbs * 4 / totalMacros) * 100),
      fat_percent: Math.round((avgFat * 9 / totalMacros) * 100)
    };

    return patterns;
  }

  private detectSchedulePatterns(workouts: any[]) {
    const patterns: any = {
      days_of_week: {},
      time_of_day: {},
      workout_gaps: [],
      consistency_score: 0
    };

    // Day of week patterns
    const dayFrequency: Record<string, number> = {};
    const gaps: number[] = [];
    
    workouts.forEach((workout, index) => {
      const date = new Date(workout.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      dayFrequency[dayName] = (dayFrequency[dayName] || 0) + 1;
      
      // Calculate gaps between workouts
      if (index > 0) {
        const prevDate = new Date(workouts[index - 1].date);
        const gapDays = Math.floor((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        gaps.push(gapDays);
      }
    });
    
    patterns.days_of_week = dayFrequency;
    patterns.workout_gaps = {
      average: gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 0,
      min: gaps.length ? Math.min(...gaps) : 0,
      max: gaps.length ? Math.max(...gaps) : 0
    };
    
    // Consistency score (0-100)
    const expectedWorkouts = 3; // per week
    const actualPerWeek = workouts.length / 4; // assuming 4 weeks
    patterns.consistency_score = Math.min(100, Math.round((actualPerWeek / expectedWorkouts) * 100));

    return patterns;
  }

  private detectProgressPatterns(metrics: any[]) {
    if (metrics.length < 2) {
      return { trend: 'insufficient_data' };
    }

    const weights = metrics
      .filter(m => m.weight_kg)
      .map(m => m.weight_kg);
    
    if (weights.length < 2) {
      return { trend: 'insufficient_data' };
    }

    const trend = this.calculateTrend(weights);
    const changePerWeek = this.calculateWeeklyChange(metrics);
    
    return {
      weight_trend: trend,
      change_per_week: changePerWeek,
      current_weight: weights[0],
      starting_weight: weights[weights.length - 1],
      total_change: Math.round((weights[0] - weights[weights.length - 1]) * 10) / 10
    };
  }

  private calculateTrend(values: number[]): string {
    if (values.length < 2) return 'stable';
    
    // Simple linear regression
    const n = values.length;
    const indices = Array.from({ length: n }, (_, i) => i);
    
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
    const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Determine trend based on slope
    if (slope > 0.1) return 'increasing';
    if (slope < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(Math.sqrt(variance));
  }

  private calculateWeeklyChange(metrics: any[]): number {
    const sorted = metrics.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (sorted.length < 2) return 0;
    
    const latest = sorted[0];
    const earliest = sorted[sorted.length - 1];
    
    const daysDiff = Math.floor(
      (new Date(latest.date).getTime() - new Date(earliest.date).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff === 0) return 0;
    
    const totalChange = (latest.weight_kg || 0) - (earliest.weight_kg || 0);
    const weeklyChange = (totalChange / daysDiff) * 7;
    
    return Math.round(weeklyChange * 10) / 10;
  }

  private async storePatterns(userId: string, patterns: any) {
    // Store frequently used exercise patterns
    if (patterns.workout?.top_exercises) {
      for (const exercise of patterns.workout.top_exercises.slice(0, 5)) {
        await this.supabase.rpc('increment_pattern_frequency', {
          p_user_id: userId,
          p_pattern_type: 'workout_style',
          p_pattern_key: exercise.name,
          p_pattern_value: { frequency: exercise.count }
        });
      }
    }

    // Store common food patterns
    if (patterns.nutrition?.common_foods) {
      for (const food of patterns.nutrition.common_foods.slice(0, 10)) {
        await this.supabase.rpc('increment_pattern_frequency', {
          p_user_id: userId,
          p_pattern_type: 'food_preference',
          p_pattern_key: food.name,
          p_pattern_value: { frequency: food.count }
        });
      }
    }

    // Store schedule patterns
    if (patterns.schedule?.days_of_week) {
      const preferredDay = Object.entries(patterns.schedule.days_of_week)
        .sort((a: any, b: any) => b[1] - a[1])[0];
      
      if (preferredDay) {
        await this.supabase.rpc('increment_pattern_frequency', {
          p_user_id: userId,
          p_pattern_type: 'schedule',
          p_pattern_key: 'preferred_day',
          p_pattern_value: { day: preferredDay[0], count: preferredDay[1] }
        });
      }
    }
  }

  private async generateInsights(userId: string, patterns: any) {
    const insights = [];

    // Workout insights
    if (patterns.workout?.consistency_score < 70) {
      insights.push({
        type: 'recommendation',
        title: 'Improve Workout Consistency',
        content: `Your workout consistency is at ${patterns.workout.consistency_score}%. Try to maintain 3-4 workouts per week for optimal progress.`,
        priority: 7
      });
    }

    // Nutrition insights
    if (patterns.nutrition?.calorie_patterns?.std_dev > 500) {
      insights.push({
        type: 'pattern_detected',
        title: 'High Calorie Variability',
        content: 'Your daily calories vary significantly. Consider more consistent intake for better results.',
        priority: 6
      });
    }

    // Progress insights
    if (patterns.progress?.weight_trend === 'decreasing' && patterns.progress.change_per_week < -1) {
      insights.push({
        type: 'warning',
        title: 'Rapid Weight Loss Detected',
        content: `You're losing ${Math.abs(patterns.progress.change_per_week)}kg per week. Consider slowing down to 0.5-1kg/week for sustainability.`,
        priority: 8
      });
    }

    // Store insights in database
    for (const insight of insights) {
      await this.supabase.from('ai_insights').insert({
        user_id: userId,
        insight_type: insight.type,
        title: insight.title,
        content: insight.content,
        priority: insight.priority,
        is_actionable: true
      });
    }

    return insights;
  }
}