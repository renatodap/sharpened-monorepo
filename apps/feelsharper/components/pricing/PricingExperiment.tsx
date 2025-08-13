/**
 * Pricing Experiment Component
 * 
 * A/B tests different pricing strategies including:
 * - Price points ($7.99 vs $9.99 vs $12.99)
 * - Annual discount strategies (% vs months free)
 * - Feature gating experiments
 * - Urgency and social proof elements
 */

'use client';

import { useState, useEffect } from 'react';
import { usePricingExperiment } from '@/lib/ab-testing/hooks';
import { PricingButton, FreePlanButton } from './PricingButtons';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface PricingExperimentProps {
  experimentSlug?: string;
  onPlanSelect?: (plan: 'free' | 'monthly' | 'annual') => void;
  showFreePlan?: boolean;
  showAnnualOption?: boolean;
  className?: string;
}

export function PricingExperiment({
  experimentSlug = 'pricing_optimization_2025',
  onPlanSelect,
  showFreePlan = true,
  showAnnualOption = true,
  className = ''
}: PricingExperimentProps) {
  const experiment = usePricingExperiment(experimentSlug);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Track pricing page view
  useEffect(() => {
    if (experiment.isInExperiment && !experiment.loading) {
      experiment.recordConversion('pricing_page_viewed', {
        eventProperties: {
          variant_key: experiment.variant,
          billing_cycle: billingCycle,
          monthly_price: experiment.pricing?.monthlyPrice,
          annual_discount: experiment.pricing?.annualDiscount
        }
      });
    }
  }, [experiment.isInExperiment, experiment.loading, billingCycle]);

  // Handle urgency countdown
  useEffect(() => {
    if (!experiment.pricing?.discountExpiresAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const expiry = new Date(experiment.pricing!.discountExpiresAt!).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft('');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [experiment.pricing?.discountExpiresAt]);

  const handlePlanSelect = async (plan: 'free' | 'monthly' | 'annual') => {
    // Track plan selection
    if (experiment.isInExperiment) {
      await experiment.recordConversion('plan_selected', {
        eventProperties: {
          plan_type: plan,
          variant_key: experiment.variant,
          monthly_price: experiment.pricing?.monthlyPrice,
          annual_price: plan === 'annual' ? experiment.getAnnualPrice() : undefined
        }
      });
    }

    onPlanSelect?.(plan);
  };

  const handleCheckoutStart = async (plan: 'monthly' | 'annual') => {
    const amount = plan === 'monthly' 
      ? experiment.getMonthlyPrice() 
      : experiment.getAnnualPrice();

    // Track checkout started in experiment
    await experiment.recordCheckoutStarted(plan, amount);
    
    // Continue with original plan selection flow
    handlePlanSelect(plan);
  };

  if (experiment.loading) {
    return <PricingSkeletonLoader />;
  }

  if (!experiment.isInExperiment) {
    // Fallback to default pricing if not in experiment
    return <DefaultPricingComponent 
      onPlanSelect={onPlanSelect}
      showFreePlan={showFreePlan}
      showAnnualOption={showAnnualOption}
      className={className}
    />;
  }

  const monthlyPrice = experiment.getMonthlyPrice();
  const annualPrice = experiment.getAnnualPrice();
  const annualSavings = experiment.getAnnualSavings();

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Urgency Banner */}
      {experiment.pricing?.showUrgency && experiment.pricing.urgencyMessage && timeLeft && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg mb-6 text-center">
          <p className="font-semibold">
            {experiment.pricing.urgencyMessage.replace('{time}', timeLeft)}
          </p>
        </div>
      )}

      {/* Billing Toggle */}
      {showAnnualOption && (
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-md transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Annual
              {annualSavings > 0 && (
                <Badge 
                  variant="success" 
                  className="absolute -top-2 -right-2 text-xs"
                >
                  Save {experiment.formatPrice(annualSavings)}
                </Badge>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Free Plan */}
        {showFreePlan && (
          <Card className="p-6 border-2 border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
              </div>
              
              <ul className="space-y-2 mb-6 text-sm text-left">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Basic workout tracking
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Simple nutrition logging
                </li>
                <li className="flex items-center text-gray-500">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Limited to 3 workouts/week
                </li>
              </ul>

              <FreePlanButton 
                onClick={() => handlePlanSelect('free')}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Get Started Free
              </FreePlanButton>
            </div>
          </Card>
        )}

        {/* Pro Plan - Monthly */}
        <Card className={`p-6 border-2 relative ${
          billingCycle === 'monthly' 
            ? 'border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900' 
            : 'border-gray-200 dark:border-gray-700'
        }`}>
          {billingCycle === 'monthly' && (
            <Badge 
              variant="primary" 
              className="absolute -top-3 left-1/2 transform -translate-x-1/2"
            >
              Most Popular
            </Badge>
          )}
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Pro Monthly</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">
                {experiment.formatPrice(monthlyPrice)}
              </span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
            </div>

            <ProFeaturesList variant={experiment.variant} config={experiment.pricing} />

            <PricingButton 
              plan="premium"
              onClick={() => handleCheckoutStart('monthly')}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Start Pro Monthly
            </PricingButton>
          </div>
        </Card>

        {/* Pro Plan - Annual */}
        {showAnnualOption && (
          <Card className={`p-6 border-2 relative ${
            billingCycle === 'annual' 
              ? 'border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900' 
              : 'border-gray-200 dark:border-gray-700'
          }`}>
            {billingCycle === 'annual' && (
              <Badge 
                variant="success" 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2"
              >
                Best Value
              </Badge>
            )}
            
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Pro Annual</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold">
                  {experiment.formatPrice(Math.floor(annualPrice / 12))}
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
              </div>
              <div className="mb-4">
                <span className="text-sm text-gray-500 line-through">
                  {experiment.formatPrice(monthlyPrice * 12)}
                </span>
                <span className="text-sm text-green-600 dark:text-green-400 ml-2 font-medium">
                  Save {experiment.formatPrice(annualSavings)}
                </span>
              </div>

              <ProFeaturesList variant={experiment.variant} config={experiment.pricing} />

              <PricingButton 
                plan="annual"
                onClick={() => handleCheckoutStart('annual')}
                className="w-full bg-green-600 text-white hover:bg-green-700 py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Start Pro Annual
              </PricingButton>
            </div>
          </Card>
        )}
      </div>

      {/* Social Proof */}
      <SocialProofSection experiment={experiment} />
    </div>
  );
}

function ProFeaturesList({ 
  variant, 
  config 
}: { 
  variant?: string; 
  config: any; 
}) {
  // Variant-specific features based on experiment config
  const getFeatures = () => {
    const baseFeatures = [
      'Unlimited workouts & tracking',
      'Advanced nutrition insights',
      'AI-powered coaching',
      'Progress analytics & reports'
    ];

    // Add variant-specific features based on price point
    if (variant === 'price_1299') {
      return [
        ...baseFeatures,
        'Priority customer support',
        'Advanced meal planning',
        'Custom workout programs',
        'Body composition analysis'
      ];
    }

    if (variant === 'price_999') {
      return [
        ...baseFeatures,
        'Workout program library',
        'Macro tracking & goals'
      ];
    }

    return baseFeatures;
  };

  const features = getFeatures();

  return (
    <ul className="space-y-2 mb-6 text-sm text-left">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {feature}
        </li>
      ))}
    </ul>
  );
}

