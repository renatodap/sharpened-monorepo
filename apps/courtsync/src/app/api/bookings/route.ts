/**
 * Court Booking API
 * 
 * Handles court reservation creation, conflict detection, and management
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-adapter'
import { db } from '@/lib/db/adapters/database'
import { z } from 'zod'

// Validation schemas
const createBookingSchema = z.object({
  courtId: z.string().min(1, 'Court ID is required'),
  eventId: z.string().optional(),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  purpose: z.enum(['practice', 'match', 'training', 'maintenance']),
  notes: z.string().optional(),
  participants: z.array(z.string()).optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
})

const conflictCheckSchema = z.object({
  courtId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  excludeBookingId: z.string().optional(),
})

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
    const courtId = searchParams.get('courtId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const purpose = searchParams.get('purpose')

    // Get bookings with optional filtering
    const bookings = await db.getBookings({
      courtId: courtId || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      purpose: purpose as any,
      teamId: user.teamId
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Bookings GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
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

    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    // Validate time range
    const startTime = new Date(validatedData.startTime)
    const endTime = new Date(validatedData.endTime)
    
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    if (startTime < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book in the past' },
        { status: 400 }
      )
    }

    // Check for conflicts
    const conflicts = await db.checkBookingConflicts({
      courtId: validatedData.courtId,
      startTime,
      endTime,
    })

    if (conflicts.length > 0) {
      // For non-coaches, reject conflicts outright
      if (!['coach', 'assistant_coach'].includes(user.role)) {
        return NextResponse.json({
          error: 'Booking conflicts with existing reservation',
          conflicts,
        }, { status: 409 })
      }
      
      // For coaches, include conflict info but allow override
      // This will be handled in the frontend
    }

    // Create booking
    const booking = await db.createBooking({
      ...validatedData,
      startTime,
      endTime,
      bookedBy: user.id,
      teamId: user.teamId || '',
      status: conflicts.length > 0 && user.role === 'coach' ? 'override' : 'confirmed',
    })

    return NextResponse.json({ 
      booking,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
    }, { status: 201 })
  } catch (error) {
    console.error('Bookings POST error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

// Check for conflicts endpoint
export async function PUT(request: NextRequest) {
  try {
    const user = await auth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'check-conflicts') {
      const validatedData = conflictCheckSchema.parse(data)
      
      const conflicts = await db.checkBookingConflicts({
        courtId: validatedData.courtId,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        excludeBookingId: validatedData.excludeBookingId,
      })

      return NextResponse.json({ 
        hasConflicts: conflicts.length > 0,
        conflicts,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Bookings PUT error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}