/**
 * SmartCoachWidget - AI coaching interface component
 * Maps to PRD: AI Coaching System (Technical Requirement #5)
 */

"use client";

import React, { useState } from 'react';
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  Target, 
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Trophy,
  Heart,
  Zap,
  Clock
} from 'lucide-react';
import { useSmartCoach, useProgressTracking } from '@/hooks/useSmartCoach';
import { Button } from '@/components/ui/Button';

interface SmartCoachWidgetProps {
  userId: string;
  className?: string;
  compact?: boolean;
}

export function SmartCoachWidget({ 
  userId, 
  className = '',
  compact = false 
}: SmartCoachWidgetProps) {
  const {
    context,
    coaching,
    isLoading,
    error,
    canUseCoaching,
    remainingUses,
    actions
  } = useSmartCoach({ userId, autoLoad: true });

  const {
    overallScore,
    scoreColor,
    progressEmoji
  } = useProgressTracking(userId);

  const [customQuery, setCustomQuery] = useState('');
  const [showFullCoaching, setShowFullCoaching] = useState(false);

  const handleQuickPrompt = async (topic: 'plateau' | 'recovery' | 'nutrition' | 'motivation' | 'progress') => {
    await actions.getQuickAdvice(topic);
    setShowFullCoaching(true);
  };

  const handleCustomQuery = async () => {
    if (customQuery.trim()) {
      await actions.getCoaching(customQuery);
      setCustomQuery('');
      setShowFullCoaching(true);
    }
  };

  if (compact) {
    return (
      <CompactCoachWidget
        userId={userId}
        className={className}
        onExpand={() => setShowFullCoaching(true)}
      />
    );
  }

  if (!canUseCoaching) {
    return (
      <div className={`bg-surface border border-border rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">AI Smart Coach</h3>
            <p className="text-xs text-text-secondary">Upgrade to Pro for personalized coaching</p>
          </div>
        </div>
        <Button className="w-full" variant="primary">
          Upgrade to Pro
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-surface border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">AI Smart Coach</h3>
              <p className="text-xs text-text-secondary">
                {remainingUses !== null ? `${remainingUses} sessions remaining` : 'Unlimited sessions'}
              </p>
            </div>
          </div>
          <button
            onClick={() => actions.refresh()}
            disabled={isLoading}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Progress Score */}
        {overallScore > 0 && (
          <div className="flex items-center gap-2 bg-surface-2 rounded-lg px-3 py-2">
            <span className="text-sm text-text-secondary">Overall Progress:</span>
            <span className={`font-bold ${scoreColor}`}>
              {overallScore}% {progressEmoji}
            </span>
          </div>
        )}
      </div>

      {/* Current Insights */}
      {context && !isLoading && (
        <div className="p-4 border-b border-border">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Current Insights
          </h4>
          
          {/* Streaks */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {context.currentStreaks.map((streak, index) => (
              <div key={index} className="bg-surface-2 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-text-secondary capitalize">{streak.type}</span>
                </div>
                <div className="text-lg font-bold">{streak.current_days} days</div>
              </div>
            ))}
          </div>

          {/* Patterns */}
          {context.patterns.length > 0 && (
            <div className="space-y-1">
              {context.patterns.slice(0, 2).map((pattern, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full mt-1 ${
                    pattern.type === 'positive' ? 'bg-green-400' :
                    pattern.type === 'negative' ? 'bg-red-400' :
                    'bg-yellow-400'
                  }`} />
                  <span className="text-text-secondary">{pattern.pattern}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coaching Message */}
      {coaching && showFullCoaching && (
        <div className="p-4 border-b border-border">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3">
            <p className="text-sm">{coaching.message}</p>
          </div>

          {/* Recommendations */}
          {coaching.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recommended Actions:</h4>
              {coaching.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <ChevronRight className="w-3 h-3 text-primary mt-0.5" />
                  <div>
                    <span className="font-medium">{rec.action}</span>
                    <span className="text-text-secondary ml-1">- {rec.expected_impact}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Motivational Quote */}
          {coaching.motivational_quote && (
            <div className="mt-3 p-2 bg-surface-2 rounded-lg text-center">
              <p className="text-xs italic text-text-secondary">
                "{coaching.motivational_quote}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Prompts */}
      <div className="p-4 space-y-3">
        <h4 className="text-sm font-medium">Quick Coaching:</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickPrompt('progress')}
            className="flex items-center gap-2 p-2 bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors text-xs"
          >
            <TrendingUp className="w-4 h-4 text-green-400" />
            Check Progress
          </button>
          <button
            onClick={() => handleQuickPrompt('plateau')}
            className="flex items-center gap-2 p-2 bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors text-xs"
          >
            <Target className="w-4 h-4 text-yellow-400" />
            Break Plateau
          </button>
          <button
            onClick={() => handleQuickPrompt('recovery')}
            className="flex items-center gap-2 p-2 bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors text-xs"
          >
            <Heart className="w-4 h-4 text-red-400" />
            Recovery Tips
          </button>
          <button
            onClick={() => handleQuickPrompt('nutrition')}
            className="flex items-center gap-2 p-2 bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors text-xs"
          >
            <Zap className="w-4 h-4 text-blue-400" />
            Nutrition Help
          </button>
        </div>

        {/* Custom Query */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomQuery()}
            placeholder="Ask your coach anything..."
            className="flex-1 px-3 py-2 bg-surface-2 border border-border rounded-lg text-sm placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            onClick={handleCustomQuery}
            disabled={!customQuery.trim() || isLoading}
            size="sm"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-4 text-center">
          <div className="animate-pulse flex items-center justify-center gap-2 text-sm text-text-secondary">
            <Brain className="w-4 h-4 animate-bounce" />
            Analyzing your data...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for dashboards
function CompactCoachWidget({ 
  userId, 
  className = '',
  onExpand 
}: { 
  userId: string;
  className?: string;
  onExpand: () => void;
}) {
  const { context, isLoading } = useSmartCoach({ userId, autoLoad: true });
  const { overallScore, progressEmoji } = useProgressTracking(userId);

  return (
    <button
      onClick={onExpand}
      className={`w-full bg-surface border border-border rounded-lg p-3 hover:bg-surface-2 transition-colors text-left ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="font-medium text-sm">AI Coach</div>
            {context && (
              <div className="text-xs text-text-secondary">
                Score: {overallScore}% {progressEmoji}
              </div>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-text-secondary" />
      </div>
      
      {isLoading && (
        <div className="mt-2 text-xs text-text-secondary animate-pulse">
          Loading insights...
        </div>
      )}
      
      {context && context.currentStreaks.length > 0 && (
        <div className="mt-2 flex gap-2">
          {context.currentStreaks.map((streak, index) => (
            <div key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-surface-2 rounded text-xs">
              <Trophy className="w-3 h-3 text-yellow-400" />
              {streak.current_days}d {streak.type}
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

// Inline coach prompt for specific pages
export function InlineCoachPrompt({ 
  userId,
  context,
  className = '' 
}: { 
  userId: string;
  context: 'workout' | 'nutrition' | 'weight';
  className?: string;
}) {
  const { actions, isLoading } = useSmartCoach({ userId });
  const [advice, setAdvice] = useState<string | null>(null);

  const prompts = {
    workout: 'How can I improve my workout today?',
    nutrition: 'What should I focus on for nutrition?',
    weight: 'Am I on track with my weight goals?'
  };

  const handleGetAdvice = async () => {
    const response = await actions.getCoaching(prompts[context]);
    if (response) {
      setAdvice(response.message);
    }
  };

  if (advice) {
    return (
      <div className={`bg-primary/5 border border-primary/20 rounded-lg p-3 ${className}`}>
        <div className="flex items-start gap-2">
          <Brain className="w-4 h-4 text-primary mt-0.5" />
          <div className="flex-1">
            <p className="text-sm">{advice}</p>
            <button
              onClick={() => setAdvice(null)}
              className="text-xs text-primary hover:underline mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleGetAdvice}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2 p-2 bg-surface-2 hover:bg-surface-3 rounded-lg transition-colors text-sm ${className}`}
    >
      <Brain className="w-4 h-4 text-primary" />
      {isLoading ? 'Getting advice...' : 'Get AI coaching advice'}
    </button>
  );
}