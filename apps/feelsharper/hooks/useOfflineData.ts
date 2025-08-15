/**
 * useOfflineData - React hook for offline data management
 * Maps to PRD: Offline-First Architecture
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineDataManager } from '@/lib/offline/OfflineDataManager';
import { useAuth } from '@/components/auth/AuthProvider';
import { usePWA } from '@/components/pwa/PWAProvider';

interface SyncStatus {
  pendingWorkouts: number;
  pendingMeals: number;
  pendingWeights: number;
  queueSize: number;
  lastSyncTime?: Date;
  isSyncing: boolean;
}

export function useOfflineData() {
  const { user } = useAuth();
  const { isOnline } = usePWA();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pendingWorkouts: 0,
    pendingMeals: 0,
    pendingWeights: 0,
    queueSize: 0,
    isSyncing: false,
  });

  // Update sync status
  const updateSyncStatus = useCallback(async () => {
    try {
      const status = await offlineDataManager.getSyncStatus();
      setSyncStatus((prev) => ({
        ...status,
        lastSyncTime: prev.lastSyncTime,
        isSyncing: prev.isSyncing,
      }));
    } catch (error) {
      console.error('[useOfflineData] Failed to get sync status:', error);
    }
  }, []);

  // Save workout with offline support
  const saveWorkout = useCallback(async (workout: any) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Save to IndexedDB first
      await offlineDataManager.saveWorkout(workout, user.id);
      
      // Update sync status
      await updateSyncStatus();
      
      // If online, will be synced automatically
      if (isOnline) {
        setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
        setTimeout(() => {
          setSyncStatus((prev) => ({ 
            ...prev, 
            isSyncing: false,
            lastSyncTime: new Date(),
          }));
          updateSyncStatus();
        }, 2000);
      }
      
      return { success: true, offline: !isOnline };
    } catch (error) {
      console.error('[useOfflineData] Failed to save workout:', error);
      throw error;
    }
  }, [user, isOnline, updateSyncStatus]);

  // Save meal with offline support
  const saveMeal = useCallback(async (meal: any) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await offlineDataManager.saveMeal(meal, user.id);
      await updateSyncStatus();
      
      if (isOnline) {
        setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
        setTimeout(() => {
          setSyncStatus((prev) => ({ 
            ...prev, 
            isSyncing: false,
            lastSyncTime: new Date(),
          }));
          updateSyncStatus();
        }, 2000);
      }
      
      return { success: true, offline: !isOnline };
    } catch (error) {
      console.error('[useOfflineData] Failed to save meal:', error);
      throw error;
    }
  }, [user, isOnline, updateSyncStatus]);

  // Save body weight with offline support
  const saveBodyWeight = useCallback(async (weight: number, unit: 'kg' | 'lbs' = 'kg') => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await offlineDataManager.saveBodyWeight(weight, unit, user.id);
      await updateSyncStatus();
      
      if (isOnline) {
        setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
        setTimeout(() => {
          setSyncStatus((prev) => ({ 
            ...prev, 
            isSyncing: false,
            lastSyncTime: new Date(),
          }));
          updateSyncStatus();
        }, 2000);
      }
      
      return { success: true, offline: !isOnline };
    } catch (error) {
      console.error('[useOfflineData] Failed to save body weight:', error);
      throw error;
    }
  }, [user, isOnline, updateSyncStatus]);

  // Get recent workouts from cache
  const getRecentWorkouts = useCallback(async (limit = 10) => {
    if (!user) return [];
    
    try {
      return await offlineDataManager.getRecentWorkouts(user.id, limit);
    } catch (error) {
      console.error('[useOfflineData] Failed to get recent workouts:', error);
      return [];
    }
  }, [user]);

  // Get recent meals from cache
  const getRecentMeals = useCallback(async (limit = 10) => {
    if (!user) return [];
    
    try {
      return await offlineDataManager.getRecentMeals(user.id, limit);
    } catch (error) {
      console.error('[useOfflineData] Failed to get recent meals:', error);
      return [];
    }
  }, [user]);

  // Clear all offline data
  const clearOfflineData = useCallback(async () => {
    try {
      await offlineDataManager.clearAllData();
      await updateSyncStatus();
    } catch (error) {
      console.error('[useOfflineData] Failed to clear offline data:', error);
      throw error;
    }
  }, [updateSyncStatus]);

  // Update sync status on mount and when online status changes
  useEffect(() => {
    updateSyncStatus();
    
    // Update every 30 seconds if online
    const interval = setInterval(() => {
      if (isOnline) {
        updateSyncStatus();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isOnline, updateSyncStatus]);

  return {
    // State
    syncStatus,
    isOnline,
    hasPendingData: syncStatus.queueSize > 0,
    
    // Actions
    saveWorkout,
    saveMeal,
    saveBodyWeight,
    getRecentWorkouts,
    getRecentMeals,
    clearOfflineData,
    updateSyncStatus,
  };
}

// Export types
export type { SyncStatus };