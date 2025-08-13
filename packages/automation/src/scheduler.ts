// Workflow scheduling and trigger management
import * as cron from 'node-cron';
import type { WorkflowDefinition, WorkflowTrigger, EventContext, UserContext } from './types';
import { WorkflowEngine } from './workflows';

export class WorkflowScheduler {
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();
  private engine: WorkflowEngine;
  private eventListeners: Map<string, WorkflowDefinition[]> = new Map();

  constructor(engine: WorkflowEngine) {
    this.engine = engine;
  }

  scheduleWorkflow(workflow: WorkflowDefinition): void {
    if (!workflow.enabled) return;

    if (workflow.trigger.type === 'schedule') {
      this.scheduleRecurringWorkflow(workflow);
    } else if (workflow.trigger.type === 'event') {
      this.registerEventListener(workflow);
    }
  }

  unscheduleWorkflow(workflowId: string): void {
    const task = this.scheduledTasks.get(workflowId);
    if (task) {
      task.stop();
      task.destroy();
      this.scheduledTasks.delete(workflowId);
    }

    // Remove from event listeners
    for (const [eventType, workflows] of this.eventListeners.entries()) {
      const filtered = workflows.filter(w => w.id !== workflowId);
      if (filtered.length > 0) {
        this.eventListeners.set(eventType, filtered);
      } else {
        this.eventListeners.delete(eventType);
      }
    }
  }

  private scheduleRecurringWorkflow(workflow: WorkflowDefinition): void {
    const cronExpression = workflow.trigger.config.cron;
    
    if (!cron.validate(cronExpression)) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    const task = cron.schedule(cronExpression, async () => {
      await this.executeScheduledWorkflow(workflow);
    }, {
      scheduled: true,
      timezone: workflow.trigger.config.timezone || 'UTC'
    });

    this.scheduledTasks.set(workflow.id, task);
  }

