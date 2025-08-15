import { pgTable, uuid, text, integer, bigint, boolean, timestamp, jsonb, decimal } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Video recordings (practices, matches, drills)
export const videos = pgTable('videos', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  eventId: uuid('event_id'), // References events(id)
  title: text('title').notNull(),
  description: text('description'),
  fileUrl: text('file_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  fileSize: bigint('file_size', { mode: 'number' }),
  durationSeconds: integer('duration_seconds'),
  resolution: text('resolution'),
  format: text('format'),
  uploadStatus: text('upload_status').default('processing').$type<'uploading' | 'processing' | 'ready' | 'failed'>(),
  uploaderId: uuid('uploader_id').notNull(), // References profiles(id)
  recordedAt: timestamp('recorded_at', { withTimezone: true }),
  videoType: text('video_type').$type<'practice' | 'match' | 'drill' | 'analysis' | 'highlight' | 'technique'>(),
  visibility: text('visibility').default('team').$type<'public' | 'team' | 'coaches' | 'private'>(),
  featuredPlayers: uuid('featured_players').array().default(sql`ARRAY[]::uuid[]`),
  tags: text('tags').array().default(sql`ARRAY[]::text[]`),
  qualityScore: integer('quality_score'), // 1-5 rating
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Video annotations and comments
export const videoAnnotations = pgTable('video_annotations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  videoId: uuid('video_id').notNull(), // References videos(id)
  authorId: uuid('author_id').notNull(), // References profiles(id)
  timestampSeconds: integer('timestamp_seconds').notNull(),
  endTimestampSeconds: integer('end_timestamp_seconds'), // For range annotations
  annotationType: text('annotation_type').default('comment').$type<'comment' | 'technique' | 'strategy' | 'highlight' | 'error' | 'improvement'>(),
  title: text('title'),
  content: text('content').notNull(),
  coordinates: jsonb('coordinates'), // For spatial annotations on video
  taggedPlayers: uuid('tagged_players').array().default(sql`ARRAY[]::uuid[]`),
  visibility: text('visibility').default('team').$type<'public' | 'team' | 'coaches' | 'private'>(),
  isResolved: boolean('is_resolved').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

// Video viewing analytics
export const videoViews = pgTable('video_views', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  videoId: uuid('video_id').notNull(), // References videos(id)
  viewerId: uuid('viewer_id'), // References profiles(id), nullable for anonymous views
  watchDurationSeconds: integer('watch_duration_seconds'),
  completionPercentage: decimal('completion_percentage', { precision: 5, scale: 2 }),
  viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow(),
  deviceType: text('device_type').$type<'mobile' | 'tablet' | 'desktop'>(),
})

// Video upload progress tracking
export const videoUploads = pgTable('video_uploads', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  videoId: uuid('video_id').notNull(), // References videos(id)
  uploaderId: uuid('uploader_id').notNull(), // References profiles(id)
  fileName: text('file_name').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  uploadedBytes: bigint('uploaded_bytes', { mode: 'number' }).default(0),
  chunkSize: integer('chunk_size').default(1048576), // 1MB default
  totalChunks: integer('total_chunks').notNull(),
  uploadedChunks: integer('uploaded_chunks').default(0),
  uploadStatus: text('upload_status').default('pending').$type<'pending' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled'>(),
  uploadKey: text('upload_key').notNull().unique(), // Unique key for resumable uploads
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }), // When to clean up incomplete uploads
})

// Video processing queue
export const videoProcessingQueue = pgTable('video_processing_queue', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  videoId: uuid('video_id').notNull(), // References videos(id)
  processingType: text('processing_type').notNull().$type<'thumbnail' | 'transcode' | 'compress' | 'analyze'>(),
  priority: integer('priority').default(0), // Higher = more priority
  status: text('status').default('pending').$type<'pending' | 'processing' | 'completed' | 'failed'>(),
  progress: decimal('progress', { precision: 5, scale: 2 }).default('0'), // 0-100%
  processingData: jsonb('processing_data').default({}),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Video streaming sessions (for analytics)
export const videoSessions = pgTable('video_sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  videoId: uuid('video_id').notNull(), // References videos(id)
  viewerId: uuid('viewer_id'), // References profiles(id)
  sessionToken: text('session_token').notNull().unique(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  totalWatchTime: integer('total_watch_time'), // seconds
  maxPosition: integer('max_position'), // furthest point reached in video
  deviceInfo: jsonb('device_info'),
  qualitySettings: jsonb('quality_settings'),
})

export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert
export type VideoAnnotation = typeof videoAnnotations.$inferSelect
export type NewVideoAnnotation = typeof videoAnnotations.$inferInsert
export type VideoView = typeof videoViews.$inferSelect
export type NewVideoView = typeof videoViews.$inferInsert
export type VideoUpload = typeof videoUploads.$inferSelect
export type NewVideoUpload = typeof videoUploads.$inferInsert
export type VideoProcessingQueue = typeof videoProcessingQueue.$inferSelect
export type NewVideoProcessingQueue = typeof videoProcessingQueue.$inferInsert
export type VideoSession = typeof videoSessions.$inferSelect
export type NewVideoSession = typeof videoSessions.$inferInsert