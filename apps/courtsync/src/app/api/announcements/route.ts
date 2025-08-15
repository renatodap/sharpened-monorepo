/**
 * Announcements API
 * 
 * Handles team announcements and communication
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-adapter'
import { db } from '@/lib/db/adapters/database'
import { z } from 'zod'

const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Announcement title is required'),
  content: z.string().min(1, 'Announcement content is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  targetAudience: z.enum(['all', 'coaches', 'captains', 'players']).default('all'),
  requiresAcknowledgment: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
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
    const priority = searchParams.get('priority')
    const targetAudience = searchParams.get('targetAudience')
    const showExpired = searchParams.get('showExpired') === 'true'

    const announcements = await db.getAnnouncements({
      teamId: user.teamId,
      userRole: user.role,
      priority: priority as any,
      targetAudience: targetAudience as any,
      showExpired,
    })

    return NextResponse.json({ announcements })
  } catch (error) {
    console.error('Announcements GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
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

    if (!['coach', 'assistant_coach', 'captain'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create announcements' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createAnnouncementSchema.parse(body)

    const announcement = await db.createAnnouncement({
      ...validatedData,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
      authorId: user.id,
      teamId: user.teamId || '',
    })

    return NextResponse.json({ announcement }, { status: 201 })
  } catch (error) {
    console.error('Announcements POST error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid announcement data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    )
  }
}