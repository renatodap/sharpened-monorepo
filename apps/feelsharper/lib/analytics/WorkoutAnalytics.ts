/**
 * WorkoutAnalytics - Advanced workout performance analysis
 * Maps to PRD: Advanced Analytics & Performance Insights
 */

export interface ExerciseMetrics {
  exerciseName: string;
  totalVolume: number; // sets × reps × weight
  totalSets: number;
  totalReps: number;
  averageWeight: number;
  maxWeight: number;
  oneRepMax: number; // Calculated using Epley formula
  volumeProgression: number; // % change over time
  strengthProgression: number; // % change in 1RM
  frequencyPerWeek: number;
  lastPerformed: Date;
  personalBests: PersonalBest[];
  muscleGroups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  plateauRisk: number; // 0-100%
}

export interface PersonalBest {
  type: 'weight' | 'reps' | 'volume' | 'duration';
  value: number;
  date: Date;
  workoutId: string;
  previousBest?: number;
  improvement: number;
}

export interface WorkoutMetrics {
  workoutId: string;
  date: Date;
  duration: number;
  totalVolume: number;
  exerciseCount: number;
  intensityScore: number; // 0-100 based on RPE and %1RM
  fatigueScore: number; // 0-100 based on performance drop
  muscleGroupDistribution: Map<string, number>;
  workoutType: 'strength' | 'hypertrophy' | 'endurance' | 'power';
  efficiency: number; // volume per minute
  restTimeRatio: number; // rest time vs work time
  compoundToIsolationRatio: number;
}

export interface ProgressionAnalysis {
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  volumeChange: number; // %
  strengthChange: number; // %
  frequencyChange: number; // %
  consistencyScore: number; // 0-100%
  trendDirection: 'improving' | 'plateauing' | 'declining';
  peakPerformanceDate: Date;
  currentPhase: 'accumulation' | 'intensification' | 'realization' | 'deload';
  recommendedAdjustments: string[];
}

export interface MuscleGroupAnalysis {
  muscleGroup: string;
  weeklyVolume: number;
  volumeProgression: number;
  strengthProgression: number;
  recoveryStatus: 'recovered' | 'fatigued' | 'overtrained';
  imbalanceRisk: number; // 0-100%
  recommendedVolume: number;
  exercises: string[];
  lastTrained: Date;
}

export interface PerformanceInsight {
  type: 'strength_gain' | 'plateau_detected' | 'imbalance_warning' | 'peak_performance' | 'recovery_needed';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  dataPoints: any[];
  confidence: number; // 0-100%
  actionable: boolean;
  timeframe: string;
}

export class WorkoutAnalytics {
  private static instance: WorkoutAnalytics;

  private constructor() {}

  static getInstance(): WorkoutAnalytics {
    if (!WorkoutAnalytics.instance) {
      WorkoutAnalytics.instance = new WorkoutAnalytics();
    }
    return WorkoutAnalytics.instance;
  }

