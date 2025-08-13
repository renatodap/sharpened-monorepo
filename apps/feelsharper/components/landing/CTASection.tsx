"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Clock, Users, CheckCircle, Star } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CTASectionProps {
  variant: 'fitness-tracker' | 'ai-coach' | 'natural-language' | 'social' | 'transform';
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary?: string;
  urgencyText?: string;
  socialProof?: {
    text: string;
    metric: string;
  };
  benefits?: string[];
  background?: 'gradient' | 'solid' | 'pattern';
}

/**
 * Final conversion-optimized CTA section
 * Multiple psychological triggers for maximum conversion
 */
export default function CTASection({
  variant,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  urgencyText,
  socialProof,
  benefits = [],
  background = 'gradient'
}: CTASectionProps) {
  const [mounted, setMounted] = useState(false);
  const [urgencyTimer, setUrgencyTimer] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    setMounted(true);
    
    // Countdown timer for urgency
    if (urgencyText && urgencyTimer > 0) {
      const timer = setInterval(() => {
        setUrgencyTimer(prev => Math.max(0, prev - 1));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [urgencyText, urgencyTimer]);

  const trackEvent = (eventName: string, properties?: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        landing_variant: variant,
        cta_section: 'final',
        ...properties
      });
    }
  };

  const handlePrimaryCTA = () => {
    trackEvent('cta_final_primary_click', { button_text: ctaPrimary });
  };

  const handleSecondaryCTA = () => {
    trackEvent('cta_final_secondary_click', { button_text: ctaSecondary });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBackgroundClasses = () => {
    switch (background) {
      case 'gradient':
        return 'bg-gradient-to-br from-navy via-navy-600 to-navy-400';
      case 'pattern':
        return 'bg-navy relative overflow-hidden';
      default:
        return 'bg-navy';
    }
  };

  return (
    <section className={`py-20 relative ${getBackgroundClasses()}`}>
      {/* Background Pattern for 'pattern' variant */}
      {background === 'pattern' && (
        <>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border border-text-primary rounded-full"></div>
            <div className="absolute top-32 right-20 w-24 h-24 border border-text-primary rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-text-primary rounded-full"></div>
            <div className="absolute bottom-32 right-1/3 w-20 h-20 border border-text-primary rounded-full"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/90"></div>
        </>
      )}
      
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        {/* Urgency Banner */}
        {urgencyText && urgencyTimer > 0 && (
          <div className={`inline-flex items-center gap-3 bg-warning/20 border border-warning/30 rounded-lg px-6 py-3 mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Clock className="w-5 h-5 text-warning" />
            <span className="text-warning font-medium">{urgencyText}</span>
            <div className="bg-warning text-navy px-3 py-1 rounded-md font-bold text-sm">
              {formatTime(urgencyTimer)}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`mb-12 transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">
            {title}
          </h2>
          <p className="text-xl md:text-2xl text-text-primary/90 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Benefits Grid */}
        {benefits.length > 0 && (
          <div className={`grid md:grid-cols-3 gap-6 mb-12 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-text-primary/90">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-lg font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-8 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link 
            href={`/onboarding?variant=${variant}&entry=final_cta`}
            onClick={handlePrimaryCTA}
          >
            <Button 
              variant="secondary" 
              size="xl" 
              className="group min-w-[250px] bg-text-primary text-navy hover:bg-text-primary/90 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              <span className="relative font-bold">{ctaPrimary}</span>
              <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          
          {ctaSecondary && (
            <Link 
              href={`/onboarding?variant=${variant}&entry=final_secondary`}
              onClick={handleSecondaryCTA}
            >
              <Button 
                variant="ghost" 
                size="xl" 
                className="group min-w-[250px] border-2 border-text-primary/30 text-text-primary hover:border-text-primary hover:bg-text-primary/10"
              >
                <span>{ctaSecondary}</span>
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          )}
        </div>

        {/* Social Proof */}
        {socialProof && (
          <div className={`flex items-center justify-center gap-4 mb-8 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 text-text-primary/80">
              <Users className="w-5 h-5" />
              <span className="font-medium">{socialProof.text}</span>
              <span className="font-bold text-warning">{socialProof.metric}</span>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className={`flex items-center justify-center gap-8 text-sm text-text-primary/70 transition-all duration-1000 delay-500 ${mounted ? 'opacity-80' : 'opacity-0'}`}>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            <span>Free forever</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4" />
            <span>No credit card</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>2-min setup</span>
          </div>
        </div>

        {/* Risk Reversal */}
        <div className={`mt-8 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p className="text-text-primary/60 text-sm">
            Start free today. Upgrade only when you're ready. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}