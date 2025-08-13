// User Activation Tracking System
// Tracks meaningful actions that indicate user engagement and value realization

export interface ActivationEvent {
  id: string;
  userId?: string;
  sessionId?: string;
  event: string;
  category: 'core' | 'secondary' | 'premium';
  points: number;
  timestamp: string;
  data?: Record<string, any>;
  context: {
    source: string;
    userType: 'guest' | 'registered';
    daysSinceSignup?: number;
    previousEvents: number;
  };
}

export interface ActivationMilestone {
  name: string;
  threshold: number;
  description: string;
  reward?: string;
  unlocks?: string[];
}

export interface UserActivationProfile {
  userId?: string;
  sessionId?: string;
  activationScore: number;
  isActivated: boolean;
  activationDate?: string;
  timeToActivation?: number; // milliseconds
  events: ActivationEvent[];
  milestonesReached: string[];
  currentStreak: number;
  lastActivity: string;
  engagementLevel: 'low' | 'medium' | 'high';
  nextMilestone?: ActivationMilestone;
}

// Define activation events with point values
const ACTIVATION_EVENTS = {
  // Core Events (high value)
  'first_workout_logged': { points: 25, category: 'core' as const },
  'first_meal_logged': { points: 20, category: 'core' as const },
  'ai_coach_interaction': { points: 15, category: 'core' as const },
  'goal_set': { points: 15, category: 'core' as const },
  'profile_completed': { points: 10, category: 'core' as const },

  // Secondary Events (medium value)
  'workout_repeated': { points: 10, category: 'secondary' as const },
  'meal_repeated': { points: 8, category: 'secondary' as const },
  'progress_viewed': { points: 5, category: 'secondary' as const },
  'insight_viewed': { points: 5, category: 'secondary' as const },
  'streak_day': { points: 8, category: 'secondary' as const },
  'photo_logged': { points: 12, category: 'secondary' as const },
  'weight_tracked': { points: 6, category: 'secondary' as const },

  // Premium Events (premium features)
  'program_started': { points: 30, category: 'premium' as const },
  'ai_plan_generated': { points: 20, category: 'premium' as const },
  'advanced_analytics_viewed': { points: 10, category: 'premium' as const },
  'custom_meal_created': { points: 15, category: 'premium' as const },

  // Engagement Events
  'daily_login': { points: 3, category: 'secondary' as const },
  'feature_explored': { points: 2, category: 'secondary' as const },
  'tip_read': { points: 1, category: 'secondary' as const },
  'share_achievement': { points: 8, category: 'secondary' as const },
} as const;

// Activation milestones
const ACTIVATION_MILESTONES: ActivationMilestone[] = [
  {
    name: 'getting_started',
    threshold: 25,
    description: 'Logged your first activity',
    reward: 'Welcome badge',
    unlocks: ['AI coaching tips']
  },
  {
    name: 'engaged_user',
    threshold: 60,
    description: 'Actively using core features',
    reward: 'Progress insights',
    unlocks: ['Trend analysis', 'Weekly reports']
  },
  {
    name: 'power_user',
    threshold: 120,
    description: 'Fully activated and engaged',
    reward: 'Power user badge',
    unlocks: ['Advanced features', 'Beta access']
  },
  {
    name: 'fitness_champion',
    threshold: 200,
    description: 'Fitness tracking expert',
    reward: 'Champion status',
    unlocks: ['Community features', 'Premium trial']
  }
];

// Activation threshold (minimum points needed to be considered "activated")
const ACTIVATION_THRESHOLD = 60;

class ActivationSystemManager {
  private userProfile: UserActivationProfile | null = null;
  private readonly storageKey = 'user_activation_profile';

  constructor() {
    this.loadProfile();
  }

  // Initialize activation tracking for user
  public initializeUser(userId?: string, sessionId?: string): UserActivationProfile {
    this.userProfile = {
      userId,
      sessionId,
      activationScore: 0,
      isActivated: false,
      events: [],
      milestonesReached: [],
      currentStreak: 0,
      lastActivity: new Date().toISOString(),
      engagementLevel: 'low',
    };

    this.saveProfile();
    return this.userProfile;
  }

  // Track activation event
  public trackEvent(
    eventName: keyof typeof ACTIVATION_EVENTS, 
    data?: Record<string, any>,
    source = 'app'
  ): ActivationEvent | null {
    if (!this.userProfile) {
      console.warn('Activation system not initialized');
      return null;
    }

    const eventConfig = ACTIVATION_EVENTS[eventName];
    if (!eventConfig) {
      console.warn(`Unknown activation event: ${eventName}`);
      return null;
    }

    // Create activation event
    const activationEvent: ActivationEvent = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userProfile.userId,
      sessionId: this.userProfile.sessionId,
      event: eventName,
      category: eventConfig.category,
      points: eventConfig.points,
      timestamp: new Date().toISOString(),
      data,
      context: {
        source,
        userType: this.userProfile.userId ? 'registered' : 'guest',
        daysSinceSignup: this.getDaysSinceSignup(),
        previousEvents: this.userProfile.events.length,
      },
    };

