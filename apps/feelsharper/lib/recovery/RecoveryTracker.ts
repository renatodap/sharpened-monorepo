/**
 * RecoveryTracker - Advanced recovery monitoring and optimization
 * Maps to PRD: Recovery Intelligence & Sleep Optimization
 */

export interface RecoveryMetrics {
  userId: string;
  date: Date;
  overallScore: number; // 0-100
  sleepScore: number; // 0-100
  hrvScore: number; // 0-100
  fatigueScore: number; // 0-100 (lower is better)
  stressScore: number; // 0-100 (lower is better)
  readinessScore: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  recommendations: RecoveryRecommendation[];
  alerts: RecoveryAlert[];
}

export interface SleepData {
  sleepId: string;
  userId: string;
  date: Date;
  bedTime: Date;
  sleepTime: Date;
  wakeTime: Date;
  totalSleepTime: number; // minutes
  timeInBed: number; // minutes
  sleepEfficiency: number; // percentage
  sleepLatency: number; // minutes to fall asleep
  remSleep: number; // minutes
  deepSleep: number; // minutes
  lightSleep: number; // minutes
  awakenings: number;
  sleepScore: number; // 0-100
  sleepStages: SleepStage[];
  source: 'manual' | 'wearable' | 'phone' | 'estimated';
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
}

export interface SleepStage {
  stage: 'awake' | 'light' | 'deep' | 'rem';
  startTime: Date;
  duration: number; // minutes
  quality: number; // 0-100
}

export interface HRVData {
  hrvId: string;
  userId: string;
  timestamp: Date;
  rmssd: number; // Root mean square of successive differences
  pnn50: number; // Percentage of successive RR intervals that differ by > 50ms
  averageRR: number; // Average RR interval
  hrvScore: number; // 0-100
  baseline: number; // User's baseline HRV
  deviation: number; // Percentage deviation from baseline
  trend: 'above_baseline' | 'at_baseline' | 'below_baseline';
  source: 'wearable' | 'manual' | 'estimated';
  reliability: 'high' | 'medium' | 'low';
}

export interface StressData {
  stressId: string;
  userId: string;
  timestamp: Date;
  perceivedStress: number; // 1-10 user rating
  physiologicalStress: number; // 0-100 from HRV/HR data
  workStress: number; // 1-10
  personalStress: number; // 1-10
  stressors: string[];
  copingStrategies: string[];
  stressScore: number; // 0-100 (lower is better)
  resilience: number; // 0-100
}

export interface FatigueAssessment {
  fatigueId: string;
  userId: string;
  date: Date;
  physicalFatigue: number; // 1-10
  mentalFatigue: number; // 1-10
  motivationLevel: number; // 1-10
  energyLevel: number; // 1-10
  muscleReadiness: MuscleReadinessData[];
  performanceDecline: number; // percentage
  trainingLoad: number; // TSS or similar
  fatigueScore: number; // 0-100 (lower is better)
  source: 'subjective' | 'objective' | 'combined';
}

export interface MuscleReadinessData {
  muscleGroup: string;
  soreness: number; // 1-10
  stiffness: number; // 1-10
  strength: number; // 1-10 (perceived)
  readiness: number; // 0-100
  lastTrained: Date;
  volumeLastWeek: number;
}

export interface RecoveryRecommendation {
  type: 'sleep' | 'nutrition' | 'training' | 'stress' | 'lifestyle';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: string;
  timeframe: string;
  scientific_basis?: string;
}

export interface RecoveryAlert {
  type: 'overtraining' | 'poor_sleep' | 'high_stress' | 'illness_risk' | 'plateau_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggers: string[];
  immediateActions: string[];
  preventionStrategies: string[];
  duration: number; // days this has been ongoing
}

export interface DeloadRecommendation {
  recommended: boolean;
  urgency: 'low' | 'medium' | 'high';
  reasons: string[];
  suggestedDuration: number; // days
  deloadType: 'complete_rest' | 'active_recovery' | 'reduced_volume' | 'reduced_intensity';
  activities: string[];
  expectedBenefits: string[];
  timing: 'immediate' | 'this_week' | 'next_week';
}

export interface SleepOptimization {
  currentSleepEfficiency: number;
  targetSleepEfficiency: number;
  sleepDebt: number; // hours
  optimalBedtime: string; // HH:MM
  optimalWakeTime: string; // HH:MM
  sleepEnvironmentScore: number; // 0-100
  recommendations: SleepRecommendation[];
  interventions: SleepIntervention[];
}

