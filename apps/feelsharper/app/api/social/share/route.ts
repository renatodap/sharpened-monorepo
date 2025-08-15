import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/getSessionUser';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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
      return NextResponse.json(
        { error: 'Invalid share type' },
        { status: 400 }
      );
    }

    // Record share event - simplified for MVP
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
      console.error('Error recording share:', insertError);
      // Continue anyway - sharing is not critical
    }

    // Generate share content based on type - simplified for MVP
    let shareContent = {
      title: 'Check out my fitness progress!',
      description: 'Join me on Feel Sharper',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://feelsharper.com'}/shared/${shareType}/${contentId || 'general'}`,
      image: null as string | null
    };

    // Customize content based on share type
    switch (shareType) {
      case 'progress_card':
        shareContent.title = 'My Fitness Progress';
        shareContent.description = 'See how far I\'ve come on my fitness journey';
        break;
      case 'achievement':
        shareContent.title = 'Achievement Unlocked!';
        shareContent.description = 'I just earned a new badge on Feel Sharper';
        break;
      case 'workout':
        shareContent.title = 'Workout Complete!';
        shareContent.description = 'Just crushed another workout';
        break;
      case 'streak':
        shareContent.title = `${metadata.days || 0} Day Streak!`;
        shareContent.description = 'Consistency is key to fitness success';
        break;
      case 'pr':
        shareContent.title = 'New Personal Record!';
        shareContent.description = 'Breaking my limits one rep at a time';
        break;
    }

    return NextResponse.json({
      success: true,
      shareContent,
      shareUrl: shareContent.url
    });
  } catch (error) {
    console.error('Error generating share content:', error);
    return NextResponse.json(
      { error: 'Failed to generate share content' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's share history - simplified for MVP
    const { data: shares, error } = await supabase
      .from('share_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching share history:', error);
      return NextResponse.json({ shares: [] });
    }

    return NextResponse.json({ shares: shares || [] });
  } catch (error) {
    console.error('Error in share history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}