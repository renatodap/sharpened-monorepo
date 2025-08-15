/**
 * UpgradePrompt - Freemium upgrade prompts and paywalls
 * Maps to PRD: Business Model - Freemium
 */

"use client";

import React from 'react';
import { X, Star, Zap, Crown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import type { FeatureKey } from '@/lib/freemium/FeatureGate';

interface UpgradePromptProps {
  feature: FeatureKey;
  onClose?: () => void;
  className?: string;
}

export function UpgradePrompt({ feature, onClose, className }: UpgradePromptProps) {
  const { tierRequired, upgradeUrl } = useFeatureGate(feature);

  const tierInfo = {
    pro: {
      name: 'Pro',
      price: '$9.99/mo',
      icon: <Star className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    elite: {
      name: 'Elite',
      price: '$24.99/mo',
      icon: <Crown className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  };

  const tier = tierInfo[tierRequired as keyof typeof tierInfo] || tierInfo.pro;

  const featureMessages: Record<FeatureKey, { title: string; description: string; benefits: string[] }> = {
    workout_parsing: {
      title: 'Unlimited AI Workout Parsing',
      description: 'Parse unlimited workouts with natural language',
      benefits: ['Voice input support', 'Smart exercise recognition', 'Automatic set/rep detection']
    },
    food_parsing: {
      title: 'Unlimited AI Food Logging',
      description: 'Log meals instantly with AI-powered parsing',
      benefits: ['Photo food recognition', 'Smart portion estimation', 'Nutrition auto-calculation']
    },
    voice_input: {
      title: 'Voice Input Everywhere',
      description: 'Use voice to log workouts, meals, and notes',
      benefits: ['Hands-free logging', 'Accurate transcription', 'Multi-language support']
    },
    ai_coaching: {
      title: 'Unlimited AI Coaching',
      description: 'Get personalized fitness advice anytime',
      benefits: ['Smart recommendations', 'Progress analysis', 'Goal optimization']
    },
    photo_analysis: {
      title: 'Photo Food Analysis',
      description: 'Analyze food photos for instant nutrition tracking',
      benefits: ['Instant food recognition', 'Portion size estimation', 'Nutrition breakdown']
    },
    wearables_sync: {
      title: 'Wearable Device Sync',
      description: 'Connect your fitness devices for complete tracking',
      benefits: ['Apple Watch sync', 'Garmin integration', 'Heart rate tracking']
    },
    export_data: {
      title: 'Data Export',
      description: 'Export your fitness data in multiple formats',
      benefits: ['CSV/PDF export', 'Custom date ranges', 'Complete data ownership']
    },
    coach_dashboard: {
      title: 'Coach Dashboard',
      description: 'Professional tools for trainers and coaches',
      benefits: ['Client management', 'Progress tracking', 'Custom programs']
    },
    history_days: {
      title: 'Unlimited History',
      description: 'Access your complete fitness journey',
      benefits: ['All-time data access', 'Long-term trends', 'Progress visualization']
    },
    workout_templates: {
      title: 'More Workout Templates',
      description: 'Access our complete template library',
      benefits: ['50+ workout templates', 'Custom templates', 'Program builder']
    }
  };

  const info = featureMessages[feature];

  return (
    <div className={`bg-surface border ${tier.borderColor} rounded-xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 ${tier.bgColor} rounded-lg`}>
          <div className={tier.color}>
            {tier.icon}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary mb-1">
            {info.title}
          </h3>
          <p className="text-text-secondary text-sm">
            {info.description}
          </p>
        </div>

        <div className="space-y-2">
          {info.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Zap className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-text-secondary">{benefit}</span>
            </div>
          ))}
        </div>

        <div className={`p-3 ${tier.bgColor} rounded-lg border ${tier.borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`font-semibold ${tier.color}`}>
                {tier.name} Plan
              </div>
              <div className="text-xs text-text-secondary">
                Starting at {tier.price}
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${tier.color}`} />
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => window.open(upgradeUrl, '_blank')}
            className="w-full bg-primary hover:bg-primary/80 text-white font-semibold"
          >
            Upgrade to {tier.name}
          </Button>
          
          <button className="w-full text-sm text-text-secondary hover:text-text-primary transition-colors">
            Learn more about plans
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline upgrade prompt for feature gates
export function InlineUpgradePrompt({ feature, className }: { feature: FeatureKey; className?: string }) {
  const { usageLimit, tierRequired } = useFeatureGate(feature);
  
  if (!usageLimit) return null;
  
  const usagePercent = (usageLimit.current_usage / (usageLimit.monthly_limit || 1)) * 100;
  const tier = tierRequired === 'elite' ? 'Elite' : 'Pro';
  
  return (
    <div className={`p-3 bg-warning/10 border border-warning/20 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-warning">
          {usageLimit.current_usage} / {usageLimit.monthly_limit} uses this month
        </span>
        <span className="text-xs text-warning">
          {Math.round(usagePercent)}%
        </span>
      </div>
      
      <div className="w-full bg-warning/20 rounded-full h-1.5 mb-3">
        <div 
          className="bg-warning h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, usagePercent)}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary">
          Upgrade to {tier} for unlimited access
        </span>
        <Button
          size="sm"
          variant="outline"
          className="text-xs px-2 py-1 h-6"
          onClick={() => window.open(`/upgrade?plan=${tierRequired}`, '_blank')}
        >
          Upgrade
        </Button>
      </div>
    </div>
  );
}