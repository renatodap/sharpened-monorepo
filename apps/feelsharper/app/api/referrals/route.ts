import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/getSessionUser';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's referral stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    const { data: referrals, error: referralsError } = await supabase
      .from('user_referrals')
      .select(`
        *,
        referred:referred_id (
          id,
          profiles!inner (
            id
          )
        )
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError);
      return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
    }

    // Calculate stats
    const stats = {
      total_referrals: referrals?.length || 0,
      pending_referrals: referrals?.filter(r => r.status === 'pending').length || 0,
      activated_referrals: referrals?.filter(r => r.status === 'activated').length || 0,
      total_rewards: Math.floor((referrals?.filter(r => r.status === 'activated').length || 0) / 3), // 1 month free per 3 referrals
      pending_rewards: referrals?.filter(r => r.status === 'activated' && !r.reward_claimed).length || 0
    };

    return NextResponse.json({
      referral_code: profile?.referral_code,
      referrals: referrals || [],
      stats
    });

  } catch (error) {
    console.error('Referrals API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, referral_code, referred_user_id } = body;

    switch (action) {
      case 'apply_referral':
        return await applyReferralCode(supabase, user.id, referral_code);
      
      case 'claim_reward':
        return await claimReferralReward(supabase, user.id, referred_user_id);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Referrals POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function applyReferralCode(supabase: any, userId: string, referralCode: string) {
  // Check if user already has a referrer
  const { data: profile } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('id', userId)
    .single();

  if (profile?.referred_by) {
    return NextResponse.json({ error: 'You have already used a referral code' }, { status: 400 });
  }

  // Find the referrer
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', referralCode)
    .single();

  if (!referrer) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
  }

  if (referrer.id === userId) {
    return NextResponse.json({ error: 'You cannot refer yourself' }, { status: 400 });
  }

  // Create referral record
  const { error: insertError } = await supabase
    .from('user_referrals')
    .insert({
      referrer_id: referrer.id,
      referred_id: userId,
      referral_code: referralCode,
      status: 'accepted',
      accepted_at: new Date().toISOString()
    });

  if (insertError) {
    console.error('Error creating referral:', insertError);
    return NextResponse.json({ error: 'Failed to apply referral code' }, { status: 500 });
  }

  // Update profile with referrer
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ referred_by: referrer.id })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating profile:', updateError);
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Referral code applied successfully!'
  });
}

async function claimReferralReward(supabase: any, userId: string, referredUserId: string) {
  // Verify the referral exists and is activated
  const { data: referral } = await supabase
    .from('user_referrals')
    .select('*')
    .eq('referrer_id', userId)
    .eq('referred_id', referredUserId)
    .eq('status', 'activated')
    .eq('reward_claimed', false)
    .single();

  if (!referral) {
    return NextResponse.json({ error: 'No claimable reward found' }, { status: 400 });
  }

  // Mark reward as claimed
  const { error: updateError } = await supabase
    .from('user_referrals')
    .update({ reward_claimed: true })
    .eq('id', referral.id);

  if (updateError) {
    console.error('Error claiming reward:', updateError);
    return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 });
  }

  // Here you would integrate with your subscription system to apply the reward
  // For now, we'll just return success
  
  return NextResponse.json({ 
    success: true, 
    message: 'Reward claimed successfully! Check your subscription for updates.'
  });
}