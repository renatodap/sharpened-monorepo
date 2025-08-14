import { createClient } from '@/lib/supabase/server';
import { AIContext, RecoveryPrediction, RecoveryFactor } from '@/lib/ai/types';

export class RecoveryPredictor {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  async process(
    userId: string,
    context: AIContext,
    config: any
  ): Promise<{ data: RecoveryPrediction; confidence: number; tokens_used: number }> {
    try {
      const prediction = await this.predictRecovery(userId, context);
      
      // Store insight if recovery is critical
      if (prediction.readiness_score < 50) {
        await this.createRecoveryAlert(userId, prediction);
      }
      
      return {
        data: prediction,
        confidence: 0.85,
        tokens_used: 0 // Local processing
      };
      
    } catch (error) {
      console.error('Recovery prediction error:', error);
      throw new Error('Failed to predict recovery');
    }
  }

  private async predictRecovery(userId: string, context: AIContext): Promise<RecoveryPrediction> {
    // Gather all recovery factors
    const factors = await this.gatherRecoveryFactors(userId, context);
    
    // Calculate recovery hours needed
    const recoveryHours = this.estimateRecoveryTime(factors);
    
    // Calculate readiness score (0-100)
    const readinessScore = this.calculateReadinessScore(factors);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(factors, readinessScore);
    
    return {
      recovery_hours: recoveryHours,
      readiness_score: readinessScore,
      factors,
      recommendations
    };
  }

