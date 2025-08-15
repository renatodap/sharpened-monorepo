/**
 * Monthly Usage API - Get usage count for current month
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

    const { feature, start_date } = await request.json();
    
    if (!feature || !start_date) {
      return NextResponse.json(
        { error: 'Missing feature or start_date' },
        { status: 400 }
      );
    }

    // Count usage from ai_usage_tracking table
    const { data, error } = await supabase
      .from('ai_usage_tracking')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('endpoint', feature)
      .gte('created_at', start_date);

    if (error) {
      console.error('Failed to get usage count:', error);
      return NextResponse.json(
        { error: 'Failed to get usage' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      feature,
      usage_count: data?.length || 0,
      start_date
    });

  } catch (error) {
    console.error('Monthly usage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}