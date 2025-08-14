import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, startTime, endTime, duration, category, tabVisible, idleEvents, productiveScore, final } = body

    // Validate required fields
    if (!userId || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user has focus tracking enabled
    const userPrefs = await prisma.userPreferences.findUnique({
      where: { userId }
    })

    if (!userPrefs?.focusTrackingEnabled) {
      return NextResponse.json(
        { error: 'Focus tracking not enabled for user' },
        { status: 403 }
      )
    }

    // Check if there's an existing session for this time range
    const existingSession = await prisma.focusSession.findFirst({
      where: {
        userId,
        startTime: new Date(startTime),
        endTime: null
      }
    })

    let session
    if (existingSession && !final) {
      // Update existing session
      session = await prisma.focusSession.update({
        where: { id: existingSession.id },
        data: {
          duration,
          tabVisible,
          idleEvents,
          productiveScore,
          ...(endTime && { endTime: new Date(endTime) })
        }
      })
    } else {
      // Create new session or final update
      session = await prisma.focusSession.upsert({
        where: {
          id: existingSession?.id || 'new'
        },
        create: {
          userId,
          startTime: new Date(startTime),
          endTime: endTime ? new Date(endTime) : null,
          duration,
          category,
          tabVisible,
          idleEvents,
          productiveScore
        },
        update: {
          endTime: endTime ? new Date(endTime) : null,
          duration,
          tabVisible,
          idleEvents,
          productiveScore
        }
      })
    }

    // If this is a final session, update weekly scores
    if (final && endTime) {
      await updateWeeklyScores(userId, session)
    }

    return NextResponse.json({ success: true, session })
  } catch (error) {
    console.error('Error saving focus session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateWeeklyScores(userId: string, session: { startTime: Date; duration?: number | null }) {
  const sessionDate = new Date(session.startTime)
  const weekStart = getWeekStart(sessionDate)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  // Get all sessions for this user this week
  const weekSessions = await prisma.focusSession.findMany({
    where: {
      userId,
      startTime: {
        gte: weekStart,
        lte: weekEnd
      },
      endTime: { not: null }
    }
  })

  const totalMinutes = weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
  const totalSessions = weekSessions.length
  const streakDays = calculateStreakDays(weekSessions)
  const points = Math.floor(totalMinutes + (streakDays * 50) + (totalSessions * 10))

  // Upsert weekly score
  await prisma.weeklyScore.upsert({
    where: {
      userId_weekStart: {
        userId,
        weekStart
      }
    },
    create: {
      userId,
      weekStart,
      weekEnd,
      totalMinutes: Math.floor(totalMinutes),
      totalSessions,
      streakDays,
      points
    },
    update: {
      totalMinutes: Math.floor(totalMinutes),
      totalSessions,
      streakDays,
      points
    }
  })
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

function calculateStreakDays(sessions: { startTime: Date }[]): number {
  const uniqueDays = new Set(
    sessions.map(s => new Date(s.startTime).toDateString())
  )
  return uniqueDays.size
}