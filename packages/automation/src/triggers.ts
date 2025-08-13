// Trigger management and event detection
import type { WorkflowTrigger, EventContext, UserContext } from './types';

export class TriggerManager {
  private eventQueue: EventContext[] = [];
  private webhookEndpoints: Map<string, WebhookConfig> = new Map();
  private eventHandlers: Map<string, EventHandler[]> = new Map();

  // Event triggering
  async triggerEvent(
    eventType: string,
    eventData: Record<string, any>,
    user?: UserContext,
    source = 'manual'
  ): Promise<void> {
    const context: EventContext = {
      eventType: eventType as any,
      eventData,
      timestamp: new Date(),
      source,
      user
    };

    this.eventQueue.push(context);
    await this.processEvent(context);
  }

  private async processEvent(context: EventContext): Promise<void> {
    const handlers = this.eventHandlers.get(context.eventType) || [];
    
    for (const handler of handlers) {
      try {
        await handler.handle(context);
      } catch (error) {
        console.error(`Event handler error for ${context.eventType}:`, error);
      }
    }
  }

  // Webhook management
  registerWebhook(id: string, config: WebhookConfig): string {
    this.webhookEndpoints.set(id, config);
    return `/webhooks/${id}`;
  }

  unregisterWebhook(id: string): void {
    this.webhookEndpoints.delete(id);
  }

  async handleWebhookRequest(
    id: string,
    payload: Record<string, any>,
    headers: Record<string, string>
  ): Promise<{ success: boolean; message?: string }> {
    const config = this.webhookEndpoints.get(id);
    
    if (!config) {
      return { success: false, message: 'Webhook not found' };
    }

    // Validate webhook if secret is configured
    if (config.secret && !this.validateWebhookSignature(payload, headers, config.secret)) {
      return { success: false, message: 'Invalid webhook signature' };
    }

    // Transform payload if transformer is provided
    const transformedPayload = config.payloadTransformer 
      ? config.payloadTransformer(payload, headers)
      : payload;

    // Trigger event
    await this.triggerEvent(
      config.eventType,
      transformedPayload,
      undefined,
      'webhook'
    );

    return { success: true, message: 'Webhook processed successfully' };
  }

  private validateWebhookSignature(
    payload: Record<string, any>,
    headers: Record<string, string>,
    secret: string
  ): boolean {
    // Implement webhook signature validation
    // This would depend on the service sending the webhook
    const signature = headers['x-signature'] || headers['x-hub-signature-256'];
    if (!signature) return false;

    // Mock validation - replace with actual crypto verification
    return signature.includes(secret);
  }

