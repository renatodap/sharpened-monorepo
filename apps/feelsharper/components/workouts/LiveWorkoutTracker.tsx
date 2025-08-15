/**
 * LiveWorkoutTracker - Real-time workout tracking with rest timer
 * Maps to PRD: Real-time Features (Technical Requirement #3)
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Timer, Users, Wifi, WifiOff, Clock } from 'lucide-react';
import { useRealtimeWorkout, useRestTimer } from '@/hooks/useRealtimeWorkout';
import { Button } from '@/components/ui/Button';

interface LiveWorkoutTrackerProps {
  userId: string;
  workoutId?: string;
  workout?: {
    id: string;
    title: string;
    exercises: Array<{
      id: string;
      name: string;
      sets: number;
      reps?: number;
      weight?: number;
      duration?: number;
    }>;
  };
  onComplete?: () => void;
  className?: string;
}

export function LiveWorkoutTracker({
  userId,
  workoutId,
  workout,
  onComplete,
  className = ''
}: LiveWorkoutTrackerProps) {
  const {
    session,
    isConnected,
    currentExercise,
    currentSet,
    restTimer,
    presence,
    connectionStatus,
    actions
  } = useRealtimeWorkout({ userId, workoutId });

  const [selectedRestTime, setSelectedRestTime] = useState(90); // Default 90 seconds
  const [isManualMode, setIsManualMode] = useState(false);

  const {
    formattedTime,
    isComplete: timerComplete,
    progress
  } = useRestTimer(
    restTimer?.isActive || false,
    restTimer?.timeRemaining || 0
  );

  // Handle workout completion
  const handleCompleteWorkout = async () => {
    await actions.completeWorkout();
    onComplete?.();
  };

  // Handle set completion and auto-rest
  const handleSetComplete = async (exerciseIndex: number, setIndex: number, setData?: any) => {
    await actions.updateProgress(exerciseIndex, setIndex, setData);
    
    // Auto-start rest timer if not on last set
    const currentExerciseData = workout?.exercises[exerciseIndex];
    if (currentExerciseData && setIndex < currentExerciseData.sets - 1) {
      await actions.startRestTimer(selectedRestTime);
    }
  };

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 text-xs">
      {isConnected ? (
        <>
          <Wifi className="w-3 h-3 text-green-400" />
          <span className="text-green-400">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3 text-yellow-400" />
          <span className="text-yellow-400">Offline</span>
        </>
      )}
      {presence.length > 1 && (
        <>
          <Users className="w-3 h-3 text-blue-400 ml-2" />
          <span className="text-blue-400">{presence.length - 1} others</span>
        </>
      )}
    </div>
  );

  // Rest timer component
  const RestTimerDisplay = () => {
    if (!restTimer?.isActive) return null;

    return (
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">Rest Timer</span>
          </div>
          <ConnectionStatus />
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-primary mb-2">
            {formattedTime}
          </div>
          
          {/* Progress ring */}
          <div className="relative w-20 h-20 mx-auto mb-3">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-surface stroke-current"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary stroke-current"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={`${progress || 0}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
          </div>

          {timerComplete && (
            <div className="text-green-400 font-medium animate-pulse">
              Rest Complete! 💪
            </div>
          )}
        </div>
      </div>
    );
  };

  // Current exercise display
  const CurrentExerciseDisplay = () => {
    if (!workout || !session) return null;

    const exercise = workout.exercises[currentExercise];
    if (!exercise) return null;

    return (
      <div className="bg-surface border border-border rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">{exercise.name}</h3>
          <div className="text-sm text-text-secondary">
            Exercise {currentExercise + 1} of {workout.exercises.length}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{currentSet + 1}</div>
            <div className="text-xs text-text-secondary">Current Set</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{exercise.sets}</div>
            <div className="text-xs text-text-secondary">Total Sets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{exercise.reps || exercise.duration || '-'}</div>
            <div className="text-xs text-text-secondary">
              {exercise.reps ? 'Reps' : exercise.duration ? 'Seconds' : 'Target'}
            </div>
          </div>
        </div>

        {/* Set completion buttons */}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => handleSetComplete(currentExercise, currentSet)}
            className="flex-1"
            disabled={restTimer?.isActive}
          >
            Complete Set {currentSet + 1}
          </Button>
          
          {currentSet < exercise.sets - 1 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedRestTime}
                onChange={(e) => setSelectedRestTime(Number(e.target.value))}
                className="bg-surface border border-border rounded px-2 py-1 text-sm"
              >
                <option value={60}>1:00</option>
                <option value={90}>1:30</option>
                <option value={120}>2:00</option>
                <option value={180}>3:00</option>
                <option value={300}>5:00</option>
              </select>
            </div>
          )}
        </div>

        {/* Exercise navigation */}
        <div className="flex justify-between items-center text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => actions.updateProgress(Math.max(0, currentExercise - 1), 0)}
            disabled={currentExercise === 0}
          >
            Previous Exercise
          </Button>
          
          <span className="text-text-secondary">
            {Math.floor(((currentExercise * exercise.sets + currentSet + 1) / (workout.exercises.reduce((acc, ex) => acc + ex.sets, 0))) * 100)}% Complete
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => actions.updateProgress(Math.min(workout.exercises.length - 1, currentExercise + 1), 0)}
            disabled={currentExercise === workout.exercises.length - 1}
          >
            Next Exercise
          </Button>
        </div>
      </div>
    );
  };

  // Workout controls
  const WorkoutControls = () => (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Workout Controls</h2>
        <ConnectionStatus />
      </div>

      {!session ? (
        <Button
          onClick={() => actions.startWorkout(workoutId)}
          className="w-full"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Start Workout
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={() => actions.startRestTimer(selectedRestTime)}
              variant="outline"
              className="flex-1"
              disabled={restTimer?.isActive}
            >
              <Timer className="w-4 h-4 mr-2" />
              Start Rest ({selectedRestTime}s)
            </Button>
            
            <Button
              onClick={handleCompleteWorkout}
              variant="outline"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              Finish Workout
            </Button>
          </div>

          {workout && (
            <div className="text-xs text-text-secondary text-center">
              Session: {session.id.split('_')[1]}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <RestTimerDisplay />
      <CurrentExerciseDisplay />
      <WorkoutControls />
    </div>
  );
}

// Simplified version for quick access
export function QuickWorkoutTimer({ 
  userId, 
  onRestComplete 
}: { 
  userId: string;
  onRestComplete?: () => void;
}) {
  const [restTime, setRestTime] = useState(90);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const { formattedTime, isComplete } = useRestTimer(isActive, timeRemaining, () => {
    setIsActive(false);
    onRestComplete?.();
  });

  const startTimer = () => {
    setTimeRemaining(restTime);
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false);
    setTimeRemaining(0);
  };

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="bg-surface border border-border rounded-lg p-4 text-center">
      <div className="text-2xl font-mono font-bold mb-2">
        {isActive ? formattedTime : `${Math.floor(restTime / 60)}:${(restTime % 60).toString().padStart(2, '0')}`}
      </div>
      
      <div className="flex gap-2 mb-3">
        <select
          value={restTime}
          onChange={(e) => setRestTime(Number(e.target.value))}
          disabled={isActive}
          className="bg-surface border border-border rounded px-2 py-1 text-sm flex-1"
        >
          <option value={60}>1:00</option>
          <option value={90}>1:30</option>
          <option value={120}>2:00</option>
          <option value={180}>3:00</option>
        </select>
      </div>

      <div className="flex gap-2">
        {!isActive ? (
          <Button onClick={startTimer} className="flex-1">
            <Timer className="w-4 h-4 mr-2" />
            Start Rest
          </Button>
        ) : (
          <Button onClick={stopTimer} variant="outline" className="flex-1">
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}
      </div>

      {isComplete && (
        <div className="text-green-400 text-sm mt-2 animate-pulse">
          Rest Complete! 💪
        </div>
      )}
    </div>
  );
}