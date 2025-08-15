/**
 * useSmartCoach - React hook for AI coaching integration
 * Maps to PRD: AI Coaching System (Technical Requirement #5)
 */

"use client";

import { useState, useCallback, useEffect } from 'react';
import { EnhancedSmartCoach, type UserContext, type CoachingResponse } from '@/lib/ai/coach/EnhancedSmartCoach';
import { useFeatureGate } from '@/hooks/useFeatureGate';

interface UseSmartCoachOptions {
  userId: string;
  autoLoad?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useSmartCoach(options: UseSmartCoachOptions) {
  const { userId, autoLoad = false, refreshInterval } = options;
  const [coach] = useState(() => new EnhancedSmartCoach());
  const [context, setContext] = useState<UserContext | null>(null);
  const [coaching, setCoaching] = useState<CoachingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | undefined>();

  const { canUse, trackUsage, getRemainingUses } = useFeatureGate();
  const canUseCoaching = canUse('ai_coaching');
  const remainingUses = getRemainingUses('ai_coaching');

  /**
   * Load user context
   */
  const loadContext = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const userContext = await coach.getUserContext(userId);
      setContext(userContext);
      
      return userContext;
    } catch (err) {
      console.error('[useSmartCoach] Failed to load context:', err);
      setError('Failed to load your fitness data');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, coach]);

  /**
   * Get coaching advice
   */
  const getCoaching = useCallback(async (
    query?: string,
    forceRefresh = false
  ): Promise<CoachingResponse | null> => {
    if (!canUseCoaching) {
      setError('Upgrade to Pro for AI coaching');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      setLastQuery(query);

      // Load context if needed or forced
      let userContext = context;
      if (!userContext || forceRefresh) {
        userContext = await loadContext();
        if (!userContext) return null;
      }

      // Track feature usage
      await trackUsage('ai_coaching');

      // Generate coaching response
      const response = await coach.generateCoaching(userContext, query);
      setCoaching(response);

      return response;
    } catch (err) {
      console.error('[useSmartCoach] Failed to get coaching:', err);
      setError('Failed to generate coaching advice');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [context, loadContext, canUseCoaching, trackUsage, coach]);

  /**
   * Quick coaching prompts
   */
  const getQuickAdvice = useCallback(async (
    topic: 'plateau' | 'recovery' | 'nutrition' | 'motivation' | 'progress'
  ): Promise<string | null> => {
    const queries = {
      plateau: 'How do I break through my current plateau?',
      recovery: 'What recovery strategies should I focus on?',
      nutrition: 'How can I optimize my nutrition for my goals?',
      motivation: 'I need motivation to keep going',
      progress: 'Am I making good progress toward my goals?'
    };

    const response = await getCoaching(queries[topic]);
    return response?.message || null;
  }, [getCoaching]);

  /**
   * Refresh coaching with same query
   */
  const refresh = useCallback(async () => {
    if (lastQuery !== undefined) {
      return getCoaching(lastQuery, true);
    }
    return getCoaching(undefined, true);
  }, [lastQuery, getCoaching]);

  /**
   * Auto-load on mount if enabled
   */
  useEffect(() => {
    if (autoLoad && userId) {
      loadContext();
    }
  }, [autoLoad, userId, loadContext]);

  /**
   * Set up refresh interval if specified
   */
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      loadContext();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, loadContext]);

  return {
    context,
    coaching,
    isLoading,
    error,
    canUseCoaching,
    remainingUses,
    actions: {
      loadContext,
      getCoaching,
      getQuickAdvice,
      refresh
    }
  };
}

/**
 * Hook for pattern detection
 */
export function usePatternDetection(userId: string) {
  const { context } = useSmartCoach({ userId, autoLoad: true });
  
  const patterns = context?.patterns || [];
  const positivePatterns = patterns.filter(p => p.type === 'positive');
  const negativePatterns = patterns.filter(p => p.type === 'negative');
  const hasPlateauPattern = patterns.some(p => 
    p.pattern.toLowerCase().includes('plateau')
  );
  
  return {
    patterns,
    positivePatterns,
    negativePatterns,
    hasPlateauPattern,
    patternCount: patterns.length
  };
}

/**
 * Hook for progress tracking
 */
export function useProgressTracking(userId: string) {
  const { coaching } = useSmartCoach({ userId, autoLoad: true });
  
  const progress = coaching?.progress_summary;
  const isImproving = progress?.strength_progress === 'improving';
  const consistencyScore = progress?.workout_consistency || 0;
  const overallScore = progress?.overall_score || 0;
  
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };
  
  const getProgressEmoji = (): string => {
    if (overallScore >= 80) return '🔥';
    if (overallScore >= 60) return '💪';
    if (overallScore >= 40) return '📈';
    return '🎯';
  };
  
  return {
    progress,
    isImproving,
    consistencyScore,
    overallScore,
    scoreColor: getScoreColor(overallScore),
    progressEmoji: getProgressEmoji()
  };
}