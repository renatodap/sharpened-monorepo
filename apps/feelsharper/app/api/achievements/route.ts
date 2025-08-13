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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Get all available badges
    let badgesQuery = supabase
      .from('achievement_badges')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('points', { ascending: true });

    if (category) {
      badgesQuery = badgesQuery.eq('category', category);
    }

    const { data: badges, error: badgesError } = await badgesQuery;

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }

    // Get user's earned badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select(`
        *,
        achievement_badges(*)
      `)
      .eq('user_id', user.id);

    if (userBadgesError) {
      console.error('Error fetching user badges:', userBadgesError);
      return NextResponse.json({ error: 'Failed to fetch user badges' }, { status: 500 });
    }

    // Get user's current stats for progress calculation
    const userStats = await getUserStats(supabase, user.id);

    // Process badges to include progress and earned status
    const processedBadges = badges?.map(badge => {
      const earned = userBadges?.find(ub => ub.badge_id === badge.id);
      const progress = calculateBadgeProgress(badge, userStats);

      return {
        ...badge,
        earned: !!earned,
        earned_at: earned?.earned_at,
        progress: progress.percentage,
        progress_text: progress.text,
        is_featured: earned?.is_featured || false
      };
    }) || [];

    // Group by category
    const categorizedBadges = processedBadges.reduce((acc: any, badge: any) => {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push(badge);
      return acc;
    }, {});

    return NextResponse.json({
      badges: processedBadges,
      categorized: categorizedBadges,
      earned_count: userBadges?.length || 0,
      total_count: badges?.length || 0,
      total_points: userBadges?.reduce((sum, ub) => sum + (ub.achievement_badges?.points || 0), 0) || 0
    });

  } catch (error) {
    console.error('Achievements API error:', error);
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
    const { action, badge_id } = body;

    switch (action) {
      case 'check_achievements':
        return await checkAndAwardAchievements(supabase, user.id);
      
      case 'feature_badge':
        return await featureBadge(supabase, user.id, badge_id);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Achievements POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getUserStats(supabase: any, userId: string) {
  // Get workout stats
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId);

  // Get streak stats
  const { data: streaks } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId);

  // Get nutrition stats (assuming you have nutrition tracking)
  const { data: nutritionLogs } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId);

  // Calculate stats
  const totalWorkouts = workouts?.length || 0;
  const workoutStreak = streaks?.find(s => s.streak_type === 'workout')?.current_streak || 0;
  const longestStreak = streaks?.find(s => s.streak_type === 'workout')?.longest_streak || 0;
  
  const morningWorkouts = workouts?.filter(w => {
    const hour = new Date(w.created_at).getHours();
    return hour < 8;
  }).length || 0;

  const recentWorkouts = workouts?.filter(w => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return new Date(w.created_at) > weekAgo;
  }).length || 0;

  const proteinStreak = calculateProteinStreak(nutritionLogs || []);

  return {
    total_workouts: totalWorkouts,
    workout_streak: workoutStreak,
    longest_streak: longestStreak,
    morning_workouts: morningWorkouts,
    weekly_workouts: recentWorkouts,
    protein_streak: proteinStreak,
    // Add more stats as needed
  };
}

function calculateBadgeProgress(badge: any, userStats: any) {
  const requirements = badge.requirements;
  
  if (requirements.workouts) {
    const progress = Math.min(100, (userStats.total_workouts / requirements.workouts) * 100);
    return {
      percentage: progress,
      text: `${userStats.total_workouts}/${requirements.workouts} workouts`
    };
  }
  
  if (requirements.workout_streak) {
    const progress = Math.min(100, (userStats.workout_streak / requirements.workout_streak) * 100);
    return {
      percentage: progress,
      text: `${userStats.workout_streak}/${requirements.workout_streak} day streak`
    };
  }
  
  if (requirements.workouts_per_week) {
    const progress = Math.min(100, (userStats.weekly_workouts / requirements.workouts_per_week) * 100);
    return {
      percentage: progress,
      text: `${userStats.weekly_workouts}/${requirements.workouts_per_week} this week`
    };
  }
  
  if (requirements.morning_workouts) {
    const progress = Math.min(100, (userStats.morning_workouts / requirements.morning_workouts) * 100);
    return {
      percentage: progress,
      text: `${userStats.morning_workouts}/${requirements.morning_workouts} morning workouts`
    };
  }
  
  if (requirements.protein_streak) {
    const progress = Math.min(100, (userStats.protein_streak / requirements.protein_streak) * 100);
    return {
      percentage: progress,
      text: `${userStats.protein_streak}/${requirements.protein_streak} days`
    };
  }

  return { percentage: 0, text: 'Not started' };
}

function calculateProteinStreak(nutritionLogs: any[]) {
  // This is a simplified calculation - you'd implement proper protein goal tracking
  return 0;
}

async function checkAndAwardAchievements(supabase: any, userId: string) {
  const userStats = await getUserStats(supabase, userId);
  
  // Get all badges the user hasn't earned yet
  const { data: availableBadges } = await supabase
    .from('achievement_badges')
    .select('*')
    .eq('is_active', true)
    .not('id', 'in', `(
      SELECT badge_id FROM user_badges WHERE user_id = '${userId}'
    )`);

  const newlyEarned = [];

  for (const badge of availableBadges || []) {
    const progress = calculateBadgeProgress(badge, userStats);
    
    if (progress.percentage >= 100) {
      // Award the badge
      const { error: insertError } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badge.id,
          progress: 100
        });

      if (!insertError) {
        newlyEarned.push(badge);
      }
    }
  }

  return NextResponse.json({
    newly_earned: newlyEarned,
    message: newlyEarned.length > 0 
      ? `Congratulations! You earned ${newlyEarned.length} new badge${newlyEarned.length > 1 ? 's' : ''}!`
      : 'Keep going! No new badges earned this time.'
  });
}

async function featureBadge(supabase: any, userId: string, badgeId: string) {
  // First, unfeature all current badges
  await supabase
    .from('user_badges')
    .update({ is_featured: false })
    .eq('user_id', userId);

  // Feature the selected badge
  const { error } = await supabase
    .from('user_badges')
    .update({ is_featured: true })
    .eq('user_id', userId)
    .eq('badge_id', badgeId);

  if (error) {
    return NextResponse.json({ error: 'Failed to feature badge' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}