'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Zap, 
  Target, 
  Clock, 
  TrendingUp, 
  Brain, 
  Dumbbell,
  Heart,
  Flame,
  Trophy,
  BarChart3,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface WorkoutRecommendation {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'hiit' | 'recovery' | 'mobility';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string[];
  exercises: Exercise[];
  aiReasoning: string;
  adaptations: string[];
  expectedBenefits: string[];
  restDay: boolean;
  score: number;
}

interface Exercise {
  name: string;
  sets?: number;
  reps?: string;
  duration?: number;
  rest: number;
  intensity: string;
  form_cues: string[];
  modifications: string[];
}

interface UserProfile {
  goal_type: string;
  experience_level: string;
  recent_workouts: any[];
  recovery_score: number;
  available_time: number;
  energy_level: number;
  muscle_soreness: string[];
  preferences: string[];
}

export default function WorkoutRecommendationEngine() {
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutRecommendation | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTimer, setCurrentTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);

  useEffect(() => {
    generateRecommendations();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setCurrentTimer(timer => timer + 1);
      }, 1000);
    } else if (!isTimerActive && currentTimer !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, currentTimer]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockProfile: UserProfile = {
      goal_type: 'muscle_gain',
      experience_level: 'intermediate',
      recent_workouts: [],
      recovery_score: 75,
      available_time: 45,
      energy_level: 80,
      muscle_soreness: ['chest', 'shoulders'],
      preferences: ['compound_movements', 'barbell_exercises']
    };
    
    const mockRecommendations: WorkoutRecommendation[] = [
      {
        id: '1',
        name: 'AI-Optimized Lower Body Power',
        type: 'strength',
        duration: 45,
        difficulty: 'intermediate',
        focus: ['legs', 'glutes', 'core'],
        score: 95,
        restDay: false,
        aiReasoning: 'Based on your recent upper body focus and current recovery metrics, your lower body is optimally primed for high-intensity training. Your 75% recovery score indicates readiness for compound movements.',
        adaptations: [
          'Increased rep ranges due to good energy levels',
          'Added explosive movements based on power goals',
          'Reduced rest times to match conditioning level'
        ],
        expectedBenefits: [
          '+12% lower body strength gain potential',
          'Enhanced neuromuscular coordination',
          'Improved metabolic efficiency'
        ],
        exercises: [
          {
            name: 'Barbell Back Squat',
            sets: 4,
            reps: '6-8',
            rest: 180,
            intensity: 'RPE 8',
            form_cues: ['Chest up', 'Weight through heels', 'Drive knees out'],
            modifications: ['Goblet squat if mobility limited', 'Box squat for depth control']
          },
          {
            name: 'Romanian Deadlift',
            sets: 3,
            reps: '8-10',
            rest: 120,
            intensity: 'RPE 7',
            form_cues: ['Hinge at hips', 'Maintain back arch', 'Feel hamstring stretch'],
            modifications: ['Dumbbell RDL', 'Deficit RDL for range']
          },
          {
            name: 'Bulgarian Split Squats',
            sets: 3,
            reps: '12 each leg',
            rest: 90,
            intensity: 'RPE 8',
            form_cues: ['Front foot flat', 'Descend straight down', 'Drive through front heel'],
            modifications: ['Bodyweight version', 'Rear foot elevated']
          },
          {
            name: 'Jump Squats',
            sets: 3,
            reps: '8-10',
            rest: 60,
            intensity: 'Explosive',
            form_cues: ['Land softly', 'Full hip extension', 'Quick ground contact'],
            modifications: ['Step-ups', 'Half-range if fatigued']
          }
        ]
      },
      {
        id: '2',
        name: 'Active Recovery Flow',
        type: 'recovery',
        duration: 25,
        difficulty: 'beginner',
        focus: ['mobility', 'circulation', 'relaxation'],
        score: 88,
        restDay: true,
        aiReasoning: 'Detected elevated soreness in chest and shoulders. This recovery protocol targets those areas while promoting overall circulation and mental restoration.',
        adaptations: [
          'Extended hold times for tight areas',
          'Added breathing techniques for stress relief',
          'Gentle movements to aid muscle repair'
        ],
        expectedBenefits: [
          'Reduced muscle tension by 40%',
          'Improved sleep quality',
          'Enhanced next-day performance readiness'
        ],
        exercises: [
          {
            name: 'Cat-Cow Stretches',
            duration: 300,
            rest: 30,
            intensity: 'Gentle',
            form_cues: ['Slow controlled movement', 'Full spinal articulation', 'Breathe with movement'],
            modifications: ['Seated version', 'Against wall if floor uncomfortable']
          },
          {
            name: 'Shoulder Circles & Rolls',
            duration: 180,
            rest: 30,
            intensity: 'Very Light',
            form_cues: ['Full range of motion', 'Both directions', 'Relax between sets'],
            modifications: ['Smaller circles if painful', 'Arm swings']
          },
          {
            name: 'Hip Circles',
            duration: 240,
            rest: 45,
            intensity: 'Gentle',
            form_cues: ['Hands on hips', 'Large controlled circles', 'Both directions'],
            modifications: ['Wall support', 'Seated hip flexor stretch']
          }
        ]
      },
      {
        id: '3',
        name: 'HIIT Metabolic Blast',
        type: 'hiit',
        duration: 30,
        difficulty: 'advanced',
        focus: ['conditioning', 'fat_burn', 'mental_toughness'],
        score: 92,
        restDay: false,
        aiReasoning: 'Your high energy levels and good recovery score make this an ideal time for high-intensity training. This protocol maximizes fat oxidation while building mental resilience.',
        adaptations: [
          'Adjusted work/rest ratios for your fitness level',
          'Progressive difficulty throughout workout',
          'Compound movements for maximum efficiency'
        ],
        expectedBenefits: [
          '+25% post-workout calorie burn',
          'Improved VO2 max',
          'Enhanced lactate threshold'
        ],
        exercises: [
          {
            name: 'Burpee to Jump',
            duration: 45,
            rest: 15,
            intensity: 'Max effort',
            form_cues: ['Chest to floor', 'Explosive jump', 'Full body engagement'],
            modifications: ['Step back burpees', 'No jump version']
          },
          {
            name: 'Mountain Climbers',
            duration: 45,
            rest: 15,
            intensity: 'Max effort',
            form_cues: ['Plank position', 'Drive knees to chest', 'Maintain core tension'],
            modifications: ['Slower pace', 'Hands on bench']
          },
          {
            name: 'Jump Squats',
            duration: 45,
            rest: 15,
            intensity: 'Max effort',
            form_cues: ['Full depth', 'Explosive jump', 'Soft landing'],
            modifications: ['Regular squats', 'Pulse squats']
          }
        ]
      }
    ];
    
    setUserProfile(mockProfile);
    setRecommendations(mockRecommendations);
    setIsGenerating(false);
  };

  const startWorkout = (workout: WorkoutRecommendation) => {
    setSelectedWorkout(workout);
    setCurrentExercise(0);
    setCurrentTimer(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell className="w-5 h-5" />;
      case 'cardio': return <Heart className="w-5 h-5" />;
      case 'hiit': return <Zap className="w-5 h-5" />;
      case 'recovery': return <RotateCcw className="w-5 h-5" />;
      case 'mobility': return <Target className="w-5 h-5" />;
      default: return <Flame className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-blue-500';
      case 'cardio': return 'bg-red-500';
      case 'hiit': return 'bg-orange-500';
      case 'recovery': return 'bg-green-500';
      case 'mobility': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (selectedWorkout) {
    const currentEx = selectedWorkout.exercises[currentExercise];
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedWorkout.name}</h2>
                <p className="text-text-secondary">Exercise {currentExercise + 1} of {selectedWorkout.exercises.length}</p>
              </div>
              <div className="text-2xl font-mono text-navy">
                {formatTime(currentTimer)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center p-6 bg-surface rounded-lg">
                <h3 className="text-2xl font-bold text-white mb-2">{currentEx.name}</h3>
                <div className="flex justify-center gap-4 text-text-secondary">
                  {currentEx.sets && <span>{currentEx.sets} sets</span>}
                  {currentEx.reps && <span>{currentEx.reps} reps</span>}
                  {currentEx.duration && <span>{currentEx.duration}s work</span>}
                  <span>{currentEx.rest}s rest</span>
                </div>
                <Badge className="mt-2">{currentEx.intensity}</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Form Cues</h4>
                  <ul className="space-y-1 text-text-secondary">
                    {currentEx.form_cues.map((cue, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-success" />
                        {cue}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Modifications</h4>
                  <ul className="space-y-1 text-text-secondary">
                    {currentEx.modifications.map((mod, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-warning" />
                        {mod}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  className="flex items-center gap-2"
                >
                  {isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isTimerActive ? 'Pause' : 'Start'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentTimer(0)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
                {currentExercise < selectedWorkout.exercises.length - 1 && (
                  <Button
                    onClick={() => {
                      setCurrentExercise(currentExercise + 1);
                      setCurrentTimer(0);
                      setIsTimerActive(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    Next Exercise
                  </Button>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedWorkout(null)}
                >
                  Back to Recommendations
                </Button>
                {currentExercise === selectedWorkout.exercises.length - 1 && (
                  <Button
                    variant="primary"
                    onClick={() => {
                      // Complete workout logic
                      setSelectedWorkout(null);
                    }}
                  >
                    Complete Workout
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Workout Recommendations</h1>
          <p className="text-text-secondary">Personalized workouts powered by machine learning</p>
        </div>
        <Button onClick={generateRecommendations} disabled={isGenerating} className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          {isGenerating ? 'Analyzing...' : 'Regenerate'}
        </Button>
      </div>

      {userProfile && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              AI Analysis
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{userProfile.recovery_score}%</div>
                <div className="text-sm text-text-secondary">Recovery Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-navy">{userProfile.energy_level}%</div>
                <div className="text-sm text-text-secondary">Energy Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{userProfile.available_time}min</div>
                <div className="text-sm text-text-secondary">Available Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userProfile.muscle_soreness.length}</div>
                <div className="text-sm text-text-secondary">Sore Areas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {recommendations.map((workout) => (
          <Card key={workout.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTypeColor(workout.type)}`}>
                    {getTypeIcon(workout.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{workout.name}</h3>
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <Clock className="w-4 h-4" />
                      {workout.duration} min
                      <Badge variant="outline">{workout.difficulty}</Badge>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{workout.score}</div>
                  <div className="text-xs text-text-secondary">AI Score</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Reasoning
                  </h4>
                  <p className="text-text-secondary text-sm">{workout.aiReasoning}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-1">
                      {workout.focus.map((focus) => (
                        <Badge key={focus} variant="secondary" className="text-xs">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Expected Benefits</h4>
                    <ul className="text-text-secondary text-sm space-y-1">
                      {workout.expectedBenefits.slice(0, 2).map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Trophy className="w-3 h-3 text-success" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Exercises ({workout.exercises.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {workout.exercises.map((exercise, idx) => (
                      <div key={idx} className="text-xs text-text-secondary bg-surface p-2 rounded">
                        {exercise.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <div className="text-sm text-text-secondary">
                    Adaptations: {workout.adaptations.length} personalized changes
                  </div>
                  <Button
                    onClick={() => startWorkout(workout)}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Workout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}