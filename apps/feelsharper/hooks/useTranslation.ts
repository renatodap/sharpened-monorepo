'use client';

import { useTranslations } from 'next-intl';

export function useTranslation(namespace?: string) {
  const t = useTranslations(namespace);
  
  return {
    t,
    // Helper functions for common patterns
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(typeof window !== 'undefined' ? navigator.language : 'en-US', options).format(value);
    },
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => {
      return new Intl.DateTimeFormat(typeof window !== 'undefined' ? navigator.language : 'en-US', options).format(date);
    },
    formatCurrency: (value: number, currency = 'USD') => {
      return new Intl.NumberFormat(typeof window !== 'undefined' ? navigator.language : 'en-US', {
        style: 'currency',
        currency
      }).format(value);
    }
  };
}