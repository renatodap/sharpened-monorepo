-- CourtSync Database Schema
-- PostgreSQL with Supabase extensions
-- Created for NCAA Division III Tennis Team Management

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- AUTHENTICATION & USER MANAGEMENT
-- =============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    preferred_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('coach', 'assistant_coach', 'captain', 'player', 'admin')),
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    avatar_url TEXT,
    phone TEXT,
    class_year INTEGER,
    class_schedule JSONB DEFAULT '[]'::jsonb,
    emergency_contact JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team organization
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sport TEXT DEFAULT 'tennis',
    gender TEXT CHECK (gender IN ('men', 'women', 'mixed')),
    season_year INTEGER NOT NULL,
    season_type TEXT DEFAULT 'spring' CHECK (season_type IN ('fall', 'spring', 'summer')),
    institution TEXT NOT NULL,
    conference TEXT,
    division TEXT DEFAULT 'III',
    head_coach_id UUID REFERENCES profiles(id),
    assistant_coaches UUID[] DEFAULT ARRAY[]::UUID[],
    captains UUID[] DEFAULT ARRAY[]::UUID[],
    team_settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FACILITY & COURT MANAGEMENT
-- =============================================

-- Tennis facilities (courts, bubble, etc.)
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('outdoor_court', 'indoor_court', 'bubble_court', 'fitness_center', 'meeting_room')),
    capacity INTEGER NOT NULL DEFAULT 1,
    surface_type TEXT CHECK (surface_type IN ('hard', 'clay', 'grass', 'indoor_hard')),
    weather_dependent BOOLEAN DEFAULT TRUE,
    location_description TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    amenities TEXT[],
    availability_rules JSONB DEFAULT '{}'::jsonb,
    team_id UUID REFERENCES teams(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Court surface conditions and maintenance
CREATE TABLE facility_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    condition_type TEXT CHECK (condition_type IN ('excellent', 'good', 'fair', 'poor', 'closed')),
    weather_conditions TEXT,
    notes TEXT,
    reported_by UUID REFERENCES profiles(id),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- EVENT SCHEDULING & CALENDAR
-- =============================================

-- All team events (practices, matches, meetings, travel)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('practice', 'match', 'meeting', 'travel', 'tournament', 'conditioning', 'social')),
    recurrence_rule TEXT, -- RRULE format for recurring events
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id),
    opponent_id UUID REFERENCES opponents(id),
    location_override TEXT, -- For events not at standard facilities
    required_attendance BOOLEAN DEFAULT FALSE,
    max_participants INTEGER,
    event_metadata JSONB DEFAULT '{}'::jsonb, -- Additional event-specific data
    created_by UUID REFERENCES profiles(id),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES profiles(id),
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player availability and RSVP for events
CREATE TABLE event_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('available', 'unavailable', 'maybe', 'confirmed', 'attended', 'missed')),
    response_notes TEXT,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Recurring event instances (for tracking individual occurrences)
CREATE TABLE event_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    instance_date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed', 'rescheduled')),
    modifications JSONB DEFAULT '{}'::jsonb, -- Any changes from parent event
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COMMUNICATION SYSTEM
-- =============================================

-- Communication channels (team chat, coach chat, etc.)
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('team', 'coaches', 'captains', 'social', 'direct', 'announcement')),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    member_roles TEXT[] DEFAULT ARRAY[]::TEXT[], -- Which roles can access
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channel memberships (for private channels and direct messages)
CREATE TABLE channel_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notifications_enabled BOOLEAN DEFAULT TRUE,
    UNIQUE(channel_id, user_id)
);

-- Messages within channels
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'announcement', 'poll', 'reminder')),
    reply_to_id UUID REFERENCES messages(id),
    thread_id UUID, -- For threaded conversations
    attachments JSONB DEFAULT '[]'::jsonb,
    mentions UUID[] DEFAULT ARRAY[]::UUID[], -- User IDs mentioned in message
    reactions JSONB DEFAULT '{}'::jsonb, -- Emoji reactions
    is_pinned BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message read receipts
