// Analytics Provider for Feel Sharper
// Integrates PostHog with privacy controls and user preferences

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAnalytics, PostHogAnalytics, POSTHOG_CONFIG } from '../../../../packages/analytics/posthog-config';
import { useUser } from '@/lib/auth/useUser';
import { createClient } from '@/lib/supabase/client';

interface AnalyticsContextType {
  analytics: PostHogAnalytics;
  isInitialized: boolean;
  trackEvent: (event: string, properties?: Record<string, any>) => void;
  trackConversion: (step: string, funnel: string, properties?: Record<string, any>) => void;
  isFeatureEnabled: (flagKey: string) => boolean;
  privacyLevel: 'minimal' | 'standard' | 'full';
  updatePrivacyLevel: (level: 'minimal' | 'standard' | 'full') => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { user, loading } = useUser();
  const [analytics] = useState(() => getAnalytics());
  const [isInitialized, setIsInitialized] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState<'minimal' | 'standard' | 'full'>('standard');

  // Initialize analytics when user data is available
  useEffect(() => {
    if (loading) return;

    initializeAnalytics();
  }, [user, loading]);

  // Load user privacy preferences
  useEffect(() => {
    if (user) {
      loadPrivacyPreferences();
    }
  }, [user]);

  const initializeAnalytics = async () => {
    try {
      await analytics.initialize(user?.id);
      setIsInitialized(true);

      // Track app launch
      analytics.track('App Launched', {
        app: 'feelsharper',
        user_type: user ? 'authenticated' : 'anonymous',
        privacy_level: privacyLevel,
      });

      // Set user properties if logged in
      if (user) {
        await setUserProperties();
      }

    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  };

  const loadPrivacyPreferences = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_privacy_settings')
        .select('analytics_level')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('No privacy settings found, using default');
        return;
      }

