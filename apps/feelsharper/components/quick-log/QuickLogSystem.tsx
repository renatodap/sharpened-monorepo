// 1-Tap Quick Logging System - Based on Market Intelligence
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Camera,
  Scale,
  Dumbbell,
  Utensils,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  TrendingUp,
  Timer
} from 'lucide-react';

interface QuickLogEntry {
  type: 'weight' | 'meal' | 'workout';
  timestamp: Date;
  timeToLog: number; // milliseconds
  method: '1-tap' | 'photo' | 'manual';
  data: any;
  confidence?: number;
  needsVerification?: boolean;
}

interface MealTemplate {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  lastUsed: Date;
  useCount: number;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: any[];
  duration: number;
  lastUsed: Date;
  useCount: number;
}

export function QuickLogSystem() {
  const [logStartTime, setLogStartTime] = useState<number | null>(null);
  const [recentLogs, setRecentLogs] = useState<QuickLogEntry[]>([]);
  const [mealTemplates, setMealTemplates] = useState<MealTemplate[]>([
    {
      id: 'breakfast1',
      name: 'Oatmeal & Eggs',
      calories: 450,
      protein: 28,
      carbs: 52,
      fat: 12,
      lastUsed: new Date(Date.now() - 86400000),
      useCount: 15,
    },
    {
      id: 'lunch1',
      name: 'Chicken & Rice',
      calories: 650,
      protein: 45,
      carbs: 68,
      fat: 18,
      lastUsed: new Date(Date.now() - 172800000),
      useCount: 22,
    },
  ]);
  const [workoutTemplates, setWorkoutTemplates] = useState<WorkoutTemplate[]>([
    {
      id: 'push1',
      name: 'Push Day A',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 8 },
        { name: 'Shoulder Press', sets: 3, reps: 10 },
        { name: 'Dips', sets: 3, reps: 12 },
      ],
      duration: 45,
      lastUsed: new Date(Date.now() - 259200000),
      useCount: 8,
    },
  ]);
  const [currentWeight, setCurrentWeight] = useState(70.5);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [quickStats, setQuickStats] = useState({
    caloriesRemaining: 850,
    proteinGap: 32,
    todayVsAvg: '+12%',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraStreamRef = useRef<HTMLVideoElement>(null);

  // Success metrics from MARKET_KNOWLEDGE.md
  const TARGET_TTF_MEAL = 12000; // 12 seconds
  const TARGET_TTF_WEIGHT = 4000; // 4 seconds
  const TARGET_1TAP_RATE = 0.6; // 60% of logs via 1-tap/photo

  // Start timing when user initiates log
  const startLogTimer = () => {
    setLogStartTime(Date.now());
  };

  // Complete log and track time
  const completeLog = (type: QuickLogEntry['type'], method: QuickLogEntry['method'], data: any, confidence?: number) => {
    const timeToLog = logStartTime ? Date.now() - logStartTime : 0;
    
    const entry: QuickLogEntry = {
      type,
      timestamp: new Date(),
      timeToLog,
      method,
      data,
      confidence,
      needsVerification: confidence && confidence < 0.8,
    };

    setRecentLogs([entry, ...recentLogs.slice(0, 4)]);
    setLogStartTime(null);

    // Show success feedback
    showQuickFeedback(type, timeToLog);

    // Update quick insights
    updateQuickInsights(type, data);
  };

  // 1-TAP WEIGHT LOGGING
  const logWeight = () => {
    startLogTimer();
    // Instant log with last known weight
    completeLog('weight', '1-tap', { weight: currentWeight });
  };

  const adjustWeight = (delta: number) => {
    startLogTimer();
    const newWeight = currentWeight + delta;
    setCurrentWeight(newWeight);
    completeLog('weight', '1-tap', { weight: newWeight });
  };

  // 1-TAP MEAL REPEAT
  const repeatMeal = (template: MealTemplate) => {
    startLogTimer();
    completeLog('meal', '1-tap', template);
    
    // Update template usage
    template.lastUsed = new Date();
    template.useCount++;
  };

  // PHOTO MEAL LOGGING
  const startPhotoCapture = () => {
    startLogTimer();
    fileInputRef.current?.click();
  };

  const processPhoto = async (file: File) => {
    setPhotoProcessing(true);
    
    try {
      // Simulate AI processing (in production, would call actual API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI results with confidence
      const aiResult = {
        items: [
          { name: 'Grilled Chicken', amount: '150g', calories: 248, protein: 46, confidence: 0.92 },
          { name: 'Brown Rice', amount: '200g', calories: 218, protein: 5, confidence: 0.85 },
          { name: 'Broccoli', amount: '100g', calories: 35, protein: 3, confidence: 0.78 },
        ],
        totalCalories: 501,
        totalProtein: 54,
        totalCarbs: 48,
        totalFat: 8,
        overallConfidence: 0.85,
      };

      completeLog('meal', 'photo', aiResult, aiResult.overallConfidence);
      
      // Flag for human verification if confidence is low
      if (aiResult.overallConfidence < 0.8) {
        queueForVerification(aiResult);
      }
    } finally {
      setPhotoProcessing(false);
    }
  };

  // 1-TAP WORKOUT REPEAT
  const repeatWorkout = (template: WorkoutTemplate) => {
    startLogTimer();
    completeLog('workout', '1-tap', template);
    
    template.lastUsed = new Date();
    template.useCount++;
  };

  // Queue low-confidence items for human verification
  const queueForVerification = (data: any) => {
    // In production, would send to verification queue
    console.log('Queued for human verification:', data);
  };

  // Show quick feedback after logging
  const showQuickFeedback = (type: string, timeToLog: number) => {
    const targetTime = type === 'weight' ? TARGET_TTF_WEIGHT : TARGET_TTF_MEAL;
    const wasQuick = timeToLog < targetTime;
    
    // Trigger celebration if beat target time
    if (wasQuick) {
      window.dispatchEvent(new CustomEvent('quick-log-success', {
        detail: { type, timeToLog }
      }));
    }
  };

  // Update quick insights after log
  const updateQuickInsights = (type: string, data: any) => {
    if (type === 'meal') {
      setQuickStats(prev => ({
        ...prev,
        caloriesRemaining: prev.caloriesRemaining - (data.calories || data.totalCalories || 0),
        proteinGap: Math.max(0, prev.proteinGap - (data.protein || data.totalProtein || 0)),
      }));
    }
  };

  // Smart prompts based on time of day
  const getSmartPrompt = () => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 10) {
      return { text: "Log breakfast?", template: mealTemplates[0] };
    } else if (hour >= 11 && hour < 14) {
      return { text: "Log lunch?", template: mealTemplates[1] };
    } else if (hour >= 17 && hour < 20) {
      return { text: "Log dinner?", template: null };
    } else if (hour >= 14 && hour < 17) {
      return { text: "Afternoon workout?", template: workoutTemplates[0] };
    }
    return null;
  };

  const smartPrompt = getSmartPrompt();

  // Calculate logging efficiency metrics
  const getLoggingMetrics = () => {
    const total = recentLogs.length;
    const oneTapCount = recentLogs.filter(l => l.method === '1-tap').length;
    const photoCount = recentLogs.filter(l => l.method === 'photo').length;
    const avgTime = total > 0 
      ? recentLogs.reduce((sum, l) => sum + l.timeToLog, 0) / total 
      : 0;
    
    return {
      oneTapRate: total > 0 ? oneTapCount / total : 0,
      photoRate: total > 0 ? photoCount / total : 0,
      avgTimeMs: avgTime,
      meetsTarget: avgTime > 0 && avgTime < TARGET_TTF_MEAL,
    };
  };

  const metrics = getLoggingMetrics();

  return (
    <div className="space-y-4">
      {/* Quick Actions Grid - PRIMARY INTERFACE */}
      <div className="grid grid-cols-2 gap-3">
        {/* Weight Quick Log */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Weight</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {currentWeight} kg
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => adjustWeight(-0.1)}
                className="flex-1"
              >
                -0.1
              </Button>
              <Button 
                size="sm"
                onClick={logWeight}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Log
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => adjustWeight(0.1)}
                className="flex-1"
              >
                +0.1
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Last: Today 7:00 AM
            </div>
          </CardContent>
        </Card>

        {/* Meal Photo Capture */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-green-500" />
                <span className="font-medium">Meal</span>
              </div>
              {photoProcessing && (
                <Badge variant="outline" className="text-xs">
                  <Timer className="h-3 w-3 mr-1 animate-spin" />
                  Processing...
                </Badge>
              )}
            </div>
            <Button 
              onClick={startPhotoCapture}
              disabled={photoProcessing}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <Camera className="h-4 w-4 mr-2" />
              Photo Log
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processPhoto(file);
              }}
            />
            <div className="text-xs text-muted-foreground mt-2">
              AI parse + verify
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Prompt - Time-based suggestions */}
      {smartPrompt && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">{smartPrompt.text}</span>
              </div>
              {smartPrompt.template && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => repeatMeal(smartPrompt.template)}
                  className="bg-white"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Repeat {smartPrompt.template.name}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Templates - 1-Tap Repeats */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Quick Repeat</h3>
        
        {/* Recent Meals */}
        <div className="grid grid-cols-2 gap-2">
          {mealTemplates.slice(0, 2).map(template => (
            <Button
              key={template.id}
              variant="outline"
              className="justify-start h-auto p-3"
              onClick={() => repeatMeal(template)}
            >
              <div className="text-left">
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-muted-foreground">
                  {template.calories} cal • {template.protein}g protein
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Recent Workout */}
        {workoutTemplates.length > 0 && (
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-3"
            onClick={() => repeatWorkout(workoutTemplates[0])}
          >
            <Dumbbell className="h-4 w-4 mr-2 text-purple-500" />
            <div className="text-left flex-1">
              <div className="font-medium text-sm">{workoutTemplates[0].name}</div>
              <div className="text-xs text-muted-foreground">
                {workoutTemplates[0].exercises.length} exercises • {workoutTemplates[0].duration} min
              </div>
            </div>
          </Button>
        )}
      </div>

      {/* Quick Insights - Post-log feedback */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Quick Insights</span>
            <Zap className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold">{quickStats.caloriesRemaining}</div>
              <div className="text-xs text-muted-foreground">Cal remaining</div>
            </div>
            <div>
              <div className="text-lg font-bold">{quickStats.proteinGap}g</div>
              <div className="text-xs text-muted-foreground">Protein gap</div>
            </div>
            <div>
              <div className="text-lg font-bold flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                {quickStats.todayVsAvg}
              </div>
              <div className="text-xs text-muted-foreground">vs 7-day avg</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logging Efficiency Metrics (Dev Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>1-Tap Rate:</span>
                <span className={metrics.oneTapRate >= TARGET_1TAP_RATE ? 'text-green-500' : 'text-red-500'}>
                  {(metrics.oneTapRate * 100).toFixed(0)}% (target: 60%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Avg Time to Log:</span>
                <span className={metrics.meetsTarget ? 'text-green-500' : 'text-red-500'}>
                  {(metrics.avgTimeMs / 1000).toFixed(1)}s (target: &lt;12s)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Parse Confidence:</span>
                <span>85% avg</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}