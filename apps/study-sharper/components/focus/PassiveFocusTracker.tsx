'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface FocusTrackerProps {
  userId: string
  enabled: boolean
  onSessionUpdate?: (data: FocusSessionData) => void
}

interface FocusSessionData {
  startTime: Date
  endTime?: Date
  duration: number
  tabVisible: boolean
  idleEvents: number
  productiveScore: number
}

export function PassiveFocusTracker({ userId, enabled, onSessionUpdate }: FocusTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [currentSession, setCurrentSession] = useState<FocusSessionData | null>(null)
  const sessionRef = useRef<FocusSessionData | null>(null)
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const IDLE_THRESHOLD = 60000 // 1 minute of inactivity
  const SAVE_INTERVAL = 30000 // Save every 30 seconds

  const resetIdleTimer = useCallback(() => {
    if (!enabled || !isTracking) return

    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
    }

    idleTimeoutRef.current = setTimeout(() => {
      if (sessionRef.current) {
        sessionRef.current.idleEvents += 1
        // Reduce productive score for idle time
        sessionRef.current.productiveScore = Math.max(
          0.5,
          sessionRef.current.productiveScore - 0.05
        )
      }
    }, IDLE_THRESHOLD)
  }, [enabled, isTracking])

  const startSession = useCallback(() => {
    if (!enabled) return

    const newSession: FocusSessionData = {
      startTime: new Date(),
      duration: 0,
      tabVisible: true,
      idleEvents: 0,
      productiveScore: 1.0
    }

    sessionRef.current = newSession
    setCurrentSession(newSession)
    setIsTracking(true)

    // Start periodic saves
    saveIntervalRef.current = setInterval(() => {
      saveSession()
    }, SAVE_INTERVAL)

    resetIdleTimer()
  }, [enabled, resetIdleTimer])

  const endSession = useCallback(async () => {
    if (!sessionRef.current) return

    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - sessionRef.current.startTime.getTime()) / 1000)

    sessionRef.current.endTime = endTime
    sessionRef.current.duration = duration

    await saveSession(true)

    // Clear intervals
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current)
    }
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
    }

    sessionRef.current = null
    setCurrentSession(null)
    setIsTracking(false)
  }, [])

  const saveSession = async (final = false) => {
    if (!sessionRef.current) return

    const sessionData = {
      ...sessionRef.current,
      duration: Math.floor(
        ((sessionRef.current.endTime?.getTime() || Date.now()) - 
         sessionRef.current.startTime.getTime()) / 1000
      )
    }

    try {
      const response = await fetch('/api/focus/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...sessionData,
          final
        })
      })

      if (response.ok && onSessionUpdate) {
        onSessionUpdate(sessionData)
      }
    } catch (error) {
      console.error('Failed to save focus session:', error)
    }
  }

  // Handle tab visibility changes
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (sessionRef.current) {
        sessionRef.current.tabVisible = !document.hidden
        
        if (document.hidden) {
          sessionRef.current.productiveScore = Math.max(
            0.5,
            sessionRef.current.productiveScore - 0.1
          )
        }
      }

      if (!document.hidden && !isTracking && enabled) {
        startSession()
      } else if (document.hidden && isTracking) {
        // Don't end session, just mark as not visible
        resetIdleTimer()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, isTracking, startSession, resetIdleTimer])

  // Handle user activity
  useEffect(() => {
    if (!enabled) return

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']

    const handleActivity = () => {
      if (!isTracking && enabled && !document.hidden) {
        startSession()
      }
      resetIdleTimer()
    }

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity)
    })

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [enabled, isTracking, startSession, resetIdleTimer])

  // Cleanup on unmount or disable
  useEffect(() => {
    return () => {
      if (isTracking) {
        endSession()
      }
    }
  }, [isTracking, endSession])

  // Handle enable/disable
  useEffect(() => {
    if (!enabled && isTracking) {
      endSession()
    } else if (enabled && !isTracking && !document.hidden) {
      startSession()
    }
  }, [enabled, isTracking, startSession, endSession])

  if (!enabled) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isTracking && currentSession && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 min-w-[200px]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Focus Mode Active</span>
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            <div>Duration: {Math.floor(currentSession.duration / 60)}m</div>
            <div>Score: {(currentSession.productiveScore * 100).toFixed(0)}%</div>
            {currentSession.idleEvents > 0 && (
              <div>Idle moments: {currentSession.idleEvents}</div>
            )}
          </div>
          <button
            onClick={endSession}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            End Session
          </button>
        </div>
      )}
    </div>
  )
}