"use client";

import { useState, useEffect } from 'react';
import { X, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import { PricingButton } from '@/components/pricing/PricingButtons';
import { useSubscriptionStatus } from '@/lib/hooks/useFeatureAccess';

interface UpgradePromptProps {
  trigger: 'usage_limit' | 'feature_access' | 'streak_broken' | 'onboarding';
  featureName?: string;
  onDismiss?: () => void;
  compact?: boolean;
}

const promptCopy = {
  usage_limit: {
    icon: <Zap className="w-6 h-6" />,
    title: "You've hit your limit",
    description: "Upgrade to Premium for unlimited access to all features",
    cta: "Upgrade Now",
    urgency: "⚡ Limited time: Save 17% with annual plan",
  },
  feature_access: {
    icon: <Crown className="w-6 h-6" />,
    title: "Premium Feature",
    description: "This feature is available with Premium subscription",
    cta: "Unlock Premium",
    urgency: "Join 1,000+ users crushing their goals",
  },
  streak_broken: {
    icon: <Star className="w-6 h-6" />,
    title: "Save your streak!",
    description: "Premium users get Joker Tokens to recover broken streaks",
    cta: "Protect My Streaks",
    urgency: "🔥 Don't lose your progress",
  },
  onboarding: {
    icon: <Crown className="w-6 h-6" />,
    title: "Unlock your full potential",
    description: "Premium users see 3x better results with unlimited features",
    cta: "Start Premium",
    urgency: "✨ 14-day money-back guarantee",
  },
};

export function UpgradePrompt({ trigger, featureName, onDismiss, compact = false }: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const { tier } = useSubscriptionStatus();

  // Don't show to premium users
  if (tier === 'premium' || dismissed) return null;

  const copy = promptCopy[trigger];

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-navy/10 to-purple-600/10 border border-navy/20 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-navy">{copy.icon}</div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{copy.title}</p>
              <p className="text-xs text-text-secondary">{copy.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PricingButton 
              plan="premium" 
              className="px-3 py-1 text-sm bg-navy text-white rounded-lg hover:bg-navy/80 transition-colors"
            >
              Upgrade
            </PricingButton>
            <button onClick={handleDismiss} className="text-text-muted hover:text-text-secondary">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 max-w-sm z-50">
      <div className="bg-surface border border-border rounded-xl shadow-lg p-4">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-text-muted hover:text-text-secondary"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="pr-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-navy to-purple-600 rounded-lg flex items-center justify-center text-white">
              {copy.icon}
            </div>
            <div>
              <h3 className="font-bold text-text-primary">{copy.title}</h3>
              <p className="text-sm text-text-secondary">{copy.description}</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="text-xs text-purple-400 font-medium">{copy.urgency}</div>
            <div className="text-xs text-text-muted">
              ✓ AI workout parsing ✓ Advanced analytics ✓ Streak protection
            </div>
          </div>

          <div className="flex gap-2">
            <PricingButton 
              plan="premium" 
              className="flex-1 py-2 px-3 text-sm font-semibold bg-navy text-white rounded-lg hover:bg-navy/80 transition-colors flex items-center justify-center gap-1"
            >
              {copy.cta} <ArrowRight className="w-3 h-3" />
            </PricingButton>
            <button 
              onClick={handleDismiss}
              className="px-3 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useUpgradePrompt() {
  const [activePrompt, setActivePrompt] = useState<{
    trigger: UpgradePromptProps['trigger'];
    featureName?: string;
  } | null>(null);

  const showUpgradePrompt = (trigger: UpgradePromptProps['trigger'], featureName?: string) => {
    setActivePrompt({ trigger, featureName });
  };

  const hideUpgradePrompt = () => {
    setActivePrompt(null);
  };

  return {
    activePrompt,
    showUpgradePrompt,
    hideUpgradePrompt,
    UpgradePromptComponent: activePrompt ? (
      <UpgradePrompt 
        trigger={activePrompt.trigger}
        featureName={activePrompt.featureName}
        onDismiss={hideUpgradePrompt}
      />
    ) : null,
  };
}

// Sticky banner for high-intent pages
export function UpgradeBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { tier } = useSubscriptionStatus();

  useEffect(() => {
    // Auto-dismiss after 30 seconds
    const timer = setTimeout(() => setDismissed(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  if (tier === 'premium' || dismissed) return null;

  return (
    <div className="sticky top-0 bg-gradient-to-r from-navy to-purple-600 text-white px-4 py-2 z-40">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4" />
          <span className="text-sm font-medium">
            Upgrade to Premium for unlimited AI parsing, advanced analytics, and streak protection
          </span>
        </div>
        <div className="flex items-center gap-3">
          <PricingButton 
            plan="premium" 
            className="px-4 py-1 text-sm bg-white text-navy rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Upgrade - $9.99/mo
          </PricingButton>
          <button onClick={() => setDismissed(true)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}