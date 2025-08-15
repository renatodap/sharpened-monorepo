'use client'

import { cn } from '@/lib/utils'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  className?: string
}

export function Alert({ 
  variant = 'info', 
  title, 
  children, 
  className 
}: AlertProps) {
  const variants = {
    info: {
      container: 'bg-info/10 border-info/20 text-info-foreground',
      icon: '💡',
      titleColor: 'text-info'
    },
    success: {
      container: 'bg-success/10 border-success/20 text-success-foreground',
      icon: '✅',
      titleColor: 'text-success'
    },
    warning: {
      container: 'bg-warning/10 border-warning/20 text-warning-foreground',
      icon: '⚠️',
      titleColor: 'text-warning'
    },
    error: {
      container: 'bg-error/10 border-error/20 text-error-foreground',
      icon: '❌',
      titleColor: 'text-error'
    }
  }

  const config = variants[variant]

  return (
    <div className={cn(
      'rounded-lg border p-4',
      config.container,
      className
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-lg" role="img" aria-hidden="true">
            {config.icon}
          </span>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn('text-sm font-medium mb-1', config.titleColor)}>
              {title}
            </h3>
          )}
          <div className="text-sm text-text-primary">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}