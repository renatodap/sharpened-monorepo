"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Dumbbell,
  Zap,
  TrendingUp,
  ArrowRight,
  Clock,
  Target,
  Sparkles,
  CheckCircle2,
  Users,
  MessageCircle,
  ChevronRight,
  Star,
  Heart,
  Trophy,
  Timer
} from 'lucide-react';
import { useGuestMode } from '@/lib/auth/guestMode';

interface QuickWinFlowProps {
  onComplete?: (data: any) => void;
  onSignupPrompt?: () => void;
}

const SAMPLE_WORKOUTS = [
  {
    id: 1,
    name: "Push Day",
    exercises: ["Bench Press", "Shoulder Press", "Push-ups"],
    duration: 45,
    type: "strength"
  },
  {
    id: 2,
    name: "30min Run",
    exercises: ["Jogging"],
    duration: 30,
    type: "cardio"
  },
  {
    id: 3,
    name: "Upper Body",
    exercises: ["Pull-ups", "Rows", "Bicep Curls"],
    duration: 35,
    type: "strength"
  },
  {
    id: 4,
    name: "HIIT Session",
    exercises: ["Burpees", "Jump Squats", "Mountain Climbers"],
    duration: 20,
    type: "hiit"
  }
];

const AI_RESPONSES = {
  strength: {
    insight: "Great strength session! Your progressive overload is key to muscle growth.",
    tips: [
      "Try increasing weight by 2.5kg next time",
      "Focus on 2-second negatives for better gains",
      "Consider adding a superset to maximize time"
    ],
    nextWorkout: "Tomorrow: Rest day or light cardio for recovery"
  },
  cardio: {
    insight: "Excellent cardio work! Your endurance is building steadily.",
    tips: [
      "Your pace was consistent - perfect for building aerobic base",
      "Try adding 5 minutes next week for progression",
      "Consider interval training to boost VO2 max"
    ],
    nextWorkout: "Next: Upper body strength to balance your training"
  },
  hiit: {
    insight: "Intense HIIT session! Your metabolic conditioning is improving.",
    tips: [
      "20 minutes of HIIT burns calories for 24+ hours",
      "Your work-to-rest ratio was optimal for fat loss",
      "Recovery is crucial - hydrate well tonight"
    ],
    nextWorkout: "Tomorrow: Active recovery with light yoga or walking"
  }
};

