// Unified database types for all apps
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: 'free' | 'basic' | 'premium';
          settings: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'basic' | 'premium';
          settings?: Record<string, any> | null;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'basic' | 'premium';
          settings?: Record<string, any> | null;
          updated_at?: string;
        };
      };
      foods: {
        Row: {
          id: number;
          name: string;
          brand: string | null;
          calories_per_100g: number;
          protein_per_100g: number;
          carbs_per_100g: number;
          fat_per_100g: number;
          fiber_per_100g: number | null;
          sodium_per_100g: number | null;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          brand?: string | null;
          calories_per_100g: number;
          protein_per_100g: number;
          carbs_per_100g: number;
          fat_per_100g: number;
          fiber_per_100g?: number | null;
          sodium_per_100g?: number | null;
          verified?: boolean;
        };
        Update: {
          name?: string;
          brand?: string | null;
          calories_per_100g?: number;
          protein_per_100g?: number;
          carbs_per_100g?: number;
          fat_per_100g?: number;
          fiber_per_100g?: number | null;
          sodium_per_100g?: number | null;
          verified?: boolean;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          date: string;
          exercises: Array<{
            name: string;
            sets: Array<{
              reps: number;
              weight: number;
              notes?: string;
            }>;
          }>;
          duration_minutes: number | null;
          notes: string | null;
          parsed_from: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          date: string;
          exercises: Array<{
            name: string;
            sets: Array<{
              reps: number;
              weight: number;
              notes?: string;
            }>;
          }>;
          duration_minutes?: number | null;
          notes?: string | null;
          parsed_from?: string | null;
        };
        Update: {
          title?: string;
          date?: string;
          exercises?: Array<{
            name: string;
            sets: Array<{
              reps: number;
              weight: number;
              notes?: string;
            }>;
          }>;
          duration_minutes?: number | null;
          notes?: string | null;
        };
      };
      body_weight: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: number;
          recorded_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight_kg: number;
          recorded_at?: string;
          notes?: string | null;
        };
        Update: {
          weight_kg?: number;
          recorded_at?: string;
          notes?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}