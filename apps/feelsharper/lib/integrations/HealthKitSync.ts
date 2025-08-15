/**
 * HealthKitSync - Apple HealthKit integration for iOS devices
 * Maps to PRD: Wearables Integration (Apple Health)
 */

export interface HealthKitPermissions {
  read: HealthDataType[];
  write: HealthDataType[];
}

export type HealthDataType = 
  | 'activeEnergyBurned'
  | 'stepCount'
  | 'distanceWalkingRunning'
  | 'flightsClimbed'
  | 'heartRate'
  | 'bodyMass'
  | 'bodyFatPercentage'
  | 'dietaryProtein'
  | 'dietaryCarbohydrates'
  | 'dietaryFat'
  | 'dietaryEnergyConsumed'
  | 'workout'
  | 'sleepAnalysis'
  | 'restingHeartRate'
  | 'vo2Max';

export interface HealthKitWorkout {
  id: string;
  activityType: string;
  startDate: Date;
  endDate: Date;
  duration: number; // seconds
  totalEnergyBurned?: number; // kcal
  totalDistance?: number; // meters
  averageHeartRate?: number; // bpm
  metadata?: Record<string, any>;
}

export interface HealthKitNutrition {
  date: Date;
  protein?: number; // grams
  carbohydrates?: number; // grams
  fat?: number; // grams
  calories?: number; // kcal
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
  water?: number; // ml
}

export interface HealthKitBodyMetrics {
  date: Date;
  weight?: number; // kg
  bodyFatPercentage?: number;
  leanBodyMass?: number; // kg
  bmi?: number;
}

export interface HealthKitActivitySummary {
  date: Date;
  activeEnergyBurned: number; // kcal
  activeEnergyBurnedGoal: number;
  moveMinutes: number;
  exerciseMinutes: number;
  standHours: number;
  stepCount: number;
  distance: number; // meters
  flightsClimbed: number;
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  errors?: string[];
  lastSyncDate: Date;
}

export class HealthKitSync {
  private static instance: HealthKitSync;
  private isAvailable: boolean = false;
  private healthKit: any = null; // Will be window.AppleHealthKit in Capacitor
  private lastSyncTime: Date | null = null;
  private syncInProgress: boolean = false;
  private permissions: HealthKitPermissions = {
    read: [],
    write: []
  };

  private constructor() {
    this.checkAvailability();
  }

  static getInstance(): HealthKitSync {
    if (!HealthKitSync.instance) {
      HealthKitSync.instance = new HealthKitSync();
    }
    return HealthKitSync.instance;
  }

