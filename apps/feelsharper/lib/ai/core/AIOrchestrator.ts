import { createClient } from '@/lib/supabase/server';
import { 
  AIRequestType, 
  AIContext, 
  AIResponse, 
  UserTier,
  MODEL_CONFIGS,
  USAGE_LIMITS,
  COST_PER_1K_TOKENS
} from '@/lib/ai/types';
import { WorkoutParser } from '@/lib/ai/parsers/WorkoutParser';
import { FoodParser } from '@/lib/ai/parsers/FoodParser';
import { SmartCoach } from '@/lib/ai/coach/SmartCoach';
import { VoiceTranscriber } from '@/lib/ai/voice/VoiceTranscriber';
import { PhotoAnalyzer } from '@/lib/ai/vision/PhotoAnalyzer';
import { PatternDetector } from '@/lib/ai/patterns/PatternDetector';
import { TrainingLoadAnalyzer } from '@/lib/ai/analysis/TrainingLoadAnalyzer';
import { RecoveryPredictor } from '@/lib/ai/analysis/RecoveryPredictor';

export class AIOrchestrator {
  private handlers: Record<AIRequestType, any>;
  private supabase;

  constructor() {
    this.supabase = createClient();
    this.initializeHandlers();
  }

  private initializeHandlers() {
    this.handlers = {
      parse_workout: new WorkoutParser(),
      parse_food: new FoodParser(),
      coach_chat: new SmartCoach(),
      voice_transcription: new VoiceTranscriber(),
      photo_analysis: new PhotoAnalyzer(),
      pattern_detection: new PatternDetector(),
      load_analysis: new TrainingLoadAnalyzer(),
      recovery_prediction: new RecoveryPredictor()
    };
  }

