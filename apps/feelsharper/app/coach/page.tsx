/**
 * AI Coach Dashboard - Temporarily simplified for MVP
 */

"use client";

import React from 'react';

export default function CoachPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">AI Coach</h1>
        <p className="text-gray-400 mb-8">Coming soon in the full version</p>
        <a 
          href="/today" 
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}