// Enhanced testing utilities and helpers
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement, ReactNode } from 'react';

// Mock data generators
export const mockUser = {
  id: 'user_test_123',
  email: 'test@example.com',
  subscriptionTier: 'free' as const,
  createdAt: new Date('2024-01-01'),
  lastActiveAt: new Date(),
  properties: {
    workoutsLastWeek: 3,
    lastWorkoutDate: '2025-01-12',
    currentStreak: 5,
    totalWorkouts: 25
  }
};

export const mockWorkout = {
  id: 'workout_test_123',
  userId: 'user_test_123',
  title: 'Test Workout',
  date: '2025-01-15',
  workoutType: 'strength' as const,
  exercises: [
    {
      name: 'bench press',
      sets: [
        { reps: 8, weight: 80, completed: true },
        { reps: 8, weight: 80, completed: true },
        { reps: 7, weight: 80, completed: true }
      ]
    },
    {
      name: 'squats',
      sets: [
        { reps: 10, weight: 100, completed: true },
        { reps: 10, weight: 100, completed: true },
        { reps: 9, weight: 100, completed: true }
      ]
    }
  ],
  duration: 45,
  completed: true,
  createdAt: new Date('2025-01-15')
};

export const mockFood = {
  id: 1,
  description: 'Chicken breast, skinless',
  brandName: null,
  caloriesPer100g: 165,
  proteinG: 31,
  carbsG: 0,
  fatG: 3.6,
  fiberG: 0,
  verified: true
};

export const mockNutritionLog = {
  id: 'nutrition_test_123',
  userId: 'user_test_123',
  date: '2025-01-15',
  mealType: 'lunch' as const,
  foodId: 1,
  quantityG: 150,
  calories: 248,
  proteinG: 46.5,
  carbsG: 0,
  fatG: 5.4
};

// Test environment setup
interface AllTheProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

function AllTheProviders({ children, queryClient }: AllTheProvidersProps) {
  const client = queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

// Custom render with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    queryClient?: QueryClient;
  }
) => {
  const { queryClient, ...renderOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

export { customRender as render };

// Mock API responses
export const mockApiResponse = <T>(data: T, delay = 0) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (message: string, status = 400, delay = 0) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      const error = new Error(message);
      (error as any).status = status;
      reject(error);
    }, delay);
  });
};

// Database mock utilities
export class MockDatabase {
  private data: Map<string, any[]> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    this.data.set('users', [mockUser]);
    this.data.set('workouts', [mockWorkout]);
    this.data.set('foods', [mockFood]);
    this.data.set('nutrition_logs', [mockNutritionLog]);
  }

  find<T>(table: string, predicate?: (item: T) => boolean): T[] {
    const tableData = this.data.get(table) || [];
    return predicate ? tableData.filter(predicate) : tableData;
  }

  findOne<T>(table: string, predicate: (item: T) => boolean): T | null {
    const results = this.find(table, predicate);
    return results[0] || null;
  }

  insert<T>(table: string, item: T): T {
    const tableData = this.data.get(table) || [];
    const newItem = { ...item, id: this.generateId(), createdAt: new Date() };
    tableData.push(newItem);
    this.data.set(table, tableData);
    return newItem;
  }

  update<T>(table: string, id: string, updates: Partial<T>): T | null {
    const tableData = this.data.get(table) || [];
    const index = tableData.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    const updated = { ...tableData[index], ...updates, updatedAt: new Date() };
    tableData[index] = updated;
    this.data.set(table, tableData);
    return updated;
  }

  delete(table: string, id: string): boolean {
    const tableData = this.data.get(table) || [];
    const index = tableData.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    tableData.splice(index, 1);
    this.data.set(table, tableData);
    return true;
  }

  clear() {
    this.data.clear();
    this.seed();
  }

  private generateId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global test database instance
export const testDb = new MockDatabase();

// Test utilities for async operations
export const waitFor = (ms: number) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const waitForElement = async (selector: string, timeout = 5000) => {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await waitFor(50);
  }
  
  throw new Error(`Element "${selector}" not found within ${timeout}ms`);
};

