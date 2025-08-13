import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Alert component for displaying important messages
 * Optimized for FeelSharper's dark theme with proper accessibility
 */
export function Alert({ 
  children, 
  variant = 'default',
  className,
  ...props 
}: AlertProps) {
  const variants = {
    default: {
      container: 'bg-surface-2 border-border text-text-primary',
      icon: Info
    },
    success: {
      container: 'bg-success/10 border-success/30 text-success',
      icon: CheckCircle
    },
    warning: {
      container: 'bg-warning/10 border-warning/30 text-warning',
      icon: AlertTriangle
    },
    error: {
      container: 'bg-error/10 border-error/30 text-error',
      icon: X
    },
    info: {
      container: 'bg-info/10 border-info/30 text-info',
      icon: Info
    }
  };

  const { container, icon: Icon } = variants[variant];

  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
        container,
        className
      )}
      role="alert"
      {...props}
    >
      <Icon className="h-4 w-4" />
      {children}
    </div>
  );
}

export function AlertTitle({ 
  children, 
  className,
  ...props 
}: AlertTitleProps) {
  return (
    <h5
      className={cn(
        'mb-1 font-medium leading-none tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h5>
  );
}

export function AlertDescription({ 
  children, 
  className,
  ...props 
}: AlertDescriptionProps) {
  return (
    <div
      className={cn(
        'text-sm [&_p]:leading-relaxed',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}