  // Event handler registration
  registerEventHandler(eventType: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);
  }

  unregisterEventHandler(eventType: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Pre-built triggers for common events
  createUserEventTriggers(): void {
    // User registration
    this.registerEventHandler('user_registered', {
      handle: async (context) => {
        console.log('User registered:', context.eventData);
        // Additional logic for user registration
      }
    });

    // Workout completion
    this.registerEventHandler('workout_completed', {
      handle: async (context) => {
        const { workoutId, duration, exercises } = context.eventData;
        
        // Update user statistics
        await this.updateUserWorkoutStats(context.user!, {
          workoutId,
          duration,
          exercises,
          completedAt: context.timestamp
        });
        
        // Check for achievements
        await this.checkWorkoutAchievements(context.user!, context.eventData);
      }
    });

    // Goal achievement
    this.registerEventHandler('goal_achieved', {
      handle: async (context) => {
        const { goalType, goalValue, achievedValue } = context.eventData;
        
        // Record achievement
        await this.recordAchievement(context.user!, {
          type: goalType,
          targetValue: goalValue,
          achievedValue,
          achievedAt: context.timestamp
        });
      }
    });

    // Subscription events
    this.registerEventHandler('subscription_started', {
      handle: async (context) => {
        const { tier, planId, amount } = context.eventData;
        
        // Update user tier
        if (context.user) {
          context.user.subscriptionTier = tier;
        }
        
        // Track revenue
        await this.trackRevenue(context.user!, {
          type: 'subscription_start',
          amount,
          planId,
          timestamp: context.timestamp
        });
      }
    });

    this.registerEventHandler('subscription_cancelled', {
      handle: async (context) => {
        // Track churn
        await this.trackChurn(context.user!, {
          reason: context.eventData.reason,
          timestamp: context.timestamp
        });
      }
    });
  }

  // System event generators
  async generateSystemEvents(): Promise<void> {
    const now = new Date();
    
    // Daily events
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      await this.triggerEvent('daily_summary', {
        date: now.toISOString().split('T')[0]
      }, undefined, 'system');
    }

    // Weekly events (Monday at midnight)
    if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
      await this.triggerEvent('weekly_review', {
        weekStarting: now.toISOString().split('T')[0]
      }, undefined, 'system');
    }

    // Monthly events (1st of month at midnight)
    if (now.getDate() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
      await this.triggerEvent('monthly_report', {
        month: now.getMonth() + 1,
        year: now.getFullYear()
      }, undefined, 'system');
    }
  }

  // Helper methods for event handlers
  private async updateUserWorkoutStats(
    user: UserContext,
    workoutData: Record<string, any>
  ): Promise<void> {
    // Mock implementation - replace with database update
    console.log('Updating workout stats for user:', user.userId, workoutData);
  }

  private async checkWorkoutAchievements(
    user: UserContext,
    workoutData: Record<string, any>
  ): Promise<void> {
    // Check various achievements
    const achievements = [];

    // Check streak achievements
    const currentStreak = user.properties?.currentStreak || 0;
    if ([7, 30, 100].includes(currentStreak)) {
      achievements.push({
        type: 'streak',
        milestone: currentStreak,
        title: `${currentStreak} Day Streak!`
      });
    }

    // Check total workout milestones
    const totalWorkouts = (user.properties?.totalWorkouts || 0) + 1;
    if ([10, 25, 50, 100, 250, 500].includes(totalWorkouts)) {
      achievements.push({
        type: 'total_workouts',
        milestone: totalWorkouts,
        title: `${totalWorkouts} Workouts Completed!`
      });
    }

    // Trigger achievement events
    for (const achievement of achievements) {
      await this.triggerEvent('achievement_unlocked', achievement, user, 'system');
    }
  }

  private async recordAchievement(
    user: UserContext,
    achievement: Record<string, any>
  ): Promise<void> {
    // Mock implementation - replace with database insert
    console.log('Recording achievement:', user.userId, achievement);
  }

  private async trackRevenue(
    user: UserContext,
    revenueData: Record<string, any>
  ): Promise<void> {
    // Mock implementation - replace with analytics tracking
    console.log('Tracking revenue:', user.userId, revenueData);
  }

  private async trackChurn(
    user: UserContext,
    churnData: Record<string, any>
  ): Promise<void> {
    // Mock implementation - replace with churn analysis
    console.log('Tracking churn:', user.userId, churnData);
  }

  // Cleanup and maintenance
  getEventQueueSize(): number {
    return this.eventQueue.length;
  }

  clearEventQueue(): void {
    this.eventQueue = [];
  }

  getRegisteredWebhooks(): string[] {
    return Array.from(this.webhookEndpoints.keys());
  }

  getEventHandlerCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const [eventType, handlers] of this.eventHandlers.entries()) {
      counts[eventType] = handlers.length;
    }
    return counts;
  }
}

export interface WebhookConfig {
  eventType: string;
  secret?: string;
  payloadTransformer?: (payload: Record<string, any>, headers: Record<string, string>) => Record<string, any>;
}

export interface EventHandler {
  handle(context: EventContext): Promise<void>;
}

// Pre-built webhook configurations for common services
export const WebhookConfigs = {
  stripe: (eventType: string): WebhookConfig => ({
    eventType,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
    payloadTransformer: (payload, headers) => ({
      stripeEventId: payload.id,
      eventType: payload.type,
      data: payload.data.object,
      created: new Date(payload.created * 1000)
    })
  }),

  github: (eventType: string): WebhookConfig => ({
    eventType,
    secret: process.env.GITHUB_WEBHOOK_SECRET,
    payloadTransformer: (payload, headers) => ({
      event: headers['x-github-event'],
      repository: payload.repository?.name,
      action: payload.action,
      sender: payload.sender?.login,
      data: payload
    })
  }),

  generic: (eventType: string, secret?: string): WebhookConfig => ({
    eventType,
    secret,
    payloadTransformer: (payload, headers) => ({
      ...payload,
      receivedAt: new Date(),
      headers: Object.fromEntries(
        Object.entries(headers).filter(([key]) => 
          key.startsWith('x-') || key === 'user-agent'
        )
      )
    })
  })
};