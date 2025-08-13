// Common database queries used across applications
import type { Database } from './types';
import { createSupabaseClient, createSupabaseServerClient } from './client';

export class DatabaseQueries {
  private supabase;

  constructor(useServerClient = false) {
    this.supabase = useServerClient ? createSupabaseServerClient() : createSupabaseClient();
  }

  // User management
  async getUserProfile(userId: string) {
    return await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  }

  async updateUserProfile(userId: string, updates: Database['public']['Tables']['profiles']['Update']) {
    return await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
  }

  // Food database
  async searchFoods(query: string, limit = 20) {
    return await this.supabase
      .from('foods')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('verified', true)
      .limit(limit);
  }

  async getFoodById(id: number) {
    return await this.supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .single();
  }

  // Workouts
  async getUserWorkouts(userId: string, limit = 50) {
    return await this.supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
  }

  async createWorkout(workout: Database['public']['Tables']['workouts']['Insert']) {
    return await this.supabase
      .from('workouts')
      .insert(workout)
      .select()
      .single();
  }

  async updateWorkout(id: string, updates: Database['public']['Tables']['workouts']['Update']) {
    return await this.supabase
      .from('workouts')
      .update(updates)
      .eq('id', id);
  }

  // Body weight tracking
  async getUserWeightHistory(userId: string, days = 90) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return await this.supabase
      .from('body_weight')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', since.toISOString())
      .order('recorded_at', { ascending: true });
  }

  async addWeightEntry(entry: Database['public']['Tables']['body_weight']['Insert']) {
    return await this.supabase
      .from('body_weight')
      .insert(entry)
      .select()
      .single();
  }

  async getLatestWeight(userId: string) {
    return await this.supabase
      .from('body_weight')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();
  }

  // Analytics and insights
  async getUserStats(userId: string) {
    const [workouts, weights, profile] = await Promise.all([
      this.getUserWorkouts(userId, 30),
      this.getUserWeightHistory(userId, 30),
      this.getUserProfile(userId),
    ]);

    const workoutCount = workouts.data?.length || 0;
    const weightEntries = weights.data?.length || 0;
    const latestWeight = weightEntries > 0 ? weights.data![weightEntries - 1].weight_kg : null;
    const oldestWeight = weightEntries > 0 ? weights.data![0].weight_kg : null;
    const weightChange = latestWeight && oldestWeight ? latestWeight - oldestWeight : null;

    return {
      workoutCount,
      weightEntries,
      weightChange,
      latestWeight,
      profile: profile.data,
    };
  }
}