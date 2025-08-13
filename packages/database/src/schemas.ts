// Common database schemas and validation
import { z } from 'zod';

// User profiles
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  subscription_tier: z.enum(['free', 'basic', 'premium']).default('free'),
  settings: z.record(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Foods
export const FoodSchema = z.object({
  id: z.number(),
  name: z.string(),
  brand: z.string().optional(),
  calories_per_100g: z.number(),
  protein_per_100g: z.number(),
  carbs_per_100g: z.number(),
  fat_per_100g: z.number(),
  fiber_per_100g: z.number().optional(),
  sodium_per_100g: z.number().optional(),
  verified: z.boolean().default(false),
});

// Workouts
export const WorkoutSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  date: z.date(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.array(z.object({
      reps: z.number(),
      weight: z.number(),
      notes: z.string().optional(),
    })),
  })),
  duration_minutes: z.number().optional(),
  notes: z.string().optional(),
  parsed_from: z.string().optional(),
});

// Body metrics
export const BodyWeightSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  weight_kg: z.number(),
  recorded_at: z.date(),
  notes: z.string().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Food = z.infer<typeof FoodSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type BodyWeight = z.infer<typeof BodyWeightSchema>;