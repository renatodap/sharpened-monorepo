/**
 * React Hooks for A/B Testing
 * 
 * Provides easy-to-use hooks for React components to:
 * - Get experiment variants
 * - Track conversions
 * - Access experiment configurations
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { getABTestingService, type UserAssignment, type ExperimentResults } from './core';
import { useAnalytics } from '@/components/analytics/AnalyticsProvider';

/**
 * Hook to get user's variant for an experiment
 */
export function useExperiment(experimentSlug: string) {
  const [assignment, setAssignment] = useState<UserAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    let mounted = true;
    
    const loadAssignment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const abService = getABTestingService();
        const userAssignment = await abService.getUserAssignment(experimentSlug);
        
        if (mounted) {
          setAssignment(userAssignment);
          
          // Track experiment exposure
          if (userAssignment) {
            trackEvent('Experiment Exposed', {
              experiment_slug: experimentSlug,
              variant_key: userAssignment.variantKey,
              variant_id: userAssignment.variantId,
              assignment_date: userAssignment.assignedAt.toISOString()
            });
          }
        }
      } catch (err) {
        if (mounted) {
          console.error(`Error loading experiment assignment for ${experimentSlug}:`, err);
          setError(err instanceof Error ? err.message : 'Failed to load experiment');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAssignment();
    
    return () => {
      mounted = false;
    };
  }, [experimentSlug, trackEvent]);

  const recordConversion = useCallback(async (
    eventType: string,
    options: {
      eventValue?: number;
      eventProperties?: Record<string, any>;
    } = {}
  ) => {
    try {
      const abService = getABTestingService();
      const success = await abService.recordConversion(
        experimentSlug,
        eventType,
        options
      );
      
      if (success) {
        // Also track in analytics
        trackEvent('Experiment Conversion', {
          experiment_slug: experimentSlug,
          variant_key: assignment?.variantKey,
          event_type: eventType,
          event_value: options.eventValue,
          ...options.eventProperties
        });
      }
      
      return success;
    } catch (err) {
      console.error(`Error recording conversion for ${experimentSlug}:`, err);
      return false;
    }
  }, [experimentSlug, assignment?.variantKey, trackEvent]);

  return {
    assignment,
    variant: assignment?.variantKey,
    config: assignment?.config,
    loading,
    error,
    recordConversion,
    isInExperiment: !!assignment,
    // Helper methods
    isVariant: (variantKey: string) => assignment?.variantKey === variantKey,
    getConfigValue: (key: string, defaultValue?: any) => 
      assignment?.config?.[key] ?? defaultValue
  };
}

/**
 * Hook for pricing experiments specifically
 */
