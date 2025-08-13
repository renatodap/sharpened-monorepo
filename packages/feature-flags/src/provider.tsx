// React context provider for feature flags
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { FeatureFlagManager } from './manager';
import type { UserContext, FeatureFlag } from './types';

interface FeatureFlagContextType {
  manager: FeatureFlagManager;
  isEnabled: (flagKey: string) => boolean;
  getAllFlags: () => FeatureFlag[];
  loading: boolean;
  error: string | null;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

interface FeatureFlagProviderProps {
  children: React.ReactNode;
  userContext: UserContext;
  databaseQueries?: any;
}

export function FeatureFlagProvider({ children, userContext, databaseQueries }: FeatureFlagProviderProps) {
  const [manager] = useState(() => new FeatureFlagManager(databaseQueries));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFlags = async () => {
      try {
        await manager.loadFlags();
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feature flags');
        setLoading(false);
      }
    };

    initializeFlags();
  }, [manager]);

  const isEnabled = (flagKey: string): boolean => {
    return manager.isEnabled(flagKey, userContext);
  };

  const getAllFlags = (): FeatureFlag[] => {
    return manager.getAllFlags();
  };

  const value: FeatureFlagContextType = {
    manager,
    isEnabled,
    getAllFlags,
    loading,
    error,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagContextType {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}