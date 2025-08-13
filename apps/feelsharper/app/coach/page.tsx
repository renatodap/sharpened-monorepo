import type { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Suspense } from 'react';
import AICoach from '@/components/coach/AICoach';
import { AdvancedCoachInterface } from '@/components/coach/AdvancedCoachInterface';
import { SmartProgressTracker } from '@/components/coach/SmartProgressTracker';

export const metadata: Metadata = {
  title: 'AI Coach — Feel Sharper',
  description: 'Your personalized fitness and wellness AI assistant with advanced coaching features',
};

export default function CoachPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Personal Coach</h1>
          <p className="text-text-muted">
            Advanced AI-powered coaching with personalized workout plans, nutrition analysis, and smart progress tracking.
          </p>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="plans">Smart Plans</TabsTrigger>
            <TabsTrigger value="progress">Progress AI</TabsTrigger>
            <TabsTrigger value="analysis">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <Suspense fallback={<div className="animate-pulse bg-surface rounded-lg h-96" />}>
              <AICoach />
            </Suspense>
          </TabsContent>

          <TabsContent value="plans" className="mt-6">
            <Suspense fallback={<div className="animate-pulse bg-surface rounded-lg h-96" />}>
              <AdvancedCoachInterface />
            </Suspense>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <Suspense fallback={<div className="animate-pulse bg-surface rounded-lg h-96" />}>
              <SmartProgressTracker />
            </Suspense>
          </TabsContent>

          <TabsContent value="analysis" className="mt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
              <p className="text-text-muted max-w-md mx-auto">
                Deep statistical analysis, predictive modeling, and comprehensive performance analytics powered by AI.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
