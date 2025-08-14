import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current week's league
    const weekNumber = getWeekNumber();
    const { startDate, endDate } = getWeekDates();

    // Check if user is in a league this week
    const { data: userLeague, error: leagueError } = await supabase
      .from('league_memberships')
      .select(`
        league_id,
        leagues (
          id,
          name,
          week_number,
          start_date,
          end_date,
          max_size
        )
      `)
      .eq('user_id', user.id)
      .eq('week_number', weekNumber)
      .single();

    let league;
    
    if (!userLeague || leagueError) {
      // Auto-assign to a league
      league = await assignUserToLeague(supabase, user.id, weekNumber);
    } else {
      league = userLeague.leagues;
    }

    // Get all members and their scores
    const { data: members } = await supabase
      .from('league_memberships')
      .select(`
        user_id,
        points,
        focus_minutes,
        streak,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('league_id', league.id)
      .order('points', { ascending: false });

    const users = members?.map((member: any, index: number) => ({
      id: member.user_id,
      name: member.user_id === user.id ? 'You' : (member.profiles?.full_name || 'Student'),
      avatar: member.profiles?.avatar_url,
      points: member.points || 0,
      focusMinutes: member.focus_minutes || 0,
      streak: member.streak || 0,
      rank: index + 1
    })) || [];

    const userRank = users.findIndex(u => u.id === user.id) + 1;

    return NextResponse.json({
      league: {
        id: league.id,
        name: league.name,
        weekNumber: league.week_number,
        startDate: league.start_date,
        endDate: league.end_date,
        maxSize: league.max_size,
        users
      },
      userRank
    });
  } catch (error) {
    console.error('League fetch error:', error);
    
    // Return mock data for demo
    const mockLeague = getMockLeagueData();
    return NextResponse.json(mockLeague);
  }
}

async function assignUserToLeague(supabase: any, userId: string, weekNumber: number) {
  // Find a league with space
  const { data: availableLeagues } = await supabase
    .from('leagues')
    .select(`
      id,
      name,
      week_number,
      start_date,
      end_date,
      max_size,
      league_memberships (count)
    `)
    .eq('week_number', weekNumber)
    .lt('league_memberships.count', 8)
    .limit(1);

  let league;
  
  if (!availableLeagues || availableLeagues.length === 0) {
    // Create new league
    const { data: newLeague } = await supabase
      .from('leagues')
      .insert({
        name: `Study Squad ${Math.floor(Math.random() * 100)}`,
        week_number: weekNumber,
        start_date: getWeekDates().startDate,
        end_date: getWeekDates().endDate,
        max_size: 8
      })
      .select()
      .single();
    
    league = newLeague;
  } else {
    league = availableLeagues[0];
  }

  // Add user to league
  await supabase
    .from('league_memberships')
    .insert({
      user_id: userId,
      league_id: league.id,
      week_number: weekNumber,
      points: 0,
      focus_minutes: 0,
      streak: 0
    });

  return league;
}

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

function getWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - dayOfWeek);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
}

function getMockLeagueData() {
  const weekNumber = getWeekNumber();
  const { startDate, endDate } = getWeekDates();
  
  return {
    league: {
      id: 'league-demo',
      name: 'Study Squad Demo',
      weekNumber,
      startDate,
      endDate,
      maxSize: 8,
      users: [
        { id: '1', name: 'Alex Chen', points: 2850, focusMinutes: 480, streak: 7, rank: 1 },
        { id: '2', name: 'Sarah Kim', points: 2640, focusMinutes: 420, streak: 5, rank: 2 },
        { id: '3', name: 'You', points: 2420, focusMinutes: 380, streak: 4, rank: 3 },
        { id: '4', name: 'Mike Johnson', points: 2100, focusMinutes: 340, streak: 3, rank: 4 },
        { id: '5', name: 'Emma Davis', points: 1890, focusMinutes: 300, streak: 2, rank: 5 },
      ]
    },
    userRank: 3
  };
}