  /**
   * Check if HealthKit is available
   */
  private checkAvailability(): void {
    // Check if running on iOS with Capacitor
    if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.cordova) {
      // Check for HealthKit plugin
      this.healthKit = (window as any).AppleHealthKit || (window as any).plugins?.healthkit;
      this.isAvailable = !!this.healthKit;
    } else {
      // For web/PWA, we'll use a mock or alternative
      this.isAvailable = false;
    }
  }

  /**
   * Request HealthKit permissions
   */
  async requestPermissions(permissions?: HealthKitPermissions): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('HealthKit not available on this device');
      return false;
    }

    const requestedPermissions = permissions || {
      read: [
        'activeEnergyBurned',
        'stepCount',
        'distanceWalkingRunning',
        'heartRate',
        'bodyMass',
        'bodyFatPercentage',
        'dietaryProtein',
        'dietaryCarbohydrates',
        'dietaryFat',
        'dietaryEnergyConsumed',
        'workout',
        'sleepAnalysis'
      ],
      write: [
        'activeEnergyBurned',
        'bodyMass',
        'bodyFatPercentage',
        'dietaryProtein',
        'dietaryCarbohydrates',
        'dietaryFat',
        'dietaryEnergyConsumed',
        'workout'
      ]
    };

    return new Promise((resolve) => {
      if (this.healthKit?.requestAuthorization) {
        this.healthKit.requestAuthorization(
          requestedPermissions,
          (success: boolean) => {
            if (success) {
              this.permissions = requestedPermissions;
              localStorage.setItem('healthKitPermissions', JSON.stringify(requestedPermissions));
            }
            resolve(success);
          },
          (error: any) => {
            console.error('HealthKit permission error:', error);
            resolve(false);
          }
        );
      } else {
        // Simulate for development
        this.permissions = requestedPermissions;
        resolve(true);
      }
    });
  }

  /**
   * Sync all data from HealthKit
   */
  async syncAll(startDate?: Date, endDate?: Date): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        itemsSynced: 0,
        errors: ['Sync already in progress']
      };
    }

    this.syncInProgress = true;
    const errors: string[] = [];
    let totalSynced = 0;

    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const end = endDate || new Date();

      // Sync workouts
      const workoutResult = await this.syncWorkouts(start, end);
      if (workoutResult.success) {
        totalSynced += workoutResult.itemsSynced;
      } else {
        errors.push(...(workoutResult.errors || []));
      }

      // Sync nutrition
      const nutritionResult = await this.syncNutrition(start, end);
      if (nutritionResult.success) {
        totalSynced += nutritionResult.itemsSynced;
      } else {
        errors.push(...(nutritionResult.errors || []));
      }

      // Sync body metrics
      const bodyResult = await this.syncBodyMetrics(start, end);
      if (bodyResult.success) {
        totalSynced += bodyResult.itemsSynced;
      } else {
        errors.push(...(bodyResult.errors || []));
      }

      // Sync activity
      const activityResult = await this.syncActivitySummary(start, end);
      if (activityResult.success) {
        totalSynced += activityResult.itemsSynced;
      } else {
        errors.push(...(activityResult.errors || []));
      }

      this.lastSyncTime = new Date();
      localStorage.setItem('healthKitLastSync', this.lastSyncTime.toISOString());

      return {
        success: errors.length === 0,
        itemsSynced: totalSynced,
        errors: errors.length > 0 ? errors : undefined,
        lastSyncDate: this.lastSyncTime
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync workout data
   */
  async syncWorkouts(startDate: Date, endDate: Date): Promise<SyncResult> {
    try {
      const workouts = await this.getWorkouts(startDate, endDate);
      
      // Convert and save to local database
      for (const workout of workouts) {
        await this.saveWorkoutToDatabase(workout);
      }

      return {
        success: true,
        itemsSynced: workouts.length,
        lastSyncDate: new Date()
      };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [`Failed to sync workouts: ${error}`],
        lastSyncDate: new Date()
      };
    }
  }

  /**
   * Sync nutrition data
   */
  async syncNutrition(startDate: Date, endDate: Date): Promise<SyncResult> {
    try {
      const nutritionData = await this.getNutritionData(startDate, endDate);
      
      // Convert and save to local database
      for (const nutrition of nutritionData) {
        await this.saveNutritionToDatabase(nutrition);
      }

      return {
        success: true,
        itemsSynced: nutritionData.length,
        lastSyncDate: new Date()
      };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [`Failed to sync nutrition: ${error}`],
        lastSyncDate: new Date()
      };
    }
  }

  /**
   * Sync body metrics
   */
  async syncBodyMetrics(startDate: Date, endDate: Date): Promise<SyncResult> {
    try {
      const bodyMetrics = await this.getBodyMetrics(startDate, endDate);
      
      // Convert and save to local database
      for (const metrics of bodyMetrics) {
        await this.saveBodyMetricsToDatabase(metrics);
      }

      return {
        success: true,
        itemsSynced: bodyMetrics.length,
        lastSyncDate: new Date()
      };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [`Failed to sync body metrics: ${error}`],
        lastSyncDate: new Date()
      };
    }
  }

  /**
   * Sync activity summary
   */
  async syncActivitySummary(startDate: Date, endDate: Date): Promise<SyncResult> {
    try {
      const activities = await this.getActivitySummaries(startDate, endDate);
      
      // Convert and save to local database
      for (const activity of activities) {
        await this.saveActivityToDatabase(activity);
      }

      return {
        success: true,
        itemsSynced: activities.length,
        lastSyncDate: new Date()
      };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [`Failed to sync activities: ${error}`],
        lastSyncDate: new Date()
      };
    }
  }

  /**
   * Get workouts from HealthKit
   */
  private async getWorkouts(startDate: Date, endDate: Date): Promise<HealthKitWorkout[]> {
    if (!this.isAvailable) return this.getMockWorkouts(startDate, endDate);

    return new Promise((resolve) => {
      this.healthKit.findWorkouts(
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        (workouts: any[]) => {
          resolve(workouts.map(w => this.mapWorkout(w)));
        },
        (error: any) => {
          console.error('Failed to get workouts:', error);
          resolve([]);
        }
      );
    });
  }

  /**
   * Get nutrition data from HealthKit
   */
  private async getNutritionData(startDate: Date, endDate: Date): Promise<HealthKitNutrition[]> {
    if (!this.isAvailable) return this.getMockNutrition(startDate, endDate);

    const nutritionTypes = [
      'dietaryProtein',
      'dietaryCarbohydrates',
      'dietaryFat',
      'dietaryEnergyConsumed'
    ];

    const nutritionData: Map<string, HealthKitNutrition> = new Map();

    for (const type of nutritionTypes) {
      const samples = await this.getQuantitySamples(type, startDate, endDate);
      
      samples.forEach(sample => {
        const dateKey = sample.startDate.toDateString();
        const existing = nutritionData.get(dateKey) || {
          date: sample.startDate,
          protein: 0,
          carbohydrates: 0,
          fat: 0,
          calories: 0
        };

        switch (type) {
          case 'dietaryProtein':
            existing.protein = (existing.protein || 0) + sample.value;
            break;
          case 'dietaryCarbohydrates':
            existing.carbohydrates = (existing.carbohydrates || 0) + sample.value;
            break;
          case 'dietaryFat':
            existing.fat = (existing.fat || 0) + sample.value;
            break;
          case 'dietaryEnergyConsumed':
            existing.calories = (existing.calories || 0) + sample.value;
            break;
        }

        nutritionData.set(dateKey, existing);
      });
    }

    return Array.from(nutritionData.values());
  }

  /**
   * Get body metrics from HealthKit
   */
  private async getBodyMetrics(startDate: Date, endDate: Date): Promise<HealthKitBodyMetrics[]> {
    if (!this.isAvailable) return this.getMockBodyMetrics(startDate, endDate);

    const metrics: HealthKitBodyMetrics[] = [];
    
    // Get weight samples
    const weightSamples = await this.getQuantitySamples('bodyMass', startDate, endDate);
    const fatSamples = await this.getQuantitySamples('bodyFatPercentage', startDate, endDate);

    // Combine by date
    const metricsMap = new Map<string, HealthKitBodyMetrics>();

    weightSamples.forEach(sample => {
      const dateKey = sample.startDate.toDateString();
      const existing = metricsMap.get(dateKey) || { date: sample.startDate };
      existing.weight = sample.value;
      metricsMap.set(dateKey, existing);
    });

    fatSamples.forEach(sample => {
      const dateKey = sample.startDate.toDateString();
      const existing = metricsMap.get(dateKey) || { date: sample.startDate };
      existing.bodyFatPercentage = sample.value;
      metricsMap.set(dateKey, existing);
    });

    return Array.from(metricsMap.values());
  }

  /**
   * Get activity summaries
   */
  private async getActivitySummaries(startDate: Date, endDate: Date): Promise<HealthKitActivitySummary[]> {
    if (!this.isAvailable) return this.getMockActivitySummaries(startDate, endDate);

    return new Promise((resolve) => {
      this.healthKit.getActivitySummary(
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        (summaries: any[]) => {
          resolve(summaries.map(s => this.mapActivitySummary(s)));
        },
        (error: any) => {
          console.error('Failed to get activity summaries:', error);
          resolve([]);
        }
      );
    });
  }

  /**
   * Get quantity samples for a specific type
   */
  private async getQuantitySamples(
    type: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ startDate: Date; endDate: Date; value: number }>> {
    if (!this.isAvailable) return [];

    return new Promise((resolve) => {
      this.healthKit.querySampleType(
        {
          sampleType: type,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          limit: 1000
        },
        (samples: any[]) => {
          resolve(samples.map(s => ({
            startDate: new Date(s.startDate),
            endDate: new Date(s.endDate),
            value: s.value
          })));
        },
        (error: any) => {
          console.error(`Failed to get ${type} samples:`, error);
          resolve([]);
        }
      );
    });
  }

  /**
   * Write workout to HealthKit
   */
  async writeWorkout(workout: HealthKitWorkout): Promise<boolean> {
    if (!this.isAvailable) return true;

    return new Promise((resolve) => {
      this.healthKit.saveWorkout(
        {
          activityType: workout.activityType,
          startDate: workout.startDate.toISOString(),
          endDate: workout.endDate.toISOString(),
          duration: workout.duration,
          energyBurned: workout.totalEnergyBurned,
          distance: workout.totalDistance,
          metadata: workout.metadata
        },
        () => resolve(true),
        (error: any) => {
          console.error('Failed to write workout:', error);
          resolve(false);
        }
      );
    });
  }

  /**
   * Write nutrition to HealthKit
   */
  async writeNutrition(nutrition: HealthKitNutrition): Promise<boolean> {
    if (!this.isAvailable) return true;

    const promises: Promise<boolean>[] = [];

    if (nutrition.protein !== undefined) {
      promises.push(this.writeQuantitySample('dietaryProtein', nutrition.protein, nutrition.date));
    }
    if (nutrition.carbohydrates !== undefined) {
      promises.push(this.writeQuantitySample('dietaryCarbohydrates', nutrition.carbohydrates, nutrition.date));
    }
    if (nutrition.fat !== undefined) {
      promises.push(this.writeQuantitySample('dietaryFat', nutrition.fat, nutrition.date));
    }
    if (nutrition.calories !== undefined) {
      promises.push(this.writeQuantitySample('dietaryEnergyConsumed', nutrition.calories, nutrition.date));
    }

    const results = await Promise.all(promises);
    return results.every(r => r);
  }

  /**
   * Write body metrics to HealthKit
   */
  async writeBodyMetrics(metrics: HealthKitBodyMetrics): Promise<boolean> {
    if (!this.isAvailable) return true;

    const promises: Promise<boolean>[] = [];

    if (metrics.weight !== undefined) {
      promises.push(this.writeQuantitySample('bodyMass', metrics.weight, metrics.date));
    }
    if (metrics.bodyFatPercentage !== undefined) {
      promises.push(this.writeQuantitySample('bodyFatPercentage', metrics.bodyFatPercentage, metrics.date));
    }

    const results = await Promise.all(promises);
    return results.every(r => r);
  }

  /**
   * Write quantity sample to HealthKit
   */
  private async writeQuantitySample(type: string, value: number, date: Date): Promise<boolean> {
    if (!this.isAvailable) return true;

    return new Promise((resolve) => {
      this.healthKit.saveQuantitySample(
        {
          sampleType: type,
          value: value,
          startDate: date.toISOString(),
          endDate: date.toISOString()
        },
        () => resolve(true),
        (error: any) => {
          console.error(`Failed to write ${type}:`, error);
          resolve(false);
        }
      );
    });
  }

  /**
   * Database saving methods
   */
  private async saveWorkoutToDatabase(workout: HealthKitWorkout): Promise<void> {
    // Save to Supabase or local database
    console.log('Saving workout to database:', workout);
  }

  private async saveNutritionToDatabase(nutrition: HealthKitNutrition): Promise<void> {
    console.log('Saving nutrition to database:', nutrition);
  }

  private async saveBodyMetricsToDatabase(metrics: HealthKitBodyMetrics): Promise<void> {
    console.log('Saving body metrics to database:', metrics);
  }

  private async saveActivityToDatabase(activity: HealthKitActivitySummary): Promise<void> {
    console.log('Saving activity to database:', activity);
  }

  /**
   * Mapping methods
   */
  private mapWorkout(data: any): HealthKitWorkout {
    return {
      id: data.uuid || this.generateId(),
      activityType: data.activityType,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      duration: data.duration,
      totalEnergyBurned: data.totalEnergyBurned,
      totalDistance: data.totalDistance,
      averageHeartRate: data.averageHeartRate,
      metadata: data.metadata
    };
  }

  private mapActivitySummary(data: any): HealthKitActivitySummary {
    return {
      date: new Date(data.date),
      activeEnergyBurned: data.activeEnergyBurned || 0,
      activeEnergyBurnedGoal: data.activeEnergyBurnedGoal || 0,
      moveMinutes: data.moveMinutes || 0,
      exerciseMinutes: data.exerciseMinutes || 0,
      standHours: data.standHours || 0,
      stepCount: data.stepCount || 0,
      distance: data.distance || 0,
      flightsClimbed: data.flightsClimbed || 0
    };
  }

  /**
   * Mock data methods for development
   */
  private getMockWorkouts(startDate: Date, endDate: Date): HealthKitWorkout[] {
    return [
      {
        id: '1',
        activityType: 'Running',
        startDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        duration: 3600,
        totalEnergyBurned: 450,
        totalDistance: 5000,
        averageHeartRate: 145
      }
    ];
  }

  private getMockNutrition(startDate: Date, endDate: Date): HealthKitNutrition[] {
    return [
      {
        date: new Date(),
        protein: 120,
        carbohydrates: 200,
        fat: 60,
        calories: 1800
      }
    ];
  }

  private getMockBodyMetrics(startDate: Date, endDate: Date): HealthKitBodyMetrics[] {
    return [
      {
        date: new Date(),
        weight: 75,
        bodyFatPercentage: 18
      }
    ];
  }

  private getMockActivitySummaries(startDate: Date, endDate: Date): HealthKitActivitySummary[] {
    return [
      {
        date: new Date(),
        activeEnergyBurned: 450,
        activeEnergyBurnedGoal: 500,
        moveMinutes: 45,
        exerciseMinutes: 30,
        standHours: 10,
        stepCount: 8500,
        distance: 6000,
        flightsClimbed: 10
      }
    ];
  }

  private generateId(): string {
    return `hk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const healthKitSync = HealthKitSync.getInstance();