CREATE TABLE IF NOT EXISTS "activity_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" uuid,
	"details" jsonb DEFAULT '{}'::jsonb,
	"ip_address" text,
	"user_agent" text,
	"session_id" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "check_in_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"check_in_date" timestamp NOT NULL,
	"availability_status" text,
	"soreness_level" integer,
	"energy_level" integer,
	"sleep_quality" integer,
	"class_conflicts" text[] DEFAULT ARRAY[]::text[],
	"injury_reports" text[] DEFAULT ARRAY[]::text[],
	"notes" text,
	"completion_time_seconds" integer,
	"device_type" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "error_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"error_type" text,
	"error_message" text NOT NULL,
	"error_stack" text,
	"page_url" text,
	"user_agent" text,
	"device_type" text,
	"severity" text,
	"resolved" boolean DEFAULT false,
	"resolved_by" uuid,
	"resolved_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "experiment_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"experiment_id" text NOT NULL,
	"variant_id" text NOT NULL,
	"event_type" text,
	"event_data" jsonb DEFAULT '{}'::jsonb,
	"session_id" text,
	"device_type" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feature_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"team_id" uuid,
	"feature_name" text NOT NULL,
	"action" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"session_id" text,
	"device_type" text,
	"time_spent_seconds" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "performance_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"page_url" text NOT NULL,
	"metric_type" text,
	"value" integer NOT NULL,
	"rating" text,
	"device_type" text,
	"connection_type" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_engagement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"active_users" integer,
	"total_sessions" integer,
	"avg_session_duration" integer,
	"messages_sent" integer,
	"videos_uploaded" integer,
	"check_ins_completed" integer,
	"events_created" integer,
	"scouting_reports_created" integer,
	"calculated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usage_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" text,
	"feature_used" text NOT NULL,
	"duration_seconds" integer,
	"device_type" text,
	"platform" text,
	"version" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_retention" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"cohort_week" timestamp NOT NULL,
	"week_number" integer NOT NULL,
	"was_active" boolean NOT NULL,
	"sessions_count" integer,
	"features_used" text[] DEFAULT ARRAY[]::text[],
	"last_active_at" timestamp with time zone,
	"calculated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"preferred_name" text,
	"role" text NOT NULL,
	"team_id" uuid,
	"avatar_url" text,
	"phone" text,
	"class_year" integer,
	"class_schedule" jsonb DEFAULT '[]'::jsonb,
	"emergency_contact" jsonb,
	"is_active" boolean DEFAULT true,
	"last_active_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"last_active_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"invite_code" text NOT NULL,
	"invited_by" uuid NOT NULL,
	"accepted_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "team_invitations_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sport" text DEFAULT 'tennis',
	"gender" text,
	"season_year" integer NOT NULL,
	"season_type" text DEFAULT 'spring',
	"institution" text NOT NULL,
	"conference" text,
	"division" text DEFAULT 'III',
	"head_coach_id" uuid,
	"assistant_coaches" uuid[] DEFAULT ARRAY[]::uuid[],
	"captains" uuid[] DEFAULT ARRAY[]::uuid[],
	"team_settings" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"permissions" text[] DEFAULT ARRAY[]::text[],
	"granted_by" uuid NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channel_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'member',
	"joined_at" timestamp with time zone DEFAULT now(),
	"last_read_at" timestamp with time zone DEFAULT now(),
	"notifications_enabled" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"team_id" uuid NOT NULL,
	"is_private" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"member_roles" text[] DEFAULT ARRAY[]::text[],
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "message_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channel_id" uuid NOT NULL,
	"sender_id" uuid,
	"content" text NOT NULL,
	"message_type" text DEFAULT 'text',
	"reply_to_id" uuid,
	"thread_id" uuid,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"mentions" uuid[] DEFAULT ARRAY[]::uuid[],
	"reactions" jsonb DEFAULT '{}'::jsonb,
	"is_pinned" boolean DEFAULT false,
	"is_edited" boolean DEFAULT false,
	"edited_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"sms_notifications" boolean DEFAULT false,
	"notification_types" jsonb DEFAULT '{"schedule_changes":true,"new_messages":true,"travel_updates":true,"video_uploads":true,"match_results":true,"practice_reminders":true,"assignment_deadlines":true}'::jsonb,
	"quiet_hours" jsonb DEFAULT '{"start":"22:00","end":"07:00"}'::jsonb,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"delivery_method" text[] DEFAULT ARRAY['push']::text[],
	"sent_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"delivery_status" text DEFAULT 'pending',
	"priority" text DEFAULT 'normal',
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"keys" jsonb NOT NULL,
	"user_agent" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "court_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"facility_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"priority" integer DEFAULT 0,
	"booking_status" text DEFAULT 'confirmed',
	"conflict_resolution" jsonb,
	"booked_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"status" text NOT NULL,
	"response_notes" text,
	"checked_in_at" timestamp with time zone,
	"checked_out_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event_instances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_event_id" uuid NOT NULL,
	"instance_date" timestamp NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'scheduled',
	"modifications" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"event_type" text NOT NULL,
	"recurrence_rule" text,
	"team_id" uuid NOT NULL,
	"facility_id" uuid,
	"opponent_id" uuid,
	"location_override" text,
	"required_attendance" boolean DEFAULT false,
	"max_participants" integer,
	"event_metadata" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancelled_by" uuid,
	"cancellation_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"capacity" integer DEFAULT 1 NOT NULL,
	"surface_type" text,
	"weather_dependent" boolean DEFAULT true,
	"location_description" text,
	"location_lat" numeric(10, 8),
	"location_lng" numeric(11, 8),
	"amenities" text[] DEFAULT ARRAY[]::text[],
	"availability_rules" jsonb DEFAULT '{}'::jsonb,
	"team_id" uuid,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "facility_conditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"condition_type" text NOT NULL,
	"weather_conditions" text,
	"notes" text,
	"reported_by" uuid NOT NULL,
	"reported_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "video_annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"timestamp_seconds" integer NOT NULL,
	"end_timestamp_seconds" integer,
	"annotation_type" text DEFAULT 'comment',
	"title" text,
	"content" text NOT NULL,
	"coordinates" jsonb,
	"tagged_players" uuid[] DEFAULT ARRAY[]::uuid[],
	"visibility" text DEFAULT 'team',
	"is_resolved" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "video_processing_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"processing_type" text NOT NULL,
	"priority" integer DEFAULT 0,
	"status" text DEFAULT 'pending',
	"progress" numeric(5, 2) DEFAULT '0',
	"processing_data" jsonb DEFAULT '{}'::jsonb,
	"error_message" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "video_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"viewer_id" uuid,
	"session_token" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now(),
	"ended_at" timestamp with time zone,
	"total_watch_time" integer,
	"max_position" integer,
	"device_info" jsonb,
	"quality_settings" jsonb,
	CONSTRAINT "video_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "video_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"uploader_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_size" bigint NOT NULL,
	"uploaded_bytes" bigint DEFAULT 0,
	"chunk_size" integer DEFAULT 1048576,
	"total_chunks" integer NOT NULL,
	"uploaded_chunks" integer DEFAULT 0,
	"upload_status" text DEFAULT 'pending',
	"upload_key" text NOT NULL,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	CONSTRAINT "video_uploads_upload_key_unique" UNIQUE("upload_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "video_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_id" uuid NOT NULL,
	"viewer_id" uuid,
	"watch_duration_seconds" integer,
	"completion_percentage" numeric(5, 2),
	"viewed_at" timestamp with time zone DEFAULT now(),
	"device_type" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"file_size" bigint,
	"duration_seconds" integer,
	"resolution" text,
	"format" text,
	"upload_status" text DEFAULT 'processing',
	"uploader_id" uuid NOT NULL,
	"recorded_at" timestamp with time zone,
	"video_type" text,
	"visibility" text DEFAULT 'team',
	"featured_players" uuid[] DEFAULT ARRAY[]::uuid[],
	"tags" text[] DEFAULT ARRAY[]::text[],
	"quality_score" integer,
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "match_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"team_id" uuid NOT NULL,
	"opponent_id" uuid NOT NULL,
	"match_date" date NOT NULL,
	"venue" text,
	"match_type" text,
	"team_score" integer,
	"opponent_score" integer,
	"match_result" text,
	"singles_results" jsonb DEFAULT '[]'::jsonb,
	"doubles_results" jsonb DEFAULT '[]'::jsonb,
	"match_summary" text,
	"conditions" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opponent_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opponent_id" uuid NOT NULL,
	"name" text NOT NULL,
	"year" text,
	"position" text,
	"height" text,
	"hometown" text,
	"playing_style" text,
	"dominant_hand" text,
	"strengths" text[] DEFAULT ARRAY[]::text[],
	"weaknesses" text[] DEFAULT ARRAY[]::text[],
	"injury_history" text[] DEFAULT ARRAY[]::text[],
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opponents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"institution" text,
	"conference" text,
	"division" text,
	"location_city" text,
	"location_state" text,
	"website" text,
	"colors" text[] DEFAULT ARRAY[]::text[],
	"mascot" text,
	"head_coach" text,
	"contact_info" jsonb DEFAULT '{}'::jsonb,
	"historical_record" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "player_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"season_year" integer,
	"match_id" uuid,
	"position" integer,
	"partner_id" uuid,
	"result" text,
	"sets_won" integer DEFAULT 0,
	"sets_lost" integer DEFAULT 0,
	"games_won" integer DEFAULT 0,
	"games_lost" integer DEFAULT 0,
	"match_duration_minutes" integer,
	"performance_rating" integer,
	"notes" text,
	"recorded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "practice_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"attendance_status" text,
	"arrival_time" timestamp with time zone,
	"departure_time" timestamp with time zone,
	"performance_notes" text,
	"effort_level" integer,
	"skill_focus" text[] DEFAULT ARRAY[]::text[],
	"injuries_reported" text[] DEFAULT ARRAY[]::text[],
	"recorded_by" uuid NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scouting_report_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scouting_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"opponent_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"match_date" date,
	"venue" text,
	"report_type" text DEFAULT 'general',
	"overall_assessment" text,
	"team_strengths" text[] DEFAULT ARRAY[]::text[],
	"team_weaknesses" text[] DEFAULT ARRAY[]::text[],
	"recommended_strategy" text,
	"lineup_notes" jsonb DEFAULT '{}'::jsonb,
	"individual_matchups" jsonb DEFAULT '[]'::jsonb,
	"weather_conditions" text,
	"court_conditions" text,
	"confidence_level" integer,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"is_confidential" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scouting_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#3B82F6',
	"description" text,
	"team_id" uuid NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "scouting_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"team_id" uuid NOT NULL,
	"template_type" text,
	"fields" jsonb NOT NULL,
	"is_default" boolean DEFAULT false,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "travel_check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"travel_event_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"check_in_type" text,
	"check_in_time" timestamp with time zone DEFAULT now(),
	"location" text,
	"notes" text,
	"checked_in_by" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "travel_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"travel_event_id" uuid NOT NULL,
	"participant_id" uuid,
	"document_type" text,
	"document_name" text NOT NULL,
	"file_url" text,
	"is_required" boolean DEFAULT true,
	"submitted_at" timestamp with time zone,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "travel_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"departure_time" timestamp with time zone,
	"return_time" timestamp with time zone,
	"departure_location" text,
	"destination_location" text,
	"transportation_type" text,
	"transportation_details" jsonb DEFAULT '{}'::jsonb,
	"accommodation" jsonb DEFAULT '{}'::jsonb,
	"meal_arrangements" jsonb DEFAULT '{}'::jsonb,
	"required_documents" text[] DEFAULT ARRAY[]::text[],
	"packing_list" text[] DEFAULT ARRAY[]::text[],
	"emergency_contacts" jsonb DEFAULT '[]'::jsonb,
	"budget_info" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "travel_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "travel_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"travel_event_id" uuid NOT NULL,
	"category" text,
	"description" text NOT NULL,
	"amount" integer,
	"currency" text DEFAULT 'USD',
	"paid_by" uuid,
	"reimbursable" boolean DEFAULT true,
	"receipt_url" text,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "travel_itinerary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"travel_event_id" uuid NOT NULL,
	"sequence_order" integer NOT NULL,
	"activity_time" timestamp with time zone,
	"activity_type" text,
	"title" text NOT NULL,
	"description" text,
	"location" text,
	"duration_minutes" integer,
	"responsible_person" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "travel_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"travel_event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"participation_status" text DEFAULT 'invited',
	"room_assignment" text,
	"dietary_restrictions" text,
	"emergency_contact" jsonb,
	"travel_documents_submitted" boolean DEFAULT false,
	"notes" text,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "travel_vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"travel_event_id" uuid NOT NULL,
	"vehicle_type" text,
	"vehicle_identifier" text,
	"capacity" integer NOT NULL,
	"driver_id" uuid,
	"driver_license" text,
	"insurance_info" jsonb,
	"fuel_card" text,
	"emergency_kit" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicle_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"seat_number" text,
	"is_driver" boolean DEFAULT false,
	"special_needs" text,
	"assigned_at" timestamp with time zone DEFAULT now()
);
