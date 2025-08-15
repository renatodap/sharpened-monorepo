import { pgTable, uuid, text, integer, timestamp, jsonb, boolean, date } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Opponent teams and institutions
export const opponents = pgTable('opponents', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  institution: text('institution'),
  conference: text('conference'),
  division: text('division'),
  locationCity: text('location_city'),
  locationState: text('location_state'),
  website: text('website'),
  colors: text('colors').array().default(sql`ARRAY[]::text[]`),
  mascot: text('mascot'),
  headCoach: text('head_coach'),
  contactInfo: jsonb('contact_info').default({}),
  historicalRecord: jsonb('historical_record').default({}),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Individual opponent players
export const opponentPlayers = pgTable('opponent_players', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  opponentId: uuid('opponent_id').notNull(), // References opponents(id)
  name: text('name').notNull(),
  year: text('year'),
  position: text('position'),
  height: text('height'),
  hometown: text('hometown'),
  playingStyle: text('playing_style'),
  dominantHand: text('dominant_hand').$type<'right' | 'left' | 'ambidextrous'>(),
  strengths: text('strengths').array().default(sql`ARRAY[]::text[]`),
  weaknesses: text('weaknesses').array().default(sql`ARRAY[]::text[]`),
  injuryHistory: text('injury_history').array().default(sql`ARRAY[]::text[]`),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Scouting reports for opponents
export const scoutingReports = pgTable('scouting_reports', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  opponentId: uuid('opponent_id').notNull(), // References opponents(id)
  teamId: uuid('team_id').notNull(), // References teams(id)
  authorId: uuid('author_id').notNull(), // References profiles(id)
  matchDate: date('match_date'),
  venue: text('venue'),
  reportType: text('report_type').default('general').$type<'general' | 'pre_match' | 'post_match' | 'player_specific'>(),
  overallAssessment: text('overall_assessment'),
  teamStrengths: text('team_strengths').array().default(sql`ARRAY[]::text[]`),
  teamWeaknesses: text('team_weaknesses').array().default(sql`ARRAY[]::text[]`),
  recommendedStrategy: text('recommended_strategy'),
  lineupNotes: jsonb('lineup_notes').default({}),
  individualMatchups: jsonb('individual_matchups').default([]),
  weatherConditions: text('weather_conditions'),
  courtConditions: text('court_conditions'),
  confidenceLevel: integer('confidence_level'), // 1-5 scale
  attachments: jsonb('attachments').default([]),
  isConfidential: boolean('is_confidential').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Match results and statistics
export const matchResults = pgTable('match_results', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  eventId: uuid('event_id'), // References events(id)
  teamId: uuid('team_id').notNull(), // References teams(id)
  opponentId: uuid('opponent_id').notNull(), // References opponents(id)
  matchDate: date('match_date').notNull(),
  venue: text('venue'),
  matchType: text('match_type').$type<'dual' | 'tournament' | 'exhibition' | 'scrimmage'>(),
  teamScore: integer('team_score'),
  opponentScore: integer('opponent_score'),
  matchResult: text('match_result').$type<'win' | 'loss' | 'tie' | 'cancelled' | 'postponed'>(),
  singlesResults: jsonb('singles_results').default([]),
  doublesResults: jsonb('doubles_results').default([]),
  matchSummary: text('match_summary'),
  conditions: jsonb('conditions').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Player performance metrics
export const playerStats = pgTable('player_stats', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  playerId: uuid('player_id').notNull(), // References profiles(id)
  seasonYear: integer('season_year'),
  matchId: uuid('match_id'), // References match_results(id)
  position: integer('position'), // 1-6 for singles, 1-3 for doubles
  partnerId: uuid('partner_id'), // References profiles(id) for doubles
  result: text('result').$type<'win' | 'loss' | 'default' | 'retired' | 'walkover'>(),
  setsWon: integer('sets_won').default(0),
  setsLost: integer('sets_lost').default(0),
  gamesWon: integer('games_won').default(0),
  gamesLost: integer('games_lost').default(0),
  matchDurationMinutes: integer('match_duration_minutes'),
  performanceRating: integer('performance_rating'), // 1-10 scale
  notes: text('notes'),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow(),
})

// Practice attendance and performance
export const practiceAttendance = pgTable('practice_attendance', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  playerId: uuid('player_id').notNull(), // References profiles(id)
  eventId: uuid('event_id').notNull(), // References events(id)
  attendanceStatus: text('attendance_status').$type<'present' | 'absent' | 'late' | 'excused' | 'injured'>(),
  arrivalTime: timestamp('arrival_time', { withTimezone: true }),
  departureTime: timestamp('departure_time', { withTimezone: true }),
  performanceNotes: text('performance_notes'),
  effortLevel: integer('effort_level'), // 1-5 scale
  skillFocus: text('skill_focus').array().default(sql`ARRAY[]::text[]`),
  injuriesReported: text('injuries_reported').array().default(sql`ARRAY[]::text[]`),
  recordedBy: uuid('recorded_by').notNull(), // References profiles(id)
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow(),
})

// Scouting templates for consistent reporting
export const scoutingTemplates = pgTable('scouting_templates', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  teamId: uuid('team_id').notNull(), // References teams(id)
  templateType: text('template_type').$type<'pre_match' | 'post_match' | 'player_analysis' | 'team_analysis'>(),
  fields: jsonb('fields').notNull(), // Dynamic form structure
  isDefault: boolean('is_default').default(false),
  createdBy: uuid('created_by').notNull(), // References profiles(id)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Scouting tags for categorization
export const scoutingTags = pgTable('scouting_tags', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  color: text('color').default('#3B82F6'), // Hex color code
  description: text('description'),
  teamId: uuid('team_id').notNull(), // References teams(id)
  createdBy: uuid('created_by').notNull(), // References profiles(id)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Many-to-many relationship between scouting reports and tags
export const scoutingReportTags = pgTable('scouting_report_tags', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  reportId: uuid('report_id').notNull(), // References scouting_reports(id)
  tagId: uuid('tag_id').notNull(), // References scouting_tags(id)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type Opponent = typeof opponents.$inferSelect
export type NewOpponent = typeof opponents.$inferInsert
export type OpponentPlayer = typeof opponentPlayers.$inferSelect
export type NewOpponentPlayer = typeof opponentPlayers.$inferInsert
export type ScoutingReport = typeof scoutingReports.$inferSelect
export type NewScoutingReport = typeof scoutingReports.$inferInsert
export type MatchResult = typeof matchResults.$inferSelect
export type NewMatchResult = typeof matchResults.$inferInsert
export type PlayerStats = typeof playerStats.$inferSelect
export type NewPlayerStats = typeof playerStats.$inferInsert
export type PracticeAttendance = typeof practiceAttendance.$inferSelect
export type NewPracticeAttendance = typeof practiceAttendance.$inferInsert
export type ScoutingTemplate = typeof scoutingTemplates.$inferSelect
export type NewScoutingTemplate = typeof scoutingTemplates.$inferInsert
export type ScoutingTag = typeof scoutingTags.$inferSelect
export type NewScoutingTag = typeof scoutingTags.$inferInsert
export type ScoutingReportTag = typeof scoutingReportTags.$inferSelect
export type NewScoutingReportTag = typeof scoutingReportTags.$inferInsert