export interface SleepRecommendation {
  category: 'timing' | 'environment' | 'routine' | 'nutrition' | 'technology';
  recommendation: string;
  impact: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  timeToEffect: string;
}

export interface SleepIntervention {
  type: 'cognitive' | 'behavioral' | 'environmental' | 'pharmacological';
  name: string;
  description: string;
  protocol: string[];
  evidence: string;
  contraindications: string[];
}

export interface RecoveryTrend {
  timeframe: 'week' | 'month' | 'quarter';
  overallTrend: 'improving' | 'stable' | 'declining';
  keyMetrics: {
    sleepQuality: { current: number; change: number };
    hrv: { current: number; change: number };
    stress: { current: number; change: number };
    fatigue: { current: number; change: number };
  };
  patterns: RecoveryPattern[];
  correlations: MetricCorrelation[];
}

export interface RecoveryPattern {
  pattern: string;
  frequency: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-100
  description: string;
  suggestions: string[];
}

export interface MetricCorrelation {
  metric1: string;
  metric2: string;
  correlation: number; // -1 to 1
  strength: 'weak' | 'moderate' | 'strong';
  significance: number; // p-value
  insight: string;
}

export class RecoveryTracker {
  private static instance: RecoveryTracker;

  private constructor() {}

  static getInstance(): RecoveryTracker {
    if (!RecoveryTracker.instance) {
      RecoveryTracker.instance = new RecoveryTracker();
    }
    return RecoveryTracker.instance;
  }

  /**
   * Calculate comprehensive recovery metrics
   */
  async calculateRecoveryMetrics(userId: string, date: Date = new Date()): Promise<RecoveryMetrics> {
    const sleepData = await this.getRecentSleepData(userId, date, 1);
    const hrvData = await this.getRecentHRVData(userId, date, 7);
    const stressData = await this.getRecentStressData(userId, date, 7);
    const fatigueData = await this.getRecentFatigueData(userId, date, 3);
    const workoutData = await this.getRecentWorkoutData(userId, date, 7);

    // Calculate individual scores
    const sleepScore = this.calculateSleepScore(sleepData);
    const hrvScore = this.calculateHRVScore(hrvData);
    const stressScore = this.calculateStressScore(stressData);
    const fatigueScore = this.calculateFatigueScore(fatigueData);

    // Calculate readiness score
    const readinessScore = this.calculateReadinessScore(sleepScore, hrvScore, stressScore, fatigueScore);

    // Calculate overall recovery score
    const overallScore = this.calculateOverallRecoveryScore(
      sleepScore, hrvScore, stressScore, fatigueScore, readinessScore
    );

    // Determine trend
    const trend = await this.calculateRecoveryTrend(userId, date);

    // Generate recommendations and alerts
    const recommendations = await this.generateRecoveryRecommendations(
      userId, sleepScore, hrvScore, stressScore, fatigueScore, workoutData
    );
    const alerts = await this.generateRecoveryAlerts(
      userId, sleepScore, hrvScore, stressScore, fatigueScore
    );

    return {
      userId,
      date,
      overallScore,
      sleepScore,
      hrvScore,
      fatigueScore,
      stressScore,
      readinessScore,
      trend,
      recommendations,
      alerts
    };
  }

