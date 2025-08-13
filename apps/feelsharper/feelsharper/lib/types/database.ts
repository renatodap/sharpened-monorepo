/**
 * Feel Sharper Database Types
 * Generated from Supabase schema migrations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Enums
export type GoalTypeEnum = 'weight_loss' | 'muscle_gain' | 'endurance' | 'general_health' | 'sport_specific' | 'marathon'
export type ExperienceLevelEnum = 'beginner' | 'intermediate' | 'advanced'
export type UnitWeightEnum = 'kg' | 'lb'
export type UnitDistanceEnum = 'km' | 'mi'
export type WorkoutTypeEnum = 'strength' | 'cardio' | 'flexibility' | 'sport'
export type ExerciseTypeEnum = 'reps' | 'time' | 'distance'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          locale: string
          units_weight: UnitWeightEnum
          units_distance: UnitDistanceEnum
          goal_type: GoalTypeEnum | null
          experience_level: ExperienceLevelEnum | null
          age: number | null
          height_cm: number | null
          starting_weight_kg: number | null
          target_weight_kg: number | null
          activity_level: number | null
          weekly_sessions: number | null
          session_duration_min: number | null
          target_date: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          locale?: string
          units_weight?: UnitWeightEnum
          units_distance?: UnitDistanceEnum
          goal_type?: GoalTypeEnum | null
          experience_level?: ExperienceLevelEnum | null
          age?: number | null
          height_cm?: number | null
          starting_weight_kg?: number | null
          target_weight_kg?: number | null
          activity_level?: number | null
          weekly_sessions?: number | null
          session_duration_min?: number | null
          target_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          locale?: string
          units_weight?: UnitWeightEnum
          units_distance?: UnitDistanceEnum
          goal_type?: GoalTypeEnum | null
          experience_level?: ExperienceLevelEnum | null
          age?: number | null
          height_cm?: number | null
          starting_weight_kg?: number | null
          target_weight_kg?: number | null
          activity_level?: number | null
          weekly_sessions?: number | null
          session_duration_min?: number | null
          target_date?: string | null
        }
      }
      foods: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          fdc_id: number | null
          description: string
          brand_name: string | null
          serving_size: number | null
          serving_unit: string | null
          calories_per_100g: number | null
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          fiber_g: number | null
          sugar_g: number | null
          sodium_mg: number | null
          category: string | null
          verified: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          fdc_id?: number | null
          description: string
          brand_name?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_100g?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          category?: string | null
          verified?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          fdc_id?: number | null
          description?: string
          brand_name?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_100g?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          category?: string | null
          verified?: boolean
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          date: string
          workout_type: WorkoutTypeEnum
          duration_minutes: number | null
          calories_burned: number | null
          notes: string | null
          exercises: Json
          completed: boolean
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          date: string
          workout_type: WorkoutTypeEnum
          duration_minutes?: number | null
          calories_burned?: number | null
          notes?: string | null
          exercises?: Json
          completed?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          date?: string
          workout_type?: WorkoutTypeEnum
          duration_minutes?: number | null
          calories_burned?: number | null
          notes?: string | null
          exercises?: Json
          completed?: boolean
        }
      }
      body_weight: {
        Row: {
          id: string
          user_id: string
          created_at: string
          date: string
          weight_kg: number
          body_fat_percentage: number | null
          muscle_mass_kg: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          date: string
          weight_kg: number
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          date?: string
          weight_kg?: number
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
        }
      }
      custom_foods: {
        Row: {
          id: string
          user_id: string
          name: string
          brand: string | null
          serving_size: number | null
          serving_unit: string | null
          calories_per_serving: number | null
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          fiber_g: number | null
          sugar_g: number | null
          sodium_mg: number | null
          is_recipe: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brand?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_serving?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          is_recipe?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          brand?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_serving?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          is_recipe?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      nutrition_logs: {
        Row: {
          id: string
          user_id: string
          created_at: string
          date: string
          meal_type: string
          food_id: number
          quantity_g: number
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          date: string
          meal_type: string
          food_id: number
          quantity_g: number
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          notes?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          date?: string
          meal_type?: string
          food_id?: number
          quantity_g?: number
          calories?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      goal_type_enum: GoalTypeEnum
      experience_level_enum: ExperienceLevelEnum
      unit_weight_enum: UnitWeightEnum
      unit_distance_enum: UnitDistanceEnum
      workout_type_enum: WorkoutTypeEnum
      exercise_type_enum: ExerciseTypeEnum
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Food = Database['public']['Tables']['foods']['Row']
export type FoodInsert = Database['public']['Tables']['foods']['Insert']
export type FoodUpdate = Database['public']['Tables']['foods']['Update']

export type Workout = Database['public']['Tables']['workouts']['Row']
export type WorkoutInsert = Database['public']['Tables']['workouts']['Insert']
export type WorkoutUpdate = Database['public']['Tables']['workouts']['Update']

export type BodyWeight = Database['public']['Tables']['body_weight']['Row']
export type BodyWeightInsert = Database['public']['Tables']['body_weight']['Insert']
export type BodyWeightUpdate = Database['public']['Tables']['body_weight']['Update']

export type NutritionLog = Database['public']['Tables']['nutrition_logs']['Row']
export type NutritionLogInsert = Database['public']['Tables']['nutrition_logs']['Insert']
export type NutritionLogUpdate = Database['public']['Tables']['nutrition_logs']['Update']

export type CustomFood = Database['public']['Tables']['custom_foods']['Row']
export type CustomFoodInsert = Database['public']['Tables']['custom_foods']['Insert']
export type CustomFoodUpdate = Database['public']['Tables']['custom_foods']['Update']

// Exercise structure for workouts
export interface Exercise {
  name: string
  type: ExerciseTypeEnum
  sets?: ExerciseSet[]
  duration_seconds?: number
  distance_km?: number
  notes?: string
}

export interface ExerciseSet {
  reps?: number
  weight_kg?: number
  duration_seconds?: number
  rest_seconds?: number
  completed: boolean
}