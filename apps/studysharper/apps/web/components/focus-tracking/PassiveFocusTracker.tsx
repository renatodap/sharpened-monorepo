'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Pause, Play, Download, Eye, EyeOff } from 'lucide-react';

interface FocusSession {
  startTime: number;
  endTime?: number;
  duration?: number;
}

export function PassiveFocusTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [todayTotal, setTodayTotal] = useState(0);
  const [weeklyGoal] = useState(1200); // 20 hours in minutes
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [privacyMode, setPrivacyMode] = useState(false);
  
  const inactivityTimer = useRef<NodeJS.Timeout>();
  const sessionTimer = useRef<NodeJS.Timeout>();
  const lastActivity = useRef(Date.now());
  const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  const MIN_SESSION_DURATION = 60 * 1000; // 1 minute minimum

  // Load settings from localStorage
  useEffect(() => {
    const savedTracking = localStorage.getItem('focusTrackingEnabled');
    const savedPrivacy = localStorage.getItem('focusPrivacyMode');
    const savedWeeklyProgress = localStorage.getItem('weeklyFocusProgress');
    
    if (savedTracking === 'true') {
      setIsTracking(true);
    }
    if (savedPrivacy === 'true') {
      setPrivacyMode(true);
    }
    if (savedWeeklyProgress) {
      setWeeklyProgress(parseInt(savedWeeklyProgress));
    }

    // Load today's total
    loadTodayTotal();
  }, []);

  const loadTodayTotal = async () => {
    try {
      const response = await fetch('/api/focus?startDate=' + new Date().toISOString().split('T')[0]);
      if (response.ok) {
        const { data } = await response.json();
        const total = data.reduce((acc: number, session: any) => 
          acc + session.duration_seconds, 0) / 60;
        setTodayTotal(Math.round(total));
      }
    } catch (error) {
      console.error('Failed to load today total:', error);
    }
  };

  const startSession = () => {
    const now = Date.now();
    setCurrentSession({ startTime: now });
    lastActivity.current = now;
  };

  const endSession = async () => {
    if (!currentSession || !currentSession.startTime) return;

    const endTime = Date.now();
    const duration = endTime - currentSession.startTime;

    // Only save sessions longer than minimum duration
    if (duration >= MIN_SESSION_DURATION) {
      const durationSeconds = Math.round(duration / 1000);
      const durationMinutes = Math.round(durationSeconds / 60);
      
      setTodayTotal(prev => prev + durationMinutes);
      setWeeklyProgress(prev => {
        const newProgress = prev + durationMinutes;
        localStorage.setItem('weeklyFocusProgress', newProgress.toString());
        return newProgress;
      });

      // Save to backend
      try {
        await fetch('/api/focus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration: durationSeconds,
            timestamp: new Date(currentSession.startTime).toISOString(),
            metadata: {
              privacyMode,
              inactivityThreshold: INACTIVITY_THRESHOLD
            }
          })
        });
      } catch (error) {
        console.error('Failed to save focus session:', error);
      }
    }

    setCurrentSession(null);
  };

  // Activity detection
  useEffect(() => {
    if (!isTracking) return;

    const handleActivity = () => {
      lastActivity.current = Date.now();
      
      if (!currentSession) {
        startSession();
      }

      // Reset inactivity timer
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

      inactivityTimer.current = setTimeout(() => {
        endSession();
      }, INACTIVITY_THRESHOLD);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        endSession();
      } else if (isTracking) {
        handleActivity();
      }
    };

    // Track various activities
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start tracking immediately
    handleActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      endSession();
    };
  }, [isTracking, currentSession]);

  const toggleTracking = () => {
    const newState = !isTracking;
    setIsTracking(newState);
    localStorage.setItem('focusTrackingEnabled', newState.toString());
    
    if (!newState) {
      endSession();
    }
  };

  const togglePrivacy = () => {
    const newState = !privacyMode;
    setPrivacyMode(newState);
    localStorage.setItem('focusPrivacyMode', newState.toString());
  };

  const exportData = () => {
    window.open('/api/focus?format=csv', '_blank');
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Focus Tracker</h3>
          {isTracking && (
            <Badge variant="default" className="animate-pulse">
              <Play className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePrivacy}
            title={privacyMode ? "Privacy mode on" : "Privacy mode off"}
          >
            {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={exportData}
            title="Export data"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isTracking ? "destructive" : "default"}
            size="sm"
            onClick={toggleTracking}
          >
            {isTracking ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-2xl font-bold">
            {privacyMode ? '••••' : formatTime(todayTotal)}
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Current Session</p>
          <p className="text-2xl font-bold">
            {currentSession && isTracking
              ? formatTime(Math.round((Date.now() - currentSession.startTime) / 60000))
              : '--'
            }
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Weekly Goal</span>
          <span className="font-medium">
            {privacyMode ? '••••' : `${formatTime(weeklyProgress)} / ${formatTime(weeklyGoal)}`}
          </span>
        </div>
        <Progress 
          value={privacyMode ? 0 : (weeklyProgress / weeklyGoal) * 100} 
          className="h-2"
        />
      </div>

      {privacyMode && (
        <p className="text-xs text-muted-foreground text-center">
          Privacy mode enabled - stats hidden
        </p>
      )}
    </Card>
  );
}