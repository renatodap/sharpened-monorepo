/**
 * Beta Feedback API - Collect and store beta user feedback
 * Maps to PRD: Beta Launch - Email feedback collection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Check authentication (optional for beta feedback)
    const { data: { user } } = await supabase.auth.getUser();
    
    const {
      type,
      rating,
      title,
      description,
      email,
      timestamp,
      user_agent,
      url
    } = await request.json();

    // Validate required fields
    if (!type || !rating || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store feedback
    const feedbackData = {
      user_id: user?.id || null,
      feedback_type: type,
      rating: rating,
      title: title || null,
      description: description,
      email: email || user?.email || null,
      user_agent: user_agent,
      page_url: url,
      created_at: timestamp || new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('beta_feedback')
      .insert(feedbackData);

    if (insertError) {
      console.error('Failed to store feedback:', insertError);
      return NextResponse.json(
        { error: 'Failed to store feedback' },
        { status: 500 }
      );
    }

    // Send email notification (optional - could use Resend, SendGrid, etc.)
    if (process.env.NODE_ENV === 'production') {
      try {
        // TODO: Implement email notification to team
        console.log('New beta feedback received:', {
          type,
          rating,
          title: title || 'No title',
          from: email || 'Anonymous'
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Beta feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}