function SocialProofSection({ experiment }: { experiment: any }) {
  if (!experiment.isInExperiment) return null;

  return (
    <div className="mt-12 text-center">
      <div className="flex justify-center items-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <div className="flex -space-x-2 mr-3">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white dark:border-gray-800"
              />
            ))}
          </div>
          <span>10,000+ active users</span>
        </div>
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>4.8/5 rating</span>
        </div>
        <div>
          <span>30-day money back guarantee</span>
        </div>
      </div>
    </div>
  );
}

function PricingSkeletonLoader() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 border-2 border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-auto"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DefaultPricingComponent({ 
  onPlanSelect, 
  showFreePlan, 
  showAnnualOption, 
  className 
}: PricingExperimentProps) {
  // Default pricing fallback when not in experiment
  const monthlyPrice = 799; // $7.99
  const annualDiscount = 0.2; // 20%
  const annualPrice = Math.round(monthlyPrice * 12 * (1 - annualDiscount));
  
  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Start your fitness journey today
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {showFreePlan && (
          <Card className="p-6 border-2 border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
              </div>
              <FreePlanButton 
                onClick={() => onPlanSelect?.('free')}
                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Get Started Free
              </FreePlanButton>
            </div>
          </Card>
        )}

        <Card className="p-6 border-2 border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold">${(monthlyPrice / 100).toFixed(2)}</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">/month</span>
            </div>
            <PricingButton 
              plan="premium"
              onClick={() => onPlanSelect?.('monthly')}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 py-3 px-6 rounded-lg font-medium transition-colors"
            >
              Start Pro
            </PricingButton>
          </div>
        </Card>
      </div>
    </div>
  );
}