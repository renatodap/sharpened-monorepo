import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For now, return mock user session
    // In production, this would validate actual session/JWT tokens
    
    const mockUser = {
      id: 'mock-user-1',
      email: 'coach@rosehulman.edu',
      fullName: 'John Coach',
      preferredName: 'Coach John',
      role: 'coach',
      teamId: 'team-1',
      avatarUrl: null
    }

    // In development, always return a mock session for testing
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ user: mockUser })
    }

    // In production, implement proper session validation
    return NextResponse.json({ user: null }, { status: 401 })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}