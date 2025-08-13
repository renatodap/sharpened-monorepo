"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  onEnd?: () => void;
  placeholder?: string;
  continuous?: boolean;
  className?: string;
}

export function VoiceInput({ 
  onTranscript, 
  onEnd,
  placeholder = "Tap to speak...",
  continuous = false,
  className 
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        };

        recognition.onresult = (event) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptResult = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              final += transcriptResult;
            } else {
              interim += transcriptResult;
            }
          }

          if (final) {
            setTranscript(prev => prev + final);
            onTranscript(transcript + final);
          }
          
          setInterimTranscript(interim);

          // Reset timeout for continuous mode
          if (continuous && timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              stopListening();
            }, 3000); // Stop after 3 seconds of silence
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          // Provide user feedback based on error
          switch (event.error) {
            case 'no-speech':
              // Auto-retry for no speech detected
              if (continuous) {
                setTimeout(() => startListening(), 500);
              }
              break;
            case 'not-allowed':
              alert('Microphone access denied. Please enable microphone permissions.');
              break;
            case 'network':
              alert('Network error. Please check your connection.');
              break;
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          onEnd?.();
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [continuous, transcript, onTranscript, onEnd]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        setInterimTranscript('');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  if (!isSupported) {
    return (
      <div className={cn("text-center p-4 bg-surface rounded-lg border border-border", className)}>
        <VolumeX className="w-8 h-8 mx-auto mb-2 text-text-muted" />
        <p className="text-text-secondary text-sm">
          Voice input is not supported in your browser. Please try Chrome or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Transcript Display */}
      <div className="min-h-[120px] p-4 bg-surface rounded-lg border border-border">
        <div className="text-text-primary">
          {transcript && (
            <span className="text-text-primary">{transcript}</span>
          )}
          {interimTranscript && (
            <span className="text-text-muted italic">{interimTranscript}</span>
          )}
          {!transcript && !interimTranscript && (
            <span className="text-text-muted">{placeholder}</span>
          )}
        </div>
        
        {/* Visual indicator when listening */}
        {isListening && (
          <div className="flex items-center gap-2 mt-3 text-success">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-success rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-6 bg-success rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-5 bg-success rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
              <div className="w-1 h-7 bg-success rounded animate-pulse" style={{ animationDelay: '450ms' }}></div>
            </div>
            <span className="text-sm">Listening...</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Main record button */}
        <button
          onClick={toggleListening}
          disabled={!isSupported}
          className={cn(
            "flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-medium transition-all",
            "min-h-[56px]", // Minimum touch target
            isListening
              ? "bg-error text-white hover:bg-red-600 active:scale-95"
              : "bg-navy text-white hover:bg-navy-600 active:scale-95",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isListening ? (
            <>
              <Square className="w-5 h-5" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Start Voice Input
            </>
          )}
        </button>

        {/* Clear button */}
        {(transcript || interimTranscript) && (
          <button
            onClick={clearTranscript}
            className="p-3 bg-surface hover:bg-surface-2 rounded-xl border border-border transition-colors min-w-[48px] min-h-[48px]"
            aria-label="Clear transcript"
          >
            <VolumeX className="w-5 h-5 text-text-muted" />
          </button>
        )}
      </div>

      {/* Voice tips */}
      <div className="text-xs text-text-muted space-y-1">
        <p>💡 Tips for better voice recognition:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Speak clearly and at normal pace</li>
          <li>Reduce background noise</li>
          <li>Use specific terms (e.g., "3 sets of 10 push-ups")</li>
        </ul>
      </div>
    </div>
  );
}

// Hook for voice commands
export function useVoiceCommands(commands: Record<string, () => void>) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const lastResult = event.results[event.results.length - 1];
          if (lastResult.isFinal) {
            const transcript = lastResult[0].transcript.toLowerCase().trim();
            
            // Check for command matches
            Object.entries(commands).forEach(([command, action]) => {
              if (transcript.includes(command.toLowerCase())) {
                action();
              }
            });
          }
        };

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [commands]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return {
    isListening,
    startListening,
    stopListening,
    isSupported: !!recognitionRef.current
  };
}