/**
 * Usage Tracking API - Track feature usage for freemium limits
 * Maps to PRD: Freemium paywall tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { feature, timestamp } = await request.json();
    
    if (!feature) {
      return NextResponse.json(
        { error: 'Missing feature' },
        { status: 400 }
      );
    }

    // Get user tier (for now, assume free)
    const userTier = 'free';

    // Track usage in ai_usage_tracking table
    const { error: insertError } = await supabase
      .from('ai_usage_tracking')
      .insert({
        user_id: user.id,
        endpoint: feature,
        tokens_used: 0, // Feature usage tracking, not token usage
        cost_cents: 0,
        tier: userTier,
        created_at: timestamp || new Date().toISOString()
      });

    if (insertError) {
      console.error('Failed to track usage:', insertError);
      return NextResponse.json(
        { error: 'Failed to track usage' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feature,
      tracked_at: timestamp || new Date().toISOString()
    });

  } catch (error) {
    console.error('Usage tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}