      if (data?.analytics_level) {
        setPrivacyLevel(data.analytics_level);
        updateAnalyticsPrivacy(data.analytics_level);
      }
    } catch (error) {
      console.error('Failed to load privacy preferences:', error);
    }
  };

  const setUserProperties = async () => {
    if (!user || !isInitialized) return;

    try {
      const supabase = createClient();
      
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Failed to fetch user profile:', profileError);
        return;
      }

      // Get subscription data
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Set user properties based on privacy level
      const baseProperties = {
        [POSTHOG_CONFIG.userProperties.signup_date]: profile.created_at,
        [POSTHOG_CONFIG.userProperties.subscription_tier]: subscription?.status || 'free',
        [POSTHOG_CONFIG.userProperties.platform]: 'web',
      };

      if (privacyLevel !== 'minimal') {
        Object.assign(baseProperties, {
          [POSTHOG_CONFIG.userProperties.user_type]: profile.user_type || 'fitness_enthusiast',
          [POSTHOG_CONFIG.userProperties.preferred_app]: 'feelsharper',
          [POSTHOG_CONFIG.userProperties.total_workouts]: stats?.total_workouts || 0,
          [POSTHOG_CONFIG.userProperties.streak_length]: stats?.current_streak || 0,
        });
      }

      if (privacyLevel === 'full') {
        Object.assign(baseProperties, {
          [POSTHOG_CONFIG.userProperties.weekly_active_days]: stats?.weekly_active_days || 0,
          [POSTHOG_CONFIG.userProperties.last_active_date]: stats?.last_active || new Date().toISOString(),
        });
      }

      analytics.setUserProperties(baseProperties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  };

  const updateAnalyticsPrivacy = (level: 'minimal' | 'standard' | 'full') => {
    if (!isInitialized) return;

    const config = POSTHOG_CONFIG.privacy[level];
    
    // Apply privacy settings to PostHog
    if (config.disable_recordings) {
      // PostHog method to disable recordings
      const posthog = (analytics as any)['posthog'];
      if (posthog?.config) {
        posthog.config.disable_session_recording = true;
      }
    }

    if (config.disable_autocapture) {
      const posthog = (analytics as any)['posthog'];
      if (posthog?.config) {
        posthog.config.autocapture = false;
      }
    }

    // Track privacy level change
    analytics.track('Privacy Level Changed', {
      previous_level: privacyLevel,
      new_level: level,
      app: 'feelsharper',
    });
  };

  const trackEvent = (event: string, properties: Record<string, any> = {}) => {
    if (!isInitialized) return;

    // Filter events based on privacy level
    const config = POSTHOG_CONFIG.privacy[privacyLevel];
    if (config.events !== 'all' && !config.events.includes(event)) {
      return;
    }

    // Add app context
    const enrichedProperties = {
      ...properties,
      app: 'feelsharper',
      privacy_level: privacyLevel,
    };

    analytics.track(event, enrichedProperties);
  };

  const trackConversion = (step: string, funnel: string, properties: Record<string, any> = {}) => {
    if (!isInitialized) return;

    analytics.trackConversionFunnel(step, funnel, {
      ...properties,
      app: 'feelsharper',
      privacy_level: privacyLevel,
    });
  };

  const isFeatureEnabled = (flagKey: string): boolean => {
    if (!isInitialized) return false;
    return analytics.isFeatureEnabled(flagKey);
  };

  const updatePrivacyLevel = async (level: 'minimal' | 'standard' | 'full') => {
    if (!user) return;

    try {
      // Update in database
      const supabase = createClient();
      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({
          user_id: user.id,
          analytics_level: level,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to update privacy settings:', error);
        return;
      }

      // Update local state
      setPrivacyLevel(level);
      updateAnalyticsPrivacy(level);

    } catch (error) {
      console.error('Failed to update privacy level:', error);
    }
  };

  const value: AnalyticsContextType = {
    analytics,
    isInitialized,
    trackEvent,
    trackConversion,
    isFeatureEnabled,
    privacyLevel,
    updatePrivacyLevel,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Custom hooks for common tracking patterns
export function useWorkoutTracking() {
  const { trackEvent, trackConversion } = useAnalytics();

  return {
    trackWorkoutStarted: (workoutType: string, properties: Record<string, any> = {}) => {
      trackEvent(POSTHOG_CONFIG.events.workout_logged, {
        workout_type: workoutType,
        action: 'started',
        ...properties,
      });
    },

    trackWorkoutCompleted: (workoutType: string, duration: number, properties: Record<string, any> = {}) => {
      trackEvent(POSTHOG_CONFIG.events.workout_logged, {
        workout_type: workoutType,
        action: 'completed',
        duration_minutes: duration,
        ...properties,
      });
      
      trackConversion('Workout Completed', 'engagement_funnel', {
        workout_type: workoutType,
        duration_minutes: duration,
      });
    },

    trackStreakMaintained: (streakLength: number, workoutType: string) => {
      trackEvent(POSTHOG_CONFIG.events.streak_maintained, {
        streak_length: streakLength,
        workout_type: workoutType,
      });
    },

    trackJokerTokenUsed: (reason: string, streakLength: number) => {
      trackEvent(POSTHOG_CONFIG.events.joker_token_used, {
        reason,
        streak_length: streakLength,
      });
    },
  };
}

export function usePremiumTracking() {
  const { trackEvent, trackConversion } = useAnalytics();

  return {
    trackPremiumCTAViewed: (location: string, context: Record<string, any> = {}) => {
      trackEvent(POSTHOG_CONFIG.events.premium_cta_viewed, {
        cta_location: location,
        ...context,
      });
    },

    trackPremiumCTAClicked: (location: string, context: Record<string, any> = {}) => {
      trackEvent(POSTHOG_CONFIG.events.premium_cta_clicked, {
        cta_location: location,
        ...context,
      });
      
      trackConversion('Premium CTA Clicked', 'premium_conversion_funnel', {
        cta_location: location,
        ...context,
      });
    },

    trackCheckoutStarted: (plan: string, price: number) => {
      trackEvent(POSTHOG_CONFIG.events.checkout_started, {
        plan_type: plan,
        price_usd: price,
      });
      
      trackConversion('Checkout Started', 'premium_conversion_funnel', {
        plan_type: plan,
        price_usd: price,
      });
    },

    trackCheckoutCompleted: (plan: string, price: number, orderId: string) => {
      trackEvent(POSTHOG_CONFIG.events.checkout_completed, {
        plan_type: plan,
        price_usd: price,
        order_id: orderId,
      });
      
      trackConversion('Checkout Completed', 'premium_conversion_funnel', {
        plan_type: plan,
        price_usd: price,
        order_id: orderId,
      });
    },
  };
}