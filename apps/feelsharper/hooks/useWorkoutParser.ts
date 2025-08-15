/**
 * useWorkoutParser - React hook for natural language workout parsing
 * Maps to PRD: Voice Input + AI Coaching
 */

import { useState } from 'react';
import type { ParsedWorkout } from '@/lib/ai/types';

interface ParseResult {
  workout: ParsedWorkout;
  confidence: number;
  tokens_used: number;
  cost_cents: number;
  processing_time_ms: number;
}

interface ParseError {
  error: string;
  upgrade_required?: boolean;
}

export function useWorkoutParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseWorkout = async (input: string, save = true): Promise<ParseResult | null> => {
    if (!input.trim()) {
      setError('Please enter a workout description');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/parse-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: input.trim(), save }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ParseError;
        
        if (response.status === 429 && errorData.upgrade_required) {
          setError('You\'ve reached your monthly limit. Upgrade to Pro for unlimited parsing!');
        } else if (response.status === 401) {
          setError('Please sign in to use AI parsing');
        } else {
          setError(errorData.error || 'Failed to parse workout');
        }
        return null;
      }

      const result: ParseResult = {
        workout: data.workout,
        confidence: data.confidence,
        tokens_used: data.tokens_used,
        cost_cents: data.cost_cents,
        processing_time_ms: data.processing_time_ms,
      };

      setLastResult(result);
      return result;
    } catch (err) {
      console.error('Workout parsing error:', err);
      setError('Network error. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Parse common workout formats
  const parseExamples = {
    strength: "Bench press 3x8 @135lbs, squats 5x5 @225lbs, rows 3x10 @95lbs",
    cardio: "5 mile run in 42:30 minutes",
    hiit: "AMRAP 20 minutes: 5 pullups, 10 pushups, 15 squats",
    circuit: "3 rounds of: burpees x10, mountain climbers x20, plank 60 seconds, rest 2 minutes",
    mixed: "Deadlifts 5x3 @315lbs, then 10 minute bike cooldown"
  };

  return {
    parseWorkout,
    isLoading,
    error,
    clearError,
    lastResult,
    parseExamples,
    
    // Helper methods
    isHighConfidence: (confidence: number) => confidence >= 0.8,
    isLowConfidence: (confidence: number) => confidence < 0.6,
    formatConfidence: (confidence: number) => `${Math.round(confidence * 100)}%`,
    
    // Cost calculation helpers
    estimatedCost: (inputLength: number) => {
      // Rough estimate: ~4 chars per token, GPT-4o-mini cost
      const estimatedTokens = Math.ceil(inputLength / 4) * 2; // 2x for response
      return estimatedTokens * 0.00015;
    }
  };
}

// Export types for convenience
export type { ParseResult, ParseError };