'use client'

import FrictionlessOnboardingManager from '@/components/onboarding/FrictionlessOnboardingManager';
import React, { Suspense } from 'react';

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Preparing your personalized experience...</p>
        </div>
      </div>
    }>
      <FrictionlessOnboardingManager
        autoStart={false}
        showSocialProof={true}
        onComplete={(data) => {
          console.log('Onboarding completed:', data);
        }}
      />
    </Suspense>
  );
}
