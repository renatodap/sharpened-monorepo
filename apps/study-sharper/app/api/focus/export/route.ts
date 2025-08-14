import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const format = searchParams.get('format') || 'csv'
    const weeks = parseInt(searchParams.get('weeks') || '4')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get data for the last N weeks
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - (weeks * 7))

    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { startTime: 'desc' }
    })

    const weeklyScores = await prisma.weeklyScore.findMany({
      where: {
        userId,
        weekStart: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { weekStart: 'desc' }
    })

    if (format === 'json') {
      return NextResponse.json({
        focusSessions: focusSessions.map(session => ({
          date: session.startTime.toISOString().split('T')[0],
          startTime: session.startTime.toISOString(),
          endTime: session.endTime?.toISOString(),
          durationMinutes: Math.floor((session.duration || 0) / 60),
          category: session.category,
          productiveScore: Math.round(session.productiveScore * 100),
          idleEvents: session.idleEvents
        })),
        weeklyScores: weeklyScores.map(score => ({
          weekStart: score.weekStart.toISOString().split('T')[0],
          weekEnd: score.weekEnd.toISOString().split('T')[0],
          totalMinutes: score.totalMinutes,
          totalSessions: score.totalSessions,
          streakDays: score.streakDays,
          points: score.points,
          rank: score.rank
        }))
      })
    }

    // Generate CSV
    const csvRows = []
    csvRows.push('Date,Start Time,End Time,Duration (min),Category,Productive Score (%),Idle Events')
    
    focusSessions.forEach(session => {
      csvRows.push([
        session.startTime.toISOString().split('T')[0],
        session.startTime.toISOString(),
        session.endTime?.toISOString() || '',
        Math.floor((session.duration || 0) / 60),
        session.category || '',
        Math.round(session.productiveScore * 100),
        session.idleEvents
      ].join(','))
    })

    csvRows.push('') // Empty line
    csvRows.push('Weekly Summaries')
    csvRows.push('Week Start,Week End,Total Minutes,Sessions,Streak Days,Points,Rank')
    
    weeklyScores.forEach(score => {
      csvRows.push([
        score.weekStart.toISOString().split('T')[0],
        score.weekEnd.toISOString().split('T')[0],
        score.totalMinutes,
        score.totalSessions,
        score.streakDays,
        score.points,
        score.rank || ''
      ].join(','))
    })

    const csvContent = csvRows.join('\n')
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="focus-data-${userId}-${weeks}weeks.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting focus data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}