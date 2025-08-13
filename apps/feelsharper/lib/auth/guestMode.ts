// Guest Mode System - Allows users to try features without signup
// Data is preserved in localStorage and migrated to account on signup

export interface GuestData {
  workouts: any[];
  meals: any[];
  weights: any[];
  preferences: {
    goalType?: string;
    experience?: string;
    unitsWeight?: 'kg' | 'lb';
    unitsDistance?: 'km' | 'mi';
  };
  insights: {
    coachResponses: any[];
    streakDays: number;
    totalWorkouts: number;
  };
  sessionStarted: string;
  lastActivity: string;
}

const GUEST_DATA_KEY = 'feelsharper_guest_data';
const GUEST_SESSION_KEY = 'feelsharper_guest_session';

export class GuestModeManager {
  private data: GuestData;

  constructor() {
    this.data = this.loadGuestData();
  }

  // Initialize new guest session
  public startGuestSession(): GuestData {
    const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.data = {
      workouts: [],
      meals: [],
      weights: [],
      preferences: {},
      insights: {
        coachResponses: [],
        streakDays: 0,
        totalWorkouts: 0,
      },
      sessionStarted: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    localStorage.setItem(GUEST_SESSION_KEY, sessionId);
    this.saveGuestData();
    
    // Track guest session started
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Guest Session Started', {
        session_id: sessionId,
        entry_point: 'homepage',
      });
    }

    return this.data;
  }

  // Check if user is in guest mode
  public isGuestMode(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(GUEST_SESSION_KEY) && !this.isAuthenticated();
  }

  // Check if user is authenticated
  private isAuthenticated(): boolean {
    // In a real app, check Supabase auth state
    return false; // Simplified for now
  }

  // Load guest data from localStorage
  private loadGuestData(): GuestData {
    if (typeof window === 'undefined') {
      return this.getDefaultData();
    }

    try {
      const stored = localStorage.getItem(GUEST_DATA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...this.getDefaultData(),
          ...parsed,
          lastActivity: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Failed to load guest data:', error);
    }

    return this.getDefaultData();
  }

  // Save guest data to localStorage
  private saveGuestData(): void {
    if (typeof window === 'undefined') return;

    try {
      this.data.lastActivity = new Date().toISOString();
      localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save guest data:', error);
    }
  }

  // Get default empty data structure
  private getDefaultData(): GuestData {
    return {
      workouts: [],
      meals: [],
      weights: [],
      preferences: {},
      insights: {
        coachResponses: [],
        streakDays: 0,
        totalWorkouts: 0,
      },
      sessionStarted: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };
  }

  // Add workout (guest mode)
  public addWorkout(workout: any): void {
    this.data.workouts.push({
      ...workout,
      id: `guest_workout_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    this.data.insights.totalWorkouts++;
    this.saveGuestData();

    // Track guest activity
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Guest Workout Logged', {
        workout_type: workout.type,
        is_guest: true,
        total_guest_workouts: this.data.insights.totalWorkouts,
      });
    }
  }

  // Add meal (guest mode)
  public addMeal(meal: any): void {
    this.data.meals.push({
      ...meal,
      id: `guest_meal_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    this.saveGuestData();

    // Track guest activity
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Guest Meal Logged', {
        meal_type: meal.type,
        is_guest: true,
        total_guest_meals: this.data.meals.length,
      });
    }
  }

  // Add weight (guest mode)
  public addWeight(weight: number): void {
    this.data.weights.push({
      weight,
      id: `guest_weight_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    this.saveGuestData();
  }

  // Add AI coach response
  public addCoachResponse(response: any): void {
    this.data.insights.coachResponses.push({
      ...response,
      id: `guest_response_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
    this.saveGuestData();
  }

  // Update preferences
  public updatePreferences(preferences: Partial<GuestData['preferences']>): void {
    this.data.preferences = { ...this.data.preferences, ...preferences };
    this.saveGuestData();
  }

  // Get current guest data
  public getGuestData(): GuestData {
    return this.data;
  }

  // Get guest session stats for social proof
  public getSessionStats(): {
    workoutsLogged: number;
    mealsLogged: number;
    daysActive: number;
    coachInteractions: number;
  } {
    const sessionStart = new Date(this.data.sessionStarted);
    const now = new Date();
    const daysActive = Math.max(1, Math.ceil((now.getTime() - sessionStart.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      workoutsLogged: this.data.workouts.length,
      mealsLogged: this.data.meals.length,
      daysActive,
      coachInteractions: this.data.insights.coachResponses.length,
    };
  }

  // Convert guest data for account migration
  public prepareDataForMigration(): {
    workouts: any[];
    meals: any[];
    weights: any[];
    preferences: any;
    insights: any;
  } {
    return {
      workouts: this.data.workouts.map(w => ({
        ...w,
        migrated_from_guest: true,
        guest_session_id: localStorage.getItem(GUEST_SESSION_KEY),
      })),
      meals: this.data.meals.map(m => ({
        ...m,
        migrated_from_guest: true,
        guest_session_id: localStorage.getItem(GUEST_SESSION_KEY),
      })),
      weights: this.data.weights.map(w => ({
        ...w,
        migrated_from_guest: true,
        guest_session_id: localStorage.getItem(GUEST_SESSION_KEY),
      })),
      preferences: this.data.preferences,
      insights: this.data.insights,
    };
  }

  // Clear guest data after successful migration
  public clearGuestData(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(GUEST_DATA_KEY);
    localStorage.removeItem(GUEST_SESSION_KEY);
    
    // Track successful migration
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Guest Data Migrated', {
        workouts_migrated: this.data.workouts.length,
        meals_migrated: this.data.meals.length,
        weights_migrated: this.data.weights.length,
        session_duration_hours: this.getSessionDurationHours(),
      });
    }
    
    this.data = this.getDefaultData();
  }

  // Calculate session duration for analytics
  private getSessionDurationHours(): number {
    const start = new Date(this.data.sessionStarted);
    const end = new Date();
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  // Check if guest should be prompted to sign up
  public shouldPromptSignup(): boolean {
    const stats = this.getSessionStats();
    const sessionHours = this.getSessionDurationHours();
    
    // Prompt after meaningful engagement
    return (
      stats.workoutsLogged >= 1 || // After first workout
      stats.coachInteractions >= 2 || // After AI interaction
      sessionHours >= 0.5 // After 30 minutes
    );
  }

  // Get appropriate signup prompt message
  public getSignupPromptMessage(): string {
    const stats = this.getSessionStats();
    
    if (stats.workoutsLogged > 0) {
      return `Great workout! Save your progress and get personalized insights with a free account.`;
    }
    
    if (stats.coachInteractions > 0) {
      return `Your AI coach has more insights waiting! Create an account to unlock your full potential.`;
    }
    
    return `You're making progress! Save your data and unlock more features with a free account.`;
  }
}

// Singleton instance
export const guestMode = new GuestModeManager();

// React hook for guest mode
export function useGuestMode() {
  const isGuest = guestMode.isGuestMode();
  const data = guestMode.getGuestData();
  const stats = guestMode.getSessionStats();
  
  return {
    isGuest,
    data,
    stats,
    startGuestSession: () => guestMode.startGuestSession(),
    addWorkout: (workout: any) => guestMode.addWorkout(workout),
    addMeal: (meal: any) => guestMode.addMeal(meal),
    addWeight: (weight: number) => guestMode.addWeight(weight),
    addCoachResponse: (response: any) => guestMode.addCoachResponse(response),
    updatePreferences: (preferences: any) => guestMode.updatePreferences(preferences),
    shouldPromptSignup: () => guestMode.shouldPromptSignup(),
    getSignupPromptMessage: () => guestMode.getSignupPromptMessage(),
    prepareDataForMigration: () => guestMode.prepareDataForMigration(),
    clearGuestData: () => guestMode.clearGuestData(),
  };
}