/**
 * VoiceInputButton - Voice recording and transcription button
 * Maps to PRD: Voice Input (Technical Requirement #1 - MUST HAVE)
 */

"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  placeholder?: string;
}

export function VoiceInputButton({
  onTranscript,
  onError,
  className,
  variant = 'outline',
  size = 'sm',
  placeholder = 'Hold to record',
}: VoiceInputButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Check for browser support
  const isSupported = typeof window !== 'undefined' && 
    (navigator.mediaDevices?.getUserMedia || 
     (window as any).webkitSpeechRecognition);

  // Check if Web Speech API is available
  const hasWebSpeechAPI = typeof window !== 'undefined' && 
    ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition);

  // Start Web Speech API recognition
  const startWebSpeechAPI = useCallback(() => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || 
                              (window as any).SpeechRecognition;
    
    if (!SpeechRecognition) return false;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      if (event.results[0].isFinal) {
        onTranscript(transcript);
        setIsRecording(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      onError?.(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    return true;
  }, [onTranscript, onError]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Try Web Speech API first (free, fast)
      if (hasWebSpeechAPI && startWebSpeechAPI()) {
        setIsRecording(true);
        return;
      }

      // Fallback to MediaRecorder + Whisper API
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(chunksRef.current, { type: mimeType });
          
          // Send to API for transcription
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          
          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Transcription failed');
          }

          const data = await response.json();
          onTranscript(data.transcript);
        } catch (error) {
          console.error('Transcription error:', error);
          onError?.('Failed to transcribe audio. Please try again.');
        } finally {
          setIsProcessing(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      onError?.('Microphone access denied. Please enable microphone permissions.');
    }
  }, [hasWebSpeechAPI, startWebSpeechAPI, onTranscript, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    // Stop Web Speech API
    const SpeechRecognition = (window as any).webkitSpeechRecognition || 
                              (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      // Will trigger onend event which sets isRecording to false
      return;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  // Handle button press
  const handleMouseDown = () => {
    if (!isRecording && !isProcessing) {
      startRecording();
    }
  };

  const handleMouseUp = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseDown();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMouseUp();
  };

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size === 'icon' ? 'sm' : size}
      className={cn(
        'relative min-w-8 w-8 h-8',
        isRecording && 'bg-red-500 hover:bg-red-600',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={handleMouseUp} // Stop if mouse leaves button
      disabled={isProcessing}
      title={placeholder}
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <>
          <MicOff className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        </>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}

// Larger variant for main input areas
export function VoiceInputField({
  onTranscript,
  onError,
  className,
  label = 'Tap and hold to record',
}: VoiceInputButtonProps & { label?: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <VoiceInputButton
        onTranscript={onTranscript}
        onError={onError}
        className="w-full h-24 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors"
        variant="ghost"
        size="default"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {isProcessing ? (
          <>
            <Loader2 className="h-8 w-8 mb-2 animate-spin text-primary" />
            <span className="text-sm text-text-secondary">Processing...</span>
          </>
        ) : isRecording ? (
          <>
            <div className="relative">
              <MicOff className="h-8 w-8 mb-2 text-red-500" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            </div>
            <span className="text-sm text-red-500">Recording... Release to stop</span>
          </>
        ) : (
          <>
            <Mic className="h-8 w-8 mb-2 text-text-secondary" />
            <span className="text-sm text-text-secondary">{label}</span>
          </>
        )}
      </div>
    </div>
  );
}