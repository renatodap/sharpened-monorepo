/**
 * OfflineDataManager - Handles offline data storage and sync
 * Maps to PRD: Offline-First Architecture (Technical Requirement #2)
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema
interface FeelSharperDB extends DBSchema {
  workouts: {
    key: string;
    value: {
      id: string;
      name: string;
      exercises: any[];
      createdAt: Date;
      syncStatus: 'pending' | 'synced' | 'error';
      userId: string;
    };
  };
  meals: {
    key: string;
    value: {
      id: string;
      mealType: string;
      foods: any[];
      calories: number;
      createdAt: Date;
      syncStatus: 'pending' | 'synced' | 'error';
      userId: string;
    };
  };
  bodyWeight: {
    key: string;
    value: {
      id: string;
      weight: number;
      unit: 'kg' | 'lbs';
      recordedAt: Date;
      syncStatus: 'pending' | 'synced' | 'error';
      userId: string;
    };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: 'workout' | 'meal' | 'weight';
      data: any;
      timestamp: Date;
      retryCount: number;
      lastError?: string;
    };
  };
}

class OfflineDataManager {
  private db: IDBPDatabase<FeelSharperDB> | null = null;
  private readonly DB_NAME = 'feelsharper-offline';
  private readonly DB_VERSION = 1;
  private syncInProgress = false;

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<FeelSharperDB>(this.DB_NAME, this.DB_VERSION, {
        upgrade(db) {
          // Create object stores
          if (!db.objectStoreNames.contains('workouts')) {
            const workoutStore = db.createObjectStore('workouts', { keyPath: 'id' });
            workoutStore.createIndex('syncStatus', 'syncStatus');
            workoutStore.createIndex('userId', 'userId');
            workoutStore.createIndex('createdAt', 'createdAt');
          }

          if (!db.objectStoreNames.contains('meals')) {
            const mealStore = db.createObjectStore('meals', { keyPath: 'id' });
            mealStore.createIndex('syncStatus', 'syncStatus');
            mealStore.createIndex('userId', 'userId');
            mealStore.createIndex('createdAt', 'createdAt');
          }

          if (!db.objectStoreNames.contains('bodyWeight')) {
            const weightStore = db.createObjectStore('bodyWeight', { keyPath: 'id' });
            weightStore.createIndex('syncStatus', 'syncStatus');
            weightStore.createIndex('userId', 'userId');
            weightStore.createIndex('recordedAt', 'recordedAt');
          }

          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
            syncStore.createIndex('type', 'type');
            syncStore.createIndex('timestamp', 'timestamp');
          }
        },
      });

      console.log('[OfflineDataManager] IndexedDB initialized');
      
      // Start background sync if online
      if (navigator.onLine) {
        this.startBackgroundSync();
      }

      // Listen for online/offline events
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    } catch (error) {
      console.error('[OfflineDataManager] Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  // Save workout locally
  async saveWorkout(workout: any, userId: string): Promise<void> {
    await this.ensureDB();
    
    const workoutData = {
      ...workout,
      id: workout.id || this.generateId(),
      userId,
      createdAt: new Date(),
      syncStatus: navigator.onLine ? 'pending' : 'pending' as const,
    };

    await this.db!.put('workouts', workoutData);
    
    if (navigator.onLine) {
      await this.addToSyncQueue('workout', workoutData);
    }
  }

  // Save meal locally
  async saveMeal(meal: any, userId: string): Promise<void> {
    await this.ensureDB();
    
    const mealData = {
      ...meal,
      id: meal.id || this.generateId(),
      userId,
      createdAt: new Date(),
      syncStatus: navigator.onLine ? 'pending' : 'pending' as const,
    };

    await this.db!.put('meals', mealData);
    
    if (navigator.onLine) {
      await this.addToSyncQueue('meal', mealData);
    }
  }

  // Save body weight locally
  async saveBodyWeight(weight: number, unit: 'kg' | 'lbs', userId: string): Promise<void> {
    await this.ensureDB();
    
    const weightData = {
      id: this.generateId(),
      weight,
      unit,
      userId,
      recordedAt: new Date(),
      syncStatus: 'pending' as const,
    };

    await this.db!.put('bodyWeight', weightData);
    
    if (navigator.onLine) {
      await this.addToSyncQueue('weight', weightData);
    }
  }

  // Get pending items for sync
  async getPendingItems(
    storeName: 'workouts' | 'meals' | 'bodyWeight'
  ): Promise<any[]> {
    await this.ensureDB();
    
    const tx = this.db!.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    
    if ('syncStatus' in store.indexNames) {
      const index = store.index('syncStatus' as any);
      return await index.getAll('pending');
    }
    
    return [];
  }

  // Add item to sync queue
  private async addToSyncQueue(type: 'workout' | 'meal' | 'weight', data: any): Promise<void> {
    await this.ensureDB();
    
    const queueItem = {
      id: this.generateId(),
      type,
      data,
      timestamp: new Date(),
      retryCount: 0,
    };

    await this.db!.put('syncQueue', queueItem);
    
    // Trigger sync if not already in progress
    if (!this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  // Process sync queue
  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine) return;
    
    this.syncInProgress = true;
    await this.ensureDB();

    try {
      const items = await this.db!.getAll('syncQueue');
      
      for (const item of items) {
        try {
          await this.syncItem(item);
          await this.db!.delete('syncQueue', item.id);
        } catch (error) {
          console.error(`[OfflineDataManager] Failed to sync item ${item.id}:`, error);
          
          // Update retry count
          item.retryCount++;
          item.lastError = error instanceof Error ? error.message : 'Unknown error';
          
          if (item.retryCount < 3) {
            await this.db!.put('syncQueue', item);
          } else {
            // Mark as error after 3 retries
            await this.markAsSyncError(item.type, item.data.id);
            await this.db!.delete('syncQueue', item.id);
          }
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync individual item
  private async syncItem(item: FeelSharperDB['syncQueue']['value']): Promise<void> {
    const endpoint = this.getEndpoint(item.type);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
    }

    // Mark as synced in local store
    await this.markAsSynced(item.type, item.data.id);
  }

  // Mark item as synced
  private async markAsSynced(type: string, id: string): Promise<void> {
    await this.ensureDB();
    
    const storeName = this.getStoreName(type);
    if (storeName === 'syncQueue') return;
    
    const tx = this.db!.transaction(storeName as any, 'readwrite');
    const store = tx.objectStore(storeName as any);
    const item = await store.get(id);
    
    if (item && 'syncStatus' in item) {
      (item as any).syncStatus = 'synced';
      await store.put(item);
    }
  }

  // Mark item as sync error
  private async markAsSyncError(type: string, id: string): Promise<void> {
    await this.ensureDB();
    
    const storeName = this.getStoreName(type);
    if (storeName === 'syncQueue') return;
    
    const tx = this.db!.transaction(storeName as any, 'readwrite');
    const store = tx.objectStore(storeName as any);
    const item = await store.get(id);
    
    if (item && 'syncStatus' in item) {
      (item as any).syncStatus = 'error';
      await store.put(item);
    }
  }

  // Handle online event
  private async handleOnline(): Promise<void> {
    console.log('[OfflineDataManager] Back online, starting sync');
    await this.processSyncQueue();
    
    // Register background sync if available
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync?.register('data-sync');
      } catch (error) {
        console.log('[OfflineDataManager] Background sync not available:', error);
      }
    }
  }

  // Handle offline event
  private handleOffline(): void {
    console.log('[OfflineDataManager] Going offline');
    this.syncInProgress = false;
  }

  // Start background sync
  private startBackgroundSync(): void {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.processSyncQueue();
      }
    }, 5 * 60 * 1000);
  }

  // Helper methods
  private async ensureDB(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEndpoint(type: string): string {
    const endpoints: Record<string, string> = {
      workout: '/api/workouts',
      meal: '/api/nutrition/diary',
      weight: '/api/body-weight',
    };
    return endpoints[type] || '/api/sync';
  }

  private getStoreName(type: string): 'workouts' | 'meals' | 'bodyWeight' | 'syncQueue' {
    const storeMap: Record<string, 'workouts' | 'meals' | 'bodyWeight' | 'syncQueue'> = {
      workout: 'workouts',
      meal: 'meals',
      weight: 'bodyWeight',
    };
    return storeMap[type] || 'syncQueue';
  }

  // Get recent items from cache
  async getRecentWorkouts(userId: string, limit = 10): Promise<any[]> {
    await this.ensureDB();
    
    const tx = this.db!.transaction('workouts', 'readonly');
    const store = tx.objectStore('workouts');
    const index = store.index('userId');
    const items = await index.getAll(IDBKeyRange.only(userId));
    
    return items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getRecentMeals(userId: string, limit = 10): Promise<any[]> {
    await this.ensureDB();
    
    const tx = this.db!.transaction('meals', 'readonly');
    const store = tx.objectStore('meals');
    const index = store.index('userId');
    const items = await index.getAll(IDBKeyRange.only(userId));
    
    return items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Clear all local data
  async clearAllData(): Promise<void> {
    await this.ensureDB();
    
    const stores: ('workouts' | 'meals' | 'bodyWeight' | 'syncQueue')[] = ['workouts', 'meals', 'bodyWeight', 'syncQueue'];
    
    for (const store of stores) {
      await this.db!.clear(store);
    }
    
    console.log('[OfflineDataManager] All local data cleared');
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    pendingWorkouts: number;
    pendingMeals: number;
    pendingWeights: number;
    queueSize: number;
  }> {
    await this.ensureDB();
    
    const pendingWorkouts = (await this.getPendingItems('workouts')).length;
    const pendingMeals = (await this.getPendingItems('meals')).length;
    const pendingWeights = (await this.getPendingItems('bodyWeight')).length;
    const queueSize = await this.db!.count('syncQueue');
    
    return {
      pendingWorkouts,
      pendingMeals,
      pendingWeights,
      queueSize,
    };
  }
}

// Export singleton instance
export const offlineDataManager = new OfflineDataManager();

// Initialize on import
if (typeof window !== 'undefined') {
  offlineDataManager.init().catch(console.error);
}