  async processRequest<T>(
    type: AIRequestType, 
    input: any, 
    userId: string
  ): Promise<AIResponse<T>> {
    const startTime = Date.now();
    
    try {
      // 1. Check usage limits
      const canProceed = await this.checkUsageLimits(userId, type);
      if (!canProceed.allowed) {
        return {
          success: false,
          error: canProceed.message,
          tokens_used: 0,
          cost_cents: 0,
          model_used: '',
          processing_time_ms: Date.now() - startTime
        };
      }

      // 2. Load user context (cached when possible)
      const context = await this.loadUserContext(userId);

      // 3. Get model configuration
      const modelConfig = MODEL_CONFIGS[type];

      // 4. Process with appropriate handler
      const handler = this.handlers[type];
      const result = await handler.process(input, context, modelConfig);

      // 5. Calculate costs
      const costCents = this.calculateCost(
        result.tokens_used,
        modelConfig.model
      );

      // 6. Store context and track usage
      await Promise.all([
        this.storeContext(userId, type, input, result),
        this.trackUsage(userId, type, result.tokens_used, costCents, modelConfig.model),
        this.updatePatterns(userId, type, input, result)
      ]);

      // 7. Return response
      return {
        success: true,
        data: result.data,
        confidence: result.confidence,
        tokens_used: result.tokens_used,
        cost_cents: costCents,
        model_used: modelConfig.model,
        processing_time_ms: Date.now() - startTime
      };

    } catch (error) {
      console.error(`AI Orchestrator error for ${type}:`, error);
      
      // Track failed attempt
      await this.trackUsage(userId, type, 0, 0, '', false);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed',
        tokens_used: 0,
        cost_cents: 0,
        model_used: MODEL_CONFIGS[type].model,
        processing_time_ms: Date.now() - startTime
      };
    }
  }

  private async checkUsageLimits(
    userId: string, 
    type: AIRequestType
  ): Promise<{ allowed: boolean; message?: string }> {
    // Get user tier
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('user_id', userId)
      .single();

    const tier = (profile?.subscription_tier || 'free') as UserTier;
    const limits = USAGE_LIMITS[type];
    
    // Elite tier has unlimited access
    if (tier === 'elite' && limits.elite === null) {
      return { allowed: true };
    }

    // Get current month usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: usage } = await this.supabase
      .from('ai_usage_tracking')
      .select('id')
      .eq('user_id', userId)
      .eq('operation', type)
      .gte('created_at', startOfMonth.toISOString());

    const currentUsage = usage?.length || 0;
    const limit = limits[tier];

    if (limit !== null && currentUsage >= limit) {
      return {
        allowed: false,
        message: `Monthly limit reached (${currentUsage}/${limit}). Upgrade to ${tier === 'free' ? 'Pro' : 'Elite'} for more.`
      };
    }

    return { allowed: true };
  }

  private async loadUserContext(userId: string): Promise<AIContext> {
    // Check cache first
    const { data: cache } = await this.supabase
      .from('user_ai_context_cache')
      .select('*')
      .eq('user_id', userId)
      .gt('stale_after', new Date().toISOString())
      .single();

    if (cache) {
      return this.parseCachedContext(cache);
    }

    // Load fresh context
    const context = await this.loadFreshContext(userId);
    
    // Update cache
    await this.updateContextCache(userId, context);
    
    return context;
  }

  private async loadFreshContext(userId: string): Promise<AIContext> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [profile, workouts, nutrition, bodyMetrics, goals, patterns, conversations] = 
      await Promise.all([
        // User profile
        this.supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        
        // Recent workouts
        this.supabase
          .from('workouts')
          .select('*')
          .eq('user_id', userId)
          .gte('date', thirtyDaysAgo.toISOString())
          .order('date', { ascending: false })
          .limit(30),
        
        // Recent nutrition
        this.supabase
          .from('food_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('date', sevenDaysAgo.toISOString())
          .order('date', { ascending: false }),
        
        // Body metrics
        this.supabase
          .from('body_weight')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(10),
        
        // Active goals
        this.supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active'),
        
        // User patterns
        this.supabase
          .from('user_patterns')
          .select('*')
          .eq('user_id', userId)
          .order('frequency', { ascending: false })
          .limit(50),
        
        // Recent conversations
        this.supabase
          .from('ai_conversation_memory')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

    return {
      userId,
      profile: profile.data,
      recentWorkouts: workouts.data || [],
      recentNutrition: nutrition.data || [],
      bodyMetrics: bodyMetrics.data || [],
      goals: goals.data || [],
      patterns: patterns.data || [],
      conversations: conversations.data || []
    };
  }

  private parseCachedContext(cache: any): AIContext {
    return {
      userId: cache.user_id,
      profile: cache.user_profile,
      recentWorkouts: cache.recent_workouts || [],
      recentNutrition: cache.recent_nutrition || [],
      bodyMetrics: cache.body_metrics || [],
      goals: cache.active_goals || [],
      patterns: cache.workout_patterns || [],
      conversations: cache.coaching_history || []
    };
  }

  private async updateContextCache(userId: string, context: AIContext) {
    const cacheData = {
      user_id: userId,
      recent_workouts: context.recentWorkouts,
      recent_nutrition: context.recentNutrition,
      body_metrics: context.bodyMetrics,
      active_goals: context.goals,
      workout_patterns: context.patterns.filter(p => p.pattern_type === 'exercise_alias'),
      food_patterns: context.patterns.filter(p => p.pattern_type === 'food_preference'),
      coaching_history: context.conversations.slice(0, 10),
      avg_daily_calories: this.calculateAvgCalories(context.recentNutrition),
      avg_daily_protein: this.calculateAvgProtein(context.recentNutrition),
      workout_frequency_per_week: this.calculateWorkoutFrequency(context.recentWorkouts),
      computed_at: new Date().toISOString(),
      stale_after: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    };

    await this.supabase
      .from('user_ai_context_cache')
      .upsert(cacheData, { onConflict: 'user_id' });
  }

  private calculateAvgCalories(nutrition: any[]): number {
    if (!nutrition.length) return 0;
    const total = nutrition.reduce((sum, log) => sum + (log.total_calories || 0), 0);
    return Math.round(total / nutrition.length);
  }

  private calculateAvgProtein(nutrition: any[]): number {
    if (!nutrition.length) return 0;
    const total = nutrition.reduce((sum, log) => sum + (log.total_protein || 0), 0);
    return Math.round(total / nutrition.length);
  }

  private calculateWorkoutFrequency(workouts: any[]): number {
    if (!workouts.length) return 0;
    const weeks = Math.ceil(workouts.length / 7);
    return Math.round((workouts.length / weeks) * 10) / 10;
  }

  private calculateCost(tokens: number, model: string): number {
    const costs = COST_PER_1K_TOKENS[model as keyof typeof COST_PER_1K_TOKENS];
    if (!costs) return 0;
    
    // Assuming 70% input, 30% output for now
    const inputTokens = tokens * 0.7;
    const outputTokens = tokens * 0.3;
    
    const costDollars = (inputTokens * costs.input / 1000) + 
                       (outputTokens * costs.output / 1000);
    
    return Math.round(costDollars * 100 * 100) / 100; // Convert to cents with 2 decimal places
  }

  private async storeContext(
    userId: string,
    type: AIRequestType,
    input: any,
    result: any
  ) {
    await this.supabase.from('user_context_store').insert({
      user_id: userId,
      context_type: type.split('_')[1], // Extract main type
      raw_input: typeof input === 'string' ? input : JSON.stringify(input),
      parsed_output: result.data,
      confidence: result.confidence,
      model_used: result.model_used || MODEL_CONFIGS[type].model,
      tokens_used: result.tokens_used,
      processing_time_ms: result.processing_time_ms
    });
  }

  private async trackUsage(
    userId: string,
    type: AIRequestType,
    tokens: number,
    costCents: number,
    model: string,
    success: boolean = true
  ) {
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('user_id', userId)
      .single();

    await this.supabase.from('ai_usage_tracking').insert({
      user_id: userId,
      endpoint: `/api/ai/${type}`,
      operation: type,
      model_provider: MODEL_CONFIGS[type].provider,
      model_name: model,
      total_tokens: tokens,
      input_tokens: Math.round(tokens * 0.7),
      output_tokens: Math.round(tokens * 0.3),
      cost_cents: costCents,
      tier: profile?.subscription_tier || 'free',
      success
    });
  }

  private async updatePatterns(
    userId: string,
    type: AIRequestType,
    input: any,
    result: any
  ) {
    // Extract patterns based on request type
    if (type === 'parse_workout' && result.data?.exercises) {
      // Learn exercise abbreviations
      for (const exercise of result.data.exercises) {
        if (input.includes(exercise.name.substring(0, 3))) {
          await this.supabase.rpc('increment_pattern_frequency', {
            p_user_id: userId,
            p_pattern_type: 'exercise_alias',
            p_pattern_key: exercise.name.substring(0, 3).toLowerCase(),
            p_pattern_value: { full_name: exercise.name }
          });
        }
      }
    }
    
    if (type === 'parse_food' && result.data?.foods) {
      // Learn food preferences
      for (const food of result.data.foods) {
        await this.supabase.rpc('increment_pattern_frequency', {
          p_user_id: userId,
          p_pattern_type: 'food_preference',
          p_pattern_key: food.name.toLowerCase(),
          p_pattern_value: { 
            typical_quantity: food.quantity,
            typical_unit: food.unit 
          }
        });
      }
    }
  }

  // Public method for getting user's usage summary
  async getUserUsageSummary(userId: string) {
    const { data } = await this.supabase
      .rpc('get_monthly_ai_usage', { p_user_id: userId });
    
    return data;
  }

  // Check if user should be prompted to upgrade
  async shouldPromptUpgrade(userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .rpc('check_free_tier_exceeded', { p_user_id: userId });
    
    return data === true;
  }
}