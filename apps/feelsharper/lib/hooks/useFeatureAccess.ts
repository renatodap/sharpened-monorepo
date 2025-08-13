"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface FeatureAccess {
  hasAccess: boolean;
  loading: boolean;
  usageCount: number;
  usageLimit: number | null;
  tierRequired: 'free' | 'premium';
}

export function useFeatureAccess(featureKey: string): FeatureAccess {
  const [access, setAccess] = useState<FeatureAccess>({
    hasAccess: false,
    loading: true,
    usageCount: 0,
    usageLimit: null,
    tierRequired: 'free',
  });

  const supabase = createClient();

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setAccess({
            hasAccess: false,
            loading: false,
            usageCount: 0,
            usageLimit: null,
            tierRequired: 'free',
          });
          return;
        }

        // Get feature requirements
        const { data: feature, error: featureError } = await supabase
          .from('premium_features')
          .select('tier_required, usage_limit')
          .eq('feature_key', featureKey)
          .eq('is_active', true)
          .single();

        if (featureError || !feature) {
          console.error('Feature not found:', featureKey);
          setAccess(prev => ({ ...prev, loading: false, hasAccess: false }));
          return;
        }

        // Get user subscription tier
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        const userTier = profile?.subscription_tier || 'free';

        // Check if user has required tier
        const hasTierAccess = feature.tier_required === 'free' || 
          (feature.tier_required === 'premium' && userTier === 'premium');

        // Get current usage if there's a limit
        let currentUsage = 0;
        if (feature.usage_limit) {
          const { data: usage, error: usageError } = await supabase
            .from('feature_usage')
            .select('usage_count')
            .eq('user_id', user.id)
            .eq('feature_name', featureKey)
            .gte('period_end', new Date().toISOString().split('T')[0])
            .single();

          if (!usageError && usage) {
            currentUsage = usage.usage_count;
          }
        }

        const hasUsageAccess = !feature.usage_limit || currentUsage < feature.usage_limit;
        const hasFullAccess = hasTierAccess && hasUsageAccess;

        setAccess({
          hasAccess: hasFullAccess,
          loading: false,
          usageCount: currentUsage,
          usageLimit: feature.usage_limit,
          tierRequired: feature.tier_required,
        });

      } catch (error) {
        console.error('Error checking feature access:', error);
        setAccess(prev => ({ ...prev, loading: false, hasAccess: false }));
      }
    }

    checkAccess();
  }, [featureKey, supabase]);

  return access;
}

export async function trackFeatureUsage(featureKey: string, metadata = {}) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await supabase.rpc('track_feature_usage', {
      user_id_param: user.id,
      feature_key_param: featureKey,
      metadata_param: metadata,
    });
  } catch (error) {
    console.error('Error tracking feature usage:', error);
  }
}

export function useSubscriptionStatus() {
  const [status, setStatus] = useState<{
    tier: 'free' | 'premium';
    status: string;
    loading: boolean;
  }>({
    tier: 'free',
    status: 'active',
    loading: true,
  });

  const supabase = createClient();

  useEffect(() => {
    async function getStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setStatus({ tier: 'free', status: 'active', loading: false });
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status')
          .eq('id', user.id)
          .single();

        setStatus({
          tier: profile?.subscription_tier || 'free',
          status: profile?.subscription_status || 'active',
          loading: false,
        });

      } catch (error) {
        console.error('Error getting subscription status:', error);
        setStatus({ tier: 'free', status: 'active', loading: false });
      }
    }

    getStatus();
  }, [supabase]);

  return status;
}