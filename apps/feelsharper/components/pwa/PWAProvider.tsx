"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface PWAContextType {
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  installPWA: () => void;
  dismissInstallPrompt: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('[PWA] Service worker registered:', registration);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available, show update prompt
                  console.log('[PWA] New content available');
                }
              });
            }
          });
        } catch (error) {
          console.error('[PWA] Service worker registration failed:', error);
        }
      });
    }

    // Check if already installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSInstalled = isIOS && (window.navigator as any).standalone;
      
      setIsInstalled(isStandalone || isIOSInstalled);
    };

    checkInstallStatus();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Show our custom install prompt after a delay
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setShowInstallPrompt(true);
        }
      }, 5000);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      console.log('[PWA] App was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      console.log('[PWA] Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallPrompt(false);
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    
    // Show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  const value = {
    isInstalled,
    isInstallable,
    isOnline,
    installPWA,
    dismissInstallPrompt,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
      {showInstallPrompt && !isInstalled && (
        <PWAInstallPrompt
          onInstall={installPWA}
          onDismiss={dismissInstallPrompt}
        />
      )}
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-warning text-black text-center py-2 text-sm font-medium z-50">
          You're offline. Some features may be limited.
        </div>
      )}
    </PWAContext.Provider>
  );
}