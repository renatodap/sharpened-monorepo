"use client";

import { useState, useEffect } from 'react';
import { Check, X, Zap, Crown, Star, ArrowRight, Shield } from 'lucide-react';
import { PricingButton, FreePlanButton } from '@/components/pricing/PricingButtons';

interface PricingTier {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  limitations?: string[];
  cta: string;
  highlight?: boolean;
  plan?: 'premium' | 'annual';
  badge?: string;
}

interface PricingSectionProps {
  variant: 'fitness-tracker' | 'ai-coach' | 'natural-language' | 'social' | 'transform';
  title: string;
  subtitle: string;
  tiers: PricingTier[];
  showAnnualToggle?: boolean;
  urgencyText?: string;
}

/**
 * High-converting pricing section with social proof and urgency
 * Optimized for A/B testing different price anchoring strategies
 */
export default function PricingSection({ 
  variant, 
  title, 
  subtitle, 
  tiers, 
  showAnnualToggle = true,
  urgencyText 
}: PricingSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    // Pre-select the highlighted tier
    const highlightedIndex = tiers.findIndex(tier => tier.highlight);
    if (highlightedIndex !== -1) {
      setSelectedTier(highlightedIndex);
    }
  }, [tiers]);

  const trackEvent = (eventName: string, properties?: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        landing_variant: variant,
        billing_cycle: isAnnual ? 'annual' : 'monthly',
        ...properties
      });
    }
  };

  const handleTierSelect = (index: number, tierName: string) => {
    setSelectedTier(index);
    trackEvent('pricing_tier_select', { tier_name: tierName, tier_index: index });
  };

  const handleBillingToggle = () => {
    setIsAnnual(!isAnnual);
    trackEvent('pricing_billing_toggle', { new_cycle: !isAnnual ? 'annual' : 'monthly' });
  };

  return (
    <section className="py-20 bg-surface relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/5 via-transparent to-navy/5"></div>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold text-text-primary mb-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {title}
          </h2>
          <p className={`text-xl text-text-secondary max-w-3xl mx-auto mb-8 transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {subtitle}
          </p>

          {/* Billing Toggle */}
          {showAnnualToggle && (
            <div className={`inline-flex items-center gap-4 bg-bg border border-border rounded-xl p-2 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-text-primary' : 'text-text-secondary'}`}>
                Monthly
              </span>
              <button
                onClick={handleBillingToggle}
                className="relative w-12 h-6 bg-navy rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-text-primary rounded-full transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-text-primary' : 'text-text-secondary'}`}>
                Annual
              </span>
              <span className="bg-success text-text-primary px-2 py-1 rounded-full text-xs font-semibold">
                Save 30%
              </span>
            </div>
          )}

          {/* Urgency Message */}
          {urgencyText && (
            <div className={`mt-6 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="inline-flex items-center gap-2 bg-warning/10 border border-warning/20 rounded-lg px-4 py-2">
                <Zap className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-warning">{urgencyText}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className={`grid md:grid-cols-3 gap-8 max-w-5xl mx-auto transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {tiers.map((tier, index) => {
            const isSelected = selectedTier === index;
            const isHighlighted = tier.highlight;
            
            return (
              <div
                key={index}
                onClick={() => handleTierSelect(index, tier.name)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isHighlighted ? 'scale-105 z-10' : 'hover:scale-102'
                } ${isSelected ? 'ring-2 ring-navy' : ''}`}
              >
                {/* Popular Badge */}
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-navy text-text-primary px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      {tier.badge}
                    </div>
                  </div>
                )}

                <div className={`relative bg-bg border rounded-2xl p-8 h-full transition-all duration-300 ${
                  isHighlighted 
                    ? 'border-navy shadow-xl shadow-navy/20' 
                    : 'border-border hover:border-navy/50 hover:shadow-lg'
                }`}>
                  {/* Background Glow for Highlighted */}
                  {isHighlighted && (
                    <div className="absolute inset-0 bg-gradient-to-b from-navy/5 to-transparent rounded-2xl" />
                  )}

                  <div className="relative">
                    {/* Tier Header */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-text-primary mb-2">{tier.name}</h3>
                      <p className="text-text-secondary text-sm mb-4">{tier.description}</p>
                      
                      {/* Price */}
                      <div className="mb-2">
                        {tier.originalPrice && (
                          <div className="text-lg text-text-muted line-through mb-1">
                            {tier.originalPrice}
                          </div>
                        )}
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-text-primary">{tier.price}</span>
                          <span className="text-text-secondary">/{tier.period}</span>
                        </div>
                      </div>

                      {/* Savings Badge */}
                      {tier.originalPrice && (
                        <div className="inline-block bg-success/10 text-success px-3 py-1 rounded-full text-sm font-semibold">
                          Save 30%
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <span className="text-text-secondary text-sm">{feature}</span>
                        </div>
                      ))}

                      {/* Limitations */}
                      {tier.limitations && tier.limitations.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-start gap-3">
                          <X className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                          <span className="text-text-muted text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <div className="mt-auto">
                      {tier.plan ? (
                        <PricingButton
                          plan={tier.plan}
                          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                            isHighlighted
                              ? 'bg-navy hover:bg-navy-600 text-text-primary shadow-lg hover:shadow-xl'
                              : 'bg-surface-2 hover:bg-navy border border-border hover:border-navy hover:text-text-primary text-text-primary'
                          }`}
                        >
                          {tier.cta}
                          <ArrowRight className="w-4 h-4" />
                        </PricingButton>
                      ) : (
                        <FreePlanButton
                          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                            isHighlighted
                              ? 'bg-navy hover:bg-navy-600 text-text-primary shadow-lg hover:shadow-xl'
                              : 'bg-surface-2 hover:bg-navy border border-border hover:border-navy hover:text-text-primary text-text-primary'
                          }`}
                        >
                          {tier.cta}
                          <ArrowRight className="w-4 h-4" />
                        </FreePlanButton>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center justify-center gap-8 text-sm text-text-muted">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>30-day money-back guarantee</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>Cancel anytime</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              <span>Instant activation</span>
            </div>
          </div>
        </div>

        {/* FAQ Teaser */}
        <div className={`text-center mt-12 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-text-secondary">
            Questions? Check our{' '}
            <button 
              onClick={() => trackEvent('pricing_faq_click')}
              className="text-navy hover:underline font-medium"
            >
              FAQ section
            </button>{' '}
            or{' '}
            <button 
              onClick={() => trackEvent('pricing_contact_click')}
              className="text-navy hover:underline font-medium"
            >
              contact us
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}