import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'reader@example.com'

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get reading streak
    const activeStreak = await prisma.readingStreak.findFirst({
      where: {
        userId,
        isActive: true
      }
    })

    // Get weekly stats
    const weeklySession = await prisma.readingSession.aggregate({
      where: {
        userId,
        startTime: {
          gte: weekStart
        }
      },
      _sum: {
        minutes: true,
        pagesRead: true
      },
      _count: {
        id: true
      }
    })

    // Get monthly stats
    const monthlySession = await prisma.readingSession.aggregate({
      where: {
        userId,
        startTime: {
          gte: monthStart
        }
      },
      _sum: {
        minutes: true,
        pagesRead: true
      },
      _count: {
        id: true
      }
    })

    // Get books by status
    const bookCounts = await prisma.book.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        id: true
      }
    })

    const stats = {
      streak: {
        current: activeStreak?.currentDays || 0,
        max: activeStreak?.maxDays || 0
      },
      weekly: {
        minutes: weeklySession._sum.minutes || 0,
        pages: weeklySession._sum.pagesRead || 0,
        sessions: weeklySession._count.id || 0
      },
      monthly: {
        minutes: monthlySession._sum.minutes || 0,
        pages: monthlySession._sum.pagesRead || 0,
        sessions: monthlySession._count.id || 0
      },
      books: bookCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count.id
        return acc
      }, {} as Record<string, number>)
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}