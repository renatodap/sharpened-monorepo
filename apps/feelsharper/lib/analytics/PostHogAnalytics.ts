/**
 * PostHogAnalytics - Analytics and tracking with PostHog
 * Maps to PRD: Analytics & Tracking
 */

import { abTesting } from '@/lib/experiments/ABTestingFramework';

export interface UserProperties {
  userId: string;
  email?: string;
  tier?: 'free' | 'pro' | 'elite';
  signupDate?: Date;
  lastActiveDate?: Date;
  totalWorkouts?: number;
  totalMealsLogged?: number;
  streakDays?: number;
  preferredLanguage?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  platform?: 'ios' | 'android' | 'web';
  appVersion?: string;
}

export interface EventProperties {
  [key: string]: any;
}

export interface ConversionFunnel {
  name: string;
  steps: FunnelStep[];
}

export interface FunnelStep {
  name: string;
  event: string;
  properties?: EventProperties;
}

export class PostHogAnalytics {
  private static instance: PostHogAnalytics;
  private posthog: any = null;
  private isInitialized: boolean = false;
  private userId: string | null = null;
  private userProperties: UserProperties = {} as UserProperties;
  private eventQueue: Array<{ event: string; properties?: EventProperties }> = [];
  private funnels: Map<string, ConversionFunnel> = new Map();
  private sessionStartTime: Date | null = null;
  private pageViewStartTime: Date | null = null;
  private currentPage: string | null = null;

  private constructor() {
    this.initializePostHog();
    this.setupDefaultFunnels();
  }

  static getInstance(): PostHogAnalytics {
    if (!PostHogAnalytics.instance) {
      PostHogAnalytics.instance = new PostHogAnalytics();
    }
    return PostHogAnalytics.instance;
  }