CREATE TABLE message_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- =============================================
-- TRAVEL MANAGEMENT
-- =============================================

-- Travel events and logistics
CREATE TABLE travel_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE UNIQUE,
    departure_time TIMESTAMP WITH TIME ZONE,
    return_time TIMESTAMP WITH TIME ZONE,
    departure_location TEXT,
    destination_location TEXT,
    transportation_type TEXT CHECK (transportation_type IN ('bus', 'van', 'car', 'flight', 'train')),
    transportation_details JSONB DEFAULT '{}'::jsonb,
    accommodation JSONB DEFAULT '{}'::jsonb, -- Hotel, rooming lists
    meal_arrangements JSONB DEFAULT '{}'::jsonb,
    required_documents TEXT[],
    packing_list TEXT[],
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    budget_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Travel itinerary items
CREATE TABLE travel_itinerary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    travel_event_id UUID REFERENCES travel_events(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    activity_time TIMESTAMP WITH TIME ZONE,
    activity_type TEXT CHECK (activity_type IN ('departure', 'arrival', 'meal', 'practice', 'match', 'meeting', 'free_time', 'return')),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    duration_minutes INTEGER,
    responsible_person TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Travel participant tracking
CREATE TABLE travel_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    travel_event_id UUID REFERENCES travel_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    participation_status TEXT DEFAULT 'invited' CHECK (participation_status IN ('invited', 'confirmed', 'declined', 'attended')),
    room_assignment TEXT,
    dietary_restrictions TEXT,
    emergency_contact JSONB,
    travel_documents_submitted BOOLEAN DEFAULT FALSE,
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(travel_event_id, user_id)
);

-- =============================================
-- VIDEO MANAGEMENT & ANALYSIS
-- =============================================

-- Video recordings (practices, matches, drills)
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size BIGINT,
    duration_seconds INTEGER,
    resolution TEXT,
    format TEXT,
    upload_status TEXT DEFAULT 'processing' CHECK (upload_status IN ('uploading', 'processing', 'ready', 'failed')),
    uploader_id UUID REFERENCES profiles(id),
    recorded_at TIMESTAMP WITH TIME ZONE,
    video_type TEXT CHECK (video_type IN ('practice', 'match', 'drill', 'analysis', 'highlight', 'technique')),
    visibility TEXT DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'coaches', 'private')),
    featured_players UUID[] DEFAULT ARRAY[]::UUID[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5),
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video annotations and comments
CREATE TABLE video_annotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id),
    timestamp_seconds INTEGER NOT NULL,
    end_timestamp_seconds INTEGER, -- For range annotations
    annotation_type TEXT DEFAULT 'comment' CHECK (annotation_type IN ('comment', 'technique', 'strategy', 'highlight', 'error', 'improvement')),
    title TEXT,
    content TEXT NOT NULL,
    coordinates JSONB, -- For spatial annotations on video
    tagged_players UUID[] DEFAULT ARRAY[]::UUID[],
    visibility TEXT DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'coaches', 'private')),
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video viewing analytics
CREATE TABLE video_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES profiles(id),
    watch_duration_seconds INTEGER,
    completion_percentage DECIMAL(5,2),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    UNIQUE(video_id, viewer_id, DATE(viewed_at))
);

-- =============================================
-- OPPONENT SCOUTING & INTELLIGENCE
-- =============================================

-- Opponent teams and institutions
CREATE TABLE opponents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    institution TEXT,
    conference TEXT,
    division TEXT,
    location_city TEXT,
    location_state TEXT,
    website TEXT,
    colors TEXT[],
    mascot TEXT,
    head_coach TEXT,
    contact_info JSONB DEFAULT '{}'::jsonb,
    historical_record JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual opponent players
