# Sharpened Development Playbook

*Version 3.0 - January 13, 2025*

A comprehensive guide for developing, maintaining, and scaling the Sharpened platform. This playbook serves as the definitive reference for all development practices, standards, and procedures.

---

## Table of Contents

1. [Development Philosophy](#development-philosophy)
2. [Architecture Principles](#architecture-principles)
3. [Development Workflow](#development-workflow)
4. [Code Standards](#code-standards)
5. [Testing Strategy](#testing-strategy)
6. [Deployment Process](#deployment-process)
7. [Performance Guidelines](#performance-guidelines)
8. [Security Best Practices](#security-best-practices)
9. [Monitoring and Debugging](#monitoring-and-debugging)
10. [Team Collaboration](#team-collaboration)

---

## Development Philosophy

### Core Values

#### 1. User-Centric Development
Every feature starts with the user need, not the technical solution. We build for people who want to improve themselves, not for other developers.

**Implementation:**
- User story mapping before technical design
- Friction audits for all user flows
- Real user feedback drives iteration priority
- Performance budgets based on user expectations

#### 2. Evidence-Based Decisions
Technical decisions are backed by data, not opinions. We measure everything that matters and optimize based on evidence.

**Implementation:**
- A/B testing for significant UX changes
- Performance monitoring for all critical paths
- User behavior analytics guide feature priority
- Regular technical debt assessment with ROI analysis

#### 3. Sustainable Growth
Code today should enable faster development tomorrow. We invest in infrastructure that scales with the business.

**Implementation:**
- Shared packages reduce duplication
- Comprehensive documentation enables team growth
- Automated testing catches regressions early
- Monitoring prevents issues from becoming crises

#### 4. Craft Excellence
We take pride in our work and continuously improve our skills. Good enough isn't good enough for our users.

**Implementation:**
- Code reviews are learning opportunities
- Technical blog posts share knowledge
- Regular refactoring sessions improve code quality
- Performance optimization is everyone's responsibility

### Design Principles

#### Simplicity Over Cleverness
- Choose obvious solutions over clever ones
- Prefer composition over inheritance
- Write code for humans, optimize for computers later
- Reduce cognitive load in both UI and code

#### Performance by Default
- Fast by design, not by afterthought
- Progressive enhancement for all features
- Lazy loading and code splitting as standard practice
- Mobile-first performance considerations

#### Accessibility from Day One
- Semantic HTML as the foundation
- Keyboard navigation for all interactions
- Screen reader compatibility
- High contrast and readable typography

---

## Architecture Principles

### Monorepo Structure Philosophy

```
sharpened-monorepo/
├── apps/                    # Independent deployable applications
│   ├── website/            # Marketing site (Next.js)
│   ├── feelsharper/        # Fitness app (Next.js)
│   └── studysharper/       # Study app (Next.js)
├── packages/               # Shared business logic
│   ├── ai-core/           # AI providers and agents
│   ├── database/          # Database utilities and types
│   ├── automation/        # Workflow automation
│   ├── analytics/         # Business intelligence
│   ├── ui/               # Shared UI components
│   └── utils/            # Cross-cutting utilities
└── tools/                # Development and build tools
```

#### Package Boundaries
Each package has a clear, single responsibility:

- **ai-core**: AI provider abstractions, specialized agents
- **database**: Schema definitions, query utilities, migrations
- **automation**: Business process automation, workflows
- **analytics**: Metrics collection, reporting, dashboards
- **ui**: Reusable components, design system
- **utils**: Pure functions, type utilities, constants

### Data Architecture

#### Database Design Principles
1. **Normalization for Consistency**: Reduce redundancy, maintain integrity
2. **Denormalization for Performance**: Strategic duplication for read optimization
3. **Row-Level Security**: Database-enforced multi-tenancy
4. **Audit Trails**: Track all changes to critical data

#### API Design Principles
1. **RESTful Resources**: Predictable URL patterns
2. **JSON:API Compliance**: Consistent response formats
3. **GraphQL for Complex Queries**: Efficient data fetching
4. **Type Safety**: Full TypeScript coverage from database to frontend

### Frontend Architecture

#### Component Hierarchy
```typescript
// Page-level components
app/[route]/page.tsx        // Next.js pages
app/[route]/layout.tsx      // Layout components

// Feature components
components/[feature]/       // Feature-specific components
├── FeatureContainer.tsx    // Data fetching and state
├── FeaturePresentation.tsx // Pure presentation
└── FeatureUtils.ts         // Feature utilities

// Shared components
packages/ui/src/            // Cross-app components
├── primitives/             // Base components (Button, Input)
├── patterns/               # Common patterns (Modal, DataTable)
└── layouts/               # Layout components
```

#### State Management Strategy
- **Server State**: React Query for API data
- **Client State**: useState and useReducer for local state
- **Global State**: Context API for theme, user session
- **Form State**: React Hook Form for complex forms
- **URL State**: Next.js router for navigation state

---

## Development Workflow

### Git Workflow

#### Branch Strategy
```bash
main                    # Production-ready code
├── feature/feat-name   # Feature development
├── fix/bug-description # Bug fixes
├── docs/update-xyz     # Documentation updates
└── refactor/component  # Code refactoring
```

#### Commit Conventions
Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Examples
feat(workouts): add natural language parsing
fix(auth): resolve session timeout issue
docs(api): update authentication endpoints
refactor(ui): extract common button variants
test(parsers): add workout parsing edge cases
```

#### Pull Request Process
1. **Create Feature Branch**: `git checkout -b feature/workout-programs`
2. **Develop with Tests**: Write tests alongside feature code
3. **Self Review**: Review your own changes before requesting review
4. **Create PR**: Use PR template with clear description
5. **Code Review**: Address feedback constructively
6. **Automated Checks**: Ensure all CI checks pass
7. **Merge Strategy**: Squash and merge for clean history

### Development Environment Setup

#### Prerequisites
```bash
# Required tools
node >= 20.0.0
pnpm >= 9.0.0
git >= 2.40.0

# Recommended tools
vscode (with extensions)
docker (for local services)
```

#### Environment Configuration
```bash
# Clone repository
git clone https://github.com/your-org/sharpened-monorepo
cd sharpened-monorepo

# Install dependencies
pnpm install

# Copy environment template
cp apps/feelsharper/.env.example apps/feelsharper/.env.local

# Start development servers
pnpm dev                    # All apps
pnpm --filter feelsharper dev  # Single app
```

#### VS Code Setup
Essential extensions for the team:

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-playwright.playwright",
    "ms-vscode.vscode-json",
    "yoavbls.pretty-ts-errors"
  ]
}
```

### Local Development Workflow

#### Daily Development Cycle
1. **Start Fresh**: `git pull origin main && pnpm install`
2. **Create Branch**: `git checkout -b feature/your-feature`
3. **Run Tests**: `pnpm test` (ensure baseline passes)
4. **Develop Feature**: Code with tests
5. **Quality Check**: `pnpm lint && pnpm typecheck`
6. **Commit Changes**: Follow commit conventions
7. **Push Branch**: `git push origin feature/your-feature`

#### Feature Development Process
```bash
# 1. Plan the feature
- Write user story
- Design API if needed
- Identify affected components

# 2. Set up tests
- Create test files
- Write failing tests for new behavior
- Ensure existing tests still pass

# 3. Implement feature
- Write minimal code to pass tests
- Refactor for clarity and performance
- Add error handling and edge cases

# 4. Integration testing
- Test feature in development environment
- Verify with real user scenarios
- Check performance impact

# 5. Documentation
- Update relevant documentation
- Add code comments for complex logic
- Create or update API documentation
```

---

## Code Standards

### TypeScript Standards

#### Type Safety Rules
```typescript
// ✅ Good: Explicit types for public APIs
export interface WorkoutParseResult {
  title: string;
  exercises: Exercise[];
  duration_minutes?: number;
  notes?: string;
}

// ✅ Good: Union types for controlled values
type SubscriptionTier = 'free' | 'basic' | 'premium';

// ❌ Avoid: Any types in production code
const userData: any = response.data; // Bad

// ✅ Good: Proper error typing
class WorkoutParseError extends Error {
  constructor(
    message: string,
    public readonly input: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'WorkoutParseError';
  }
}
```

#### Naming Conventions
```typescript
// Variables and functions: camelCase
const userName = 'john_doe';
const parseWorkoutInput = (input: string) => { /* ... */ };

// Types and interfaces: PascalCase
interface UserProfile { /* ... */ }
type WorkoutType = 'strength' | 'cardio';

// Constants: SCREAMING_SNAKE_CASE
const MAX_WORKOUT_DURATION = 300; // minutes
const API_ENDPOINTS = {
  WORKOUTS: '/api/workouts',
  NUTRITION: '/api/nutrition'
} as const;

// Files and directories: kebab-case
workout-parser.ts
meal-template-creator.tsx
```

### React Standards

#### Component Structure
```typescript
// ✅ Good component structure
interface WorkoutFormProps {
  onSubmit: (workout: WorkoutInput) => void;
  initialData?: WorkoutInput;
  disabled?: boolean;
}

export function WorkoutForm({ onSubmit, initialData, disabled = false }: WorkoutFormProps) {
  // 1. Hooks at the top
  const [input, setInput] = useState(initialData?.description || '');
  const { mutate: parseWorkout, isPending } = useMutation({ /* ... */ });
  
  // 2. Event handlers
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    parseWorkout(input, {
      onSuccess: onSubmit
    });
  };
  
  // 3. Early returns for loading/error states
  if (disabled && isPending) {
    return <WorkoutFormSkeleton />;
  }
  
  // 4. Main render
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Component content */}
    </form>
  );
}
```

#### Props and State Patterns
```typescript
// ✅ Good: Discriminated unions for complex state
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: WorkoutData }
  | { status: 'error'; error: string };

// ✅ Good: Composition over prop drilling
const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within WorkoutProvider');
  }
  return context;
}

// ✅ Good: Custom hooks for reusable logic
export function useWorkoutParser() {
  return useMutation({
    mutationFn: async (input: string) => {
      const response = await fetch('/api/workouts/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      
      if (!response.ok) {
        throw new Error('Failed to parse workout');
      }
      
      return response.json();
    }
  });
}
```

### CSS and Styling Standards

#### Tailwind CSS Conventions
```tsx
// ✅ Good: Consistent spacing scale
<div className="p-6 space-y-4">
  <h1 className="text-2xl font-bold">Title</h1>
  <p className="text-text-secondary">Description</p>
</div>

// ✅ Good: Responsive design mobile-first
<div className="w-full sm:w-1/2 lg:w-1/3">
  <Card className="p-4 sm:p-6">
    Content
  </Card>
</div>

// ✅ Good: Custom CSS properties for reuse
:root {
  --nav-height: 64px;
  --content-max-width: 1200px;
  --border-radius-lg: 12px;
}

// ✅ Good: Component variants with class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-navy text-white hover:bg-navy/90",
        outline: "border border-border bg-transparent hover:bg-surface",
        ghost: "hover:bg-surface"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-8"
      }
    }
  }
);
```

---

## Testing Strategy

### Testing Philosophy

#### Testing Pyramid
```
E2E Tests (5%)        # Critical user journeys
├── Integration (20%) # Feature interactions  
├── Unit Tests (70%)  # Individual functions
└── Static (5%)       # TypeScript, ESLint
```

#### Test-Driven Development (TDD)
1. **Red**: Write failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

### Unit Testing

#### Testing Utilities and Helpers
```typescript
// test-utils/factories.ts
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user_123',
  email: 'test@example.com',
  subscriptionTier: 'free',
  createdAt: new Date('2024-01-01'),
  ...overrides
});

export const createMockWorkout = (overrides: Partial<Workout> = {}): Workout => ({
  id: 'workout_123',
  userId: 'user_123',
  title: 'Test Workout',
  date: '2024-01-15',
  exercises: [
    {
      name: 'bench press',
      sets: [{ reps: 8, weight: 80 }]
    }
  ],
  ...overrides
});
```

#### Component Testing Examples
```typescript
// __tests__/components/WorkoutForm.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import { WorkoutForm } from '@/components/workouts/WorkoutForm';

describe('WorkoutForm', () => {
  it('parses natural language workout input', async () => {
    const mockOnSubmit = jest.fn();
    render(<WorkoutForm onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/workout description/i);
    const submitButton = screen.getByRole('button', { name: /add workout/i });
    
    await userEvent.type(input, 'bench press 3x8 at 100kg');
    await userEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Bench Press Workout',
      exercises: [
        {
          name: 'bench press',
          sets: [
            { reps: 8, weight: 100 },
            { reps: 8, weight: 100 },
            { reps: 8, weight: 100 }
          ]
        }
      ]
    });
  });
  
  it('shows error for invalid input', async () => {
    render(<WorkoutForm onSubmit={jest.fn()} />);
    
    const input = screen.getByLabelText(/workout description/i);
    const submitButton = screen.getByRole('button', { name: /add workout/i });
    
    await userEvent.type(input, 'invalid workout data');
    await userEvent.click(submitButton);
    
    expect(screen.getByText(/unable to parse workout/i)).toBeInTheDocument();
  });
});
```

#### API Testing Examples
```typescript
// __tests__/api/workouts.test.ts
import { POST } from '@/app/api/workouts/route';
import { createMockRequest } from '@/test-utils/api-helpers';

describe('/api/workouts', () => {
  it('creates workout from parsed input', async () => {
    const request = createMockRequest('POST', {
      input: 'squats 4x5 at 120kg',
      date: '2024-01-15'
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.workout).toMatchObject({
      exercises: [
        {
          name: 'squats',
          sets: expect.arrayContaining([
            { reps: 5, weight: 120 }
          ])
        }
      ]
    });
  });
});
```

### Integration Testing

#### Page-Level Testing
```typescript
// __tests__/pages/workouts.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WorkoutsPage from '@/app/workouts/page';

// Mock API responses
jest.mock('@/lib/supabase/client', () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({
          data: [createMockWorkout(), createMockWorkout()],
          error: null
        }))
      }))
    }))
  }))
}));

describe('Workouts Page', () => {
  it('displays user workouts', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    });
    
    render(
      <QueryClientProvider client={queryClient}>
        <WorkoutsPage />
      </QueryClientProvider>
    );
    
    expect(await screen.findByText('Test Workout')).toBeInTheDocument();
    expect(screen.getAllByTestId('workout-card')).toHaveLength(2);
  });
});
```

### End-to-End Testing

#### Playwright E2E Tests
```typescript
// e2e/workout-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Workout Flow', () => {
  test('user can add and view workout', async ({ page }) => {
    // Login
    await page.goto('/auth/sign-in');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="sign-in-button"]');
    
    // Navigate to workouts
    await page.goto('/workouts');
    await expect(page.locator('h1')).toContainText('Workouts');
    
    // Add new workout
    await page.click('[data-testid="add-workout-button"]');
    await page.fill('[data-testid="workout-input"]', 'deadlift 5x3 at 140kg');
    await page.click('[data-testid="submit-workout"]');
    
    // Verify workout appears
    await expect(page.locator('[data-testid="workout-card"]')).toContainText('Deadlift');
    await expect(page.locator('[data-testid="workout-card"]')).toContainText('140kg');
  });
});
```

---

## Deployment Process

### Environment Strategy

#### Environment Tiers
1. **Development**: Local development with hot reload
2. **Preview**: Branch deployments for feature review
3. **Staging**: Production-like environment for final testing
4. **Production**: Live user-facing application

#### Configuration Management
```typescript
// lib/config.ts
const config = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    enableDebugLogs: true,
    aiProvider: 'mock' as const
  },
  preview: {
    apiUrl: 'https://preview-branch.vercel.app/api',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    enableDebugLogs: true,
    aiProvider: 'claude' as const
  },
  production: {
    apiUrl: 'https://feelsharper.app/api',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    enableDebugLogs: false,
    aiProvider: 'claude' as const
  }
} as const;

export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return config[env as keyof typeof config] || config.development;
};
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Type checking
        run: pnpm typecheck
      
      - name: Linting
        run: pnpm lint
      
      - name: Unit tests
        run: pnpm test
      
      - name: Build applications
        run: pnpm build
      
      - name: E2E tests
        run: pnpm test:e2e
        env:
          PLAYWRIGHT_BROWSERS_PATH: ${{ github.workspace }}/ms-playwright

  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Deploy to Vercel Preview
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Deploy to Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

#### Pre-deployment Checklist
```bash
# Automated checks (CI)
✅ All tests pass
✅ TypeScript compilation succeeds  
✅ ESLint issues resolved
✅ Build completes successfully
✅ E2E tests pass in staging

# Manual checks (before production)
✅ Database migrations tested
✅ Environment variables updated
✅ Feature flags configured
✅ Performance metrics baseline
✅ Rollback plan prepared
```

### Database Migrations

#### Migration Strategy
```sql
-- Migration: 0008_add_workout_programs.sql
-- Safe migration with backwards compatibility

-- Add new columns with defaults
ALTER TABLE workouts 
ADD COLUMN program_id UUID REFERENCES workout_programs(id),
ADD COLUMN week_number INTEGER DEFAULT 1,
ADD COLUMN day_number INTEGER DEFAULT 1;

-- Create index for performance
CREATE INDEX CONCURRENTLY idx_workouts_program 
ON workouts(user_id, program_id) 
WHERE program_id IS NOT NULL;

-- Update RLS policies
CREATE POLICY "workout_programs_owner_policy" 
ON workout_programs FOR ALL 
USING (user_id = auth.uid());
```

#### Migration Deployment Process
1. **Review Migration**: SQL review for safety and performance
2. **Test on Staging**: Verify migration on production-like data
3. **Backup Production**: Create point-in-time backup
4. **Run Migration**: Execute during low-traffic window
5. **Verify Data**: Confirm migration completed successfully
6. **Monitor Performance**: Watch for query performance issues

---

## Performance Guidelines

### Performance Budgets

#### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Contentful Paint (FCP)**: < 1.8 seconds

#### Bundle Size Targets
```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "500kb",
      "maximumError": "1mb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "2kb",
      "maximumError": "4kb"
    }
  ]
}
```

### Optimization Strategies

#### Code Splitting
```typescript
// Page-level splitting (automatic with Next.js)
const WorkoutDashboard = lazy(() => import('@/components/WorkoutDashboard'));

// Component-level splitting
const HeavyChart = lazy(() => import('@/components/charts/HeavyChart'));

// Conditional loading for premium features
const PremiumInsights = lazy(() => 
  import('@/components/PremiumInsights').then(module => ({
    default: module.PremiumInsights
  }))
);

// Usage with suspense
<Suspense fallback={<ChartSkeleton />}>
  <HeavyChart data={chartData} />
</Suspense>
```

#### Image Optimization
```typescript
// Next.js Image with optimization
import Image from 'next/image';

<Image
  src="/progress-chart.png"
  alt="User progress chart"
  width={800}
  height={400}
  priority // Above fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Responsive images for different viewports
<Image
  src="/hero-desktop.jpg"
  alt="Hero image"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  width={1200}
  height={600}
/>
```

#### API Optimization
```typescript
// React Query with optimizations
const useWorkouts = (userId: string) => {
  return useQuery({
    queryKey: ['workouts', userId],
    queryFn: () => fetchWorkouts(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    select: (data) => data.workouts, // Transform data
  });
};

// Pagination for large datasets
const useWorkoutsPaginated = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ['workouts-paginated', userId],
    queryFn: ({ pageParam = 0 }) => 
      fetchWorkouts(userId, { offset: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length * 20 : undefined,
  });
};
```

### Performance Monitoring

#### Core Metrics Collection
```typescript
// lib/performance.ts
export const trackWebVital = (metric: any) => {
  // Track to analytics service
  if (typeof window !== 'undefined') {
    window.gtag?.('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.value),
      non_interaction: true,
    });
  }
};

// _app.tsx
import { reportWebVitals } from 'next/web-vitals';

export { reportWebVitals };

export function reportWebVitals(metric: NextWebVitalsMetric) {
  trackWebVital(metric);
}
```

---

## Security Best Practices

### Authentication and Authorization

#### Row-Level Security (RLS)
```sql
-- Enable RLS on all user data tables
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_weight ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "users_own_workouts" ON workouts
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users_own_nutrition" ON nutrition_logs  
FOR ALL USING (user_id = auth.uid());

-- Admin access policy
CREATE POLICY "admin_full_access" ON workouts
FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin' OR
  user_id = auth.uid()
);
```

#### API Security
```typescript
// Middleware for API protection
export async function middleware(request: NextRequest) {
  // CSRF protection
  if (request.method === 'POST') {
    const token = request.headers.get('x-csrf-token');
    if (!token || !validateCSRFToken(token)) {
      return new Response('CSRF token missing or invalid', { status: 403 });
    }
  }
  
  // Rate limiting
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = await rateLimit(ip);
  if (!rateLimitResult.success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  return NextResponse.next();
}
```

### Input Validation

#### API Input Validation
```typescript
// lib/validation.ts
import { z } from 'zod';

export const WorkoutInputSchema = z.object({
  input: z.string().min(1).max(1000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).optional()
});

// API route validation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedInput = WorkoutInputSchema.parse(body);
    
    // Process validated input
    const result = await processWorkout(validatedInput);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

#### XSS Prevention
```typescript
// Sanitize user input before display
import DOMPurify from 'isomorphic-dompurify';

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
};

// Use in components
const UserNotes = ({ notes }: { notes: string }) => {
  const sanitizedNotes = sanitizeHTML(notes);
  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedNotes }} />
  );
};
```

### Data Protection

#### Environment Variables Security
```bash
# .env.example - Template for required variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key

# .env.local - Actual values (never commit)
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
```

#### Secrets Management
```typescript
// lib/secrets.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'ANTHROPIC_API_KEY'
] as const;

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(
    key => !process.env[key]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Call in app initialization
validateEnvironment();
```

---

## Monitoring and Debugging

### Error Tracking

#### Error Boundaries
```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report to monitoring service
    if (typeof window !== 'undefined') {
      this.reportError(error, errorInfo);
    }
  }
  
  private reportError(error: Error, errorInfo: any) {
    // Integration with error reporting service
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })
    }).catch(console.error);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-text-secondary">
            We've been notified and are working on a fix.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-navy text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

#### API Error Handling
```typescript
// lib/api-client.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const apiClient = {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'Request failed',
        response.status,
        errorData.code
      );
    }
    
    return response.json();
  }
};
```

### Performance Monitoring

#### Custom Performance Metrics
```typescript
// lib/performance-monitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }
  
  measureAsyncOperation<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    return operation()
      .then(result => {
        this.recordMetric(name, performance.now() - start, 'success');
        return result;
      })
      .catch(error => {
        this.recordMetric(name, performance.now() - start, 'error');
        throw error;
      });
  }
  
  private recordMetric(name: string, duration: number, status: string) {
    // Send to analytics
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'performance_metric', {
        metric_name: name,
        duration: Math.round(duration),
        status
      });
    }
  }
}

