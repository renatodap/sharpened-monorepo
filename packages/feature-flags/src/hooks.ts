// React hooks for feature flags
'use client';

import { useFeatureFlags } from './provider';
import type { FlagEvaluation } from './types';

/**
 * Hook to check if a feature flag is enabled
 */
export function useFlag(flagKey: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flagKey);
}

/**
 * Hook to get detailed flag evaluation information
 */
export function useFlagEvaluation(flagKey: string): FlagEvaluation {
  const { manager } = useFeatureFlags();
  // You'd need to expose getUserContext from the provider for this to work fully
  // For now, returning a basic implementation
  return {
    flagKey,
    enabled: manager.isEnabled(flagKey, { userId: 'current-user' }),
    reason: 'enabled',
  };
}

/**
 * Hook to check multiple flags at once
 */
export function useFlags(flagKeys: string[]): Record<string, boolean> {
  const { isEnabled } = useFeatureFlags();
  
  return flagKeys.reduce((acc, flagKey) => {
    acc[flagKey] = isEnabled(flagKey);
    return acc;
  }, {} as Record<string, boolean>);
}

/**
 * Hook to get all available flags (useful for admin interfaces)
 */
export function useAllFlags() {
  const { getAllFlags } = useFeatureFlags();
  return getAllFlags();
}

/**
 * Conditional rendering hook for feature flags
 */
export function useFeatureGate(flagKey: string) {
  const enabled = useFlag(flagKey);
  
  return {
    enabled,
    Gate: ({ children }: { children: React.ReactNode }) => {
      return enabled ? <>{children}</> : null;
    },
  };
}