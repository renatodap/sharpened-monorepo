import { pgTable, uuid, text, timestamp, jsonb, integer, boolean } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// System activity log for auditing
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id'), // References profiles(id), nullable for system events
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: uuid('resource_id'),
  details: jsonb('details').default({}),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  sessionId: text('session_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// App usage analytics (zero-cost internal tracking)
export const usageAnalytics = pgTable('usage_analytics', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id'), // References profiles(id)
  sessionId: text('session_id'),
  featureUsed: text('feature_used').notNull(),
  durationSeconds: integer('duration_seconds'),
  deviceType: text('device_type').$type<'mobile' | 'tablet' | 'desktop'>(),
  platform: text('platform'),
  version: text('version'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Performance metrics tracking
export const performanceMetrics = pgTable('performance_metrics', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id'), // References profiles(id)
  pageUrl: text('page_url').notNull(),
  metricType: text('metric_type').$type<'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP'>(),
  value: integer('value').notNull(), // Value in milliseconds or unitless
  rating: text('rating').$type<'good' | 'needs-improvement' | 'poor'>(),
  deviceType: text('device_type').$type<'mobile' | 'tablet' | 'desktop'>(),
  connectionType: text('connection_type'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Error tracking and debugging
export const errorLogs = pgTable('error_logs', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id'), // References profiles(id)
  errorType: text('error_type').$type<'javascript' | 'api' | 'database' | 'network' | 'authentication'>(),
  errorMessage: text('error_message').notNull(),
  errorStack: text('error_stack'),
  pageUrl: text('page_url'),
  userAgent: text('user_agent'),
  deviceType: text('device_type').$type<'mobile' | 'tablet' | 'desktop'>(),
  severity: text('severity').$type<'low' | 'medium' | 'high' | 'critical'>(),
  resolved: boolean('resolved').default(false),
  resolvedBy: uuid('resolved_by'), // References profiles(id)
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Lightning Check-In analytics
export const checkInAnalytics = pgTable('check_in_analytics', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(), // References profiles(id)
  teamId: uuid('team_id').notNull(), // References teams(id)
  checkInDate: timestamp('check_in_date', { mode: 'date' }).notNull(),
  availabilityStatus: text('availability_status').$type<'available' | 'unavailable' | 'maybe'>(),
  sorenessLevel: integer('soreness_level'), // 1-5 scale
  energyLevel: integer('energy_level'), // 1-5 scale
  sleepQuality: integer('sleep_quality'), // 1-5 scale
  classConflicts: text('class_conflicts').array().default(sql`ARRAY[]::text[]`),
  injuryReports: text('injury_reports').array().default(sql`ARRAY[]::text[]`),
  notes: text('notes'),
  completionTimeSeconds: integer('completion_time_seconds'), // How long the check-in took
  deviceType: text('device_type').$type<'mobile' | 'tablet' | 'desktop'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Feature usage and adoption tracking
export const featureUsage = pgTable('feature_usage', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id'), // References profiles(id)
  teamId: uuid('team_id'), // References teams(id)
  featureName: text('feature_name').notNull(),
  action: text('action').notNull(), // e.g., 'view', 'create', 'edit', 'delete'
  metadata: jsonb('metadata').default({}),
  sessionId: text('session_id'),
  deviceType: text('device_type').$type<'mobile' | 'tablet' | 'desktop'>(),
  timeSpentSeconds: integer('time_spent_seconds'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Team engagement metrics
export const teamEngagement = pgTable('team_engagement', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid('team_id').notNull(), // References teams(id)
  date: timestamp('date', { mode: 'date' }).notNull(),
  activeUsers: integer('active_users'),
  totalSessions: integer('total_sessions'),
  avgSessionDuration: integer('avg_session_duration'), // seconds
  messagesSent: integer('messages_sent'),
  videosUploaded: integer('videos_uploaded'),
  checkInsCompleted: integer('check_ins_completed'),
  eventsCreated: integer('events_created'),
  scoutingReportsCreated: integer('scouting_reports_created'),
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow(),
})

// User retention and lifecycle tracking
export const userRetention = pgTable('user_retention', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(), // References profiles(id)
  cohortWeek: timestamp('cohort_week', { mode: 'date' }).notNull(), // Week they joined
  weekNumber: integer('week_number').notNull(), // Weeks since joining
  wasActive: boolean('was_active').notNull(),
  sessionsCount: integer('sessions_count'),
  featuresUsed: text('features_used').array().default(sql`ARRAY[]::text[]`),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  calculatedAt: timestamp('calculated_at', { withTimezone: true }).defaultNow(),
})

// A/B test tracking (for future experiments)
export const experimentEvents = pgTable('experiment_events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id'), // References profiles(id)
  experimentId: text('experiment_id').notNull(),
  variantId: text('variant_id').notNull(),
  eventType: text('event_type').$type<'exposure' | 'conversion' | 'click' | 'view'>(),
  eventData: jsonb('event_data').default({}),
  sessionId: text('session_id'),
  deviceType: text('device_type').$type<'mobile' | 'tablet' | 'desktop'>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type UsageAnalytic = typeof usageAnalytics.$inferSelect
export type NewUsageAnalytic = typeof usageAnalytics.$inferInsert
export type PerformanceMetric = typeof performanceMetrics.$inferSelect
export type NewPerformanceMetric = typeof performanceMetrics.$inferInsert
export type ErrorLog = typeof errorLogs.$inferSelect
export type NewErrorLog = typeof errorLogs.$inferInsert
export type CheckInAnalytic = typeof checkInAnalytics.$inferSelect
export type NewCheckInAnalytic = typeof checkInAnalytics.$inferInsert
export type FeatureUsage = typeof featureUsage.$inferSelect
export type NewFeatureUsage = typeof featureUsage.$inferInsert
export type TeamEngagement = typeof teamEngagement.$inferSelect
export type NewTeamEngagement = typeof teamEngagement.$inferInsert
export type UserRetention = typeof userRetention.$inferSelect
export type NewUserRetention = typeof userRetention.$inferInsert
export type ExperimentEvent = typeof experimentEvents.$inferSelect
export type NewExperimentEvent = typeof experimentEvents.$inferInsert