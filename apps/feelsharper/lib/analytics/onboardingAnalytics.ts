// Comprehensive Onboarding Analytics System
// Tracks conversion funnel, drop-off points, A/B tests, and activation metrics

export interface OnboardingStep {
  step: number;
  name: string;
  required: boolean;
  timeSpent?: number;
  completed: boolean;
  abandoned?: boolean;
  abandonReason?: string;
}

export interface OnboardingSession {
  sessionId: string;
  userId?: string;
  isGuest: boolean;
  entryPoint: 'homepage' | 'quick_win' | 'signup' | 'direct';
  variant?: string; // For A/B testing
  startTime: string;
  endTime?: string;
  completed: boolean;
  steps: OnboardingStep[];
  totalTimeSpent: number;
  dropOffStep?: number;
  conversionEvents: ConversionEvent[];
  userAgent: string;
  referrer?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export interface ConversionEvent {
  event: string;
  timestamp: string;
  step?: number;
  data?: Record<string, any>;
}

export interface ABTestVariant {
  name: string;
  weight: number;
  config: Record<string, any>;
}

export interface OnboardingMetrics {
  totalSessions: number;
  completionRate: number;
  averageTimeToComplete: number;
  dropOffByStep: Record<number, number>;
  conversionsByEntryPoint: Record<string, number>;
  variantPerformance: Record<string, {
    sessions: number;
    completionRate: number;
    averageTime: number;
  }>;
  activationRate: number;
  timeToActivation: number;
}

class OnboardingAnalyticsManager {
  private currentSession: OnboardingSession | null = null;
  private stepStartTime: number | null = null;
  private abTestVariants: Record<string, ABTestVariant[]> = {
    'onboarding_flow': [
      { name: 'standard', weight: 0.5, config: { showSkip: true, maxSteps: 5 } },
      { name: 'minimal', weight: 0.3, config: { showSkip: false, maxSteps: 3 } },
      { name: 'gamified', weight: 0.2, config: { showSkip: true, gamification: true } }
    ],
    'quick_win_cta': [
      { name: 'workout_focused', weight: 0.5, config: { primaryCTA: 'Log Workout' } },
      { name: 'goal_focused', weight: 0.5, config: { primaryCTA: 'Set Goals' } }
    ]
  };

