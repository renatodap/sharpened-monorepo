/**
 * FeedbackButton - Always accessible feedback button
 * Maps to PRD: Beta Launch - Email feedback collection
 */

"use client";

import React, { useState } from 'react';
import { MessageSquare, Zap } from 'lucide-react';
import { BetaFeedbackModal } from './BetaFeedbackModal';

export function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 left-4 z-40 bg-primary hover:bg-primary/80 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        title="Send feedback"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      <BetaFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

// Inline feedback prompt for specific features
export function InlineFeedbackPrompt({ 
  feature, 
  className = '' 
}: { 
  feature?: string; 
  className?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-500/20 rounded">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-400 mb-1">
              Beta Feature
            </h4>
            <p className="text-xs text-blue-300 mb-2">
              {feature ? `How's the ${feature} working for you?` : 'How\'s your experience so far?'} Your feedback helps us improve!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium underline"
            >
              Share feedback
            </button>
          </div>
        </div>
      </div>

      <BetaFeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}