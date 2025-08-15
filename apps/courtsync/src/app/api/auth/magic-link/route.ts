import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, redirectTo } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Mock magic link for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Mock magic link sent to ${email}`)
      console.log(`Redirect URL: ${redirectTo || '/dashboard'}`)
      
      // In development, just return success
      return NextResponse.json({ 
        message: 'Magic link sent successfully',
        email 
      })
    }

    // In production, implement proper magic link sending
    return NextResponse.json(
      { error: 'Magic link not implemented' },
      { status: 501 }
    )
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}