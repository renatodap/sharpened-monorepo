import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.weeklyScore.deleteMany()
  await prisma.groupMember.deleteMany()
  await prisma.focusSession.deleteMany()
  await prisma.studyGroup.deleteMany()
  await prisma.userPreferences.deleteMany()
  await prisma.user.deleteMany()

  // Create demo users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alex@example.com',
        name: 'Alex Johnson',
        preferences: {
          create: {
            focusTrackingEnabled: true,
            privacyAccepted: true,
            dataRetentionDays: 30
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'sarah@example.com',
        name: 'Sarah Chen',
        preferences: {
          create: {
            focusTrackingEnabled: true,
            privacyAccepted: true,
            dataRetentionDays: 60
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'mike@example.com',
        name: 'Mike Rodriguez',
        preferences: {
          create: {
            focusTrackingEnabled: false,
            privacyAccepted: false,
            dataRetentionDays: 30
          }
        }
      }
    })
  ])

  // Create a study group
  const studyGroup = await prisma.studyGroup.create({
    data: {
      name: 'Code Warriors',
      code: 'CW2025',
      maxMembers: 10,
      weekStart: new Date('2025-01-13'),
      weekEnd: new Date('2025-01-19'),
      members: {
        create: [
          { userId: users[0].id, role: 'admin' },
          { userId: users[1].id, role: 'member' },
          { userId: users[2].id, role: 'member' }
        ]
      }
    }
  })

  // Create focus sessions for this week
  const now = new Date()
  const weekStart = new Date('2025-01-13')
  
  for (const user of users.slice(0, 2)) {
    // Create multiple sessions throughout the week
    for (let i = 0; i < 5; i++) {
      const sessionDate = new Date(weekStart)
      sessionDate.setDate(sessionDate.getDate() + i)
      sessionDate.setHours(9 + Math.floor(Math.random() * 8))
      
      const duration = 1800 + Math.floor(Math.random() * 5400) // 30-120 minutes
      
      await prisma.focusSession.create({
        data: {
          userId: user.id,
          startTime: sessionDate,
          endTime: new Date(sessionDate.getTime() + duration * 1000),
          duration,
          category: ['study', 'coding', 'work'][Math.floor(Math.random() * 3)],
          tabVisible: true,
          idleEvents: Math.floor(Math.random() * 5),
          productiveScore: 0.8 + Math.random() * 0.2
        }
      })
    }
    
    // Create weekly score
    await prisma.weeklyScore.create({
      data: {
        userId: user.id,
        groupId: studyGroup.id,
        weekStart: weekStart,
        weekEnd: new Date('2025-01-19'),
        totalMinutes: Math.floor(1800 + Math.random() * 3600),
        totalSessions: 5,
        streakDays: Math.floor(3 + Math.random() * 4),
        points: Math.floor(500 + Math.random() * 1000)
      }
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })