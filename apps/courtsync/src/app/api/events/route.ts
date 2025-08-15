/**
 * Events API
 * 
 * Handles team calendar events including practices, matches, and travel
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-adapter'
import { db } from '@/lib/db/adapters/database'
import { z } from 'zod'

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1, 'Event title is required'),
  description: z.string().optional(),
  eventType: z.enum(['practice', 'match', 'travel', 'meeting', 'social']),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  location: z.string().optional(),
  isAllDay: z.boolean().default(false),
  requiresAttendance: z.boolean().default(true),
  maxParticipants: z.number().optional(),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
  recurrenceEndDate: z.string().datetime().optional(),
})

const updateEventSchema = createEventSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const user = await auth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const eventType = searchParams.get('eventType')
    const includePrivate = searchParams.get('includePrivate') === 'true'

    // Get events with optional filtering
    const events = await db.getEvents({
      teamId: user.teamId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventType: eventType as any,
      includePrivate,
      userId: user.id,
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Events GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await auth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only coaches and captains can create events
    if (!['coach', 'assistant_coach', 'captain'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create events' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createEventSchema.parse(body)

    // Validate time range
    const startTime = new Date(validatedData.startTime)
    const endTime = new Date(validatedData.endTime)
    
    if (!validatedData.isAllDay && startTime >= endTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // Check for scheduling conflicts with academic schedules
    const conflicts = await checkAcademicConflicts(
      user.teamId || '',
      startTime,
      endTime
    )

    // Create event
    const event = await db.createEvent({
      ...validatedData,
      startTime,
      endTime,
      recurrenceEndDate: validatedData.recurrenceEndDate 
        ? new Date(validatedData.recurrenceEndDate) 
        : undefined,
      createdBy: user.id,
      teamId: user.teamId || '',
    })

    // Create recurring instances if needed
    if (validatedData.isRecurring && validatedData.recurrencePattern) {
      await createRecurringInstances(event, validatedData.recurrencePattern)
    }

    return NextResponse.json({ 
      event,
      academicConflicts: conflicts.length > 0 ? conflicts : undefined,
    }, { status: 201 })
  } catch (error) {
    console.error('Events POST error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

// Helper function to check for academic schedule conflicts
async function checkAcademicConflicts(
  teamId: string,
  startTime: Date,
  endTime: Date
): Promise<any[]> {
  try {
    // Get team members with class schedules
    const teamMembers = await db.getTeamMembers(teamId)
    const conflicts: any[] = []

    for (const member of teamMembers) {
      if (member.classSchedule) {
        // Parse class schedule and check for conflicts
        const schedule = JSON.parse(member.classSchedule)
        const dayOfWeek = startTime.getDay()
        const timeSlot = {
          start: startTime.getHours() * 60 + startTime.getMinutes(),
          end: endTime.getHours() * 60 + endTime.getMinutes(),
        }

        // Check if this day has classes
        const daySchedule = schedule[dayOfWeek] || []
        
        for (const classTime of daySchedule) {
          const classStart = classTime.startHour * 60 + (classTime.startMinute || 0)
          const classEnd = classTime.endHour * 60 + (classTime.endMinute || 0)

          // Check for overlap
          if (timeSlot.start < classEnd && timeSlot.end > classStart) {
            conflicts.push({
              type: 'academic',
              userId: member.id,
              userName: member.fullName,
              classTitle: classTime.title,
              conflictTime: {
                start: classStart,
                end: classEnd,
              },
            })
          }
        }
      }
    }

    return conflicts
  } catch (error) {
    console.error('Academic conflict check failed:', error)
    return []
  }
}

// Helper function to create recurring event instances
async function createRecurringInstances(
  baseEvent: any,
  recurrencePattern: string
): Promise<void> {
  try {
    // Parse recurrence pattern (e.g., "weekly", "daily", "biweekly")
    const pattern = recurrencePattern.toLowerCase()
    const instances: any[] = []
    const maxInstances = 50 // Limit to prevent abuse
    
    let currentDate = new Date(baseEvent.startTime)
    let instanceCount = 0
    
    while (instanceCount < maxInstances) {
      let nextDate: Date

      switch (pattern) {
        case 'daily':
          nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
          break
        case 'weekly':
          nextDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case 'biweekly':
          nextDate = new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000)
          break
        default:
          return // Unknown pattern
      }

      // Check if we've exceeded the end date
      if (baseEvent.recurrenceEndDate && nextDate > baseEvent.recurrenceEndDate) {
        break
      }

      // Calculate end time for this instance
      const duration = baseEvent.endTime.getTime() - baseEvent.startTime.getTime()
      const nextEndDate = new Date(nextDate.getTime() + duration)

      instances.push({
        ...baseEvent,
        id: undefined, // Will get new ID
        startTime: nextDate,
        endTime: nextEndDate,
        parentEventId: baseEvent.id,
        isRecurringInstance: true,
      })

      currentDate = nextDate
      instanceCount++
    }

    // Batch create instances
    if (instances.length > 0) {
      await db.createEvents(instances)
    }
  } catch (error) {
    console.error('Failed to create recurring instances:', error)
  }
}