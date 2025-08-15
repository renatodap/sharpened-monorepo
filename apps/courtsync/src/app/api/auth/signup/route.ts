import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth-adapter'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, preferredName, role, classYear } = await request.json()

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create user account using auth adapter
    const result = await auth.signUp(email, password, {
      email,
      fullName,
      preferredName,
      role,
      classYear: role === 'player' ? classYear : undefined,
    })

    // Set session cookie
    const response = NextResponse.json({ user: result.user })
    
    if (result.session) {
      response.cookies.set('courtsync-session', result.session.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
    }

    return response
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}