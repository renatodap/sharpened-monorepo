import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/getSessionUser';
import type { RevenueMetrics } from '@/lib/types/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Mock data - replace with actual database queries
    const revenueMetrics: RevenueMetrics = {
      mrr: 12847,
      arr: 154164,
      arpu: 14.41,
      ltv: 432.50,
      cac: 45.20,
      churnRate: 3.2,
      growthRate: 12.8,
    };

    return NextResponse.json(revenueMetrics);
  } catch (error) {
    console.error('Error fetching revenue metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue metrics' },
      { status: 500 }
    );
  }
}