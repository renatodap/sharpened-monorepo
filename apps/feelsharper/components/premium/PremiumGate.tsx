"use client";

import { useFeatureAccess, useSubscriptionStatus } from '@/lib/hooks/useFeatureAccess';
import { PricingButton } from '@/components/pricing/PricingButtons';
import { Lock, Star, Zap } from 'lucide-react';

interface PremiumGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUsage?: boolean;
}

export function PremiumGate({ feature, children, fallback, showUsage = true }: PremiumGateProps) {
  const { hasAccess, loading, usageCount, usageLimit, tierRequired } = useFeatureAccess(feature);
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
          <div className="mt-4 p-3 bg-surface border border-border rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Usage this month</span>
              <span className="text-text-primary">
                {usageCount} / {usageLimit}
              </span>
            </div>
            <div className="mt-2 w-full bg-border rounded-full h-2">
              <div 
                className="bg-navy h-2 rounded-full transition-all duration-300"
                style={{ width: `${(usageCount / usageLimit) * 100}%` }}
              />
            </div>
            {usageCount >= usageLimit * 0.8 && (
              <p className="mt-2 text-xs text-warning">
                You're approaching your limit. Upgrade to Premium for unlimited access.
              </p>
            )}
          </div>
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
        
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm mx-4 text-center">
            <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
              {tierRequired === 'premium' ? (
                <Lock className="w-6 h-6 text-white" />
              ) : usageLimit ? (
                <Zap className="w-6 h-6 text-white" />
              ) : (
                <Star className="w-6 h-6 text-white" />
              )}
            </div>
            
            <h3 className="text-lg font-bold text-text-primary mb-2">
              {tierRequired === 'premium' ? 'Premium Feature' : 'Usage Limit Reached'}
            </h3>
            
            <p className="text-text-secondary mb-4 text-sm">
              {tierRequired === 'premium' 
                ? 'This feature is available with a Premium subscription.'
                : `You've used all ${usageLimit} free uses this month. Upgrade for unlimited access.`
              }
            </p>
            
            <div className="space-y-2">
              <PricingButton 
                plan="premium" 
                className="w-full py-2 px-4 text-sm font-semibold text-white bg-navy rounded-lg hover:bg-navy-600 transition-all duration-200"
              >
                Upgrade to Premium
              </PricingButton>
              
              <button className="w-full py-2 px-4 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureUsageIndicatorProps {
  feature: string;
}

export function FeatureUsageIndicator({ feature }: FeatureUsageIndicatorProps) {
  const { usageCount, usageLimit, loading } = useFeatureAccess(feature);
  const { tier } = useSubscriptionStatus();

  if (loading || !usageLimit || tier === 'premium') return null;

  const percentage = (usageCount / usageLimit) * 100;
  const isNearLimit = percentage >= 80;

  return (
    <div className={`text-xs px-2 py-1 rounded-full ${
      isNearLimit 
        ? 'bg-warning/10 text-warning' 
        : 'bg-surface text-text-secondary'
    }`}>
      {usageCount} / {usageLimit}
      {isNearLimit && ' ⚠️'}
    </div>
  );
}