  // Start new onboarding session
  public startSession(entryPoint: OnboardingSession['entryPoint'], userId?: string): string {
    const sessionId = `onb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const variant = this.getABTestVariant('onboarding_flow');
    
    this.currentSession = {
      sessionId,
      userId,
      isGuest: !userId,
      entryPoint,
      variant: variant.name,
      startTime: new Date().toISOString(),
      completed: false,
      steps: [],
      totalTimeSpent: 0,
      conversionEvents: [],
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      utm: this.extractUTMParams(),
    };

    // Track session start
    this.trackConversionEvent('onboarding_started', {
      entry_point: entryPoint,
      variant: variant.name,
      is_guest: !userId,
    });

    // Save to localStorage for persistence
    this.saveSession();

    return sessionId;
  }

  // Track step entry
  public enterStep(stepNumber: number, stepName: string, required = true): void {
    if (!this.currentSession) return;

    this.stepStartTime = Date.now();
    
    // Complete previous step if exists
    const previousStep = this.currentSession.steps.find(s => s.step === stepNumber - 1);
    if (previousStep && !previousStep.completed) {
      previousStep.completed = true;
      previousStep.timeSpent = Date.now() - (this.stepStartTime || Date.now());
    }

    // Add new step
    const step: OnboardingStep = {
      step: stepNumber,
      name: stepName,
      required,
      completed: false,
    };

    this.currentSession.steps.push(step);
    
    this.trackConversionEvent('onboarding_step_entered', {
      step: stepNumber,
      step_name: stepName,
      required,
    });

    this.saveSession();
  }

  // Track step completion
  public completeStep(stepNumber: number, data?: Record<string, any>): void {
    if (!this.currentSession || !this.stepStartTime) return;

    const step = this.currentSession.steps.find(s => s.step === stepNumber);
    if (step) {
      step.completed = true;
      step.timeSpent = Date.now() - this.stepStartTime;
    }

    this.trackConversionEvent('onboarding_step_completed', {
      step: stepNumber,
      time_spent_ms: step?.timeSpent,
      ...data,
    });

    this.saveSession();
  }

  // Track step abandonment
  public abandonStep(stepNumber: number, reason?: string): void {
    if (!this.currentSession) return;

    const step = this.currentSession.steps.find(s => s.step === stepNumber);
    if (step) {
      step.abandoned = true;
      step.abandonReason = reason;
      step.timeSpent = this.stepStartTime ? Date.now() - this.stepStartTime : 0;
    }

    this.currentSession.dropOffStep = stepNumber;

    this.trackConversionEvent('onboarding_step_abandoned', {
      step: stepNumber,
      reason: reason || 'unknown',
      time_spent_ms: step?.timeSpent,
    });

    this.saveSession();
  }

  // Complete entire onboarding flow
  public completeOnboarding(finalData?: Record<string, any>): void {
    if (!this.currentSession) return;

    this.currentSession.completed = true;
    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.totalTimeSpent = 
      new Date(this.currentSession.endTime).getTime() - 
      new Date(this.currentSession.startTime).getTime();

    this.trackConversionEvent('onboarding_completed', {
      total_steps: this.currentSession.steps.length,
      total_time_ms: this.currentSession.totalTimeSpent,
      variant: this.currentSession.variant,
      ...finalData,
    });

    // Send to analytics
    this.sendSessionData();
    this.clearSession();
  }

  // Track specific conversion events
  private trackConversionEvent(event: string, data?: Record<string, any>): void {
    if (!this.currentSession) return;

    const conversionEvent: ConversionEvent = {
      event,
      timestamp: new Date().toISOString(),
      step: this.currentSession.steps.length,
      data,
    };

    this.currentSession.conversionEvents.push(conversionEvent);

    // Also track with main analytics system
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track(event, {
        session_id: this.currentSession.sessionId,
        entry_point: this.currentSession.entryPoint,
        variant: this.currentSession.variant,
        is_guest: this.currentSession.isGuest,
        ...data,
      });
    }
  }

  // Get A/B test variant
  private getABTestVariant(testName: string): ABTestVariant {
    const variants = this.abTestVariants[testName];
    if (!variants || variants.length === 0) {
      return { name: 'control', weight: 1, config: {} };
    }

    // Check if user already has a variant assigned
    const existingVariant = this.getStoredVariant(testName);
    if (existingVariant) {
      return variants.find(v => v.name === existingVariant) || variants[0];
    }

    // Assign new variant based on weights
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        this.storeVariant(testName, variant.name);
        return variant;
      }
    }

    // Fallback to first variant
    this.storeVariant(testName, variants[0].name);
    return variants[0];
  }

  // Store A/B test variant
  private storeVariant(testName: string, variantName: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`ab_test_${testName}`, variantName);
  }

  // Get stored A/B test variant
  private getStoredVariant(testName: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`ab_test_${testName}`);
  }

  // Extract UTM parameters
  private extractUTMParams(): OnboardingSession['utm'] {
    if (typeof window === 'undefined') return undefined;
    
    const params = new URLSearchParams(window.location.search);
    return {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
    };
  }

  // Save session to localStorage
  private saveSession(): void {
    if (!this.currentSession || typeof window === 'undefined') return;
    localStorage.setItem('onboarding_session', JSON.stringify(this.currentSession));
  }

  // Load session from localStorage
  public loadSession(): OnboardingSession | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('onboarding_session');
      if (stored) {
        this.currentSession = JSON.parse(stored);
        return this.currentSession;
      }
    } catch (error) {
      console.error('Failed to load onboarding session:', error);
    }
    
    return null;
  }

  // Clear session
  private clearSession(): void {
    this.currentSession = null;
    this.stepStartTime = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onboarding_session');
    }
  }

  // Send session data to backend
  private async sendSessionData(): Promise<void> {
    if (!this.currentSession) return;

    try {
      // In production, send to your analytics endpoint
      await fetch('/api/analytics/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.currentSession),
      });
    } catch (error) {
      console.error('Failed to send onboarding analytics:', error);
    }
  }

  // Get current session info
  public getCurrentSession(): OnboardingSession | null {
    return this.currentSession;
  }

  // Calculate metrics for current session
  public getSessionMetrics(): Partial<OnboardingMetrics> {
    if (!this.currentSession) return {};

    const completedSteps = this.currentSession.steps.filter(s => s.completed);
    const totalSteps = this.currentSession.steps.length;
    
    return {
      completionRate: totalSteps > 0 ? completedSteps.length / totalSteps : 0,
      averageTimeToComplete: this.currentSession.totalTimeSpent,
      dropOffByStep: this.currentSession.dropOffStep 
        ? { [this.currentSession.dropOffStep]: 1 }
        : {},
    };
  }

  // Track quick win interactions
  public trackQuickWin(action: string, data?: Record<string, any>): void {
    this.trackConversionEvent('quick_win_interaction', {
      action,
      ...data,
    });
  }

  // Track activation events
  public trackActivation(event: string, data?: Record<string, any>): void {
    this.trackConversionEvent('activation_event', {
      activation_event: event,
      ...data,
    });

    // Mark as activated if it's a significant event
    const significantEvents = ['first_workout_logged', 'first_meal_logged', 'first_ai_interaction'];
    if (significantEvents.includes(event)) {
      this.trackConversionEvent('user_activated', {
        activation_trigger: event,
        ...data,
      });
    }
  }
}

// Singleton instance
export const onboardingAnalytics = new OnboardingAnalyticsManager();

// React hook for onboarding analytics
export function useOnboardingAnalytics() {
  return {
    startSession: (entryPoint: OnboardingSession['entryPoint'], userId?: string) => 
      onboardingAnalytics.startSession(entryPoint, userId),
    
    enterStep: (step: number, name: string, required?: boolean) => 
      onboardingAnalytics.enterStep(step, name, required),
    
    completeStep: (step: number, data?: Record<string, any>) => 
      onboardingAnalytics.completeStep(step, data),
    
    abandonStep: (step: number, reason?: string) => 
      onboardingAnalytics.abandonStep(step, reason),
    
    completeOnboarding: (data?: Record<string, any>) => 
      onboardingAnalytics.completeOnboarding(data),
    
    trackQuickWin: (action: string, data?: Record<string, any>) => 
      onboardingAnalytics.trackQuickWin(action, data),
    
    trackActivation: (event: string, data?: Record<string, any>) => 
      onboardingAnalytics.trackActivation(event, data),
    
    getCurrentSession: () => onboardingAnalytics.getCurrentSession(),
    
    getSessionMetrics: () => onboardingAnalytics.getSessionMetrics(),
  };
}

// Helper for A/B testing
export function useABTest(testName: string) {
  const analytics = onboardingAnalytics;
  const variant = analytics['getABTestVariant'](testName);
  
  return {
    variant: variant.name,
    config: variant.config,
    isVariant: (name: string) => variant.name === name,
  };
}