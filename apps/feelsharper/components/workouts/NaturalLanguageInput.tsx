'use client';

import { useState } from 'react';
import { Loader2, Zap, Edit3, Check, X, Mic } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { PremiumGate, FeatureUsageIndicator } from '@/components/premium/PremiumGate';
import { VoiceInputField } from '@/components/voice/VoiceInputButton';
import { useWorkoutParser } from '@/hooks/useWorkoutParser';
import type { Exercise, WorkoutTypeEnum } from '@/lib/types/database';

interface ParseResult {
  success: boolean;
  workout?: {
    workout_type: WorkoutTypeEnum;
    exercises: Exercise[];
    confidence: number;
  };
  message?: string;
  suggestions?: string[];
  metadata?: {
    original_text: string;
    parsed_exercises_count: number;
    parsing_confidence: number;
  };
}

interface NaturalLanguageInputProps {
  onWorkoutParsed: (workout: {
    workout_type: WorkoutTypeEnum;
    exercises: Exercise[];
  }) => void;
  className?: string;
}

export default function NaturalLanguageInput({ 
  onWorkoutParsed, 
  className = '' 
}: NaturalLanguageInputProps) {
  const [input, setInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [useVoice, setUseVoice] = useState(false);
  
  const { 
    parseWorkout, 
    isLoading, 
    error, 
    clearError, 
    lastResult,
    parseExamples,
    isHighConfidence,
    formatConfidence
  } = useWorkoutParser();

  const handleParse = async () => {
    if (!input.trim()) return;

    clearError();
    const result = await parseWorkout(input, false); // Don't save, just parse for preview
    
    if (result) {
      setShowPreview(true);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript);
    setUseVoice(false);
    
    // Auto-parse if transcript is substantial
    if (transcript.length > 10) {
      setTimeout(() => handleParse(), 500);
    }
  };

  const handleConfirm = () => {
    if (lastResult?.workout) {
      // Convert AI types to database types
      const exercises: Exercise[] = lastResult.workout.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets ? [{
          reps: ex.reps || 0,
          weight_kg: ex.weight_kg,
          duration_seconds: ex.duration_minutes ? ex.duration_minutes * 60 : undefined,
          distance_km: ex.distance_km,
          rest_seconds: ex.rest_seconds
        }] : []
      }));

      onWorkoutParsed({
        workout_type: (lastResult.workout.workout_type as WorkoutTypeEnum) || 'strength',
        exercises,
      });
      
      setInput('');
      setShowPreview(false);
    }
  };

  const handleReject = () => {
    setShowPreview(false);
  };

  const fillExample = (example: string) => {
    setInput(example);
    setShowPreview(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <PremiumGate feature="workout_parse">
        {/* Input Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-primary">
              Describe your workout
            </label>
            <FeatureUsageIndicator feature="workout_parse" />
          </div>
        {useVoice ? (
          <div className="space-y-3">
            <VoiceInputField
              onTranscript={handleVoiceInput}
              onError={(error) => console.error('Voice error:', error)}
              label="Speak your workout (e.g., 'bench press 3 sets of 8 at 135 pounds')"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => setUseVoice(false)}
                variant="ghost"
                className="flex-1"
              >
                Use Text Input
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ran 5k easy, bench press 3x8 @ 135lbs, 30min bike ride..."
                className="flex-1 bg-surface-2 border-border text-text-primary placeholder:text-text-muted resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleParse();
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleParse}
                  disabled={!input.trim() || isLoading}
                  className="bg-navy hover:bg-navy/80 h-fit"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={() => setUseVoice(true)}
                  variant="outline"
                  size="sm"
                  className="h-fit"
                  title="Use voice input"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        <p className="text-xs text-text-muted">
          Press Cmd/Ctrl + Enter to parse • Be specific with exercises, sets, reps, and weight
        </p>
      </div>

      {/* Examples */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary">Examples:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(parseExamples).map(([key, example]) => (
            <button
              key={key}
              onClick={() => fillExample(example)}
              className="px-2 py-1 text-xs bg-surface hover:bg-surface-2 text-text-secondary rounded border border-border hover:border-border/60 transition-colors"
            >
              {key}: {example.slice(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded border bg-red-500/10 border-red-500/20 text-red-400">
          <p className="text-sm font-medium">Parse Error</p>
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {lastResult && !showPreview && !error && (
        <div className="p-3 rounded border bg-green-500/10 border-green-500/20 text-green-400">
          <div className="space-y-2">
            <p className="text-sm font-medium">✓ Workout parsed successfully!</p>
            <p className="text-xs text-green-300">
              Found {lastResult.workout.exercises.length} exercise(s) 
              • {formatConfidence(lastResult.confidence)} confidence
              • {lastResult.tokens_used} tokens used
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      {showPreview && lastResult && (
        <div className="p-4 bg-surface border border-border rounded space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-text-primary flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Preview Workout
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                variant="outline"
                size="sm"
                className="text-red-400 border-red-400/20 hover:bg-red-500/10"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-3 w-3 mr-1" />
                Add Workout
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Type:</span>
              <span className="px-2 py-1 bg-navy/20 text-navy border border-navy/20 rounded text-xs font-medium">
                {lastResult.workout.workout_type || 'strength'}
              </span>
              <span className="text-text-secondary">•</span>
              <span className="text-text-secondary">
                {formatConfidence(lastResult.confidence)} confidence
              </span>
            </div>

            <div className="space-y-2">
              {lastResult.workout.exercises.map((exercise, index) => (
                <div key={index} className="p-2 bg-bg border border-border rounded">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-text-primary capitalize">{exercise.name}</h4>
                    <span className="text-xs text-text-secondary px-2 py-1 bg-surface-2 rounded">
                      {lastResult.workout.workout_type || 'strength'}
                    </span>
                  </div>
                  
                  {exercise.sets && exercise.sets.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="text-sm text-text-secondary">
                          Set {setIndex + 1}: 
                          {set.reps && <span className="ml-1">{set.reps} reps</span>}
                          {set.weight_kg && <span className="ml-1">@ {Math.round(set.weight_kg * 2.205)} lbs</span>}
                          {set.duration_seconds && <span className="ml-1">{set.duration_seconds}s</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {exercise.distance_km && (
                    <p className="text-sm text-text-secondary mt-1">
                      Distance: {exercise.distance_km.toFixed(2)} km ({(exercise.distance_km * 0.621371).toFixed(2)} mi)
                    </p>
                  )}
                  
                  {exercise.duration_seconds && (
                    <p className="text-sm text-text-secondary mt-1">
                      Duration: {Math.floor(exercise.duration_seconds / 60)}:{(exercise.duration_seconds % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                  
                  {exercise.notes && (
                    <p className="text-sm text-text-secondary mt-1">{exercise.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </PremiumGate>
    </div>
  );
}