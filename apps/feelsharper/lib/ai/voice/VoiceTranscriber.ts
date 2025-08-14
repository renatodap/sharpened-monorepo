import OpenAI from 'openai';
import { ModelConfig } from '@/lib/ai/types';

export class VoiceTranscriber {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async process(
    audioFile: File | Blob,
    context: any,
    config: ModelConfig
  ): Promise<{ data: string; confidence: number; tokens_used: number }> {
    try {
      // Convert Blob to File if needed
      const file = audioFile instanceof File 
        ? audioFile 
        : new File([audioFile], 'audio.webm', { type: audioFile.type });

      // Transcribe with Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language: 'en',
        response_format: 'verbose_json'
      });

      // Apply user voice patterns for better accuracy
      const corrected = this.applyVoicePatterns(
        transcription.text,
        context.patterns
      );

      return {
        data: corrected,
        confidence: this.calculateConfidence(transcription),
        tokens_used: Math.ceil(transcription.text.length / 4) // Approximate
      };

    } catch (error) {
      console.error('Voice transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  private applyVoicePatterns(text: string, patterns: any[]): string {
    let corrected = text;
    
    // Apply known voice patterns (user-specific pronunciations)
    const voicePatterns = patterns?.filter(p => p.pattern_type === 'voice_pattern') || [];
    
    for (const pattern of voicePatterns) {
      const regex = new RegExp(pattern.pattern_key, 'gi');
      corrected = corrected.replace(regex, pattern.pattern_value.correction);
    }
    
    // Common fitness-related corrections
    const commonCorrections: Record<string, string> = {
      'benchpress': 'bench press',
      'dead lift': 'deadlift',
      'pull up': 'pull-up',
      'push up': 'push-up',
      'dumb bell': 'dumbbell',
      'bar bell': 'barbell',
      'kettle bell': 'kettlebell'
    };
    
    Object.entries(commonCorrections).forEach(([wrong, right]) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      corrected = corrected.replace(regex, right);
    });
    
    return corrected;
  }

  private calculateConfidence(transcription: any): number {
    // Whisper provides segment-level confidence
    if (transcription.segments && transcription.segments.length > 0) {
      const avgConfidence = transcription.segments.reduce(
        (sum: number, seg: any) => sum + (seg.no_speech_prob || 0),
        0
      ) / transcription.segments.length;
      
      // Convert no_speech_prob to confidence (inverse)
      return Math.max(0.5, 1 - avgConfidence);
    }
    
    // Default confidence if no segments
    return 0.7;
  }
}