'use client'

import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  lines?: number
  className?: string
  width?: 'full' | 'medium' | 'short'
  height?: 'sm' | 'md' | 'lg'
}

export function LoadingSkeleton({ 
  lines = 3, 
  className,
  width = 'full',
  height = 'md'
}: LoadingSkeletonProps) {
  const widthClasses = {
    full: 'w-full',
    medium: 'w-3/4',
    short: 'w-1/2'
  }

  const heightClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6'
  }

  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={cn(
            'bg-surface-elevated rounded loading-shimmer',
            heightClasses[height],
            i === lines - 1 && lines > 1 ? widthClasses.medium : widthClasses[width],
            i < lines - 1 ? 'mb-3' : ''
          )}
        />
      ))}
    </div>
  )
}