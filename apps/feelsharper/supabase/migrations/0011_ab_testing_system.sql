-- A/B Testing System Database Schema
-- Provides comprehensive A/B testing infrastructure for pricing and conversion optimization

-- =====================================================
-- EXPERIMENTS TABLE
-- Stores experiment definitions and configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS public.experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  hypothesis TEXT, -- What we expect to learn/improve
  
  -- Experiment configuration
  experiment_type TEXT NOT NULL CHECK (experiment_type IN (
    'pricing', 'cta_optimization', 'feature_gating', 'messaging', 
    'layout', 'urgency', 'social_proof', 'onboarding'
  )),
  target_metric TEXT NOT NULL, -- 'conversion_rate', 'revenue_per_user', 'signup_rate', etc.
  success_criteria TEXT NOT NULL, -- Description of what constitutes success
  
  -- Traffic allocation
  traffic_allocation DECIMAL CHECK (traffic_allocation > 0 AND traffic_allocation <= 1) DEFAULT 1.0,
  
  -- Status and lifecycle
  status TEXT NOT NULL CHECK (status IN (
    'draft', 'active', 'paused', 'completed', 'archived'
  )) DEFAULT 'draft',
  
  -- Statistical configuration
  min_sample_size INTEGER DEFAULT 1000,
  confidence_level DECIMAL DEFAULT 0.95,
  statistical_power DECIMAL DEFAULT 0.80,
  min_effect_size DECIMAL DEFAULT 0.05, -- Minimum effect size to detect
  
  -- Timeline
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  target_duration_days INTEGER DEFAULT 14,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (ended_at IS NULL OR ended_at > started_at),
  CONSTRAINT valid_duration CHECK (target_duration_days > 0)
);

-- =====================================================
-- EXPERIMENT VARIANTS TABLE  
-- Stores the different variants/treatments for each experiment
-- =====================================================
CREATE TABLE IF NOT EXISTS public.experiment_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  
  -- Variant identification
  variant_key TEXT NOT NULL, -- 'control', 'treatment_a', 'treatment_b', etc.
  name TEXT NOT NULL,
  description TEXT,
  
  -- Traffic split
  traffic_weight INTEGER NOT NULL DEFAULT 1, -- Relative weight for traffic allocation
  
  -- Variant configuration (JSON for flexibility)
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(experiment_id, variant_key),
  CONSTRAINT positive_weight CHECK (traffic_weight > 0)
);

-- =====================================================
-- USER ASSIGNMENTS TABLE
-- Tracks which users are assigned to which variants
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_experiment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Assignment details
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.experiment_variants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Allow anonymous users
  anonymous_id TEXT, -- For non-authenticated users
  
  -- Assignment metadata
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assignment_method TEXT NOT NULL DEFAULT 'hash_based', -- 'hash_based', 'random', 'manual'
  user_agent TEXT,
  ip_address INET,
  
  -- Constraints
  CONSTRAINT user_or_anonymous CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  ),
  
  -- Unique assignment per experiment per user
  UNIQUE(experiment_id, user_id),
  UNIQUE(experiment_id, anonymous_id)
);

-- =====================================================
-- CONVERSION EVENTS TABLE
-- Tracks conversion events for measuring experiment success
-- =====================================================
CREATE TABLE IF NOT EXISTS public.conversion_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event details
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.experiment_variants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  
  -- Event information
  event_type TEXT NOT NULL, -- 'signup', 'checkout_started', 'purchase_completed', etc.
  event_value DECIMAL, -- Revenue value, if applicable
  event_properties JSONB DEFAULT '{}',
  
  -- Timing
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Attribution
  session_id TEXT,
  page_url TEXT,
  referrer TEXT,
  
  -- Constraints
  CONSTRAINT user_or_anonymous_conversion CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  )
);

-- =====================================================
-- EXPERIMENT RESULTS TABLE
-- Stores calculated statistical results for experiments
-- =====================================================
CREATE TABLE IF NOT EXISTS public.experiment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Result details
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.experiment_variants(id) ON DELETE CASCADE,
  
  -- Metrics
  total_users INTEGER DEFAULT 0,
  total_conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL,
  total_revenue DECIMAL DEFAULT 0,
  revenue_per_user DECIMAL DEFAULT 0,
  
  -- Statistical analysis
  confidence_interval_lower DECIMAL,
  confidence_interval_upper DECIMAL,
  p_value DECIMAL,
  statistical_significance BOOLEAN DEFAULT false,
  
  -- Compared to control
  lift_percentage DECIMAL, -- % improvement over control
  lift_confidence_lower DECIMAL,
  lift_confidence_upper DECIMAL,
  
  -- Calculation metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  sample_size_adequate BOOLEAN DEFAULT false,
  days_running INTEGER DEFAULT 0,
  
  -- Constraints
  UNIQUE(experiment_id, variant_id, DATE(calculated_at))
);

