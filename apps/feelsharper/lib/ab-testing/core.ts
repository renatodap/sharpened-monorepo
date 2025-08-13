/**
 * A/B Testing Core Service
 * 
 * Provides comprehensive A/B testing functionality including:
 * - User bucketing and variant assignment
 * - Conversion tracking
 * - Statistical significance calculation
 * - Automatic experiment management
 */

import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/client';
import { cookies } from 'next/headers';

// Types
export interface ExperimentConfig {
  id: string;
  slug: string;
  name: string;
  description?: string;
  type: 'pricing' | 'cta_optimization' | 'feature_gating' | 'messaging' | 'layout' | 'urgency' | 'social_proof' | 'onboarding';
  targetMetric: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  variants: ExperimentVariant[];
  trafficAllocation: number;
  minSampleSize: number;
  confidenceLevel: number;
  startedAt?: Date;
  endedAt?: Date;
}

export interface ExperimentVariant {
  id: string;
  key: string;
  name: string;
  description?: string;
  trafficWeight: number;
  config: Record<string, any>;
  isActive: boolean;
}

export interface UserAssignment {
  experimentId: string;
  variantId: string;
  variantKey: string;
  config: Record<string, any>;
  assignedAt: Date;
}

export interface ConversionEvent {
  experimentId: string;
  variantId: string;
  eventType: string;
  eventValue?: number;
  eventProperties?: Record<string, any>;
  userId?: string;
  anonymousId?: string;
}

export interface ExperimentResults {
  experimentId: string;
  variants: VariantResults[];
  winner?: string;
  statisticalSignificance: boolean;
  confidence: number;
  daysRunning: number;
  totalUsers: number;
  hasMinSampleSize: boolean;
}

export interface VariantResults {
  variantId: string;
  variantKey: string;
  users: number;
  conversions: number;
  conversionRate: number;
  totalRevenue: number;
  revenuePerUser: number;
  lift?: number; // vs control
  liftConfidenceInterval?: [number, number];
  pValue?: number;
  isControl: boolean;
  isWinner?: boolean;
}

export class ABTestingService {
  private supabase;
  
  constructor(serverSide: boolean = false) {
    this.supabase = serverSide ? createServerClient() : createClient();
  }

