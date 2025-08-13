"use client";

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Brain, 
  MessageCircle, 
  Users, 
  Zap, 
  Target,
  Apple,
  Dumbbell,
  TrendingUp,
  Clock,
  Shield,
  Smartphone
} from 'lucide-react';

interface FeatureProps {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  benefits: string[];
  highlight?: boolean;
}

interface FeaturesSectionProps {
  variant: 'fitness-tracker' | 'ai-coach' | 'natural-language' | 'social' | 'transform';
  title: string;
  subtitle: string;
  features: FeatureProps[];
}

/**
 * Features section showcasing key benefits for each landing variant
 * Focused on conversion with benefit-driven content
 */
export default function FeaturesSection({ variant, title, subtitle, features }: FeaturesSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const trackEvent = (eventName: string, properties?: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        landing_variant: variant,
        ...properties
      });
    }
  };

  const handleFeatureClick = (index: number, title: string) => {
    setActiveFeature(index);
    trackEvent('feature_interact', { feature_title: title, feature_index: index });
  };

  return (
    <section className="py-20 bg-bg relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/5 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold text-text-primary mb-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {title}
          </h2>
          <p className={`text-xl text-text-secondary max-w-3xl mx-auto transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Features List */}
          <div className={`space-y-6 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <div
                  key={index}
                  onClick={() => handleFeatureClick(index, feature.title)}
                  className={`group cursor-pointer transition-all duration-300 ${
                    isActive ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div className={`relative bg-surface border rounded-xl p-6 transition-all duration-300 ${
                    isActive 
                      ? 'border-navy bg-navy/5 shadow-lg' 
                      : 'border-border hover:border-navy/50 hover:bg-surface-2'
                  } ${feature.highlight ? 'ring-2 ring-success/20' : ''}`}>
                    {/* Highlight Badge */}
                    {feature.highlight && (
                      <div className="absolute -top-3 left-6">
                        <span className="bg-success text-text-primary px-3 py-1 rounded-full text-xs font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'bg-navy' : 'bg-navy/10 group-hover:bg-navy'
                      }`}>
                        <Icon className={`w-6 h-6 transition-colors duration-300 ${
                          isActive ? 'text-text-primary' : 'text-navy group-hover:text-text-primary'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-navy transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-text-secondary mb-4 leading-relaxed">
                          {feature.description}
                        </p>
                        
                        {/* Benefits List */}
                        <ul className="space-y-2">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-center gap-2 text-sm text-text-secondary">
                              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                                isActive ? 'bg-navy' : 'bg-success'
                              }`} />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Visualization */}
          <div className={`sticky top-8 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="relative bg-surface border border-border rounded-2xl p-8 lg:p-12">
              {/* Dynamic Content Based on Active Feature */}
              <div className="aspect-square bg-gradient-to-br from-navy/20 to-navy/5 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-navy/10 via-transparent to-navy/5"></div>
                
                {/* Feature Icon */}
                <div className="relative z-10 text-center">
                  {React.createElement(features[activeFeature]?.icon || Target, {
                    className: "w-16 h-16 text-navy mx-auto mb-4"
                  })}
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    {features[activeFeature]?.title}
                  </h4>
                  <p className="text-text-secondary text-sm max-w-xs">
                    {features[activeFeature]?.description}
                  </p>
                </div>

                {/* Animated Elements */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Floating dots */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-navy rounded-full animate-pulse delay-1000"></div>
                  <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-warning rounded-full animate-pulse delay-500"></div>
                  
                  {/* Subtle grid */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="grid grid-cols-6 grid-rows-6 h-full w-full gap-4">
                      {[...Array(36)].map((_, i) => (
                        <div key={i} className="border border-navy rounded-sm"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Metrics */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">85%</div>
                  <div className="text-xs text-text-secondary">Faster</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">2x</div>
                  <div className="text-xs text-text-secondary">More Accurate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">24/7</div>
                  <div className="text-xs text-text-secondary">Available</div>
                </div>
              </div>
            </div>

            {/* Feature Navigation */}
            <div className="flex justify-center gap-2 mt-6">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleFeatureClick(index, features[index].title)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeFeature ? 'bg-navy' : 'bg-border hover:bg-navy/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-text-primary mb-4">
              Ready to experience these features?
            </h3>
            <p className="text-text-secondary mb-6">
              Join thousands of users who have transformed their fitness journey with FeelSharper.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => trackEvent('features_cta_primary')}
                className="bg-navy hover:bg-navy-600 text-text-primary px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Free Trial
              </button>
              <button 
                onClick={() => trackEvent('features_cta_secondary')}
                className="border border-border hover:border-navy text-text-primary px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                View Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}