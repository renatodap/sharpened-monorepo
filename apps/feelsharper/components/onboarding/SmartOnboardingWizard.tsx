"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Target,
  Dumbbell,
  Heart,
  Sparkles,
  Trophy,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Users,
  Star,
  MessageCircle,
  SkipForward,
  Zap,
  Activity,
  X,
  ChevronRight
} from 'lucide-react';
import { useGuestMode } from '@/lib/auth/guestMode';

interface SmartOnboardingWizardProps {
  onComplete?: (data: any) => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
}

type GoalType = 'weight_loss' | 'muscle_gain' | 'endurance' | 'general_health' | 'sport_specific';
type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

interface OnboardingData {
  goalType: GoalType | null;
  experience: ExperienceLevel | null;
  currentWeight?: number;
  targetWeight?: number;
  workoutsPerWeek?: number;
  timeConstraint?: string;
  motivation?: string;
  aiPreferences: {
    coaching: boolean;
    insights: boolean;
    reminders: boolean;
  };
}

const GOALS = [
  {
    id: 'weight_loss',
    label: 'Lose Weight',
    icon: Target,
    description: 'Burn fat and feel lighter',
    emoji: '🔥',
    color: 'from-orange-500 to-red-500',
    sampleResponse: "I'll create a calorie deficit plan with strength training to preserve muscle while burning fat. Studies show 0.5-2lbs per week is optimal."
  },
  {
    id: 'muscle_gain',
    label: 'Build Muscle',
    icon: Dumbbell,
    description: 'Get stronger and bigger',
    emoji: '💪',
    color: 'from-purple-500 to-indigo-600',
    sampleResponse: "Perfect! I'll design progressive overload workouts with proper nutrition timing. Expect 1-2lbs muscle gain per month with consistency."
  },
  {
    id: 'endurance',
    label: 'Boost Endurance',
    icon: Heart,
    description: 'Run longer, feel better',
    emoji: '❤️',
    color: 'from-pink-500 to-rose-600',
    sampleResponse: "Great choice! I'll build your aerobic base gradually with 80/20 training. Your VO2 max will improve significantly in 12 weeks."
  },
  {
    id: 'general_health',
    label: 'Feel Amazing',
    icon: Sparkles,
    description: 'Total body transformation',
    emoji: '✨',
    color: 'from-blue-500 to-cyan-600',
    sampleResponse: "Excellent! I'll balance strength, cardio, and flexibility. You'll see improvements in energy, sleep, and mood within weeks."
  },
  {
    id: 'sport_specific',
    label: 'Athletic Performance',
    icon: Trophy,
    description: 'Dominate your sport',
    emoji: '🏆',
    color: 'from-yellow-500 to-amber-600',
    sampleResponse: "Let's elevate your game! I'll create sport-specific drills and conditioning to improve power, speed, and reaction time."
  }
];

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    label: 'Just Starting',
    description: 'New to fitness or getting back into it',
    emoji: '🌱',
    color: 'from-green-400 to-green-600',
    samplePlan: 'Start with 3 full-body workouts per week, focusing on form and building habits.'
  },
  {
    id: 'intermediate',
    label: 'Getting Stronger',
    description: 'Regular exercise routine, some experience',
    emoji: '💫',
    color: 'from-blue-400 to-blue-600',
    samplePlan: '4-5 workouts per week with upper/lower split and progressive overload.'
  },
  {
    id: 'advanced',
    label: 'Elite Athlete',
    description: 'Experienced and pushing limits',
    emoji: '🚀',
    color: 'from-purple-600 to-indigo-700',
    samplePlan: 'Periodized training with specialized programs and advanced techniques.'
  }
];

