import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Clear session cookie
    const response = NextResponse.json({ message: 'Signed out successfully' })
    response.cookies.delete('courtsync-session')
    
    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}