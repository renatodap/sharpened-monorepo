"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'list';
  lines?: number;
  animate?: boolean;
}

export function LoadingSkeleton({ 
  className, 
  variant = 'rectangular',
  lines = 1,
  animate = true 
}: LoadingSkeletonProps) {
  const baseClasses = cn(
    "bg-surface-2",
    animate && "animate-pulse",
    className
  );

  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              "h-4 rounded",
              i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div className={cn(baseClasses, "rounded-full aspect-square")} />
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn("bg-surface rounded-xl p-4 border border-border", className)}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <LoadingSkeleton variant="circular" className="w-10 h-10" animate={animate} />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton variant="text" lines={1} animate={animate} />
              <LoadingSkeleton variant="text" lines={1} className="w-2/3" animate={animate} />
            </div>
          </div>
          
          {/* Content */}
          <LoadingSkeleton variant="rectangular" className="h-32 rounded-lg" animate={animate} />
          
          {/* Footer */}
          <div className="flex gap-2">
            <LoadingSkeleton variant="rectangular" className="h-8 w-20 rounded-lg" animate={animate} />
            <LoadingSkeleton variant="rectangular" className="h-8 w-16 rounded-lg" animate={animate} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <LoadingSkeleton variant="circular" className="w-8 h-8" animate={animate} />
            <div className="flex-1 space-y-1">
              <LoadingSkeleton variant="text" lines={1} animate={animate} />
              <LoadingSkeleton variant="text" lines={1} className="w-3/4" animate={animate} />
            </div>
            <LoadingSkeleton variant="rectangular" className="w-12 h-6 rounded" animate={animate} />
          </div>
        ))}
      </div>
    );
  }

  // Default rectangular
  return <div className={cn(baseClasses, "rounded")} />;
}

// Specific skeleton components for common use cases
export function WorkoutCardSkeleton({ animate = true }: { animate?: boolean }) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <LoadingSkeleton variant="text" className="w-32 h-5" animate={animate} />
            <LoadingSkeleton variant="text" className="w-20 h-3" animate={animate} />
          </div>
          <LoadingSkeleton variant="circular" className="w-8 h-8" animate={animate} />
        </div>
        
        {/* Exercise list */}
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <LoadingSkeleton variant="text" className="w-24 h-4" animate={animate} />
              <LoadingSkeleton variant="text" className="w-16 h-4" animate={animate} />
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <LoadingSkeleton variant="text" className="w-20 h-4" animate={animate} />
          <LoadingSkeleton variant="rectangular" className="w-16 h-6 rounded" animate={animate} />
        </div>
      </div>
    </div>
  );
}

export function FoodCardSkeleton({ animate = true }: { animate?: boolean }) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <LoadingSkeleton variant="circular" className="w-12 h-12" animate={animate} />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" className="w-28 h-5" animate={animate} />
            <LoadingSkeleton variant="text" className="w-20 h-3" animate={animate} />
          </div>
          <LoadingSkeleton variant="text" className="w-16 h-6" animate={animate} />
        </div>
        
        {/* Nutrition info */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <LoadingSkeleton variant="text" className="w-8 h-6 mx-auto" animate={animate} />
              <LoadingSkeleton variant="text" className="w-12 h-3 mx-auto" animate={animate} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton({ animate = true }: { animate?: boolean }) {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <LoadingSkeleton variant="text" className="w-48 h-8" animate={animate} />
        <LoadingSkeleton variant="text" className="w-32 h-4" animate={animate} />
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-4 border border-border">
            <div className="space-y-2">
              <LoadingSkeleton variant="text" className="w-16 h-4" animate={animate} />
              <LoadingSkeleton variant="text" className="w-12 h-6" animate={animate} />
            </div>
          </div>
        ))}
      </div>
      
      {/* Recent activity */}
      <div className="space-y-4">
        <LoadingSkeleton variant="text" className="w-32 h-6" animate={animate} />
        <LoadingSkeleton variant="list" lines={3} animate={animate} />
      </div>
      
      {/* Cards */}
      <div className="space-y-4">
        <WorkoutCardSkeleton animate={animate} />
        <FoodCardSkeleton animate={animate} />
      </div>
    </div>
  );
}

// Shimmer effect for enhanced loading
export function ShimmerSkeleton({ 
  className,
  children
}: { 
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {children}
      <div 
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
        }}
      />
    </div>
  );
}