// Usage in components
const monitor = PerformanceMonitor.getInstance();

const useWorkoutParser = () => {
  return useMutation({
    mutationFn: (input: string) => 
      monitor.measureAsyncOperation(
        'workout_parse',
        () => parseWorkout(input)
      )
  });
};
```

### Logging Strategy

#### Structured Logging
```typescript
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  requestId?: string;
  feature?: string;
  [key: string]: any;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === 'production') {
      return ['warn', 'error'].includes(level);
    }
    return true;
  }
  
  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.shouldLog(level)) return;
    
    const logEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...context
    };
    
    console[level](JSON.stringify(logEntry));
  }
  
  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }
  
  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }
  
  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }
  
  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
}

export const logger = new Logger();
```

---

## Team Collaboration

### Code Review Standards

#### Review Checklist
- [ ] **Functionality**: Does the code work as intended?
- [ ] **Tests**: Are there adequate tests for the changes?
- [ ] **Performance**: Any performance implications?
- [ ] **Security**: Are there security considerations?
- [ ] **Documentation**: Is documentation updated?
- [ ] **Accessibility**: Are accessibility standards met?
- [ ] **Design System**: Does it follow design patterns?

#### Review Comments Guidelines
```typescript
// ✅ Good: Specific, actionable feedback
// Consider extracting this logic into a custom hook for reusability
const workoutData = useMemo(() => {
  return processWorkoutData(rawData);
}, [rawData]);

