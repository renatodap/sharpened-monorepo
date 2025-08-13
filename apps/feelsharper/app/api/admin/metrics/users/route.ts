import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/getSessionUser';
import type { UserMetrics } from '@/lib/types/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';

    // Mock data - replace with actual database queries
    const userMetrics: UserMetrics = {
      totalUsers: 1247,
      activeUsers: 892,
      newUsers: 156,
      churnedUsers: 23,
      retentionRate: 84.2,
      avgSessionDuration: 28,
      avgDailySessions: 2.1,
    };

    // Adjust for timeframe
    if (timeframe === 'week') {
      userMetrics.activeUsers = Math.floor(userMetrics.activeUsers * 0.3);
      userMetrics.newUsers = Math.floor(userMetrics.newUsers * 0.25);
      userMetrics.churnedUsers = Math.floor(userMetrics.churnedUsers * 0.15);
    }

    return NextResponse.json(userMetrics);
  } catch (error) {
    console.error('Error fetching user metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user metrics' },
      { status: 500 }
    );
  }
}