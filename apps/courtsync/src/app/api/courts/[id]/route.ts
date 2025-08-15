/**
 * Individual Court Management API
 * 
 * Handles operations on specific courts
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-adapter'
import { db } from '@/lib/db/adapters/database'
import { z } from 'zod'

const updateCourtSchema = z.object({
  name: z.string().min(1).optional(),
  surfaceType: z.enum(['hard', 'clay', 'grass', 'indoor']).optional(),
  isActive: z.boolean().optional(),
  maintenanceNotes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await auth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const court = await db.getCourtById(params.id)
    
    if (!court) {
      return NextResponse.json(
        { error: 'Court not found' },
        { status: 404 }
      )
    }

    // Verify user has access to this court's team
    if (court.teamId && user.teamId !== court.teamId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({ court })
  } catch (error) {
    console.error('Court GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch court' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await auth.getCurrentUser()
    if (!user || !['coach', 'assistant_coach'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Coach permissions required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateCourtSchema.parse(body)

    const court = await db.updateCourt(params.id, validatedData)
    
    if (!court) {
      return NextResponse.json(
        { error: 'Court not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ court })
  } catch (error) {
    console.error('Court PUT error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid court data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update court' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await auth.getCurrentUser()
    if (!user || !['coach'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Coach permissions required' },
        { status: 403 }
      )
    }

    await db.deleteCourt(params.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Court DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete court' },
      { status: 500 }
    )
  }
}