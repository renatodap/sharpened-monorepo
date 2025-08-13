// Workflow execution engine
import type {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowCondition,
  WorkflowAction,
  ActionExecution,
  EventContext,
  UserContext
} from './types';
import { ConditionEvaluator } from './conditions';
import { ActionExecutor } from './actions';

export class WorkflowEngine {
  private conditionEvaluator: ConditionEvaluator;
  private actionExecutor: ActionExecutor;
  private executions: Map<string, WorkflowExecution> = new Map();

  constructor() {
    this.conditionEvaluator = new ConditionEvaluator();
    this.actionExecutor = new ActionExecutor();
  }

  async executeWorkflow(
    workflow: WorkflowDefinition,
    context: EventContext,
    user?: UserContext
  ): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: this.generateExecutionId(),
      workflowId: workflow.id,
      triggeredBy: workflow.trigger,
      status: 'running',
      context: { ...context, user },
      executedActions: [],
      startedAt: new Date(),
    };

    this.executions.set(execution.id, execution);

    try {
      // Evaluate conditions
      if (workflow.conditions && workflow.conditions.length > 0) {
        const conditionsMet = await this.evaluateConditions(workflow.conditions, context, user);
        if (!conditionsMet) {
          execution.status = 'completed';
          execution.executedActions = workflow.actions.map(action => ({
            actionId: action.id,
            status: 'skipped',
            attempts: 0,
          }));
          this.completeExecution(execution);
          return execution;
        }
      }

      // Execute actions
      for (const action of workflow.actions) {
        const actionExecution = await this.executeAction(action, context, user);
        execution.executedActions.push(actionExecution);

        // Stop execution if action fails and no retry is configured
        if (actionExecution.status === 'failed' && !action.retryConfig) {
          execution.status = 'failed';
          execution.error = actionExecution.error;
          break;
        }
      }

      if (execution.status === 'running') {
        execution.status = 'completed';
      }

      this.completeExecution(execution);
      return execution;

    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      this.completeExecution(execution);
      return execution;
    }
  }

  private async evaluateConditions(
    conditions: WorkflowCondition[],
    context: EventContext,
    user?: UserContext
  ): Promise<boolean> {
    return this.conditionEvaluator.evaluate(conditions, context, user);
  }

  private async executeAction(
    action: WorkflowAction,
    context: EventContext,
    user?: UserContext
  ): Promise<ActionExecution> {
    const actionExecution: ActionExecution = {
      actionId: action.id,
      status: 'running',
      attempts: 0,
      executedAt: new Date(),
    };

    const startTime = Date.now();

    try {
      const result = await this.actionExecutor.execute(action, context, user);
      actionExecution.status = 'completed';
      actionExecution.result = result;
      actionExecution.attempts = 1;
    } catch (error) {
      actionExecution.status = 'failed';
      actionExecution.error = error instanceof Error ? error.message : 'Unknown error';
      actionExecution.attempts = 1;

      // Retry logic
      if (action.retryConfig) {
        await this.retryAction(action, actionExecution, context, user);
      }
    }

    actionExecution.duration = Date.now() - startTime;
    return actionExecution;
  }

  private async retryAction(
    action: WorkflowAction,
    actionExecution: ActionExecution,
    context: EventContext,
    user?: UserContext
  ): Promise<void> {
    const retryConfig = action.retryConfig!;
    let backoffMs = retryConfig.backoffMs;

    for (let attempt = 2; attempt <= retryConfig.maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, backoffMs));
      
      try {
        const result = await this.actionExecutor.execute(action, context, user);
        actionExecution.status = 'completed';
        actionExecution.result = result;
        actionExecution.attempts = attempt;
        return;
      } catch (error) {
        actionExecution.error = error instanceof Error ? error.message : 'Unknown error';
        actionExecution.attempts = attempt;
        backoffMs *= retryConfig.backoffMultiplier;
      }
    }
  }

  private completeExecution(execution: WorkflowExecution): void {
    execution.completedAt = new Date();
    execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getWorkflowExecutions(workflowId: string): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(exec => exec.workflowId === workflowId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  // Cleanup old executions to prevent memory leaks
  cleanupExecutions(olderThanHours = 24): void {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    
    for (const [executionId, execution] of this.executions.entries()) {
      if (execution.startedAt.getTime() < cutoffTime) {
        this.executions.delete(executionId);
      }
    }
  }
}

// Pre-built workflow templates
export const WorkflowTemplates = {
  welcomeNewUser: {
    id: 'welcome-new-user',
    name: 'Welcome New User',
    description: 'Send welcome email and setup guidance to new users',
    category: 'user_engagement' as const,
    workflow: {
      name: 'Welcome New User',
      description: 'Automated onboarding for new users',
      enabled: true,
      trigger: {
        type: 'event' as const,
        config: { eventType: 'user_registered' }
      },
      actions: [
        {
          id: 'send-welcome-email',
          type: 'email' as const,
          config: {
            template: 'welcome-feelsharper',
            personalizedSubject: true
          }
        },
        {
          id: 'track-registration',
          type: 'database' as const,
          config: {
            table: 'user_events',
            action: 'insert',
            data: {
              event_type: 'welcome_email_sent',
              user_id: '{{user.userId}}',
              metadata: { source: 'automation' }
            }
          }
        }
      ]
    },
    configurable: ['actions.0.config.template', 'actions.0.config.personalizedSubject']
  },

  weeklyProgressReport: {
    id: 'weekly-progress-report',
    name: 'Weekly Progress Report',
    description: 'Generate and send weekly progress summaries to active users',
    category: 'analytics' as const,
    workflow: {
      name: 'Weekly Progress Report',
      description: 'Automated weekly progress analysis and email',
      enabled: true,
      trigger: {
        type: 'schedule' as const,
        config: { cron: '0 9 * * 1' } // Every Monday at 9 AM
      },
      conditions: [
        {
          type: 'user_property' as const,
          operator: 'greater_than' as const,
          field: 'workouts_last_week',
          value: 0
        }
      ],
      actions: [
        {
          id: 'generate-progress-analysis',
          type: 'ai_analysis' as const,
          config: {
            analysisType: 'weekly_progress',
            includeInsights: true,
            includeRecommendations: true
          }
        },
        {
          id: 'send-progress-email',
          type: 'email' as const,
          config: {
            template: 'weekly-progress',
            includeCharts: true
          }
        }
      ]
    },
    configurable: ['trigger.config.cron', 'conditions.0.value', 'actions.1.config.template']
  },

  inactiveUserReengagement: {
    id: 'inactive-user-reengagement',
    name: 'Inactive User Re-engagement',
    description: 'Re-engage users who haven\'t logged workouts in 7 days',
    category: 'retention' as const,
    workflow: {
      name: 'Inactive User Re-engagement',
      description: 'Automated re-engagement for inactive users',
      enabled: true,
      trigger: {
        type: 'schedule' as const,
        config: { cron: '0 10 * * *' } // Daily at 10 AM
      },
      conditions: [
        {
          type: 'user_property' as const,
          operator: 'greater_than' as const,
          field: 'days_since_last_workout',
          value: 7
        },
        {
          type: 'user_property' as const,
          operator: 'less_than' as const,
          field: 'days_since_last_workout',
          value: 30,
          logic: 'and'
        }
      ],
      actions: [
        {
          id: 'send-motivation-email',
          type: 'email' as const,
          config: {
            template: 'comeback-motivation',
            personalizeContent: true
          }
        },
        {
          id: 'offer-workout-suggestion',
          type: 'ai_analysis' as const,
          config: {
            analysisType: 'workout_recommendation',
            basedOnHistory: true
          }
        }
      ]
    },
    configurable: ['conditions.0.value', 'conditions.1.value', 'actions.0.config.template']
  },

  goalAchievementCelebration: {
    id: 'goal-achievement-celebration',
    name: 'Goal Achievement Celebration',
    description: 'Celebrate when users achieve their fitness goals',
    category: 'user_engagement' as const,
    workflow: {
      name: 'Goal Achievement Celebration',
      description: 'Automated celebration for goal achievements',
      enabled: true,
      trigger: {
        type: 'event' as const,
        config: { eventType: 'goal_achieved' }
      },
      actions: [
        {
          id: 'send-congratulations-email',
          type: 'email' as const,
          config: {
            template: 'goal-achieved',
            includeAchievementBadge: true
          }
        },
        {
          id: 'update-user-achievements',
          type: 'database' as const,
          config: {
            table: 'user_achievements',
            action: 'insert',
            data: {
              user_id: '{{user.userId}}',
              achievement_type: '{{event.goalType}}',
              achieved_at: '{{event.timestamp}}'
            }
          }
        },
        {
          id: 'generate-new-goal-suggestions',
          type: 'ai_analysis' as const,
          config: {
            analysisType: 'next_goal_suggestions',
            basedOnCurrentGoal: true
          }
        }
      ]
    },
    configurable: ['actions.0.config.template', 'actions.0.config.includeAchievementBadge']
  }
};