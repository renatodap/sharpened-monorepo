// A/B Testing configuration for landing page variants
// Optimized for 15%+ conversion rates with multiple test scenarios

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // Percentage of traffic (0-100)
  config: {
    headline?: string;
    subheadline?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
    urgencyText?: string;
    pricing?: {
      showDiscount: boolean;
      discountAmount?: string;
      urgencyTimer?: boolean;
    };
    socialProof?: {
      userCount?: string;
      testimonialSet?: 'set1' | 'set2' | 'set3';
    };
  };
}

export interface LandingPageTest {
  testId: string;
  name: string;
  description: string;
  landingPage: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate?: string;
  endDate?: string;
  variants: ABTestVariant[];
  conversionGoals: string[];
  targetSampleSize?: number;
}

// Test configurations for each landing page variant
export const landingPageTests: Record<string, LandingPageTest[]> = {
  'fitness-tracker': [
    {
      testId: 'ft-headline-test-01',
      name: 'Headline Emphasis Test',
      description: 'Testing different value propositions in headlines',
      landingPage: '/land/fitness-tracker',
      status: 'running',
      variants: [
        {
          id: 'ft-h1-control',
          name: 'Control: Track Everything',
          weight: 25,
          config: {
            headline: 'Track Every Workout, Meal & Progress',
            subheadline: 'The most comprehensive fitness tracker that actually makes logging enjoyable.',
            ctaPrimary: 'Start Tracking Free',
            ctaSecondary: 'See How It Works'
          }
        },
        {
          id: 'ft-h1-speed',
          name: 'Speed Focus',
          weight: 25,
          config: {
            headline: 'Log Workouts in 30 Seconds',
            subheadline: 'Finally, a fitness tracker that doesn\'t waste your time. Quick logging, powerful insights.',
            ctaPrimary: 'Try Quick Logging',
            ctaSecondary: 'Watch Demo'
          }
        },
        {
          id: 'ft-h1-results',
          name: 'Results Focus',
          weight: 25,
          config: {
            headline: 'See Real Progress, Not Just Numbers',
            subheadline: 'Transform scattered data into clear insights that drive your fitness forward.',
            ctaPrimary: 'See My Progress',
            ctaSecondary: 'View Sample Reports'
          }
        },
        {
          id: 'ft-h1-simplicity',
          name: 'Simplicity Focus',
          weight: 25,
          config: {
            headline: 'Fitness Tracking That Just Works',
            subheadline: 'No complicated setup. No overwhelming features. Just simple, effective progress tracking.',
            ctaPrimary: 'Start Simple Setup',
            ctaSecondary: 'Learn More'
          }
        }
      ],
      conversionGoals: ['signup', 'onboarding_complete', 'first_workout_logged'],
      targetSampleSize: 1000
    },
    {
      testId: 'ft-pricing-urgency-01',
      name: 'Pricing Urgency Test',
      description: 'Testing urgency messaging on pricing conversion',
      landingPage: '/land/fitness-tracker',
      status: 'running',
      variants: [
        {
          id: 'ft-p1-control',
          name: 'No Urgency',
          weight: 33,
          config: {
            pricing: {
              showDiscount: false,
              urgencyTimer: false
            }
          }
        },
        {
          id: 'ft-p1-discount',
          name: 'Limited Time Discount',
          weight: 33,
          config: {
            urgencyText: '🔥 Early Bird Special: 50% off premium features',
            pricing: {
              showDiscount: true,
              discountAmount: '50%',
              urgencyTimer: false
            }
          }
        },
        {
          id: 'ft-p1-timer',
          name: 'Countdown Timer',
          weight: 34,
          config: {
            urgencyText: '⏰ Special offer expires in:',
            pricing: {
              showDiscount: true,
              discountAmount: '30%',
              urgencyTimer: true
            }
          }
        }
      ],
      conversionGoals: ['premium_signup', 'payment_complete'],
      targetSampleSize: 800
    }
  ],

  'ai-coach': [
    {
      testId: 'ac-value-prop-01',
      name: 'AI Value Proposition Test',
      description: 'Testing AI coaching benefits messaging',
      landingPage: '/land/ai-coach',
      status: 'running',
      variants: [
        {
          id: 'ac-v1-personal',
          name: 'Personal Trainer Focus',
          weight: 50,
          config: {
            headline: 'Your AI Personal Trainer, 24/7',
            subheadline: 'Get personalized workout plans, nutrition advice, and real-time coaching from advanced AI.',
            ctaPrimary: 'Meet My AI Coach',
            ctaSecondary: 'See AI in Action'
          }
        },
        {
          id: 'ac-v1-intelligence',
          name: 'Intelligence Focus',
          weight: 50,
          config: {
            headline: 'Smarter Fitness with AI Insights',
            subheadline: 'Advanced algorithms analyze your progress and adapt your plan for optimal results.',
            ctaPrimary: 'Activate AI Analysis',
            ctaSecondary: 'View Intelligence'
          }
        }
      ],
      conversionGoals: ['ai_feature_signup', 'first_ai_interaction'],
      targetSampleSize: 600
    }
  ],

  'natural-language': [
    {
      testId: 'nl-ease-test-01',
      name: 'Ease of Use Messaging',
      description: 'Testing natural language benefit communication',
      landingPage: '/land/natural-language',
      status: 'running',
      variants: [
        {
          id: 'nl-e1-conversation',
          name: 'Conversation Focus',
          weight: 33,
          config: {
            headline: 'Just Tell Us What You Did',
            subheadline: 'Type "ran 3 miles" or "bench pressed 185 x 8" and we\'ll handle the rest.',
            ctaPrimary: 'Try Natural Logging',
            ctaSecondary: 'See Examples'
          }
        },
        {
          id: 'nl-e1-speed',
          name: 'Speed Focus',
          weight: 33,
          config: {
            headline: 'Log Workouts 10x Faster',
            subheadline: 'No forms, dropdowns, or complicated menus. Just natural language that works.',
            ctaPrimary: 'Start Fast Logging',
            ctaSecondary: 'Compare Methods'
          }
        },
        {
          id: 'nl-e1-natural',
          name: 'Natural Focus',
          weight: 34,
          config: {
            headline: 'Fitness Tracking That Speaks Your Language',
            subheadline: 'Log workouts the way you think about them - in plain English.',
            ctaPrimary: 'Try Speaking Naturally',
            ctaSecondary: 'Watch Demo'
          }
        }
      ],
      conversionGoals: ['natural_language_signup', 'first_natural_log'],
      targetSampleSize: 500
    }
  ],

  'social': [
    {
      testId: 'soc-community-01',
      name: 'Community Value Test',
      description: 'Testing social/community benefits messaging',
      landingPage: '/land/social',
      status: 'running',
      variants: [
        {
          id: 'soc-c1-motivation',
          name: 'Motivation Focus',
          weight: 50,
          config: {
            headline: 'Stay Motivated with Friends',
            subheadline: 'Join challenges, share progress, and achieve goals together with our fitness community.',
            ctaPrimary: 'Join the Community',
            ctaSecondary: 'See Challenges'
          }
        },
        {
          id: 'soc-c1-accountability',
          name: 'Accountability Focus',
          weight: 50,
          config: {
            headline: 'Accountability That Actually Works',
            subheadline: 'Connect with workout partners and tracking buddies who keep you on track.',
            ctaPrimary: 'Find My Accountability Partner',
            ctaSecondary: 'Learn How'
          }
        }
      ],
      conversionGoals: ['social_signup', 'first_friend_connect', 'first_challenge_join'],
      targetSampleSize: 400
    }
  ],

  'transform': [
    {
      testId: 'tr-transformation-01',
      name: 'Transformation Proof Test',
      description: 'Testing transformation story effectiveness',
      landingPage: '/land/transform',
      status: 'running',
      variants: [
        {
          id: 'tr-t1-before-after',
          name: 'Before/After Focus',
          weight: 50,
          config: {
            headline: 'Real Transformations, Real Results',
            subheadline: 'See how FeelSharper users achieved their fitness goals with data-driven progress tracking.',
            ctaPrimary: 'Start My Transformation',
            ctaSecondary: 'View Success Stories',
            socialProof: {
              userCount: '10,000+',
              testimonialSet: 'set1'
            }
          }
        },
        {
          id: 'tr-t1-journey',
          name: 'Journey Focus',
          weight: 50,
          config: {
            headline: 'Your Fitness Journey Starts Here',
            subheadline: 'Join thousands who transformed their health with consistent tracking and smart insights.',
            ctaPrimary: 'Begin My Journey',
            ctaSecondary: 'Read Their Stories',
            socialProof: {
              userCount: '50,000+',
              testimonialSet: 'set2'
            }
          }
        }
      ],
      conversionGoals: ['transformation_signup', 'goal_setting_complete'],
      targetSampleSize: 600
    }
  ]
};

