/**
 * Upgrade Prompt API - Check if user should be prompted to upgrade
 * Maps to PRD: Freemium conversion strategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { FeatureGate } from '@/lib/freemium/FeatureGate';

export async function GET(request: NextRequest) {
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

    // Get user's usage for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: usageData, error: usageError } = await supabase
      .from('ai_usage_tracking')
      .select('endpoint')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString());

    if (usageError) {
      console.error('Failed to get usage data:', usageError);
      return NextResponse.json(
        { should_prompt: false, urgency: 0 },
        { status: 200 }
      );
    }

    // Count usage by feature
    const usageCounts: Record<string, number> = {};
    for (const usage of usageData || []) {
      usageCounts[usage.endpoint] = (usageCounts[usage.endpoint] || 0) + 1;
    }

    // Check if user should be prompted to upgrade
    const shouldPrompt = FeatureGate.shouldPromptUpgrade('free', usageCounts);
    const urgency = FeatureGate.calculateUpgradeUrgency('free', usageCounts);

    return NextResponse.json({
      should_prompt: shouldPrompt,
      urgency: urgency,
      usage_summary: usageCounts
    });

  } catch (error) {
    console.error('Upgrade prompt API error:', error);
    return NextResponse.json(
      { should_prompt: false, urgency: 0 },
      { status: 200 }
    );
  }
}