import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Simple demo URL parsing
    // In a real app, you'd use services like Google Books API or web scraping
    const mockBookData = {
      title: 'The Pragmatic Programmer',
      author: 'David Thomas, Andrew Hunt',
      totalPages: '352'
    }

    if (url.includes('amazon.com')) {
      // Parse Amazon URL (demo)
      return NextResponse.json({
        ...mockBookData,
        title: 'Clean Code',
        author: 'Robert C. Martin'
      })
    }

    if (url.includes('goodreads.com')) {
      // Parse Goodreads URL (demo)
      return NextResponse.json({
        ...mockBookData,
        title: 'Design Patterns',
        author: 'Gang of Four'
      })
    }

    return NextResponse.json(mockBookData)
  } catch (error) {
    console.error('Error parsing URL:', error)
    return NextResponse.json(
      { error: 'Failed to parse URL' },
      { status: 500 }
    )
  }
}