import { pgTable, uuid, text, integer, boolean, timestamp, decimal, jsonb } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Tennis facilities (courts, bubble, etc.)
export const facilities = pgTable('facilities', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  type: text('type').notNull().$type<'outdoor_court' | 'indoor_court' | 'bubble_court' | 'fitness_center' | 'meeting_room'>(),
  capacity: integer('capacity').notNull().default(1),
  surfaceType: text('surface_type').$type<'hard' | 'clay' | 'grass' | 'indoor_hard'>(),
  weatherDependent: boolean('weather_dependent').default(true),
  locationDescription: text('location_description'),
  locationLat: decimal('location_lat', { precision: 10, scale: 8 }),
  locationLng: decimal('location_lng', { precision: 11, scale: 8 }),
  amenities: text('amenities').array().default(sql`ARRAY[]::text[]`),
  availabilityRules: jsonb('availability_rules').default({}),
  teamId: uuid('team_id'), // References teams(id)
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Court surface conditions and maintenance
export const facilityConditions = pgTable('facility_conditions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  facilityId: uuid('facility_id').notNull(), // References facilities(id)
  conditionType: text('condition_type').notNull().$type<'excellent' | 'good' | 'fair' | 'poor' | 'closed'>(),
  weatherConditions: text('weather_conditions'),
  notes: text('notes'),
  reportedBy: uuid('reported_by').notNull(), // References profiles(id)
  reportedAt: timestamp('reported_at', { withTimezone: true }).defaultNow(),
})

// All team events (practices, matches, meetings, travel)
export const events = pgTable('events', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  eventType: text('event_type').notNull().$type<'practice' | 'match' | 'meeting' | 'travel' | 'tournament' | 'conditioning' | 'social'>(),
  recurrenceRule: text('recurrence_rule'), // RRULE format for recurring events
  teamId: uuid('team_id').notNull(), // References teams(id)
  facilityId: uuid('facility_id'), // References facilities(id)
  opponentId: uuid('opponent_id'), // References opponents(id)
  locationOverride: text('location_override'), // For events not at standard facilities
  requiredAttendance: boolean('required_attendance').default(false),
  maxParticipants: integer('max_participants'),
  eventMetadata: jsonb('event_metadata').default({}), // Additional event-specific data
  createdBy: uuid('created_by').notNull(), // References profiles(id)
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelledBy: uuid('cancelled_by'), // References profiles(id)
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Player availability and RSVP for events
export const eventAvailability = pgTable('event_availability', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(), // References profiles(id)
  eventId: uuid('event_id').notNull(), // References events(id)
  status: text('status').notNull().$type<'available' | 'unavailable' | 'maybe' | 'confirmed' | 'attended' | 'missed'>(),
  responseNotes: text('response_notes'),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  checkedOutAt: timestamp('checked_out_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Recurring event instances (for tracking individual occurrences)
export const eventInstances = pgTable('event_instances', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  parentEventId: uuid('parent_event_id').notNull(), // References events(id)
  instanceDate: timestamp('instance_date', { mode: 'date' }).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: text('status').default('scheduled').$type<'scheduled' | 'cancelled' | 'completed' | 'rescheduled'>(),
  modifications: jsonb('modifications').default({}), // Any changes from parent event
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Court booking conflicts and resolution
export const courtBookings = pgTable('court_bookings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  eventId: uuid('event_id').notNull(), // References events(id)
  facilityId: uuid('facility_id').notNull(), // References facilities(id)
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  priority: integer('priority').default(0), // Higher numbers = higher priority
  bookingStatus: text('booking_status').default('confirmed').$type<'pending' | 'confirmed' | 'cancelled' | 'conflict'>(),
  conflictResolution: jsonb('conflict_resolution'),
  bookedBy: uuid('booked_by').notNull(), // References profiles(id)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type Facility = typeof facilities.$inferSelect
export type NewFacility = typeof facilities.$inferInsert
export type FacilityCondition = typeof facilityConditions.$inferSelect
export type NewFacilityCondition = typeof facilityConditions.$inferInsert
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type EventAvailability = typeof eventAvailability.$inferSelect
export type NewEventAvailability = typeof eventAvailability.$inferInsert
export type EventInstance = typeof eventInstances.$inferSelect
export type NewEventInstance = typeof eventInstances.$inferInsert
export type CourtBooking = typeof courtBookings.$inferSelect
export type NewCourtBooking = typeof courtBookings.$inferInsert