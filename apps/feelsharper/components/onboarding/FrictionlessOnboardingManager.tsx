"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import QuickWinFlow from './QuickWinFlow';
import SmartOnboardingWizard from './SmartOnboardingWizard';
import { SocialProofSection } from './SocialProofElements';
import { useGuestMode } from '@/lib/auth/guestMode';
import { useOnboardingAnalytics, useABTest } from '@/lib/analytics/onboardingAnalytics';
import { useActivationSystem, ActivationPatterns } from '@/lib/analytics/activationSystem';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Zap,
  Sparkles,
  ArrowRight,
  Users,
  Target,
  Clock,
  CheckCircle2,
  X,
  ChevronRight,
  Star,
  Trophy,
  Heart
} from 'lucide-react';

type OnboardingFlow = 'quick_win' | 'full_wizard' | 'minimal' | null;

interface FrictionlessOnboardingManagerProps {
  autoStart?: boolean;
  defaultFlow?: OnboardingFlow;
  showSocialProof?: boolean;
  onComplete?: (data: any) => void;
}

export default function FrictionlessOnboardingManager({
  autoStart = false,
  defaultFlow = null,
  showSocialProof = true,
  onComplete
}: FrictionlessOnboardingManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentFlow, setCurrentFlow] = useState<OnboardingFlow>(defaultFlow);
  const [showFlowSelector, setShowFlowSelector] = useState(!autoStart && !defaultFlow);
  const [isVisible, setIsVisible] = useState(false);

  // Hooks
  const { 
    isGuest, 
    startGuestSession, 
    shouldPromptSignup, 
    getSignupPromptMessage,
    stats: guestStats 
  } = useGuestMode();
  
  const {
    startSession,
    completeOnboarding,
    trackQuickWin,
    getCurrentSession
  } = useOnboardingAnalytics();
  
  const { initializeUser, trackEvent, status: activationStatus } = useActivationSystem();
  
  // A/B test for flow preference
  const { variant: flowVariant, config: flowConfig } = useABTest('onboarding_flow');
  const { variant: ctaVariant } = useABTest('quick_win_cta');

  // Initialize on mount
  useEffect(() => {
    setIsVisible(true);
    
    // Start guest session if not already started
    if (!isGuest && !getCurrentSession()) {
      startGuestSession();
    }

    // Initialize activation tracking
    initializeUser(undefined, getCurrentSession()?.sessionId);

    // Auto-select flow based on A/B test
    if (!defaultFlow && autoStart) {
      const flowMap: Record<string, OnboardingFlow> = {
        'minimal': 'quick_win',
        'standard': 'full_wizard',
        'gamified': 'full_wizard'
      };
      setCurrentFlow(flowMap[flowVariant] || 'quick_win');
      setShowFlowSelector(false);
    }

    // Check URL parameters for entry point
    const entryPoint = searchParams?.get('entry');
    if (entryPoint === 'quick_win') {
      setCurrentFlow('quick_win');
      setShowFlowSelector(false);
    }
  }, []);

  // Handle flow selection
  const handleFlowSelect = (flow: OnboardingFlow) => {
    if (!flow) return;

    setCurrentFlow(flow);
    setShowFlowSelector(false);

    // Start analytics session
    const sessionId = startSession('homepage');
    
    // Track flow selection
    trackEvent('onboarding_flow_selected', {
      flow_type: flow,
      variant: flowVariant,
      is_guest: isGuest,
    });

    // Track activation event
    trackEvent('profile_completed', { 
      source: 'onboarding_start',
      flow: flow 
    });
  };

  // Handle quick win completion
  const handleQuickWinComplete = (data: any) => {
    trackQuickWin('completed', data);
    
    // Show signup prompt if criteria met
    if (shouldPromptSignup()) {
      handleSignupPrompt();
    } else {
      // Continue to full onboarding
      setCurrentFlow('full_wizard');
    }
  };

  // Handle signup prompt
  const handleSignupPrompt = () => {
    trackEvent('signup_prompt_shown', {
      trigger: 'quick_win_completion',
      guest_stats: guestStats,
    });

    // Navigate to signup with data preservation
    router.push('/sign-up?preserve_guest_data=true&redirect=/onboarding');
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (data: any) => {
    completeOnboarding(data);
    
    // Track activation
    ActivationPatterns.trackGoalSetting(data);
    
    onComplete?.(data);
    
    // Navigate to dashboard
    router.push('/dashboard');
  };

  // Handle skip
  const handleSkip = () => {
    trackEvent('onboarding_skipped', {
      flow: currentFlow,
      step: 'flow_selector',
    });
    
    router.push('/dashboard');
  };

  if (!isVisible) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AnimatePresence mode="wait">
        {/* Flow Selector */}
        {showFlowSelector && (
          <motion.div
            key="flow-selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="w-full max-w-4xl">
              {/* Social Proof */}
              {showSocialProof && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <SocialProofSection variant="compact" />
                </motion.div>
              )}

              {/* Main Card */}
              <Card className="bg-white/90 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
                      How would you like to start?
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Choose your path to fitness success
                    </p>
                  </div>

                  {/* Flow Options */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Quick Win Option */}
                    <motion.button
                      onClick={() => handleFlowSelect('quick_win')}
                      className="p-6 text-left bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl hover:border-green-300 hover:shadow-xl transition-all duration-300 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          2 minutes
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {ctaVariant === 'workout_focused' ? 'Log Your Last Workout' : 'Quick Start'}
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Get instant AI insights and see your potential in under 2 minutes
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Instant AI coach feedback</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>No signup required</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Immediate value demonstration</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center text-green-600 font-medium group-hover:translate-x-1 transition-transform">
                        <span>Start now</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </motion.button>

                    {/* Full Onboarding Option */}
                    <motion.button
                      onClick={() => handleFlowSelect('full_wizard')}
                      className="p-6 text-left bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:border-purple-300 hover:shadow-xl transition-all duration-300 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          5 minutes
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        Personalized Setup
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Complete setup for a fully customized fitness experience
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          <span>Personalized AI coaching</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          <span>Custom workout plans</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-600" />
                          <span>Goal-specific insights</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center text-purple-600 font-medium group-hover:translate-x-1 transition-transform">
                        <span>Customize everything</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </motion.button>
                  </div>

                  {/* Skip Option */}
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Skip setup and explore
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>4.9/5 rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>50,000+ users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-green-500" />
                    <span>89% success rate</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Quick Win Flow */}
        {currentFlow === 'quick_win' && (
          <motion.div
            key="quick-win"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <QuickWinFlow 
              onComplete={handleQuickWinComplete}
              onSignupPrompt={handleSignupPrompt}
            />
          </motion.div>
        )}

        {/* Full Onboarding Wizard */}
        {currentFlow === 'full_wizard' && (
          <motion.div
            key="full-wizard"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <SmartOnboardingWizard 
              onComplete={handleOnboardingComplete}
              onSkip={() => router.push('/dashboard')}
              showSkipOption={flowConfig.showSkip !== false}
            />
          </motion.div>
        )}

        {/* Minimal Flow */}
        {currentFlow === 'minimal' && (
          <motion.div
            key="minimal"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <Card className="max-w-lg w-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                
                <h1 className="text-2xl font-bold text-slate-800 mb-4">
                  Welcome to FeelSharper!
                </h1>
                <p className="text-slate-600 mb-6">
                  You're all set to start your fitness journey. Let's begin!
                </p>

                <Button
                  onClick={() => handleOnboardingComplete({ flow: 'minimal' })}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                >
                  Start Tracking
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Social Proof (only on flow selector) */}
      {showFlowSelector && showSocialProof && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 right-6 max-w-sm"
        >
          <Card className="border-green-200 bg-green-50 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-green-800">
                    Sarah just completed her first workout!
                  </div>
                  <div className="text-xs text-green-600">2 minutes ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}