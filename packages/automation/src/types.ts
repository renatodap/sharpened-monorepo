// Core automation types and interfaces

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'webhook' | 'manual';
  config: Record<string, any>;
}

export interface WorkflowCondition {
  type: 'user_property' | 'date_range' | 'custom' | 'data_condition';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  field: string;
  value: any;
  logic?: 'and' | 'or';
}

export interface WorkflowAction {
  id: string;
  type: 'email' | 'notification' | 'database' | 'ai_analysis' | 'webhook' | 'custom';
  config: Record<string, any>;
  retryConfig?: RetryConfig;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  backoffMultiplier: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  triggeredBy: WorkflowTrigger;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  context: Record<string, any>;
  executedActions: ActionExecution[];
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
}

export interface ActionExecution {
  actionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  attempts: number;
  executedAt?: Date;
  duration?: number;
}

// Pre-built workflow templates
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'user_engagement' | 'retention' | 'analytics' | 'moderation' | 'growth';
  workflow: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>;
  configurable: string[]; // List of fields that can be customized
}

// Event types for triggers
export type UserEvent = 
  | 'user_registered'
  | 'user_logged_in'
  | 'workout_completed'
  | 'food_logged'
  | 'weight_logged'
  | 'subscription_started'
  | 'subscription_cancelled'
  | 'goal_achieved'
  | 'streak_broken'
  | 'streak_milestone';

export type SystemEvent = 
  | 'daily_summary'
  | 'weekly_review'
  | 'monthly_report'
  | 'data_backup'
  | 'cleanup_old_data'
  | 'generate_insights';

// Context data structures
export interface UserContext {
  userId: string;
  email: string;
  name?: string;
  subscriptionTier: 'free' | 'basic' | 'premium';
  joinedAt: Date;
  lastActiveAt: Date;
  properties: Record<string, any>;
}

export interface EventContext {
  eventType: UserEvent | SystemEvent;
  eventData: Record<string, any>;
  timestamp: Date;
  source: string;
  user?: UserContext;
}