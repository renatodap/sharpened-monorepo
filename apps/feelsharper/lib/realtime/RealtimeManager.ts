/**
 * RealtimeManager - WebSocket-like real-time functionality using Supabase
 * Maps to PRD: Real-time Features (Technical Requirement #3)
 */

import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type RealtimeEventType = 
  | 'workout_started'
  | 'workout_updated' 
  | 'workout_completed'
  | 'set_completed'
  | 'rest_timer_started'
  | 'user_online'
  | 'user_offline'
  | 'sync_required';

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: any;
  timestamp: string;
  userId: string;
  sessionId?: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutId?: string;
  status: 'active' | 'paused' | 'completed';
  currentExercise?: number;
  currentSet?: number;
  startedAt: string;
  lastActivity: string;
  restTimer?: {
    startedAt: string;
    duration: number;
    isActive: boolean;
  };
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'working_out';
  lastSeen: string;
  currentWorkout?: string;
  deviceInfo: {
    type: 'mobile' | 'desktop' | 'tablet';
    userAgent: string;
  };
}

type EventCallback = (event: RealtimeEvent) => void;
type PresenceCallback = (presence: UserPresence[]) => void;

export class RealtimeManager {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  private channels: Map<string, RealtimeChannel> = new Map();
  private eventCallbacks: Map<RealtimeEventType, EventCallback[]> = new Map();
  private presenceCallbacks: PresenceCallback[] = [];
  private currentSession: WorkoutSession | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize real-time connection
   */
  async initialize(userId: string): Promise<void> {
    // Set up main user channel
    const userChannel = this.supabase
      .channel(`user:${userId}`)
      .on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this.handlePresenceJoin(key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this.handlePresenceLeave(key, leftPresences);
      })
      .subscribe();

    this.channels.set('user', userChannel);