  /**
   * Initialize PostHog
   */
  private async initializePostHog(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Dynamically import PostHog
      const posthogModule = await import('posthog-js');
      const { default: posthog } = posthogModule;

      const apiKey = process.env.NEXT_PUBLIC_POSTHOG_API_KEY || 'phc_mock_key_for_development';
      const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

      posthog.init(apiKey, {
        api_host: apiHost,
        capture_pageview: false, // We'll handle this manually
        capture_pageleave: true,
        persistence: 'localStorage',
        autocapture: {
          dom_event_allowlist: ['click', 'submit', 'change'],
          element_allowlist: ['button', 'input', 'select', 'textarea', 'a']
        },
        loaded: (ph: any) => {
          this.posthog = ph;
          this.isInitialized = true;
          this.processEventQueue();
        }
      });

      // Start session
      this.startSession();
    } catch (error) {
      console.warn('PostHog not available, using mock analytics');
      this.initializeMockAnalytics();
    }
  }

  /**
   * Initialize mock analytics for development
   */
  private initializeMockAnalytics(): void {
    this.posthog = {
      identify: (id: string, props?: any) => console.log('Analytics identify:', id, props),
      capture: (event: string, props?: any) => console.log('Analytics event:', event, props),
      alias: (alias: string) => console.log('Analytics alias:', alias),
      reset: () => console.log('Analytics reset'),
      people: {
        set: (props: any) => console.log('Analytics people set:', props),
        set_once: (props: any) => console.log('Analytics people set_once:', props),
        increment: (props: any) => console.log('Analytics people increment:', props)
      },
      group: (type: string, id: string, props?: any) => console.log('Analytics group:', type, id, props)
    };
    this.isInitialized = true;
    this.processEventQueue();
  }

  /**
   * Identify user
   */
  identify(userId: string, properties?: Partial<UserProperties>): void {
    this.userId = userId;
    this.userProperties = {
      ...this.userProperties,
      userId,
      ...properties
    };

    if (this.isInitialized && this.posthog) {
      this.posthog.identify(userId, this.userProperties);
    }

    // Set user properties for A/B testing
    if (properties?.tier) {
      localStorage.setItem('user_tier', properties.tier);
    }
  }

  /**
   * Track event
   */
  track(event: string, properties?: EventProperties): void {
    const enrichedProperties = this.enrichEventProperties(properties);

    if (this.isInitialized && this.posthog) {
      this.posthog.capture(event, enrichedProperties);
      
      // Track in A/B testing framework if part of experiment
      this.trackExperimentEvent(event, enrichedProperties);
    } else {
      this.eventQueue.push({ event, properties: enrichedProperties });
    }

    // Update funnel progress
    this.updateFunnelProgress(event, enrichedProperties);
  }

  /**
   * Track page view
   */
  trackPageView(page: string, properties?: EventProperties): void {
    // Calculate time on previous page
    if (this.currentPage && this.pageViewStartTime) {
      const timeOnPage = (Date.now() - this.pageViewStartTime.getTime()) / 1000;
      this.track('page_left', {
        page: this.currentPage,
        time_on_page: timeOnPage
      });
    }

    this.currentPage = page;
    this.pageViewStartTime = new Date();

    this.track('page_view', {
      page,
      referrer: document.referrer,
      url: window.location.href,
      ...properties
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, action: string, properties?: EventProperties): void {
    this.track('feature_used', {
      feature,
      action,
      ...properties
    });

    // Increment feature usage counter
    if (this.posthog?.people) {
      this.posthog.people.increment({
        [`feature_${feature}_usage`]: 1
      });
    }
  }

  /**
   * Track conversion
   */
  trackConversion(
    conversionType: 'signup' | 'upgrade' | 'workout_completed' | 'meal_logged' | 'goal_achieved',
    properties?: EventProperties
  ): void {
    this.track(`conversion_${conversionType}`, {
      conversion_type: conversionType,
      ...properties
    });

    // Update user properties
    if (this.posthog?.people) {
      this.posthog.people.set_once({
        [`first_${conversionType}_date`]: new Date().toISOString()
      });
      this.posthog.people.increment({
        [`total_${conversionType}s`]: 1
      });
    }
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: EventProperties): void {
    this.track('error_occurred', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context
    });
  }

  /**
   * Track timing
   */
  trackTiming(category: string, variable: string, time: number, label?: string): void {
    this.track('timing', {
      category,
      variable,
      time,
      label
    });
  }

  /**
   * Setup conversion funnels
   */
  private setupDefaultFunnels(): void {
    // Onboarding funnel
    this.createFunnel({
      name: 'onboarding',
      steps: [
        { name: 'Signup Started', event: 'signup_started' },
        { name: 'Account Created', event: 'account_created' },
        { name: 'Profile Completed', event: 'profile_completed' },
        { name: 'First Workout', event: 'first_workout_logged' },
        { name: 'First Week Active', event: 'week_1_retention' }
      ]
    });

    // Upgrade funnel
    this.createFunnel({
      name: 'upgrade',
      steps: [
        { name: 'Viewed Pricing', event: 'pricing_viewed' },
        { name: 'Started Checkout', event: 'checkout_started' },
        { name: 'Payment Info Entered', event: 'payment_info_entered' },
        { name: 'Upgraded', event: 'conversion_upgrade' }
      ]
    });

    // Workout completion funnel
    this.createFunnel({
      name: 'workout_completion',
      steps: [
        { name: 'Workout Started', event: 'workout_started' },
        { name: 'Exercises Added', event: 'exercises_added' },
        { name: 'Sets Completed', event: 'sets_completed' },
        { name: 'Workout Saved', event: 'workout_saved' }
      ]
    });

    // Food logging funnel
    this.createFunnel({
      name: 'food_logging',
      steps: [
        { name: 'Food Log Opened', event: 'food_log_opened' },
        { name: 'Food Searched', event: 'food_searched' },
        { name: 'Food Selected', event: 'food_selected' },
        { name: 'Meal Saved', event: 'meal_saved' }
      ]
    });
  }

  /**
   * Create custom funnel
   */
  createFunnel(funnel: ConversionFunnel): void {
    this.funnels.set(funnel.name, funnel);
  }

  /**
   * Get funnel conversion rate
   */
  getFunnelConversionRate(funnelName: string): number {
    const funnel = this.funnels.get(funnelName);
    if (!funnel) return 0;

    // This would typically query PostHog's API for actual data
    // For now, return mock data
    return Math.random() * 100;
  }

  /**
   * Update funnel progress
   */
  private updateFunnelProgress(event: string, properties?: EventProperties): void {
    this.funnels.forEach((funnel, name) => {
      const stepIndex = funnel.steps.findIndex(step => step.event === event);
      if (stepIndex !== -1) {
        this.track('funnel_step_completed', {
          funnel_name: name,
          step_name: funnel.steps[stepIndex].name,
          step_index: stepIndex,
          total_steps: funnel.steps.length,
          ...properties
        });
      }
    });
  }

  /**
   * Track experiment event
   */
  private trackExperimentEvent(event: string, properties?: EventProperties): void {
    if (!this.userId) return;

    // Get active experiments for user
    const activeExperiments = abTesting.getActiveExperiments(this.userId);
    
    activeExperiments.forEach(({ experiment, variant }) => {
      // Track exposure and conversions
      if (event.includes('conversion')) {
        const metricId = event.replace('conversion_', '');
        abTesting.trackConversion(
          experiment.id,
          metricId,
          this.userId!,
          properties?.value
        );
      }

      // Add experiment context to event
      if (this.posthog) {
        this.posthog.capture(`experiment_${event}`, {
          ...properties,
          experiment_id: experiment.id,
          experiment_name: experiment.name,
          variant_id: variant.id,
          variant_name: variant.name
        });
      }
    });
  }

  /**
   * Enrich event properties
   */
  private enrichEventProperties(properties?: EventProperties): EventProperties {
    const enriched = {
      ...properties,
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
      user_id: this.userId,
      device_type: this.getDeviceType(),
      platform: this.getPlatform(),
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      referrer: document.referrer,
      url: window.location.href,
      user_agent: navigator.userAgent
    };

    // Add A/B test variants
    if (this.userId) {
      const experiments = abTesting.getActiveExperiments(this.userId);
      experiments.forEach(({ experiment, variant }) => {
        enriched[`experiment_${experiment.id}`] = variant.name;
      });
    }

    return enriched;
  }

  /**
   * Start session
   */
  private startSession(): void {
    this.sessionStartTime = new Date();
    const sessionId = this.generateSessionId();
    sessionStorage.setItem('analytics_session_id', sessionId);
    
    this.track('session_started', {
      session_id: sessionId
    });

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  /**
   * End session
   */
  private endSession(): void {
    if (!this.sessionStartTime) return;

    const sessionDuration = (Date.now() - this.sessionStartTime.getTime()) / 1000;
    
    this.track('session_ended', {
      session_id: this.getSessionId(),
      duration: sessionDuration
    });
  }

  /**
   * Process queued events
   */
  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const { event, properties } = this.eventQueue.shift()!;
      this.track(event, properties);
    }
  }

  /**
   * Get or generate session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get device type
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  /**
   * Get platform
   */
  private getPlatform(): 'ios' | 'android' | 'web' {
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
    if (/Android/i.test(userAgent)) return 'android';
    return 'web';
  }

  /**
   * Set super properties (sent with every event)
   */
  setSuperProperties(properties: EventProperties): void {
    if (this.posthog) {
      this.posthog.register(properties);
    }
  }

  /**
   * Create alias for user
   */
  alias(alias: string): void {
    if (this.posthog) {
      this.posthog.alias(alias);
    }
  }

  /**
   * Reset analytics (on logout)
   */
  reset(): void {
    this.userId = null;
    this.userProperties = {} as UserProperties;
    this.endSession();
    
    if (this.posthog) {
      this.posthog.reset();
    }
  }

  /**
   * Opt out of tracking
   */
  optOut(): void {
    if (this.posthog) {
      this.posthog.opt_out_capturing();
    }
    localStorage.setItem('analytics_opt_out', 'true');
  }

  /**
   * Opt in to tracking
   */
  optIn(): void {
    if (this.posthog) {
      this.posthog.opt_in_capturing();
    }
    localStorage.removeItem('analytics_opt_out');
  }

  /**
   * Check if user opted out
   */
  hasOptedOut(): boolean {
    return localStorage.getItem('analytics_opt_out') === 'true';
  }
}

// Export singleton instance
export const analytics = PostHogAnalytics.getInstance();