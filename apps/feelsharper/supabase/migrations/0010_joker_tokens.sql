-- Joker Tokens System
-- Premium feature for streak recovery

-- Create joker tokens table
CREATE TABLE IF NOT EXISTS public.joker_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_type TEXT NOT NULL CHECK (token_type IN ('streak_save', 'challenge_retry', 'premium_day', 'weekly_bonus')) DEFAULT 'streak_save',
  earned_from TEXT NOT NULL, -- 'purchase', 'milestone', 'weekly_bonus', 'achievement'
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add joker tokens to user streaks
ALTER TABLE public.user_streaks 
ADD COLUMN IF NOT EXISTS joker_tokens_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 100 CHECK (quality_score >= 0 AND quality_score <= 100);

-- Create indexes
CREATE INDEX idx_joker_tokens_user ON public.joker_tokens(user_id);
CREATE INDEX idx_joker_tokens_type ON public.joker_tokens(token_type);
CREATE INDEX idx_joker_tokens_used ON public.joker_tokens(used_at);

-- Enable RLS
ALTER TABLE public.joker_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own joker tokens" ON public.joker_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own joker tokens" ON public.joker_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to extend streak with joker token
CREATE OR REPLACE FUNCTION extend_streak_with_joker(
  user_id_param UUID,
  streak_type_param TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  available_token UUID;
  current_streak_record RECORD;
BEGIN
  -- Check if user has available joker tokens
  SELECT id INTO available_token
  FROM public.joker_tokens
  WHERE user_id = user_id_param 
    AND token_type = 'streak_save'
    AND used_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at ASC
  LIMIT 1;

  IF available_token IS NULL THEN
    RETURN FALSE; -- No tokens available
  END IF;

  -- Get current streak info
  SELECT * INTO current_streak_record
  FROM public.user_streaks
  WHERE user_id = user_id_param AND streak_type = streak_type_param;

  IF NOT FOUND THEN
    RETURN FALSE; -- Streak not found
  END IF;

  -- Use the joker token
  UPDATE public.joker_tokens
  SET used_at = NOW(),
      metadata = metadata || jsonb_build_object('streak_type', streak_type_param, 'restored_streak', current_streak_record.current_streak),
      updated_at = NOW()
  WHERE id = available_token;

  -- Restore the streak (add 1 day and set last activity to yesterday)
  UPDATE public.user_streaks
  SET current_streak = GREATEST(1, current_streak_record.current_streak + 1),
      last_activity_date = CURRENT_DATE - INTERVAL '1 day',
      joker_tokens_used = COALESCE(joker_tokens_used, 0) + 1,
      updated_at = NOW()
  WHERE user_id = user_id_param AND streak_type = streak_type_param;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to award joker tokens
CREATE OR REPLACE FUNCTION award_joker_token(
  user_id_param UUID,
  token_type_param TEXT DEFAULT 'streak_save',
  earned_from_param TEXT DEFAULT 'milestone',
  expires_in_days INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  new_token_id UUID;
  expires_at_val TIMESTAMPTZ;
BEGIN
  -- Calculate expiration if specified
  IF expires_in_days IS NOT NULL THEN
    expires_at_val := NOW() + (expires_in_days || ' days')::INTERVAL;
  END IF;

  -- Insert new joker token
  INSERT INTO public.joker_tokens (
    user_id, 
    token_type, 
    earned_from, 
    expires_at
  ) VALUES (
    user_id_param, 
    token_type_param, 
    earned_from_param, 
    expires_at_val
  ) RETURNING id INTO new_token_id;

  RETURN new_token_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-award weekly joker tokens (premium users only)
CREATE OR REPLACE FUNCTION award_weekly_joker_tokens() RETURNS INTEGER AS $$
DECLARE
  awarded_count INTEGER := 0;
  user_record RECORD;
BEGIN
  -- Award tokens to premium users who maintained streaks
  FOR user_record IN
    SELECT DISTINCT p.id
    FROM public.profiles p
    JOIN public.user_streaks us ON us.user_id = p.id
    WHERE p.subscription_tier = 'premium'
      AND us.current_streak >= 7 -- At least 1 week streak
      AND us.updated_at >= NOW() - INTERVAL '7 days'
  LOOP
    PERFORM award_joker_token(
      user_record.id,
      'streak_save',
      'weekly_bonus',
      30 -- Expires in 30 days
    );
    awarded_count := awarded_count + 1;
  END LOOP;

  RETURN awarded_count;
END;
$$ LANGUAGE plpgsql;

-- Seed some joker tokens for existing premium users
INSERT INTO public.joker_tokens (user_id, token_type, earned_from, expires_at)
SELECT 
  p.id,
  'streak_save',
  'premium_welcome',
  NOW() + INTERVAL '30 days'
FROM public.profiles p
WHERE p.subscription_tier = 'premium'
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON public.joker_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION extend_streak_with_joker TO authenticated;
GRANT EXECUTE ON FUNCTION award_joker_token TO authenticated;