-- =====================================================
-- PRICING EXPERIMENTS TABLE
-- Specialized table for pricing experiment configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS public.pricing_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  
  -- Pricing details
  monthly_price_cents INTEGER NOT NULL,
  annual_price_cents INTEGER,
  annual_discount_type TEXT CHECK (annual_discount_type IN ('percentage', 'months_free')),
  annual_discount_value DECIMAL,
  
  -- Feature gating
  features_included JSONB DEFAULT '[]', -- Array of feature keys
  usage_limits JSONB DEFAULT '{}', -- Limits per feature
  
  -- Urgency/scarcity
  show_urgency BOOLEAN DEFAULT false,
  urgency_message TEXT,
  discount_expires_at TIMESTAMPTZ,
  
  -- Display configuration
  display_config JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT positive_prices CHECK (
    monthly_price_cents > 0 AND 
    (annual_price_cents IS NULL OR annual_price_cents > 0)
  )
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_experiments_status ON public.experiments(status);
CREATE INDEX IF NOT EXISTS idx_experiments_type ON public.experiments(experiment_type);
CREATE INDEX IF NOT EXISTS idx_experiments_started_at ON public.experiments(started_at);

CREATE INDEX IF NOT EXISTS idx_experiment_variants_experiment_id ON public.experiment_variants(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_variants_active ON public.experiment_variants(experiment_id, is_active);

CREATE INDEX IF NOT EXISTS idx_user_assignments_experiment_user ON public.user_experiment_assignments(experiment_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_assignments_experiment_anonymous ON public.user_experiment_assignments(experiment_id, anonymous_id);
CREATE INDEX IF NOT EXISTS idx_user_assignments_assigned_at ON public.user_experiment_assignments(assigned_at);

CREATE INDEX IF NOT EXISTS idx_conversion_events_experiment ON public.conversion_events(experiment_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_variant ON public.conversion_events(variant_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user ON public.conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_occurred_at ON public.conversion_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON public.conversion_events(event_type);

CREATE INDEX IF NOT EXISTS idx_experiment_results_experiment ON public.experiment_results(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_results_calculated_at ON public.experiment_results(calculated_at);

CREATE INDEX IF NOT EXISTS idx_pricing_experiments_experiment ON public.pricing_experiments(experiment_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================
ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_experiments ENABLE ROW LEVEL SECURITY;

-- Admin users can manage experiments
CREATE POLICY "Admin full access to experiments" ON public.experiments
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Regular users can view active experiments
CREATE POLICY "Users can view active experiments" ON public.experiments
  FOR SELECT USING (status = 'active');

-- Admin access to variants
CREATE POLICY "Admin full access to variants" ON public.experiment_variants
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Users can view active variants
CREATE POLICY "Users can view active variants" ON public.experiment_variants
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM public.experiments 
      WHERE id = experiment_id AND status = 'active'
    )
  );

-- Users can view their own assignments
CREATE POLICY "Users can view own assignments" ON public.user_experiment_assignments
  FOR SELECT USING (auth.uid() = user_id);

-- System can create assignments
CREATE POLICY "System can create assignments" ON public.user_experiment_assignments
  FOR INSERT WITH CHECK (true);

-- Users can create conversion events
CREATE POLICY "Users can create conversion events" ON public.conversion_events
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND anonymous_id IS NOT NULL)
  );

-- Admin access to results
CREATE POLICY "Admin access to experiment results" ON public.experiment_results
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- Admin access to pricing experiments
CREATE POLICY "Admin access to pricing experiments" ON public.pricing_experiments
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'is_admin' = 'true'
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to assign user to experiment variant
CREATE OR REPLACE FUNCTION assign_user_to_experiment(
  p_experiment_slug TEXT,
  p_user_id UUID DEFAULT NULL,
  p_anonymous_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_experiment_id UUID;
  v_assignment RECORD;
  v_variant RECORD;
  v_hash_input TEXT;
  v_hash_value BIGINT;
  v_total_weight INTEGER;
  v_selected_weight INTEGER;
  v_current_weight INTEGER;
BEGIN
  -- Get experiment
  SELECT id INTO v_experiment_id 
  FROM public.experiments 
  WHERE slug = p_experiment_slug AND status = 'active';
  
  IF v_experiment_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Experiment not found or inactive');
  END IF;
  
  -- Check existing assignment
  SELECT * INTO v_assignment
  FROM public.user_experiment_assignments
  WHERE experiment_id = v_experiment_id 
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id) OR
      (p_anonymous_id IS NOT NULL AND anonymous_id = p_anonymous_id)
    );
  
  IF FOUND THEN
    -- Return existing assignment
    SELECT * INTO v_variant
    FROM public.experiment_variants
    WHERE id = v_assignment.variant_id;
    
    RETURN jsonb_build_object(
      'variant_key', v_variant.variant_key,
      'variant_id', v_variant.id,
      'config', v_variant.config,
      'assigned_at', v_assignment.assigned_at
    );
  END IF;
  
  -- Calculate total weight
  SELECT SUM(traffic_weight) INTO v_total_weight
  FROM public.experiment_variants
  WHERE experiment_id = v_experiment_id AND is_active = true;
  
  IF v_total_weight = 0 THEN
    RETURN jsonb_build_object('error', 'No active variants found');
  END IF;
  
  -- Generate deterministic hash for user
  v_hash_input := COALESCE(p_user_id::TEXT, p_anonymous_id) || p_experiment_slug;
  v_hash_value := ABS(('x' || SUBSTR(MD5(v_hash_input), 1, 8))::BIT(32)::BIGINT);
  v_selected_weight := (v_hash_value % v_total_weight) + 1;
  
  -- Find variant based on weight
  v_current_weight := 0;
  FOR v_variant IN 
    SELECT * FROM public.experiment_variants 
    WHERE experiment_id = v_experiment_id AND is_active = true
    ORDER BY id
  LOOP
    v_current_weight := v_current_weight + v_variant.traffic_weight;
    IF v_selected_weight <= v_current_weight THEN
      -- Create assignment
      INSERT INTO public.user_experiment_assignments 
        (experiment_id, variant_id, user_id, anonymous_id, assignment_method)
      VALUES 
        (v_experiment_id, v_variant.id, p_user_id, p_anonymous_id, 'hash_based');
      
      RETURN jsonb_build_object(
        'variant_key', v_variant.variant_key,
        'variant_id', v_variant.id,
        'config', v_variant.config,
        'assigned_at', NOW()
      );
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object('error', 'Failed to assign variant');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record conversion event
CREATE OR REPLACE FUNCTION record_conversion_event(
  p_experiment_slug TEXT,
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_anonymous_id TEXT DEFAULT NULL,
  p_event_value DECIMAL DEFAULT NULL,
  p_event_properties JSONB DEFAULT '{}'::JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  v_experiment_id UUID;
  v_variant_id UUID;
BEGIN
  -- Get experiment
  SELECT id INTO v_experiment_id 
  FROM public.experiments 
  WHERE slug = p_experiment_slug AND status = 'active';
  
  IF v_experiment_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get user's assignment
  SELECT variant_id INTO v_variant_id
  FROM public.user_experiment_assignments
  WHERE experiment_id = v_experiment_id 
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id) OR
      (p_anonymous_id IS NOT NULL AND anonymous_id = p_anonymous_id)
    );
  
  IF v_variant_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Record conversion
  INSERT INTO public.conversion_events 
    (experiment_id, variant_id, user_id, anonymous_id, event_type, event_value, event_properties)
  VALUES 
    (v_experiment_id, v_variant_id, p_user_id, p_anonymous_id, p_event_type, p_event_value, p_event_properties);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE PRICING EXPERIMENT DATA