  private registerEventListener(workflow: WorkflowDefinition): void {
    const eventType = workflow.trigger.config.eventType;
    
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)!.push(workflow);
  }

  private async executeScheduledWorkflow(workflow: WorkflowDefinition): Promise<void> {
    const context: EventContext = {
      eventType: 'daily_summary', // or whatever the schedule represents
      eventData: {
        triggeredBy: 'schedule',
        cronExpression: workflow.trigger.config.cron
      },
      timestamp: new Date(),
      source: 'scheduler'
    };

    // For scheduled workflows, we might need to execute for multiple users
    const targetUsers = await this.getTargetUsers(workflow);
    
    for (const user of targetUsers) {
      try {
        await this.engine.executeWorkflow(workflow, context, user);
      } catch (error) {
        console.error(`Failed to execute scheduled workflow ${workflow.id} for user ${user.userId}:`, error);
      }
    }
  }

  async triggerEvent(eventType: string, eventData: Record<string, any>, user?: UserContext): Promise<void> {
    const workflows = this.eventListeners.get(eventType) || [];
    
    const context: EventContext = {
      eventType: eventType as any,
      eventData,
      timestamp: new Date(),
      source: 'event_trigger'
    };

    for (const workflow of workflows) {
      if (!workflow.enabled) continue;
      
      try {
        await this.engine.executeWorkflow(workflow, context, user);
      } catch (error) {
        console.error(`Failed to execute event workflow ${workflow.id}:`, error);
      }
    }
  }

  private async getTargetUsers(workflow: WorkflowDefinition): Promise<UserContext[]> {
    // This would query your user database to get target users
    // For now, return mock data
    return [
      {
        userId: 'user_1',
        email: 'user1@example.com',
        name: 'John Doe',
        subscriptionTier: 'free',
        joinedAt: new Date('2024-01-01'),
        lastActiveAt: new Date(),
        properties: {
          workoutsLastWeek: 3,
          lastWorkoutDate: '2025-01-12',
          currentStreak: 5,
          totalWorkouts: 25
        }
      },
      {
        userId: 'user_2',
        email: 'user2@example.com',
        name: 'Jane Smith',
        subscriptionTier: 'premium',
        joinedAt: new Date('2024-06-15'),
        lastActiveAt: new Date(),
        properties: {
          workoutsLastWeek: 4,
          lastWorkoutDate: '2025-01-11',
          currentStreak: 12,
          totalWorkouts: 78
        }
      }
    ];
  }

  getScheduledWorkflows(): { workflowId: string; cronExpression: string; nextExecution?: Date }[] {
    const scheduled = [];
    
    for (const [workflowId, task] of this.scheduledTasks.entries()) {
      scheduled.push({
        workflowId,
        cronExpression: 'unknown', // cron tasks don't expose their expression
        nextExecution: task.nextDates(1)[0] || undefined
      });
    }
    
    return scheduled;
  }

  getEventListeners(): { eventType: string; workflowCount: number }[] {
    return Array.from(this.eventListeners.entries()).map(([eventType, workflows]) => ({
      eventType,
      workflowCount: workflows.filter(w => w.enabled).length
    }));
  }

  // Manual workflow triggers
  async triggerWorkflowManually(
    workflowId: string,
    context: EventContext,
    user?: UserContext
  ): Promise<void> {
    // This would load the workflow from your database
    const workflow = await this.getWorkflowById(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    await this.engine.executeWorkflow(workflow, context, user);
  }

  private async getWorkflowById(workflowId: string): Promise<WorkflowDefinition | null> {
    // Mock implementation - replace with database query
    return null;
  }

  // Webhook trigger handler
  async handleWebhook(
    webhookId: string,
    payload: Record<string, any>,
    headers: Record<string, string>
  ): Promise<void> {
    // Find workflows that have webhook triggers with matching ID
    const workflows = await this.getWorkflowsByWebhookId(webhookId);
    
    const context: EventContext = {
      eventType: 'webhook_received' as any,
      eventData: {
        webhookId,
        payload,
        headers
      },
      timestamp: new Date(),
      source: 'webhook'
    };

    for (const workflow of workflows) {
      if (!workflow.enabled) continue;
      
      try {
        await this.engine.executeWorkflow(workflow, context);
      } catch (error) {
        console.error(`Failed to execute webhook workflow ${workflow.id}:`, error);
      }
    }
  }

  private async getWorkflowsByWebhookId(webhookId: string): Promise<WorkflowDefinition[]> {
    // Mock implementation - replace with database query
    return [];
  }

  // Health check and maintenance
  validateAllSchedules(): { workflowId: string; valid: boolean; error?: string }[] {
    const results = [];
    
    for (const [workflowId, task] of this.scheduledTasks.entries()) {
      results.push({
        workflowId,
        valid: task.getStatus() === 'scheduled',
        error: task.getStatus() !== 'scheduled' ? `Task status: ${task.getStatus()}` : undefined
      });
    }
    
    return results;
  }

  stop(): void {
    for (const task of this.scheduledTasks.values()) {
      task.stop();
      task.destroy();
    }
    this.scheduledTasks.clear();
    this.eventListeners.clear();
  }
}

// Utility functions for common cron expressions
export const CronExpressions = {
  // Time-based
  everyMinute: '* * * * *',
  every5Minutes: '*/5 * * * *',
  every15Minutes: '*/15 * * * *',
  every30Minutes: '*/30 * * * *',
  hourly: '0 * * * *',
  
  // Daily
  dailyAt(hour: number, minute = 0): string {
    return `${minute} ${hour} * * *`;
  },
  everyDayAt9AM: '0 9 * * *',
  everyDayAt6PM: '0 18 * * *',
  everyDayAtMidnight: '0 0 * * *',
  
  // Weekly
  weeklyOn(day: number, hour = 9, minute = 0): string {
    return `${minute} ${hour} * * ${day}`;
  },
  everyMondayAt9AM: '0 9 * * 1',
  everyFridayAt5PM: '0 17 * * 5',
  everyWeekend: '0 10 * * 0,6',
  
  // Monthly
  monthlyOnFirst(hour = 9, minute = 0): string {
    return `${minute} ${hour} 1 * *`;
  },
  monthlyOnLast(hour = 9, minute = 0): string {
    return `${minute} ${hour} L * *`;
  },
  
  // Custom helpers
  businessDaysAt(hour: number, minute = 0): string {
    return `${minute} ${hour} * * 1-5`;
  },
  
  weekendsAt(hour: number, minute = 0): string {
    return `${minute} ${hour} * * 0,6`;
  }
};