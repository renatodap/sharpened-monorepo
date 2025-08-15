import { pgTable, uuid, text, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// User profiles (extends Supabase auth.users)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().unique(), // References auth.users(id)
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  preferredName: text('preferred_name'),
  role: text('role').notNull().$type<'coach' | 'assistant_coach' | 'captain' | 'player' | 'admin'>(),
  teamId: uuid('team_id'), // References teams(id)
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  classYear: integer('class_year'),
  classSchedule: jsonb('class_schedule').default([]),
  emergencyContact: jsonb('emergency_contact'),
  isActive: boolean('is_active').default(true),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Team organization
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  sport: text('sport').default('tennis'),
  gender: text('gender').$type<'men' | 'women' | 'mixed'>(),
  seasonYear: integer('season_year').notNull(),
  seasonType: text('season_type').default('spring').$type<'fall' | 'spring' | 'summer'>(),
  institution: text('institution').notNull(),
  conference: text('conference'),
  division: text('division').default('III'),
  headCoachId: uuid('head_coach_id'), // References profiles(id)
  assistantCoaches: uuid('assistant_coaches').array().default(sql`ARRAY[]::uuid[]`),
  captains: uuid('captains').array().default(sql`ARRAY[]::uuid[]`),
  teamSettings: jsonb('team_settings').default({}),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Session management for auth
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(), // References profiles(user_id)
  sessionToken: text('session_token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Team invitations
export const teamInvitations = pgTable('team_invitations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  teamId: uuid('team_id').notNull(), // References teams(id)
  email: text('email').notNull(),
  role: text('role').notNull().$type<'coach' | 'assistant_coach' | 'captain' | 'player'>(),
  inviteCode: text('invite_code').notNull().unique(),
  invitedBy: uuid('invited_by').notNull(), // References profiles(id)
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// User permissions and role assignments
export const userPermissions = pgTable('user_permissions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(), // References profiles(id)
  teamId: uuid('team_id').notNull(), // References teams(id)
  permissions: text('permissions').array().default(sql`ARRAY[]::text[]`),
  grantedBy: uuid('granted_by').notNull(), // References profiles(id)
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type TeamInvitation = typeof teamInvitations.$inferSelect
export type NewTeamInvitation = typeof teamInvitations.$inferInsert
export type UserPermission = typeof userPermissions.$inferSelect
export type NewUserPermission = typeof userPermissions.$inferInsert