/**
 * ProgressPredictor - AI-powered progress prediction models
 * Maps to PRD: AI-Powered Predictions
 */

export interface PredictionInput {
  userId: string;
  historicalData: HistoricalData;
  currentMetrics: CurrentMetrics;
  goals: UserGoals;
  contextFactors?: ContextFactors;
}

export interface HistoricalData {
  workouts: WorkoutHistory[];
  nutrition: NutritionHistory[];
  bodyMetrics: BodyMetricHistory[];
  adherenceRate: number; // 0-1
  streakHistory: number[];
}

export interface WorkoutHistory {
  date: Date;
  type: 'strength' | 'cardio' | 'flexibility' | 'sport';
  duration: number;
  volume?: number;
  intensity?: number;
  exercises?: Array<{
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }>;
}

export interface NutritionHistory {
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  adherenceToGoal: number; // 0-1
}

export interface BodyMetricHistory {
  date: Date;
  weight: number;
  bodyFatPercentage?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
}

export interface CurrentMetrics {
  weight: number;
  bodyFatPercentage?: number;
  currentStrengthLevels: StrengthLevels;
  averageCaloriesDaily: number;
  averageProteinDaily: number;
  workoutFrequency: number; // per week
  consistencyScore: number; // 0-100
}

export interface StrengthLevels {
  bench?: number;
  squat?: number;
  deadlift?: number;
  overheadPress?: number;
  [exercise: string]: number | undefined;
}

export interface UserGoals {
  type: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'maintenance';
  targetWeight?: number;
  targetBodyFat?: number;
  targetDate?: Date;
  strengthGoals?: StrengthLevels;
  specificGoals?: string[];
}

export interface ContextFactors {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  injuries?: string[];
  lifestyle?: 'busy' | 'moderate' | 'flexible';
  sleepQuality?: number; // 1-10
  stressLevel?: number; // 1-10
}

export interface PredictionResult {
  weightPrediction: WeightPrediction;
  strengthPrediction: StrengthPrediction;
  goalAchievement: GoalAchievementPrediction;
  plateauPrediction: PlateauPrediction;
  milestones: MilestonePrediction[];
  recommendations: string[];
  confidence: number; // 0-1
}

export interface WeightPrediction {
  predictedWeight: Array<{ date: Date; weight: number; confidence: number }>;
  expectedWeightIn30Days: number;
  expectedWeightIn90Days: number;
  rateOfChange: number; // kg per week
  confidenceInterval: { lower: number; upper: number };
}

export interface StrengthPrediction {
  predictedStrength: Map<string, Array<{ date: Date; weight: number }>>;
  expectedGainsIn30Days: StrengthLevels;
  expectedGainsIn90Days: StrengthLevels;
  progressionRate: Map<string, number>; // percentage per month
}

export interface GoalAchievementPrediction {
  estimatedAchievementDate: Date | null;
  probabilityOfSuccess: number; // 0-1
  currentTrajectory: 'on_track' | 'ahead' | 'behind' | 'off_track';
  adjustmentsNeeded: string[];
  alternativeTimeline?: Date;
}

export interface PlateauPrediction {
  plateauRisk: 'low' | 'medium' | 'high';
  estimatedPlateauDate?: Date;
  plateauFactors: string[];
  preventionStrategies: string[];
}

export interface MilestonePrediction {
  milestone: string;
  predictedDate: Date;
  confidence: number;
  requirements: string[];
}

export class ProgressPredictor {
  private static instance: ProgressPredictor;

  private constructor() {}

  static getInstance(): ProgressPredictor {
    if (!ProgressPredictor.instance) {
      ProgressPredictor.instance = new ProgressPredictor();
    }
    return ProgressPredictor.instance;
  }

  /**
   * Generate comprehensive progress predictions
   */
  async generatePredictions(input: PredictionInput): Promise<PredictionResult> {
    const weightPrediction = this.predictWeight(input);
    const strengthPrediction = this.predictStrength(input);
    const goalAchievement = this.predictGoalAchievement(input);
    const plateauPrediction = this.predictPlateau(input);
    const milestones = this.predictMilestones(input);
    const recommendations = this.generateRecommendations(input, {
      weightPrediction,
      strengthPrediction,
      goalAchievement,
      plateauPrediction
    });

    const confidence = this.calculateConfidence(input);

    return {
      weightPrediction,
      strengthPrediction,
      goalAchievement,
      plateauPrediction,
      milestones,
      recommendations,
      confidence
    };
  }

