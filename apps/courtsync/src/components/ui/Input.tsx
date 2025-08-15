'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  helperText?: string
  help?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onChange?: (value: string) => void
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    helperText,
    help,
    leftIcon,
    rightIcon,
    onChange,
    required,
    ...props 
  }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-text-muted">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              'input-base',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'form-error',
              className
            )}
            ref={ref}
            onChange={onChange ? (e) => onChange(e.target.value) : undefined}
            required={required}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="text-text-muted">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-error">
            {error}
          </p>
        )}
        
        {(helperText || help) && !error && (
          <p className="mt-1 text-sm text-text-muted">
            {helperText || help}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }