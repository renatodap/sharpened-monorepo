import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock API handlers
export const handlers = [
  // Health check
  http.get('*/api/health', () => {
    return HttpResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  }),

  // Authentication
  http.post('*/api/auth/login', async ({ request }) => {
    const body = await request.json() as any;
    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        user: { id: '1', email: body.email },
        token: 'mock-jwt-token',
      });
    }
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('*/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // User profile
  http.get('*/api/user/profile', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        age: 30,
        weight: 70,
        height: 175,
      },
    });
  }),

  // Workouts
  http.get('*/api/workouts', () => {
    return HttpResponse.json({
      workouts: [
        {
          id: '1',
          name: 'Morning Workout',
          date: new Date().toISOString(),
          duration: 60,
          exercises: [],
        },
      ],
    });
  }),

  http.post('*/api/workouts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-workout-id',
      ...body,
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Foods
  http.get('*/api/foods/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return HttpResponse.json({ foods: [] });
    }

    return HttpResponse.json({
      foods: [
        {
          id: '1',
          name: 'Apple',
          nutrition: {
            calories: 95,
            protein: 0.5,
            carbs: 25,
            fat: 0.3,
          },
        },
      ],
    });
  }),
];

// Mock server setup
export const mockServer = setupServer(...handlers);

// Mock Supabase client
export const mockSupabase = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
      error: null,
    }),
    signIn: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn((table: string) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  })),
};

// Mock Next.js router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

// Mock window methods
export const mockWindow = {
  matchMedia: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  scrollTo: jest.fn(),
  alert: jest.fn(),
  confirm: jest.fn().mockReturnValue(true),
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  sessionStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
};

// Mock fetch for specific endpoints
export const mockFetch = (url: string, response: any, status = 200) => {
  global.fetch = jest.fn().mockImplementation((input) => {
    if (input === url || input.includes(url)) {
      return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
      });
    }
    return Promise.reject(new Error('Not found'));
  });
};

// Mock environment variables
export const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_KEY: 'test-service-key',
  ANTHROPIC_API_KEY: 'test-anthropic-key',
  OPENAI_API_KEY: 'test-openai-key',
};