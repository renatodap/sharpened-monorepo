// Common AI-related types
export interface WorkoutParseResult {
  title: string;
  exercises: Array<{
    name: string;
    sets: Array<{
      reps: number;
      weight: number;
      notes?: string;
    }>;
  }>;
  duration_minutes?: number;
  notes?: string;
}

export interface NutritionAnalysis {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  qualityRating: number;
  suggestions: string[];
  missingNutrients: string[];
}

export interface StudyPlan {
  schedule: Array<{
    day: string;
    tasks: string[];
    duration: number;
  }>;
  objectives: string[];
  methods: string[];
  milestones: Array<{
    week: number;
    goal: string;
    assessment: string;
  }>;
  reviewCycles: Array<{
    interval: string;
    topics: string[];
  }>;
  content?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: number;
  tags: string[];
  lastReviewed?: Date;
  nextReview?: Date;
  correctStreak: number;
  totalReviews: number;
}

export interface EmbeddingResult {
  embedding: number[];
  text: string;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
  timestamp?: Date;
}