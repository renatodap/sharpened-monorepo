import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/getSessionUser';
import type { ProductMetrics } from '@/lib/types/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mock data - replace with actual database queries
    const productMetrics: ProductMetrics = {
      dau: 342,
      wau: 612,
      mau: 892,
      stickiness: 38.3,
      featureAdoption: {
        workoutLogging: 78.5,
        foodLogging: 85.2,
        weightTracking: 64.1,
        aiCoach: 45.8,
        progressGraphs: 67.3,
      },
      timeToValue: 3.2,
    };

    return NextResponse.json(productMetrics);
  } catch (error) {
    console.error('Error fetching product metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product metrics' },
      { status: 500 }
    );
  }
}