    // Set up workout sessions channel
    const workoutChannel = this.supabase
      .channel('workout_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_sessions',
          filter: `user_id=eq.${userId}`
        },
        this.handleWorkoutSessionChange.bind(this)
      )
      .subscribe();

    this.channels.set('workouts', workoutChannel);

    // Track presence
    await this.updatePresence(userId, 'online');

    // Start heartbeat
    this.startHeartbeat(userId);

    console.log('[RealtimeManager] Initialized for user:', userId);
  }

  /**
   * Start a live workout session
   */
  async startWorkoutSession(userId: string, workoutId?: string): Promise<string> {
    const session: WorkoutSession = {
      id: this.generateSessionId(),
      userId,
      workoutId,
      status: 'active',
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    // Store session in database
    const { error } = await this.supabase
      .from('workout_sessions')
      .insert(session);

    if (error) {
      throw new Error(`Failed to start workout session: ${error.message}`);
    }

    this.currentSession = session;
    await this.updatePresence(userId, 'working_out', session.id);

    // Emit event
    this.emitEvent('workout_started', { sessionId: session.id, workoutId }, userId);

    return session.id;
  }

  /**
   * Update workout session progress
   */
  async updateWorkoutProgress(
    exerciseIndex: number, 
    setIndex: number,
    setData?: any
  ): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active workout session');
    }

    const updates = {
      current_exercise: exerciseIndex,
      current_set: setIndex,
      last_activity: new Date().toISOString(),
      set_data: setData
    };

    const { error } = await this.supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', this.currentSession.id);

    if (error) {
      throw new Error(`Failed to update workout progress: ${error.message}`);
    }

    // Update local session
    this.currentSession.currentExercise = exerciseIndex;
    this.currentSession.currentSet = setIndex;
    this.currentSession.lastActivity = updates.last_activity;

    // Emit event
    this.emitEvent('workout_updated', {
      sessionId: this.currentSession.id,
      exerciseIndex,
      setIndex,
      setData
    }, this.currentSession.userId);
  }

  /**
   * Start rest timer
   */
  async startRestTimer(duration: number): Promise<void> {
    if (!this.currentSession) return;

    const restTimer = {
      startedAt: new Date().toISOString(),
      duration,
      isActive: true
    };

    this.currentSession.restTimer = restTimer;

    const { error } = await this.supabase
      .from('workout_sessions')
      .update({ 
        rest_timer: restTimer,
        last_activity: new Date().toISOString()
      })
      .eq('id', this.currentSession.id);

    if (error) {
      console.error('Failed to update rest timer:', error);
    }

    // Emit event
    this.emitEvent('rest_timer_started', {
      sessionId: this.currentSession.id,
      duration
    }, this.currentSession.userId);

    // Auto-complete timer
    setTimeout(() => {
      this.completeRestTimer();
    }, duration * 1000);
  }

  /**
   * Complete rest timer
   */
  private async completeRestTimer(): Promise<void> {
    if (!this.currentSession?.restTimer?.isActive) return;

    this.currentSession.restTimer.isActive = false;

    await this.supabase
      .from('workout_sessions')
      .update({ 
        rest_timer: this.currentSession.restTimer,
        last_activity: new Date().toISOString()
      })
      .eq('id', this.currentSession.id);
  }

  /**
   * Complete workout session
   */
  async completeWorkoutSession(): Promise<void> {
    if (!this.currentSession) return;

    const { error } = await this.supabase
      .from('workout_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      })
      .eq('id', this.currentSession.id);

    if (error) {
      console.error('Failed to complete workout session:', error);
    }

    // Emit event
    this.emitEvent('workout_completed', {
      sessionId: this.currentSession.id
    }, this.currentSession.userId);

    // Update presence
    await this.updatePresence(this.currentSession.userId, 'online');

    this.currentSession = null;
  }

  /**
   * Subscribe to real-time events
   */
  on(eventType: RealtimeEventType, callback: EventCallback): void {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType)!.push(callback);
  }

  /**
   * Subscribe to presence updates
   */
  onPresence(callback: PresenceCallback): void {
    this.presenceCallbacks.push(callback);
  }

  /**
   * Emit real-time event
   */
  private emitEvent(type: RealtimeEventType, payload: any, userId: string): void {
    const event: RealtimeEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      userId,
      sessionId: this.currentSession?.id
    };

    const callbacks = this.eventCallbacks.get(type) || [];
    callbacks.forEach(callback => callback(event));
  }

  /**
   * Update user presence
   */
  private async updatePresence(
    userId: string, 
    status: UserPresence['status'],
    workoutId?: string
  ): Promise<void> {
    const presence: UserPresence = {
      userId,
      status,
      lastSeen: new Date().toISOString(),
      currentWorkout: workoutId,
      deviceInfo: {
        type: this.getDeviceType(),
        userAgent: navigator.userAgent
      }
    };

    const channel = this.channels.get('user');
    if (channel) {
      await channel.track(presence);
    }
  }

  /**
   * Handle presence sync
   */
  private handlePresenceSync(): void {
    const channel = this.channels.get('user');
    if (!channel) return;

    const state = channel.presenceState();
    const presence: UserPresence[] = Object.values(state)
      .flat()
      .filter((p: any) => p && p.userId) as UserPresence[];
    
    this.presenceCallbacks.forEach(callback => callback(presence));
  }

  /**
   * Handle user joining
   */
  private handlePresenceJoin(key: string, newPresences: UserPresence[]): void {
    console.log('[RealtimeManager] User joined:', key, newPresences);
  }

  /**
   * Handle user leaving
   */
  private handlePresenceLeave(key: string, leftPresences: UserPresence[]): void {
    console.log('[RealtimeManager] User left:', key, leftPresences);
  }

  /**
   * Handle workout session database changes
   */
  private handleWorkoutSessionChange(
    payload: RealtimePostgresChangesPayload<any>
  ): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        this.emitEvent('workout_started', newRecord, newRecord.user_id);
        break;
      case 'UPDATE':
        this.emitEvent('workout_updated', { 
          changes: newRecord, 
          previous: oldRecord 
        }, newRecord.user_id);
        break;
      case 'DELETE':
        this.emitEvent('workout_completed', oldRecord, oldRecord.user_id);
        break;
    }
  }

  /**
   * Start heartbeat to maintain connection
   */
  private startHeartbeat(userId: string): void {
    this.heartbeatInterval = setInterval(() => {
      this.updatePresence(
        userId, 
        this.currentSession ? 'working_out' : 'online',
        this.currentSession?.id
      );
    }, 30000); // Every 30 seconds
  }

  /**
   * Clean up connections
   */
  async disconnect(): Promise<void> {
    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Complete any active session
    if (this.currentSession) {
      await this.completeWorkoutSession();
    }

    // Unsubscribe from all channels
    for (const channel of this.channels.values()) {
      await this.supabase.removeChannel(channel);
    }
    this.channels.clear();

    // Clear callbacks
    this.eventCallbacks.clear();
    this.presenceCallbacks.length = 0;

    console.log('[RealtimeManager] Disconnected');
  }

  /**
   * Get current workout session
   */
  getCurrentSession(): WorkoutSession | null {
    return this.currentSession;
  }

  /**
   * Helper methods
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();