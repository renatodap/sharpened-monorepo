"use client";

import { useFeatureGate, useSubscriptionStatus } from '@/hooks/useFeatureGate';
import { UpgradePrompt, InlineUpgradePrompt } from '@/components/freemium/UpgradePrompt';
import { Lock, Star, Zap } from 'lucide-react';
import type { FeatureKey } from '@/lib/freemium/FeatureGate';

interface PremiumGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUsage?: boolean;
}

export function PremiumGate({ feature, children, fallback, showUsage = true }: PremiumGateProps) {
  const { hasAccess, loading, usageLimit, upgradeRequired, tierRequired } = useFeatureGate(feature);
  const { tier } = useSubscriptionStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <>
        {children}
        {showUsage && usageLimit && tier === 'free' && (
          <InlineUpgradePrompt feature={feature} className="mt-4" />
        )}
      </>
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Show upgrade prompt
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-bg/90 backdrop-blur-sm z-10 rounded-lg" />
      
      <div className="relative">
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
        
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
          <UpgradePrompt feature={feature} className="max-w-sm" />
        </div>
      </div>
    </div>
  );
}

interface FeatureUsageIndicatorProps {
  feature: FeatureKey;
}

export function FeatureUsageIndicator({ feature }: FeatureUsageIndicatorProps) {
  const { usageLimit, loading } = useFeatureGate(feature);
  const { tier } = useSubscriptionStatus();

  if (loading || !usageLimit || tier !== 'free') return null;

  const percentage = (usageLimit.current_usage / (usageLimit.monthly_limit || 1)) * 100;
  const isNearLimit = percentage >= 80;

  return (
    <div className={`text-xs px-2 py-1 rounded-full ${
      isNearLimit 
        ? 'bg-warning/10 text-warning' 
        : 'bg-surface text-text-secondary'
    }`}>
      {usageLimit.current_usage} / {usageLimit.monthly_limit}
      {isNearLimit && ' ⚠️'}
    </div>
  );
}