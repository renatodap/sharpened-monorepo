/**
 * useFeatureGate - React hook for freemium feature access
 * Maps to PRD: Business Model - Freemium
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { FeatureGate, type FeatureKey, type FeatureAccess } from '@/lib/freemium/FeatureGate';
import type { UserTier } from '@/lib/ai/types';

interface FeatureGateHook extends FeatureAccess {
  loading: boolean;
  checkAccess: () => Promise<void>;
  trackUsage: () => Promise<void>;
  upgradeUrl: string;
}

export function useFeatureGate(feature: FeatureKey): FeatureGateHook {
  const { user } = useAuth();
  const [access, setAccess] = useState<FeatureAccess>({
    hasAccess: false,
    usageLimit: null,
    upgradeRequired: true,
    tierRequired: 'pro'
  });
  const [loading, setLoading] = useState(true);

  // Get user tier (default to free)
  const getUserTier = useCallback(async (): Promise<UserTier> => {
    if (!user) return 'free';
    
    // TODO: Implement subscription check
    // For now, return free for all users
    return 'free';
  }, [user]);

  // Get current usage for this month
  const getCurrentUsage = useCallback(async (feature: FeatureKey): Promise<number> => {
    if (!user) return 0;
    
    try {
      // Calculate start of current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const response = await fetch('/api/usage/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feature,
          start_date: startOfMonth.toISOString()
        })
      });
      
      if (!response.ok) return 0;
      
      const data = await response.json();
      return data.usage_count || 0;
    } catch (error) {
      console.error('Failed to get usage:', error);
      return 0;
    }
  }, [user]);

  // Check feature access
  const checkAccess = useCallback(async () => {
    setLoading(true);
    
    try {
      const [userTier, currentUsage] = await Promise.all([
        getUserTier(),
        getCurrentUsage(feature)
      ]);
      
      const featureAccess = FeatureGate.checkAccess(feature, userTier, currentUsage);
      setAccess(featureAccess);
    } catch (error) {
      console.error('Failed to check feature access:', error);
      // Default to restricted access on error
      setAccess({
        hasAccess: false,
        usageLimit: null,
        upgradeRequired: true,
        tierRequired: 'pro'
      });
    } finally {
      setLoading(false);
    }
  }, [feature, getUserTier, getCurrentUsage]);

  // Track feature usage
  const trackUsage = useCallback(async () => {
    if (!user) return;
    
    try {
      await fetch('/api/usage/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feature,
          timestamp: new Date().toISOString()
        })
      });
      
      // Refresh access after tracking usage
      checkAccess();
    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }, [user, feature, checkAccess]);

  // Check access on mount and when dependencies change
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Generate upgrade URL based on required tier
  const upgradeUrl = access.tierRequired === 'elite' 
    ? '/upgrade?plan=elite' 
    : '/upgrade?plan=pro';

  return {
    ...access,
    loading,
    checkAccess,
    trackUsage,
    upgradeUrl
  };
}

// Convenience hook for subscription status
export function useSubscriptionStatus() {
  const { user } = useAuth();
  const [tier, setTier] = useState<UserTier>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setTier('free');
        setLoading(false);
        return;
      }

      try {
        // TODO: Implement actual subscription check
        // For now, everyone is free tier
        setTier('free');
      } catch (error) {
        console.error('Failed to check subscription:', error);
        setTier('free');
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, [user]);

  return { tier, loading };
}

// Hook for upgrade prompts
export function useUpgradePrompt() {
  const { user } = useAuth();
  const [shouldPrompt, setShouldPrompt] = useState(false);
  const [urgency, setUrgency] = useState(0);

  useEffect(() => {
    async function checkUpgradePrompt() {
      if (!user) return;

      try {
        const response = await fetch('/api/usage/upgrade-prompt');
        if (response.ok) {
          const data = await response.json();
          setShouldPrompt(data.should_prompt);
          setUrgency(data.urgency);
        }
      } catch (error) {
        console.error('Failed to check upgrade prompt:', error);
      }
    }

    checkUpgradePrompt();
  }, [user]);

  return { shouldPrompt, urgency };
}