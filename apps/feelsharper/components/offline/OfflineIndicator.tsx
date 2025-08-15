/**
 * OfflineIndicator - Shows offline status and sync progress
 * Maps to PRD: Offline-First Architecture
 */

"use client";

import React from 'react';
import { useOfflineData } from '@/hooks/useOfflineData';
import { usePWA } from '@/components/pwa/PWAProvider';
import { WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const { syncStatus, hasPendingData } = useOfflineData();
  
  // Don't show if online and no pending data
  if (isOnline && !hasPendingData && !syncStatus.isSyncing) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="bg-surface border border-border rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 mb-2">
          <WifiOff className="w-5 h-5 text-warning" />
          <div>
            <p className="text-sm font-medium text-text-primary">You're offline</p>
            <p className="text-xs text-text-secondary">Data will sync when connection returns</p>
          </div>
        </div>
      )}

      {/* Sync status */}
      {isOnline && syncStatus.isSyncing && (
        <div className="bg-surface border border-border rounded-lg px-4 py-3 shadow-lg flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-primary animate-spin" />
          <div>
            <p className="text-sm font-medium text-text-primary">Syncing...</p>
            <p className="text-xs text-text-secondary">Uploading your data</p>
          </div>
        </div>
      )}

      {/* Pending data indicator */}
      {hasPendingData && !syncStatus.isSyncing && (
        <div className="bg-surface border border-border rounded-lg px-4 py-3 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            <p className="text-sm font-medium text-text-primary">Pending uploads</p>
          </div>
          <div className="space-y-1 text-xs text-text-secondary">
            {syncStatus.pendingWorkouts > 0 && (
              <p>{syncStatus.pendingWorkouts} workout{syncStatus.pendingWorkouts !== 1 ? 's' : ''}</p>
            )}
            {syncStatus.pendingMeals > 0 && (
              <p>{syncStatus.pendingMeals} meal{syncStatus.pendingMeals !== 1 ? 's' : ''}</p>
            )}
            {syncStatus.pendingWeights > 0 && (
              <p>{syncStatus.pendingWeights} weight log{syncStatus.pendingWeights !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      )}

      {/* Success message after sync */}
      {isOnline && !hasPendingData && syncStatus.lastSyncTime && (
        Date.now() - syncStatus.lastSyncTime.getTime() < 5000
      ) && (
        <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-3 shadow-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm font-medium text-success">All synced!</p>
            <p className="text-xs text-success/80">Your data is up to date</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for navbar
export function OfflineIndicatorCompact() {
  const { isOnline } = usePWA();
  const { hasPendingData, syncStatus } = useOfflineData();
  
  if (isOnline && !hasPendingData && !syncStatus.isSyncing) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {!isOnline && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-warning/10 rounded-md">
          <WifiOff className="w-3.5 h-3.5 text-warning" />
          <span className="text-xs text-warning font-medium">Offline</span>
        </div>
      )}
      
      {syncStatus.isSyncing && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-md">
          <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
          <span className="text-xs text-primary font-medium">Syncing</span>
        </div>
      )}
      
      {hasPendingData && !syncStatus.isSyncing && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-warning/10 rounded-md">
          <AlertCircle className="w-3.5 h-3.5 text-warning" />
          <span className="text-xs text-warning font-medium">
            {syncStatus.queueSize} pending
          </span>
        </div>
      )}
    </div>
  );
}