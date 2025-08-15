/**
 * Feature Gate System for Freemium Model
 * Maps to PRD: Business Model - Freemium
 */

import type { UserTier } from '@/lib/ai/types';

// Feature limits per tier
export const FEATURE_LIMITS = {
  // AI Features
  workout_parsing: { free: 10, pro: 100, elite: null },
  food_parsing: { free: 10, pro: 100, elite: null },
  voice_input: { free: 0, pro: 50, elite: null },
  ai_coaching: { free: 5, pro: 50, elite: null },
  
  // Advanced Features
  photo_analysis: { free: 0, pro: 10, elite: null },
  wearables_sync: { free: false, pro: true, elite: true },
  export_data: { free: false, pro: true, elite: true },
  coach_dashboard: { free: false, pro: false, elite: true },
  
  // Data Limits
  history_days: { free: 30, pro: 365, elite: null },
  workout_templates: { free: 3, pro: 20, elite: null },
} as const;

export type FeatureKey = keyof typeof FEATURE_LIMITS;

export interface UsageLimit {
  monthly_limit: number | null; // null = unlimited
  current_usage: number;
  resets_at: Date;
}

export interface FeatureAccess {
  hasAccess: boolean;
  usageLimit: UsageLimit | null;
  upgradeRequired: boolean;
  tierRequired: UserTier;
}

export class FeatureGate {
  /**
   * Check if user has access to a feature
   */
  static checkAccess(
    feature: FeatureKey, 
    userTier: UserTier,
    currentUsage = 0
  ): FeatureAccess {
    const limits = FEATURE_LIMITS[feature];
    
    if (!limits) {
      return {
        hasAccess: false,
        usageLimit: null,
        upgradeRequired: true,
        tierRequired: 'pro'
      };
    }

    const monthlyLimit = limits[userTier];
    
    // Boolean features (true/false access)
    if (typeof monthlyLimit === 'boolean') {
      return {
        hasAccess: monthlyLimit,
        usageLimit: null,
        upgradeRequired: !monthlyLimit,
        tierRequired: this.getRequiredTier(feature)
      };
    }
    
    // Usage-based features
    if (monthlyLimit === null) {
      // Unlimited access
      return {
        hasAccess: true,
        usageLimit: null,
        upgradeRequired: false,
        tierRequired: userTier
      };
    }
    
    // Limited access
    const hasAccess = currentUsage < monthlyLimit;
    const nextMonthReset = new Date();
    nextMonthReset.setMonth(nextMonthReset.getMonth() + 1, 1);
    nextMonthReset.setHours(0, 0, 0, 0);
    
    return {
      hasAccess,
      usageLimit: {
        monthly_limit: monthlyLimit,
        current_usage: currentUsage,
        resets_at: nextMonthReset
      },
      upgradeRequired: !hasAccess,
      tierRequired: this.getRequiredTier(feature)
    };
  }

  /**
   * Get the minimum tier required for unlimited access to a feature
   */
  static getRequiredTier(feature: FeatureKey): UserTier {
    const limits = FEATURE_LIMITS[feature];
    
    if (limits.elite === null || limits.elite === true) return 'elite';
    if (limits.pro === null || limits.pro === true) return 'pro';
    return 'free';
  }

  /**
   * Get feature limits for a specific tier
   */
  static getLimitsForTier(tier: UserTier): Record<FeatureKey, number | boolean | null> {
    const result: Record<string, any> = {};
    
    for (const [feature, limits] of Object.entries(FEATURE_LIMITS)) {
      result[feature] = limits[tier];
    }
    
    return result as Record<FeatureKey, number | boolean | null>;
  }

  /**
   * Check if user should be prompted to upgrade
   */
  static shouldPromptUpgrade(
    userTier: UserTier,
    recentUsage: Record<string, number>
  ): boolean {
    if (userTier !== 'free') return false;
    
    // Prompt if user has hit 80% of any limit
    for (const [feature, usage] of Object.entries(recentUsage)) {
      if (feature in FEATURE_LIMITS) {
        const limit = FEATURE_LIMITS[feature as FeatureKey].free;
        if (typeof limit === 'number' && usage >= limit * 0.8) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Calculate upgrade urgency (0-1 scale)
   */
  static calculateUpgradeUrgency(
    userTier: UserTier,
    recentUsage: Record<string, number>
  ): number {
    if (userTier !== 'free') return 0;
    
    let maxUrgency = 0;
    
    for (const [feature, usage] of Object.entries(recentUsage)) {
      if (feature in FEATURE_LIMITS) {
        const limit = FEATURE_LIMITS[feature as FeatureKey].free;
        if (typeof limit === 'number' && limit > 0) {
          const urgency = Math.min(1, usage / limit);
          maxUrgency = Math.max(maxUrgency, urgency);
        }
      }
    }
    
    return maxUrgency;
  }

  /**
   * Get personalized upgrade message
   */
  static getUpgradeMessage(
    feature: FeatureKey,
    userTier: UserTier
  ): string {
    const requiredTier = this.getRequiredTier(feature);
    const tierName = requiredTier === 'elite' ? 'Elite' : 'Pro';
    
    const messages: Record<FeatureKey, string> = {
      workout_parsing: `Upgrade to ${tierName} for unlimited AI workout parsing`,
      food_parsing: `Upgrade to ${tierName} for unlimited AI food logging`,
      voice_input: `Upgrade to ${tierName} to use voice input for logging`,
      ai_coaching: `Upgrade to ${tierName} for unlimited AI coaching sessions`,
      photo_analysis: `Upgrade to ${tierName} to analyze food photos`,
      wearables_sync: `Upgrade to ${tierName} to sync with your fitness devices`,
      export_data: `Upgrade to ${tierName} to export your data`,
      coach_dashboard: `Upgrade to Elite for the coach dashboard`,
      history_days: `Upgrade to ${tierName} for unlimited data history`,
      workout_templates: `Upgrade to ${tierName} for more workout templates`
    };
    
    return messages[feature] || `Upgrade to ${tierName} to unlock this feature`;
  }
}