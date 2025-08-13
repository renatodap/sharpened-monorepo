"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SwipeNavigationOptions {
  enabled?: boolean;
  threshold?: number;
  velocity?: number;
  routes?: string[];
}

const defaultRoutes = [
  '/dashboard',
  '/coach', 
  '/log/workout',
  '/calendar',
  '/settings'
];

export function useSwipeNavigation(options: SwipeNavigationOptions = {}) {
  const {
    enabled = true,
    threshold = 100,
    velocity = 0.3,
    routes = defaultRoutes
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const currentIndex = routes.findIndex(route => pathname?.startsWith(route));
    if (currentIndex === -1) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      // Calculate velocity
      const velocityX = Math.abs(deltaX) / deltaTime;
      
      // Check if it's a horizontal swipe (not vertical scroll)
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        touchStartRef.current = null;
        return;
      }

      // Check if swipe meets threshold and velocity requirements
      if (Math.abs(deltaX) < threshold || velocityX < velocity) {
        touchStartRef.current = null;
        return;
      }

      // Determine navigation direction
      let targetIndex = currentIndex;
      
      if (deltaX > 0) {
        // Swipe right - go to previous route
        targetIndex = Math.max(0, currentIndex - 1);
      } else {
        // Swipe left - go to next route
        targetIndex = Math.min(routes.length - 1, currentIndex + 1);
      }

      // Navigate if index changed
      if (targetIndex !== currentIndex) {
        // Add haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        router.push(routes[targetIndex]);
      }

      touchStartRef.current = null;
    };

    const handleTouchCancel = () => {
      touchStartRef.current = null;
    };

    // Get container element (body by default)
    const container = containerRef.current || document.body;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [enabled, threshold, velocity, routes, pathname, router]);

  return {
    containerRef,
    currentRoute: pathname,
    availableRoutes: routes
  };
}

// Hook for swipe indicators
export function useSwipeIndicators() {
  const pathname = usePathname();
  
  const getSwipeHints = () => {
    const routes = defaultRoutes;
    const currentIndex = routes.findIndex(route => pathname?.startsWith(route));
    
    if (currentIndex === -1) return { canSwipeLeft: false, canSwipeRight: false };
    
    return {
      canSwipeLeft: currentIndex < routes.length - 1,
      canSwipeRight: currentIndex > 0,
      leftRoute: currentIndex < routes.length - 1 ? routes[currentIndex + 1] : null,
      rightRoute: currentIndex > 0 ? routes[currentIndex - 1] : null
    };
  };

  return getSwipeHints();
}