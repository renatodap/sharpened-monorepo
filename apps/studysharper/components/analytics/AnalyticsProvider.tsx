// Analytics Provider for Study Sharper
// Integrates PostHog with privacy controls and study-specific tracking

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getAnalytics, PostHogAnalytics, POSTHOG_CONFIG } from '@/packages/analytics/posthog-config';
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
        app: 'studysharper',
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

      // Get study stats
      const { data: stats } = await supabase
        .from('study_stats')
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
          [POSTHOG_CONFIG.userProperties.user_type]: profile.user_type || 'student',
          [POSTHOG_CONFIG.userProperties.preferred_app]: 'studysharper',
          [POSTHOG_CONFIG.userProperties.total_focus_time]: stats?.total_focus_minutes || 0,
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
      analytics['posthog']?.config?.disable_session_recording = true;
    }

    if (config.disable_autocapture) {
      analytics['posthog']?.config?.autocapture = false;
    }

    // Track privacy level change
    analytics.track('Privacy Level Changed', {
      previous_level: privacyLevel,
      new_level: level,
      app: 'studysharper',
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
      app: 'studysharper',
      privacy_level: privacyLevel,
    };

    analytics.track(event, enrichedProperties);
  };

  const trackConversion = (step: string, funnel: string, properties: Record<string, any> = {}) => {
    if (!isInitialized) return;

    analytics.trackConversionFunnel(step, funnel, {
      ...properties,
      app: 'studysharper',
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

// Custom hooks for study-specific tracking patterns
export function useFocusTracking() {
  const { trackEvent, trackConversion } = useAnalytics();

  return {
    trackFocusSessionStarted: (duration: number, subject: string, properties: Record<string, any> = {}) => {
      trackEvent(POSTHOG_CONFIG.events.focus_session_started, {
        planned_duration_minutes: duration,
        subject,
        ...properties,
      });
      
      trackConversion('Focus Session Started', 'engagement_funnel', {
        planned_duration_minutes: duration,
        subject,
      });
    },

    trackFocusSessionCompleted: (
      plannedDuration: number,
      actualDuration: number,
      subject: string,
      accuracyScore: number,
      properties: Record<string, any> = {}
    ) => {
      trackEvent(POSTHOG_CONFIG.events.focus_session_completed, {
        planned_duration_minutes: plannedDuration,
        actual_duration_minutes: actualDuration,
        subject,
        accuracy_score: accuracyScore,
        completion_rate: (actualDuration / plannedDuration) * 100,
        ...properties,
      });
      
      trackConversion('Focus Session Completed', 'engagement_funnel', {
        completion_rate: (actualDuration / plannedDuration) * 100,
        accuracy_score: accuracyScore,
      });
    },

    trackFocusSessionAbandoned: (
      plannedDuration: number,
      actualDuration: number,
      reason: string,
      properties: Record<string, any> = {}
    ) => {
      trackEvent(POSTHOG_CONFIG.events.focus_session_abandoned, {
        planned_duration_minutes: plannedDuration,
        actual_duration_minutes: actualDuration,
        abandonment_reason: reason,
        completion_rate: (actualDuration / plannedDuration) * 100,
        ...properties,
      });
    },

    trackAccuracyImprovement: (previousScore: number, newScore: number, subject: string) => {
      trackEvent('Focus Accuracy Improved', {
        previous_accuracy: previousScore,
        new_accuracy: newScore,
        improvement: newScore - previousScore,
        subject,
      });
    },
  };
}

export function useStudyGoalTracking() {
  const { trackEvent, trackConversion } = useAnalytics();

  return {
    trackGoalSet: (goalType: string, target: number, timeframe: string, properties: Record<string, any> = {}) => {
      trackEvent(POSTHOG_CONFIG.events.study_goal_set, {
        goal_type: goalType,
        target_value: target,
        timeframe,
        ...properties,
      });
    },

    trackGoalAchieved: (goalType: string, target: number, actualValue: number, properties: Record<string, any> = {}) => {
      trackEvent(POSTHOG_CONFIG.events.study_goal_achieved, {
        goal_type: goalType,
        target_value: target,
        actual_value: actualValue,
        overachievement: actualValue - target,
        ...properties,
      });
      
      trackConversion('Study Goal Achieved', 'engagement_funnel', {
        goal_type: goalType,
        overachievement: actualValue - target,
      });
    },

    trackGoalProgress: (goalType: string, target: number, currentValue: number, percentComplete: number) => {
      trackEvent('Study Goal Progress', {
        goal_type: goalType,
        target_value: target,
        current_value: currentValue,
        percent_complete: percentComplete,
      });
    },
  };
}

export function useLeagueTracking() {
  const { trackEvent, trackConversion } = useAnalytics();

  return {
    trackLeagueJoined: (leagueId: string, leagueType: string, tier: number, properties: Record<string, any> = {}) => {
      trackEvent(POSTHOG_CONFIG.events.league_joined, {
        league_id: leagueId,
        league_type: leagueType,
        tier,
        ...properties,
      });
      
      trackConversion('League Joined', 'engagement_funnel', {
        league_type: leagueType,
        tier,
      });
    },

    trackLeaderboardViewed: (leagueId: string, userRank: number, totalParticipants: number) => {
      trackEvent(POSTHOG_CONFIG.events.leaderboard_viewed, {
        league_id: leagueId,
        user_rank: userRank,
        total_participants: totalParticipants,
        percentile: ((totalParticipants - userRank) / totalParticipants) * 100,
      });
    },

    trackRankImprovement: (leagueId: string, previousRank: number, newRank: number, improvement: number) => {
      trackEvent('League Rank Improved', {
        league_id: leagueId,
        previous_rank: previousRank,
        new_rank: newRank,
        rank_improvement: improvement,
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

    trackAICoachingUsed: (feature: string, context: Record<string, any> = {}) => {
      trackEvent(POSTHOG_CONFIG.events.ai_coaching_used, {
        ai_feature: feature,
        ...context,
      });
    },

    trackAdvancedAnalyticsViewed: (analysisType: string, context: Record<string, any> = {}) => {
      trackEvent(POSTHOG_CONFIG.events.ai_insights_viewed, {
        analysis_type: analysisType,
        ...context,
      });
    },
  };
}