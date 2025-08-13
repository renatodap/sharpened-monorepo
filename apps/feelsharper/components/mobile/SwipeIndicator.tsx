"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeIndicators } from '@/lib/hooks/useSwipeNavigation';
import { cn } from '@/lib/utils';

interface SwipeIndicatorProps {
  className?: string;
  showLabels?: boolean;
}

export function SwipeIndicator({ className, showLabels = false }: SwipeIndicatorProps) {
  const { canSwipeLeft, canSwipeRight, leftRoute, rightRoute } = useSwipeIndicators();

  // Don't show if no swipe options available
  if (!canSwipeLeft && !canSwipeRight) return null;

  const getRouteLabel = (route: string | null) => {
    if (!route) return '';
    
    const labels: Record<string, string> = {
      '/dashboard': 'Home',
      '/coach': 'Coach', 
      '/log/workout': 'Log',
      '/calendar': 'Calendar',
      '/settings': 'Settings'
    };
    
    return labels[route] || route;
  };

  return (
    <div className={cn(
      "fixed top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none z-30",
      className
    )}>
      <div className="flex justify-between px-4">
        {/* Left Swipe Indicator */}
        <div className={cn(
          "flex items-center gap-2 transition-opacity duration-300",
          canSwipeRight ? "opacity-40" : "opacity-0"
        )}>
          <div className="bg-surface/80 backdrop-blur rounded-full p-2 shadow-lg border border-border">
            <ChevronRight className="w-4 h-4 text-text-secondary" />
          </div>
          {showLabels && rightRoute && (
            <div className="bg-surface/90 backdrop-blur rounded-lg px-3 py-1 shadow-lg border border-border">
              <span className="text-xs text-text-secondary">
                Swipe for {getRouteLabel(rightRoute)}
              </span>
            </div>
          )}
        </div>

        {/* Right Swipe Indicator */}
        <div className={cn(
          "flex items-center gap-2 transition-opacity duration-300",
          canSwipeLeft ? "opacity-40" : "opacity-0"
        )}>
          {showLabels && leftRoute && (
            <div className="bg-surface/90 backdrop-blur rounded-lg px-3 py-1 shadow-lg border border-border">
              <span className="text-xs text-text-secondary">
                Swipe for {getRouteLabel(leftRoute)}
              </span>
            </div>
          )}
          <div className="bg-surface/80 backdrop-blur rounded-full p-2 shadow-lg border border-border">
            <ChevronLeft className="w-4 h-4 text-text-secondary" />
          </div>
        </div>
      </div>

      {/* Center hint (shows on first visit) */}
      <div className="flex justify-center mt-4">
        <div className="bg-surface/90 backdrop-blur rounded-lg px-4 py-2 shadow-lg border border-border">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-navy rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-navy rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-navy rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-xs text-text-muted">
              Swipe to navigate between sections
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component that shows swipe tutorial on first visit
export function SwipeTutorial() {
  const [showTutorial, setShowTutorial] = React.useState(false);

  React.useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('swipe-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('swipe-tutorial-seen', 'true');
  };

  if (!showTutorial) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-sm w-full p-6 shadow-xl border border-border">
        <div className="text-center">
          <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="flex gap-1">
              <ChevronRight className="w-5 h-5 text-white" />
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Swipe to Navigate
          </h3>
          
          <p className="text-text-secondary text-sm mb-6">
            Swipe left or right to quickly move between sections. 
            Navigate faster than ever with touch gestures!
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <ChevronLeft className="w-4 h-4 text-navy" />
              <span className="text-text-secondary">Swipe left to go forward</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ChevronRight className="w-4 h-4 text-navy" />
              <span className="text-text-secondary">Swipe right to go back</span>
            </div>
          </div>

          <button
            onClick={dismissTutorial}
            className="w-full mt-6 bg-navy text-white py-3 rounded-xl font-medium hover:bg-navy-600 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}