  private async gatherRecoveryFactors(
    userId: string, 
    context: AIContext
  ): Promise<RecoveryFactor[]> {
    const factors: RecoveryFactor[] = [];
    
    // 1. Training Load Factor
    const lastWorkout = context.recentWorkouts[0];
    if (lastWorkout) {
      const hoursSince = this.hoursSinceWorkout(lastWorkout.date);
      const intensity = lastWorkout.intensity_score || 5;
      
      factors.push({
        name: 'Time Since Last Workout',
        impact: hoursSince < 24 ? 'negative' : hoursSince > 48 ? 'positive' : 'neutral',
        score: Math.min(100, hoursSince * 2),
        description: `${Math.round(hoursSince)} hours since last session`
      });
      
      factors.push({
        name: 'Last Workout Intensity',
        impact: intensity > 7 ? 'negative' : intensity < 4 ? 'positive' : 'neutral',
        score: 100 - (intensity * 10),
        description: `Intensity level ${intensity}/10`
      });
    }
    
    // 2. Nutrition Factor
    const recentNutrition = context.recentNutrition.slice(0, 3);
    if (recentNutrition.length > 0) {
      const avgCalories = recentNutrition.reduce((sum, n) => sum + (n.total_calories || 0), 0) / recentNutrition.length;
      const avgProtein = recentNutrition.reduce((sum, n) => sum + (n.total_protein || 0), 0) / recentNutrition.length;
      
      const targetCalories = 2000; // Should be personalized
      const targetProtein = 150; // Should be based on body weight
      
      const calorieAdequacy = Math.min(100, (avgCalories / targetCalories) * 100);
      const proteinAdequacy = Math.min(100, (avgProtein / targetProtein) * 100);
      
      factors.push({
        name: 'Calorie Intake',
        impact: calorieAdequacy < 80 ? 'negative' : calorieAdequacy > 120 ? 'neutral' : 'positive',
        score: calorieAdequacy,
        description: `${Math.round(avgCalories)} cal/day (${Math.round(calorieAdequacy)}% of target)`
      });
      
      factors.push({
        name: 'Protein Intake',
        impact: proteinAdequacy < 70 ? 'negative' : 'positive',
        score: proteinAdequacy,
        description: `${Math.round(avgProtein)}g/day (${Math.round(proteinAdequacy)}% of target)`
      });
    }
    
    // 3. Training Frequency Factor
    const workoutsLastWeek = context.recentWorkouts.filter(w => {
      const daysAgo = (Date.now() - new Date(w.date).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    }).length;
    
    factors.push({
      name: 'Weekly Training Volume',
      impact: workoutsLastWeek > 5 ? 'negative' : workoutsLastWeek < 2 ? 'neutral' : 'positive',
      score: workoutsLastWeek <= 4 ? 80 : 100 - (workoutsLastWeek * 10),
      description: `${workoutsLastWeek} workouts in last 7 days`
    });
    
    // 4. Muscle Soreness (estimated from workout patterns)
    const hasHighVolume = lastWorkout?.total_volume && lastWorkout.total_volume > 10000;
    const hasNewExercises = this.detectNewExercises(context.recentWorkouts);
    
    if (hasHighVolume || hasNewExercises) {
      factors.push({
        name: 'Estimated Muscle Damage',
        impact: 'negative',
        score: hasHighVolume ? 40 : 60,
        description: hasHighVolume ? 'High training volume detected' : 'New exercises detected'
      });
    }
    
    // 5. Consecutive Training Days
    const consecutiveDays = this.countConsecutiveTrainingDays(context.recentWorkouts);
    if (consecutiveDays > 2) {
      factors.push({
        name: 'Consecutive Training Days',
        impact: 'negative',
        score: Math.max(20, 100 - (consecutiveDays * 20)),
        description: `${consecutiveDays} days without rest`
      });
    }
    
    // 6. Body Weight Trend (stress indicator)
    if (context.bodyMetrics.length >= 2) {
      const recentWeight = context.bodyMetrics[0].weight_kg || 0;
      const previousWeight = context.bodyMetrics[1].weight_kg || 0;
      const change = recentWeight - previousWeight;
      
      if (Math.abs(change) > 1) {
        factors.push({
          name: 'Weight Fluctuation',
          impact: 'negative',
          score: 60,
          description: `${change > 0 ? '+' : ''}${change.toFixed(1)}kg change detected`
        });
      }
    }
    
    return factors;
  }

  private hoursSinceWorkout(workoutDate: Date | string): number {
    const date = new Date(workoutDate);
    const now = new Date();
    return (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  }

  private detectNewExercises(workouts: any[]): boolean {
    if (workouts.length < 2) return false;
    
    const recentExercises = new Set(
      workouts[0].exercises?.map((e: any) => e.name) || []
    );
    
    const previousExercises = new Set<string>();
    for (let i = 1; i < Math.min(5, workouts.length); i++) {
      workouts[i].exercises?.forEach((e: any) => {
        previousExercises.add(e.name);
      });
    }
    
    // Check if recent workout has exercises not seen in previous 4 workouts
    for (const exercise of recentExercises) {
      if (!previousExercises.has(exercise)) {
        return true;
      }
    }
    
    return false;
  }

  private countConsecutiveTrainingDays(workouts: any[]): number {
    if (workouts.length === 0) return 0;
    
    const sortedWorkouts = [...workouts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    let consecutive = 1;
    let lastDate = new Date(sortedWorkouts[0].date);
    
    for (let i = 1; i < sortedWorkouts.length; i++) {
      const currentDate = new Date(sortedWorkouts[i].date);
      const daysDiff = Math.floor(
        (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff === 1) {
        consecutive++;
        lastDate = currentDate;
      } else {
        break;
      }
    }
    
    return consecutive;
  }

  private estimateRecoveryTime(factors: RecoveryFactor[]): number {
    // Base recovery time
    let baseHours = 24;
    
    // Adjust based on factors
    factors.forEach(factor => {
      if (factor.impact === 'negative') {
        // Add recovery time for negative factors
        const penalty = (100 - factor.score) / 100;
        baseHours += penalty * 12; // Up to 12 additional hours per factor
      } else if (factor.impact === 'positive') {
        // Reduce recovery time for positive factors
        const bonus = factor.score / 100;
        baseHours -= bonus * 6; // Up to 6 hours reduction per factor
      }
    });
    
    // Minimum 12 hours, maximum 72 hours
    return Math.max(12, Math.min(72, Math.round(baseHours)));
  }

  private calculateReadinessScore(factors: RecoveryFactor[]): number {
    if (factors.length === 0) return 75; // Default moderate readiness
    
    let totalScore = 0;
    let totalWeight = 0;
    
    factors.forEach(factor => {
      // Weight negative factors more heavily
      const weight = factor.impact === 'negative' ? 1.5 : 1.0;
      totalScore += factor.score * weight;
      totalWeight += weight;
    });
    
    const averageScore = totalScore / totalWeight;
    
    // Apply non-linear transformation to make extreme scores more pronounced
    if (averageScore < 50) {
      return Math.round(averageScore * 0.8); // Penalize low scores
    } else if (averageScore > 80) {
      return Math.round(80 + (averageScore - 80) * 0.5); // Diminishing returns on high scores
    }
    
    return Math.round(averageScore);
  }

  private generateRecommendations(
    factors: RecoveryFactor[], 
    readinessScore: number
  ): string[] {
    const recommendations: string[] = [];
    
    // Overall readiness-based recommendation
    if (readinessScore < 30) {
      recommendations.push('🔴 Take a complete rest day. Your body needs recovery.');
    } else if (readinessScore < 50) {
      recommendations.push('🟡 Consider light activity only (walking, stretching, yoga).');
    } else if (readinessScore < 70) {
      recommendations.push('🟢 Moderate training OK, but avoid high intensity.');
    } else {
      recommendations.push('🟢 You\'re well recovered! Ready for normal or high-intensity training.');
    }
    
    // Factor-specific recommendations
    const lowProtein = factors.find(f => f.name === 'Protein Intake' && f.score < 70);
    if (lowProtein) {
      recommendations.push('Increase protein intake to support muscle recovery (aim for 1.6-2.2g/kg body weight).');
    }
    
    const lowCalories = factors.find(f => f.name === 'Calorie Intake' && f.score < 80);
    if (lowCalories) {
      recommendations.push('Ensure adequate calorie intake to fuel recovery and adaptation.');
    }
    
    const highConsecutive = factors.find(f => f.name === 'Consecutive Training Days' && f.score < 50);
    if (highConsecutive) {
      recommendations.push('Schedule a rest day to prevent overtraining and allow supercompensation.');
    }
    
    const highVolume = factors.find(f => f.name === 'Weekly Training Volume' && f.score < 60);
    if (highVolume) {
      recommendations.push('Consider a deload week with 40-60% reduced volume.');
    }
    
    // Recovery strategies based on time since workout
    const timeFactor = factors.find(f => f.name === 'Time Since Last Workout');
    if (timeFactor && timeFactor.score < 50) {
      recommendations.push('Focus on recovery: foam rolling, stretching, hydration, and quality sleep.');
    }
    
    // Limit to top 4 recommendations
    return recommendations.slice(0, 4);
  }

  private async createRecoveryAlert(userId: string, prediction: RecoveryPrediction) {
    await this.supabase.from('ai_insights').insert({
      user_id: userId,
      insight_type: 'warning',
      title: '⚠️ Low Recovery Status',
      content: `Your readiness score is ${prediction.readiness_score}/100. ${prediction.recommendations[0]}`,
      data: {
        readiness_score: prediction.readiness_score,
        recovery_hours: prediction.recovery_hours,
        factors: prediction.factors
      },
      priority: 10,
      is_actionable: true,
      action_url: '/today'
    });
  }
}