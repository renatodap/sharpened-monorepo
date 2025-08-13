-- Subscription System Migration
-- LemonSqueezy integration and premium features

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lemonsqueezy_customer_id TEXT,
  lemonsqueezy_subscription_id TEXT UNIQUE,
  lemonsqueezy_order_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'paused', 'refunded')) DEFAULT 'active',
  product_name TEXT,
  variant_name TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  resumes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT CHECK (subscription_tier IN ('free', 'premium')) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'paused', 'past_due')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Create feature usage tracking table
CREATE TABLE IF NOT EXISTS public.feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  period_start DATE DEFAULT CURRENT_DATE,
  period_end DATE DEFAULT CURRENT_DATE + INTERVAL '1 month',
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, feature_name, period_start)
);

-- Create premium features configuration table
CREATE TABLE IF NOT EXISTS public.premium_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_key TEXT UNIQUE NOT NULL,
  feature_name TEXT NOT NULL,
  description TEXT,
  tier_required TEXT NOT NULL CHECK (tier_required IN ('free', 'premium')),
  usage_limit INTEGER, -- NULL for unlimited
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_lemonsqueezy ON public.user_subscriptions(lemonsqueezy_subscription_id);
CREATE INDEX idx_feature_usage_user_feature ON public.feature_usage(user_id, feature_name);
CREATE INDEX idx_feature_usage_period ON public.feature_usage(period_start, period_end);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own feature usage" ON public.feature_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feature usage" ON public.feature_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feature usage" ON public.feature_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Premium features are readable by all" ON public.premium_features
  FOR SELECT TO authenticated USING (true);

-- Function to check if user has access to feature
CREATE OR REPLACE FUNCTION check_feature_access(
  user_id_param UUID,
  feature_key_param TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  required_tier TEXT;
  usage_limit INTEGER;
  current_usage INTEGER;
BEGIN
  -- Get user tier
  SELECT subscription_tier INTO user_tier
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Get feature requirements
  SELECT tier_required, usage_limit INTO required_tier, usage_limit
  FROM public.premium_features
  WHERE feature_key = feature_key_param AND is_active = true;
  
  -- If feature not found, deny access
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- If feature requires premium and user is free, deny
  IF required_tier = 'premium' AND (user_tier IS NULL OR user_tier = 'free') THEN
    RETURN FALSE;
  END IF;
  
  -- If no usage limit, allow access
  IF usage_limit IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check current usage
  SELECT COALESCE(usage_count, 0) INTO current_usage
  FROM public.feature_usage
  WHERE user_id = user_id_param 
    AND feature_name = feature_key_param
    AND period_start <= CURRENT_DATE 
    AND period_end >= CURRENT_DATE;
    
  -- Return whether user is under limit
  RETURN COALESCE(current_usage, 0) < usage_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to track feature usage
CREATE OR REPLACE FUNCTION track_feature_usage(
  user_id_param UUID,
  feature_key_param TEXT,
  metadata_param JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.feature_usage (user_id, feature_name, metadata)
  VALUES (user_id_param, feature_key_param, metadata_param)
  ON CONFLICT (user_id, feature_name, period_start)
  DO UPDATE SET 
    usage_count = feature_usage.usage_count + 1,
    last_used_at = NOW(),
    metadata = metadata_param;
END;
$$ LANGUAGE plpgsql;

-- Seed premium features
INSERT INTO public.premium_features (feature_key, feature_name, description, tier_required, usage_limit) VALUES
-- Free tier features (with limits)
('workout_parse', 'AI Workout Parsing', 'Natural language workout parsing', 'free', 5),
('food_search', 'Food Database Search', 'Search nutrition database', 'free', 50),
('progress_graphs', 'Basic Progress Graphs', 'View basic progress charts', 'free', NULL),
('weight_tracking', 'Weight Tracking', 'Log daily weight', 'free', NULL),
('basic_workouts', 'Basic Workout Logging', 'Log workouts manually', 'free', NULL),

-- Premium features (unlimited)
('unlimited_workout_parse', 'Unlimited AI Parsing', 'Unlimited natural language workout parsing', 'premium', NULL),
('unlimited_food_search', 'Unlimited Food Search', 'Unlimited food database access', 'premium', NULL),
('advanced_analytics', 'Advanced Analytics', 'Detailed progress analytics', 'premium', NULL),
('ai_coach', 'Personal AI Coach', 'AI-powered coaching insights', 'premium', NULL),
('meal_templates', 'Unlimited Meal Templates', 'Create unlimited meal templates', 'premium', NULL),
('data_export', 'Data Export', 'Export your data', 'premium', NULL),
('priority_support', 'Priority Support', 'Get priority customer support', 'premium', NULL),
('custom_themes', 'Custom Themes', 'Personalize your experience', 'premium', NULL),
('squad_features', 'Advanced Squad Features', 'Create unlimited squads and challenges', 'premium', NULL),
('streak_rewards', 'Streak Rewards', 'Earn streak rewards and joker tokens', 'premium', NULL);

-- Update existing users to have subscription records
INSERT INTO public.user_subscriptions (user_id, status, product_name)
SELECT id, 'active', 'Free Plan'
FROM auth.users
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.feature_usage TO authenticated;
GRANT ALL ON public.premium_features TO authenticated;
GRANT EXECUTE ON FUNCTION check_feature_access TO authenticated;
GRANT EXECUTE ON FUNCTION track_feature_usage TO authenticated;