/**
 * useRealtimeWorkout - React hook for real-time workout integration
 * Maps to PRD: Real-time Features (Technical Requirement #3)
 */

"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeManager, type RealtimeEvent, type WorkoutSession, type UserPresence } from '@/lib/realtime/RealtimeManager';

interface UseRealtimeWorkoutOptions {
  userId: string;
  workoutId?: string;
  autoStart?: boolean;
}

export interface RealtimeWorkoutState {
  session: WorkoutSession | null;
  isConnected: boolean;
  isInitialized: boolean;
  currentExercise: number;
  currentSet: number;
  restTimer: {
    isActive: boolean;
    timeRemaining: number;
    duration: number;
  } | null;
  presence: UserPresence[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export function useRealtimeWorkout(options: UseRealtimeWorkoutOptions) {
  const { userId, workoutId, autoStart = false } = options;
  const [state, setState] = useState<RealtimeWorkoutState>({
    session: null,
    isConnected: false,
    isInitialized: false,
    currentExercise: 0,
    currentSet: 0,
    restTimer: null,
    presence: [],
    connectionStatus: 'disconnected'
  });

  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initializationRef = useRef<boolean>(false);

  // Initialize real-time connection
  const initialize = useCallback(async () => {
    if (initializationRef.current) return;
    
    try {
      setState(prev => ({ ...prev, connectionStatus: 'connecting' }));
      
      await realtimeManager.initialize(userId);
      initializationRef.current = true;
      
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isConnected: true,
        connectionStatus: 'connected'
      }));

      console.log('[useRealtimeWorkout] Initialized for user:', userId);
    } catch (error) {
      console.error('[useRealtimeWorkout] Failed to initialize:', error);
      setState(prev => ({ ...prev, connectionStatus: 'error' }));
    }
  }, [userId]);

  // Start workout session
  const startWorkout = useCallback(async (targetWorkoutId?: string): Promise<string | null> => {
    if (!state.isInitialized) {
      await initialize();
    }

    try {
      const sessionId = await realtimeManager.startWorkoutSession(
        userId, 
        targetWorkoutId || workoutId
      );
      
      const session = realtimeManager.getCurrentSession();
      setState(prev => ({
        ...prev,
        session,
        currentExercise: 0,
        currentSet: 0
      }));

      return sessionId;
    } catch (error) {
      console.error('[useRealtimeWorkout] Failed to start workout:', error);
      return null;
    }
  }, [userId, workoutId, state.isInitialized, initialize]);

  // Update workout progress
  const updateProgress = useCallback(async (
    exerciseIndex: number,
    setIndex: number,
    setData?: any
  ) => {
    if (!state.session) return;

    try {
      await realtimeManager.updateWorkoutProgress(exerciseIndex, setIndex, setData);
      setState(prev => ({
        ...prev,
        currentExercise: exerciseIndex,
        currentSet: setIndex
      }));
    } catch (error) {
      console.error('[useRealtimeWorkout] Failed to update progress:', error);
    }
  }, [state.session]);

  // Start rest timer
  const startRestTimer = useCallback(async (duration: number) => {
    if (!state.session) return;

    try {
      await realtimeManager.startRestTimer(duration);
      
      setState(prev => ({
        ...prev,
        restTimer: {
          isActive: true,
          timeRemaining: duration,
          duration
        }
      }));

      // Local countdown timer
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }

      restTimerRef.current = setInterval(() => {
        setState(prev => {
          if (!prev.restTimer?.isActive) return prev;
          
          const newTimeRemaining = prev.restTimer.timeRemaining - 1;
          
          if (newTimeRemaining <= 0) {
            if (restTimerRef.current) {
              clearInterval(restTimerRef.current);
              restTimerRef.current = null;
            }
            return {
              ...prev,
              restTimer: {
                ...prev.restTimer,
                isActive: false,
                timeRemaining: 0
              }
            };
          }

          return {
            ...prev,
            restTimer: {
              ...prev.restTimer,
              timeRemaining: newTimeRemaining
            }
          };
        });
      }, 1000);

    } catch (error) {
      console.error('[useRealtimeWorkout] Failed to start rest timer:', error);
    }
  }, [state.session]);

  // Complete workout
  const completeWorkout = useCallback(async () => {
    if (!state.session) return;

    try {
      await realtimeManager.completeWorkoutSession();
      setState(prev => ({
        ...prev,
        session: null,
        currentExercise: 0,
        currentSet: 0,
        restTimer: null
      }));

      // Clear timer
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    } catch (error) {
      console.error('[useRealtimeWorkout] Failed to complete workout:', error);
    }
  }, [state.session]);

  // Event handlers
  useEffect(() => {
    if (!state.isInitialized) return;

    const handleWorkoutEvent = (event: RealtimeEvent) => {
      console.log('[useRealtimeWorkout] Received event:', event);
      
      switch (event.type) {
        case 'workout_started':
          if (event.userId === userId) {
            setState(prev => ({
              ...prev,
              session: realtimeManager.getCurrentSession()
            }));
          }
          break;
        
        case 'workout_updated':
          if (event.userId === userId) {
            setState(prev => ({
              ...prev,
              currentExercise: event.payload.exerciseIndex || prev.currentExercise,
              currentSet: event.payload.setIndex || prev.currentSet
            }));
          }
          break;
        
        case 'workout_completed':
          if (event.userId === userId) {
            setState(prev => ({
              ...prev,
              session: null,
              currentExercise: 0,
              currentSet: 0,
              restTimer: null
            }));
          }
          break;

        case 'rest_timer_started':
          if (event.userId === userId && event.payload.duration) {
            setState(prev => ({
              ...prev,
              restTimer: {
                isActive: true,
                timeRemaining: event.payload.duration,
                duration: event.payload.duration
              }
            }));
          }
          break;
      }
    };

    const handlePresenceUpdate = (presence: UserPresence[]) => {
      setState(prev => ({ ...prev, presence }));
    };

    // Subscribe to events
    realtimeManager.on('workout_started', handleWorkoutEvent);
    realtimeManager.on('workout_updated', handleWorkoutEvent);
    realtimeManager.on('workout_completed', handleWorkoutEvent);
    realtimeManager.on('rest_timer_started', handleWorkoutEvent);
    realtimeManager.onPresence(handlePresenceUpdate);

    return () => {
      // Cleanup handled by realtimeManager.disconnect()
    };
  }, [state.isInitialized, userId]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && state.isInitialized && !state.session && workoutId) {
      startWorkout(workoutId);
    }
  }, [autoStart, state.isInitialized, state.session, workoutId, startWorkout]);

  // Initialize on mount
  useEffect(() => {
    initialize();

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
  }, [initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      realtimeManager.disconnect();
      initializationRef.current = false;
    };
  }, []);

  return {
    ...state,
    actions: {
      startWorkout,
      updateProgress,
      startRestTimer,
      completeWorkout,
      initialize
    }
  };
}

// Helper hook for rest timer display
export function useRestTimer(
  isActive: boolean,
  timeRemaining: number,
  onComplete?: () => void
) {
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (!isActive && timeRemaining === 0 && onComplete) {
      onComplete();
    }
  }, [isActive, timeRemaining, onComplete]);

  return {
    formattedTime: formatTime(timeRemaining),
    isComplete: timeRemaining === 0,
    progress: timeRemaining > 0 ? (timeRemaining / 60) * 100 : 0
  };
}