CREATE TABLE opponent_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opponent_id UUID REFERENCES opponents(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    year TEXT,
    position TEXT,
    height TEXT,
    hometown TEXT,
    playing_style TEXT,
    dominant_hand TEXT CHECK (dominant_hand IN ('right', 'left', 'ambidextrous')),
    strengths TEXT[],
    weaknesses TEXT[],
    injury_history TEXT[],
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scouting reports for opponents
CREATE TABLE scouting_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opponent_id UUID REFERENCES opponents(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id),
    match_date DATE,
    venue TEXT,
    report_type TEXT DEFAULT 'general' CHECK (report_type IN ('general', 'pre_match', 'post_match', 'player_specific')),
    overall_assessment TEXT,
    team_strengths TEXT[],
    team_weaknesses TEXT[],
    recommended_strategy TEXT,
    lineup_notes JSONB DEFAULT '{}'::jsonb,
    individual_matchups JSONB DEFAULT '[]'::jsonb,
    weather_conditions TEXT,
    court_conditions TEXT,
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
    attachments JSONB DEFAULT '[]'::jsonb,
    is_confidential BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match results and statistics
CREATE TABLE match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    team_id UUID REFERENCES teams(id),
    opponent_id UUID REFERENCES opponents(id),
    match_date DATE NOT NULL,
    venue TEXT,
    match_type TEXT CHECK (match_type IN ('dual', 'tournament', 'exhibition', 'scrimmage')),
    team_score INTEGER,
    opponent_score INTEGER,
    match_result TEXT CHECK (match_result IN ('win', 'loss', 'tie', 'cancelled', 'postponed')),
    singles_results JSONB DEFAULT '[]'::jsonb,
    doubles_results JSONB DEFAULT '[]'::jsonb,
    match_summary TEXT,
    conditions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANALYTICS & PERFORMANCE TRACKING
-- =============================================

-- Player performance metrics
CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    season_year INTEGER,
    match_id UUID REFERENCES match_results(id),
    position INTEGER, -- 1-6 for singles, 1-3 for doubles
    partner_id UUID REFERENCES profiles(id), -- For doubles
    result TEXT CHECK (result IN ('win', 'loss', 'default', 'retired', 'walkover')),
    sets_won INTEGER DEFAULT 0,
    sets_lost INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    match_duration_minutes INTEGER,
    performance_rating DECIMAL(3,2),
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice attendance and performance
CREATE TABLE practice_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    attendance_status TEXT CHECK (attendance_status IN ('present', 'absent', 'late', 'excused', 'injured')),
    arrival_time TIMESTAMP WITH TIME ZONE,
    departure_time TIMESTAMP WITH TIME ZONE,
    performance_notes TEXT,
    effort_level INTEGER CHECK (effort_level BETWEEN 1 AND 5),
    skill_focus TEXT[],
    injuries_reported TEXT[],
    recorded_by UUID REFERENCES profiles(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_id, event_id)
);

-- =============================================
-- NOTIFICATIONS & PREFERENCES
-- =============================================

-- User notification preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    notification_types JSONB DEFAULT '{
        "schedule_changes": true,
        "new_messages": true,
        "travel_updates": true,
        "video_uploads": true,
        "match_results": true,
        "practice_reminders": true,
        "assignment_deadlines": true
    }'::jsonb,
    quiet_hours JSONB DEFAULT '{"start": "22:00", "end": "07:00"}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification queue for delivery
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    delivery_method TEXT[] DEFAULT ARRAY['push']::TEXT[],
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'expired')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SYSTEM & AUDIT TABLES
-- =============================================

-- Activity log for auditing
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App usage analytics
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    session_id TEXT,
    feature_used TEXT NOT NULL,
    duration_seconds INTEGER,
    device_type TEXT,
    platform TEXT,
    version TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Event queries
CREATE INDEX idx_events_team_date ON events(team_id, start_time);
CREATE INDEX idx_events_facility_date ON events(facility_id, start_time);
CREATE INDEX idx_events_type ON events(event_type);

-- Message queries
CREATE INDEX idx_messages_channel_created ON messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_mentions ON messages USING gin(mentions);

-- Video queries
CREATE INDEX idx_videos_event ON videos(event_id);
CREATE INDEX idx_videos_uploader ON videos(uploader_id);
CREATE INDEX idx_videos_type_visibility ON videos(video_type, visibility);