export default function QuickWinFlow({ onComplete, onSignupPrompt }: QuickWinFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSocialProof, setShowSocialProof] = useState(false);
  
  const { isGuest, addWorkout, addCoachResponse, shouldPromptSignup, getSignupPromptMessage } = useGuestMode();

  const steps = [
    { title: "Log Your Last Workout", subtitle: "Get instant AI insights" },
    { title: "Your Personalized Analysis", subtitle: "See what your AI coach thinks" },
    { title: "Ready for More?", subtitle: "Unlock your full potential" }
  ];

  // Show social proof after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSocialProof(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleWorkoutSelect = async (workout: any) => {
    setSelectedWorkout(workout);
    setIsProcessing(true);

    // Add to guest mode
    addWorkout({
      name: workout.name,
      exercises: workout.exercises,
      duration: workout.duration,
      type: workout.type,
    });

    // Track quick win engagement
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Quick Win Workout Selected', {
        workout_type: workout.type,
        workout_name: workout.name,
        is_guest: isGuest,
        step: 'workout_selection',
      });
    }

    // Simulate AI processing
    setTimeout(() => {
      const response = AI_RESPONSES[workout.type as keyof typeof AI_RESPONSES] || AI_RESPONSES.strength;
      setAiResponse(response);
      addCoachResponse(response);
      setIsProcessing(false);
      setCurrentStep(1);
    }, 2500);
  };

  const handleContinueToInsights = () => {
    setCurrentStep(2);
    
    // Track progression to signup prompt
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Quick Win Continue Clicked', {
        workout_type: selectedWorkout?.type,
        ai_response_shown: !!aiResponse,
        should_prompt_signup: shouldPromptSignup(),
      });
    }
  };

  const handleSignupClick = () => {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Quick Win Signup Clicked', {
        entry_point: 'quick_win_flow',
        workout_logged: !!selectedWorkout,
        ai_insights_viewed: !!aiResponse,
      });
    }
    
    onSignupPrompt?.();
  };

  const liveStats = {
    todayUsers: 247,
    thisWeekWorkouts: 12847,
    avgRating: 4.9
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium mb-3">
            <span className="text-slate-600">Quick Start</span>
            <span className="text-blue-600 font-bold">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Social Proof Banner */}
        <AnimatePresence>
          {showSocialProof && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-700 font-medium">{liveStats.todayUsers} people joined today</span>
                      </div>
                      <div className="text-slate-600">•</div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-slate-700">{liveStats.avgRating} rating</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Card */}
        <Card className="bg-white/80 backdrop-blur-lg shadow-2xl border-0">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1 
                className="text-3xl font-bold text-slate-800 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {steps[currentStep].title}
              </motion.h1>
              <motion.p 
                className="text-slate-600 text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {steps[currentStep].subtitle}
              </motion.p>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Workout Selection */}
              {currentStep === 0 && (
                <motion.div
                  key="workout-selection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <p className="text-slate-600">
                      Select your last workout to see what your AI coach thinks
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {SAMPLE_WORKOUTS.map((workout) => (
                      <motion.button
                        key={workout.id}
                        onClick={() => handleWorkoutSelect(workout)}
                        className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            workout.type === 'strength' ? 'bg-purple-100' :
                            workout.type === 'cardio' ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            <Dumbbell className={`w-5 h-5 ${
                              workout.type === 'strength' ? 'text-purple-600' :
                              workout.type === 'cardio' ? 'text-green-600' : 'text-orange-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">
                              {workout.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="w-4 h-4" />
                              <span>{workout.duration} min</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-slate-600">
                          {workout.exercises.slice(0, 2).join(", ")}
                          {workout.exercises.length > 2 && ` +${workout.exercises.length - 2} more`}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-sm text-slate-500">
                      No signup required • Get instant insights
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: AI Response */}
              {currentStep === 1 && (
                <motion.div
                  key="ai-response"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {isProcessing ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Analyzing your workout...</p>
                        <p className="text-sm text-slate-600">Your AI coach is reviewing {selectedWorkout?.name}</p>
                      </div>
                      <div className="flex justify-center">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-blue-500 rounded-full"
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : aiResponse && (
                    <div className="space-y-6">
                      {/* Workout Summary */}
                      <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                              <Dumbbell className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800">{selectedWorkout.name}</h3>
                              <p className="text-sm text-slate-600">{selectedWorkout.duration} minutes • {selectedWorkout.type}</p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                          </div>
                        </CardContent>
                      </Card>

                      {/* AI Insight */}
                      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                Your AI Coach Says
                                <Badge variant="outline" className="text-xs">AI Powered</Badge>
                              </h3>
                              <p className="text-slate-700 font-medium mb-4">
                                {aiResponse.insight}
                              </p>
                              <div className="space-y-2">
                                {aiResponse.tips.map((tip: string, index: number) => (
                                  <div key={index} className="flex items-start gap-2 text-sm">
                                    <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-slate-600">{tip}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-4 p-3 bg-white/50 rounded-lg">
                                <div className="flex items-center gap-2 text-sm">
                                  <Timer className="w-4 h-4 text-green-600" />
                                  <span className="font-medium text-slate-700">Next: </span>
                                  <span className="text-slate-600">{aiResponse.nextWorkout}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                            <div className="text-lg font-bold text-slate-800">+12%</div>
                            <div className="text-xs text-slate-600">vs last week</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                            <div className="text-lg font-bold text-slate-800">385</div>
                            <div className="text-xs text-slate-600">calories burned</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                            <div className="text-lg font-bold text-slate-800">3</div>
                            <div className="text-xs text-slate-600">streak days</div>
                          </CardContent>
                        </Card>
                      </div>

                      <Button 
                        onClick={handleContinueToInsights}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                      >
                        <span>See More Insights</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Signup Prompt */}
              {currentStep === 2 && (
                <motion.div
                  key="signup-prompt"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 text-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="w-10 h-10 text-white animate-pulse" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                      {getSignupPromptMessage()}
                    </h2>
                    <p className="text-slate-600 mb-6">
                      Save your progress and unlock personalized workout plans, nutrition tracking, and unlimited AI coaching.
                    </p>
                  </div>

                  {/* Feature Preview */}
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    {[
                      { icon: MessageCircle, text: "Unlimited AI coach conversations", premium: false },
                      { icon: TrendingUp, text: "Advanced progress analytics", premium: false },
                      { icon: Target, text: "Personalized workout programs", premium: true },
                      { icon: Users, text: "Join 50,000+ fitness enthusiasts", premium: false },
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <feature.icon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-slate-700 flex-1 text-left">{feature.text}</span>
                        {feature.premium && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={handleSignupClick}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 text-lg font-semibold"
                    >
                      Create Free Account
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                    
                    <p className="text-xs text-slate-500">
                      Free forever • No credit card required • 2 minute setup
                    </p>
                  </div>

                  {/* Social Proof */}
                  <Card className="border-green-200 bg-green-50 mt-6">
                    <CardContent className="p-4">
                      <div className="text-sm text-green-800">
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <div className="font-bold">{liveStats.thisWeekWorkouts.toLocaleString()}</div>
                            <div>workouts this week</div>
                          </div>
                          <div className="text-green-600">•</div>
                          <div className="text-center">
                            <div className="font-bold">{liveStats.todayUsers}</div>
                            <div>joined today</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}