export function usePricingExperiment(experimentSlug: string) {
  const experiment = useExperiment(experimentSlug);
  
  // Extract pricing-specific values from config
  const pricingConfig = experiment.config ? {
    monthlyPrice: experiment.config.monthly_price || 799, // Default $7.99
    annualPrice: experiment.config.annual_price,
    annualDiscount: experiment.config.annual_discount || 0.2,
    showUrgency: experiment.config.show_urgency || false,
    urgencyMessage: experiment.config.urgency_message,
    discountExpiresAt: experiment.config.discount_expires_at,
    featuresIncluded: experiment.config.features_included || [],
    usageLimits: experiment.config.usage_limits || {}
  } : null;

  const recordPurchase = useCallback(async (
    plan: 'monthly' | 'annual',
    amount: number,
    orderId?: string
  ) => {
    return experiment.recordConversion('purchase_completed', {
      eventValue: amount,
      eventProperties: {
        plan_type: plan,
        order_id: orderId,
        monthly_price: pricingConfig?.monthlyPrice,
        annual_price: pricingConfig?.annualPrice
      }
    });
  }, [experiment.recordConversion, pricingConfig]);

  const recordCheckoutStarted = useCallback(async (
    plan: 'monthly' | 'annual',
    amount: number
  ) => {
    return experiment.recordConversion('checkout_started', {
      eventValue: amount,
      eventProperties: {
        plan_type: plan,
        monthly_price: pricingConfig?.monthlyPrice,
        annual_price: pricingConfig?.annualPrice
      }
    });
  }, [experiment.recordConversion, pricingConfig]);

  return {
    ...experiment,
    pricing: pricingConfig,
    recordPurchase,
    recordCheckoutStarted,
    // Helper methods for pricing
    getMonthlyPrice: () => pricingConfig?.monthlyPrice || 799,
    getAnnualPrice: () => {
      const monthly = pricingConfig?.monthlyPrice || 799;
      const discount = pricingConfig?.annualDiscount || 0.2;
      return Math.round(monthly * 12 * (1 - discount));
    },
    getAnnualSavings: () => {
      const monthly = pricingConfig?.monthlyPrice || 799;
      const annual = pricingConfig?.annualPrice;
      if (annual) {
        return (monthly * 12) - annual;
      }
      const discount = pricingConfig?.annualDiscount || 0.2;
      return Math.round(monthly * 12 * discount);
    },
    formatPrice: (cents: number) => `$${(cents / 100).toFixed(2)}`
  };
}

/**
 * Hook for CTA optimization experiments
 */
export function useCTAExperiment(experimentSlug: string) {
  const experiment = useExperiment(experimentSlug);
  
  const ctaConfig = experiment.config ? {
    buttonText: experiment.config.button_text || 'Get Started',
    buttonColor: experiment.config.button_color || 'primary',
    buttonSize: experiment.config.button_size || 'default',
    showIcon: experiment.config.show_icon || false,
    iconType: experiment.config.icon_type,
    urgencyText: experiment.config.urgency_text,
    subtext: experiment.config.subtext,
    socialProof: experiment.config.social_proof
  } : null;

  const recordCTAClick = useCallback(async (location: string, context?: Record<string, any>) => {
    return experiment.recordConversion('cta_clicked', {
      eventProperties: {
        cta_location: location,
        button_text: ctaConfig?.buttonText,
        ...context
      }
    });
  }, [experiment.recordConversion, ctaConfig?.buttonText]);

  const recordCTAView = useCallback(async (location: string, context?: Record<string, any>) => {
    return experiment.recordConversion('cta_viewed', {
      eventProperties: {
        cta_location: location,
        button_text: ctaConfig?.buttonText,
        ...context
      }
    });
  }, [experiment.recordConversion, ctaConfig?.buttonText]);

  return {
    ...experiment,
    cta: ctaConfig,
    recordCTAClick,
    recordCTAView,
    // Helper methods
    getButtonProps: () => ({
      children: ctaConfig?.buttonText || 'Get Started',
      variant: ctaConfig?.buttonColor || 'primary',
      size: ctaConfig?.buttonSize || 'default',
      className: ctaConfig?.showIcon ? 'flex items-center gap-2' : ''
    })
  };
}

/**
 * Hook for feature gating experiments
 */
