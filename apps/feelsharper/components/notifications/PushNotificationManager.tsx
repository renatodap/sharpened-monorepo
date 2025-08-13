"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PushNotificationContextType {
  permission: NotificationPermission;
  isSupported: boolean;
  subscription: PushSubscription | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  showNotification: (title: string, options?: NotificationOptions) => void;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

export function usePushNotifications() {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error('usePushNotifications must be used within a PushNotificationProvider');
  }
  return context;
}

interface PushNotificationProviderProps {
  children: React.ReactNode;
  vapidKey?: string;
}

export function PushNotificationProvider({ 
  children, 
  vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY 
}: PushNotificationProviderProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      loadExistingSubscription();
    }
  }, []);

  const loadExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      setSubscription(existingSubscription);
    } catch (error) {
      console.error('Failed to load existing push subscription:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted' || !vapidKey) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      setSubscription(pushSubscription);

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: pushSubscription.toJSON(),
        }),
      });

      return true;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Notify server
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  };

  const showNotification = (title: string, options: NotificationOptions = {}) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png.svg',
        badge: '/icons/badge-72x72.png.svg',
        ...options
      });
    }
  };

  const value = {
    permission,
    isSupported,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
    </PushNotificationContext.Provider>
  );
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Notification prompt component
interface NotificationPromptProps {
  onAccept?: () => void;
  onDecline?: () => void;
  className?: string;
}

export function NotificationPrompt({ onAccept, onDecline, className }: NotificationPromptProps) {
  const { permission, requestPermission, subscribe } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show prompt if permission is default and user hasn't dismissed it recently
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (permission === 'default' && !dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [permission]);

  const handleAccept = async () => {
    const granted = await requestPermission();
    if (granted) {
      await subscribe();
      onAccept?.();
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
    setIsVisible(false);
    onDecline?.();
  };

  if (!isVisible || permission !== 'default') return null;

  return (
    <div className={cn(
      "fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto",
      "bg-surface border border-border rounded-2xl shadow-xl p-4",
      "animate-in slide-in-from-bottom-4 duration-300",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text-primary text-sm">
            Stay on Track
          </h3>
          <p className="text-text-secondary text-xs mt-1 leading-relaxed">
            Get gentle reminders to log your meals and workouts so you never miss your goals.
          </p>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAccept}
              className="flex-1 bg-navy text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-navy-600 transition-colors"
            >
              <Check className="w-3 h-3 inline mr-1" />
              Allow
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 border border-border text-text-secondary py-2 px-3 rounded-lg text-xs font-medium hover:bg-surface-2 transition-colors"
            >
              <X className="w-3 h-3 inline mr-1" />
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings component for notification preferences
export function NotificationSettings() {
  const { permission, subscription, requestPermission, subscribe, unsubscribe } = usePushNotifications();
  const [preferences, setPreferences] = useState({
    workoutReminders: true,
    mealReminders: true,
    progressUpdates: true,
    weeklyReports: true,
  });

  const isEnabled = permission === 'granted' && subscription;

  const handleToggle = async () => {
    if (isEnabled) {
      await unsubscribe();
    } else {
      const granted = await requestPermission();
      if (granted) {
        await subscribe();
      }
    }
  };

  const updatePreference = async (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // Save to server
    if (isEnabled) {
      try {
        await fetch('/api/notifications/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [key]: value }),
        });
      } catch (error) {
        console.error('Failed to update notification preferences:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Push Notifications
        </h3>
        <p className="text-text-secondary text-sm">
          Get helpful reminders and updates to stay on track with your goals.
        </p>
      </div>

      {/* Main toggle */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Bell className="w-5 h-5 text-success" />
          ) : (
            <BellOff className="w-5 h-5 text-text-muted" />
          )}
          <div>
            <div className="font-medium text-text-primary">
              Push Notifications
            </div>
            <div className="text-text-muted text-sm">
              {isEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          className={cn(
            "relative w-12 h-6 rounded-full transition-colors",
            isEnabled ? "bg-success" : "bg-surface-2"
          )}
        >
          <div className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
            isEnabled ? "translate-x-7" : "translate-x-1"
          )} />
        </button>
      </div>

      {/* Notification preferences */}
      {isEnabled && (
        <div className="space-y-3">
          <h4 className="font-medium text-text-primary">Notification Types</h4>
          
          {Object.entries(preferences).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2">
              <span className="text-text-secondary capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <button
                onClick={() => updatePreference(key as keyof typeof preferences, !value)}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-colors",
                  value ? "bg-navy" : "bg-surface-2"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform",
                  value ? "translate-x-5" : "translate-x-0.5"
                )} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}