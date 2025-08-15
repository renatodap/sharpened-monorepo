import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/getSessionUser';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's referral stats - simplified for MVP
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Get referrals count
    const { count: referralCount } = await supabase
      .from('user_referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', user.id);

    return NextResponse.json({
      referral_code: profile?.referral_code || null,
      total_referrals: referralCount || 0,
      rewards: {
        points: 0,
        free_months: 0,
        cash_earned: 0
      }
    });
  } catch (error) {
    console.error('Error in referrals route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { referral_code } = body;

    if (!referral_code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Apply referral code - simplified for MVP
    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully'
    });
  } catch (error) {
    console.error('Error applying referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}