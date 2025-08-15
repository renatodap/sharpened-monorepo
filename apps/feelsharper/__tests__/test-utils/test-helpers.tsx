import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

// Mock Supabase client with consistent types
const createMockSupabaseQueryBuilder = () => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    ilike: jest.fn(() => ({
      limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  })),
  insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
  update: jest.fn(() => Promise.resolve({ data: [], error: null })),
  delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
  upsert: jest.fn(() => Promise.resolve({ data: [], error: null })),
});

export const mockSupabase = {
  from: jest.fn(() => createMockSupabaseQueryBuilder()),
  auth: {
    getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
};

// Mock AI service
export const mockAI = {
  parseFood: jest.fn(() => Promise.resolve({
    foods: [],
    confidence: 0.8,
  })),
  parseWorkout: jest.fn(() => Promise.resolve({
    exercises: [],
    confidence: 0.8,
  })),
  claude: {
    generateResponse: jest.fn(() => Promise.resolve({
      content: 'Mock AI response',
      confidence: 0.9,
    })),
  },
};

// Test database utilities
export const testDb = {
  clear: jest.fn(),
  createUser: jest.fn((overrides = {}) => ({
    id: 'user_test_123',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
    ...overrides,
  })),
  createNutritionLog: jest.fn((overrides = {}) => ({
    id: `log_${Date.now()}`,
    userId: 'user_test_123',
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    foodId: 1,
    quantityG: 100,
    calories: 200,
    proteinG: 20,
    carbsG: 25,
    fatG: 8,
    fiberG: 3,
    ...overrides,
  })),
  createWorkout: jest.fn((overrides = {}) => ({
    id: `workout_${Date.now()}`,
    userId: 'user_test_123',
    date: new Date().toISOString().split('T')[0],
    name: 'Test Workout',
    duration: 30,
    exercises: [],
    ...overrides,
  })),
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const { queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  }), ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { userEvent };
export { renderWithProviders as render };