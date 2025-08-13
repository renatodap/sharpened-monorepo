// Action execution system for workflows
import type { WorkflowAction, EventContext, UserContext } from './types';

export class ActionExecutor {
  private actionHandlers: Map<string, ActionHandler> = new Map();

  constructor() {
    this.registerDefaultActions();
  }

  async execute(action: WorkflowAction, context: EventContext, user?: UserContext): Promise<any> {
    const handler = this.actionHandlers.get(action.type);
    if (!handler) {
      throw new Error(`No handler registered for action type: ${action.type}`);
    }

    return await handler.execute(action.config, context, user);
  }

  registerAction(type: string, handler: ActionHandler): void {
    this.actionHandlers.set(type, handler);
  }

  private registerDefaultActions(): void {
    this.registerAction('email', new EmailActionHandler());
    this.registerAction('notification', new NotificationActionHandler());
    this.registerAction('database', new DatabaseActionHandler());
    this.registerAction('ai_analysis', new AIAnalysisActionHandler());
    this.registerAction('webhook', new WebhookActionHandler());
    this.registerAction('custom', new CustomActionHandler());
  }
}

export interface ActionHandler {
  execute(config: Record<string, any>, context: EventContext, user?: UserContext): Promise<any>;
}

export class EmailActionHandler implements ActionHandler {
  async execute(config: Record<string, any>, context: EventContext, user?: UserContext): Promise<any> {
    if (!user?.email) {
      throw new Error('User email is required for email actions');
    }

    const { template, personalizedSubject, personalizeContent, includeCharts, includeAchievementBadge } = config;
    
    // This would integrate with your email service
    const emailData = {
      to: user.email,
      template,
      variables: {
        userName: user.name || 'there',
        userId: user.userId,
        eventType: context.eventType,
        eventData: context.eventData,
        personalizedSubject,
        personalizeContent,
        includeCharts,
        includeAchievementBadge,
      }
    };

    // Mock implementation - replace with actual email service
    console.log('Sending email:', emailData);
    
    return {
      emailId: `email_${Date.now()}`,
      sentAt: new Date(),
      template,
      recipient: user.email
    };
  }
}

export class NotificationActionHandler implements ActionHandler {
  async execute(config: Record<string, any>, context: EventContext, user?: UserContext): Promise<any> {
    const { type, title, message, priority = 'normal' } = config;

    // This would integrate with your notification service
    const notification = {
      userId: user?.userId,
      type,
      title: this.interpolateTemplate(title, context, user),
      message: this.interpolateTemplate(message, context, user),
      priority,
      createdAt: new Date()
    };

    console.log('Sending notification:', notification);
    
    return {
      notificationId: `notif_${Date.now()}`,
      ...notification
    };
  }

  private interpolateTemplate(template: string, context: EventContext, user?: UserContext): string {
    if (!template) return '';
    
    return template
      .replace(/\{\{user\.(\w+)\}\}/g, (match, prop) => user?.[prop as keyof UserContext] || match)
      .replace(/\{\{event\.(\w+)\}\}/g, (match, prop) => context.eventData[prop] || match);
  }
}

export class DatabaseActionHandler implements ActionHandler {
  async execute(config: Record<string, any>, context: EventContext, user?: UserContext): Promise<any> {
    const { table, action, data, conditions } = config;
    
    if (!table || !action) {
      throw new Error('Database action requires table and action');
    }

    // Interpolate variables in data
    const interpolatedData = this.interpolateData(data, context, user);

    // Mock implementation - replace with actual database operations
    const result = {
      table,
      action,
      data: interpolatedData,
      conditions,
      executedAt: new Date(),
      success: true
    };

    console.log('Database operation:', result);
    
    return result;
  }

  private interpolateData(data: Record<string, any>, context: EventContext, user?: UserContext): Record<string, any> {
    if (!data) return {};
    
    const interpolated = { ...data };
    
    for (const [key, value] of Object.entries(interpolated)) {
      if (typeof value === 'string') {
        interpolated[key] = value
          .replace(/\{\{user\.(\w+)\}\}/g, (match, prop) => user?.[prop as keyof UserContext] || match)
          .replace(/\{\{event\.(\w+)\}\}/g, (match, prop) => context.eventData[prop] || match)
          .replace(/\{\{event\.timestamp\}\}/g, context.timestamp.toISOString());
      }
    }
    
    return interpolated;
  }
}

