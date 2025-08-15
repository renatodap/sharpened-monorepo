/**
 * Scouting API
 * 
 * Handles opponent scouting reports and intelligence
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-adapter'
import { db } from '@/lib/db/adapters/database'
import { z } from 'zod'

const createScoutingReportSchema = z.object({
  opponentId: z.string().min(1, 'Opponent ID is required'),
  eventId: z.string().optional(),
  title: z.string().min(1, 'Report title is required'),
  opponentStrengths: z.string().min(1, 'Opponent strengths analysis is required'),
  opponentWeaknesses: z.string().min(1, 'Opponent weaknesses analysis is required'),
  recommendedStrategy: z.string().min(1, 'Recommended strategy is required'),
  keyPlayers: z.string().optional(),
  previousResults: z.string().optional(),
  confidenceLevel: z.number().min(1).max(5).default(3),
  isConfidential: z.boolean().default(false),
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
    const opponentId = searchParams.get('opponentId')
    const includeConfidential = ['coach', 'assistant_coach', 'captain'].includes(user.role)

    const reports = await db.getScoutingReports({
      teamId: user.teamId,
      opponentId: opponentId || undefined,
      includeConfidential,
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Scouting GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scouting reports' },
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
        { error: 'Insufficient permissions to create scouting reports' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createScoutingReportSchema.parse(body)

    const report = await db.createScoutingReport({
      ...validatedData,
      authorId: user.id,
      teamId: user.teamId || '',
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('Scouting POST error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid scouting data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create scouting report' },
      { status: 500 }
    )
  }
}