export default function SmartOnboardingWizard({ 
  onComplete, 
  onSkip, 
  showSkipOption = true 
}: SmartOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    goalType: null,
    experience: null,
    aiPreferences: {
      coaching: true,
      insights: true,
      reminders: false,
    }
  });
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [liveStats] = useState({
    activeToday: 1247,
    weeklyGoalHitRate: 89,
    avgRating: 4.9
  });

  const { updatePreferences } = useGuestMode();

  const steps = [
    { title: "What's your main goal?", subtitle: "Let's personalize your journey", optional: false },
    { title: "Your experience level?", subtitle: "Help us tailor your workouts", optional: false },
    { title: "Let's get specific", subtitle: "A few quick details", optional: true },
    { title: "AI Coach Preferences", subtitle: "How can I help you best?", optional: true },
    { title: "You're ready to start!", subtitle: "Let's begin your transformation", optional: false }
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return data.goalType !== null;
      case 1: return data.experience !== null;
      case 2: return true; // Optional step
      case 3: return true; // Optional step
      case 4: return true;
      default: return true;
    }
  };

  const handleGoalSelect = (goal: any) => {
    setData(prev => ({ ...prev, goalType: goal.id as GoalType }));
    setSelectedGoal(goal);
    setShowAiPreview(true);
    updatePreferences({ goalType: goal.id });

    // Track goal selection
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Onboarding Goal Selected', {
        goal_type: goal.id,
        step: currentStep,
        has_ai_preview: true,
      });
    }

    // Auto-advance after showing AI preview
    setTimeout(() => {
      setCurrentStep(1);
      setShowAiPreview(false);
    }, 3000);
  };

  const handleExperienceSelect = (level: any) => {
    setData(prev => ({ ...prev, experience: level.id as ExperienceLevel }));
    updatePreferences({ experience: level.id });

    // Track experience selection
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Onboarding Experience Selected', {
        experience_level: level.id,
        goal_type: data.goalType,
        step: currentStep,
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Track step progression
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.track('Onboarding Step Completed', {
          step: currentStep,
          next_step: currentStep + 1,
          step_name: steps[currentStep].title,
        });
      }
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Onboarding Skipped', {
        step: currentStep,
        goal_selected: !!data.goalType,
        experience_selected: !!data.experience,
      });
    }
    onSkip?.();
  };

  const handleComplete = () => {
    // Save final preferences
    updatePreferences(data);

    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.track('Onboarding Completed', {
        goal_type: data.goalType,
        experience_level: data.experience,
        ai_coaching_enabled: data.aiPreferences.coaching,
        total_steps: currentStep + 1,
      });
    }

    onComplete?.(data);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header with Skip Option */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-slate-600">
            Setup your experience
          </div>
          {showSkipOption && currentStep > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="text-slate-500 hover:text-slate-700"
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Skip for now
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-medium mb-3">
            <span className="text-slate-600">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-blue-600 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
            </motion.div>
          </div>
        </div>

        {/* Live Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-medium">
                      {liveStats.activeToday} people active today
                    </span>
                  </div>
                  <div className="text-slate-400">•</div>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span className="text-slate-700">{liveStats.weeklyGoalHitRate}% hit their weekly goals</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-slate-700 font-medium">{liveStats.avgRating}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0 overflow-hidden">
          <CardContent className="p-8">
            {/* Step Header */}
            <div className="text-center mb-8">
              <motion.h1 
                className="text-3xl md:text-4xl font-bold text-slate-800 mb-3"
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {steps[currentStep].title}
              </motion.h1>
              <motion.p 
                className="text-slate-600 text-lg"
                key={`subtitle-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {steps[currentStep].subtitle}
                {steps[currentStep].optional && (
                  <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
                )}
              </motion.p>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 0: Goal Selection */}
              {currentStep === 0 && (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {GOALS.map((goal) => (
                      <motion.button
                        key={goal.id}
                        onClick={() => handleGoalSelect(goal)}
                        className={`p-6 rounded-2xl text-left transition-all duration-300 transform hover:scale-105 ${
                          data.goalType === goal.id
                            ? `bg-gradient-to-br ${goal.color} text-white shadow-xl scale-105`
                            : 'bg-white border-2 border-slate-200 hover:border-transparent hover:shadow-xl'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-3xl">{goal.emoji}</span>
                          {data.goalType === goal.id && (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <h3 className={`font-bold text-lg mb-2 ${
                          data.goalType === goal.id ? 'text-white' : 'text-slate-800'
                        }`}>
                          {goal.label}
                        </h3>
                        <p className={`text-sm ${
                          data.goalType === goal.id ? 'text-white/90' : 'text-slate-600'
                        }`}>
                          {goal.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>

                  {/* AI Preview */}
                  <AnimatePresence>
                    {showAiPreview && selectedGoal && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="mt-6"
                      >
                        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-bold text-slate-800">Your AI Coach Preview</h3>
                                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                                    AI Powered
                                  </Badge>
                                </div>
                                <p className="text-slate-700 leading-relaxed">
                                  {selectedGoal.sampleResponse}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                                  <Sparkles className="w-4 h-4 text-purple-500" />
                                  <span>Personalizing your plan...</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Step 1: Experience Level */}
              {currentStep === 1 && (
                <motion.div
                  key="experience"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <motion.button
                      key={level.id}
                      onClick={() => handleExperienceSelect(level)}
                      className={`w-full p-6 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                        data.experience === level.id
                          ? `bg-gradient-to-r ${level.color} text-white shadow-xl`
                          : 'bg-white border-2 border-slate-200 hover:border-transparent hover:shadow-lg'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{level.emoji}</span>
                          <div>
                            <h3 className={`font-bold text-lg mb-1 ${
                              data.experience === level.id ? 'text-white' : 'text-slate-800'
                            }`}>
                              {level.label}
                            </h3>
                            <p className={`text-sm mb-2 ${
                              data.experience === level.id ? 'text-white/90' : 'text-slate-600'
                            }`}>
                              {level.description}
                            </p>
                            <div className={`text-xs flex items-center gap-2 ${
                              data.experience === level.id ? 'text-white/80' : 'text-slate-500'
                            }`}>
                              <Target className="w-3 h-3" />
                              <span>{level.samplePlan}</span>
                            </div>
                          </div>
                        </div>
                        {data.experience === level.id && (
                          <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Step 2: Quick Details */}
              {currentStep === 2 && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 max-w-lg mx-auto"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Current Weight (optional)
                      </Label>
                      <Input
                        type="number"
                        placeholder="70"
                        value={data.currentWeight || ''}
                        onChange={(e) => setData(prev => ({ 
                          ...prev, 
                          currentWeight: parseFloat(e.target.value) || undefined 
                        }))}
                        className="text-center"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                        Workouts per week
                      </Label>
                      <div className="grid grid-cols-4 gap-1">
                        {[3, 4, 5, 6].map(num => (
                          <Button
                            key={num}
                            variant={data.workoutsPerWeek === num ? "default" : "outline"}
                            size="sm"
                            onClick={() => setData(prev => ({ ...prev, workoutsPerWeek: num }))}
                            className="h-10"
                          >
                            {num}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                      Time availability
                    </Label>
                    <div className="space-y-2">
                      {[
                        { value: '15-30min', label: '15-30 minutes (busy schedule)' },
                        { value: '30-60min', label: '30-60 minutes (moderate time)' },
                        { value: '60min+', label: '60+ minutes (flexible schedule)' }
                      ].map(option => (
                        <Button
                          key={option.value}
                          variant={data.timeConstraint === option.value ? "default" : "outline"}
                          className="w-full justify-start"
                          onClick={() => setData(prev => ({ ...prev, timeConstraint: option.value }))}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: AI Preferences */}
              {currentStep === 3 && (
                <motion.div
                  key="ai-preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 max-w-2xl mx-auto"
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-slate-600">
                      Customize how your AI coach helps you succeed
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: 'coaching',
                        title: 'Personalized Coaching',
                        description: 'Get workout suggestions and form tips',
                        icon: MessageCircle,
                        color: 'text-blue-600'
                      },
                      {
                        key: 'insights',
                        title: 'Progress Insights',
                        description: 'Weekly analysis and trend spotting',
                        icon: TrendingUp,
                        color: 'text-green-600'
                      },
                      {
                        key: 'reminders',
                        title: 'Smart Reminders',
                        description: 'Gentle nudges to stay on track',
                        icon: Activity,
                        color: 'text-purple-600'
                      }
                    ].map(preference => (
                      <div
                        key={preference.key}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          data.aiPreferences[preference.key as keyof typeof data.aiPreferences]
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                        onClick={() => setData(prev => ({
                          ...prev,
                          aiPreferences: {
                            ...prev.aiPreferences,
                            [preference.key]: !prev.aiPreferences[preference.key as keyof typeof prev.aiPreferences]
                          }
                        }))}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <preference.icon className={`w-6 h-6 ${preference.color}`} />
                            <div>
                              <h3 className="font-semibold text-slate-800">{preference.title}</h3>
                              <p className="text-sm text-slate-600">{preference.description}</p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            data.aiPreferences[preference.key as keyof typeof data.aiPreferences]
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-slate-300'
                          }`}>
                            {data.aiPreferences[preference.key as keyof typeof data.aiPreferences] && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Ready to Start */}
              {currentStep === 4 && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center space-y-6"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                    <Trophy className="w-12 h-12 text-white animate-bounce" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">
                      You're all set! 🎉
                    </h2>
                    <p className="text-slate-600 text-lg mb-6">
                      Your personalized fitness journey starts now
                    </p>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Target className="w-8 h-8 text-blue-600" />
                          <div className="text-left">
                            <div className="font-semibold text-slate-800">Your Goal</div>
                            <div className="text-sm text-slate-600">
                              {GOALS.find(g => g.id === data.goalType)?.label || 'Not specified'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Activity className="w-8 h-8 text-purple-600" />
                          <div className="text-left">
                            <div className="font-semibold text-slate-800">Experience</div>
                            <div className="text-sm text-slate-600">
                              {EXPERIENCE_LEVELS.find(e => e.id === data.experience)?.label || 'Not specified'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleComplete}
                      className="w-full max-w-md bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 text-lg font-semibold"
                    >
                      Start My Journey
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    
                    <p className="text-xs text-slate-500">
                      Ready to transform your fitness in just minutes a day
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            {currentStep < 4 && (
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={currentStep === 0 ? "invisible" : ""}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`px-8 py-3 ${
                    canProceed()
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}