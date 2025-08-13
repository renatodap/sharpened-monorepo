"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LandingHeroProps {
  variant: 'fitness-tracker' | 'ai-coach' | 'natural-language' | 'social' | 'transform';
  headline: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary?: string;
  heroImage?: string;
  socialProof?: {
    users: string;
    rating: string;
    reviews: string;
  };
  highlights?: string[];
  videoUrl?: string;
}

/**
 * High-converting landing page hero section
 * Optimized for 15%+ conversion rates with multiple A/B test variants
 */
export default function LandingHero({
  variant,
  headline,
  subheadline,
  ctaPrimary,
  ctaSecondary,
  heroImage,
  socialProof,
  highlights = [],
  videoUrl
}: LandingHeroProps) {
  const [mounted, setMounted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const trackEvent = (eventName: string, properties?: any) => {
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        landing_variant: variant,
        ...properties
      });
    }
  };

  const handlePrimaryCTA = () => {
    trackEvent('hero_cta_primary_click', { button_text: ctaPrimary });
  };

  const handleSecondaryCTA = () => {
    trackEvent('hero_cta_secondary_click', { button_text: ctaSecondary });
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
    trackEvent('hero_video_play');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg text-text-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy/5 via-transparent to-navy/10"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Content */}
        <div className="text-center lg:text-left">
          {/* Trust Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border mb-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-sm font-medium text-text-secondary">
              {socialProof ? `${socialProof.users} active users` : 'Free forever'}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-6 transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <span className="block text-text-primary">{headline}</span>
          </h1>

          {/* Subheadline */}
          <p className={`text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {subheadline}
          </p>

          {/* Highlights List */}
          {highlights.length > 0 && (
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2 text-text-secondary">
                  <Check className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-base">{highlight}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Link 
              href={`/onboarding?variant=${variant}&entry=landing_primary`}
              onClick={handlePrimaryCTA}
            >
              <Button variant="primary" size="lg" className="group min-w-[200px]">
                <span className="relative">{ctaPrimary}</span>
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            {ctaSecondary && (
              <Link 
                href={`/onboarding?variant=${variant}&entry=landing_secondary`}
                onClick={handleSecondaryCTA}
              >
                <Button variant="outline" size="lg" className="group min-w-[200px]">
                  <span>{ctaSecondary}</span>
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            )}
          </div>

          {/* Social Proof */}
          {socialProof && (
            <div className={`flex items-center justify-center lg:justify-start gap-6 text-sm transition-all duration-1000 delay-500 ${mounted ? 'opacity-60' : 'opacity-0'}`}>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-warning fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-text-muted font-medium">{socialProof.rating}</span>
              </div>
              <span className="text-text-muted">•</span>
              <span className="text-text-muted font-medium">{socialProof.reviews} reviews</span>
            </div>
          )}
        </div>

        {/* Right Column - Visual */}
        <div className={`relative transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
          {videoUrl ? (
            <div className="relative group cursor-pointer" onClick={handleVideoPlay}>
              {!isVideoPlaying ? (
                <>
                  <div className="relative bg-surface border border-border rounded-2xl overflow-hidden aspect-video">
                    <div className="absolute inset-0 bg-gradient-to-br from-navy/20 to-navy/5 flex items-center justify-center">
                      <div className="w-16 h-16 bg-text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-navy ml-1" />
                      </div>
                    </div>
                  </div>
                  <p className="text-center mt-4 text-text-secondary">Watch how it works (2 min)</p>
                </>
              ) : (
                <div className="aspect-video rounded-2xl overflow-hidden">
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          ) : heroImage ? (
            <div className="relative">
              <div className="bg-surface border border-border rounded-2xl p-8 lg:p-12">
                <div className="aspect-square bg-gradient-to-br from-navy/20 to-navy/5 rounded-xl flex items-center justify-center">
                  <img 
                    src={heroImage} 
                    alt="Product preview" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-surface border border-border rounded-2xl p-8 lg:p-12">
                <div className="aspect-square bg-gradient-to-br from-navy/20 to-navy/5 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-navy rounded-xl mx-auto mb-4 flex items-center justify-center">
                      <ArrowRight className="w-8 h-8 text-text-primary" />
                    </div>
                    <p className="text-text-secondary font-medium">FeelSharper Dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}