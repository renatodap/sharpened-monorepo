// Caching strategies and utilities

// Cache storage types
export type CacheStorage = 'memory' | 'session' | 'local' | 'indexeddb';

// Cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Memory cache implementation
class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, value: T, ttl = 3600000): void {
    // Implement LRU if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Storage cache implementation
class StorageCache {
  private storage: Storage;
  private prefix: string;

  constructor(storage: Storage, prefix = 'cache_') {
    this.storage = storage;
    this.prefix = prefix;
  }

  set<T>(key: string, value: T, ttl = 3600000): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
    };
    
    try {
      this.storage.setItem(
        this.prefix + key,
        JSON.stringify(entry)
      );
    } catch (error) {
      console.error('Cache storage error:', error);
      // Clear old entries if storage is full
      this.cleanup();
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return null;
      
      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Check if expired
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.storage.removeItem(this.prefix + key);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.storage.removeItem(this.prefix + key);
  }

  clear(): void {
    const keys = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    keys.forEach(key => this.storage.removeItem(key));
  }

  cleanup(): void {
    const now = Date.now();
    const keys = [];
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => {
      try {
        const item = this.storage.getItem(key);
        if (item) {
          const entry: CacheEntry<any> = JSON.parse(item);
          if (now - entry.timestamp > entry.ttl) {
            this.storage.removeItem(key);
          }
        }
      } catch (error) {
        this.storage.removeItem(key);
      }
    });
  }
}

// Unified cache manager
export class CacheManager {
  private memoryCache: MemoryCache;
  private sessionCache: StorageCache | null;
  private localCache: StorageCache | null;

  constructor() {
    this.memoryCache = new MemoryCache();
    
    // Check if browser environment
    if (typeof window !== 'undefined') {
      this.sessionCache = new StorageCache(window.sessionStorage);
      this.localCache = new StorageCache(window.localStorage);
    } else {
      this.sessionCache = null;
      this.localCache = null;
    }
  }

  set<T>(
    key: string,
    value: T,
    options: {
      storage?: CacheStorage;
      ttl?: number;
    } = {}
  ): void {
    const { storage = 'memory', ttl = 3600000 } = options;

    switch (storage) {
      case 'memory':
        this.memoryCache.set(key, value, ttl);
        break;
      case 'session':
        this.sessionCache?.set(key, value, ttl);
        break;
      case 'local':
        this.localCache?.set(key, value, ttl);
        break;
      case 'indexeddb':
        // TODO: Implement IndexedDB cache
        break;
    }
  }

  get<T>(key: string, storage: CacheStorage = 'memory'): T | null {
    switch (storage) {
      case 'memory':
        return this.memoryCache.get<T>(key);
      case 'session':
        return this.sessionCache?.get<T>(key) || null;
      case 'local':
        return this.localCache?.get<T>(key) || null;
      case 'indexeddb':
        // TODO: Implement IndexedDB cache
        return null;
      default:
        return null;
    }
  }

  has(key: string, storage: CacheStorage = 'memory'): boolean {
    switch (storage) {
      case 'memory':
        return this.memoryCache.has(key);
      case 'session':
        return this.sessionCache?.has(key) || false;
      case 'local':
        return this.localCache?.has(key) || false;
      case 'indexeddb':
        // TODO: Implement IndexedDB cache
        return false;
      default:
        return false;
    }
  }

  delete(key: string, storage?: CacheStorage): void {
    if (storage) {
      switch (storage) {
        case 'memory':
          this.memoryCache.delete(key);
          break;
        case 'session':
          this.sessionCache?.delete(key);
          break;
        case 'local':
          this.localCache?.delete(key);
          break;
      }
    } else {
      // Delete from all storages
      this.memoryCache.delete(key);
      this.sessionCache?.delete(key);
      this.localCache?.delete(key);
    }
  }

  clear(storage?: CacheStorage): void {
    if (storage) {
      switch (storage) {
        case 'memory':
          this.memoryCache.clear();
          break;
        case 'session':
          this.sessionCache?.clear();
          break;
        case 'local':
          this.localCache?.clear();
          break;
      }
    } else {
      // Clear all storages
      this.memoryCache.clear();
      this.sessionCache?.clear();
      this.localCache?.clear();
    }
  }

  cleanup(): void {
    this.sessionCache?.cleanup();
    this.localCache?.cleanup();
  }
}

// Global cache instance
export const cache = new CacheManager();

// Cache decorators
export function Cacheable(options: {
  key?: string | ((args: any[]) => string);
  ttl?: number;
  storage?: CacheStorage;
} = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = typeof options.key === 'function'
        ? options.key(args)
        : options.key || `${target.constructor.name}_${propertyKey}_${JSON.stringify(args)}`;

      // Check cache
      const cached = cache.get(cacheKey, options.storage);
      if (cached !== null) {
        return cached;
      }

      // Execute method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      cache.set(cacheKey, result, {
        storage: options.storage,
        ttl: options.ttl,
      });

      return result;
    };

    return descriptor;
  };
}

// Cache invalidation
export function InvalidateCache(keys: string[] | ((args: any[]) => string[])) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      // Invalidate cache keys
      const keysToInvalidate = typeof keys === 'function' ? keys(args) : keys;
      keysToInvalidate.forEach(key => cache.delete(key));

      return result;
    };

    return descriptor;
  };
}

// React hook for caching
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    storage?: CacheStorage;
    staleWhileRevalidate?: boolean;
  } = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        // Check cache first
        const cached = cache.get<T>(key, options.storage);
        
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          
          // If stale while revalidate, fetch in background
          if (options.staleWhileRevalidate) {
            fetcher().then(fresh => {
              if (!cancelled) {
                cache.set(key, fresh, options);
                setData(fresh);
              }
            }).catch(console.error);
          }
          
          return;
        }

        // Fetch fresh data
        setLoading(true);
        const fresh = await fetcher();
        
        if (!cancelled) {
          cache.set(key, fresh, options);
          setData(fresh);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { data, loading, error };
}

// API response caching
export async function cachedFetch<T>(
  url: string,
  options: RequestInit & {
    cacheKey?: string;
    cacheTTL?: number;
    cacheStorage?: CacheStorage;
  } = {}
): Promise<T> {
  const { cacheKey = url, cacheTTL = 300000, cacheStorage = 'memory', ...fetchOptions } = options;

  // Check cache
  const cached = cache.get<T>(cacheKey, cacheStorage);
  if (cached !== null) {
    return cached;
  }

  // Fetch data
  const response = await fetch(url, fetchOptions);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();

  // Cache successful responses
  cache.set(cacheKey, data, { storage: cacheStorage, ttl: cacheTTL });

  return data;
}