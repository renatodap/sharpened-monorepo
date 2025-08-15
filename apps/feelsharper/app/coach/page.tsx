/**
 * AI Coach Dashboard - Comprehensive coaching interface
 * Maps to PRD: AI Coaching System (Technical Requirement #5)
 */

"use client";

import React, { useState } from 'react';
import { ArrowLeft, Brain, TrendingUp, Target, Heart, Zap, Trophy, Calendar, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SmartCoachWidget, InlineCoachPrompt } from '@/components/coach/SmartCoachWidget';
import { useSmartCoach, usePatternDetection, useProgressTracking } from '@/hooks/useSmartCoach';
import { Button } from '@/components/ui/Button';

export default function CoachDashboard() {
  const router = useRouter();
  const [userId] = useState('user-1'); // TODO: Get from auth context
  
  const {
    context,
    coaching,
    isLoading,
    actions
  } = useSmartCoach({ userId, autoLoad: true });

  const {
    patterns,
    positivePatterns,
    negativePatterns,
    hasPlateauPattern
  } = usePatternDetection(userId);

  const {
    progress,
    consistencyScore,
    overallScore,
    scoreColor,
    progressEmoji
  } = useProgressTracking(userId);

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Smart Coach</h1>
                <p className="text-text-secondary">Your personalized fitness intelligence</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Coaching Widget */}
          <div className="lg:col-span-2">
            <SmartCoachWidget userId={userId} className="mb-6" />
            
            {/* Pattern Analysis */}
            <div className="bg-surface border border-border rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Pattern Analysis
              </h2>
              
              {patterns.length > 0 ? (
                <div className="space-y-3">
                  {/* Positive Patterns */}
                  {positivePatterns.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-green-400 mb-2">Strengths</h3>
                      <div className="space-y-2">
                        {positivePatterns.map((pattern, index) => (
                          <div key={index} className="bg-green-400/10 border border-green-400/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{pattern.pattern}</p>
                                <p className="text-xs text-text-secondary mt-1">{pattern.impact}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                                  <span>📊 {Math.round(pattern.confidence * 100)}% confidence</span>
                                  <span>📅 {pattern.timeframe}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Negative Patterns */}
                  {negativePatterns.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-red-400 mb-2">Areas for Improvement</h3>
                      <div className="space-y-2">
                        {negativePatterns.map((pattern, index) => (
                          <div key={index} className="bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{pattern.pattern}</p>
                                <p className="text-xs text-text-secondary mt-1">{pattern.impact}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                                  <span>📊 {Math.round(pattern.confidence * 100)}% confidence</span>
                                  <span>📅 {pattern.timeframe}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No patterns detected yet. Keep logging to see insights!</p>
                </div>
              )}

              {hasPlateauPattern && (
                <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                  <p className="text-sm font-medium text-yellow-400">⚠️ Plateau Detected</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Your coach has strategies to break through this plateau. Ask about it!
                  </p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {coaching?.recommendations && coaching.recommendations.length > 0 && (
              <div className="bg-surface border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Action Plan
                </h2>
                
                <div className="space-y-3">
                  {coaching.recommendations.map((rec, index) => (
                    <div key={index} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {rec.category === 'workout' && <Zap className="w-4 h-4 text-blue-400" />}
                          {rec.category === 'nutrition' && <Heart className="w-4 h-4 text-green-400" />}
                          {rec.category === 'recovery' && <Heart className="w-4 h-4 text-red-400" />}
                          {rec.category === 'habit' && <Trophy className="w-4 h-4 text-yellow-400" />}
                          <span className="text-xs text-text-muted capitalize">{rec.category}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          rec.priority === 'high' ? 'bg-red-400/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-yellow-400/20 text-yellow-400' :
                          'bg-green-400/20 text-green-400'
                        }`}>
                          {rec.priority} priority
                        </span>
                      </div>
                      
                      <h3 className="font-medium mb-1">{rec.action}</h3>
                      <p className="text-sm text-text-secondary mb-2">{rec.rationale}</p>
                      
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span>📅 {rec.timeline}</span>
                        <span>✨ {rec.expected_impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Progress Overview</h2>
              
              {progress ? (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className="text-center py-4">
                    <div className={`text-4xl font-bold ${scoreColor}`}>
                      {overallScore}%
                    </div>
                    <p className="text-sm text-text-secondary mt-1">Overall Score {progressEmoji}</p>
                  </div>

                  {/* Individual Metrics */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Workout Consistency</span>
                        <span className="font-medium">{progress.workout_consistency}%</span>
                      </div>
                      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress.workout_consistency}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Nutrition Adherence</span>
                        <span className="font-medium">{progress.nutrition_adherence}%</span>
                      </div>
                      <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-400 transition-all"
                          style={{ width: `${progress.nutrition_adherence}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-text-secondary">Weight:</span>
                          <p className="font-medium capitalize">{progress.weight_trend}</p>
                        </div>
                        <div>
                          <span className="text-text-secondary">Strength:</span>
                          <p className="font-medium capitalize">{progress.strength_progress}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Loading progress data...</p>
                </div>
              )}
            </div>

            {/* Streaks */}
            {context?.currentStreaks && context.currentStreaks.length > 0 && (
              <div className="bg-surface border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Active Streaks
                </h2>
                
                <div className="space-y-3">
                  {context.currentStreaks.map((streak, index) => (
                    <div key={index} className="bg-surface-2 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{streak.type} Streak</span>
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{streak.current_days}</span>
                        <span className="text-sm text-text-secondary">days</span>
                      </div>
                      <div className="text-xs text-text-muted mt-1">
                        Best: {streak.best_days} days
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recovery Status */}
            {coaching?.recovery_suggestions && (
              <div className="bg-surface border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Recovery Focus
                </h2>
                
                <div className="space-y-2">
                  {coaching.recovery_suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plateau Strategies */}
            {coaching?.plateau_strategies && (
              <div className="bg-surface border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-400" />
                  Break Your Plateau
                </h2>
                
                <div className="space-y-2">
                  {coaching.plateau_strategies.map((strategy, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-1.5" />
                      <span>{strategy}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Motivational Quote */}
        {coaching?.motivational_quote && (
          <div className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 text-center">
            <p className="text-lg italic mb-2">"{coaching.motivational_quote}"</p>
            <p className="text-sm text-text-secondary">— Your AI Coach</p>
          </div>
        )}
      </div>
    </div>
  );
}