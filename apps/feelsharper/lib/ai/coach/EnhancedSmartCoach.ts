/**
 * EnhancedSmartCoach - Context-aware AI coaching with pattern recognition
 * Maps to PRD: AI Coaching System (Technical Requirement #5)
 */

import { createClient } from '@supabase/supabase-js';

export interface UserContext {
  userId: string;
  profile: {
    age?: number;
    height_cm?: number;
    weight_kg?: number;
    activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
    goals?: string[];
    experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  };
  recentWorkouts: WorkoutSummary[];
  recentNutrition: NutritionSummary[];
  recentWeight: WeightEntry[];
  patterns: DetectedPattern[];
  currentStreaks: StreakInfo[];
}

export interface WorkoutSummary {
  date: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'sport';
  duration_minutes: number;
  exercises_count: number;
  volume?: number; // total weight * reps for strength
  intensity?: number; // average RPE
  muscle_groups?: string[];
}

export interface NutritionSummary {
  date: string;
  total_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  meal_count: number;
  water_ml?: number;
}

export interface WeightEntry {
  date: string;
  weight_kg: number;
  body_fat_percentage?: number;
}

export interface DetectedPattern {
  type: 'positive' | 'negative' | 'neutral';
  category: 'workout' | 'nutrition' | 'recovery' | 'consistency';
  pattern: string;
  confidence: number;
  timeframe: string;
  impact: string;
}

export interface StreakInfo {
  type: 'workout' | 'logging' | 'goal';
  current_days: number;
  best_days: number;
  last_break?: string;
}

export interface CoachingResponse {
  message: string;
  insights: string[];
  recommendations: ActionItem[];
  patterns_identified: DetectedPattern[];
  motivational_quote?: string;
  progress_summary?: ProgressSummary;
  plateau_strategies?: string[];
  recovery_suggestions?: string[];
}

export interface ActionItem {
  priority: 'high' | 'medium' | 'low';
  category: 'workout' | 'nutrition' | 'recovery' | 'habit';
  action: string;
  rationale: string;
  timeline: string;
  expected_impact: string;
}

export interface ProgressSummary {
  workout_consistency: number; // percentage
  nutrition_adherence: number; // percentage
  weight_trend: 'gaining' | 'losing' | 'maintaining' | 'fluctuating';
  strength_progress: 'improving' | 'plateau' | 'declining';
  overall_score: number; // 0-100
}

export class EnhancedSmartCoach {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  /**
   * Get complete user context for coaching
   */
  async getUserContext(userId: string): Promise<UserContext> {
    // Fetch user profile
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch recent workouts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: workouts } = await this.supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    // Fetch recent nutrition (last 30 days)
    const { data: foods } = await this.supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Fetch recent weight entries
    const { data: weights } = await this.supabase
      .from('body_weight')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(30);

    // Process data into summaries
    const workoutSummaries = this.processWorkouts(workouts || []);
    const nutritionSummaries = this.processNutrition(foods || []);
    const weightEntries = this.processWeights(weights || []);
    
    // Detect patterns
    const patterns = await this.detectPatterns({
      workouts: workoutSummaries,
      nutrition: nutritionSummaries,
      weights: weightEntries
    });

    // Calculate streaks
    const streaks = this.calculateStreaks(workouts || [], foods || []);

