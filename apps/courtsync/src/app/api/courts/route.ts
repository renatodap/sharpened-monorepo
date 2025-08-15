/**
 * Court Management API
 * 
 * Handles CRUD operations for courts and facilities
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-adapter'
import { db } from '@/lib/db/adapters/database'
import { z } from 'zod'

// Validation schemas
const createCourtSchema = z.object({
  name: z.string().min(1, 'Court name is required'),
  facilityId: z.string().min(1, 'Facility ID is required'),
  surfaceType: z.enum(['hard', 'clay', 'grass', 'indoor']),
  isActive: z.boolean().default(true),
  maintenanceNotes: z.string().optional(),
})

const updateCourtSchema = createCourtSchema.partial()

export async function GET(request: NextRequest) {
  try {
    // Get current user and verify authentication
    const user = await auth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const facilityId = searchParams.get('facilityId')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Get courts with optional filtering
    const courts = await db.getCourts({
      facilityId: facilityId || undefined,
      includeInactive,
      teamId: user.teamId
    })

    return NextResponse.json({ courts })
  } catch (error) {
    console.error('Courts GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify coach/admin permissions
    const user = await auth.getCurrentUser()
    if (!user || !['coach', 'assistant_coach'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Coach permissions required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createCourtSchema.parse(body)

    // Create new court
    const court = await db.createCourt({
      ...validatedData,
      teamId: user.teamId || '',
      createdBy: user.id,
    })

    return NextResponse.json({ court }, { status: 201 })
  } catch (error) {
    console.error('Courts POST error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid court data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create court' },
      { status: 500 }
    )
  }
}