export class AIAnalysisActionHandler implements ActionHandler {
  async execute(config: Record<string, any>, context: EventContext, user?: UserContext): Promise<any> {
    const { analysisType, includeInsights, includeRecommendations, basedOnHistory, basedOnCurrentGoal } = config;

    if (!analysisType) {
      throw new Error('AI analysis requires analysisType');
    }

    // This would integrate with your AI service
    const analysis = await this.performAnalysis(
      analysisType,
      context,
      user,
      { includeInsights, includeRecommendations, basedOnHistory, basedOnCurrentGoal }
    );

    return {
      analysisId: `analysis_${Date.now()}`,
      type: analysisType,
      result: analysis,
      executedAt: new Date(),
      userId: user?.userId
    };
  }

  private async performAnalysis(
    type: string,
    context: EventContext,
    user?: UserContext,
    options: Record<string, any> = {}
  ): Promise<any> {
    // Mock AI analysis - replace with actual AI integration
    const analysisTypes = {
      weekly_progress: () => ({
        workoutsCompleted: 4,
        caloriesBurned: 1250,
        strengthGains: '8% increase in total volume',
        insights: options.includeInsights ? [
          'Your consistency has improved 25% this week',
          'Focus on progressive overload in compound movements'
        ] : [],
        recommendations: options.includeRecommendations ? [
          'Add one more cardio session',
          'Increase protein intake by 15g daily'
        ] : []
      }),
      
      workout_recommendation: () => ({
        suggestedWorkout: 'Upper Body Push Focus',
        exercises: [
          'Bench Press: 4x6-8',
          'Overhead Press: 3x8-10',
          'Dips: 3x10-12'
        ],
        reasoning: options.basedOnHistory ? 
          'Based on your recent training, focus on push movements' :
          'General recommendation for muscle balance'
      }),
      
      next_goal_suggestions: () => ({
        suggestions: [
          {
            type: 'strength',
            goal: 'Increase bench press by 10kg',
            timeframe: '8 weeks'
          },
          {
            type: 'endurance',
            goal: 'Complete 5K in under 25 minutes',
            timeframe: '6 weeks'
          }
        ],
        reasoning: options.basedOnCurrentGoal ?
          `Based on achieving your ${context.eventData.goalType} goal` :
          'General progression recommendations'
      })
    };

    const analyzer = analysisTypes[type as keyof typeof analysisTypes];
    if (!analyzer) {
      throw new Error(`Unknown analysis type: ${type}`);
    }

    return analyzer();
  }
}

export class WebhookActionHandler implements ActionHandler {
  async execute(config: Record<string, any>, context: EventContext, user?: UserContext): Promise<any> {
    const { url, method = 'POST', headers = {}, payload } = config;
    
    if (!url) {
      throw new Error('Webhook action requires URL');
    }

    const interpolatedPayload = this.interpolatePayload(payload || {}, context, user);
    
    // Mock webhook call - replace with actual HTTP client
    const webhookCall = {
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      payload: interpolatedPayload,
      executedAt: new Date()
    };

    console.log('Webhook call:', webhookCall);
    
    return {
      webhookId: `webhook_${Date.now()}`,
      ...webhookCall,
      response: { status: 200, success: true }
    };
  }

  private interpolatePayload(payload: Record<string, any>, context: EventContext, user?: UserContext): Record<string, any> {
    const interpolated = { ...payload };
    
    // Add context data
    interpolated.event = context;
    interpolated.user = user;
    interpolated.timestamp = context.timestamp.toISOString();
    
    return interpolated;
  }
}

export class CustomActionHandler implements ActionHandler {
  async execute(config: Record<string, any>, context: EventContext, user?: UserContext): Promise<any> {
    const { handlerFunction, parameters } = config;
    
    if (!handlerFunction) {
      throw new Error('Custom action requires handlerFunction');
    }

    // This would execute custom user-defined functions
    // For security, this should be sandboxed in production
    console.log('Custom action:', { handlerFunction, parameters, context: context.eventType, user: user?.userId });
    
    return {
      customActionId: `custom_${Date.now()}`,
      handlerFunction,
      parameters,
      executedAt: new Date(),
      result: 'Custom action executed successfully'
    };
  }
}