  /**
   * Predict weight changes
   */
  private predictWeight(input: PredictionInput): WeightPrediction {
    const { historicalData, currentMetrics, goals } = input;
    
    // Calculate historical rate of change
    const weightHistory = historicalData.bodyMetrics
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const rateOfChange = this.calculateWeightTrend(weightHistory);
    
    // Apply adjustments based on adherence and consistency
    const adjustedRate = rateOfChange * 
      (historicalData.adherenceRate * 0.5 + currentMetrics.consistencyScore / 100 * 0.5);
    
    // Generate predictions
    const predictions: Array<{ date: Date; weight: number; confidence: number }> = [];
    let currentWeight = currentMetrics.weight;
    
    for (let days = 7; days <= 180; days += 7) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      
      // Apply logarithmic decay for long-term predictions
      const decayFactor = Math.log(days + 1) / Math.log(180);
      const weeklyChange = adjustedRate * (1 - decayFactor * 0.3);
      
      currentWeight += weeklyChange;
      
      // Calculate confidence based on time distance
      const confidence = Math.max(0.3, 1 - (days / 180) * 0.5);
      
      predictions.push({ date, weight: currentWeight, confidence });
    }
    
    // Calculate specific timepoints
    const expectedWeightIn30Days = predictions.find(p => 
      Math.abs(p.date.getTime() - new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime()) < 7 * 24 * 60 * 60 * 1000
    )?.weight || currentMetrics.weight;
    