  /**
   * Process sleep data and generate insights
   */
  async processSleepData(sleepData: Partial<SleepData>): Promise<SleepData> {
    const processedSleep: SleepData = {
      sleepId: this.generateId(),
      userId: sleepData.userId!,
      date: sleepData.date || new Date(),
      bedTime: sleepData.bedTime!,
      sleepTime: sleepData.sleepTime || sleepData.bedTime!,
      wakeTime: sleepData.wakeTime!,
      totalSleepTime: sleepData.totalSleepTime || this.calculateSleepDuration(sleepData.sleepTime!, sleepData.wakeTime!),
      timeInBed: this.calculateTimeInBed(sleepData.bedTime!, sleepData.wakeTime!),
      sleepEfficiency: 0,
      sleepLatency: sleepData.sleepLatency || 15,
      remSleep: sleepData.remSleep || 0,
      deepSleep: sleepData.deepSleep || 0,
      lightSleep: sleepData.lightSleep || 0,
      awakenings: sleepData.awakenings || 0,
      sleepScore: 0,
      sleepStages: sleepData.sleepStages || [],
      source: sleepData.source || 'manual',
      quality: 'fair',
      notes: sleepData.notes
    };

    // Calculate derived metrics
    processedSleep.sleepEfficiency = (processedSleep.totalSleepTime / processedSleep.timeInBed) * 100;
    processedSleep.sleepScore = this.calculateSleepScoreFromData(processedSleep);
    processedSleep.quality = this.determineSleepQuality(processedSleep.sleepScore);

    // Estimate sleep stages if not provided
    if (processedSleep.sleepStages.length === 0) {
      processedSleep.sleepStages = this.estimateSleepStages(processedSleep);
      processedSleep.remSleep = this.calculateStageTime(processedSleep.sleepStages, 'rem');
      processedSleep.deepSleep = this.calculateStageTime(processedSleep.sleepStages, 'deep');
      processedSleep.lightSleep = this.calculateStageTime(processedSleep.sleepStages, 'light');
    }

    await this.saveSleepData(processedSleep);
    return processedSleep;
  }

  /**
   * Process HRV data and calculate metrics
   */
  async processHRVData(userId: string, rmssd: number, timestamp: Date = new Date()): Promise<HRVData> {
    const baseline = await this.getUserHRVBaseline(userId);
    const deviation = baseline > 0 ? ((rmssd - baseline) / baseline) * 100 : 0;
    
    let trend: 'above_baseline' | 'at_baseline' | 'below_baseline';
    if (deviation > 5) trend = 'above_baseline';
    else if (deviation < -5) trend = 'below_baseline';
    else trend = 'at_baseline';

    const hrvScore = this.calculateHRVScoreFromRMSSD(rmssd, baseline);

    const hrvData: HRVData = {
      hrvId: this.generateId(),
      userId,
      timestamp,
      rmssd,
      pnn50: 0, // Would be calculated from raw RR intervals
      averageRR: 0, // Would be calculated from raw RR intervals  
      hrvScore,
      baseline,
      deviation,
      trend,
      source: 'wearable',
      reliability: 'high'
    };

    await this.saveHRVData(hrvData);
    
    // Update baseline if needed
    await this.updateHRVBaseline(userId, rmssd);

    return hrvData;
  }

  /**
   * Assess fatigue levels
   */
  async assessFatigue(userId: string, assessment: Partial<FatigueAssessment>): Promise<FatigueAssessment> {
    const workouts = await this.getRecentWorkoutData(userId, new Date(), 7);
    const trainingLoad = this.calculateTrainingLoad(workouts);
    
    const fatigue: FatigueAssessment = {
      fatigueId: this.generateId(),
      userId,
      date: assessment.date || new Date(),
      physicalFatigue: assessment.physicalFatigue || 5,
      mentalFatigue: assessment.mentalFatigue || 5,
      motivationLevel: assessment.motivationLevel || 5,
      energyLevel: assessment.energyLevel || 5,
      muscleReadiness: assessment.muscleReadiness || await this.assessMuscleReadiness(userId),
      performanceDecline: assessment.performanceDecline || 0,
      trainingLoad,
      fatigueScore: 0,
      source: assessment.source || 'subjective'
    };

    fatigue.fatigueScore = this.calculateFatigueScoreFromAssessment(fatigue);

    await this.saveFatigueAssessment(fatigue);
    return fatigue;
  }

  /**
   * Generate sleep optimization plan
   */
  async generateSleepOptimization(userId: string): Promise<SleepOptimization> {
    const recentSleep = await this.getRecentSleepData(userId, new Date(), 14);
    const userProfile = await this.getUserProfile(userId);
    
    const avgEfficiency = recentSleep.reduce((sum, s) => sum + s.sleepEfficiency, 0) / recentSleep.length;
    const sleepDebt = this.calculateSleepDebt(recentSleep, userProfile.targetSleepHours || 8);
    
    const optimalTimes = this.calculateOptimalSleepTimes(recentSleep, userProfile);
    
    const recommendations = this.generateSleepRecommendations(recentSleep, userProfile);
    const interventions = this.getSleepInterventions(avgEfficiency);

    return {
      currentSleepEfficiency: avgEfficiency,
      targetSleepEfficiency: 85, // Target efficiency
      sleepDebt,
      optimalBedtime: optimalTimes.bedtime,
      optimalWakeTime: optimalTimes.wakeTime,
      sleepEnvironmentScore: await this.assessSleepEnvironment(userId),
      recommendations,
      interventions
    };
  }

