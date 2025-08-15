/**
 * Travel Planning API
 * 
 * Handles travel event creation, itinerary management, and participant tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-adapter'
import { db } from '@/lib/db/adapters/database'
import { z } from 'zod'

// Validation schemas
const createTravelEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  departureTime: z.string().datetime().optional(),
  returnTime: z.string().datetime().optional(),
  departureLocation: z.string().optional(),
  destinationLocation: z.string().optional(),
  transportationType: z.enum(['bus', 'van', 'car', 'flight', 'train']).optional(),
  transportationDetails: z.record(z.any()).default({}),
  accommodation: z.record(z.any()).default({}),
  mealArrangements: z.record(z.any()).default({}),
  requiredDocuments: z.array(z.string()).default([]),
  packingList: z.array(z.string()).default([]),
  emergencyContacts: z.array(z.record(z.any())).default([]),
  budgetInfo: z.record(z.any()).default({}),
})

const createItineraryItemSchema = z.object({
  travelEventId: z.string().min(1, 'Travel event ID is required'),
  sequenceOrder: z.number().min(0),
  activityTime: z.string().datetime().optional(),
  activityType: z.enum(['departure', 'arrival', 'meal', 'practice', 'match', 'meeting', 'free_time', 'return']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  durationMinutes: z.number().optional(),
  responsiblePerson: z.string().optional(),
  notes: z.string().optional(),
})

const updateParticipantSchema = z.object({
  travelEventId: z.string().min(1),
  userId: z.string().min(1),
  participationStatus: z.enum(['invited', 'confirmed', 'declined', 'attended']).optional(),
  roomAssignment: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  emergencyContact: z.record(z.any()).optional(),
  travelDocumentsSubmitted: z.boolean().optional(),
  notes: z.string().optional(),
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
    const action = searchParams.get('action')
    const eventId = searchParams.get('eventId')
    const travelEventId = searchParams.get('travelEventId')

    if (action === 'itinerary' && travelEventId) {
      // Get itinerary for a travel event
      const itinerary = await db.getTravelItinerary(travelEventId)
      return NextResponse.json({ itinerary })
    }

    if (action === 'participants' && travelEventId) {
      // Get participants for a travel event
      const participants = await db.getTravelParticipants(travelEventId)
      return NextResponse.json({ participants })
    }

    if (eventId) {
      // Get travel event for a specific event
      const travelEvent = await db.getTravelEvent(eventId)
      return NextResponse.json({ travelEvent })
    }

    // Get all travel events for the team
    const travelEvents = await db.getTravelEvents({
      teamId: user.teamId,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    })

    return NextResponse.json({ travelEvents })
  } catch (error) {
    console.error('Travel GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch travel data' },
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
    const { action, ...data } = body

    // Check permissions for creation - coaches and captains can create travel plans
    if (!['coach', 'assistant_coach', 'captain'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage travel plans' },
        { status: 403 }
      )
    }

    if (action === 'create-event') {
      const validatedData = createTravelEventSchema.parse(data)
      
      const travelEvent = await db.createTravelEvent({
        ...validatedData,
        departureTime: validatedData.departureTime ? new Date(validatedData.departureTime) : undefined,
        returnTime: validatedData.returnTime ? new Date(validatedData.returnTime) : undefined,
      })

      return NextResponse.json({ travelEvent }, { status: 201 })
    }

    if (action === 'add-itinerary-item') {
      const validatedData = createItineraryItemSchema.parse(data)
      
      const itineraryItem = await db.createItineraryItem({
        ...validatedData,
        activityTime: validatedData.activityTime ? new Date(validatedData.activityTime) : undefined,
      })

      return NextResponse.json({ itineraryItem }, { status: 201 })
    }

    if (action === 'invite-participants') {
      const { travelEventId, userIds } = data
      
      if (!travelEventId || !Array.isArray(userIds)) {
        return NextResponse.json(
          { error: 'Travel event ID and user IDs are required' },
          { status: 400 }
        )
      }

      const participants = await db.inviteTravelParticipants(travelEventId, userIds)
      return NextResponse.json({ participants }, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Travel POST error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create travel data' },
      { status: 500 }
    )
  }
}

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

    if (action === 'update-participant') {
      const validatedData = updateParticipantSchema.parse(data)
      
      // Check if user can update this participant
      // Users can update their own participation, coaches can update any
      if (validatedData.userId !== user.id && !['coach', 'assistant_coach'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      const participant = await db.updateTravelParticipant(
        validatedData.travelEventId,
        validatedData.userId,
        validatedData
      )

      return NextResponse.json({ participant })
    }

    if (action === 'update-event') {
      // Check permissions for updating events
      if (!['coach', 'assistant_coach', 'captain'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions to update travel events' },
          { status: 403 }
        )
      }

      const { travelEventId, ...updateData } = data
      const validatedData = createTravelEventSchema.partial().parse(updateData)
      
      const travelEvent = await db.updateTravelEvent(travelEventId, {
        ...validatedData,
        departureTime: validatedData.departureTime ? new Date(validatedData.departureTime) : undefined,
        returnTime: validatedData.returnTime ? new Date(validatedData.returnTime) : undefined,
      })

      return NextResponse.json({ travelEvent })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Travel PUT error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update travel data' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await auth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check permissions - only coaches can delete travel events
    if (!['coach', 'assistant_coach'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete travel events' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const travelEventId = searchParams.get('travelEventId')
    const itineraryItemId = searchParams.get('itineraryItemId')
    
    if (travelEventId) {
      await db.deleteTravelEvent(travelEventId)
      return NextResponse.json({ success: true })
    }

    if (itineraryItemId) {
      await db.deleteItineraryItem(itineraryItemId)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Missing required ID parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Travel DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete travel data' },
      { status: 500 }
    )
  }
}