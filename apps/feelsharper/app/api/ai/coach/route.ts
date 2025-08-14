import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIOrchestrator } from '@/lib/ai/core/AIOrchestrator';
import { CoachResponse } from '@/lib/ai/types';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const { message, stream = false } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Process with AI
    const orchestrator = new AIOrchestrator();
    
    if (stream) {
      // For streaming responses (future implementation)
      // Return a ReadableStream that sends chunks as they arrive
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            // This would need to be implemented in SmartCoach
            // to support streaming from Claude
            const result = await orchestrator.processRequest<CoachResponse>(
              'coach_chat',
              message,
              user.id
            );
            
            controller.enqueue(encoder.encode(JSON.stringify(result)));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        }
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const result = await orchestrator.processRequest<CoachResponse>(
      'coach_chat',
      message,
      user.id
    );

    if (!result.success) {
      // Check if it's a usage limit error
      if (result.error?.includes('limit reached')) {
        return NextResponse.json(
          { 
            error: result.error,
            upgrade_required: true,
            usage: await orchestrator.getUserUsageSummary(user.id)
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    // Generate insights if applicable
    if (result.data?.action_items && result.data.action_items.length > 0) {
      // Store high-priority action items as insights
      for (const item of result.data.action_items.filter(a => a.priority === 'high')) {
        await supabase.from('ai_insights').insert({
          user_id: user.id,
          insight_type: 'recommendation',
          title: 'Coach Recommendation',
          content: item.description,
          priority: 8,
          is_actionable: true,
          action_url: item.type === 'workout' ? '/workouts/add' : 
                     item.type === 'nutrition' ? '/food/add' : '/today'
        });
      }
    }

    // Check if user should be prompted to upgrade
    const shouldUpgrade = await orchestrator.shouldPromptUpgrade(user.id);

    return NextResponse.json({
      success: true,
      response: result.data,
      confidence: result.confidence,
      tokens_used: result.tokens_used,
      cost_cents: result.cost_cents,
      processing_time_ms: result.processing_time_ms,
      prompt_upgrade: shouldUpgrade
    });

  } catch (error) {
    console.error('Coach chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for conversation history
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get conversation history
    const { data: conversations, error } = await supabase
      .from('ai_conversation_memory')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    // Group by conversation_id
    const grouped = conversations?.reduce((acc, msg) => {
      if (!acc[msg.conversation_id]) {
        acc[msg.conversation_id] = [];
      }
      acc[msg.conversation_id].push(msg);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      conversations: grouped || {}
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}