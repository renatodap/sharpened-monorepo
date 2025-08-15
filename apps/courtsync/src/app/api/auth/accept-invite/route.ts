import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, email, fullName, preferredName, role, classYear } = await request.json()

    if (!inviteCode || !email || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Mock invite acceptance for development
    if (process.env.NODE_ENV === 'development') {
      const mockUser = {
        id: `user-${Date.now()}`,
        email,
        fullName,
        preferredName: preferredName || null,
        role: role || 'player',
        teamId: 'team-1', // Join existing team
        classYear: classYear ? parseInt(classYear) : undefined,
        avatarUrl: null
      }

      // Set mock session cookie
      const response = NextResponse.json({ user: mockUser })
      response.cookies.set('courtsync-session', 'mock-session-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return response
    }

    // In production, implement proper invite acceptance
    return NextResponse.json(
      { error: 'Invite acceptance not implemented' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}