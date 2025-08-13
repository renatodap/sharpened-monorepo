import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/getSessionUser';

// This would be replaced with actual database operations
const mockFlags = [
  {
    key: 'ai_coach_chat',
    name: 'AI Coach Chat',
    description: 'Enable AI-powered coaching chat feature',
    enabled: true,
    rolloutPercentage: 100,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    key: 'premium_insights',
    name: 'Premium Insights',
    description: 'Advanced analytics and insights for premium users',
    enabled: true,
    rolloutPercentage: 100,
    conditions: [
      {
        type: 'user_property',
        operator: 'in',
        property: 'subscriptionTier',
        value: ['basic', 'premium'],
      },
    ],
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    key: 'social_features',
    name: 'Social Features',
    description: 'Social sharing and leaderboards',
    enabled: false,
    rolloutPercentage: 0,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    key: 'mobile_app_promotion',
    name: 'Mobile App Promotion',
    description: 'Show mobile app download prompts',
    enabled: true,
    rolloutPercentage: 50,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    key: 'enhanced_food_logging',
    name: 'Enhanced Food Logging',
    description: 'New food logging interface with AI suggestions',
    enabled: true,
    rolloutPercentage: 25,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    key: 'workout_programs',
    name: 'Workout Programs',
    description: 'Structured workout program system',
    enabled: true,
    rolloutPercentage: 75,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { key } = await params;
    const flag = mockFlags.find(f => f.key === key);

    if (!flag) {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 });
    }

    return NextResponse.json({ flag });
  } catch (error) {
    console.error('Error fetching feature flag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature flag' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { key } = await params;
    const body = await request.json();
    const flagIndex = mockFlags.findIndex(f => f.key === key);

    if (flagIndex === -1) {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 });
    }

    // Update the flag
    mockFlags[flagIndex] = {
      ...mockFlags[flagIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ flag: mockFlags[flagIndex] });
  } catch (error) {
    console.error('Error updating feature flag:', error);
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { key } = await params;
    const flagIndex = mockFlags.findIndex(f => f.key === key);

    if (flagIndex === -1) {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 });
    }

    // Remove the flag
    const deletedFlag = mockFlags.splice(flagIndex, 1)[0];

    return NextResponse.json({ flag: deletedFlag });
  } catch (error) {
    console.error('Error deleting feature flag:', error);
    return NextResponse.json(
      { error: 'Failed to delete feature flag' },
      { status: 500 }
    );
  }
}