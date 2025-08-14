export type AIProvider = 'openai' | 'anthropic' | 'local';
export type AIModel = 'gpt-4o-mini' | 'gpt-4-vision-preview' | 'claude-3-haiku' | 'whisper-1';

export type AIRequestType = 
  | 'parse_workout'
  | 'parse_food'
  | 'coach_chat'
  | 'voice_transcription'
  | 'photo_analysis'
  | 'pattern_detection'
  | 'load_analysis'
  | 'recovery_prediction';

export type UserTier = 'free' | 'pro' | 'elite';

export interface AIUsageLimits {
  free: number;
  pro: number;
  elite: number | null; // null = unlimited
}

export const USAGE_LIMITS: Record<AIRequestType, AIUsageLimits> = {
  parse_workout: { free: 10, pro: 100, elite: null },
  parse_food: { free: 10, pro: 100, elite: null },
  coach_chat: { free: 5, pro: 50, elite: null },
  voice_transcription: { free: 0, pro: 20, elite: null },
  photo_analysis: { free: 0, pro: 10, elite: null },
  pattern_detection: { free: 5, pro: 50, elite: null },
  load_analysis: { free: 2, pro: 20, elite: null },
  recovery_prediction: { free: 2, pro: 20, elite: null }
};

export interface AIContext {
  userId: string;
  profile: UserProfile;
  recentWorkouts: Workout[];
  recentNutrition: FoodLog[];
  bodyMetrics: BodyMetric[];
  goals: UserGoal[];
  patterns: UserPattern[];
  conversations: ConversationMemory[];
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  age?: number;
  height_cm?: number;
  activity_level?: string;
  training_style?: string;
  dietary_preferences?: string[];
  subscription_tier: UserTier;
}

export interface Workout {
  id: string;
  date: Date;
  exercises: Exercise[];
  duration_minutes?: number;
  notes?: string;
  ai_parsed?: boolean;
}

export interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  distance_km?: number;
  duration_minutes?: number;
  rest_seconds?: number;
  rpe?: number;
  tempo?: string;
}

export interface FoodLog {
  id: string;
  date: Date;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
  total_calories?: number;
  total_protein?: number;
  ai_parsed?: boolean;
}

export interface FoodItem {
  name: string;
  brand?: string;
  quantity: number;
  unit: string;
  calories: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  usda_id?: string;
}

export interface BodyMetric {
  id: string;
  date: Date;
  weight_kg?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  measurements?: Record<string, number>;
}

export interface UserGoal {
  id: string;
  type: 'weight_loss' | 'muscle_gain' | 'performance' | 'health';
  target_value?: number;
  target_date?: Date;
  current_value?: number;
  status: 'active' | 'completed' | 'paused';
}

export interface UserPattern {
  id: string;
  pattern_type: string;
  pattern_key: string;
  pattern_value: any;
  frequency: number;
  confidence: number;
}

export interface ConversationMemory {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: Date;
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  tokens_used: number;
  cost_cents: number;
  model_used: string;
  processing_time_ms: number;
}

export interface ParsedWorkout {
  exercises: Exercise[];
  total_volume?: number;
  estimated_calories?: number;
  workout_type?: string;
  intensity_score?: number;
  raw_input: string;
  corrections_needed?: string[];
}

export interface ParsedFood {
  foods: FoodItem[];
  meal_type?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  confidence_scores: Record<string, number>;
}

export interface CoachResponse {
  message: string;
  suggestions?: string[];
  action_items?: ActionItem[];
  references?: DataReference[];
  confidence: number;
}

export interface ActionItem {
  type: 'workout' | 'nutrition' | 'rest' | 'measurement';
  description: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: Date;
}

export interface DataReference {
  type: 'workout' | 'food' | 'metric' | 'goal';
  id: string;
  date: Date;
  summary: string;
}

export interface LoadAnalysis {
  acute_load: number;
  chronic_load: number;
  ratio: number;
  risk_level: 'low' | 'optimal' | 'moderate' | 'high';
  recommendation: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface RecoveryPrediction {
  recovery_hours: number;
  readiness_score: number;
  factors: RecoveryFactor[];
  recommendations: string[];
}

export interface RecoveryFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  score: number;
  description: string;
}

export interface ModelConfig {
  provider: AIProvider;
  model: AIModel;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export const MODEL_CONFIGS: Record<AIRequestType, ModelConfig> = {
  parse_workout: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.2,
    max_tokens: 1000
  },
  parse_food: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.2,
    max_tokens: 1000
  },
  coach_chat: {
    provider: 'anthropic',
    model: 'claude-3-haiku',
    temperature: 0.7,
    max_tokens: 2000,
    stream: true
  },
  voice_transcription: {
    provider: 'openai',
    model: 'whisper-1',
    temperature: 0
  },
  photo_analysis: {
    provider: 'openai',
    model: 'gpt-4-vision-preview',
    temperature: 0.3,
    max_tokens: 1000
  },
  pattern_detection: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 500
  },
  load_analysis: {
    provider: 'local',
    model: 'gpt-4o-mini', // Fallback, mostly calculation-based
    temperature: 0
  },
  recovery_prediction: {
    provider: 'local',
    model: 'gpt-4o-mini', // Fallback, mostly calculation-based
    temperature: 0
  }
};

export const COST_PER_1K_TOKENS = {
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-vision-preview': { input: 0.01, output: 0.03 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'whisper-1': { input: 0.006, output: 0 }
};