-- =====================================================
INSERT INTO public.experiments (slug, name, description, experiment_type, target_metric, success_criteria, min_sample_size, status) VALUES
  ('pricing_optimization_2025', 'Pricing Optimization Q1 2025', 'Test different price points for Pro tier to maximize revenue per user', 'pricing', 'revenue_per_user', 'Increase RPU by 15% while maintaining >80% conversion rate', 2000, 'draft');

-- Get the experiment ID for variants
WITH exp AS (SELECT id FROM public.experiments WHERE slug = 'pricing_optimization_2025')
INSERT INTO public.experiment_variants (experiment_id, variant_key, name, description, traffic_weight, config) VALUES
  ((SELECT id FROM exp), 'control', 'Current Pricing ($7.99)', 'Current pricing at $7.99/month', 1, '{"monthly_price": 799, "annual_discount": 0.2}'::jsonb),
  ((SELECT id FROM exp), 'price_999', 'Higher Pricing ($9.99)', 'Test higher price point at $9.99/month', 1, '{"monthly_price": 999, "annual_discount": 0.2}'::jsonb),
  ((SELECT id FROM exp), 'price_1299', 'Premium Pricing ($12.99)', 'Test premium price point at $12.99/month', 1, '{"monthly_price": 1299, "annual_discount": 0.25}'::jsonb);

COMMENT ON TABLE public.experiments IS 'Core experiments configuration and metadata';
COMMENT ON TABLE public.experiment_variants IS 'Variants/treatments for each experiment';
COMMENT ON TABLE public.user_experiment_assignments IS 'User assignments to experiment variants';
COMMENT ON TABLE public.conversion_events IS 'Conversion events for measuring experiment success';
COMMENT ON TABLE public.experiment_results IS 'Calculated statistical results for experiments';
COMMENT ON TABLE public.pricing_experiments IS 'Specialized pricing experiment configurations';