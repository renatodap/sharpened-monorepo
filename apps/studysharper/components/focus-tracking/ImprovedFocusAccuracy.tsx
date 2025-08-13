// Improved Focus Accuracy System
// Based on GPT_DEEP_RESEARCH_02: Multiple signals, anti-gaming, honor system
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import {
  Brain,
  Eye,
  MousePointer,
  Keyboard,
  Monitor,
  Clock,
  AlertCircle,
  CheckCircle,
  Shield,
  Activity,
  BarChart3,
  Settings,
  Code,
  FileText,
  Chrome,
  Terminal,
  Book,
  Coffee,
  Zap,
  Info,
  UserCheck
} from 'lucide-react';

interface FocusSignals {
  tabVisible: boolean;
  userActive: boolean;
  keyboardActivity: number; // Keystrokes in last minute (not logged, just count)
  mouseActivity: number; // Mouse events in last minute
  activeApp: string;
  activeUrl?: string;
  idleTime: number;
  audioPlaying: boolean;
  fullscreen: boolean;
  multipleTabs: number;
}

interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  focusMinutes: number;
  breakMinutes: number;
  distractionEvents: number;
  confidenceScore: number; // 0-100 accuracy confidence
  verificationStatus: 'auto' | 'verified' | 'disputed';
  activeApplications: Map<string, number>; // App -> minutes
  deepWorkBlocks: number; // 25+ minute uninterrupted blocks
}

interface AppWhitelist {
  [key: string]: {
    name: string;
    category: 'ide' | 'docs' | 'research' | 'communication' | 'other';
    focusWeight: number; // 0-1, how much this counts as "focus"
  };
}

