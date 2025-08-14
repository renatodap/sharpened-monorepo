import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { duration, timestamp, metadata } = body;

    // Store focus session
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: user.id,
        duration_seconds: duration,
        tracked_at: timestamp || new Date().toISOString(),
        metadata: metadata || {},
        is_active: false
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Focus tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track focus session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('tracked_at', { ascending: false });

    if (startDate) {
      query = query.gte('tracked_at', startDate);
    }
    if (endDate) {
      query = query.lte('tracked_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Export as CSV if requested
    if (format === 'csv') {
      const csv = [
        'Date,Duration (seconds),Duration (minutes)',
        ...data.map(session => 
          `${session.tracked_at},${session.duration_seconds},${(session.duration_seconds / 60).toFixed(2)}`
        )
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="focus-sessions.csv"'
        }
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Focus fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch focus sessions' },
      { status: 500 }
    );
  }
}