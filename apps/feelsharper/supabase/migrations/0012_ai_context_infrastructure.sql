-- AI Context Infrastructure Tables
-- Essential for storing every AI interaction, learning from user patterns, and tracking usage

-- Store complete context for every AI interaction
CREATE TABLE IF NOT EXISTS user_context_store (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  context_type TEXT NOT NULL CHECK (context_type IN ('workout', 'food', 'chat', 'correction', 'voice', 'photo')),
  raw_input TEXT NOT NULL,
  parsed_output JSONB NOT NULL,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  model_used TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  processing_time_ms INTEGER,
  error_message TEXT,
  user_feedback JSONB, -- {helpful: boolean, corrected_output: any}
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Indexes for fast queries
  INDEX idx_user_context_user_id (user_id),
  INDEX idx_user_context_type (context_type),
  INDEX idx_user_context_created (created_at DESC)
);

-- Conversation memory for coaching continuity
CREATE TABLE IF NOT EXISTS ai_conversation_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID NOT NULL,
  message_role TEXT NOT NULL CHECK (message_role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  context_snapshot JSONB, -- User stats/goals at time of message
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Indexes
  INDEX idx_conversation_user (user_id),
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_conversation_created (created_at DESC)
);

-- Learn user-specific patterns over time
CREATE TABLE IF NOT EXISTS user_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern_type TEXT NOT NULL CHECK (pattern_type IN (
    'exercise_alias',     -- "bp" -> "bench press"
    'food_preference',    -- frequently logs certain foods
    'schedule',          -- workout days/times
    'portion_size',      -- typical serving sizes
    'workout_style',     -- crossfit, powerlifting, etc
    'abbreviation',      -- custom abbreviations
    'voice_pattern'      -- speech patterns for better transcription
  )),
  pattern_key TEXT NOT NULL, -- The trigger/input pattern
  pattern_value JSONB NOT NULL, -- The learned mapping/data
  frequency INTEGER DEFAULT 1,
  confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  last_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  first_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Unique constraint and indexes
  UNIQUE(user_id, pattern_type, pattern_key),
  INDEX idx_patterns_user (user_id),
  INDEX idx_patterns_type (pattern_type),
  INDEX idx_patterns_frequency (frequency DESC)
);

-- Track AI usage for billing and optimization
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'parse_workout', 'parse_food', 'coach_chat', etc
  model_provider TEXT NOT NULL CHECK (model_provider IN ('openai', 'anthropic', 'local')),
  model_name TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_cents FLOAT NOT NULL DEFAULT 0,
  response_time_ms INTEGER,
  tier TEXT CHECK (tier IN ('free', 'pro', 'elite')),
  success BOOLEAN DEFAULT true,
  error_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Indexes for analytics
  INDEX idx_usage_user (user_id),
  INDEX idx_usage_created (created_at DESC),
  INDEX idx_usage_endpoint (endpoint),
  INDEX idx_usage_tier (tier)
);

-- Pre-computed AI context for faster responses
CREATE TABLE IF NOT EXISTS user_ai_context_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Cached context data
  recent_workouts JSONB, -- Last 30 days
  recent_nutrition JSONB, -- Last 7 days
  body_metrics JSONB, -- Latest measurements
  active_goals JSONB, -- Current goals
  workout_patterns JSONB, -- Detected patterns
  food_patterns JSONB, -- Common foods/meals
  coaching_history JSONB, -- Key conversation points
  
  -- Stats for smart recommendations
  avg_daily_calories FLOAT,
  avg_daily_protein FLOAT,
  workout_frequency_per_week FLOAT,
  preferred_workout_time TEXT,
  training_style TEXT,
  
  -- Cache management
  computed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  stale_after TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour') NOT NULL,
  
  INDEX idx_context_cache_user (user_id),
  INDEX idx_context_cache_stale (stale_after)
);

-- AI model performance tracking
CREATE TABLE IF NOT EXISTS ai_model_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_key TEXT NOT NULL, -- 'gpt-4o-mini-workout', 'claude-haiku-coach', etc
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_confidence FLOAT,
  avg_response_time_ms FLOAT,
  avg_tokens_used FLOAT,
  avg_cost_cents FLOAT,
  user_satisfaction_score FLOAT, -- Based on corrections/feedback
  last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(model_key),
  INDEX idx_model_performance (model_key)
);

