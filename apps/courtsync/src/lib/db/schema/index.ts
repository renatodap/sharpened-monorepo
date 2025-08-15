// Export all schema tables and types
export * from './auth'
export * from './courts'
export * from './communications'
export * from './video'
export * from './scouting'
export * from './travel'
export * from './analytics'

// Centralized schema object for Drizzle ORM
import * as auth from './auth'
import * as courts from './courts'
import * as communications from './communications'
import * as video from './video'
import * as scouting from './scouting'
import * as travel from './travel'
import * as analytics from './analytics'

export const schema = {
  // Authentication & User Management
  ...auth,
  
  // Court & Event Management
  ...courts,
  
  // Communications
  ...communications,
  
  // Video Management
  ...video,
  
  // Scouting & Analytics
  ...scouting,
  
  // Travel Coordination
  ...travel,
  
  // Internal Analytics
  ...analytics,
}

// Database relation definitions for Drizzle
import { relations } from 'drizzle-orm'

// Profile relations
export const profilesRelations = relations(auth.profiles, ({ one, many }) => ({
  team: one(auth.teams, {
    fields: [auth.profiles.teamId],
    references: [auth.teams.id],
  }),
  sentMessages: many(communications.messages),
  videoAnnotations: many(video.videoAnnotations),
  scoutingReports: many(scouting.scoutingReports),
  eventAvailability: many(courts.eventAvailability),
}))

// Team relations
export const teamsRelations = relations(auth.teams, ({ one, many }) => ({
  headCoach: one(auth.profiles, {
    fields: [auth.teams.headCoachId],
    references: [auth.profiles.id],
  }),
  members: many(auth.profiles),
  events: many(courts.events),
  facilities: many(courts.facilities),
  channels: many(communications.channels),
}))

// Event relations
export const eventsRelations = relations(courts.events, ({ one, many }) => ({
  team: one(auth.teams, {
    fields: [courts.events.teamId],
    references: [auth.teams.id],
  }),
  facility: one(courts.facilities, {
    fields: [courts.events.facilityId],
    references: [courts.facilities.id],
  }),
  opponent: one(scouting.opponents, {
    fields: [courts.events.opponentId],
    references: [scouting.opponents.id],
  }),
  availability: many(courts.eventAvailability),
  travelEvent: one(travel.travelEvents),
  videos: many(video.videos),
}))

// Video relations
export const videosRelations = relations(video.videos, ({ one, many }) => ({
  event: one(courts.events, {
    fields: [video.videos.eventId],
    references: [courts.events.id],
  }),
  uploader: one(auth.profiles, {
    fields: [video.videos.uploaderId],
    references: [auth.profiles.id],
  }),
  annotations: many(video.videoAnnotations),
  views: many(video.videoViews),
}))

// Channel relations
export const channelsRelations = relations(communications.channels, ({ one, many }) => ({
  team: one(auth.teams, {
    fields: [communications.channels.teamId],
    references: [auth.teams.id],
  }),
  messages: many(communications.messages),
  members: many(communications.channelMembers),
}))

// Message relations
export const messagesRelations = relations(communications.messages, ({ one, many }) => ({
  channel: one(communications.channels, {
    fields: [communications.messages.channelId],
    references: [communications.channels.id],
  }),
  sender: one(auth.profiles, {
    fields: [communications.messages.senderId],
    references: [auth.profiles.id],
  }),
  reads: many(communications.messageReads),
}))

// Scouting report relations
export const scoutingReportsRelations = relations(scouting.scoutingReports, ({ one, many }) => ({
  opponent: one(scouting.opponents, {
    fields: [scouting.scoutingReports.opponentId],
    references: [scouting.opponents.id],
  }),
  team: one(auth.teams, {
    fields: [scouting.scoutingReports.teamId],
    references: [auth.teams.id],
  }),
  author: one(auth.profiles, {
    fields: [scouting.scoutingReports.authorId],
    references: [auth.profiles.id],
  }),
  tags: many(scouting.scoutingReportTags),
}))

// Travel event relations
export const travelEventsRelations = relations(travel.travelEvents, ({ one, many }) => ({
  event: one(courts.events, {
    fields: [travel.travelEvents.eventId],
    references: [courts.events.id],
  }),
  itinerary: many(travel.travelItinerary),
  participants: many(travel.travelParticipants),
  vehicles: many(travel.travelVehicles),
}))

export type DatabaseSchema = typeof schema