import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/getSessionUser';

// Mock feature flags - replace with database storage
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

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.user_metadata?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ flags: mockFlags });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user?.user_metadata?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { key, name, description, enabled = false, rolloutPercentage = 0, conditions } = body;

    if (!key || !name || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: key, name, description' },
        { status: 400 }
      );
    }

    // Check if flag already exists
    if (mockFlags.find(flag => flag.key === key)) {
      return NextResponse.json(
        { error: 'Feature flag with this key already exists' },
        { status: 400 }
      );
    }

    const newFlag = {
      key,
      name,
      description,
      enabled,
      rolloutPercentage,
      conditions: conditions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockFlags.push(newFlag);

    return NextResponse.json({ flag: newFlag }, { status: 201 });
  } catch (error) {
    console.error('Error creating feature flag:', error);
    return NextResponse.json(
      { error: 'Failed to create feature flag' },
      { status: 500 }
    );
  }
}