// ✅ Good: Explain the "why" behind suggestions  
// This could cause a memory leak if the component unmounts
// before the API call completes. Consider using AbortController.

// ✅ Good: Offer alternatives
// Instead of inline styles, we could use a CSS class or 
// Tailwind utilities for better maintainability.

// ❌ Avoid: Vague or unhelpful comments
// "This doesn't look right"
// "Change this"
```

### Documentation Standards

#### Component Documentation
```typescript
/**
 * WorkoutForm handles user input for creating new workouts.
 * 
 * Features:
 * - Natural language parsing of workout descriptions
 * - Real-time validation and feedback
 * - Integration with workout programs
 * 
 * @example
 * ```tsx
 * <WorkoutForm
 *   onSubmit={handleWorkoutCreated}
 *   initialData={existingWorkout}
 *   programId="program_123"
 * />
 * ```
 */
export interface WorkoutFormProps {
  /** Called when a workout is successfully created */
  onSubmit: (workout: WorkoutInput) => void;
  /** Pre-populate form with existing workout data */
  initialData?: WorkoutInput;
  /** Associate workout with a specific program */
  programId?: string;
  /** Disable form during loading states */
  disabled?: boolean;
}

export function WorkoutForm(props: WorkoutFormProps) {
  // Implementation
}
```

#### API Documentation
```typescript
/**
 * POST /api/workouts/parse
 * 
 * Parses natural language workout input into structured data.
 * Uses AI to extract exercises, sets, reps, and weights.
 * 
 * @body {string} input - Natural language workout description
 * @body {string} date - ISO date string (YYYY-MM-DD)
 * @body {string} [notes] - Optional workout notes
 * 
 * @returns {WorkoutParseResult} Structured workout data
 * 
 * @throws {400} Invalid input format
 * @throws {429} Rate limit exceeded
 * @throws {500} AI parsing failed
 * 
 * @example
 * ```typescript
 * const response = await fetch('/api/workouts/parse', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     input: 'bench press 3x8 at 100kg',
 *     date: '2024-01-15'
 *   })
 * });
 * ```
 */
