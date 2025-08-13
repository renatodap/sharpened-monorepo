"use client";

import { useState, useEffect } from 'react';
import { Star, Users, TrendingUp, Award } from 'lucide-react';

interface TestimonialProps {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
  result?: string;
}

interface SocialProofSectionProps {
  variant: 'fitness-tracker' | 'ai-coach' | 'natural-language' | 'social' | 'transform';
  testimonials: TestimonialProps[];
  stats?: {
    users: string;
    workouts: string;
    satisfaction: string;
    avgResults: string;
  };
}

/**
 * Social proof section with testimonials, stats, and trust indicators
 * Optimized for conversion with authentic user stories
 */
export default function SocialProofSection({ variant, testimonials, stats }: SocialProofSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const trackEvent = (eventName: string, properties?: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        landing_variant: variant,
        ...properties
      });
    }
  };

  const defaultStats = {
    users: '50,000+',
    workouts: '2M+',
    satisfaction: '4.8/5',
    avgResults: '15%'
  };

  const displayStats = stats || defaultStats;

  return (
    <section className="py-20 bg-surface relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/5 via-transparent to-navy/5"></div>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold text-text-primary mb-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Join thousands who transformed their fitness
          </h2>
          <p className={`text-xl text-text-secondary max-w-3xl mx-auto transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Real results from real people using FeelSharper
          </p>
        </div>

        {/* Stats Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-navy rounded-xl mb-3">
              <Users className="w-6 h-6 text-text-primary" />
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">{displayStats.users}</div>
            <div className="text-sm text-text-secondary">Active Users</div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-success rounded-xl mb-3">
              <TrendingUp className="w-6 h-6 text-text-primary" />
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">{displayStats.workouts}</div>
            <div className="text-sm text-text-secondary">Workouts Logged</div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-warning rounded-xl mb-3">
              <Star className="w-6 h-6 text-text-primary" />
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">{displayStats.satisfaction}</div>
            <div className="text-sm text-text-secondary">User Rating</div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-info rounded-xl mb-3">
              <Award className="w-6 h-6 text-text-primary" />
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">{displayStats.avgResults}</div>
            <div className="text-sm text-text-secondary">Improvement</div>
          </div>
        </div>

        {/* Featured Testimonial */}
        <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="relative bg-bg border border-border rounded-2xl p-8 md:p-12">
            {/* Quote Icon */}
            <div className="absolute top-6 left-6 w-8 h-8 text-navy opacity-20">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
              </svg>
            </div>

            {/* Testimonial Content */}
            <div className="text-center">
              <p className="text-xl md:text-2xl text-text-primary mb-8 leading-relaxed">
                "{testimonials[currentTestimonial]?.content}"
              </p>
              
              {/* Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < (testimonials[currentTestimonial]?.rating || 5) ? 'text-warning fill-current' : 'text-border'}`} 
                  />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center overflow-hidden">
                  {testimonials[currentTestimonial]?.avatar ? (
                    <img 
                      src={testimonials[currentTestimonial].avatar} 
                      alt={testimonials[currentTestimonial].name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-text-primary font-semibold">
                      {testimonials[currentTestimonial]?.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-text-primary">
                    {testimonials[currentTestimonial]?.name}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {testimonials[currentTestimonial]?.role}
                  </div>
                </div>
                {testimonials[currentTestimonial]?.result && (
                  <div className="ml-8 text-left">
                    <div className="text-sm text-text-secondary">Result</div>
                    <div className="font-semibold text-success">
                      {testimonials[currentTestimonial].result}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Testimonial Navigation */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentTestimonial(index);
                  trackEvent('testimonial_navigate', { testimonial_index: index });
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-navy' : 'bg-border hover:bg-navy/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Additional Testimonials Grid */}
        <div className={`grid md:grid-cols-3 gap-6 mt-16 transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {testimonials.slice(1, 4).map((testimonial, index) => (
            <div key={index} className="bg-bg border border-border rounded-xl p-6">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-warning fill-current' : 'text-border'}`} 
                  />
                ))}
              </div>
              
              <p className="text-text-secondary mb-4 line-clamp-3">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center overflow-hidden">
                  {testimonial.avatar ? (
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-text-primary text-sm font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-text-primary text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}