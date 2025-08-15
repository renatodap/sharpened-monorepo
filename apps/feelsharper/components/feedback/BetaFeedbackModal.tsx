/**
 * BetaFeedbackModal - Collect feedback from beta users
 * Maps to PRD: Beta Launch - Email feedback collection
 */

"use client";

import React, { useState } from 'react';
import { X, Send, Star, MessageSquare, Bug, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = 'general' | 'bug' | 'feature' | 'improvement';
type Rating = 1 | 2 | 3 | 4 | 5;

export function BetaFeedbackModal({ isOpen, onClose }: BetaFeedbackModalProps) {
  const [step, setStep] = useState<'type' | 'rating' | 'details' | 'submitted'>('type');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [rating, setRating] = useState<Rating | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    {
      type: 'general' as FeedbackType,
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'General Feedback',
      description: 'Share your overall experience'
    },
    {
      type: 'bug' as FeedbackType,
      icon: <Bug className="w-6 h-6" />,
      title: 'Report a Bug',
      description: 'Something not working as expected?'
    },
    {
      type: 'feature' as FeedbackType,
      icon: <Lightbulb className="w-6 h-6" />,
      title: 'Feature Request',
      description: 'Suggest a new feature'
    },
    {
      type: 'improvement' as FeedbackType,
      icon: <Star className="w-6 h-6" />,
      title: 'Improvement Idea',
      description: 'How can we make it better?'
    }
  ];

  const handleSubmit = async () => {
    if (!rating || !description.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          rating,
          title: title.trim(),
          description: description.trim(),
          email: email.trim(),
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href
        })
      });

      if (response.ok) {
        setStep('submitted');
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStep('type');
    setFeedbackType('general');
    setRating(null);
    setTitle('');
    setDescription('');
    setEmail('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">
            Beta Feedback
          </h2>
          <button
            onClick={handleClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'type' && (
            <div className="space-y-4">
              <p className="text-text-secondary text-sm">
                Help us improve Feel Sharper! What would you like to share?
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => {
                      setFeedbackType(type.type);
                      setStep('rating');
                    }}
                    className="p-4 text-left border border-border rounded-lg hover:border-primary transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-primary group-hover:text-primary/80">
                        {type.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-text-primary group-hover:text-primary">
                          {type.title}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'rating' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-text-primary mb-2">
                  How would you rate your experience?
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  This helps us understand the overall sentiment
                </p>
                
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setRating(value as Rating)}
                      className={`p-2 rounded-lg transition-colors ${
                        rating === value
                          ? 'bg-primary text-white'
                          : 'bg-surface-2 text-text-secondary hover:text-primary'
                      }`}
                    >
                      <Star 
                        className="w-5 h-5" 
                        fill={rating && rating >= value ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
                
                {rating && (
                  <p className="text-sm text-text-secondary mt-2">
                    {rating === 5 && "Excellent! 🎉"}
                    {rating === 4 && "Great! 👍"}
                    {rating === 3 && "Good 👌"}
                    {rating === 2 && "Could be better 😐"}
                    {rating === 1 && "Needs improvement 😞"}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('type')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep('details')}
                  disabled={!rating}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief summary of your feedback"
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Details *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    feedbackType === 'bug' 
                      ? 'Describe what happened, what you expected, and steps to reproduce...'
                      : feedbackType === 'feature'
                      ? 'Describe the feature you\'d like to see and how it would help...'
                      : 'Share your thoughts, suggestions, or feedback...'
                  }
                  rows={4}
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For follow-up questions"
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-text-secondary mt-1">
                  We'll only use this to follow up on your feedback
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('rating')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!description.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'submitted' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  Thank you for your feedback! 🙏
                </h3>
                <p className="text-text-secondary text-sm">
                  Your input helps us build a better product. We typically respond within 1-2 business days.
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}