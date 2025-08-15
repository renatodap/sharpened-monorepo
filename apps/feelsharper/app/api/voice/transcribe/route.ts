/**
 * Voice Transcription API
 * Maps to PRD: Voice Input (Technical Requirement #1)
 */

import { NextResponse } from 'next/server';
import { VoiceTranscriber } from '@/lib/ai/voice/VoiceTranscriber';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get audio file from form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Get user context for better transcription
    const { data: userPatterns } = await supabase
      .from('user_patterns')
      .select('*')
      .eq('user_id', user.id)
      .eq('pattern_type', 'voice_pattern');

    // Transcribe audio
    const transcriber = new VoiceTranscriber();
    const result = await transcriber.process(
      audioFile,
      { patterns: userPatterns || [] },
      { model: 'whisper-1' } as any
    );

    // Store successful transcription pattern
    if (result.confidence > 0.8) {
      await supabase
        .from('user_context_store')
        .insert({
          user_id: user.id,
          context_type: 'voice_transcription',
          raw_input: audioFile.name,
          parsed_output: { transcript: result.data },
          confidence: result.confidence,
          model_used: 'whisper-1',
          tokens_used: result.tokens_used,
        });
    }

    return NextResponse.json({
      transcript: result.data,
      confidence: result.confidence,
    });
  } catch (error) {
    console.error('Voice transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}