    return {
      userId,
      profile: profile || {},
      recentWorkouts: workoutSummaries,
      recentNutrition: nutritionSummaries,
      recentWeight: weightEntries,
      patterns,
      currentStreaks: streaks
    };
  }

  /**
   * Generate personalized coaching advice
   */
  async generateCoaching(
    context: UserContext,
    specificQuery?: string
  ): Promise<CoachingResponse> {
    const insights = this.generateInsights(context);
    const recommendations = this.generateRecommendations(context);
    const plateauStrategies = this.detectPlateau(context) ? this.generatePlateauStrategies(context) : undefined;
    const recoveryNeeded = this.assessRecoveryNeeds(context);
    const progressSummary = this.calculateProgress(context);

    // Build main coaching message
    const message = this.buildCoachingMessage(context, specificQuery, insights);

    return {
      message,
      insights,
      recommendations,
      patterns_identified: context.patterns,
      motivational_quote: this.getMotivationalQuote(context),
      progress_summary: progressSummary,
      plateau_strategies: plateauStrategies,
      recovery_suggestions: recoveryNeeded ? this.generateRecoverySuggestions(context) : undefined
    };
  }

  /**
   * Process workout data into summaries
   */
  private processWorkouts(workouts: any[]): WorkoutSummary[] {
    return workouts.map(w => {
      const exercises = w.exercises || [];
      let totalVolume = 0;
      let totalRPE = 0;
      let rpeCount = 0;
      const muscleGroups = new Set<string>();

      exercises.forEach((ex: any) => {
        // Calculate volume for strength exercises
        if (ex.sets) {
          ex.sets.forEach((set: any) => {
            if (set.weight_kg && set.reps) {
              totalVolume += set.weight_kg * set.reps;
            }
            if (set.rpe) {
              totalRPE += set.rpe;
              rpeCount++;
            }
          });
        }
        
        // Track muscle groups
        if (ex.muscle_group) {
          muscleGroups.add(ex.muscle_group);
        }
      });

      return {
        date: w.created_at,
        type: w.workout_type || 'strength',
        duration_minutes: w.duration_minutes || 0,
        exercises_count: exercises.length,
        volume: totalVolume,
        intensity: rpeCount > 0 ? totalRPE / rpeCount : undefined,
        muscle_groups: Array.from(muscleGroups)
      };
    });
  }

  /**
   * Process nutrition data into summaries
   */
  private processNutrition(foods: any[]): NutritionSummary[] {
    const dailySummaries = new Map<string, NutritionSummary>();

    foods.forEach(food => {
      const date = food.created_at.split('T')[0];
      
      if (!dailySummaries.has(date)) {
        dailySummaries.set(date, {
          date,
          total_calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0,
          meal_count: 0,
          water_ml: 0
        });
      }

      const summary = dailySummaries.get(date)!;
      summary.total_calories += food.calories || 0;
      summary.protein_g += food.protein_g || 0;
      summary.carbs_g += food.carbs_g || 0;
      summary.fat_g += food.fat_g || 0;
      summary.meal_count++;
    });

    return Array.from(dailySummaries.values());
  }

  /**
   * Process weight entries
   */
  private processWeights(weights: any[]): WeightEntry[] {
    return weights.map(w => ({
      date: w.recorded_at,
      weight_kg: w.weight_kg,
      body_fat_percentage: w.body_fat_percentage
    }));
  }

  /**
   * Detect patterns in user data
   */
  private async detectPatterns(data: {
    workouts: WorkoutSummary[];
    nutrition: NutritionSummary[];
    weights: WeightEntry[];
  }): Promise<DetectedPattern[]> {
    const patterns: DetectedPattern[] = [];

    // Workout consistency pattern
    const workoutDays = new Set(data.workouts.map(w => w.date.split('T')[0]));
    const consistencyRate = workoutDays.size / 30;
    
    if (consistencyRate > 0.7) {
      patterns.push({
        type: 'positive',
        category: 'consistency',
        pattern: 'Excellent workout consistency',
        confidence: 0.9,
        timeframe: 'last 30 days',
        impact: 'Strong habit formation leading to better results'
      });
    } else if (consistencyRate < 0.3) {
      patterns.push({
        type: 'negative',
        category: 'consistency',
        pattern: 'Inconsistent workout schedule',
        confidence: 0.85,
        timeframe: 'last 30 days',
        impact: 'May slow progress toward goals'
      });
    }

    // Progressive overload pattern
    const recentVolumes = data.workouts
      .filter(w => w.volume && w.volume > 0)
      .slice(0, 10)
      .map(w => w.volume!);
    
    if (recentVolumes.length >= 5) {
      const trend = this.calculateTrend(recentVolumes);
      if (trend > 0.05) {
        patterns.push({
          type: 'positive',
          category: 'workout',
          pattern: 'Progressive overload detected',
          confidence: 0.8,
          timeframe: 'last 10 workouts',
          impact: 'Optimal for strength and muscle gains'
        });
      }
    }

    // Protein intake pattern
    const avgProtein = data.nutrition.reduce((sum, n) => sum + n.protein_g, 0) / (data.nutrition.length || 1);
    const targetProtein = 1.6; // g per kg body weight
    
    if (data.weights.length > 0) {
      const currentWeight = data.weights[0].weight_kg;
      const proteinRatio = avgProtein / (currentWeight * targetProtein);
      
      if (proteinRatio >= 0.9) {
        patterns.push({
          type: 'positive',
          category: 'nutrition',
          pattern: 'Adequate protein intake',
          confidence: 0.85,
          timeframe: 'last 30 days',
          impact: 'Supporting muscle recovery and growth'
        });
      } else if (proteinRatio < 0.6) {
        patterns.push({
          type: 'negative',
          category: 'nutrition',
          pattern: 'Low protein intake',
          confidence: 0.8,
          timeframe: 'last 30 days',
          impact: 'May limit muscle recovery and growth'
        });
      }
    }

    // Recovery pattern
    const restDays = 30 - workoutDays.size;
    if (restDays < 8) {
      patterns.push({
        type: 'negative',
        category: 'recovery',
        pattern: 'Insufficient rest days',
        confidence: 0.75,
        timeframe: 'last 30 days',
        impact: 'Risk of overtraining and burnout'
      });
    }

    return patterns;
  }

  /**
   * Calculate streaks
   */
  private calculateStreaks(workouts: any[], foods: any[]): StreakInfo[] {
    const streaks: StreakInfo[] = [];
    
    // Workout streak
    const workoutDates = workouts.map(w => w.created_at.split('T')[0]).sort();
    const workoutStreak = this.calculateConsecutiveDays(workoutDates);
    
    streaks.push({
      type: 'workout',
      current_days: workoutStreak.current,
      best_days: workoutStreak.best,
      last_break: workoutStreak.lastBreak
    });

    // Logging streak (any activity)
    const allDates = [
      ...workouts.map(w => w.created_at.split('T')[0]),
      ...foods.map(f => f.created_at.split('T')[0])
    ];
    const uniqueDates = Array.from(new Set(allDates)).sort();
    const loggingStreak = this.calculateConsecutiveDays(uniqueDates);
    
    streaks.push({
      type: 'logging',
      current_days: loggingStreak.current,
      best_days: loggingStreak.best,
      last_break: loggingStreak.lastBreak
    });

    return streaks;
  }

  /**
   * Calculate consecutive days
   */
  private calculateConsecutiveDays(dates: string[]): {
    current: number;
    best: number;
    lastBreak?: string;
  } {
    if (dates.length === 0) {
      return { current: 0, best: 0 };
    }

    let current = 1;
    let best = 1;
    let tempStreak = 1;
    let lastBreak: string | undefined;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        tempStreak++;
        current = tempStreak;
      } else if (dayDiff > 1) {
        lastBreak = dates[i - 1];
        best = Math.max(best, tempStreak);
        tempStreak = 1;
        current = 1;
      }
    }

    best = Math.max(best, tempStreak);
    return { current, best, lastBreak };
  }

  /**
   * Generate insights from context
   */
  private generateInsights(context: UserContext): string[] {
    const insights: string[] = [];

    // Workout frequency insight
    const workoutFreq = context.recentWorkouts.length / 30;
    if (workoutFreq > 0.7) {
      insights.push(`You're crushing it with ${context.recentWorkouts.length} workouts in the last 30 days!`);
    } else if (workoutFreq < 0.3) {
      insights.push(`You've completed ${context.recentWorkouts.length} workouts in 30 days. Let's aim for 3-4 per week.`);
    }

    // Volume progression insight
    const volumes = context.recentWorkouts
      .filter(w => w.volume)
      .map(w => w.volume!);
    if (volumes.length >= 3) {
      const trend = this.calculateTrend(volumes.slice(0, 5));
      if (trend > 0) {
        insights.push('Your training volume is increasing - perfect for progressive overload!');
      }
    }

    // Nutrition insight
    if (context.recentNutrition.length > 0) {
      const avgCalories = context.recentNutrition.reduce((sum, n) => sum + n.total_calories, 0) / context.recentNutrition.length;
      const avgProtein = context.recentNutrition.reduce((sum, n) => sum + n.protein_g, 0) / context.recentNutrition.length;
      insights.push(`Averaging ${Math.round(avgCalories)} calories and ${Math.round(avgProtein)}g protein daily.`);
    }

    // Streak insight
    const workoutStreak = context.currentStreaks.find(s => s.type === 'workout');
    if (workoutStreak && workoutStreak.current_days > 3) {
      insights.push(`${workoutStreak.current_days} day workout streak! Keep the momentum going!`);
    }

    // Pattern insights
    context.patterns
      .filter(p => p.type === 'positive')
      .forEach(p => {
        insights.push(`${p.pattern} - ${p.impact}`);
      });

    return insights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(context: UserContext): ActionItem[] {
    const recommendations: ActionItem[] = [];

    // Check for negative patterns
    context.patterns
      .filter(p => p.type === 'negative')
      .forEach(pattern => {
        if (pattern.category === 'consistency') {
          recommendations.push({
            priority: 'high',
            category: 'habit',
            action: 'Schedule 3-4 workouts for next week',
            rationale: 'Building consistency is key to long-term progress',
            timeline: 'This week',
            expected_impact: 'Improved habit formation and faster progress'
          });
        } else if (pattern.category === 'nutrition' && pattern.pattern.includes('protein')) {
          recommendations.push({
            priority: 'high',
            category: 'nutrition',
            action: 'Add a protein source to each meal',
            rationale: 'Protein supports muscle recovery and satiety',
            timeline: 'Starting today',
            expected_impact: 'Better recovery and muscle maintenance'
          });
        } else if (pattern.category === 'recovery') {
          recommendations.push({
            priority: 'high',
            category: 'recovery',
            action: 'Schedule 2 complete rest days this week',
            rationale: 'Recovery is when adaptation happens',
            timeline: 'This week',
            expected_impact: 'Reduced injury risk and better performance'
          });
        }
      });

    // Progressive overload recommendation
    if (context.recentWorkouts.length > 5) {
      const hasProgression = context.patterns.some(p => 
        p.pattern.includes('Progressive overload')
      );
      
      if (!hasProgression) {
        recommendations.push({
          priority: 'medium',
          category: 'workout',
          action: 'Increase weight by 2.5-5% on main lifts',
          rationale: 'Progressive overload drives strength gains',
          timeline: 'Next workout',
          expected_impact: 'Continued strength and muscle development'
        });
      }
    }

    // Variety recommendation
    const muscleGroups = new Set(
      context.recentWorkouts.flatMap(w => w.muscle_groups || [])
    );
    if (muscleGroups.size < 3 && context.recentWorkouts.length > 5) {
      recommendations.push({
        priority: 'medium',
        category: 'workout',
        action: 'Add exercises for neglected muscle groups',
        rationale: 'Balanced training prevents imbalances',
        timeline: 'Next 2 weeks',
        expected_impact: 'More balanced physique and reduced injury risk'
      });
    }

    return recommendations;
  }

  /**
   * Detect if user is in a plateau
   */
  private detectPlateau(context: UserContext): boolean {
    // Check weight plateau
    if (context.recentWeight.length >= 5) {
      const weights = context.recentWeight.slice(0, 5).map(w => w.weight_kg);
      const variance = this.calculateVariance(weights);
      if (variance < 0.5) return true; // Less than 0.5kg variance
    }

    // Check strength plateau
    const recentVolumes = context.recentWorkouts
      .filter(w => w.volume)
      .slice(0, 10)
      .map(w => w.volume!);
    
    if (recentVolumes.length >= 5) {
      const trend = this.calculateTrend(recentVolumes);
      if (Math.abs(trend) < 0.02) return true; // Less than 2% change
    }

    return false;
  }

  /**
   * Generate plateau-breaking strategies
   */
  private generatePlateauStrategies(context: UserContext): string[] {
    return [
      'Try a deload week with 50-60% of normal volume',
      'Switch to a different rep range (e.g., 3-5 reps for strength, 12-15 for endurance)',
      'Incorporate new exercise variations',
      'Adjust your caloric intake by 10-15%',
      'Focus on improving sleep quality and duration',
      'Consider a structured program change every 8-12 weeks'
    ];
  }

  /**
   * Assess recovery needs
   */
  private assessRecoveryNeeds(context: UserContext): boolean {
    // Check for high training frequency
    const workoutDays = context.recentWorkouts.length;
    if (workoutDays > 25) return true; // More than 25 workouts in 30 days

    // Check for high intensity
    const avgIntensity = context.recentWorkouts
      .filter(w => w.intensity)
      .reduce((sum, w) => sum + w.intensity!, 0) / (context.recentWorkouts.filter(w => w.intensity).length || 1);
    
    if (avgIntensity > 8) return true; // Average RPE > 8

    // Check for declining performance
    const recentVolumes = context.recentWorkouts
      .filter(w => w.volume)
      .slice(0, 5)
      .map(w => w.volume!);
    
    if (recentVolumes.length >= 3) {
      const trend = this.calculateTrend(recentVolumes);
      if (trend < -0.1) return true; // 10% decline
    }

    return false;
  }

  /**
   * Generate recovery suggestions
   */
  private generateRecoverySuggestions(context: UserContext): string[] {
    return [
      'Prioritize 7-9 hours of quality sleep',
      'Include 10-15 minutes of mobility work daily',
      'Stay hydrated with 3-4 liters of water per day',
      'Consider adding magnesium and zinc supplements',
      'Schedule a massage or foam rolling session',
      'Try contrast showers (hot/cold) for recovery',
      'Reduce training intensity by 20-30% this week'
    ];
  }

  /**
   * Calculate overall progress
   */
  private calculateProgress(context: UserContext): ProgressSummary {
    // Workout consistency
    const workoutConsistency = Math.round((context.recentWorkouts.length / 30) * 100);

    // Nutrition adherence (assuming goal is logging daily)
    const nutritionAdherence = Math.round((context.recentNutrition.length / 30) * 100);

    // Weight trend
    let weightTrend: 'gaining' | 'losing' | 'maintaining' | 'fluctuating' = 'maintaining';
    if (context.recentWeight.length >= 3) {
      const weights = context.recentWeight.map(w => w.weight_kg);
      const trend = this.calculateTrend(weights);
      if (trend > 0.02) weightTrend = 'gaining';
      else if (trend < -0.02) weightTrend = 'losing';
      else if (this.calculateVariance(weights) > 1) weightTrend = 'fluctuating';
    }

    // Strength progress
    let strengthProgress: 'improving' | 'plateau' | 'declining' = 'plateau';
    const volumes = context.recentWorkouts
      .filter(w => w.volume)
      .map(w => w.volume!);
    if (volumes.length >= 3) {
      const trend = this.calculateTrend(volumes);
      if (trend > 0.05) strengthProgress = 'improving';
      else if (trend < -0.05) strengthProgress = 'declining';
    }

    // Overall score
    const overallScore = Math.round(
      (workoutConsistency * 0.4) +
      (nutritionAdherence * 0.3) +
      (strengthProgress === 'improving' ? 30 : strengthProgress === 'plateau' ? 15 : 0)
    );

    return {
      workout_consistency: workoutConsistency,
      nutrition_adherence: nutritionAdherence,
      weight_trend: weightTrend,
      strength_progress: strengthProgress,
      overall_score: overallScore
    };
  }

  /**
   * Build main coaching message
   */
  private buildCoachingMessage(
    context: UserContext,
    query: string | undefined,
    insights: string[]
  ): string {
    let message = '';

    if (query) {
      // Answer specific query
      message = `Based on your recent data and patterns, here's my advice on "${query}": `;
      
      // Add context-specific response
      if (query.toLowerCase().includes('plateau')) {
        message += "I've detected you might be experiencing a plateau. ";
      } else if (query.toLowerCase().includes('recovery')) {
        message += "Recovery is crucial for your progress. ";
      } else if (query.toLowerCase().includes('diet') || query.toLowerCase().includes('nutrition')) {
        message += "Your nutrition plays a vital role in your fitness journey. ";
      }
    } else {
      // General coaching
      const greeting = this.getGreeting();
      const streak = context.currentStreaks.find(s => s.type === 'workout');
      
      message = `${greeting} `;
      
      if (streak && streak.current_days > 0) {
        message += `You're on a ${streak.current_days} day streak! `;
      }
      
      if (insights.length > 0) {
        message += insights[0] + ' ';
      }
    }

    // Add personalized touch based on patterns
    const positivePattern = context.patterns.find(p => p.type === 'positive');
    if (positivePattern) {
      message += `Keep up the great work with your ${positivePattern.category}. `;
    }

    const negativePattern = context.patterns.find(p => p.type === 'negative');
    if (negativePattern) {
      message += `Let's focus on improving your ${negativePattern.pattern.toLowerCase()}. `;
    }

    return message;
  }

  /**
   * Get time-appropriate greeting
   */
  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning, champion!";
    if (hour < 17) return "Good afternoon, athlete!";
    return "Good evening, warrior!";
  }

  /**
   * Get motivational quote based on context
   */
  private getMotivationalQuote(context: UserContext): string {
    const quotes = [
      "The only bad workout is the one that didn't happen.",
      "Progress is progress, no matter how small.",
      "Your body can stand almost anything. It's your mind you have to convince.",
      "Success starts with self-discipline.",
      "Every workout counts. Every meal matters. Every day is progress.",
      "Strength doesn't come from what you can do. It comes from overcoming what you once couldn't.",
      "The pain you feel today will be the strength you feel tomorrow.",
      "Don't limit your challenges. Challenge your limits."
    ];

    // Select quote based on context
    if (context.currentStreaks.some(s => s.current_days > 7)) {
      return "Consistency is the key to transformation. Keep going!";
    }
    
    if (context.patterns.some(p => p.type === 'positive')) {
      return "Your hard work is paying off. Stay on this path!";
    }

    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  /**
   * Calculate trend from array of numbers
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;
    
    return avgY > 0 ? slope / avgY : 0; // Return as percentage change
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  }
}