  /**
   * Analyze all exercises for comprehensive metrics
   */
  async analyzeExercises(userId: string, timeframe?: { start: Date; end: Date }): Promise<ExerciseMetrics[]> {
    const workouts = await this.getWorkouts(userId, timeframe);
    const exerciseMap = new Map<string, any[]>();

    // Group by exercise
    workouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        const key = exercise.name.toLowerCase();
        if (!exerciseMap.has(key)) {
          exerciseMap.set(key, []);
        }
        exerciseMap.get(key)!.push({
          ...exercise,
          date: workout.date,
          workoutId: workout.id
        });
      });
    });

    const metrics: ExerciseMetrics[] = [];

    for (const [exerciseName, exerciseHistory] of exerciseMap) {
      const metric = await this.calculateExerciseMetrics(exerciseName, exerciseHistory);
      metrics.push(metric);
    }

    return metrics.sort((a, b) => b.totalVolume - a.totalVolume);
  }

  /**
   * Calculate comprehensive exercise metrics
   */
  private async calculateExerciseMetrics(exerciseName: string, history: any[]): Promise<ExerciseMetrics> {
    const sortedHistory = history.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Calculate totals
    const totalVolume = sortedHistory.reduce((sum, ex) => 
      sum + (ex.sets * ex.reps * (ex.weight || 0)), 0);
    const totalSets = sortedHistory.reduce((sum, ex) => sum + ex.sets, 0);
    const totalReps = sortedHistory.reduce((sum, ex) => sum + (ex.sets * ex.reps), 0);
    
    // Weight analysis
    const weights = sortedHistory.map(ex => ex.weight).filter(w => w > 0);
    const averageWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
    const maxWeight = Math.max(...weights, 0);
    
    // One Rep Max calculation (Epley formula: weight × (1 + reps/30))
    const oneRepMax = sortedHistory.reduce((max, ex) => {
      if (ex.weight && ex.reps) {
        const estimated1RM = ex.weight * (1 + ex.reps / 30);
        return Math.max(max, estimated1RM);
      }
      return max;
    }, 0);

    // Progression analysis
    const volumeProgression = this.calculateProgression(
      sortedHistory.map(ex => ex.sets * ex.reps * (ex.weight || 0))
    );
    const strengthProgression = this.calculateProgression(weights);

    // Frequency analysis
    const uniqueDates = new Set(sortedHistory.map(ex => ex.date.toDateString()));
    const weeks = (Date.now() - sortedHistory[0].date.getTime()) / (7 * 24 * 60 * 60 * 1000);
    const frequencyPerWeek = uniqueDates.size / Math.max(weeks, 1);

    // Personal bests
    const personalBests = this.findPersonalBests(sortedHistory);

    // Muscle groups
    const muscleGroups = this.getMuscleGroups(exerciseName);

    // Difficulty assessment
    const difficulty = this.assessDifficulty(exerciseName, oneRepMax, totalVolume);

    // Plateau risk
    const plateauRisk = this.calculatePlateauRisk(sortedHistory);

    return {
      exerciseName,
      totalVolume,
      totalSets,
      totalReps,
      averageWeight,
      maxWeight,
      oneRepMax,
      volumeProgression,
      strengthProgression,
      frequencyPerWeek,
      lastPerformed: sortedHistory[sortedHistory.length - 1].date,
      personalBests,
      muscleGroups,
      difficulty,
      plateauRisk
    };
  }

  /**
   * Analyze workout performance metrics
   */
  async analyzeWorkouts(userId: string, timeframe?: { start: Date; end: Date }): Promise<WorkoutMetrics[]> {
    const workouts = await this.getWorkouts(userId, timeframe);
    
    return workouts.map(workout => {
      const totalVolume = workout.exercises?.reduce((sum, ex) => 
        sum + (ex.sets * ex.reps * (ex.weight || 0)), 0) || 0;
      
      const exerciseCount = workout.exercises?.length || 0;
      const duration = workout.duration || 0;
      
      // Intensity score based on %1RM and RPE
      const intensityScore = this.calculateIntensityScore(workout);
      
      // Fatigue score based on performance drop within workout
      const fatigueScore = this.calculateFatigueScore(workout);
      
      // Muscle group distribution
      const muscleGroupDistribution = this.analyzeMuscleGroupDistribution(workout);
      
      // Workout type classification
      const workoutType = this.classifyWorkoutType(workout);
      
      // Efficiency metrics
      const efficiency = duration > 0 ? totalVolume / duration : 0;
      const restTimeRatio = this.calculateRestTimeRatio(workout);
      const compoundToIsolationRatio = this.calculateCompoundRatio(workout);

      return {
        workoutId: workout.id,
        date: workout.date,
        duration,
        totalVolume,
        exerciseCount,
        intensityScore,
        fatigueScore,
        muscleGroupDistribution,
        workoutType,
        efficiency,
        restTimeRatio,
        compoundToIsolationRatio
      };
    });
  }

  /**
   * Generate progression analysis
   */
  async analyzeProgression(userId: string, timeframe: 'week' | 'month' | 'quarter' | 'year'): Promise<ProgressionAnalysis> {
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
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const workouts = await this.getWorkouts(userId, { start: startDate, end: endDate });
    const workoutMetrics = await this.analyzeWorkouts(userId, { start: startDate, end: endDate });
    
    // Volume progression
    const volumes = workoutMetrics.map(w => w.totalVolume);
    const volumeChange = this.calculateProgression(volumes);
    
    // Strength progression (average 1RM across exercises)
    const exercises = await this.analyzeExercises(userId, { start: startDate, end: endDate });
    const strengthChange = exercises.reduce((sum, ex) => sum + ex.strengthProgression, 0) / exercises.length;
    
    // Frequency analysis
    const expectedWorkouts = this.getExpectedWorkouts(timeframe);
    const actualWorkouts = workouts.length;
    const frequencyChange = (actualWorkouts / expectedWorkouts) * 100;
    
    // Consistency score
    const consistencyScore = this.calculateConsistencyScore(workouts, timeframe);
    
    // Trend analysis
    const trendDirection = this.analyzeTrend(workoutMetrics);
    
    // Peak performance
    const peakPerformanceDate = this.findPeakPerformance(workoutMetrics);
    
    // Training phase
    const currentPhase = this.identifyTrainingPhase(workoutMetrics);
    
    // Recommendations
    const recommendedAdjustments = this.generateProgressionRecommendations(
      volumeChange, strengthChange, frequencyChange, consistencyScore, trendDirection
    );

    return {
      timeframe,
      volumeChange,
      strengthChange,
      frequencyChange,
      consistencyScore,
      trendDirection,
      peakPerformanceDate,
      currentPhase,
      recommendedAdjustments
    };
  }

  /**
   * Analyze muscle group balance
   */
  async analyzeMuscleGroups(userId: string): Promise<MuscleGroupAnalysis[]> {
    const exercises = await this.analyzeExercises(userId);
    const muscleGroupMap = new Map<string, ExerciseMetrics[]>();

    // Group exercises by muscle group
    exercises.forEach(exercise => {
      exercise.muscleGroups.forEach(muscle => {
        if (!muscleGroupMap.has(muscle)) {
          muscleGroupMap.set(muscle, []);
        }
        muscleGroupMap.get(muscle)!.push(exercise);
      });
    });

    const analyses: MuscleGroupAnalysis[] = [];

    for (const [muscleGroup, muscleExercises] of muscleGroupMap) {
      const weeklyVolume = muscleExercises.reduce((sum, ex) => sum + ex.totalVolume, 0) / 4; // Assuming 4 weeks
      const volumeProgression = muscleExercises.reduce((sum, ex) => sum + ex.volumeProgression, 0) / muscleExercises.length;
      const strengthProgression = muscleExercises.reduce((sum, ex) => sum + ex.strengthProgression, 0) / muscleExercises.length;
      
      const recoveryStatus = this.assessRecoveryStatus(muscleExercises);
      const imbalanceRisk = this.calculateImbalanceRisk(muscleGroup, muscleGroupMap);
      const recommendedVolume = this.getRecommendedVolume(muscleGroup);
      
      const exerciseNames = muscleExercises.map(ex => ex.exerciseName);
      const lastTrained = new Date(Math.max(...muscleExercises.map(ex => ex.lastPerformed.getTime())));

      analyses.push({
        muscleGroup,
        weeklyVolume,
        volumeProgression,
        strengthProgression,
        recoveryStatus,
        imbalanceRisk,
        recommendedVolume,
        exercises: exerciseNames,
        lastTrained
      });
    }

    return analyses.sort((a, b) => b.weeklyVolume - a.weeklyVolume);
  }

  /**
   * Generate performance insights
   */
  async generateInsights(userId: string): Promise<PerformanceInsight[]> {
    const insights: PerformanceInsight[] = [];
    
    const exercises = await this.analyzeExercises(userId);
    const progression = await this.analyzeProgression(userId, 'month');
    const muscleGroups = await this.analyzeMuscleGroups(userId);

    // Strength gain insights
    const strongestProgressions = exercises
      .filter(ex => ex.strengthProgression > 5)
      .sort((a, b) => b.strengthProgression - a.strengthProgression)
      .slice(0, 3);

    strongestProgressions.forEach(exercise => {
      insights.push({
        type: 'strength_gain',
        severity: 'low',
        title: `Excellent Progress in ${exercise.exerciseName}`,
        description: `You've improved ${exercise.strengthProgression.toFixed(1)}% in strength over the past month`,
        recommendation: 'Keep up the current progression scheme and consider increasing volume',
        dataPoints: [exercise],
        confidence: 85,
        actionable: true,
        timeframe: 'Past month'
      });
    });

    // Plateau detection
    const plateauedExercises = exercises.filter(ex => ex.plateauRisk > 70);
    plateauedExercises.forEach(exercise => {
      insights.push({
        type: 'plateau_detected',
        severity: 'medium',
        title: `Plateau Detected: ${exercise.exerciseName}`,
        description: `No significant progress in the last 3 weeks. Consider changing your approach.`,
        recommendation: 'Try deload week, change rep ranges, or modify exercise variation',
        dataPoints: [exercise],
        confidence: 78,
        actionable: true,
        timeframe: 'Past 3 weeks'
      });
    });

    // Muscle imbalance warnings
    const imbalancedGroups = muscleGroups.filter(mg => mg.imbalanceRisk > 60);
    imbalancedGroups.forEach(group => {
      insights.push({
        type: 'imbalance_warning',
        severity: 'medium',
        title: `Muscle Imbalance Risk: ${group.muscleGroup}`,
        description: `${group.muscleGroup} shows signs of under-development relative to other muscle groups`,
        recommendation: `Increase ${group.muscleGroup} training volume by 20-30%`,
        dataPoints: [group],
        confidence: 72,
        actionable: true,
        timeframe: 'Current'
      });
    });

    // Peak performance insights
    if (progression.trendDirection === 'improving') {
      insights.push({
        type: 'peak_performance',
        severity: 'low',
        title: 'Peak Performance Phase',
        description: 'You\'re currently in your best form with consistent improvements',
        recommendation: 'Continue current program for 2-3 more weeks before changing',
        dataPoints: [progression],
        confidence: 82,
        actionable: true,
        timeframe: 'Current'
      });
    }

    // Recovery needs
    const overtrainedGroups = muscleGroups.filter(mg => mg.recoveryStatus === 'overtrained');
    if (overtrainedGroups.length > 0) {
      insights.push({
        type: 'recovery_needed',
        severity: 'high',
        title: 'Recovery Required',
        description: `${overtrainedGroups.length} muscle groups showing signs of overtraining`,
        recommendation: 'Take 3-5 days complete rest or switch to light active recovery',
        dataPoints: overtrainedGroups,
        confidence: 89,
        actionable: true,
        timeframe: 'Immediate'
      });
    }

    return insights.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Helper methods
   */
  private async getWorkouts(userId: string, timeframe?: { start: Date; end: Date }): Promise<any[]> {
    // Mock data - replace with actual Supabase query
    const mockWorkouts = [
      {
        id: '1',
        date: new Date('2024-01-15'),
        duration: 3600,
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8, weight: 100 },
          { name: 'Squat', sets: 4, reps: 6, weight: 140 },
          { name: 'Deadlift', sets: 3, reps: 5, weight: 160 }
        ]
      }
    ];
    return mockWorkouts;
  }

  private calculateProgression(values: number[]): number {
    if (values.length < 2) return 0;
    const first = values.slice(0, Math.ceil(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    const secondAvg = second.reduce((a, b) => a + b, 0) / second.length;
    
    return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  }

  private findPersonalBests(history: any[]): PersonalBest[] {
    const bests: PersonalBest[] = [];
    let maxWeight = 0;
    let maxReps = 0;
    let maxVolume = 0;

    history.forEach(entry => {
      const volume = entry.sets * entry.reps * (entry.weight || 0);
      
      if (entry.weight > maxWeight) {
        bests.push({
          type: 'weight',
          value: entry.weight,
          date: entry.date,
          workoutId: entry.workoutId,
          previousBest: maxWeight,
          improvement: entry.weight - maxWeight
        });
        maxWeight = entry.weight;
      }
      
      if (entry.reps > maxReps) {
        bests.push({
          type: 'reps',
          value: entry.reps,
          date: entry.date,
          workoutId: entry.workoutId,
          previousBest: maxReps,
          improvement: entry.reps - maxReps
        });
        maxReps = entry.reps;
      }
      
      if (volume > maxVolume) {
        bests.push({
          type: 'volume',
          value: volume,
          date: entry.date,
          workoutId: entry.workoutId,
          previousBest: maxVolume,
          improvement: volume - maxVolume
        });
        maxVolume = volume;
      }
    });

    return bests.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private getMuscleGroups(exerciseName: string): string[] {
    const muscleMap: Record<string, string[]> = {
      'bench press': ['chest', 'triceps', 'shoulders'],
      'squat': ['quadriceps', 'glutes', 'hamstrings'],
      'deadlift': ['hamstrings', 'glutes', 'back', 'traps'],
      'pull up': ['back', 'biceps'],
      'overhead press': ['shoulders', 'triceps', 'core'],
      'row': ['back', 'biceps'],
      'curl': ['biceps'],
      'tricep extension': ['triceps']
    };

    const key = exerciseName.toLowerCase();
    for (const [exercise, muscles] of Object.entries(muscleMap)) {
      if (key.includes(exercise)) {
        return muscles;
      }
    }
    return ['unknown'];
  }

  private assessDifficulty(exerciseName: string, oneRepMax: number, totalVolume: number): 'beginner' | 'intermediate' | 'advanced' {
    // Simplified assessment based on compound movement standards
    const standards: Record<string, { beginner: number; intermediate: number; advanced: number }> = {
      'bench press': { beginner: 70, intermediate: 100, advanced: 140 },
      'squat': { beginner: 100, intermediate: 140, advanced: 180 },
      'deadlift': { beginner: 120, intermediate: 160, advanced: 200 }
    };

    const key = exerciseName.toLowerCase();
    for (const [exercise, levels] of Object.entries(standards)) {
      if (key.includes(exercise)) {
        if (oneRepMax >= levels.advanced) return 'advanced';
        if (oneRepMax >= levels.intermediate) return 'intermediate';
        return 'beginner';
      }
    }
    return 'beginner';
  }

  private calculatePlateauRisk(history: any[]): number {
    if (history.length < 4) return 0;
    
    const recent = history.slice(-4);
    const weights = recent.map(h => h.weight).filter(w => w > 0);
    
    if (weights.length < 2) return 0;
    
    const variance = this.calculateVariance(weights);
    const trend = this.calculateProgression(weights);
    
    // High plateau risk if low variance and minimal progression
    if (variance < 2 && Math.abs(trend) < 2) {
      return 80;
    } else if (variance < 5 && Math.abs(trend) < 5) {
      return 50;
    }
    
    return 20;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private calculateIntensityScore(workout: any): number {
    // Simplified intensity calculation
    const exercises = workout.exercises || [];
    if (exercises.length === 0) return 0;
    
    const avgRPE = exercises.reduce((sum, ex) => sum + (ex.rpe || 7), 0) / exercises.length;
    return (avgRPE / 10) * 100;
  }

  private calculateFatigueScore(workout: any): number {
    // Simplified fatigue calculation based on performance drop
    const exercises = workout.exercises || [];
    if (exercises.length < 2) return 0;
    
    const firstHalf = exercises.slice(0, Math.ceil(exercises.length / 2));
    const secondHalf = exercises.slice(Math.floor(exercises.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, ex) => sum + (ex.weight || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, ex) => sum + (ex.weight || 0), 0) / secondHalf.length;
    
    const performanceDrop = firstHalfAvg > 0 ? ((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100 : 0;
    return Math.max(0, performanceDrop);
  }

  private analyzeMuscleGroupDistribution(workout: any): Map<string, number> {
    const distribution = new Map<string, number>();
    const exercises = workout.exercises || [];
    
    exercises.forEach(exercise => {
      const muscles = this.getMuscleGroups(exercise.name);
      muscles.forEach(muscle => {
        const currentVolume = distribution.get(muscle) || 0;
        const exerciseVolume = exercise.sets * exercise.reps * (exercise.weight || 0);
        distribution.set(muscle, currentVolume + exerciseVolume);
      });
    });
    
    return distribution;
  }

  private classifyWorkoutType(workout: any): 'strength' | 'hypertrophy' | 'endurance' | 'power' {
    const exercises = workout.exercises || [];
    if (exercises.length === 0) return 'strength';
    
    const avgReps = exercises.reduce((sum, ex) => sum + ex.reps, 0) / exercises.length;
    
    if (avgReps <= 5) return 'strength';
    if (avgReps <= 8) return 'power';
    if (avgReps <= 15) return 'hypertrophy';
    return 'endurance';
  }

  private calculateRestTimeRatio(workout: any): number {
    // Mock calculation - would need actual rest time data
    return 2.5; // Typical 2.5:1 rest to work ratio
  }

  private calculateCompoundRatio(workout: any): number {
    const exercises = workout.exercises || [];
    const compoundExercises = ['squat', 'deadlift', 'bench press', 'row', 'pull up', 'overhead press'];
    
    const compoundCount = exercises.filter(ex => 
      compoundExercises.some(compound => ex.name.toLowerCase().includes(compound))
    ).length;
    
    return exercises.length > 0 ? compoundCount / exercises.length : 0;
  }

  private getExpectedWorkouts(timeframe: string): number {
    const workoutsPerWeek = 4; // Assumption
    switch (timeframe) {
      case 'week': return workoutsPerWeek;
      case 'month': return workoutsPerWeek * 4;
      case 'quarter': return workoutsPerWeek * 12;
      case 'year': return workoutsPerWeek * 52;
      default: return workoutsPerWeek;
    }
  }

  private calculateConsistencyScore(workouts: any[], timeframe: string): number {
    const expectedWorkouts = this.getExpectedWorkouts(timeframe);
    const actualWorkouts = workouts.length;
    const frequency = Math.min(actualWorkouts / expectedWorkouts, 1);
    
    // Also consider distribution (not just total count)
    const timeSpan = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
    const dates = workouts.map(w => w.date);
    const distribution = this.calculateDistributionScore(dates, timeSpan);
    
    return (frequency * 0.7 + distribution * 0.3) * 100;
  }

  private calculateDistributionScore(dates: Date[], timeSpan: number): number {
    if (dates.length < 2) return dates.length > 0 ? 1 : 0;
    
    dates.sort((a, b) => a.getTime() - b.getTime());
    const gaps = [];
    
    for (let i = 1; i < dates.length; i++) {
      const gap = (dates[i].getTime() - dates[i-1].getTime()) / (24 * 60 * 60 * 1000);
      gaps.push(gap);
    }
    
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const expectedGap = timeSpan / dates.length;
    
    return Math.max(0, 1 - Math.abs(avgGap - expectedGap) / expectedGap);
  }

  private analyzeTrend(metrics: WorkoutMetrics[]): 'improving' | 'plateauing' | 'declining' {
    if (metrics.length < 3) return 'plateauing';
    
    const volumes = metrics.map(m => m.totalVolume);
    const trend = this.calculateProgression(volumes);
    
    if (trend > 5) return 'improving';
    if (trend < -5) return 'declining';
    return 'plateauing';
  }

  private findPeakPerformance(metrics: WorkoutMetrics[]): Date {
    if (metrics.length === 0) return new Date();
    
    const maxVolume = Math.max(...metrics.map(m => m.totalVolume));
    const peakWorkout = metrics.find(m => m.totalVolume === maxVolume);
    
    return peakWorkout?.date || new Date();
  }

  private identifyTrainingPhase(metrics: WorkoutMetrics[]): 'accumulation' | 'intensification' | 'realization' | 'deload' {
    if (metrics.length === 0) return 'accumulation';
    
    const recent = metrics.slice(-4);
    const avgVolume = recent.reduce((sum, m) => sum + m.totalVolume, 0) / recent.length;
    const avgIntensity = recent.reduce((sum, m) => sum + m.intensityScore, 0) / recent.length;
    
    if (avgVolume > 1000 && avgIntensity < 70) return 'accumulation';
    if (avgVolume < 800 && avgIntensity > 80) return 'intensification';
    if (avgVolume < 600) return 'deload';
    return 'realization';
  }

  private generateProgressionRecommendations(
    volumeChange: number,
    strengthChange: number,
    frequencyChange: number,
    consistencyScore: number,
    trendDirection: string
  ): string[] {
    const recommendations: string[] = [];
    
    if (volumeChange < -10) {
      recommendations.push('Increase training volume by 10-15%');
    }
    
    if (strengthChange < 2) {
      recommendations.push('Focus on progressive overload - add weight or reps each week');
    }
    
    if (frequencyChange < 80) {
      recommendations.push('Improve workout consistency - aim for scheduled training days');
    }
    
    if (consistencyScore < 70) {
      recommendations.push('Build better habits - set specific workout times and stick to them');
    }
    
    if (trendDirection === 'declining') {
      recommendations.push('Consider a deload week to allow for recovery and supercompensation');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Great progress! Continue with current programming');
    }
    
    return recommendations;
  }

  private assessRecoveryStatus(exercises: ExerciseMetrics[]): 'recovered' | 'fatigued' | 'overtrained' {
    const avgProgression = exercises.reduce((sum, ex) => sum + ex.strengthProgression, 0) / exercises.length;
    const avgPlateauRisk = exercises.reduce((sum, ex) => sum + ex.plateauRisk, 0) / exercises.length;
    
    if (avgProgression < -5 && avgPlateauRisk > 70) return 'overtrained';
    if (avgProgression < 2 && avgPlateauRisk > 50) return 'fatigued';
    return 'recovered';
  }

  private calculateImbalanceRisk(muscleGroup: string, allGroups: Map<string, ExerciseMetrics[]>): number {
    const groupVolume = allGroups.get(muscleGroup)?.reduce((sum, ex) => sum + ex.totalVolume, 0) || 0;
    const totalVolume = Array.from(allGroups.values()).flat().reduce((sum, ex) => sum + ex.totalVolume, 0);
    
    const proportion = totalVolume > 0 ? groupVolume / totalVolume : 0;
    const expectedProportion = 1 / allGroups.size; // Equal distribution
    
    const deviation = Math.abs(proportion - expectedProportion) / expectedProportion;
    return Math.min(100, deviation * 100);
  }

  private getRecommendedVolume(muscleGroup: string): number {
    const recommendations: Record<string, number> = {
      'chest': 12, // sets per week
      'back': 16,
      'shoulders': 12,
      'quadriceps': 14,
      'hamstrings': 10,
      'glutes': 12,
      'biceps': 8,
      'triceps': 10,
      'calves': 12,
      'core': 15
    };
    
    return recommendations[muscleGroup] || 10;
  }
}

// Export singleton instance
export const workoutAnalytics = WorkoutAnalytics.getInstance();