  /**
   * Generate deload recommendations
   */
  async generateDeloadRecommendation(userId: string): Promise<DeloadRecommendation> {
    const recovery = await this.calculateRecoveryMetrics(userId);
    const workouts = await this.getRecentWorkoutData(userId, new Date(), 21);
    const sleep = await this.getRecentSleepData(userId, new Date(), 7);
    const hrv = await this.getRecentHRVData(userId, new Date(), 7);

    const indicators = this.assessDeloadIndicators(recovery, workouts, sleep, hrv);
    const recommended = indicators.length >= 3; // Need 3+ indicators
    
    let urgency: 'low' | 'medium' | 'high' = 'low';
    if (recovery.overallScore < 60) urgency = 'high';
    else if (recovery.overallScore < 75) urgency = 'medium';

    const deloadType = this.determineDeloadType(indicators, recovery);
    
    return {
      recommended,
      urgency,
      reasons: indicators,
      suggestedDuration: this.calculateDeloadDuration(urgency, indicators.length),
      deloadType,
      activities: this.getDeloadActivities(deloadType),
      expectedBenefits: this.getDeloadBenefits(deloadType),
      timing: urgency === 'high' ? 'immediate' : 'this_week'
    };
  }

  /**
   * Analyze recovery trends
   */
  async analyzeRecoveryTrends(userId: string, timeframe: 'week' | 'month' | 'quarter'): Promise<RecoveryTrend> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
    }

    const recoveryData = await this.getRecoveryHistory(userId, startDate, endDate);
    
    const currentMetrics = recoveryData[recoveryData.length - 1];
    const previousMetrics = recoveryData[0];
    
    const sleepChange = this.calculateChange(currentMetrics?.sleepScore, previousMetrics?.sleepScore);
    const hrvChange = this.calculateChange(currentMetrics?.hrvScore, previousMetrics?.hrvScore);
    const stressChange = this.calculateChange(currentMetrics?.stressScore, previousMetrics?.stressScore);
    const fatigueChange = this.calculateChange(currentMetrics?.fatigueScore, previousMetrics?.fatigueScore);

    const overallTrend = this.determineOverallTrend(sleepChange, hrvChange, stressChange, fatigueChange);
    const patterns = await this.identifyRecoveryPatterns(recoveryData);
    const correlations = await this.calculateMetricCorrelations(recoveryData);

    return {
      timeframe,
      overallTrend,
      keyMetrics: {
        sleepQuality: { current: currentMetrics?.sleepScore || 0, change: sleepChange },
        hrv: { current: currentMetrics?.hrvScore || 0, change: hrvChange },
        stress: { current: currentMetrics?.stressScore || 0, change: stressChange },
        fatigue: { current: currentMetrics?.fatigueScore || 0, change: fatigueChange }
      },
      patterns,
      correlations
    };
  }

  /**
   * Private helper methods
   */
  private calculateSleepScore(sleepData: SleepData[]): number {
    if (sleepData.length === 0) return 50; // Default neutral score
    
    const latest = sleepData[0];
    return latest.sleepScore;
  }

  private calculateHRVScore(hrvData: HRVData[]): number {
    if (hrvData.length === 0) return 50;
    
    const recent = hrvData.slice(0, 3); // Last 3 readings
    const avgScore = recent.reduce((sum, h) => sum + h.hrvScore, 0) / recent.length;
    return avgScore;
  }

  private calculateStressScore(stressData: StressData[]): number {
    if (stressData.length === 0) return 50;
    
    const recent = stressData.slice(0, 3);
    const avgScore = recent.reduce((sum, s) => sum + s.stressScore, 0) / recent.length;
    return avgScore;
  }

  private calculateFatigueScore(fatigueData: FatigueAssessment[]): number {
    if (fatigueData.length === 0) return 50;
    
    const latest = fatigueData[0];
    return latest.fatigueScore;
  }

  private calculateReadinessScore(sleep: number, hrv: number, stress: number, fatigue: number): number {
    // Weighted average with stress and fatigue inverted (lower is better)
    const invertedStress = 100 - stress;
    const invertedFatigue = 100 - fatigue;
    
    return (sleep * 0.3 + hrv * 0.3 + invertedStress * 0.2 + invertedFatigue * 0.2);
  }

  private calculateOverallRecoveryScore(sleep: number, hrv: number, stress: number, fatigue: number, readiness: number): number {
    return (sleep * 0.25 + hrv * 0.25 + readiness * 0.25 + (100 - stress) * 0.125 + (100 - fatigue) * 0.125);
  }

  private async calculateRecoveryTrend(userId: string, date: Date): Promise<'improving' | 'stable' | 'declining'> {
    const history = await this.getRecoveryHistory(userId, new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000), date);
    
    if (history.length < 3) return 'stable';
    
    const recent = history.slice(-3);
    const earlier = history.slice(0, 3);
    
    const recentAvg = recent.reduce((sum, r) => sum + r.overallScore, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, r) => sum + r.overallScore, 0) / earlier.length;
    
    const change = recentAvg - earlierAvg;
    
    if (change > 5) return 'improving';
    if (change < -5) return 'declining';
    return 'stable';
  }

  private async generateRecoveryRecommendations(
    userId: string,
    sleepScore: number,
    hrvScore: number,
    stressScore: number,
    fatigueScore: number,
    workoutData: any[]
  ): Promise<RecoveryRecommendation[]> {
    const recommendations: RecoveryRecommendation[] = [];

    // Sleep recommendations
    if (sleepScore < 70) {
      recommendations.push({
        type: 'sleep',
        priority: 'high',
        title: 'Improve Sleep Quality',
        description: 'Your sleep quality is below optimal levels',
        actionItems: [
          'Maintain consistent sleep schedule',
          'Create dark, cool sleeping environment',
          'Avoid screens 1 hour before bed',
          'Consider sleep hygiene assessment'
        ],
        expectedImpact: 'Improved recovery and performance',
        timeframe: '1-2 weeks',
        scientific_basis: 'Sleep is critical for muscle recovery and cognitive function'
      });
    }

    // HRV recommendations
    if (hrvScore < 60) {
      recommendations.push({
        type: 'stress',
        priority: 'medium',
        title: 'Address Autonomic Stress',
        description: 'Your heart rate variability indicates elevated stress',
        actionItems: [
          'Practice deep breathing exercises',
          'Consider meditation or mindfulness',
          'Reduce training intensity temporarily',
          'Ensure adequate hydration'
        ],
        expectedImpact: 'Better stress resilience and recovery',
        timeframe: '3-7 days'
      });
    }

    // Training recommendations
    if (fatigueScore > 70) {
      recommendations.push({
        type: 'training',
        priority: 'high',
        title: 'Reduce Training Load',
        description: 'High fatigue levels indicate need for recovery',
        actionItems: [
          'Take 1-2 complete rest days',
          'Reduce training volume by 30-40%',
          'Focus on light active recovery',
          'Prioritize sleep and nutrition'
        ],
        expectedImpact: 'Reduced fatigue and improved performance',
        timeframe: '5-10 days'
      });
    }

    // Stress management
    if (stressScore > 70) {
      recommendations.push({
        type: 'stress',
        priority: 'medium',
        title: 'Manage Life Stress',
        description: 'Elevated stress levels may impair recovery',
        actionItems: [
          'Identify and address stress sources',
          'Practice stress management techniques',
          'Consider professional support if needed',
          'Ensure work-life balance'
        ],
        expectedImpact: 'Lower stress and better recovery',
        timeframe: '1-4 weeks'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private async generateRecoveryAlerts(
    userId: string,
    sleepScore: number,
    hrvScore: number,
    stressScore: number,
    fatigueScore: number
  ): Promise<RecoveryAlert[]> {
    const alerts: RecoveryAlert[] = [];

    // Overtraining alert
    if (fatigueScore > 80 && hrvScore < 50) {
      alerts.push({
        type: 'overtraining',
        severity: 'high',
        message: 'Signs of overtraining detected',
        triggers: ['High fatigue', 'Low HRV', 'Poor recovery'],
        immediateActions: [
          'Take immediate rest day',
          'Reduce training intensity',
          'Focus on sleep and nutrition',
          'Consider medical consultation'
        ],
        preventionStrategies: [
          'Monitor training load more carefully',
          'Include regular deload weeks',
          'Prioritize recovery metrics'
        ],
        duration: await this.calculateAlertDuration(userId, 'overtraining')
      });
    }

    // Poor sleep alert
    if (sleepScore < 50) {
      alerts.push({
        type: 'poor_sleep',
        severity: 'medium',
        message: 'Sleep quality is significantly impaired',
        triggers: ['Low sleep efficiency', 'Poor sleep quality'],
        immediateActions: [
          'Assess sleep environment',
          'Review sleep hygiene practices',
          'Consider sleep study if persistent'
        ],
        preventionStrategies: [
          'Maintain consistent sleep schedule',
          'Optimize sleep environment',
          'Manage evening routine'
        ],
        duration: await this.calculateAlertDuration(userId, 'poor_sleep')
      });
    }

    // High stress alert
    if (stressScore > 80) {
      alerts.push({
        type: 'high_stress',
        severity: 'medium',
        message: 'Stress levels are critically high',
        triggers: ['Elevated perceived stress', 'High physiological stress'],
        immediateActions: [
          'Practice immediate stress relief',
          'Reduce non-essential activities',
          'Consider professional support'
        ],
        preventionStrategies: [
          'Develop stress management skills',
          'Build resilience practices',
          'Maintain work-life balance'
        ],
        duration: await this.calculateAlertDuration(userId, 'high_stress')
      });
    }

    return alerts;
  }

  private calculateSleepDuration(sleepTime: Date, wakeTime: Date): number {
    let duration = wakeTime.getTime() - sleepTime.getTime();
    if (duration < 0) duration += 24 * 60 * 60 * 1000; // Handle overnight sleep
    return Math.round(duration / (1000 * 60)); // Return minutes
  }

  private calculateTimeInBed(bedTime: Date, wakeTime: Date): number {
    let duration = wakeTime.getTime() - bedTime.getTime();
    if (duration < 0) duration += 24 * 60 * 60 * 1000;
    return Math.round(duration / (1000 * 60));
  }

  private calculateSleepScoreFromData(sleep: SleepData): number {
    let score = 100;
    
    // Sleep duration (target: 7-9 hours)
    const hoursSlept = sleep.totalSleepTime / 60;
    if (hoursSlept < 6 || hoursSlept > 10) score -= 20;
    else if (hoursSlept < 7 || hoursSlept > 9) score -= 10;
    
    // Sleep efficiency (target: >85%)
    if (sleep.sleepEfficiency < 75) score -= 20;
    else if (sleep.sleepEfficiency < 85) score -= 10;
    
    // Sleep latency (target: <15 minutes)
    if (sleep.sleepLatency > 30) score -= 15;
    else if (sleep.sleepLatency > 15) score -= 5;
    
    // Awakenings (target: <3)
    if (sleep.awakenings > 5) score -= 15;
    else if (sleep.awakenings > 3) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private determineSleepQuality(score: number): 'poor' | 'fair' | 'good' | 'excellent' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  }

  private estimateSleepStages(sleep: SleepData): SleepStage[] {
    // Simplified sleep stage estimation
    const stages: SleepStage[] = [];
    const totalMinutes = sleep.totalSleepTime;
    
    // Typical sleep architecture percentages
    const lightPercent = 0.50;
    const deepPercent = 0.20;
    const remPercent = 0.25;
    const awakePercent = 0.05;
    
    stages.push({
      stage: 'light',
      startTime: sleep.sleepTime,
      duration: Math.round(totalMinutes * lightPercent),
      quality: 75
    });
    
    stages.push({
      stage: 'deep',
      startTime: new Date(sleep.sleepTime.getTime() + totalMinutes * lightPercent * 0.5 * 60 * 1000),
      duration: Math.round(totalMinutes * deepPercent),
      quality: 85
    });
    
    stages.push({
      stage: 'rem',
      startTime: new Date(sleep.sleepTime.getTime() + totalMinutes * 0.7 * 60 * 1000),
      duration: Math.round(totalMinutes * remPercent),
      quality: 80
    });
    
    return stages;
  }

  private calculateStageTime(stages: SleepStage[], stageType: string): number {
    return stages
      .filter(stage => stage.stage === stageType)
      .reduce((sum, stage) => sum + stage.duration, 0);
  }

  private calculateHRVScoreFromRMSSD(rmssd: number, baseline: number): number {
    if (baseline === 0) return 50; // No baseline yet
    
    const deviation = ((rmssd - baseline) / baseline) * 100;
    
    // Score based on deviation from baseline
    if (deviation > 10) return 90; // Well above baseline
    if (deviation > 5) return 80;
    if (deviation > -5) return 70;
    if (deviation > -10) return 60;
    if (deviation > -20) return 40;
    return 20; // Significantly below baseline
  }

  private calculateFatigueScoreFromAssessment(fatigue: FatigueAssessment): number {
    // Higher values = more fatigued = higher score (worse)
    const physicalComponent = (fatigue.physicalFatigue / 10) * 30;
    const mentalComponent = (fatigue.mentalFatigue / 10) * 20;
    const motivationComponent = ((10 - fatigue.motivationLevel) / 10) * 25;
    const energyComponent = ((10 - fatigue.energyLevel) / 10) * 25;
    
    return physicalComponent + mentalComponent + motivationComponent + energyComponent;
  }

  private calculateTrainingLoad(workouts: any[]): number {
    // Simplified training load calculation
    return workouts.reduce((sum, workout) => {
      const duration = workout.duration || 60; // minutes
      const intensity = workout.intensity || 7; // RPE 1-10
      return sum + (duration * intensity / 10);
    }, 0);
  }

  private async assessMuscleReadiness(userId: string): Promise<MuscleReadinessData[]> {
    // Mock implementation - would integrate with actual muscle soreness data
    const muscleGroups = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core'];
    
    return muscleGroups.map(group => ({
      muscleGroup: group,
      soreness: Math.random() * 10,
      stiffness: Math.random() * 10,
      strength: 5 + Math.random() * 5,
      readiness: 50 + Math.random() * 50,
      lastTrained: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      volumeLastWeek: Math.random() * 20
    }));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private calculateChange(current?: number, previous?: number): number {
    if (!current || !previous) return 0;
    return ((current - previous) / previous) * 100;
  }

  private determineOverallTrend(sleep: number, hrv: number, stress: number, fatigue: number): 'improving' | 'stable' | 'declining' {
    const positiveChanges = [sleep, hrv].filter(change => change > 5).length;
    const negativeChanges = [stress, fatigue].filter(change => change > 5).length;
    const overallNegatives = [sleep, hrv].filter(change => change < -5).length + 
                           [stress, fatigue].filter(change => change < -5).length;
    
    if (positiveChanges >= 1 && overallNegatives === 0) return 'improving';
    if (overallNegatives >= 2) return 'declining';
    return 'stable';
  }

  private async identifyRecoveryPatterns(data: RecoveryMetrics[]): Promise<RecoveryPattern[]> {
    // Mock implementation - would use pattern recognition algorithms
    return [
      {
        pattern: 'Weekend Recovery',
        frequency: 'Weekly',
        impact: 'positive',
        confidence: 85,
        description: 'Recovery metrics improve consistently on weekends',
        suggestions: ['Maintain weekend sleep schedule', 'Consider weekend active recovery']
      }
    ];
  }

  private async calculateMetricCorrelations(data: RecoveryMetrics[]): Promise<MetricCorrelation[]> {
    // Mock implementation - would calculate actual correlations
    return [
      {
        metric1: 'Sleep Quality',
        metric2: 'HRV',
        correlation: 0.67,
        strength: 'moderate',
        significance: 0.02,
        insight: 'Better sleep quality strongly correlates with higher HRV'
      }
    ];
  }

  // Mock database methods
  private async getRecentSleepData(userId: string, date: Date, days: number): Promise<SleepData[]> {
    return []; // Mock
  }

  private async getRecentHRVData(userId: string, date: Date, days: number): Promise<HRVData[]> {
    return []; // Mock
  }

  private async getRecentStressData(userId: string, date: Date, days: number): Promise<StressData[]> {
    return []; // Mock
  }

  private async getRecentFatigueData(userId: string, date: Date, days: number): Promise<FatigueAssessment[]> {
    return []; // Mock
  }

  private async getRecentWorkoutData(userId: string, date: Date, days: number): Promise<any[]> {
    return []; // Mock
  }

  private async getUserProfile(userId: string): Promise<any> {
    return { targetSleepHours: 8 }; // Mock
  }

  private async getRecoveryHistory(userId: string, start: Date, end: Date): Promise<RecoveryMetrics[]> {
    return []; // Mock
  }

  private async getUserHRVBaseline(userId: string): Promise<number> {
    return 40; // Mock baseline
  }

  private async saveSleepData(sleep: SleepData): Promise<void> {
    console.log('Saving sleep data:', sleep.sleepId);
  }

  private async saveHRVData(hrv: HRVData): Promise<void> {
    console.log('Saving HRV data:', hrv.hrvId);
  }

  private async saveFatigueAssessment(fatigue: FatigueAssessment): Promise<void> {
    console.log('Saving fatigue assessment:', fatigue.fatigueId);
  }

  private async updateHRVBaseline(userId: string, newValue: number): Promise<void> {
    console.log('Updating HRV baseline for user:', userId);
  }

  private async calculateAlertDuration(userId: string, alertType: string): Promise<number> {
    return Math.floor(Math.random() * 7) + 1; // 1-7 days
  }

  private calculateSleepDebt(sleepData: SleepData[], target: number): number {
    const totalTarget = target * sleepData.length;
    const totalActual = sleepData.reduce((sum, s) => sum + (s.totalSleepTime / 60), 0);
    return Math.max(0, totalTarget - totalActual);
  }

  private calculateOptimalSleepTimes(sleepData: SleepData[], profile: any): { bedtime: string; wakeTime: string } {
    // Analyze patterns and recommend optimal times
    return { bedtime: '22:30', wakeTime: '06:30' };
  }

  private generateSleepRecommendations(sleepData: SleepData[], profile: any): SleepRecommendation[] {
    return [
      {
        category: 'timing',
        recommendation: 'Go to bed 30 minutes earlier',
        impact: 'high',
        difficulty: 'easy',
        timeToEffect: '1 week'
      }
    ];
  }

  private getSleepInterventions(efficiency: number): SleepIntervention[] {
    return [
      {
        type: 'behavioral',
        name: 'Sleep Restriction Therapy',
        description: 'Temporarily restrict time in bed to improve sleep efficiency',
        protocol: ['Calculate sleep efficiency', 'Restrict time in bed', 'Gradually increase'],
        evidence: 'Strong evidence for improving sleep efficiency',
        contraindications: ['Sleep disorders', 'Shift work']
      }
    ];
  }

  private async assessSleepEnvironment(userId: string): Promise<number> {
    return 75; // Mock score
  }

  private assessDeloadIndicators(recovery: RecoveryMetrics, workouts: any[], sleep: SleepData[], hrv: HRVData[]): string[] {
    const indicators: string[] = [];
    
    if (recovery.overallScore < 65) indicators.push('Poor overall recovery');
    if (recovery.fatigueScore > 70) indicators.push('High fatigue levels');
    if (recovery.hrvScore < 50) indicators.push('Suppressed HRV');
    if (sleep.length > 0 && sleep[0].sleepScore < 60) indicators.push('Poor sleep quality');
    
    return indicators;
  }

  private determineDeloadType(indicators: string[], recovery: RecoveryMetrics): 'complete_rest' | 'active_recovery' | 'reduced_volume' | 'reduced_intensity' {
    if (indicators.length > 4 || recovery.overallScore < 50) return 'complete_rest';
    if (indicators.length > 2) return 'active_recovery';
    if (recovery.fatigueScore > 70) return 'reduced_volume';
    return 'reduced_intensity';
  }

  private calculateDeloadDuration(urgency: string, indicatorCount: number): number {
    if (urgency === 'high') return 7;
    if (urgency === 'medium') return 5;
    return 3;
  }

  private getDeloadActivities(type: string): string[] {
    const activities: Record<string, string[]> = {
      complete_rest: ['Complete rest', 'Light stretching', 'Meditation'],
      active_recovery: ['Walking', 'Yoga', 'Swimming', 'Foam rolling'],
      reduced_volume: ['50% normal volume', 'Focus on technique', 'Mobility work'],
      reduced_intensity: ['Lower weights', 'Higher reps', 'Longer rest periods']
    };
    return activities[type] || [];
  }

  private getDeloadBenefits(type: string): string[] {
    return [
      'Improved recovery',
      'Reduced fatigue',
      'Better sleep quality',
      'Enhanced motivation',
      'Stronger comeback'
    ];
  }
}

// Export singleton instance
export const recoveryTracker = RecoveryTracker.getInstance();