    // Add to user profile
    this.userProfile.events.push(activationEvent);
    this.userProfile.activationScore += eventConfig.points;
    this.userProfile.lastActivity = new Date().toISOString();

    // Check for activation
    this.checkActivation();

    // Check for milestones
    this.checkMilestones();

    // Update engagement level
    this.updateEngagementLevel();

    // Save changes
    this.saveProfile();

    // Send to analytics
    this.sendActivationEvent(activationEvent);

    // Track with main analytics system
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Activation Event', {
        event_name: eventName,
        category: eventConfig.category,
        points: eventConfig.points,
        total_score: this.userProfile.activationScore,
        is_activated: this.userProfile.isActivated,
        engagement_level: this.userProfile.engagementLevel,
        user_type: this.userProfile.userId ? 'registered' : 'guest',
        ...data,
      });
    }

    return activationEvent;
  }

  // Get current activation status
  public getActivationStatus(): {
    isActivated: boolean;
    score: number;
    threshold: number;
    progress: number;
    nextMilestone?: ActivationMilestone;
    timeToActivation?: number;
    engagementLevel: string;
  } {
    if (!this.userProfile) {
      return {
        isActivated: false,
        score: 0,
        threshold: ACTIVATION_THRESHOLD,
        progress: 0,
        engagementLevel: 'low',
      };
    }

    const nextMilestone = ACTIVATION_MILESTONES.find(
      m => !this.userProfile!.milestonesReached.includes(m.name) &&
          m.threshold > this.userProfile!.activationScore
    );

    return {
      isActivated: this.userProfile.isActivated,
      score: this.userProfile.activationScore,
      threshold: ACTIVATION_THRESHOLD,
      progress: Math.min(this.userProfile.activationScore / ACTIVATION_THRESHOLD, 1),
      nextMilestone,
      timeToActivation: this.userProfile.timeToActivation,
      engagementLevel: this.userProfile.engagementLevel,
    };
  }

  // Get user's activation journey
  public getActivationJourney(): {
    events: ActivationEvent[];
    milestones: (ActivationMilestone & { reached: boolean; reachedDate?: string })[];
    timeline: Array<{
      date: string;
      events: ActivationEvent[];
      scoreChange: number;
    }>;
  } {
    if (!this.userProfile) {
      return { events: [], milestones: [], timeline: [] };
    }

    // Group events by date
    const timeline = this.userProfile.events.reduce((acc, event) => {
      const date = event.timestamp.split('T')[0];
      const existing = acc.find(item => item.date === date);
      
      if (existing) {
        existing.events.push(event);
        existing.scoreChange += event.points;
      } else {
        acc.push({
          date,
          events: [event],
          scoreChange: event.points,
        });
      }
      
      return acc;
    }, [] as any[]);

    // Add milestone info
    const milestonesWithStatus = ACTIVATION_MILESTONES.map(milestone => ({
      ...milestone,
      reached: this.userProfile!.milestonesReached.includes(milestone.name),
      reachedDate: this.getMilestoneReachedDate(milestone.name),
    }));

    return {
      events: this.userProfile.events,
      milestones: milestonesWithStatus,
      timeline: timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
  }

  // Check if user should be considered activated
  private checkActivation(): void {
    if (!this.userProfile || this.userProfile.isActivated) return;

    if (this.userProfile.activationScore >= ACTIVATION_THRESHOLD) {
      this.userProfile.isActivated = true;
      this.userProfile.activationDate = new Date().toISOString();
      
      // Calculate time to activation
      const firstEvent = this.userProfile.events[0];
      if (firstEvent) {
        this.userProfile.timeToActivation = 
          new Date(this.userProfile.activationDate).getTime() - 
          new Date(firstEvent.timestamp).getTime();
      }

      // Track activation achievement
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.track('User Activated', {
          activation_score: this.userProfile.activationScore,
          time_to_activation_hours: this.userProfile.timeToActivation ? 
            this.userProfile.timeToActivation / (1000 * 60 * 60) : null,
          total_events: this.userProfile.events.length,
          user_type: this.userProfile.userId ? 'registered' : 'guest',
        });
      }
    }
  }

  // Check for milestone achievements
  private checkMilestones(): void {
    if (!this.userProfile) return;

    for (const milestone of ACTIVATION_MILESTONES) {
      if (
        this.userProfile.activationScore >= milestone.threshold &&
        !this.userProfile.milestonesReached.includes(milestone.name)
      ) {
        this.userProfile.milestonesReached.push(milestone.name);
        
        // Track milestone achievement
        if (typeof window !== 'undefined' && (window as any).posthog) {
          (window as any).posthog.track('Activation Milestone Reached', {
            milestone_name: milestone.name,
            milestone_threshold: milestone.threshold,
            user_score: this.userProfile.activationScore,
            user_type: this.userProfile.userId ? 'registered' : 'guest',
          });
        }

        // Show milestone celebration (emit custom event)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('activation-milestone', {
            detail: { milestone, userProfile: this.userProfile }
          }));
        }
      }
    }
  }

  // Update user engagement level
  private updateEngagementLevel(): void {
    if (!this.userProfile) return;

    const recentEvents = this.getRecentEvents(7); // Last 7 days
    const score = this.userProfile.activationScore;

    if (recentEvents.length >= 10 && score >= 100) {
      this.userProfile.engagementLevel = 'high';
    } else if (recentEvents.length >= 5 && score >= 40) {
      this.userProfile.engagementLevel = 'medium';
    } else {
      this.userProfile.engagementLevel = 'low';
    }
  }

  // Get events from recent days
  private getRecentEvents(days: number): ActivationEvent[] {
    if (!this.userProfile) return [];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return this.userProfile.events.filter(
      event => new Date(event.timestamp) > cutoff
    );
  }

  // Calculate days since signup
  private getDaysSinceSignup(): number | undefined {
    if (!this.userProfile?.events.length) return undefined;

    const firstEvent = this.userProfile.events[0];
    const daysDiff = (new Date().getTime() - new Date(firstEvent.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(daysDiff);
  }

  // Get milestone reached date
  private getMilestoneReachedDate(milestoneName: string): string | undefined {
    if (!this.userProfile) return undefined;

    const milestone = ACTIVATION_MILESTONES.find(m => m.name === milestoneName);
    if (!milestone) return undefined;

    // Find the event that pushed score over milestone threshold
    let cumulativeScore = 0;
    for (const event of this.userProfile.events) {
      cumulativeScore += event.points;
      if (cumulativeScore >= milestone.threshold) {
        return event.timestamp;
      }
    }

    return undefined;
  }

  // Save profile to localStorage
  private saveProfile(): void {
    if (!this.userProfile || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.userProfile));
    } catch (error) {
      console.error('Failed to save activation profile:', error);
    }
  }

  // Load profile from localStorage
  private loadProfile(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.userProfile = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load activation profile:', error);
    }
  }

  // Send activation event to backend
  private async sendActivationEvent(event: ActivationEvent): Promise<void> {
    try {
      await fetch('/api/analytics/activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send activation event:', error);
    }
  }

  // Get current user profile
  public getUserProfile(): UserActivationProfile | null {
    return this.userProfile;
  }

  // Reset profile (for testing or account switching)
  public resetProfile(): void {
    this.userProfile = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  // Get activation recommendations
  public getActivationRecommendations(): Array<{
    action: string;
    description: string;
    points: number;
    category: string;
  }> {
    if (!this.userProfile) return [];

    const completedEvents = new Set(this.userProfile.events.map(e => e.event));
    
    return Object.entries(ACTIVATION_EVENTS)
      .filter(([eventName]) => !completedEvents.has(eventName))
      .map(([eventName, config]) => ({
        action: eventName,
        description: this.getEventDescription(eventName),
        points: config.points,
        category: config.category,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 3); // Top 3 recommendations
  }

  // Get human-readable event description
  private getEventDescription(eventName: string): string {
    const descriptions: Record<string, string> = {
      'first_workout_logged': 'Log your first workout',
      'first_meal_logged': 'Track your first meal',
      'ai_coach_interaction': 'Chat with your AI coach',
      'goal_set': 'Set your fitness goals',
      'profile_completed': 'Complete your profile',
      'workout_repeated': 'Log another workout',
      'meal_repeated': 'Track another meal',
      'progress_viewed': 'Check your progress',
      'photo_logged': 'Take a meal photo',
      'weight_tracked': 'Log your weight',
    };

    return descriptions[eventName] || eventName.replace(/_/g, ' ');
  }
}

// Singleton instance
export const activationSystem = new ActivationSystemManager();

// React hook for activation system
export function useActivationSystem() {
  const profile = activationSystem.getUserProfile();
  const status = activationSystem.getActivationStatus();
  const journey = activationSystem.getActivationJourney();
  const recommendations = activationSystem.getActivationRecommendations();

  return {
    // Data
    profile,
    status,
    journey,
    recommendations,
    
    // Actions
    initializeUser: (userId?: string, sessionId?: string) => 
      activationSystem.initializeUser(userId, sessionId),
    
    trackEvent: (event: keyof typeof ACTIVATION_EVENTS, data?: Record<string, any>, source?: string) => 
      activationSystem.trackEvent(event, data, source),
    
    resetProfile: () => activationSystem.resetProfile(),
  };
}

// Helper to track common activation patterns
export class ActivationPatterns {
  static trackSignup(userId: string) {
    activationSystem.initializeUser(userId);
    activationSystem.trackEvent('profile_completed', { source: 'signup' });
  }

  static trackFirstWorkout(workoutData: any) {
    activationSystem.trackEvent('first_workout_logged', workoutData);
  }

  static trackFirstMeal(mealData: any) {
    activationSystem.trackEvent('first_meal_logged', mealData);
  }

  static trackAIInteraction(interactionData: any) {
    activationSystem.trackEvent('ai_coach_interaction', interactionData);
  }

  static trackGoalSetting(goalData: any) {
    activationSystem.trackEvent('goal_set', goalData);
  }
}