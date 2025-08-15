'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  label?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
  help?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  error,
  help,
  required = false,
  disabled = false,
  className
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find(option => option.value === value)

  const handleSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.value)
      setIsOpen(false)
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'input-base w-full text-left flex items-center justify-between',
            error && 'form-error',
            disabled && 'opacity-50 cursor-not-allowed',
            !selectedOption && 'text-text-muted'
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={cn(
              'w-4 h-4 text-text-muted transition-transform',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute z-20 w-full mt-1 bg-surface border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm transition-colors',
                    'hover:bg-surface-elevated focus:bg-surface-elevated',
                    'focus:outline-none',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    option.value === value && 'bg-navy/20 text-navy'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-error">
          {error}
        </p>
      )}
      
      {help && !error && (
        <p className="mt-1 text-sm text-text-muted">
          {help}
        </p>
      )}
    </div>
  )
}