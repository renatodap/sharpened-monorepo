import { pgTable, uuid, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Communication channels (team chat, coach chat, etc.)
export const channels = pgTable('channels', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull().$type<'team' | 'coaches' | 'captains' | 'social' | 'direct' | 'announcement'>(),
  teamId: uuid('team_id').notNull(), // References teams(id)
  isPrivate: boolean('is_private').default(false),
  isArchived: boolean('is_archived').default(false),
  memberRoles: text('member_roles').array().default(sql`ARRAY[]::text[]`), // Which roles can access
  createdBy: uuid('created_by').notNull(), // References profiles(id)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Channel memberships (for private channels and direct messages)
export const channelMembers = pgTable('channel_members', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  channelId: uuid('channel_id').notNull(), // References channels(id)
  userId: uuid('user_id').notNull(), // References profiles(id)
  role: text('role').default('member').$type<'admin' | 'moderator' | 'member'>(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
  lastReadAt: timestamp('last_read_at', { withTimezone: true }).defaultNow(),
  notificationsEnabled: boolean('notifications_enabled').default(true),
})

// Messages within channels
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  channelId: uuid('channel_id').notNull(), // References channels(id)
  senderId: uuid('sender_id'), // References profiles(id), nullable for system messages
  content: text('content').notNull(),
  messageType: text('message_type').default('text').$type<'text' | 'image' | 'file' | 'announcement' | 'poll' | 'reminder'>(),
  replyToId: uuid('reply_to_id'), // References messages(id)
  threadId: uuid('thread_id'), // For threaded conversations
  attachments: jsonb('attachments').default([]),
  mentions: uuid('mentions').array().default(sql`ARRAY[]::uuid[]`), // User IDs mentioned in message
  reactions: jsonb('reactions').default({}), // Emoji reactions
  isPinned: boolean('is_pinned').default(false),
  isEdited: boolean('is_edited').default(false),
  editedAt: timestamp('edited_at', { withTimezone: true }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Message read receipts
export const messageReads = pgTable('message_reads', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  messageId: uuid('message_id').notNull(), // References messages(id)
  userId: uuid('user_id').notNull(), // References profiles(id)
  readAt: timestamp('read_at', { withTimezone: true }).defaultNow(),
})

// Push notification subscriptions
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(), // References profiles(id)
  endpoint: text('endpoint').notNull(),
  keys: jsonb('keys').notNull(), // Contains p256dh and auth keys
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Notification preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull().unique(), // References profiles(id)
  emailNotifications: boolean('email_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(true),
  smsNotifications: boolean('sms_notifications').default(false),
  notificationTypes: jsonb('notification_types').default({
    schedule_changes: true,
    new_messages: true,
    travel_updates: true,
    video_uploads: true,
    match_results: true,
    practice_reminders: true,
    assignment_deadlines: true,
  }),
  quietHours: jsonb('quiet_hours').default({ start: '22:00', end: '07:00' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Notification queue for delivery
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').notNull(), // References profiles(id)
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data').default({}),
  deliveryMethod: text('delivery_method').array().default(sql`ARRAY['push']::text[]`),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  deliveryStatus: text('delivery_status').default('pending').$type<'pending' | 'sent' | 'failed' | 'expired'>(),
  priority: text('priority').default('normal').$type<'low' | 'normal' | 'high' | 'urgent'>(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type Channel = typeof channels.$inferSelect
export type NewChannel = typeof channels.$inferInsert
export type ChannelMember = typeof channelMembers.$inferSelect
export type NewChannelMember = typeof channelMembers.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
export type MessageRead = typeof messageReads.$inferSelect
export type NewMessageRead = typeof messageReads.$inferInsert
export type PushSubscription = typeof pushSubscriptions.$inferSelect
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert
export type NotificationPreference = typeof notificationPreferences.$inferSelect
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert
export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert