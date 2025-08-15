/**
 * Video Management API
 * 
 * Handles video upload, storage, and metadata management
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-adapter'
import { db } from '@/lib/db/adapters/database'
import { z } from 'zod'

// Validation schemas
const createVideoSchema = z.object({
  title: z.string().min(1, 'Video title is required'),
  description: z.string().optional(),
  eventId: z.string().optional(),
  videoType: z.enum(['practice', 'match', 'training', 'analysis']),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
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
    const eventId = searchParams.get('eventId')
    const videoType = searchParams.get('videoType')
    const includePrivate = searchParams.get('includePrivate') === 'true'

    // Get videos with optional filtering
    const videos = await db.getVideos({
      teamId: user.teamId,
      eventId: eventId || undefined,
      videoType: videoType as any,
      includePrivate: includePrivate || user.role === 'coach',
      userId: user.id,
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Videos GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
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
    const validatedData = createVideoSchema.parse(body)

    // For MVP, we'll create a placeholder video entry
    // In production, this would handle actual file upload
    const video = await db.createVideo({
      ...validatedData,
      uploadedBy: user.id,
      teamId: user.teamId || '',
      status: 'uploaded',
      fileUrl: '/placeholder-video.mp4', // Placeholder
      thumbnailUrl: '/placeholder-thumbnail.jpg', // Placeholder
      duration: 0, // To be determined during processing
      fileSize: 0, // To be determined
    })

    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error('Videos POST error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid video data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}

// Upload endpoint for handling file uploads
export async function PUT(request: NextRequest) {
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

    if (action === 'get-upload-url') {
      // Generate signed upload URL for direct client upload
      const fileName = searchParams.get('fileName')
      const fileType = searchParams.get('fileType')
      
      if (!fileName || !fileType) {
        return NextResponse.json(
          { error: 'fileName and fileType are required' },
          { status: 400 }
        )
      }

      // Validate file type
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
      if (!allowedTypes.includes(fileType)) {
        return NextResponse.json(
          { error: 'Unsupported file type' },
          { status: 400 }
        )
      }

      // For MVP, return a mock upload URL
      // In production, this would generate signed URLs for cloud storage
      const uploadUrl = `/api/videos/upload/${user.id}/${Date.now()}-${fileName}`
      
      return NextResponse.json({
        uploadUrl,
        fileKey: `${user.id}/${Date.now()}-${fileName}`,
        expiresIn: 3600, // 1 hour
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Videos PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}