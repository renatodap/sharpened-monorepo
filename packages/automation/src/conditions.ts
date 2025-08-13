// Condition evaluation system for workflows
import type { WorkflowCondition, EventContext, UserContext } from './types';

export class ConditionEvaluator {
  async evaluate(
    conditions: WorkflowCondition[],
    context: EventContext,
    user?: UserContext
  ): Promise<boolean> {
    if (conditions.length === 0) return true;

    // Group conditions by logic operator
    const andConditions = conditions.filter(c => !c.logic || c.logic === 'and');
    const orConditions = conditions.filter(c => c.logic === 'or');

    // All AND conditions must be true
    const andResult = andConditions.length === 0 || 
      andConditions.every(condition => this.evaluateCondition(condition, context, user));

    // At least one OR condition must be true (if any exist)
    const orResult = orConditions.length === 0 || 
      orConditions.some(condition => this.evaluateCondition(condition, context, user));

    return andResult && orResult;
  }

  private evaluateCondition(
    condition: WorkflowCondition,
    context: EventContext,
    user?: UserContext
  ): boolean {
    const actualValue = this.getFieldValue(condition.field, condition.type, context, user);
    const expectedValue = condition.value;

    return this.compareValues(actualValue, expectedValue, condition.operator);
  }

  private getFieldValue(
    field: string,
    type: WorkflowCondition['type'],
    context: EventContext,
    user?: UserContext
  ): any {
    switch (type) {
      case 'user_property':
        if (!user) return null;
        
        // Handle nested properties like 'properties.lastWorkoutDate'
        if (field.includes('.')) {
          const [obj, prop] = field.split('.');
          return (user as any)[obj]?.[prop];
        }
        
        // Special computed fields
        if (field === 'days_since_last_workout') {
          const lastWorkout = user.properties?.lastWorkoutDate;
          if (!lastWorkout) return 999; // Large number if never worked out
          return Math.floor((Date.now() - new Date(lastWorkout).getTime()) / (1000 * 60 * 60 * 24));
        }
        
        if (field === 'workouts_last_week') {
          return user.properties?.workoutsLastWeek || 0;
        }
        
        return (user as any)[field] || user.properties?.[field];

      case 'date_range':
        const now = new Date();
        switch (field) {
          case 'current_hour':
            return now.getHours();
          case 'current_day':
            return now.getDay(); // 0 = Sunday, 1 = Monday, etc.
          case 'current_date':
            return now.toISOString().split('T')[0];
          default:
            return now;
        }

      case 'data_condition':
        return context.eventData[field];

      case 'custom':
        // Custom logic can be implemented here
        return this.evaluateCustomField(field, context, user);

      default:
        return null;
    }
  }

  private evaluateCustomField(
    field: string,
    context: EventContext,
    user?: UserContext
  ): any {
    // Custom field evaluation logic
    switch (field) {
      case 'is_weekend':
        const day = new Date().getDay();
        return day === 0 || day === 6;
        
      case 'subscription_active':
        return user?.subscriptionTier !== 'free';
        
      case 'account_age_days':
        if (!user?.joinedAt) return 0;
        return Math.floor((Date.now() - user.joinedAt.getTime()) / (1000 * 60 * 60 * 24));
        
      case 'streak_length':
        return user?.properties?.currentStreak || 0;
        
      case 'total_workouts':
        return user?.properties?.totalWorkouts || 0;
        
      default:
        return null;
    }
  }

  private compareValues(actual: any, expected: any, operator: WorkflowCondition['operator']): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
        
      case 'not_equals':
        return actual !== expected;
        
      case 'greater_than':
        return Number(actual) > Number(expected);
        
      case 'less_than':
        return Number(actual) < Number(expected);
        
      case 'contains':
        if (typeof actual === 'string' && typeof expected === 'string') {
          return actual.toLowerCase().includes(expected.toLowerCase());
        }
        if (Array.isArray(actual)) {
          return actual.includes(expected);
        }
        return false;
        
      case 'in':
        if (!Array.isArray(expected)) return false;
        return expected.includes(actual);
        
      case 'not_in':
        if (!Array.isArray(expected)) return true;
        return !expected.includes(actual);
        
      default:
        return false;
    }
  }
}

// Pre-built condition templates for common use cases
export const ConditionTemplates = {
  // User engagement conditions
  isActiveUser: (days = 7): WorkflowCondition => ({
    type: 'user_property',
    operator: 'less_than',
    field: 'days_since_last_workout',
    value: days
  }),

  isInactiveUser: (days = 7): WorkflowCondition => ({
    type: 'user_property',
    operator: 'greater_than',
    field: 'days_since_last_workout',
    value: days
  }),

  hasMinimumWorkouts: (count = 1): WorkflowCondition => ({
    type: 'user_property',
    operator: 'greater_than',
    field: 'workouts_last_week',
    value: count - 1
  }),

  isPremiumUser: (): WorkflowCondition => ({
    type: 'user_property',
    operator: 'in',
    field: 'subscriptionTier',
    value: ['basic', 'premium']
  }),

  // Time-based conditions
  isWeekend: (): WorkflowCondition => ({
    type: 'custom',
    operator: 'equals',
    field: 'is_weekend',
    value: true
  }),

  isDuringBusinessHours: (): WorkflowCondition => ({
    type: 'date_range',
    operator: 'greater_than',
    field: 'current_hour',
    value: 8,
    logic: 'and'
  }),

  isNewUser: (days = 7): WorkflowCondition => ({
    type: 'custom',
    operator: 'less_than',
    field: 'account_age_days',
    value: days
  }),

  // Achievement-based conditions
  hasActiveStreak: (minDays = 3): WorkflowCondition => ({
    type: 'custom',
    operator: 'greater_than',
    field: 'streak_length',
    value: minDays - 1
  }),

  isExperiencedUser: (minWorkouts = 50): WorkflowCondition => ({
    type: 'custom',
    operator: 'greater_than',
    field: 'total_workouts',
    value: minWorkouts - 1
  }),

  // Event-specific conditions
  isSpecificGoalType: (goalType: string): WorkflowCondition => ({
    type: 'data_condition',
    operator: 'equals',
    field: 'goalType',
    value: goalType
  }),

  isHighValueAction: (threshold = 100): WorkflowCondition => ({
    type: 'data_condition',
    operator: 'greater_than',
    field: 'actionValue',
    value: threshold
  }),

  // Compound condition builders
  buildEngagementCondition: (workoutDays = 7, minWorkouts = 1): WorkflowCondition[] => [
    ConditionTemplates.isActiveUser(workoutDays),
    ConditionTemplates.hasMinimumWorkouts(minWorkouts)
  ],

  buildRetentionCondition: (inactiveDays = 7, maxInactiveDays = 30): WorkflowCondition[] => [
    ConditionTemplates.isInactiveUser(inactiveDays),
    {
      type: 'user_property',
      operator: 'less_than',
      field: 'days_since_last_workout',
      value: maxInactiveDays,
      logic: 'and'
    }
  ],

  buildPremiumUpsellCondition: (minWorkouts = 10, minDays = 14): WorkflowCondition[] => [
    {
      type: 'user_property',
      operator: 'equals',
      field: 'subscriptionTier',
      value: 'free'
    },
    ConditionTemplates.isExperiencedUser(minWorkouts),
    {
      type: 'custom',
      operator: 'greater_than',
      field: 'account_age_days',
      value: minDays,
      logic: 'and'
    }
  ]
};