  /**
   * Get or create anonymous ID for tracking non-authenticated users
   */
  private getAnonymousId(): string {
    if (typeof window === 'undefined') {
      // Server-side - generate temporary ID
      return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    let anonymousId = localStorage.getItem('ab_test_anonymous_id');
    if (!anonymousId) {
      anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ab_test_anonymous_id', anonymousId);
    }
    return anonymousId;
  }

  /**
   * Get current user ID or anonymous ID
   */
  private async getUserIdentifier(): Promise<{ userId?: string; anonymousId?: string }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (user) {
        return { userId: user.id };
      } else {
        return { anonymousId: this.getAnonymousId() };
      }
    } catch (error) {
      console.error('Failed to get user identifier:', error);
      return { anonymousId: this.getAnonymousId() };
    }
  }

  /**
   * Assign user to experiment variant
   */
  async assignToExperiment(experimentSlug: string): Promise<UserAssignment | null> {
    try {
      const { userId, anonymousId } = await this.getUserIdentifier();
      
      const { data, error } = await this.supabase
        .rpc('assign_user_to_experiment', {
          p_experiment_slug: experimentSlug,
          p_user_id: userId || null,
          p_anonymous_id: anonymousId || null
        });

      if (error) {
        console.error('Failed to assign user to experiment:', error);
        return null;
      }

      if (data.error) {
        console.warn('Experiment assignment error:', data.error);
        return null;
      }

      return {
        experimentId: data.experiment_id,
        variantId: data.variant_id,
        variantKey: data.variant_key,
        config: data.config,
        assignedAt: new Date(data.assigned_at)
      };
    } catch (error) {
      console.error('Error assigning to experiment:', error);
      return null;
    }
  }

  /**
   * Get user's assignment for a specific experiment
   */
  async getUserAssignment(experimentSlug: string): Promise<UserAssignment | null> {
    try {
      const { userId, anonymousId } = await this.getUserIdentifier();
      
      const { data, error } = await this.supabase
        .from('user_experiment_assignments')
        .select(`
          experiment_id,
          variant_id,
          assigned_at,
          experiment_variants!inner(
            variant_key,
            config
          ),
          experiments!inner(
            slug
          )
        `)
        .eq('experiments.slug', experimentSlug)
        .or(`user_id.eq.${userId || 'null'},anonymous_id.eq.${anonymousId || 'null'}`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No assignment found - assign user
          return await this.assignToExperiment(experimentSlug);
        }
        console.error('Failed to get user assignment:', error);
        return null;
      }

      return {
        experimentId: data.experiment_id,
        variantId: data.variant_id,
        variantKey: data.experiment_variants.variant_key,
        config: data.experiment_variants.config,
        assignedAt: new Date(data.assigned_at)
      };
    } catch (error) {
      console.error('Error getting user assignment:', error);
      return null;
    }
  }

  /**
   * Record conversion event
   */
  async recordConversion(
    experimentSlug: string,
    eventType: string,
    options: {
      eventValue?: number;
      eventProperties?: Record<string, any>;
      userId?: string;
      anonymousId?: string;
    } = {}
  ): Promise<boolean> {
    try {
      const identifier = options.userId || options.anonymousId ? 
        { userId: options.userId, anonymousId: options.anonymousId } :
        await this.getUserIdentifier();

      const { data, error } = await this.supabase
        .rpc('record_conversion_event', {
          p_experiment_slug: experimentSlug,
          p_event_type: eventType,
          p_user_id: identifier.userId || null,
          p_anonymous_id: identifier.anonymousId || null,
          p_event_value: options.eventValue || null,
          p_event_properties: options.eventProperties || {}
        });

      if (error) {
        console.error('Failed to record conversion:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error recording conversion:', error);
      return false;
    }
  }

  /**
   * Get active experiments
   */
  async getActiveExperiments(): Promise<ExperimentConfig[]> {
    try {
      const { data, error } = await this.supabase
        .from('experiments')
        .select(`
          id,
          slug,
          name,
          description,
          experiment_type,
          target_metric,
          status,
          traffic_allocation,
          min_sample_size,
          confidence_level,
          started_at,
          ended_at,
          experiment_variants(
            id,
            variant_key,
            name,
            description,
            traffic_weight,
            config,
            is_active
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to get active experiments:', error);
        return [];
      }

      return data.map(exp => ({
        id: exp.id,
        slug: exp.slug,
        name: exp.name,
        description: exp.description,
        type: exp.experiment_type as any,
        targetMetric: exp.target_metric,
        status: exp.status as any,
        variants: exp.experiment_variants.map((v: any) => ({
          id: v.id,
          key: v.variant_key,
          name: v.name,
          description: v.description,
          trafficWeight: v.traffic_weight,
          config: v.config,
          isActive: v.is_active
        })),
        trafficAllocation: exp.traffic_allocation,
        minSampleSize: exp.min_sample_size,
        confidenceLevel: exp.confidence_level,
        startedAt: exp.started_at ? new Date(exp.started_at) : undefined,
        endedAt: exp.ended_at ? new Date(exp.ended_at) : undefined
      }));
    } catch (error) {
      console.error('Error getting active experiments:', error);
      return [];
    }
  }

  /**
   * Get experiment results with statistical analysis
   */
  async getExperimentResults(experimentSlug: string): Promise<ExperimentResults | null> {
    try {
      // Get experiment and variants
      const { data: experiment, error: expError } = await this.supabase
        .from('experiments')
        .select(`
          id,
          slug,
          name,
          min_sample_size,
          confidence_level,
          started_at,
          experiment_variants(
            id,
            variant_key,
            name
          )
        `)
        .eq('slug', experimentSlug)
        .single();

      if (expError || !experiment) {
        console.error('Failed to get experiment:', expError);
        return null;
      }

      // Get assignments and conversions for each variant
      const variantResults: VariantResults[] = [];
      let totalUsers = 0;

      for (const variant of experiment.experiment_variants) {
        // Get assignments count
        const { count: assignments } = await this.supabase
          .from('user_experiment_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('variant_id', variant.id);

        // Get conversions
        const { data: conversions, error: convError } = await this.supabase
          .from('conversion_events')
          .select('event_value')
          .eq('variant_id', variant.id);

        if (convError) {
          console.error('Failed to get conversions:', convError);
          continue;
        }

        const users = assignments || 0;
        const conversionCount = conversions?.length || 0;
        const conversionRate = users > 0 ? conversionCount / users : 0;
        const totalRevenue = conversions?.reduce((sum, c) => sum + (c.event_value || 0), 0) || 0;
        const revenuePerUser = users > 0 ? totalRevenue / users : 0;

        variantResults.push({
          variantId: variant.id,
          variantKey: variant.variant_key,
          users,
          conversions: conversionCount,
          conversionRate,
          totalRevenue,
          revenuePerUser,
          isControl: variant.variant_key === 'control',
          isWinner: false
        });

        totalUsers += users;
      }

      // Calculate statistical significance
      const controlVariant = variantResults.find(v => v.isControl);
      if (controlVariant && variantResults.length > 1) {
        variantResults.forEach(variant => {
          if (!variant.isControl && controlVariant) {
            const significance = this.calculateStatisticalSignificance(
              controlVariant.users,
              controlVariant.conversions,
              variant.users,
              variant.conversions,
              experiment.confidence_level
            );

            variant.lift = significance.lift;
            variant.liftConfidenceInterval = significance.liftConfidenceInterval;
            variant.pValue = significance.pValue;
          }
        });
      }

      // Find winner based on statistical significance and performance
      const winner = this.determineWinner(variantResults, experiment.confidence_level);
      if (winner) {
        const winnerVariant = variantResults.find(v => v.variantId === winner);
        if (winnerVariant) {
          winnerVariant.isWinner = true;
        }
      }

      const daysRunning = experiment.started_at ? 
        Math.ceil((Date.now() - new Date(experiment.started_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

      const hasStatSig = variantResults.some(v => v.pValue && v.pValue < (1 - experiment.confidence_level));

      return {
        experimentId: experiment.id,
        variants: variantResults,
        winner: winner || undefined,
        statisticalSignificance: hasStatSig,
        confidence: experiment.confidence_level,
        daysRunning,
        totalUsers,
        hasMinSampleSize: totalUsers >= experiment.min_sample_size
      };
    } catch (error) {
      console.error('Error getting experiment results:', error);
      return null;
    }
  }

  /**
   * Calculate statistical significance between two variants
   */
  private calculateStatisticalSignificance(
    controlUsers: number,
    controlConversions: number,
    testUsers: number,
    testConversions: number,
    confidenceLevel: number
  ): {
    lift: number;
    liftConfidenceInterval: [number, number];
    pValue: number;
    isSignificant: boolean;
  } {
    if (controlUsers === 0 || testUsers === 0) {
      return {
        lift: 0,
        liftConfidenceInterval: [0, 0],
        pValue: 1,
        isSignificant: false
      };
    }

    const p1 = controlConversions / controlUsers;
    const p2 = testConversions / testUsers;
    
    const lift = p1 > 0 ? (p2 - p1) / p1 : 0;

    // Calculate z-score for two proportions
    const pooledProportion = (controlConversions + testConversions) / (controlUsers + testUsers);
    const standardError = Math.sqrt(
      pooledProportion * (1 - pooledProportion) * ((1 / controlUsers) + (1 / testUsers))
    );

    const zScore = standardError > 0 ? (p2 - p1) / standardError : 0;
    
    // Calculate p-value (two-tailed test)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

    // Calculate confidence interval for lift
    const criticalValue = this.getZCritical(confidenceLevel);
    const liftSE = Math.sqrt((p1 * (1 - p1) / controlUsers) + (p2 * (1 - p2) / testUsers));
    const liftMarginOfError = criticalValue * liftSE / (p1 || 1);
    
    const liftConfidenceInterval: [number, number] = [
      lift - liftMarginOfError,
      lift + liftMarginOfError
    ];

    return {
      lift,
      liftConfidenceInterval,
      pValue,
      isSignificant: pValue < (1 - confidenceLevel)
    };
  }

  /**
   * Approximate normal cumulative distribution function
   */
  private normalCDF(x: number): number {
    return (1 + this.erf(x / Math.sqrt(2))) / 2;
  }

  /**
   * Error function approximation
   */
  private erf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Get critical z-value for confidence level
   */
  private getZCritical(confidenceLevel: number): number {
    const alpha = 1 - confidenceLevel;
    
    // Common critical values
    if (alpha <= 0.01) return 2.576; // 99%
    if (alpha <= 0.05) return 1.96;  // 95%
    if (alpha <= 0.10) return 1.645; // 90%
    
    return 1.96; // Default to 95%
  }

  /**
   * Determine experiment winner based on statistical significance and business metrics
   */
  private determineWinner(
    variants: VariantResults[], 
    confidenceLevel: number
  ): string | null {
    const controlVariant = variants.find(v => v.isControl);
    if (!controlVariant) return null;

    let bestVariant = controlVariant;
    
    for (const variant of variants) {
      if (variant.isControl) continue;
      
      // Check statistical significance
      if (variant.pValue && variant.pValue < (1 - confidenceLevel)) {
        // Statistically significant - choose based on revenue per user
        if (variant.revenuePerUser > bestVariant.revenuePerUser) {
          bestVariant = variant;
        }
      }
    }

    return bestVariant.variantId;
  }

  /**
   * Create new experiment
   */
  async createExperiment(config: Omit<ExperimentConfig, 'id'>): Promise<string | null> {
    try {
      const { data: experiment, error: expError } = await this.supabase
        .from('experiments')
        .insert({
          slug: config.slug,
          name: config.name,
          description: config.description,
          experiment_type: config.type,
          target_metric: config.targetMetric,
          status: config.status,
          traffic_allocation: config.trafficAllocation,
          min_sample_size: config.minSampleSize,
          confidence_level: config.confidenceLevel
        })
        .select('id')
        .single();

      if (expError) {
        console.error('Failed to create experiment:', expError);
        return null;
      }

      // Create variants
      const variantData = config.variants.map(variant => ({
        experiment_id: experiment.id,
        variant_key: variant.key,
        name: variant.name,
        description: variant.description,
        traffic_weight: variant.trafficWeight,
        config: variant.config,
        is_active: variant.isActive
      }));

      const { error: variantError } = await this.supabase
        .from('experiment_variants')
        .insert(variantData);

      if (variantError) {
        console.error('Failed to create variants:', variantError);
        return null;
      }

      return experiment.id;
    } catch (error) {
      console.error('Error creating experiment:', error);
      return null;
    }
  }

  /**
   * Start experiment
   */
  async startExperiment(experimentSlug: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('experiments')
        .update({ 
          status: 'active', 
          started_at: new Date().toISOString() 
        })
        .eq('slug', experimentSlug);

      if (error) {
        console.error('Failed to start experiment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error starting experiment:', error);
      return false;
    }
  }

  /**
   * Stop experiment
   */
  async stopExperiment(experimentSlug: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('experiments')
        .update({ 
          status: 'completed', 
          ended_at: new Date().toISOString() 
        })
        .eq('slug', experimentSlug);

      if (error) {
        console.error('Failed to stop experiment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error stopping experiment:', error);
      return false;
    }
  }
}

// Singleton instance
let abTestingService: ABTestingService | null = null;

export function getABTestingService(serverSide: boolean = false): ABTestingService {
  if (!abTestingService) {
    abTestingService = new ABTestingService(serverSide);
  }
  return abTestingService;
}