"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/layout/BottomNav';
import { QuickActions, useQuickActionShortcuts } from './QuickActions';
import { SwipeIndicator, SwipeTutorial } from './SwipeIndicator';
import { useSwipeNavigation } from '@/lib/hooks/useSwipeNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
  showQuickActions?: boolean;
  showSwipeIndicators?: boolean;
  enableSwipeNavigation?: boolean;
  className?: string;
}

export function MobileLayout({
  children,
  showQuickActions = true,
  showSwipeIndicators = true,
  enableSwipeNavigation = true,
  className
}: MobileLayoutProps) {
  const pathname = usePathname();
  const { containerRef } = useSwipeNavigation({ enabled: enableSwipeNavigation });

  // Enable keyboard shortcuts
  useQuickActionShortcuts();

  // Don't show mobile features on auth pages
  const isAuthPage = pathname?.includes('/sign-in') || pathname?.includes('/sign-up');
  const isOnboardingPage = pathname?.includes('/onboarding');

  if (isAuthPage || isOnboardingPage) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={cn("min-h-screen bg-bg", className)}
    >
      {/* Swipe indicators */}
      {showSwipeIndicators && enableSwipeNavigation && (
        <SwipeIndicator showLabels={false} />
      )}

      {/* Main content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Quick actions FAB */}
      {showQuickActions && (
        <QuickActions className="lg:hidden" />
      )}

      {/* Bottom navigation */}
      <BottomNav />

      {/* Swipe tutorial for first-time users */}
      {enableSwipeNavigation && <SwipeTutorial />}
    </div>
  );
}

// Hook to detect mobile device
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
}

// Hook to detect if running as PWA
export function useIsPWA() {
  const [isPWA, setIsPWA] = React.useState(false);

  React.useEffect(() => {
    const checkPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSStandalone = isIOS && (window.navigator as any).standalone;
      
      setIsPWA(isStandalone || isIOSStandalone);
    };

    checkPWA();
    
    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkPWA);

    return () => mediaQuery.removeEventListener('change', checkPWA);
  }, []);

  return isPWA;
}

// Optimize touch interactions
export function useTouchOptimizations() {
  React.useEffect(() => {
    // Prevent pull-to-refresh on mobile
    let lastTouchY = 0;
    
    const preventPullToRefresh = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const touchYDelta = touchY - lastTouchY;
      lastTouchY = touchY;

      if (e.touches.length !== 1) return;

      const el = e.target as Element;
      const scrollableParent = el.closest('[data-scroll="true"]') || document.documentElement;
      
      if (scrollableParent.scrollTop === 0 && touchYDelta > 0) {
        e.preventDefault();
      }
    };

    // Improve scrolling performance
    const improveScrolling = () => {
      // Add smooth scrolling behavior
      document.documentElement.style.scrollBehavior = 'smooth';
      
      // Optimize touch action for better scrolling
      document.body.style.touchAction = 'pan-y';
    };

    // Add 300ms tap delay fix
    const fixTapDelay = () => {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
      
      const existingMeta = document.querySelector('meta[name="viewport"]');
      if (existingMeta) {
        existingMeta.setAttribute('content', meta.content);
      } else {
        document.head.appendChild(meta);
      }
    };

    // Apply optimizations
    improveScrolling();
    fixTapDelay();
    
    document.addEventListener('touchstart', preventPullToRefresh, { passive: false });
    document.addEventListener('touchmove', preventPullToRefresh, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventPullToRefresh);
      document.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);
}

// Component for enhanced mobile experience
export function MobileEnhancedApp({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const isPWA = useIsPWA();
  
  // Apply touch optimizations
  useTouchOptimizations();

  // Add PWA-specific styles
  React.useEffect(() => {
    if (isPWA) {
      document.documentElement.classList.add('pwa-mode');
      // Adjust safe areas for devices with notches
      document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
    } else {
      document.documentElement.classList.remove('pwa-mode');
    }
  }, [isPWA]);

  if (isMobile) {
    return (
      <MobileLayout
        showQuickActions={true}
        showSwipeIndicators={true}
        enableSwipeNavigation={true}
      >
        {children}
      </MobileLayout>
    );
  }

  // Desktop layout (simplified)
  return (
    <div className="min-h-screen bg-bg">
      <main className="pb-4">
        {children}
      </main>
    </div>
  );
}