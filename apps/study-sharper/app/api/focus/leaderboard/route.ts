import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    const currentDate = new Date()
    const weekStart = getWeekStart(currentDate)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    // Build the query
    const whereClause: Record<string, unknown> = {
      weekStart: weekStart
    }

    if (groupId) {
      whereClause.groupId = groupId
    }

    // Get weekly scores ordered by points
    const weeklyScores = await prisma.weeklyScore.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { points: 'desc' },
        { totalMinutes: 'desc' },
        { streakDays: 'desc' }
      ],
      take: 50 // Top 50
    })

    // Add ranks
    const entries = weeklyScores.map((score, index) => ({
      id: score.id,
      userId: score.userId,
      userName: score.user.name || score.user.email.split('@')[0],
      totalMinutes: score.totalMinutes,
      totalSessions: score.totalSessions,
      streakDays: score.streakDays,
      points: score.points,
      rank: index + 1
    }))

    // Update ranks in database
    for (const entry of entries) {
      await prisma.weeklyScore.update({
        where: { id: entry.id },
        data: { rank: entry.rank }
      })
    }

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}