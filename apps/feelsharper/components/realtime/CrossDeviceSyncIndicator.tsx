/**
 * CrossDeviceSyncIndicator - Shows real-time sync status across devices
 * Maps to PRD: Real-time Features (Technical Requirement #3)
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Wifi, WifiOff, RefreshCw, Users, Clock } from 'lucide-react';
import { realtimeManager, type UserPresence } from '@/lib/realtime/RealtimeManager';

interface CrossDeviceSyncIndicatorProps {
  userId: string;
  className?: string;
  showDetails?: boolean;
}

export function CrossDeviceSyncIndicator({
  userId,
  className = '',
  showDetails = false
}: CrossDeviceSyncIndicatorProps) {
  const [presence, setPresence] = useState<UserPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('offline');

  useEffect(() => {
    // Initialize if not already done
    const initializeAndSubscribe = async () => {
      try {
        await realtimeManager.initialize(userId);
        setIsConnected(true);
        setSyncStatus('synced');
        setLastSync(new Date());

        // Subscribe to presence updates
        realtimeManager.onPresence((presenceList) => {
          setPresence(presenceList);
          setLastSync(new Date());
        });

        // Subscribe to sync events
        realtimeManager.on('sync_required', () => {
          setSyncStatus('syncing');
          setTimeout(() => setSyncStatus('synced'), 1000);
        });

      } catch (error) {
        console.error('[CrossDeviceSyncIndicator] Failed to initialize:', error);
        setIsConnected(false);
        setSyncStatus('offline');
      }
    };

    initializeAndSubscribe();
  }, [userId]);

  // Get device icon
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-3 h-3" />;
      case 'tablet': return <Tablet className="w-3 h-3" />;
      case 'desktop': return <Monitor className="w-3 h-3" />;
      default: return <Monitor className="w-3 h-3" />;
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (syncStatus) {
      case 'synced': return 'text-green-400';
      case 'syncing': return 'text-blue-400';
      case 'offline': return 'text-gray-400';
    }
  };

  // Current user's devices
  const userDevices = presence.filter(p => p.userId === userId);
  const otherUsers = presence.filter(p => p.userId !== userId);

  if (!showDetails) {
    // Compact indicator
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        {isConnected ? (
          <>
            <Wifi className={`w-3 h-3 ${getStatusColor()}`} />
            {userDevices.length > 1 && (
              <span className="text-green-400">{userDevices.length} devices</span>
            )}
            {syncStatus === 'syncing' && (
              <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
            )}
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400">Offline</span>
          </>
        )}
      </div>
    );
  }

  // Detailed indicator
  return (
    <div className={`bg-surface border border-border rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm">Sync Status</h4>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className={`w-4 h-4 ${getStatusColor()}`} />
          ) : (
            <WifiOff className="w-4 h-4 text-gray-400" />
          )}
          <span className={`text-xs ${getStatusColor()}`}>
            {syncStatus === 'synced' && 'Synced'}
            {syncStatus === 'syncing' && 'Syncing...'}
            {syncStatus === 'offline' && 'Offline'}
          </span>
        </div>
      </div>

      {/* Your devices */}
      {userDevices.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-text-secondary mb-2">Your Devices</div>
          <div className="space-y-1">
            {userDevices.map((device, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {getDeviceIcon(device.deviceInfo.type)}
                <span className="flex-1 capitalize">{device.deviceInfo.type}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    device.status === 'online' ? 'bg-green-400' :
                    device.status === 'working_out' ? 'bg-blue-400' :
                    'bg-gray-400'
                  }`} />
                  <span className="text-text-secondary capitalize">{device.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other users (if any) */}
      {otherUsers.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-text-secondary mb-2 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Other Active Users
          </div>
          <div className="text-xs text-blue-400">
            {otherUsers.length} {otherUsers.length === 1 ? 'person' : 'people'} online
          </div>
        </div>
      )}

      {/* Last sync time */}
      {lastSync && (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Clock className="w-3 h-3" />
          <span>
            Last sync: {lastSync.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      )}

      {/* Sync animation */}
      {syncStatus === 'syncing' && (
        <div className="mt-2 flex items-center gap-2 text-xs text-blue-400">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Synchronizing data across devices...</span>
        </div>
      )}

      {/* Offline state */}
      {!isConnected && (
        <div className="mt-2 text-xs text-gray-400">
          Data will sync when connection is restored
        </div>
      )}
    </div>
  );
}

// Simple sync status badge for forms
export function SyncStatusBadge({ 
  userId, 
  className = '' 
}: { 
  userId: string; 
  className?: string; 
}) {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('offline');

  useEffect(() => {
    const updateStatus = () => {
      // Check if connected
      if (navigator.onLine) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('offline');
      }
    };

    updateStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const getStatusConfig = () => {
    switch (syncStatus) {
      case 'synced':
        return {
          icon: <Wifi className="w-3 h-3" />,
          text: 'Synced',
          color: 'text-green-400 bg-green-400/10'
        };
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3 h-3 animate-spin" />,
          text: 'Syncing',
          color: 'text-blue-400 bg-blue-400/10'
        };
      case 'offline':
        return {
          icon: <WifiOff className="w-3 h-3" />,
          text: 'Offline',
          color: 'text-gray-400 bg-gray-400/10'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${config.color} ${className}`}>
      {config.icon}
      <span className="text-xs font-medium">{config.text}</span>
    </div>
  );
}