-- Store AI-generated insights
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'progress_milestone',
    'pattern_detected',
    'recommendation',
    'warning',
    'achievement',
    'trend_analysis'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data JSONB, -- Supporting data/charts
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  is_read BOOLEAN DEFAULT false,
  is_actionable BOOLEAN DEFAULT false,
  action_url TEXT, -- Link to relevant page
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  INDEX idx_insights_user (user_id),
  INDEX idx_insights_unread (user_id, is_read),
  INDEX idx_insights_priority (priority DESC)
);

-- Row Level Security
ALTER TABLE user_context_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ai_context_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own AI context" ON user_context_store
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their conversations" ON ai_conversation_memory
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their patterns" ON user_patterns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their usage" ON ai_usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can access their context cache" ON user_ai_context_cache
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their insights" ON ai_insights
  FOR ALL USING (auth.uid() = user_id);

-- Functions for AI operations
CREATE OR REPLACE FUNCTION increment_pattern_frequency(
  p_user_id UUID,
  p_pattern_type TEXT,
  p_pattern_key TEXT,
  p_pattern_value JSONB
) RETURNS void AS $$
BEGIN
  INSERT INTO user_patterns (
    user_id, pattern_type, pattern_key, pattern_value, frequency, last_seen
  ) VALUES (
    p_user_id, p_pattern_type, p_pattern_key, p_pattern_value, 1, NOW()
  )
  ON CONFLICT (user_id, pattern_type, pattern_key)
  DO UPDATE SET
    frequency = user_patterns.frequency + 1,
    last_seen = NOW(),
    confidence = LEAST(1.0, user_patterns.confidence + 0.1),
    pattern_value = EXCLUDED.pattern_value;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's monthly AI usage
CREATE OR REPLACE FUNCTION get_monthly_ai_usage(p_user_id UUID)
RETURNS TABLE (
  total_interactions INTEGER,
  total_tokens INTEGER,
  total_cost_cents FLOAT,
  by_operation JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_interactions,
    SUM(total_tokens)::INTEGER as total_tokens,
    SUM(cost_cents)::FLOAT as total_cost_cents,
    jsonb_object_agg(
      operation,
      jsonb_build_object(
        'count', operation_counts.count,
        'tokens', operation_counts.tokens,
        'cost', operation_counts.cost
      )
    ) as by_operation
  FROM (
    SELECT
      operation,
      COUNT(*) as count,
      SUM(total_tokens) as tokens,
      SUM(cost_cents) as cost
    FROM ai_usage_tracking
    WHERE user_id = p_user_id
      AND created_at >= date_trunc('month', CURRENT_DATE)
    GROUP BY operation
  ) as operation_counts;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user exceeded free tier
CREATE OR REPLACE FUNCTION check_free_tier_exceeded(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_monthly_interactions INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_tier
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- If not free tier, not exceeded
  IF v_tier != 'free' OR v_tier IS NULL THEN
    RETURN false;
  END IF;
  
  -- Count this month's interactions
  SELECT COUNT(*)
  INTO v_monthly_interactions
  FROM ai_usage_tracking
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE);
  
  -- Free tier limit is 10 interactions
  RETURN v_monthly_interactions >= 10;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-compute context cache
CREATE OR REPLACE FUNCTION compute_user_context_cache()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark cache as stale when relevant data changes
  UPDATE user_ai_context_cache
  SET stale_after = NOW()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to mark cache stale
CREATE TRIGGER invalidate_cache_on_workout
  AFTER INSERT OR UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION compute_user_context_cache();

CREATE TRIGGER invalidate_cache_on_food
  AFTER INSERT OR UPDATE ON food_logs
  FOR EACH ROW EXECUTE FUNCTION compute_user_context_cache();

CREATE TRIGGER invalidate_cache_on_weight
  AFTER INSERT OR UPDATE ON body_weight
  FOR EACH ROW EXECUTE FUNCTION compute_user_context_cache();

-- Add comment
COMMENT ON TABLE user_context_store IS 'Stores every AI interaction for learning and improvement';
COMMENT ON TABLE ai_conversation_memory IS 'Maintains conversation context for coaching continuity';
COMMENT ON TABLE user_patterns IS 'Learns user-specific patterns to improve AI responses';
COMMENT ON TABLE ai_usage_tracking IS 'Tracks API usage for billing and optimization';
COMMENT ON TABLE user_ai_context_cache IS 'Pre-computed context for faster AI responses';
COMMENT ON TABLE ai_insights IS 'AI-generated insights and recommendations';