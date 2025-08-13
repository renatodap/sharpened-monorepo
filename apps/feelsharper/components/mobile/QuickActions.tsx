"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Dumbbell, Utensils, Camera, Mic, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'workout',
      name: 'Log Workout',
      description: 'Track your training',
      href: '/log/workout',
      icon: Dumbbell,
      color: 'bg-blue-500 hover:bg-blue-600',
      shortcut: 'W'
    },
    {
      id: 'meal',
      name: 'Log Meal',
      description: 'Track your nutrition',
      href: '/log/meal',
      icon: Utensils,
      color: 'bg-green-500 hover:bg-green-600',
      shortcut: 'M'
    },
    {
      id: 'photo',
      name: 'Photo Log',
      description: 'Quick photo capture',
      href: '/log/meal?mode=camera',
      icon: Camera,
      color: 'bg-purple-500 hover:bg-purple-600',
      shortcut: 'P'
    },
    {
      id: 'voice',
      name: 'Voice Log',
      description: 'Speak your entry',
      href: '/log/workout?mode=voice',
      icon: Mic,
      color: 'bg-orange-500 hover:bg-orange-600',
      shortcut: 'V'
    }
  ];

  const toggleActions = () => {
    setIsOpen(!isOpen);
  };

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Quick Actions Container */}
      <div className={cn("fixed bottom-20 right-4 z-50", className)}>
        {/* Action Items */}
        <div className={cn(
          "flex flex-col gap-3 mb-4 transition-all duration-300",
          isOpen 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          {actions.map((action, index) => (
            <Link
              key={action.id}
              href={action.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl shadow-lg backdrop-blur",
                "min-w-[200px] min-h-[56px]", // Minimum touch target
                "bg-surface/90 border border-border",
                "hover:scale-105 active:scale-95 transition-all duration-200",
                "group"
              )}
              style={{
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
              }}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors",
                action.color
              )}>
                <action.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-text-primary text-sm">
                  {action.name}
                </div>
                <div className="text-text-muted text-xs">
                  {action.description}
                </div>
              </div>

              <div className="flex items-center gap-2 text-text-muted">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-surface-2 rounded border border-border">
                  {action.shortcut}
                </kbd>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Main FAB Button */}
        <button
          onClick={toggleActions}
          className={cn(
            "w-14 h-14 rounded-full shadow-lg backdrop-blur",
            "bg-navy hover:bg-navy-600 text-white",
            "flex items-center justify-center",
            "transition-all duration-300",
            "hover:scale-110 active:scale-95",
            "border-2 border-navy-400",
            isOpen && "rotate-45"
          )}
          aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-surface/90 backdrop-blur rounded-lg p-3 shadow-lg border border-border">
            <div className="text-xs text-text-muted mb-1">Quick shortcuts:</div>
            <div className="flex gap-2 text-xs">
              {actions.map(action => (
                <kbd 
                  key={action.id}
                  className="px-1.5 py-0.5 bg-surface-2 rounded border border-border font-mono"
                >
                  {action.shortcut}
                </kbd>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook for keyboard shortcuts
export function useQuickActionShortcuts() {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no input is focused
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'w':
          window.location.href = '/log/workout';
          break;
        case 'm':
          window.location.href = '/log/meal';
          break;
        case 'p':
          window.location.href = '/log/meal?mode=camera';
          break;
        case 'v':
          window.location.href = '/log/workout?mode=voice';
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
}