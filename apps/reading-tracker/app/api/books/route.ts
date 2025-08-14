import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'reader@example.com' // Demo user
    const status = searchParams.get('status')

    const whereClause: Record<string, unknown> = { userId }
    if (status) {
      whereClause.status = status
    }

    const books = await prisma.book.findMany({
      where: whereClause,
      orderBy: [
        { status: 'asc' },
        { dateAdded: 'desc' }
      ]
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, author, isbn, url, totalPages, status } = body
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const userId = 'reader@example.com' // Demo user

    const book = await prisma.book.create({
      data: {
        userId,
        title,
        author,
        isbn,
        url,
        totalPages,
        status: status || 'reading',
        dateAdded: new Date(),
        ...(status === 'reading' && { dateStarted: new Date() })
      }
    })

    return NextResponse.json(book)
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}