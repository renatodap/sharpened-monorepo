'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Mic, MicOff, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface AIWorkoutInputProps {
  onParse: (workout: any) => void;
  className?: string;
}

export function AIWorkoutInput({ onParse, className }: AIWorkoutInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleTextParse = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/parse-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, save: false })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.upgrade_required) {
          setShowUpgrade(true);
          setError(data.error);
        } else {
          setError(data.error || 'Failed to parse workout');
        }
        return;
      }
      
      if (data.prompt_upgrade) {
        setShowUpgrade(true);
      }
      
      onParse(data.workout);
      setInput('');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];
        
        mediaRecorder.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };
        
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop());
          
          // Send to API for transcription and parsing
          const formData = new FormData();
          formData.append('audio', blob);
          
          setIsLoading(true);
          try {
            const response = await fetch('/api/ai/voice-workout', {
              method: 'POST',
              body: formData
            });
            
            const data = await response.json();
            if (response.ok) {
              onParse(data.workout);
            } else {
              setError(data.error || 'Failed to process voice input');
            }
          } catch (err) {
            setError('Failed to process voice recording');
          } finally {
            setIsLoading(false);
          }
        };
        
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        setError('Microphone access denied');
      }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-surface rounded-lg p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI Workout Parser</h3>
        </div>
        
        <div className="space-y-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your workout in natural language...
Examples:
• Bench press 3x8 @135lbs, squats 5x5 @225
• 5k run in 25 minutes
• 3 rounds: 10 burpees, 20 box jumps, 30 KB swings"
            className="w-full h-32 px-3 py-2 bg-bg border border-border rounded-lg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            disabled={isLoading || isRecording}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleTextParse}
              disabled={!input.trim() || isLoading || isRecording}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Parse Workout
                </>
              )}
            </Button>
            
            <Button
              onClick={handleVoiceRecord}
              variant={isRecording ? 'destructive' : 'outline'}
              disabled={isLoading}
              className="px-3"
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-500">{error}</p>
              {showUpgrade && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary hover:text-primary/80 text-sm mt-1"
                  onClick={() => window.location.href = '/settings/subscription'}
                >
                  Upgrade to Pro →
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-3 text-xs text-muted">
          <p>✓ Handles any format: sets x reps, circuits, AMRAP, cardio</p>
          <p>✓ Auto-converts lbs to kg</p>
          <p>✓ Learns your exercise abbreviations</p>
        </div>
      </div>
    </div>
  );
}