    const expectedWeightIn90Days = predictions.find(p => 
      Math.abs(p.date.getTime() - new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).getTime()) < 7 * 24 * 60 * 60 * 1000
    )?.weight || currentMetrics.weight;
    
    // Calculate confidence interval
    const stdDev = this.calculateStandardDeviation(weightHistory.map(w => w.weight));
    const confidenceInterval = {
      lower: expectedWeightIn90Days - (stdDev * 1.96),
      upper: expectedWeightIn90Days + (stdDev * 1.96)
    };
    
    return {
      predictedWeight: predictions,
      expectedWeightIn30Days,
      expectedWeightIn90Days,
      rateOfChange: adjustedRate,
      confidenceInterval
    };
  }

  /**
   * Predict strength progression
   */
  private predictStrength(input: PredictionInput): StrengthPrediction {
    const { historicalData, currentMetrics } = input;
    const predictedStrength = new Map<string, Array<{ date: Date; weight: number }>>();
    const expectedGainsIn30Days: StrengthLevels = {};
    const expectedGainsIn90Days: StrengthLevels = {};
    const progressionRate = new Map<string, number>();
    
    // Analyze each lift
    Object.entries(currentMetrics.currentStrengthLevels).forEach(([exercise, currentWeight]) => {
      if (currentWeight === undefined) return;
      
      // Get historical progression for this exercise
      const exerciseHistory = this.extractExerciseHistory(historicalData.workouts, exercise);
      const monthlyProgressionRate = this.calculateProgressionRate(exerciseHistory, currentWeight);
      
      // Apply experience-based adjustments
      const experienceMultiplier = this.getExperienceMultiplier(input.contextFactors?.experience);
      const adjustedRate = monthlyProgressionRate * experienceMultiplier;
      
      progressionRate.set(exercise, adjustedRate);
      
      // Generate predictions
      const predictions: Array<{ date: Date; weight: number }> = [];
      let predictedWeight = currentWeight;
      
      for (let month = 1; month <= 6; month++) {
        const date = new Date();
        date.setMonth(date.getMonth() + month);
        
        // Apply diminishing returns
        const diminishingFactor = 1 / (1 + month * 0.1);
        predictedWeight *= 1 + (adjustedRate * diminishingFactor / 100);
        
        predictions.push({ date, weight: predictedWeight });
      }
      
      predictedStrength.set(exercise, predictions);
      expectedGainsIn30Days[exercise] = predictions[0]?.weight || currentWeight;
      expectedGainsIn90Days[exercise] = predictions[2]?.weight || currentWeight;
    });
    
    return {
      predictedStrength,
      expectedGainsIn30Days,
      expectedGainsIn90Days,
      progressionRate
    };
  }

  /**
   * Predict goal achievement
   */
  private predictGoalAchievement(input: PredictionInput): GoalAchievementPrediction {
    const { currentMetrics, goals, historicalData } = input;
    
    if (!goals.targetWeight && !goals.targetBodyFat && !goals.strengthGoals) {
      return {
        estimatedAchievementDate: null,
        probabilityOfSuccess: 0,
        currentTrajectory: 'off_track',
        adjustmentsNeeded: ['No specific goals set']
      };
    }
    
    // Calculate trajectory for weight goal
    let estimatedDate: Date | null = null;
    let probabilityOfSuccess = 0;
    let currentTrajectory: 'on_track' | 'ahead' | 'behind' | 'off_track' = 'on_track';
    const adjustmentsNeeded: string[] = [];
    
    if (goals.targetWeight) {
      const weightDifference = goals.targetWeight - currentMetrics.weight;
      const weeklyRate = this.calculateWeightTrend(historicalData.bodyMetrics);
      
      if (Math.abs(weeklyRate) > 0.01) {
        const weeksNeeded = Math.abs(weightDifference / weeklyRate);
        estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + weeksNeeded * 7);
        
        // Calculate probability based on consistency and adherence
        probabilityOfSuccess = Math.min(0.95, 
          historicalData.adherenceRate * 0.4 + 
          (currentMetrics.consistencyScore / 100) * 0.4 +
          0.2 // Base probability
        );
        
        // Determine trajectory
        if (goals.targetDate) {
          const targetTime = goals.targetDate.getTime() - Date.now();
          const estimatedTime = estimatedDate.getTime() - Date.now();
          
          if (estimatedTime < targetTime * 0.8) {
            currentTrajectory = 'ahead';
          } else if (estimatedTime < targetTime * 1.2) {
            currentTrajectory = 'on_track';
          } else if (estimatedTime < targetTime * 1.5) {
            currentTrajectory = 'behind';
            adjustmentsNeeded.push('Increase workout frequency');
            adjustmentsNeeded.push('Improve dietary adherence');
          } else {
            currentTrajectory = 'off_track';
            adjustmentsNeeded.push('Significant changes needed to meet goal');
            adjustmentsNeeded.push('Consider adjusting target date');
          }
        }
      } else {
        currentTrajectory = 'off_track';
        adjustmentsNeeded.push('No progress detected - review your approach');
      }
    }
    
    // Add specific adjustments based on goal type
    if (goals.type === 'weight_loss' && weeklyRate > -0.5) {
      adjustmentsNeeded.push('Increase caloric deficit by 200-300 calories');
      adjustmentsNeeded.push('Add 2-3 cardio sessions per week');
    } else if (goals.type === 'muscle_gain' && weeklyRate < 0.1) {
      adjustmentsNeeded.push('Increase protein intake to 2g per kg body weight');
      adjustmentsNeeded.push('Ensure progressive overload in training');
    }
    
    return {
      estimatedAchievementDate: estimatedDate,
      probabilityOfSuccess,
      currentTrajectory,
      adjustmentsNeeded,
      alternativeTimeline: this.calculateAlternativeTimeline(estimatedDate, probabilityOfSuccess)
    };
  }

  /**
   * Predict plateau risk
   */
  private predictPlateau(input: PredictionInput): PlateauPrediction {
    const { historicalData, currentMetrics } = input;
    
    // Analyze recent progress trends
    const recentWeights = historicalData.bodyMetrics
      .slice(-8)
      .map(m => m.weight);
    
    const recentVariance = this.calculateVariance(recentWeights);
    const recentTrend = this.calculateWeightTrend(historicalData.bodyMetrics.slice(-8));
    
    // Analyze workout volume trends
    const recentVolumes = historicalData.workouts
      .slice(-10)
      .map(w => w.volume || 0);
    
    const volumeVariance = this.calculateVariance(recentVolumes);
    
    // Determine plateau risk
    let plateauRisk: 'low' | 'medium' | 'high' = 'low';
    const plateauFactors: string[] = [];
    const preventionStrategies: string[] = [];
    
    // Check for weight plateau indicators
    if (recentVariance < 0.5 && Math.abs(recentTrend) < 0.1) {
      plateauRisk = 'high';
      plateauFactors.push('Weight has been stable for 2+ weeks');
      preventionStrategies.push('Implement refeed days or diet breaks');
    }
    
    // Check for strength plateau indicators
    if (volumeVariance < 100) {
      plateauRisk = plateauRisk === 'high' ? 'high' : 'medium';
      plateauFactors.push('Training volume has been consistent');
      preventionStrategies.push('Vary training intensity and volume');
    }
    
    // Check for adaptation indicators
    const workoutFrequency = historicalData.workouts.length / 30;
    if (workoutFrequency > 5) {
      plateauFactors.push('High training frequency may lead to overtraining');
      preventionStrategies.push('Schedule deload week');
    }
    
    // Estimate plateau date if risk is medium or high
    let estimatedPlateauDate: Date | undefined;
    if (plateauRisk !== 'low') {
      estimatedPlateauDate = new Date();
      estimatedPlateauDate.setDate(estimatedPlateauDate.getDate() + (plateauRisk === 'high' ? 14 : 28));
    }
    
    // Add general prevention strategies
    preventionStrategies.push('Change exercise selection every 4-6 weeks');
    preventionStrategies.push('Ensure adequate protein and sleep');
    preventionStrategies.push('Track non-scale victories');
    
    return {
      plateauRisk,
      estimatedPlateauDate,
      plateauFactors,
      preventionStrategies
    };
  }

  /**
   * Predict milestone achievements
   */
  private predictMilestones(input: PredictionInput): MilestonePrediction[] {
    const milestones: MilestonePrediction[] = [];
    const { currentMetrics, historicalData } = input;
    
    // Weight milestones
    const weightRate = this.calculateWeightTrend(historicalData.bodyMetrics);
    if (weightRate < 0) {
      // Weight loss milestones
      const milestoneWeights = [
        Math.floor(currentMetrics.weight / 5) * 5, // Next 5kg milestone
        Math.floor(currentMetrics.weight / 10) * 10, // Next 10kg milestone
      ];
      
      milestoneWeights.forEach(targetWeight => {
        if (targetWeight < currentMetrics.weight) {
          const weeksNeeded = (currentMetrics.weight - targetWeight) / Math.abs(weightRate);
          const date = new Date();
          date.setDate(date.getDate() + weeksNeeded * 7);
          
          milestones.push({
            milestone: `Reach ${targetWeight}kg`,
            predictedDate: date,
            confidence: Math.max(0.5, 1 - weeksNeeded / 52),
            requirements: [
              'Maintain current calorie deficit',
              'Continue workout routine',
              `Average ${Math.abs(weightRate).toFixed(2)}kg loss per week`
            ]
          });
        }
      });
    }
    
    // Strength milestones
    Object.entries(currentMetrics.currentStrengthLevels).forEach(([exercise, current]) => {
      if (!current) return;
      
      const nextMilestone = this.getNextStrengthMilestone(exercise, current);
      if (nextMilestone) {
        const progressionRate = this.calculateProgressionRate(
          this.extractExerciseHistory(historicalData.workouts, exercise),
          current
        );
        
        const monthsNeeded = Math.log(nextMilestone / current) / Math.log(1 + progressionRate / 100);
        const date = new Date();
        date.setMonth(date.getMonth() + monthsNeeded);
        
        milestones.push({
          milestone: `${exercise}: ${nextMilestone}kg`,
          predictedDate: date,
          confidence: Math.max(0.4, 1 - monthsNeeded / 12),
          requirements: [
            'Progressive overload',
            'Adequate protein intake',
            'Consistent training'
          ]
        });
      }
    });
    
    // Consistency milestones
    const currentStreak = historicalData.streakHistory[historicalData.streakHistory.length - 1] || 0;
    const streakMilestones = [30, 60, 90, 180, 365];
    
    streakMilestones.forEach(days => {
      if (days > currentStreak) {
        const date = new Date();
        date.setDate(date.getDate() + (days - currentStreak));
        
        milestones.push({
          milestone: `${days} day streak`,
          predictedDate: date,
          confidence: Math.max(0.3, historicalData.adherenceRate * 0.8),
          requirements: [
            'Daily logging',
            'Maintain motivation',
            'Build sustainable habits'
          ]
        });
      }
    });
    
    return milestones.sort((a, b) => a.predictedDate.getTime() - b.predictedDate.getTime());
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    input: PredictionInput,
    predictions: Partial<PredictionResult>
  ): string[] {
    const recommendations: string[] = [];
    const { currentMetrics, goals, historicalData } = input;
    
    // Weight-based recommendations
    if (predictions.weightPrediction) {
      if (goals.type === 'weight_loss' && predictions.weightPrediction.rateOfChange > -0.5) {
        recommendations.push('Increase caloric deficit by 200-300 calories for faster weight loss');
      } else if (goals.type === 'muscle_gain' && predictions.weightPrediction.rateOfChange < 0.1) {
        recommendations.push('Increase caloric surplus by 200-300 calories for muscle growth');
      }
    }
    
    // Plateau prevention
    if (predictions.plateauPrediction?.plateauRisk === 'high') {
      recommendations.push('Schedule a deload week to prevent plateau');
      recommendations.push('Consider changing your workout routine');
    }
    
    // Goal achievement
    if (predictions.goalAchievement?.currentTrajectory === 'behind') {
      recommendations.push('Increase workout frequency by 1-2 sessions per week');
      recommendations.push('Review and tighten nutrition tracking');
    }
    
    // Consistency improvements
    if (currentMetrics.consistencyScore < 70) {
      recommendations.push('Focus on building consistent habits before intensity');
      recommendations.push('Set smaller, daily goals to improve adherence');
    }
    
    // Experience-based recommendations
    if (input.contextFactors?.experience === 'beginner') {
      recommendations.push('Focus on form and technique over weight progression');
      recommendations.push('Allow adequate recovery between sessions');
    } else if (input.contextFactors?.experience === 'advanced') {
      recommendations.push('Consider periodization in your training');
      recommendations.push('Implement advanced techniques like drop sets or clusters');
    }
    
    return recommendations;
  }

  /**
   * Helper methods
   */
  private calculateWeightTrend(history: BodyMetricHistory[]): number {
    if (history.length < 2) return 0;
    
    const weeks = (history[history.length - 1].date.getTime() - history[0].date.getTime()) / (7 * 24 * 60 * 60 * 1000);
    const weightChange = history[history.length - 1].weight - history[0].weight;
    
    return weeks > 0 ? weightChange / weeks : 0;
  }

  private calculateProgressionRate(history: Array<{ weight: number; date: Date }>, current: number): number {
    if (history.length < 2) return 2; // Default 2% monthly for beginners
    
    const months = (Date.now() - history[0].date.getTime()) / (30 * 24 * 60 * 60 * 1000);
    const totalGain = current - history[0].weight;
    
    return months > 0 ? (totalGain / history[0].weight) * 100 / months : 2;
  }

  private extractExerciseHistory(workouts: WorkoutHistory[], exerciseName: string): Array<{ weight: number; date: Date }> {
    const history: Array<{ weight: number; date: Date }> = [];
    
    workouts.forEach(workout => {
      workout.exercises?.forEach(exercise => {
        if (exercise.name.toLowerCase().includes(exerciseName.toLowerCase())) {
          if (exercise.weight) {
            history.push({ weight: exercise.weight, date: workout.date });
          }
        }
      });
    });
    
    return history.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private getExperienceMultiplier(experience?: string): number {
    switch (experience) {
      case 'beginner': return 1.5;
      case 'intermediate': return 1.0;
      case 'advanced': return 0.5;
      case 'elite': return 0.25;
      default: return 1.0;
    }
  }

  private getNextStrengthMilestone(exercise: string, current: number): number | null {
    const milestones = [60, 80, 100, 120, 140, 160, 180, 200, 220, 250, 300];
    return milestones.find(m => m > current) || null;
  }

  private calculateAlternativeTimeline(estimated: Date | null, probability: number): Date | undefined {
    if (!estimated || probability > 0.7) return undefined;
    
    const alternative = new Date(estimated);
    alternative.setDate(alternative.getDate() + 30 * (1 - probability));
    return alternative;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[]): number {
    return Math.sqrt(this.calculateVariance(values));
  }

  private calculateConfidence(input: PredictionInput): number {
    const dataPoints = 
      input.historicalData.workouts.length * 0.3 +
      input.historicalData.nutrition.length * 0.3 +
      input.historicalData.bodyMetrics.length * 0.4;
    
    const dataConfidence = Math.min(1, dataPoints / 100);
    const consistencyConfidence = input.currentMetrics.consistencyScore / 100;
    const adherenceConfidence = input.historicalData.adherenceRate;
    
    return (dataConfidence * 0.4 + consistencyConfidence * 0.3 + adherenceConfidence * 0.3);
  }
}

// Export singleton instance
export const progressPredictor = ProgressPredictor.getInstance();