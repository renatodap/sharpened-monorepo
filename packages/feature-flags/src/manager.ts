// Feature flag manager and evaluation engine
import type { FeatureFlag, FlagCondition, UserContext, FlagEvaluation } from './types';

export class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map();
  private cache: Map<string, FlagEvaluation> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor(private databaseQueries?: any) {}

  async loadFlags(): Promise<void> {
    if (this.databaseQueries) {
      const flags = await this.databaseQueries.getFeatureFlags();
      for (const flag of flags) {
        this.flags.set(flag.key, flag);
      }
    } else {
      // Load default flags for development
      this.loadDefaultFlags();
    }
  }

  private loadDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        key: 'ai_coach_chat',
        name: 'AI Coach Chat',
        description: 'Enable AI-powered coaching chat feature',
        enabled: true,
        rolloutPercentage: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'premium_insights',
        name: 'Premium Insights',
        description: 'Advanced analytics and insights for premium users',
        enabled: true,
        rolloutPercentage: 100,
        conditions: [
          {
            type: 'user_property',
            operator: 'in',
            property: 'subscriptionTier',
            value: ['basic', 'premium'],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'social_features',
        name: 'Social Features',
        description: 'Social sharing and leaderboards',
        enabled: false,
        rolloutPercentage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'mobile_app_promotion',
        name: 'Mobile App Promotion',
        description: 'Show mobile app download prompts',
        enabled: true,
        rolloutPercentage: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'enhanced_food_logging',
        name: 'Enhanced Food Logging',
        description: 'New food logging interface with AI suggestions',
        enabled: true,
        rolloutPercentage: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: 'workout_programs',
        name: 'Workout Programs',
        description: 'Structured workout program system',
        enabled: true,
        rolloutPercentage: 75,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const flag of defaultFlags) {
      this.flags.set(flag.key, flag);
    }
  }

  isEnabled(flagKey: string, userContext: UserContext): boolean {
    const evaluation = this.evaluateFlag(flagKey, userContext);
    return evaluation.enabled;
  }

  evaluateFlag(flagKey: string, userContext: UserContext): FlagEvaluation {
    // Check cache first
    const cacheKey = `${flagKey}:${userContext.userId}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached;
    }

    const flag = this.flags.get(flagKey);
    if (!flag) {
      const evaluation: FlagEvaluation = {
        flagKey,
        enabled: false,
        reason: 'error',
      };
      return evaluation;
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      const evaluation: FlagEvaluation = {
        flagKey,
        enabled: false,
        reason: 'disabled',
      };
      this.cacheEvaluation(cacheKey, evaluation);
      return evaluation;
    }

    // Check conditions first
    if (flag.conditions && flag.conditions.length > 0) {
      const conditionsMet = this.evaluateConditions(flag.conditions, userContext);
      if (!conditionsMet) {
        const evaluation: FlagEvaluation = {
          flagKey,
          enabled: false,
          reason: 'condition_failed',
        };
        this.cacheEvaluation(cacheKey, evaluation);
        return evaluation;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const userHash = this.hashUser(userContext.userId, flagKey);
      const isInRollout = userHash < flag.rolloutPercentage;
      
      const evaluation: FlagEvaluation = {
        flagKey,
        enabled: isInRollout,
        reason: isInRollout ? 'rollout' : 'disabled',
      };
      this.cacheEvaluation(cacheKey, evaluation);
      return evaluation;
    }

    // Flag is enabled
    const evaluation: FlagEvaluation = {
      flagKey,
      enabled: true,
      reason: flag.conditions ? 'condition_met' : 'enabled',
    };
    this.cacheEvaluation(cacheKey, evaluation);
    return evaluation;
  }

  private evaluateConditions(conditions: FlagCondition[], userContext: UserContext): boolean {
    return conditions.every(condition => this.evaluateCondition(condition, userContext));
  }

  private evaluateCondition(condition: FlagCondition, userContext: UserContext): boolean {
    let value: any;

    // Get the value to compare against
    switch (condition.type) {
      case 'user_property':
        value = this.getUserProperty(userContext, condition.property);
        break;
      case 'segment':
        // For segments, you'd typically have segment logic here
        return false; // Placeholder
      case 'date_range':
        value = new Date();
        break;
      default:
        return false;
    }

    // Evaluate the condition
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value);
      case 'greater_than':
        return value > condition.value;
      case 'less_than':
        return value < condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return !Array.isArray(condition.value) || !condition.value.includes(value);
      default:
        return false;
    }
  }

  private getUserProperty(userContext: UserContext, property: string): any {
    switch (property) {
      case 'userId':
        return userContext.userId;
      case 'email':
        return userContext.email;
      case 'subscriptionTier':
        return userContext.subscriptionTier;
      case 'signupDate':
        return userContext.signupDate;
      default:
        return userContext.properties?.[property];
    }
  }

  private hashUser(userId: string, flagKey: string): number {
    // Simple hash function for consistent rollout
    const str = `${userId}:${flagKey}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  private cacheEvaluation(cacheKey: string, evaluation: FlagEvaluation): void {
    this.cache.set(cacheKey, {
      ...evaluation,
      timestamp: Date.now(),
    });
  }

  // Admin methods
  async createFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): Promise<FeatureFlag> {
    const newFlag: FeatureFlag = {
      ...flag,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.databaseQueries) {
      await this.databaseQueries.createFeatureFlag(newFlag);
    }

    this.flags.set(newFlag.key, newFlag);
    this.invalidateCache(newFlag.key);
    return newFlag;
  }

  async updateFlag(flagKey: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag | null> {
    const flag = this.flags.get(flagKey);
    if (!flag) return null;

    const updatedFlag: FeatureFlag = {
      ...flag,
      ...updates,
      updatedAt: new Date(),
    };

    if (this.databaseQueries) {
      await this.databaseQueries.updateFeatureFlag(flagKey, updates);
    }

    this.flags.set(flagKey, updatedFlag);
    this.invalidateCache(flagKey);
    return updatedFlag;
  }

  async deleteFlag(flagKey: string): Promise<boolean> {
    if (!this.flags.has(flagKey)) return false;

    if (this.databaseQueries) {
      await this.databaseQueries.deleteFeatureFlag(flagKey);
    }

    this.flags.delete(flagKey);
    this.invalidateCache(flagKey);
    return true;
  }

  private invalidateCache(flagKey: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(`${flagKey}:`));
    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  clearCache(): void {
    this.cache.clear();
  }
}