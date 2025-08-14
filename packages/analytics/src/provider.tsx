'use client'

import React, { createContext, useContext, useEffect, useCallback } from 'react'

export interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: Date
}

export interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void
  identify: (userId: string, traits?: Record<string, any>) => void
  page: (name?: string, properties?: Record<string, any>) => void
  reset: () => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

interface AnalyticsProviderProps {
  children: React.ReactNode
  enabled?: boolean
  userId?: string
  debug?: boolean
}

export function AnalyticsProvider({ 
  children, 
  enabled = true, 
  userId,
  debug = false 
}: AnalyticsProviderProps) {
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    if (!enabled) return
    
    const eventData: AnalyticsEvent = {
      name: event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userId,
        sessionId: typeof window !== 'undefined' ? window.sessionStorage.getItem('sessionId') : null,
      },
    }

    if (debug) {
      console.log('[Analytics] Track:', eventData)
    }

    // Send to analytics service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties)
    }

    // Store locally for batch processing
    if (typeof window !== 'undefined') {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
      events.push(eventData)
      localStorage.setItem('analytics_events', JSON.stringify(events.slice(-100))) // Keep last 100 events
    }
  }, [enabled, userId, debug])

  const identify = useCallback((userId: string, traits?: Record<string, any>) => {
    if (!enabled) return
    
    if (debug) {
      console.log('[Analytics] Identify:', { userId, traits })
    }

    // Set user ID for future events
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('userId', userId)
      
      if (window.gtag) {
        window.gtag('config', 'GA_MEASUREMENT_ID', {
          user_id: userId,
          ...traits
        })
      }
    }
  }, [enabled, debug])

  const page = useCallback((name?: string, properties?: Record<string, any>) => {
    if (!enabled) return
    
    const pageName = name || (typeof window !== 'undefined' ? window.location.pathname : 'unknown')
    
    if (debug) {
      console.log('[Analytics] Page:', { name: pageName, properties })
    }

    track(`page_view`, {
      page_name: pageName,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      ...properties
    })
  }, [enabled, track, debug])

  const reset = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('userId')
      window.sessionStorage.removeItem('sessionId')
      localStorage.removeItem('analytics_events')
    }
    
    if (debug) {
      console.log('[Analytics] Reset')
    }
  }, [debug])

  // Initialize session on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.sessionStorage.getItem('sessionId')) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      window.sessionStorage.setItem('sessionId', sessionId)
    }

    // Auto-identify if userId provided
    if (userId) {
      identify(userId)
    }
  }, [userId, identify])

  // Track page views on route changes
  useEffect(() => {
    if (!enabled) return
    
    page()
    
    // Listen for route changes (Next.js specific)
    const handleRouteChange = () => page()
    
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange)
      return () => window.removeEventListener('popstate', handleRouteChange)
    }
  }, [enabled, page])

  const value: AnalyticsContextType = {
    track,
    identify,
    page,
    reset
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}

// Analytics event helpers
export const analyticsEvents = {
  // User events
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  USER_PROFILE_UPDATED: 'user_profile_updated',
  
  // Study events
  STUDY_SESSION_STARTED: 'study_session_started',
  STUDY_SESSION_COMPLETED: 'study_session_completed',
  STUDY_PLAN_CREATED: 'study_plan_created',
  FLASHCARD_REVIEWED: 'flashcard_reviewed',
  
  // Content events
  CONTENT_UPLOADED: 'content_uploaded',
  CONTENT_PROCESSED: 'content_processed',
  CONTENT_VIEWED: 'content_viewed',
  QUESTION_ASKED: 'question_asked',
  
  // Feature events
  FEATURE_ACCESSED: 'feature_accessed',
  FEATURE_COMPLETED: 'feature_completed',
  
  // Conversion events
  TRIAL_STARTED: 'trial_started',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
} as const

// Helper function for structured event tracking
export function trackEvent(
  eventName: keyof typeof analyticsEvents | string,
  properties?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track(eventName, properties)
  }
}

// TypeScript augmentation for window object
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void
      identify: (userId: string, traits?: Record<string, any>) => void
      page: (name?: string, properties?: Record<string, any>) => void
      reset: () => void
    }
  }
}