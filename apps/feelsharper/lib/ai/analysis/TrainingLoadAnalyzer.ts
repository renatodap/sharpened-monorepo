import { createClient } from '@/lib/supabase/server';
import { AIContext, LoadAnalysis } from '@/lib/ai/types';

export class TrainingLoadAnalyzer {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  async process(
    userId: string,
    context: AIContext,
    config: any
  ): Promise<{ data: LoadAnalysis; confidence: number; tokens_used: number }> {
    try {
      const analysis = await this.analyzeTrainingLoad(userId, context);
      
      // Store insights if needed
      if (analysis.risk_level === 'high') {
        await this.createWarning(userId, analysis);
      }
      
      return {
        data: analysis,
        confidence: 0.9, // High confidence in mathematical calculations
        tokens_used: 0 // Local processing
      };
      
    } catch (error) {
      console.error('Training load analysis error:', error);
      throw new Error('Failed to analyze training load');
    }
  }

  private async analyzeTrainingLoad(userId: string, context: AIContext): Promise<LoadAnalysis> {
    // Get workout history for ACWR calculation
    const workouts = await this.getExtendedWorkoutHistory(userId);
    
    // Calculate Acute:Chronic Workload Ratio (ACWR)
    const acuteLoad = this.calculateWorkload(workouts, 7); // Last 7 days
    const chronicLoad = this.calculateWorkload(workouts, 28); // Last 28 days
    
    // Avoid division by zero
    const ratio = chronicLoad > 0 ? acuteLoad / chronicLoad : 1.0;
    
    // Determine risk level based on sports science research
    const riskLevel = this.determineRiskLevel(ratio);
    
    // Generate recommendation
    const recommendation = this.generateRecommendation(ratio, riskLevel, context);
    
    // Calculate trend
    const trend = this.calculateLoadTrend(workouts);
    
    return {
      acute_load: Math.round(acuteLoad),
      chronic_load: Math.round(chronicLoad),
      ratio: Math.round(ratio * 100) / 100,
      risk_level: riskLevel,
      recommendation,
      trend
    };
  }

  private async getExtendedWorkoutHistory(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data } = await this.supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString())
      .order('date', { ascending: false });
    
    return data || [];
  }

  private calculateWorkload(workouts: any[], days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const relevantWorkouts = workouts.filter(w => 
      new Date(w.date) >= cutoffDate
    );
    
    // Calculate total training load using various metrics
    let totalLoad = 0;
    
    relevantWorkouts.forEach(workout => {
      // Base load from duration
      const duration = workout.duration_minutes || 30;
      
      // Intensity multiplier
      const intensity = workout.intensity_score || 5;
      const intensityMultiplier = intensity / 5; // Normalize to 1.0 for moderate
      
      // Volume component
      const volume = workout.total_volume || 0;
      const volumeScore = Math.min(volume / 1000, 10); // Cap at 10
      
      // Session RPE (if available)
      const sessionRPE = workout.session_rpe || intensity;
      
      // Calculate session load (Foster's method: duration × RPE)
      const sessionLoad = duration * sessionRPE / 10;
      
      // Add volume component
      const totalSessionLoad = sessionLoad + volumeScore;
      
      totalLoad += totalSessionLoad * intensityMultiplier;
    });
    
    // Average daily load
    return totalLoad / days;
  }

  private determineRiskLevel(ratio: number): 'low' | 'optimal' | 'moderate' | 'high' {
    // Based on Tim Gabbett's research on injury prevention
    if (ratio < 0.8) return 'low'; // Undertraining
    if (ratio >= 0.8 && ratio <= 1.3) return 'optimal'; // Sweet spot
    if (ratio > 1.3 && ratio <= 1.5) return 'moderate'; // Caution zone
    return 'high'; // Danger zone (>1.5)
  }

  private generateRecommendation(
    ratio: number, 
    riskLevel: string,
    context: AIContext
  ): string {
    const recentWorkouts = context.recentWorkouts.length;
    const avgWorkoutsPerWeek = recentWorkouts / 4;
    
    switch (riskLevel) {
      case 'high':
        return `⚠️ High injury risk detected (ratio: ${ratio}). Reduce training volume by 20-30% this week. Focus on recovery with light activity, stretching, and proper nutrition. Your body needs time to adapt.`;
      
      case 'moderate':
        return `Approaching high training load (ratio: ${ratio}). Maintain current volume but avoid increasing intensity. Add an extra recovery day if feeling fatigued.`;
      
      case 'optimal':
        return `Perfect training load balance (ratio: ${ratio})! You can safely progress by 5-10% next week. Keep monitoring how you feel.`;
      
      case 'low':
        if (avgWorkoutsPerWeek < 2) {
          return `Low training stimulus detected. Try adding 1-2 more workouts per week to see better progress. Start with moderate intensity.`;
        }
        return `Training load is low (ratio: ${ratio}). You have room to increase volume or intensity by 10-15%. This is a good time to push harder.`;
      
      default:
        return 'Continue with current training plan and monitor recovery.';
    }
  }

  private calculateLoadTrend(workouts: any[]): 'increasing' | 'stable' | 'decreasing' {
    if (workouts.length < 4) return 'stable';
    
    // Compare last 2 weeks to previous 2 weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const recentWorkouts = workouts.filter(w => 
      new Date(w.date) >= twoWeeksAgo
    );
    
    const olderWorkouts = workouts.filter(w => 
      new Date(w.date) < twoWeeksAgo
    );
    
    const recentLoad = this.calculateWorkload(recentWorkouts, 14);
    const olderLoad = this.calculateWorkload(olderWorkouts, 14);
    
    const changePercent = ((recentLoad - olderLoad) / olderLoad) * 100;
    
    if (changePercent > 10) return 'increasing';
    if (changePercent < -10) return 'decreasing';
    return 'stable';
  }

  private async createWarning(userId: string, analysis: LoadAnalysis) {
    await this.supabase.from('ai_insights').insert({
      user_id: userId,
      insight_type: 'warning',
      title: '⚠️ High Training Load Detected',
      content: analysis.recommendation,
      data: {
        acute_load: analysis.acute_load,
        chronic_load: analysis.chronic_load,
        ratio: analysis.ratio
      },
      priority: 9,
      is_actionable: true,
      action_url: '/insights'
    });
  }
}