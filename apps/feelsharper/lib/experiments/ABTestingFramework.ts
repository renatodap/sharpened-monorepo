/**
 * ABTestingFramework - Feature flags and A/B testing system
 * Maps to PRD: Feature flags for A/B testing
 */

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: Variant[];
  allocation: AllocationStrategy;
  targeting?: TargetingCriteria;
  metrics: Metric[];
  startDate?: Date;
  endDate?: Date;
  results?: ExperimentResults;
}

export interface Variant {
  id: string;
  name: string;
  description?: string;
  weight: number; // 0-100 percentage
  config: Record<string, any>;
  isControl?: boolean;
}

export interface AllocationStrategy {
  type: 'random' | 'deterministic' | 'weighted';
  seed?: string;
  sticky?: boolean; // Keep user in same variant
}

export interface TargetingCriteria {
  userSegments?: string[];
  userProperties?: Record<string, any>;
  deviceTypes?: ('mobile' | 'tablet' | 'desktop')[];
  platforms?: ('ios' | 'android' | 'web')[];
  minVersion?: string;
  maxVersion?: string;
  percentage?: number; // What percentage of eligible users to include
}

export interface Metric {
  id: string;
  name: string;
  type: 'conversion' | 'numeric' | 'duration' | 'count';
  goalDirection: 'increase' | 'decrease';
  isPrimary?: boolean;
}

export interface ExperimentResults {
  variantResults: Map<string, VariantResult>;
  winner?: string;
  confidence?: number;
  significanceLevel?: number;
}

export interface VariantResult {
  variantId: string;
  sampleSize: number;
  conversions?: number;
  conversionRate?: number;
  averageValue?: number;
  standardDeviation?: number;
  confidenceInterval?: [number, number];
}

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage?: number;
  targeting?: TargetingCriteria;
  overrides?: Map<string, boolean>; // User-specific overrides
}