// Performance testing utilities
export class PerformanceTester {
  private measurements: Map<string, number[]> = new Map();

  measure<T>(name: string, operation: () => T | Promise<T>): T | Promise<T> {
    const start = performance.now();
    
    const result = operation();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        this.recordMeasurement(name, performance.now() - start);
      });
    } else {
      this.recordMeasurement(name, performance.now() - start);
      return result;
    }
  }

  private recordMeasurement(name: string, duration: number) {
    const measurements = this.measurements.get(name) || [];
    measurements.push(duration);
    this.measurements.set(name, measurements);
  }

  getStats(name: string) {
    const measurements = this.measurements.get(name) || [];
    if (measurements.length === 0) return null;

    const sorted = [...measurements].sort((a, b) => a - b);
    return {
      count: measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average: measurements.reduce((sum, val) => sum + val, 0) / measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  clear() {
    this.measurements.clear();
  }
}

// Accessibility testing helpers
export const checkAccessibility = async (container: HTMLElement) => {
  const issues = [];
  
  // Check for missing alt text
  const images = container.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.getAttribute('alt')) {
      issues.push(`Image at index ${index} missing alt attribute`);
    }
  });
  
  // Check for missing labels
  const inputs = container.querySelectorAll('input, textarea, select');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const label = container.querySelector(`label[for="${id}"]`);
    const ariaLabel = input.getAttribute('aria-label');
    
    if (!label && !ariaLabel) {
      issues.push(`Input at index ${index} missing label or aria-label`);
    }
  });
  
  // Check for missing headings
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    issues.push('No heading elements found');
  }
  
  return issues;
};

// Mock implementations for external services
export const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      })),
      single: jest.fn(() => Promise.resolve({
        data: mockUser,
        error: null
      }))
    })),
    insert: jest.fn(() => Promise.resolve({
      data: [mockWorkout],
      error: null
    })),
    update: jest.fn(() => Promise.resolve({
      data: [mockWorkout],
      error: null
    })),
    delete: jest.fn(() => Promise.resolve({
      data: null,
      error: null
    }))
  }))
};

export const mockAI = {
  claude: {
    chat: jest.fn(() => Promise.resolve({
      content: JSON.stringify(mockWorkout),
      usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 }
    }))
  },
  openai: {
    createEmbedding: jest.fn(() => Promise.resolve({
      embedding: new Array(1536).fill(0).map(() => Math.random()),
      usage: { prompt_tokens: 50, total_tokens: 50 }
    }))
  }
};

// Test data factories
export const createUser = (overrides: Partial<typeof mockUser> = {}) => ({
  ...mockUser,
  ...overrides,
  id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
});

export const createWorkout = (overrides: Partial<typeof mockWorkout> = {}) => ({
  ...mockWorkout,
  ...overrides,
  id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
});

export const createFood = (overrides: Partial<typeof mockFood> = {}) => ({
  ...mockFood,
  ...overrides,
  id: Math.floor(Math.random() * 10000) + 1000
});

export const createNutritionLog = (overrides: Partial<typeof mockNutritionLog> = {}) => ({
  ...mockNutritionLog,
  ...overrides,
  id: `nutrition_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
});

// Snapshot testing utilities
export const createSnapshotSerializer = () => ({
  test: (val: any) => val && typeof val === 'object' && val.$$typeof,
  serialize: (val: any) => {
    // Remove dynamic props that change between test runs
    const cleaned = JSON.parse(JSON.stringify(val, (key, value) => {
      if (key === 'id' && typeof value === 'string' && value.startsWith('test_')) {
        return '[DYNAMIC_ID]';
      }
      if (key === 'createdAt' || key === 'updatedAt') {
        return '[DYNAMIC_DATE]';
      }
      return value;
    }));
    
    return JSON.stringify(cleaned, null, 2);
  }
});

// Integration test helpers
export const setupIntegrationTest = () => {
  let cleanup: (() => void)[] = [];
  
  const addCleanup = (fn: () => void) => {
    cleanup.push(fn);
  };
  
  const teardown = () => {
    cleanup.forEach(fn => fn());
    cleanup = [];
    testDb.clear();
  };
  
  return { addCleanup, teardown };
};