export function ImprovedFocusAccuracy() {
  const [isTracking, setIsTracking] = useState(false);
  const [focusSignals, setFocusSignals] = useState<FocusSignals>({
    tabVisible: true,
    userActive: true,
    keyboardActivity: 0,
    mouseActivity: 0,
    activeApp: 'Chrome',
    idleTime: 0,
    audioPlaying: false,
    fullscreen: false,
    multipleTabs: 1,
  });

  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [verificationPrompts, setVerificationPrompts] = useState<number>(0);
  const [lastVerification, setLastVerification] = useState<Date | null>(null);
  
  // Configurable whitelist (user can customize)
  const [appWhitelist, setAppWhitelist] = useState<AppWhitelist>({
    'VSCode': { name: 'VS Code', category: 'ide', focusWeight: 1.0 },
    'WebStorm': { name: 'WebStorm', category: 'ide', focusWeight: 1.0 },
    'Terminal': { name: 'Terminal', category: 'ide', focusWeight: 0.9 },
    'Chrome': { name: 'Chrome', category: 'research', focusWeight: 0.7 },
    'Firefox': { name: 'Firefox', category: 'research', focusWeight: 0.7 },
    'Notion': { name: 'Notion', category: 'docs', focusWeight: 0.8 },
    'Obsidian': { name: 'Obsidian', category: 'docs', focusWeight: 0.9 },
    'Slack': { name: 'Slack', category: 'communication', focusWeight: 0.3 },
    'Discord': { name: 'Discord', category: 'communication', focusWeight: 0.2 },
  });

  const [urlPatterns, setUrlPatterns] = useState<string[]>([
    'github.com',
    'stackoverflow.com',
    'developer.mozilla.org',
    'docs.*',
    'localhost:*',
    '*.edu',
    'arxiv.org',
    'scholar.google.com',
  ]);

  const [accuracySettings, setAccuracySettings] = useState({
    multiSignalTracking: true, // Use keyboard + mouse + tab visibility
    randomVerification: true, // Random prompts to verify focus
    verificationInterval: 45, // Minutes between verifications
    microBreakThreshold: 90, // Seconds - breaks under this don't stop session
    minimumActivityThreshold: 5, // Min keyboard/mouse events per minute for "active"
    suspiciousPatternDetection: true, // Detect potential gaming
    honorSystem: true, // Allow manual corrections
  });

  const [suspiciousPatterns, setSuspiciousPatterns] = useState({
    constantActivity: false, // Too regular, might be automated
    noVariation: false, // Exact same activity pattern
    impossibleDuration: false, // 10+ hours without break
    tabSwitchingPattern: false, // Rapid tab switching to game the system
  });

  const activityBufferRef = useRef<number[]>([]);
  const verificationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Multi-signal activity detection
  useEffect(() => {
    if (!isTracking) return;

    let keyboardCount = 0;
    let mouseCount = 0;
    let lastActivityTime = Date.now();

    const handleKeyboard = () => {
      keyboardCount++;
      lastActivityTime = Date.now();
    };

    const handleMouse = () => {
      mouseCount++;
      lastActivityTime = Date.now();
    };

    // Track activity without logging actual keys/clicks
    document.addEventListener('keydown', handleKeyboard);
    document.addEventListener('mousemove', handleMouse);
    document.addEventListener('click', handleMouse);

    // Update signals every minute
    const intervalId = setInterval(() => {
      const idleTime = (Date.now() - lastActivityTime) / 1000;
      
      setFocusSignals(prev => ({
        ...prev,
        keyboardActivity: keyboardCount,
        mouseActivity: mouseCount,
        idleTime: Math.round(idleTime),
        userActive: idleTime < accuracySettings.microBreakThreshold,
      }));

      // Store activity pattern for suspicious detection
      activityBufferRef.current.push(keyboardCount + mouseCount);
      if (activityBufferRef.current.length > 10) {
        activityBufferRef.current.shift();
      }

      // Detect suspicious patterns
      detectSuspiciousPatterns();

      // Reset counters
      keyboardCount = 0;
      mouseCount = 0;
    }, 60000); // Every minute

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      document.removeEventListener('mousemove', handleMouse);
      document.removeEventListener('click', handleMouse);
      clearInterval(intervalId);
    };
  }, [isTracking, accuracySettings]);

  // Detect suspicious patterns that might indicate gaming
  const detectSuspiciousPatterns = () => {
    const buffer = activityBufferRef.current;
    if (buffer.length < 5) return;

    // Check for constant activity (too regular)
    const avg = buffer.reduce((a, b) => a + b, 0) / buffer.length;
    const variance = buffer.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / buffer.length;
    const constantActivity = variance < 10; // Very low variance

    // Check for impossible duration
    const sessionDuration = currentSession ? 
      (Date.now() - currentSession.startTime.getTime()) / (1000 * 60 * 60) : 0;
    const impossibleDuration = sessionDuration > 10; // 10+ hours

    setSuspiciousPatterns({
      constantActivity,
      noVariation: variance === 0,
      impossibleDuration,
      tabSwitchingPattern: false, // Would need tab switch tracking
    });
  };

  // Random verification prompts (optional)
  const triggerVerificationPrompt = () => {
    if (!accuracySettings.randomVerification) return;
    
    const now = new Date();
    if (lastVerification && (now.getTime() - lastVerification.getTime()) < accuracySettings.verificationInterval * 60000) {
      return;
    }

    // Simple non-intrusive prompt
    if (window.confirm('Quick check: Are you still actively focusing? Click OK to confirm.')) {
      setVerificationPrompts(prev => prev + 1);
      setLastVerification(now);
      
      if (currentSession) {
        setCurrentSession(prev => prev ? {
          ...prev,
          verificationStatus: 'verified',
          confidenceScore: Math.min(100, prev.confidenceScore + 5),
        } : null);
      }
    }
  };

  // Calculate confidence score based on multiple signals
  const calculateConfidenceScore = (): number => {
    let score = 50; // Base score

    // Tab visibility
    if (focusSignals.tabVisible) score += 10;
    
    // User activity
    if (focusSignals.userActive) score += 10;
    if (focusSignals.keyboardActivity > accuracySettings.minimumActivityThreshold) score += 10;
    if (focusSignals.mouseActivity > accuracySettings.minimumActivityThreshold) score += 5;
    
    // Whitelisted app
    const appWeight = appWhitelist[focusSignals.activeApp]?.focusWeight || 0.5;
    score += appWeight * 15;
    
    // Verification status
    if (currentSession?.verificationStatus === 'verified') score += 10;
    
    // Suspicious patterns penalty
    if (suspiciousPatterns.constantActivity) score -= 20;
    if (suspiciousPatterns.impossibleDuration) score -= 30;
    
    // No distractions bonus
    if (!focusSignals.multipleTabs || focusSignals.multipleTabs === 1) score += 5;
    if (focusSignals.fullscreen) score += 10;
    
    return Math.max(0, Math.min(100, score));
  };

  // Manual correction (honor system)
  const manuallyCorrectSession = (actualMinutes: number) => {
    if (!accuracySettings.honorSystem || !currentSession) return;
    
    setCurrentSession(prev => prev ? {
      ...prev,
      focusMinutes: actualMinutes,
      verificationStatus: 'verified',
      confidenceScore: 95, // High confidence for manual correction
    } : null);
  };

  // Start enhanced tracking
  const startTracking = () => {
    setIsTracking(true);
    const now = new Date();
    
    setCurrentSession({
      id: `session_${Date.now()}`,
      startTime: now,
      focusMinutes: 0,
      breakMinutes: 0,
      distractionEvents: 0,
      confidenceScore: 50,
      verificationStatus: 'auto',
      activeApplications: new Map(),
      deepWorkBlocks: 0,
    });

    // Set up verification timer
    if (accuracySettings.randomVerification) {
      verificationTimerRef.current = setInterval(() => {
        triggerVerificationPrompt();
      }, accuracySettings.verificationInterval * 60000);
    }
  };

  // Stop tracking
  const stopTracking = () => {
    setIsTracking(false);
    
    if (verificationTimerRef.current) {
      clearInterval(verificationTimerRef.current);
    }
    
    if (currentSession) {
      const endTime = new Date();
      const duration = (endTime.getTime() - currentSession.startTime.getTime()) / 60000;
      
      setCurrentSession(prev => prev ? {
        ...prev,
        endTime,
        focusMinutes: Math.round(duration),
        confidenceScore: calculateConfidenceScore(),
      } : null);
    }
  };

  const confidence = calculateConfidenceScore();

  return (
    <div className="space-y-4">
      {/* Main Tracking Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Enhanced Focus Tracking
            </CardTitle>
            <Badge variant={confidence > 80 ? 'default' : confidence > 60 ? 'secondary' : 'destructive'}>
              {confidence}% Confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Multi-Signal Status Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className={`p-3 rounded-lg border ${focusSignals.tabVisible ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Eye className={`h-4 w-4 ${focusSignals.tabVisible ? 'text-green-500' : 'text-red-500'}`} />
                <span className="text-sm font-medium">Tab Visibility</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {focusSignals.tabVisible ? 'Active tab' : 'Tab hidden'}
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${focusSignals.keyboardActivity > 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-yellow-50 dark:bg-yellow-950/20'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Keyboard className={`h-4 w-4 ${focusSignals.keyboardActivity > 0 ? 'text-green-500' : 'text-yellow-500'}`} />
                <span className="text-sm font-medium">Keyboard</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {focusSignals.keyboardActivity} actions/min
              </div>
            </div>

            <div className={`p-3 rounded-lg border ${focusSignals.mouseActivity > 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-yellow-50 dark:bg-yellow-950/20'}`}>
              <div className="flex items-center gap-2 mb-1">
                <MousePointer className={`h-4 w-4 ${focusSignals.mouseActivity > 0 ? 'text-green-500' : 'text-yellow-500'}`} />
                <span className="text-sm font-medium">Mouse</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {focusSignals.mouseActivity} actions/min
              </div>
            </div>
          </div>

          {/* Active Application */}
          <div className="p-3 bg-muted/50 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span className="text-sm">Active Application</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{focusSignals.activeApp}</Badge>
                {appWhitelist[focusSignals.activeApp] && (
                  <Badge variant="default">
                    {Math.round(appWhitelist[focusSignals.activeApp].focusWeight * 100)}% Focus
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Suspicious Pattern Warnings */}
          {(suspiciousPatterns.constantActivity || suspiciousPatterns.impossibleDuration) && (
            <Alert className="mb-4 border-yellow-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Unusual Pattern Detected</div>
                <div className="text-sm mt-1">
                  {suspiciousPatterns.constantActivity && 'Activity seems too regular. '}
                  {suspiciousPatterns.impossibleDuration && 'Session duration exceeds typical limits. '}
                  Consider taking a break or verifying your session.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Honor System Correction */}
          {currentSession && accuracySettings.honorSystem && (
            <Card className="mb-4 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Manual Correction (Honor System)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Actual minutes"
                      className="w-24 h-8"
                      onChange={(e) => {
                        const mins = parseInt(e.target.value);
                        if (mins > 0) manuallyCorrectSession(mins);
                      }}
                    />
                    <Button size="sm" variant="outline">
                      Correct
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Control Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={isTracking ? stopTracking : startTracking}
              variant={isTracking ? 'destructive' : 'default'}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Button>
            
            {isTracking && accuracySettings.randomVerification && (
              <Button
                variant="outline"
                onClick={triggerVerificationPrompt}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accuracy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Accuracy Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Multi-signal tracking</span>
            </div>
            <Switch
              checked={accuracySettings.multiSignalTracking}
              onCheckedChange={(checked) => 
                setAccuracySettings(prev => ({ ...prev, multiSignalTracking: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Random verification</span>
            </div>
            <Switch
              checked={accuracySettings.randomVerification}
              onCheckedChange={(checked) => 
                setAccuracySettings(prev => ({ ...prev, randomVerification: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Honor system corrections</span>
            </div>
            <Switch
              checked={accuracySettings.honorSystem}
              onCheckedChange={(checked) => 
                setAccuracySettings(prev => ({ ...prev, honorSystem: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Suspicious pattern detection</span>
            </div>
            <Switch
              checked={accuracySettings.suspiciousPatternDetection}
              onCheckedChange={(checked) => 
                setAccuracySettings(prev => ({ ...prev, suspiciousPatternDetection: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Session Stats */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-2xl font-bold">{currentSession.focusMinutes}</div>
                <div className="text-xs text-muted-foreground">Focus Minutes</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{currentSession.deepWorkBlocks}</div>
                <div className="text-xs text-muted-foreground">Deep Work Blocks</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{verificationPrompts}</div>
                <div className="text-xs text-muted-foreground">Verifications</div>
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {currentSession.verificationStatus === 'verified' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {currentSession.verificationStatus}
                </div>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}