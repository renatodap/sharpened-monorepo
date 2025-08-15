import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/getSessionUser';
import type { HealthMetrics } from '@/lib/types/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.user_metadata?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';

    // Mock data - replace with actual database queries
    const healthMetrics: HealthMetrics = {
      workoutsLogged: 3842,
      avgWorkoutsPerUser: 4.3,
      foodEntriesLogged: 18567,
      avgFoodEntriesPerUser: 20.8,
      weightEntriesLogged: 2156,
      activeStreaks: 234,
      avgStreakLength: 12.5,
    };

    // Adjust for timeframe
    if (timeframe === 'week') {
      healthMetrics.workoutsLogged = Math.floor(healthMetrics.workoutsLogged * 0.25);
      healthMetrics.foodEntriesLogged = Math.floor(healthMetrics.foodEntriesLogged * 0.25);
      healthMetrics.weightEntriesLogged = Math.floor(healthMetrics.weightEntriesLogged * 0.25);
      healthMetrics.avgWorkoutsPerUser = healthMetrics.avgWorkoutsPerUser * 0.25;
      healthMetrics.avgFoodEntriesPerUser = healthMetrics.avgFoodEntriesPerUser * 0.25;
    }

    return NextResponse.json(healthMetrics);
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health metrics' },
      { status: 500 }
    );
  }
}