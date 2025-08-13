import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Badge component for categories, tags, and status indicators
 * Provides consistent styling for small informational elements
 */
export function Badge({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-surface-2 text-text-primary border-border',
    secondary: 'bg-navy text-text-primary border-navy-400',
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    error: 'bg-error/20 text-error border-error/30',
    outline: 'bg-transparent text-text-secondary border-border hover:bg-surface-2'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-md transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
