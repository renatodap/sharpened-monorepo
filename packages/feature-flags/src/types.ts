// Feature flag types and interfaces
export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  conditions?: FlagCondition[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FlagCondition {
  type: 'user_property' | 'segment' | 'date_range' | 'custom';
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  property: string;
  value: any;
}

export interface UserContext {
  userId: string;
  email?: string;
  subscriptionTier?: 'free' | 'basic' | 'premium';
  signupDate?: Date;
  properties?: Record<string, any>;
}

export interface FlagEvaluation {
  flagKey: string;
  enabled: boolean;
  reason: 'enabled' | 'disabled' | 'rollout' | 'condition_met' | 'condition_failed' | 'error';
  value?: any;
}