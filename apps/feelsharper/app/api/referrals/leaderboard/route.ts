import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all-time'; // all-time, monthly, weekly

    let dateFilter = '';
    const now = new Date();
    
    switch (timeframe) {
      case 'weekly':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = `AND ur.created_at >= '${weekAgo.toISOString()}'`;
        break;
      case 'monthly':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = `AND ur.created_at >= '${monthAgo.toISOString()}'`;
        break;
      default:
        dateFilter = '';
    }

    // Get referral leaderboard with anonymized data
    const { data: leaderboard, error } = await supabase.rpc('get_referral_leaderboard', {
      date_filter: dateFilter
    });

    if (error) {
      console.error('Error fetching referral leaderboard:', error);
      // Fallback query
      const { data: fallbackData } = await supabase
        .from('user_referrals')
        .select(`
          referrer_id,
          profiles!inner(referral_code)
        `)
        .eq('status', 'activated');

      // Group and count referrals
      const referralCounts = (fallbackData || []).reduce((acc: any, referral: any) => {
        const referrerId = referral.referrer_id;
        if (!acc[referrerId]) {
          acc[referrerId] = {
            referrer_id: referrerId,
            referral_code: referral.profiles.referral_code,
            total_referrals: 0,
            display_name: `User${referrerId.slice(-4)}`
          };
        }
        acc[referrerId].total_referrals++;
        return acc;
      }, {});

      const sortedLeaderboard = Object.values(referralCounts)
        .sort((a: any, b: any) => b.total_referrals - a.total_referrals)
        .slice(0, 10)
        .map((entry: any, index: number) => ({
          ...entry,
          rank: index + 1
        }));

      return NextResponse.json({
        leaderboard: sortedLeaderboard,
        timeframe
      });
    }

    return NextResponse.json({
      leaderboard: leaderboard || [],
      timeframe
    });

  } catch (error) {
    console.error('Referral leaderboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create the database function if it doesn't exist
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Create the stored procedure for referral leaderboard
    const { error } = await supabase.rpc('create_referral_leaderboard_function');
    
    if (error) {
      console.error('Error creating function:', error);
      return NextResponse.json({ error: 'Failed to create function' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}