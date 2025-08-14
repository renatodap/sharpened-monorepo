import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookId, minutes, pagesRead, notes } = body
    
    if (!bookId || !minutes || !pagesRead) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const userId = 'reader@example.com' // Demo user

    // Create the reading session
    const session = await prisma.readingSession.create({
      data: {
        userId,
        bookId,
        startTime: new Date(),
        endTime: new Date(Date.now() + minutes * 60 * 1000),
        minutes,
        pagesRead,
        notes
      }
    })

    // Update book progress
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (book) {
      const newCurrentPage = book.currentPage + pagesRead
      const isCompleted = book.totalPages && newCurrentPage >= book.totalPages

      await prisma.book.update({
        where: { id: bookId },
        data: {
          currentPage: newCurrentPage,
          ...(isCompleted && {
            status: 'completed',
            dateFinished: new Date()
          })
        }
      })
    }

    // Update reading streak
    await updateReadingStreak(userId)

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updateReadingStreak(userId: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check if user has active streak
    const activeStreak = await prisma.readingStreak.findFirst({
      where: {
        userId,
        isActive: true
      }
    })

    // Check if user read today
    const todaySession = await prisma.readingSession.findFirst({
      where: {
        userId,
        startTime: {
          gte: today
        }
      }
    })

    if (!todaySession) return // No session today

    if (!activeStreak) {
      // Create new streak
      await prisma.readingStreak.create({
        data: {
          userId,
          startDate: today,
          currentDays: 1,
          maxDays: 1,
          isActive: true
        }
      })
      return
    }

    // Check if streak continues
    const streakDate = new Date(activeStreak.startDate)
    streakDate.setDate(streakDate.getDate() + activeStreak.currentDays - 1)

    if (streakDate.getTime() === yesterday.getTime()) {
      // Continue streak
      const newDays = activeStreak.currentDays + 1
      await prisma.readingStreak.update({
        where: { id: activeStreak.id },
        data: {
          currentDays: newDays,
          maxDays: Math.max(activeStreak.maxDays, newDays)
        }
      })
    } else if (streakDate.getTime() < yesterday.getTime()) {
      // Streak broken, start new one
      await prisma.readingStreak.update({
        where: { id: activeStreak.id },
        data: { isActive: false }
      })

      await prisma.readingStreak.create({
        data: {
          userId,
          startDate: today,
          currentDays: 1,
          maxDays: 1,
          isActive: true
        }
      })
    }
  } catch (error) {
    console.error('Error updating reading streak:', error)
  }
}