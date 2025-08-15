'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function Analytics() {
  const { user } = useAuth()

  useEffect(() => {
    // Simple analytics tracking
    if (typeof window !== 'undefined') {
      // Track page views
      const trackPageView = () => {
        console.log('Page view:', window.location.pathname)
        // In production, this would send to analytics service
      }

      // Track user events
      const trackUserEvent = (event: string, properties?: Record<string, any>) => {
        console.log('User event:', event, properties)
        // In production, this would send to analytics service
      }

      // Initial page view
      trackPageView()

      // Track route changes
      const originalPushState = history.pushState
      const originalReplaceState = history.replaceState

      history.pushState = function(...args) {
        originalPushState.apply(history, args)
        trackPageView()
      }

      history.replaceState = function(...args) {
        originalReplaceState.apply(history, args)
        trackPageView()
      }

      window.addEventListener('popstate', trackPageView)

      // Track user login/logout
      if (user) {
        trackUserEvent('user_login', {
          userId: user.id,
          role: user.role,
          teamId: user.teamId
        })
      }

      return () => {
        window.removeEventListener('popstate', trackPageView)
        history.pushState = originalPushState
        history.replaceState = originalReplaceState
      }
    }
  }, [user])

  // This component doesn't render anything
  return null
}