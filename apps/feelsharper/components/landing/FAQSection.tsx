"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Shield, Zap, Users } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category?: 'general' | 'pricing' | 'features' | 'support';
}

interface FAQSectionProps {
  variant: 'fitness-tracker' | 'ai-coach' | 'natural-language' | 'social' | 'transform';
  title?: string;
  subtitle?: string;
  faqs: FAQItem[];
  showCategories?: boolean;
}

/**
 * FAQ section to address common objections and build trust
 * Optimized for conversion by reducing purchase friction
 */
export default function FAQSection({ 
  variant, 
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know about FeelSharper",
  faqs,
  showCategories = false 
}: FAQSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [openItems, setOpenItems] = useState<number[]>([0]); // First item open by default
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  const toggleItem = (index: number, question: string) => {
    const isOpen = openItems.includes(index);
    if (isOpen) {
      setOpenItems(openItems.filter(i => i !== index));
      trackEvent('faq_close', { question, faq_index: index });
    } else {
      setOpenItems([...openItems, index]);
      trackEvent('faq_open', { question, faq_index: index });
    }
  };

  const categories = [
    { key: 'all', label: 'All Questions', icon: HelpCircle },
    { key: 'general', label: 'General', icon: Users },
    { key: 'features', label: 'Features', icon: Zap },
    { key: 'pricing', label: 'Pricing', icon: Shield },
    { key: 'support', label: 'Support', icon: HelpCircle }
  ];

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <section className="py-20 bg-bg relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy/5 via-transparent to-navy/5"></div>
      
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold text-text-primary mb-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {title}
          </h2>
          <p className={`text-xl text-text-secondary max-w-2xl mx-auto transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {subtitle}
          </p>
        </div>

        {/* Category Filter */}
        {showCategories && (
          <div className={`flex flex-wrap justify-center gap-2 mb-12 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.key;
              
              return (
                <button
                  key={category.key}
                  onClick={() => {
                    setSelectedCategory(category.key);
                    trackEvent('faq_category_filter', { category: category.key });
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? 'bg-navy border-navy text-text-primary'
                      : 'bg-surface border-border text-text-secondary hover:border-navy/50 hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* FAQ Items */}
        <div className={`space-y-4 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {filteredFaqs.map((faq, index) => {
            const isOpen = openItems.includes(index);
            
            return (
              <div
                key={index}
                className="bg-surface border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-navy/50"
              >
                <button
                  onClick={() => toggleItem(index, faq.question)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-surface-2 transition-colors group"
                >
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-navy transition-colors pr-4">
                    {faq.question}
                  </h3>
                  <div className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-text-secondary group-hover:text-navy" />
                  </div>
                </button>
                
                <div className={`transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}>
                  <div className="px-6 pb-4">
                    <div className="pt-2 border-t border-border">
                      <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-surface border border-border rounded-2xl p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-navy" />
              <h3 className="text-xl font-bold text-text-primary">Still have questions?</h3>
            </div>
            <p className="text-text-secondary mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => trackEvent('faq_contact_support')}
                className="bg-navy hover:bg-navy-600 text-text-primary px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Support
              </button>
              <button 
                onClick={() => trackEvent('faq_live_chat')}
                className="border border-border hover:border-navy text-text-primary px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-surface-2"
              >
                Live Chat
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className={`grid md:grid-cols-3 gap-6 mt-12 transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="text-center">
            <Users className="w-8 h-8 text-navy mx-auto mb-3" />
            <h4 className="font-semibold text-text-primary mb-2">Community</h4>
            <p className="text-text-secondary text-sm">Join our active community forum</p>
          </div>
          
          <div className="text-center">
            <Shield className="w-8 h-8 text-success mx-auto mb-3" />
            <h4 className="font-semibold text-text-primary mb-2">Privacy</h4>
            <p className="text-text-secondary text-sm">Your data is secure and private</p>
          </div>
          
          <div className="text-center">
            <Zap className="w-8 h-8 text-warning mx-auto mb-3" />
            <h4 className="font-semibold text-text-primary mb-2">Updates</h4>
            <p className="text-text-secondary text-sm">Regular feature updates</p>
          </div>
        </div>
      </div>
    </section>
  );
}