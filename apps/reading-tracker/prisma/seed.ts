import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.readingSession.deleteMany()
  await prisma.readingStreak.deleteMany()
  await prisma.book.deleteMany()
  await prisma.user.deleteMany()

  // Create demo user
  const user = await prisma.user.create({
    data: {
      email: 'reader@example.com',
      name: 'Avid Reader'
    }
  })

  // Create sample books
  const books = await Promise.all([
    prisma.book.create({
      data: {
        userId: user.id,
        title: 'Atomic Habits',
        author: 'James Clear',
        isbn: '9780735211292',
        totalPages: 320,
        currentPage: 85,
        status: 'reading',
        rating: 5,
        dateAdded: new Date('2025-01-10'),
        dateStarted: new Date('2025-01-11'),
        notes: 'Great insights on habit formation'
      }
    }),
    prisma.book.create({
      data: {
        userId: user.id,
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        isbn: '9780857197689',
        totalPages: 256,
        currentPage: 256,
        status: 'completed',
        rating: 4,
        dateAdded: new Date('2025-01-01'),
        dateStarted: new Date('2025-01-02'),
        dateFinished: new Date('2025-01-08'),
        notes: 'Changed my perspective on financial decisions'
      }
    }),
    prisma.book.create({
      data: {
        userId: user.id,
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        isbn: '9780062316110',
        totalPages: 443,
        currentPage: 0,
        status: 'wishlist',
        dateAdded: new Date('2025-01-12')
      }
    }),
    prisma.book.create({
      data: {
        userId: user.id,
        title: 'Deep Work',
        author: 'Cal Newport',
        isbn: '9781455586691',
        totalPages: 296,
        currentPage: 150,
        status: 'paused',
        rating: 4,
        dateAdded: new Date('2024-12-20'),
        dateStarted: new Date('2024-12-22'),
        notes: 'Taking a break to focus on other priorities'
      }
    })
  ])

  // Create reading sessions for the past week
  const now = new Date()
  const sessions = []

  for (let i = 0; i < 7; i++) {
    const sessionDate = new Date(now)
    sessionDate.setDate(sessionDate.getDate() - i)
    sessionDate.setHours(19 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60))

    const duration = 20 + Math.floor(Math.random() * 40) // 20-60 minutes
    const pages = Math.floor(duration / 3) + Math.floor(Math.random() * 5) // ~1 page per 3 minutes

    sessions.push({
      userId: user.id,
      bookId: Math.random() > 0.3 ? books[0].id : books[1].id, // 70% current book, 30% finished book
      startTime: sessionDate,
      endTime: new Date(sessionDate.getTime() + duration * 60 * 1000),
      minutes: duration,
      pagesRead: pages,
      notes: Math.random() > 0.7 ? 'Good progress today' : undefined
    })
  }

  await prisma.readingSession.createMany({
    data: sessions
  })

  // Create current reading streak
  await prisma.readingStreak.create({
    data: {
      userId: user.id,
      startDate: new Date('2025-01-09'),
      currentDays: 6,
      maxDays: 12,
      isActive: true
    }
  })

  console.log('Reading Tracker database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })