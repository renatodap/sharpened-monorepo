// PostHog Analytics Configuration
// Based on owner decision DG-006: Analytics approved for product optimization

export const POSTHOG_CONFIG = {
  // API Configuration
  api: {
    host: 'https://app.posthog.com',
    // Will use NEXT_PUBLIC_POSTHOG_KEY environment variable
  },
  
  // Project settings
  settings: {
    // Privacy-first configuration
    opt_out_capturing_by_default: false,
    respect_dnt: true,
    disable_session_recording: true, // Start with no recordings for privacy
    disable_surveys: false,
    disable_compression: false,
    
    // Performance settings
    loaded: (posthog: any) => {
      // Only enable debug in development
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
    
    // Bootstrap configuration for faster loading
    bootstrap: {
      distinctID: undefined, // Will be set after login
      featureFlags: {},
    },
  },
  
  // Feature flags for controlled rollouts
  featureFlags: {
    // Feel Sharper features
    'streaks-joker-tokens': 'streaks_joker_enabled',
    'ai-coaching': 'ai_coaching_enabled',
    'premium-analytics': 'premium_analytics_enabled',
    'social-leaderboards': 'social_leaderboards_enabled',
    
    // Study Sharper features  
    'focus-tracking-v2': 'focus_tracking_v2_enabled',
    'study-leagues': 'study_leagues_enabled',
    'ai-study-assistant': 'ai_study_assistant_enabled',
    'pomodoro-mode': 'pomodoro_mode_enabled',
    
    // Business features
    'premium-signup': 'premium_signup_enabled',
    'referral-program': 'referral_program_enabled',
    'social-sharing': 'social_sharing_enabled',
  },
  
  // Custom events tracking
  events: {
    // User lifecycle
    user_signed_up: 'User Signed Up',
    user_onboarded: 'User Completed Onboarding',
    user_upgraded: 'User Upgraded to Premium',
    user_churned: 'User Cancelled Subscription',
    
    // Core engagement (Feel Sharper)
    workout_logged: 'Workout Logged',
    meal_logged: 'Meal Logged',
    streak_started: 'Streak Started',
    streak_maintained: 'Streak Maintained',
    streak_broken: 'Streak Broken',
    joker_token_used: 'Joker Token Used',
    
    // Core engagement (Study Sharper)
    focus_session_started: 'Focus Session Started',
    focus_session_completed: 'Focus Session Completed',
    focus_session_abandoned: 'Focus Session Abandoned',
    study_goal_set: 'Study Goal Set',
    study_goal_achieved: 'Study Goal Achieved',
    
    // Social features
    league_joined: 'League Joined',
    leaderboard_viewed: 'Leaderboard Viewed',
    friend_challenged: 'Friend Challenged',
    
    // Monetization
    premium_cta_viewed: 'Premium CTA Viewed',
    premium_cta_clicked: 'Premium CTA Clicked',
    checkout_started: 'Checkout Started',
    checkout_completed: 'Checkout Completed',
    checkout_abandoned: 'Checkout Abandoned',
    
    // AI interactions
    ai_coaching_used: 'AI Coaching Used',
    ai_insights_viewed: 'AI Insights Viewed',
    
    // Technical
    page_view: '$pageview', // PostHog auto-captures this
    app_crashed: 'App Crashed',
    api_error: 'API Error',
  },
  
  // User properties to track
  userProperties: {
    // Demographics
    signup_date: 'signup_date',
    subscription_tier: 'subscription_tier',
    user_type: 'user_type', // 'student', 'professional', 'fitness_enthusiast'
    
    // Engagement scores
    weekly_active_days: 'weekly_active_days',
    streak_length: 'current_streak_length',
    total_workouts: 'total_workouts_logged',
    total_focus_time: 'total_focus_minutes',
    
    // Feature usage
    features_used: 'features_used',
    last_active_date: 'last_active_date',
    preferred_app: 'preferred_app', // 'feelsharper', 'studysharper', 'both'
    
    // Technical
    platform: 'platform',
    browser: 'browser',
    device_type: 'device_type',
    utm_source: 'utm_source',
    utm_campaign: 'utm_campaign',
  },
  
  // Group properties (for business accounts later)
  groupProperties: {
    organization_size: 'organization_size',
    industry: 'industry',
    plan_type: 'plan_type',
  },
  
  // Privacy settings aligned with our privacy controls
  privacy: {
    // What data we collect based on user privacy settings
    minimal: {
      events: ['user_signed_up', 'user_upgraded', 'checkout_completed'],
      properties: ['subscription_tier', 'signup_date'],
      disable_recordings: true,
      disable_autocapture: true,
    },
    
    standard: {
      events: 'all',
      properties: 'all_except_personal',
      disable_recordings: true,
      disable_autocapture: false,
    },
    
    full: {
      events: 'all',
      properties: 'all',
      disable_recordings: false,
      disable_autocapture: false,
    },
  },
  
  // Funnel tracking for conversion optimization
  funnels: {
    signup_funnel: [
      'Landing Page Viewed',
      'Signup CTA Clicked', 
      'Signup Form Started',
      'Signup Form Completed',
      'Email Verified',
      'Onboarding Started',
      'Onboarding Completed',
      'First Action Completed',
    ],
    
    premium_conversion_funnel: [
      'Premium CTA Viewed',
      'Premium CTA Clicked',
      'Pricing Page Viewed',
      'Checkout Started',
      'Checkout Completed',
    ],
    
    engagement_funnel: [
      'User Signed Up',
      'First Session Completed',
      'Second Day Return',
      'Week One Active',
      'Month One Retained',
    ],
  },
  
  // Cohort definitions for retention analysis
  cohorts: {
    power_users: {
      conditions: [
        { property: 'weekly_active_days', operator: 'gte', value: 5 },
        { property: 'total_sessions', operator: 'gte', value: 20 },
      ],
    },
    
    at_risk_users: {
      conditions: [
        { property: 'days_since_last_active', operator: 'gte', value: 7 },
        { property: 'subscription_tier', operator: 'eq', value: 'premium' },
      ],
    },
    
    conversion_candidates: {
      conditions: [
        { property: 'weekly_active_days', operator: 'gte', value: 3 },
        { property: 'subscription_tier', operator: 'eq', value: 'free' },
        { property: 'days_since_signup', operator: 'gte', value: 7 },
      ],
    },
  },
};

// PostHog client wrapper
export class PostHogAnalytics {
  private posthog: any;
  private initialized = false;
  
  constructor() {
    // Will be initialized when PostHog loads
  }
  
  async initialize(userId?: string) {
    if (typeof window === 'undefined') return; // Server-side guard
    
    // Dynamic import to avoid SSR issues
    const { default: posthog } = await import('posthog-js');
    
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!apiKey) {
      console.warn('PostHog API key not found');
      return;
    }
    
    posthog.init(apiKey, POSTHOG_CONFIG.settings);
    this.posthog = posthog;
    this.initialized = true;
    
    // Identify user if logged in
    if (userId) {
      this.identify(userId);
    }
  }
  
  identify(userId: string, properties: Record<string, any> = {}) {
    if (!this.initialized || !this.posthog) return;
    
    this.posthog.identify(userId, properties);
  }
  
  track(event: string, properties: Record<string, any> = {}) {
    if (!this.initialized || !this.posthog) return;
    
    // Add common properties
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
    };
    
    this.posthog.capture(event, enrichedProperties);
  }
  
  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized || !this.posthog) return;
    
    this.posthog.people.set(properties);
  }
  
  incrementUserProperty(property: string, value: number = 1) {
    if (!this.initialized || !this.posthog) return;
    
    this.posthog.people.increment(property, value);
  }
  
  isFeatureEnabled(flagKey: string): boolean {
    if (!this.initialized || !this.posthog) return false;
    
    return this.posthog.isFeatureEnabled(flagKey);
  }
  
  getFeatureFlag(flagKey: string): string | boolean {
    if (!this.initialized || !this.posthog) return false;
    
    return this.posthog.getFeatureFlag(flagKey);
  }
  
  // Privacy-respecting methods
  optOut() {
    if (!this.initialized || !this.posthog) return;
    
    this.posthog.opt_out_capturing();
  }
  
  optIn() {
    if (!this.initialized || !this.posthog) return;
    
    this.posthog.opt_in_capturing();
  }
  
  reset() {
    if (!this.initialized || !this.posthog) return;
    
    this.posthog.reset();
  }
  
  // Business intelligence methods
  trackConversionFunnel(step: string, funnelName: string, properties: Record<string, any> = {}) {
    this.track(step, {
      ...properties,
      funnel: funnelName,
      funnel_step: step,
    });
  }
  
  trackError(error: Error, context: Record<string, any> = {}) {
    this.track(POSTHOG_CONFIG.events.api_error, {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }
  
  trackPageView(path: string, properties: Record<string, any> = {}) {
    this.track(POSTHOG_CONFIG.events.page_view, {
      $current_url: window.location.href,
      path,
      ...properties,
    });
  }
  
  // Helper for A/B testing
  getVariant(experimentKey: string): string {
    const flag = this.getFeatureFlag(experimentKey);
    return typeof flag === 'string' ? flag : 'control';
  }
}

// Singleton instance
let analyticsInstance: PostHogAnalytics | null = null;

export function getAnalytics(): PostHogAnalytics {
  if (!analyticsInstance) {
    analyticsInstance = new PostHogAnalytics();
  }
  return analyticsInstance;
}

// React hook for easy usage
export function useAnalytics() {
  const analytics = getAnalytics();
  
  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
    isFeatureEnabled: analytics.isFeatureEnabled.bind(analytics),
    getFeatureFlag: analytics.getFeatureFlag.bind(analytics),
    trackConversionFunnel: analytics.trackConversionFunnel.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
  };
}