import { drizzle } from 'drizzle-orm/postgres-js'
import { drizzle as drizzleSupabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { schema } from '../schema'

// Environment configuration
const databaseAdapter = process.env.DATABASE_ADAPTER || 'supabase'
const isDevelopment = process.env.NODE_ENV === 'development'

// Database connection configuration
let db: ReturnType<typeof drizzle>

if (databaseAdapter === 'local') {
  // Local PostgreSQL connection
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/courtsync_dev'
  
  const sql = postgres(connectionString, {
    max: isDevelopment ? 5 : 20, // Connection pool size
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  })
  
  db = drizzle(sql, { schema })
} else {
  // Supabase connection
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is required when using Supabase adapter')
  }
  
  const sql = postgres(connectionString, {
    max: isDevelopment ? 5 : 20,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: 'require', // Always require SSL for Supabase
  })
  
  db = drizzleSupabase(sql, { schema })
}

// Export the database instance
export { db }

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.execute('SELECT 1 as health_check')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Transaction helper
export async function withTransaction<T>(
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return await db.transaction(callback)
}

// Common query helpers
export const queries = {
  // User queries
  findUserByEmail: async (email: string) => {
    const [user] = await db
      .select()
      .from(schema.profiles)
      .where(schema.profiles.email.eq(email))
      .limit(1)
    return user
  },

  // Team queries
  findTeamWithMembers: async (teamId: string) => {
    return await db.query.teams.findFirst({
      where: (teams, { eq }) => eq(teams.id, teamId),
      with: {
        members: true,
        headCoach: true,
      },
    })
  },

  // Event queries
  findEventsInDateRange: async (teamId: string, startDate: Date, endDate: Date) => {
    return await db.query.events.findMany({
      where: (events, { eq, and, gte, lte }) => and(
        eq(events.teamId, teamId),
        gte(events.startTime, startDate),
        lte(events.endTime, endDate)
      ),
      with: {
        facility: true,
        opponent: true,
        availability: true,
      },
    })
  },

  // Facility availability
  findAvailableCourts: async (startTime: Date, endTime: Date, teamId: string) => {
    // This is a complex query that finds courts not booked during the specified time
    return await db.query.facilities.findMany({
      where: (facilities, { eq }) => eq(facilities.teamId, teamId),
      with: {
        // Note: This would need a more complex subquery to check availability
        // For now, returning all facilities and filtering in application logic
      },
    })
  },

  // Recent messages
  findRecentMessages: async (channelId: string, limit: number = 50) => {
    return await db.query.messages.findMany({
      where: (messages, { eq, isNull }) => and(
        eq(messages.channelId, channelId),
        isNull(messages.deletedAt)
      ),
      orderBy: (messages, { desc }) => [desc(messages.createdAt)],
      limit,
      with: {
        sender: true,
        reads: true,
      },
    })
  },

  // Video library
  findTeamVideos: async (teamId: string, limit: number = 20) => {
    return await db.query.videos.findMany({
      where: (videos, { eq }) => eq(videos.uploadStatus, 'ready'),
      orderBy: (videos, { desc }) => [desc(videos.createdAt)],
      limit,
      with: {
        event: {
          where: (events, { eq }) => eq(events.teamId, teamId),
        },
        uploader: true,
        annotations: true,
      },
    })
  },
}

// Analytics helpers
export const analytics = {
  recordFeatureUsage: async (userId: string, teamId: string, featureName: string, action: string, metadata: any = {}) => {
    await db.insert(schema.featureUsage).values({
      userId,
      teamId,
      featureName,
      action,
      metadata,
      deviceType: 'mobile', // Would detect this from user agent
    })
  },

  recordError: async (userId: string | null, errorType: string, errorMessage: string, metadata: any = {}) => {
    await db.insert(schema.errorLogs).values({
      userId,
      errorType,
      errorMessage,
      severity: 'medium',
      metadata,
    })
  },

  recordCheckIn: async (data: {
    userId: string
    teamId: string
    availabilityStatus: string
    sorenessLevel?: number
    energyLevel?: number
    completionTimeSeconds?: number
  }) => {
    await db.insert(schema.checkInAnalytics).values({
      ...data,
      checkInDate: new Date(),
      deviceType: 'mobile',
    })
  },
}

// Utility types
export type Database = typeof db
export type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

// Re-export schema for convenience
export { schema } from '../schema'