-- Availability queries
CREATE INDEX idx_availability_user_event ON event_availability(user_id, event_id);
CREATE INDEX idx_availability_event_status ON event_availability(event_id, status);

-- Analytics queries
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, created_at);
CREATE INDEX idx_usage_analytics_feature_date ON usage_analytics(feature_used, created_at);

-- Performance optimization indexes
CREATE INDEX idx_active_events ON events(team_id, start_time) 
WHERE start_time > NOW() - INTERVAL '7 days';

CREATE INDEX idx_recent_messages ON messages(channel_id, created_at DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE opponents ENABLE ROW LEVEL SECURITY;
ALTER TABLE scouting_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view team members
CREATE POLICY "Users can view team profiles" ON profiles
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Events: Team members can view team events
CREATE POLICY "Team members can view events" ON events
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Messages: Users can view messages in accessible channels
CREATE POLICY "Users can view channel messages" ON messages
    FOR SELECT USING (
        channel_id IN (
            SELECT c.id FROM channels c
            JOIN profiles p ON p.team_id = c.team_id
            WHERE p.user_id = auth.uid()
            AND (
                NOT c.is_private OR 
                EXISTS (
                    SELECT 1 FROM channel_members cm 
                    WHERE cm.channel_id = c.id AND cm.user_id = p.id
                )
            )
        )
    );

-- Videos: Role-based access to videos
CREATE POLICY "Users can view appropriate videos" ON videos
    FOR SELECT USING (
        visibility = 'public' OR
        (visibility = 'team' AND EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.team_id IN (
                SELECT e.team_id FROM events e WHERE e.id = videos.event_id
            )
        )) OR
        (visibility = 'coaches' AND EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role IN ('coach', 'assistant_coach')
        )) OR
        uploader_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (user_id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'player')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- SAMPLE DATA (for development)
-- =============================================

-- Insert sample team
INSERT INTO teams (name, gender, season_year, institution, conference, division) VALUES
('Rose-Hulman Engineers', 'men', 2024, 'Rose-Hulman Institute of Technology', 'HCAC', 'III'),
('Rose-Hulman Engineers', 'women', 2024, 'Rose-Hulman Institute of Technology', 'HCAC', 'III');

-- Insert sample facilities
INSERT INTO facilities (name, type, capacity, surface_type, weather_dependent, team_id) VALUES
('Outdoor Court 1', 'outdoor_court', 1, 'hard', true, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1)),
('Outdoor Court 2', 'outdoor_court', 1, 'hard', true, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1)),
('Outdoor Court 3', 'outdoor_court', 1, 'hard', true, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1)),
('Outdoor Court 4', 'outdoor_court', 1, 'hard', true, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1)),
('Outdoor Court 5', 'outdoor_court', 1, 'hard', true, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1)),
('Outdoor Court 6', 'outdoor_court', 1, 'hard', true, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1)),
('Indoor Bubble Court 1', 'bubble_court', 1, 'indoor_hard', false, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1)),
('Indoor Bubble Court 2', 'bubble_court', 1, 'indoor_hard', false, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1)),
('Indoor Bubble Court 3', 'bubble_court', 1, 'indoor_hard', false, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1)),
('Indoor Bubble Court 4', 'bubble_court', 1, 'indoor_hard', false, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1)),
('Indoor Bubble Court 5', 'bubble_court', 1, 'indoor_hard', false, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1)),
('Indoor Bubble Court 6', 'bubble_court', 1, 'indoor_hard', false, (SELECT id FROM teams WHERE gender = 'men' LIMIT 1));

-- Insert sample opponents
INSERT INTO opponents (name, institution, conference, division, location_city, location_state) VALUES
('DePauw Tigers', 'DePauw University', 'NCAC', 'III', 'Greencastle', 'IN'),
('Wabash Little Giants', 'Wabash College', 'NCAC', 'III', 'Crawfordsville', 'IN'),
('Hanover Panthers', 'Hanover College', 'HCAC', 'III', 'Hanover', 'IN'),
('Franklin Grizzlies', 'Franklin College', 'HCAC', 'III', 'Franklin', 'IN');