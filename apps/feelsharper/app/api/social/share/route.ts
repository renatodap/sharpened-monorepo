import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/getSessionUser';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { shareType, platform, contentId, metadata = {} } = body;

    // Validate share type
    const validShareTypes = [
      'progress_card', 'achievement', 'challenge', 'squad_invite',
      'workout', 'pr', 'streak', 'transformation'
    ];
    
    if (!validShareTypes.includes(shareType)) {
      return NextResponse.json({ error: 'Invalid share type' }, { status: 400 });
    }

    // Log share event
    const { error: insertError } = await supabase
      .from('share_events')
      .insert({
        user_id: user.id,
        share_type: shareType,
        platform,
        content_id: contentId,
        metadata
      });

    if (insertError) {
      console.error('Error logging share event:', insertError);
      return NextResponse.json({ error: 'Failed to log share event' }, { status: 500 });
    }

    // Generate share data based on type
    let shareData;
    
    switch (shareType) {
      case 'progress_card':
        shareData = await generateProgressCard(supabase, user.id, metadata);
        break;
      case 'achievement':
        shareData = await generateAchievementCard(supabase, user.id, contentId, metadata);
        break;
      case 'workout':
        shareData = await generateWorkoutCard(supabase, user.id, contentId, metadata);
        break;
      case 'streak':
        shareData = await generateStreakCard(supabase, user.id, metadata);
        break;
      case 'pr':
        shareData = await generatePRCard(supabase, user.id, contentId, metadata);
        break;
      default:
        shareData = await generateGenericCard(supabase, user.id, metadata);
    }

    return NextResponse.json({ 
      success: true, 
      shareData,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareType}/${contentId || 'generic'}`
    });

  } catch (error) {
    console.error('Share API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateProgressCard(supabase: any, userId: string, metadata: any) {
  // Get user profile and recent progress
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: recentWorkouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  const { data: currentStreak } = await supabase
    .from('user_streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .eq('streak_type', 'workout')
    .single();

  return {
    title: "💪 Crushing My Fitness Goals!",
    subtitle: "Join me on FeelSharper",
    stats: {
      workouts: recentWorkouts?.length || 0,
      streak: currentStreak?.current_streak || 0,
      period: "30 days"
    },
    hashtags: "#FeelSharper #FitnessJourney #Consistency #HealthyLifestyle",
    text: `Just completed ${recentWorkouts?.length || 0} workouts this month with a ${currentStreak?.current_streak || 0}-day streak! 🔥 Join me on FeelSharper to track your fitness journey!`,
    image: `/api/social/cards/progress?userId=${userId}&workouts=${recentWorkouts?.length || 0}&streak=${currentStreak?.current_streak || 0}`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${profile?.referral_code || 'share'}`
  };
}

async function generateAchievementCard(supabase: any, userId: string, badgeId: string, metadata: any) {
  const { data: badge } = await supabase
    .from('user_badges')
    .select(`
      *,
      achievement_badges(*)
    `)
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();

  const badgeInfo = badge?.achievement_badges;

  return {
    title: `🏆 ${badgeInfo?.name || 'Achievement Unlocked'}!`,
    subtitle: badgeInfo?.description || 'New milestone reached',
    hashtags: "#FeelSharper #Achievement #FitnessGoals #Milestone",
    text: `Just earned the "${badgeInfo?.name}" badge on FeelSharper! ${badgeInfo?.description} 🏆`,
    image: `/api/social/cards/achievement?badgeId=${badgeId}&icon=${badgeInfo?.icon}&color=${badgeInfo?.color}`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${metadata.referralCode || 'achievement'}`
  };
}

async function generateWorkoutCard(supabase: any, userId: string, workoutId: string, metadata: any) {
  const { data: workout } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .eq('user_id', userId)
    .single();

  return {
    title: "💪 Workout Complete!",
    subtitle: `${workout?.duration_minutes || 0} minutes • ${workout?.exercises?.length || 0} exercises`,
    hashtags: "#FeelSharper #WorkoutComplete #FitnessJourney #Training",
    text: `Just crushed a ${workout?.duration_minutes || 0}-minute workout on FeelSharper! 💪 ${workout?.exercises?.length || 0} exercises down, gains up! 🔥`,
    image: `/api/social/cards/workout?workoutId=${workoutId}&duration=${workout?.duration_minutes}&exercises=${workout?.exercises?.length}`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${metadata.referralCode || 'workout'}`
  };
}

async function generateStreakCard(supabase: any, userId: string, metadata: any) {
  const { data: streak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('streak_type', metadata.streakType || 'workout')
    .single();

  const streakDays = streak?.current_streak || 0;
  const streakEmoji = streakDays >= 30 ? '🔥' : streakDays >= 7 ? '⚡' : '💪';

  return {
    title: `${streakEmoji} ${streakDays}-Day Streak!`,
    subtitle: `Consistency is key to success`,
    hashtags: "#FeelSharper #Consistency #StreakMode #DailyGoals #FitnessJourney",
    text: `${streakDays} days of consistency and counting! ${streakEmoji} Who's joining me on this journey? Download FeelSharper and let's build healthy habits together!`,
    image: `/api/social/cards/streak?days=${streakDays}&type=${metadata.streakType || 'workout'}`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${metadata.referralCode || 'streak'}`
  };
}

async function generatePRCard(supabase: any, userId: string, recordId: string, metadata: any) {
  const { data: pr } = await supabase
    .from('personal_records')
    .select('*')
    .eq('id', recordId)
    .eq('user_id', userId)
    .single();

  return {
    title: "🎯 New Personal Record!",
    subtitle: `${pr?.exercise_name}: ${pr?.value} ${pr?.unit}`,
    hashtags: "#FeelSharper #PersonalRecord #Stronger #FitnessGoals #GainsMode",
    text: `New PR alert! 🚨 Just hit ${pr?.value} ${pr?.unit} on ${pr?.exercise_name}! The grind never stops 💪 Track your PRs with FeelSharper!`,
    image: `/api/social/cards/pr?exercise=${pr?.exercise_name}&value=${pr?.value}&unit=${pr?.unit}`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${metadata.referralCode || 'pr'}`
  };
}

async function generateGenericCard(supabase: any, userId: string, metadata: any) {
  return {
    title: "💪 Join Me on FeelSharper!",
    subtitle: "Track workouts, build habits, achieve goals",
    hashtags: "#FeelSharper #FitnessJourney #HealthyLifestyle #WorkoutBuddy",
    text: "Building better habits and crushing fitness goals with FeelSharper! Join me and let's get stronger together 💪",
    image: `/api/social/cards/generic`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}?ref=${metadata.referralCode || 'generic'}`
  };
}