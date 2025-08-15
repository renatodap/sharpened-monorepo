/**
 * PushNotificationManager - PWA push notifications system
 * Maps to PRD: PWA Push Notifications
 */

export interface NotificationPreferences {
  enabled: boolean;
  workoutReminders: boolean;
  mealReminders: boolean;
  achievementAlerts: boolean;
  coachingTips: boolean;
  reminderTimes: {
    morning?: string; // HH:MM format
    lunch?: string;
    evening?: string;
    custom?: string[];
  };
  quietHours: {
    start: string; // HH:MM
    end: string;
  };
}

export interface ScheduledNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  scheduledFor: Date;
  data?: any;
  recurring?: 'daily' | 'weekly' | 'custom';
  recurringDays?: number[]; // 0-6 for Sunday-Saturday
}

export type NotificationType = 
  | 'workout_reminder'
  | 'meal_reminder'
  | 'achievement'
  | 'coaching_tip'
  | 'streak_reminder'
  | 'goal_progress'
  | 'rest_timer'
  | 'hydration';

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private preferences: NotificationPreferences = {
    enabled: false,
    workoutReminders: true,
    mealReminders: true,
    achievementAlerts: true,
    coachingTips: true,
    reminderTimes: {
      morning: '08:00',
      lunch: '12:00',
      evening: '18:00'
    },
    quietHours: {
      start: '22:00',
      end: '07:00'
    }
  };
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('Notifications not supported');
        return false;
      }

      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported');
        return false;
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.ready;

      // Load preferences from localStorage
      this.loadPreferences();

      // Check permission status
      if (Notification.permission === 'granted' && this.preferences.enabled) {
        await this.subscribeToNotifications();
        this.scheduleDefaultNotifications();
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        this.preferences.enabled = true;
        this.savePreferences();
        await this.subscribeToNotifications();
        this.scheduleDefaultNotifications();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToNotifications(): Promise<void> {
    if (!this.registration) return;

    try {
      // Generate VAPID keys (in production, use server-generated keys)
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BKd0G3pTR3nj7Xp5rFKqK9FYkGBoN8cZQz-OcCfD_fQPqGxZ-_i1YwqFQQGxQGxQGxQGxQGxQGxQGxQGxQGxQGx';
      
      const convertedVapidKey = this.urlBase64ToUint8Array(vapidPublicKey);
      
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Send subscription to server (in production)
      await this.sendSubscriptionToServer(this.subscription);
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
    }
  }

  /**
   * Schedule a notification
   */
  scheduleNotification(notification: Omit<ScheduledNotification, 'id'>): string {
    const id = this.generateId();
    const scheduledNotification: ScheduledNotification = {
      ...notification,
      id
    };

    this.scheduledNotifications.set(id, scheduledNotification);

    // Calculate delay
    const now = new Date();
    const delay = scheduledNotification.scheduledFor.getTime() - now.getTime();

    if (delay > 0) {
      // Schedule notification
      const timer = setTimeout(() => {
        this.sendNotification(scheduledNotification);
        
        // Handle recurring notifications
        if (scheduledNotification.recurring) {
          this.rescheduleNotification(scheduledNotification);
        } else {
          this.scheduledNotifications.delete(id);
          this.timers.delete(id);
        }
      }, delay);

      this.timers.set(id, timer);
    }

    return id;
  }

  /**
   * Cancel a scheduled notification
   */
  cancelNotification(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.scheduledNotifications.delete(id);
  }

  /**
   * Send immediate notification
   */
  async sendNotification(notification: ScheduledNotification): Promise<void> {
    if (!this.preferences.enabled) return;
    if (!this.checkNotificationAllowed(notification.type)) return;
    if (this.isQuietHours()) return;

    try {
      if (this.registration) {
        await this.registration.showNotification(notification.title, {
          body: notification.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          vibrate: [200, 100, 200],
          tag: notification.type,
          data: notification.data,
          requireInteraction: notification.type === 'workout_reminder',
          actions: this.getNotificationActions(notification.type)
        });
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Schedule default daily notifications
   */
  private scheduleDefaultNotifications(): void {
    const now = new Date();
    
    // Morning workout reminder
    if (this.preferences.workoutReminders && this.preferences.reminderTimes.morning) {
      const [hours, minutes] = this.preferences.reminderTimes.morning.split(':').map(Number);
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      this.scheduleNotification({
        type: 'workout_reminder',
        title: '💪 Time to Work Out!',
        body: 'Start your day strong with a morning workout',
        scheduledFor: scheduledTime,
        recurring: 'daily'
      });
    }

    // Lunch meal reminder
    if (this.preferences.mealReminders && this.preferences.reminderTimes.lunch) {
      const [hours, minutes] = this.preferences.reminderTimes.lunch.split(':').map(Number);
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      this.scheduleNotification({
        type: 'meal_reminder',
        title: '🥗 Lunch Time!',
        body: "Don't forget to log your lunch",
        scheduledFor: scheduledTime,
        recurring: 'daily'
      });
    }

    // Evening progress check
    if (this.preferences.reminderTimes.evening) {
      const [hours, minutes] = this.preferences.reminderTimes.evening.split(':').map(Number);
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      this.scheduleNotification({
        type: 'goal_progress',
        title: '📊 Daily Progress Check',
        body: 'Review your progress and plan for tomorrow',
        scheduledFor: scheduledTime,
        recurring: 'daily'
      });
    }
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(achievement: {
    title: string;
    description: string;
    type: 'streak' | 'goal' | 'milestone' | 'personal_best';
  }): Promise<void> {
    if (!this.preferences.achievementAlerts) return;

    const emojis = {
      streak: '🔥',
      goal: '🎯',
      milestone: '🏆',
      personal_best: '⭐'
    };

    await this.sendNotification({
      id: this.generateId(),
      type: 'achievement',
      title: `${emojis[achievement.type]} ${achievement.title}`,
      body: achievement.description,
      scheduledFor: new Date(),
      data: { achievement }
    });
  }

  /**
   * Send coaching tip notification
   */
  async sendCoachingTip(tip: {
    title: string;
    body: string;
    category: 'workout' | 'nutrition' | 'recovery' | 'motivation';
  }): Promise<void> {
    if (!this.preferences.coachingTips) return;

    await this.sendNotification({
      id: this.generateId(),
      type: 'coaching_tip',
      title: `💡 ${tip.title}`,
      body: tip.body,
      scheduledFor: new Date(),
      data: { category: tip.category }
    });
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
    
    // Reschedule notifications if times changed
    if (preferences.reminderTimes) {
      this.cancelAllScheduled();
      this.scheduleDefaultNotifications();
    }
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.preferences.enabled && Notification.permission === 'granted';
  }

  /**
   * Private helper methods
   */
  private checkNotificationAllowed(type: NotificationType): boolean {
    switch (type) {
      case 'workout_reminder':
        return this.preferences.workoutReminders;
      case 'meal_reminder':
        return this.preferences.mealReminders;
      case 'achievement':
        return this.preferences.achievementAlerts;
      case 'coaching_tip':
        return this.preferences.coachingTips;
      default:
        return true;
    }
  }

  private isQuietHours(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHours, startMinutes] = this.preferences.quietHours.start.split(':').map(Number);
    const [endHours, endMinutes] = this.preferences.quietHours.end.split(':').map(Number);
    
    const quietStart = startHours * 60 + startMinutes;
    const quietEnd = endHours * 60 + endMinutes;
    
    if (quietStart < quietEnd) {
      return currentTime >= quietStart && currentTime < quietEnd;
    } else {
      return currentTime >= quietStart || currentTime < quietEnd;
    }
  }

  private rescheduleNotification(notification: ScheduledNotification): void {
    const nextDate = new Date(notification.scheduledFor);
    
    switch (notification.recurring) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'custom':
        // Find next valid day
        if (notification.recurringDays && notification.recurringDays.length > 0) {
          let daysToAdd = 1;
          const currentDay = nextDate.getDay();
          
          for (let i = 1; i <= 7; i++) {
            const checkDay = (currentDay + i) % 7;
            if (notification.recurringDays.includes(checkDay)) {
              daysToAdd = i;
              break;
            }
          }
          
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        }
        break;
    }
    
    this.scheduleNotification({
      ...notification,
      scheduledFor: nextDate
    });
  }

  private getNotificationActions(type: NotificationType): NotificationAction[] {
    switch (type) {
      case 'workout_reminder':
        return [
          { action: 'start', title: 'Start Workout' },
          { action: 'snooze', title: 'Snooze 15min' }
        ];
      case 'meal_reminder':
        return [
          { action: 'log', title: 'Log Meal' },
          { action: 'dismiss', title: 'Dismiss' }
        ];
      default:
        return [];
    }
  }

  private cancelAllScheduled(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.scheduledNotifications.clear();
  }

  private loadPreferences(): void {
    const stored = localStorage.getItem('notificationPreferences');
    if (stored) {
      try {
        this.preferences = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    }
  }

  private savePreferences(): void {
    localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    // In production, send to your backend
    console.log('Push subscription:', subscription);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const pushNotifications = PushNotificationManager.getInstance();