export class ABTestingFramework {
  private static instance: ABTestingFramework;
  private experiments: Map<string, Experiment> = new Map();
  private featureFlags: Map<string, FeatureFlag> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> experimentId -> variantId
  private eventQueue: any[] = [];
  private analyticsEndpoint?: string;

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): ABTestingFramework {
    if (!ABTestingFramework.instance) {
      ABTestingFramework.instance = new ABTestingFramework();
    }
    return ABTestingFramework.instance;
  }

  /**
   * Create a new experiment
   */
  createExperiment(experiment: Omit<Experiment, 'id'>): string {
    const id = this.generateId();
    const newExperiment: Experiment = {
      ...experiment,
      id,
      status: experiment.status || 'draft'
    };

    this.experiments.set(id, newExperiment);
    this.saveToStorage();
    return id;
  }

  /**
   * Start an experiment
   */
  startExperiment(experimentId: string): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) throw new Error(`Experiment ${experimentId} not found`);
    
    if (experiment.status !== 'draft' && experiment.status !== 'paused') {
      throw new Error(`Cannot start experiment in ${experiment.status} status`);
    }

    experiment.status = 'running';
    experiment.startDate = new Date();
    this.saveToStorage();
  }

  /**
   * Get variant for user
   */
  getVariant(experimentId: string, userId: string): Variant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') return null;

    // Check if user meets targeting criteria
    if (!this.userMeetsTargeting(userId, experiment.targeting)) return null;

    // Check for existing assignment (sticky allocation)
    if (experiment.allocation.sticky) {
      const existingAssignment = this.getUserAssignment(userId, experimentId);
      if (existingAssignment) {
        return experiment.variants.find(v => v.id === existingAssignment) || null;
      }
    }

    // Assign variant
    const variant = this.assignVariant(experiment, userId);
    if (variant) {
      this.saveUserAssignment(userId, experimentId, variant.id);
      this.trackExposure(experimentId, variant.id, userId);
    }

    return variant;
  }

  /**
   * Track conversion event
   */
  trackConversion(
    experimentId: string,
    metricId: string,
    userId: string,
    value?: number
  ): void {
    const variantId = this.getUserAssignment(userId, experimentId);
    if (!variantId) return;

    const event = {
      type: 'conversion',
      experimentId,
      variantId,
      metricId,
      userId,
      value,
      timestamp: new Date()
    };

    this.eventQueue.push(event);
    this.processEventQueue();
  }

  /**
   * Check if feature flag is enabled
   */
  isFeatureEnabled(flagId: string, userId?: string): boolean {
    const flag = this.featureFlags.get(flagId);
    if (!flag) return false;

    // Check user-specific override
    if (userId && flag.overrides?.has(userId)) {
      return flag.overrides.get(userId)!;
    }

    // Check if flag is globally disabled
    if (!flag.enabled) return false;

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      if (!userId) return false;
      const hash = this.hashUserId(userId, flagId);
      return (hash % 100) < flag.rolloutPercentage;
    }

    // Check targeting
    if (flag.targeting && userId) {
      return this.userMeetsTargeting(userId, flag.targeting);
    }

    return true;
  }

  /**
   * Create/update feature flag
   */
  setFeatureFlag(flag: FeatureFlag): void {
    this.featureFlags.set(flag.id, flag);
    this.saveToStorage();
  }

  /**
   * Get experiment results
   */
  getExperimentResults(experimentId: string): ExperimentResults | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    // Calculate results from tracked events
    const results = this.calculateResults(experiment);
    
    // Perform statistical significance testing
    if (results.variantResults.size > 1) {
      const significance = this.calculateSignificance(results);
      results.significanceLevel = significance.level;
      results.confidence = significance.confidence;
      results.winner = significance.winner;
    }

    experiment.results = results;
    return results;
  }

  /**
   * Get all active experiments for a user
   */
  getActiveExperiments(userId: string): Array<{ experiment: Experiment; variant: Variant }> {
    const active: Array<{ experiment: Experiment; variant: Variant }> = [];

    this.experiments.forEach(experiment => {
      if (experiment.status === 'running') {
        const variant = this.getVariant(experiment.id, userId);
        if (variant) {
          active.push({ experiment, variant });
        }
      }
    });

    return active;
  }

  /**
   * Private helper methods
   */
  private assignVariant(experiment: Experiment, userId: string): Variant | null {
    const { variants, allocation } = experiment;
    
    if (allocation.type === 'deterministic') {
      // Use consistent hash for deterministic assignment
      const hash = this.hashUserId(userId, experiment.id);
      const index = hash % variants.length;
      return variants[index];
    }
    
    if (allocation.type === 'weighted' || allocation.type === 'random') {
      // Calculate cumulative weights
      const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
      const random = allocation.type === 'random' 
        ? Math.random() * totalWeight
        : (this.hashUserId(userId, experiment.id) % 100) * totalWeight / 100;
      
      let cumulative = 0;
      for (const variant of variants) {
        cumulative += variant.weight;
        if (random < cumulative) {
          return variant;
        }
      }
    }

    return variants[0] || null;
  }

  private userMeetsTargeting(userId: string, targeting?: TargetingCriteria): boolean {
    if (!targeting) return true;

    // Check device type
    if (targeting.deviceTypes && targeting.deviceTypes.length > 0) {
      const deviceType = this.getDeviceType();
      if (!targeting.deviceTypes.includes(deviceType)) return false;
    }

    // Check percentage rollout
    if (targeting.percentage !== undefined && targeting.percentage < 100) {
      const hash = this.hashUserId(userId, 'targeting');
      if ((hash % 100) >= targeting.percentage) return false;
    }

    // Additional targeting checks would go here
    return true;
  }

  private getUserAssignment(userId: string, experimentId: string): string | null {
    return this.userAssignments.get(userId)?.get(experimentId) || null;
  }

  private saveUserAssignment(userId: string, experimentId: string, variantId: string): void {
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }
    this.userAssignments.get(userId)!.set(experimentId, variantId);
    this.saveToStorage();
  }

  private trackExposure(experimentId: string, variantId: string, userId: string): void {
    const event = {
      type: 'exposure',
      experimentId,
      variantId,
      userId,
      timestamp: new Date()
    };
    this.eventQueue.push(event);
    this.processEventQueue();
  }

  private processEventQueue(): void {
    if (this.eventQueue.length === 0) return;

    // In production, batch send to analytics endpoint
    if (this.analyticsEndpoint) {
      // Send events to analytics
      console.log('Sending events to analytics:', this.eventQueue);
    }

    // Store locally for now
    const stored = localStorage.getItem('experimentEvents') || '[]';
    const events = JSON.parse(stored);
    events.push(...this.eventQueue);
    localStorage.setItem('experimentEvents', JSON.stringify(events));

    this.eventQueue = [];
  }

  private calculateResults(experiment: Experiment): ExperimentResults {
    const events = this.getStoredEvents(experiment.id);
    const variantResults = new Map<string, VariantResult>();

    experiment.variants.forEach(variant => {
      const variantEvents = events.filter(e => e.variantId === variant.id);
      const exposures = variantEvents.filter(e => e.type === 'exposure');
      const conversions = variantEvents.filter(e => e.type === 'conversion');

      const result: VariantResult = {
        variantId: variant.id,
        sampleSize: exposures.length,
        conversions: conversions.length,
        conversionRate: exposures.length > 0 ? conversions.length / exposures.length : 0
      };

      // Calculate numeric metrics
      if (conversions.length > 0 && conversions.some(c => c.value !== undefined)) {
        const values = conversions.map(c => c.value || 0);
        result.averageValue = values.reduce((sum, v) => sum + v, 0) / values.length;
        result.standardDeviation = this.calculateStandardDeviation(values);
      }

      variantResults.set(variant.id, result);
    });

    return { variantResults };
  }

  private calculateSignificance(results: ExperimentResults): {
    level: number;
    confidence: number;
    winner?: string;
  } {
    const variants = Array.from(results.variantResults.values());
    if (variants.length < 2) return { level: 0, confidence: 0 };

    // Find control variant
    const control = variants.find(v => {
      const variant = Array.from(this.experiments.values())
        .flatMap(e => e.variants)
        .find(variant => variant.id === v.variantId);
      return variant?.isControl;
    }) || variants[0];

    // Calculate z-scores for each variant vs control
    let maxZScore = 0;
    let winner: string | undefined;

    variants.forEach(variant => {
      if (variant.variantId === control.variantId) return;

      const zScore = this.calculateZScore(control, variant);
      if (Math.abs(zScore) > Math.abs(maxZScore)) {
        maxZScore = zScore;
        winner = zScore > 0 ? variant.variantId : control.variantId;
      }
    });

    // Convert z-score to confidence level
    const confidence = this.zScoreToConfidence(Math.abs(maxZScore));
    const significanceLevel = confidence >= 95 ? 0.05 : confidence >= 90 ? 0.10 : 1;

    return { level: significanceLevel, confidence, winner };
  }

  private calculateZScore(control: VariantResult, variant: VariantResult): number {
    const p1 = control.conversionRate || 0;
    const p2 = variant.conversionRate || 0;
    const n1 = control.sampleSize;
    const n2 = variant.sampleSize;

    if (n1 === 0 || n2 === 0) return 0;

    const pooledP = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));

    if (se === 0) return 0;

    return (p2 - p1) / se;
  }

  private zScoreToConfidence(zScore: number): number {
    // Simplified normal CDF approximation
    const t = 1 / (1 + 0.2316419 * zScore);
    const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
    const probability = 1 - d * t * (0.31938 + t * (-0.356 + t * (1.782 + t * (-1.822 + t * 1.331))));
    return probability * 100;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
    return Math.sqrt(variance);
  }

  private hashUserId(userId: string, salt: string): number {
    const str = userId + salt;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private getStoredEvents(experimentId: string): any[] {
    const stored = localStorage.getItem('experimentEvents') || '[]';
    const events = JSON.parse(stored);
    return events.filter((e: any) => e.experimentId === experimentId);
  }

  private loadFromStorage(): void {
    // Load experiments
    const experimentsData = localStorage.getItem('experiments');
    if (experimentsData) {
      const experiments = JSON.parse(experimentsData);
      this.experiments = new Map(experiments);
    }

    // Load feature flags
    const flagsData = localStorage.getItem('featureFlags');
    if (flagsData) {
      const flags = JSON.parse(flagsData);
      this.featureFlags = new Map(flags);
    }

    // Load user assignments
    const assignmentsData = localStorage.getItem('userAssignments');
    if (assignmentsData) {
      const assignments = JSON.parse(assignmentsData);
      this.userAssignments = new Map(
        assignments.map(([userId, userMap]: [string, any]) => [
          userId,
          new Map(userMap)
        ])
      );
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('experiments', JSON.stringify(Array.from(this.experiments.entries())));
    localStorage.setItem('featureFlags', JSON.stringify(Array.from(this.featureFlags.entries())));
    localStorage.setItem('userAssignments', JSON.stringify(
      Array.from(this.userAssignments.entries()).map(([userId, userMap]) => [
        userId,
        Array.from(userMap.entries())
      ])
    ));
  }

  private generateId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const abTesting = ABTestingFramework.getInstance();