export async function POST(request: Request) {
  // Implementation
}
```

### Knowledge Sharing

#### Technical Decision Records (TDRs)
```markdown
# TDR-001: AI Provider Selection

## Status
Accepted

## Context
Need to choose AI provider for natural language processing features.

## Decision
Use Anthropic Claude as primary AI provider with OpenAI as fallback.

## Rationale
- Claude excels at structured output generation
- Better instruction following for workout parsing
- More predictable costs than GPT-4
- OpenAI provides backup and embeddings

## Consequences
- Need to implement provider abstraction layer
- Monitor both providers for performance and costs
- May need to adjust prompts for each provider
```

#### Weekly Technical Syncs
1. **Demo completed features** (10 minutes)
2. **Technical challenges discussion** (15 minutes)
3. **Architecture decisions** (10 minutes)
4. **Next week priorities** (10 minutes)
5. **Learning and knowledge sharing** (15 minutes)

---

## Conclusion

This Development Playbook serves as the foundation for building and maintaining the Sharpened platform. It evolves with our needs and should be updated regularly as we learn and grow.

Remember: The goal is to build software that genuinely helps people improve their lives. Every technical decision should ultimately serve that mission.

---

*Last updated: January 13, 2025 | Next review: April 2025*

Questions or suggestions? Open an issue or discussion in the repository.