// Analytics event tracking for A/B tests
export const trackABTestEvent = (
  testId: string,
  variantId: string,
  eventName: string,
  properties?: Record<string, any>
) => {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, {
        ab_test_id: testId,
        ab_variant_id: variantId,
        event_category: 'ab_test',
        ...properties
      });
    }

    // Custom analytics (PostHog, Mixpanel, etc.)
    if ((window as any).posthog) {
      (window as any).posthog.capture(eventName, {
        ab_test_id: testId,
        ab_variant_id: variantId,
        ...properties
      });
    }

    // Store in localStorage for session tracking
    const sessionData = {
      testId,
      variantId,
      events: JSON.parse(localStorage.getItem('ab_test_events') || '[]')
    };
    sessionData.events.push({
      event: eventName,
      timestamp: Date.now(),
      properties
    });
    localStorage.setItem('ab_test_events', JSON.stringify(sessionData.events));
  }
};

// Get variant for user (with persistent assignment)
export const getABTestVariant = (testId: string): ABTestVariant | null => {
  if (typeof window === 'undefined') return null;

  // Check for existing assignment
  const storageKey = `ab_test_${testId}`;
  const existingVariant = localStorage.getItem(storageKey);
  
  if (existingVariant) {
    const test = Object.values(landingPageTests)
      .flat()
      .find(t => t.testId === testId);
    
    if (test) {
      const variant = test.variants.find(v => v.id === existingVariant);
      if (variant) return variant;
    }
  }

  // Assign new variant based on weights
  const test = Object.values(landingPageTests)
    .flat()
    .find(t => t.testId === testId);

  if (!test || test.status !== 'running') return null;

  const random = Math.random() * 100;
  let cumulative = 0;

  for (const variant of test.variants) {
    cumulative += variant.weight;
    if (random <= cumulative) {
      localStorage.setItem(storageKey, variant.id);
      trackABTestEvent(testId, variant.id, 'ab_test_assigned');
      return variant;
    }
  }

  // Fallback to first variant
  const fallback = test.variants[0];
  localStorage.setItem(storageKey, fallback.id);
  trackABTestEvent(testId, fallback.id, 'ab_test_assigned');
  return fallback;
};

// UTM parameter handling for external traffic source tracking
export const getUTMParams = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(param => {
    const value = urlParams.get(param);
    if (value) utmParams[param] = value;
  });

  return utmParams;
};

// Store UTM parameters for attribution tracking
export const storeUTMAttribution = () => {
  if (typeof window === 'undefined') return;

  const utmParams = getUTMParams();
  if (Object.keys(utmParams).length > 0) {
    localStorage.setItem('utm_attribution', JSON.stringify({
      ...utmParams,
      timestamp: Date.now(),
      landing_page: window.location.pathname
    }));
  }
};