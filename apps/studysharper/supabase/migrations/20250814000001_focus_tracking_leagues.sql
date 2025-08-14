-- Focus Sessions Table
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL,
  tracked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leagues Table
CREATE TABLE IF NOT EXISTS leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_size INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- League Memberships Table
CREATE TABLE IF NOT EXISTS league_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  focus_minutes INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- User Profiles Extension (if doesn't exist)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_tracked_at ON focus_sessions(tracked_at);
CREATE INDEX IF NOT EXISTS idx_league_memberships_user_id ON league_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_league_memberships_league_id ON league_memberships(league_id);
CREATE INDEX IF NOT EXISTS idx_leagues_week_number ON leagues(week_number);

-- RLS Policies
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Focus Sessions Policies
CREATE POLICY "Users can view own focus sessions"
  ON focus_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own focus sessions"
  ON focus_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own focus sessions"
  ON focus_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Leagues Policies (public read)
CREATE POLICY "Anyone can view leagues"
  ON leagues FOR SELECT
  USING (true);

-- League Memberships Policies
CREATE POLICY "Users can view league memberships"
  ON league_memberships FOR SELECT
  USING (true);

CREATE POLICY "System can insert league memberships"
  ON league_memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update league memberships"
  ON league_memberships FOR UPDATE
  USING (auth.uid() = user_id);

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to update league points based on focus sessions
CREATE OR REPLACE FUNCTION update_league_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's league membership for the current week
  UPDATE league_memberships
  SET 
    points = points + (NEW.duration_seconds / 60) * 5, -- 5 points per minute
    focus_minutes = focus_minutes + (NEW.duration_seconds / 60),
    updated_at = NOW()
  WHERE user_id = NEW.user_id
    AND week_number = EXTRACT(WEEK FROM NEW.tracked_at);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update league points when focus session is added
CREATE TRIGGER update_league_points_trigger
AFTER INSERT ON focus_sessions
FOR EACH ROW
EXECUTE FUNCTION update_league_points();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user profiles
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();