export function useFeatureGatingExperiment(experimentSlug: string) {
  const experiment = useExperiment(experimentSlug);
  
  const gatingConfig = experiment.config ? {
    freeFeatures: experiment.config.free_features || [],
    premiumFeatures: experiment.config.premium_features || [],
    usageLimits: experiment.config.usage_limits || {},
    paywall: experiment.config.paywall || {},
    trialLength: experiment.config.trial_length || 0
  } : null;

  const isFeatureAvailable = useCallback((featureKey: string, userTier: 'free' | 'premium' = 'free') => {
    if (!gatingConfig) return true;
    
    if (userTier === 'premium') return true;
    
    return gatingConfig.freeFeatures.includes(featureKey);
  }, [gatingConfig]);

  const recordFeatureBlocked = useCallback(async (featureKey: string, context?: Record<string, any>) => {
    return experiment.recordConversion('feature_blocked', {
      eventProperties: {
        feature_key: featureKey,
        user_tier: 'free',
        ...context
      }
    });
  }, [experiment.recordConversion]);

  const recordUpgradePromptShown = useCallback(async (featureKey: string, context?: Record<string, any>) => {
    return experiment.recordConversion('upgrade_prompt_shown', {
      eventProperties: {
        feature_key: featureKey,
        ...context
      }
    });
  }, [experiment.recordConversion]);

  return {
    ...experiment,
    gating: gatingConfig,
    isFeatureAvailable,
    recordFeatureBlocked,
    recordUpgradePromptShown,
    // Helper methods
    getUsageLimit: (featureKey: string) => gatingConfig?.usageLimits[featureKey],
    getPaywallConfig: (featureKey: string) => gatingConfig?.paywall[featureKey]
  };
}

/**
 * Hook to get experiment results (admin use)
 */
export function useExperimentResults(experimentSlug: string) {
  const [results, setResults] = useState<ExperimentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const abService = getABTestingService();
      const experimentResults = await abService.getExperimentResults(experimentSlug);
      
      setResults(experimentResults);
    } catch (err) {
      console.error(`Error loading results for ${experimentSlug}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [experimentSlug]);

  useEffect(() => {
    refreshResults();
  }, [refreshResults]);

  return {
    results,
    loading,
    error,
    refreshResults,
    // Helper methods
    getWinner: () => results?.variants.find(v => v.isWinner),
    hasWinner: () => !!results?.winner,
    isStatisticallySignificant: () => results?.statisticalSignificance || false,
    getTotalConversions: () => results?.variants.reduce((sum, v) => sum + v.conversions, 0) || 0,
    getBestPerformer: (metric: 'conversionRate' | 'revenuePerUser' = 'conversionRate') => {
      if (!results?.variants.length) return null;
      return results.variants.reduce((best, current) => 
        current[metric] > best[metric] ? current : best
      );
    }
  };
}

/**
 * Hook for multiple experiments (useful for dashboard)
 */
export function useExperiments(experimentSlugs: string[]) {
  const [experiments, setExperiments] = useState<Record<string, UserAssignment | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadExperiments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const abService = getABTestingService();
        const assignments: Record<string, UserAssignment | null> = {};
        
        await Promise.all(
          experimentSlugs.map(async (slug) => {
            try {
              const assignment = await abService.getUserAssignment(slug);
              assignments[slug] = assignment;
            } catch (err) {
              console.error(`Error loading experiment ${slug}:`, err);
              assignments[slug] = null;
            }
          })
        );
        
        if (mounted) {
          setExperiments(assignments);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error loading experiments:', err);
          setError(err instanceof Error ? err.message : 'Failed to load experiments');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (experimentSlugs.length > 0) {
      loadExperiments();
    } else {
      setLoading(false);
    }
    
    return () => {
      mounted = false;
    };
  }, [experimentSlugs]);

  const recordConversion = useCallback(async (
    experimentSlug: string,
    eventType: string,
    options: { eventValue?: number; eventProperties?: Record<string, any> } = {}
  ) => {
    try {
      const abService = getABTestingService();
      return await abService.recordConversion(experimentSlug, eventType, options);
    } catch (err) {
      console.error(`Error recording conversion for ${experimentSlug}:`, err);
      return false;
    }
  }, []);

  return {
    experiments,
    loading,
    error,
    recordConversion,
    // Helper methods
    getVariant: (experimentSlug: string) => experiments[experimentSlug]?.variantKey,
    getConfig: (experimentSlug: string) => experiments[experimentSlug]?.config,
    isInExperiment: (experimentSlug: string) => !!experiments[experimentSlug],
    isVariant: (experimentSlug: string, variantKey: string) => 
      experiments[experimentSlug]?.variantKey === variantKey
  };
}