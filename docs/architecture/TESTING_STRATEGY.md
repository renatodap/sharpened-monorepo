# Testing Strategy - Sharpened Monorepo

## Overview
Comprehensive testing strategy ensuring quality, reliability, and maintainability across all Sharpened applications.

## Testing Philosophy

### Testing Pyramid
```
         /\        E2E Tests (10%)
        /  \       - Critical user journeys
       /    \      - Payment flows
      /      \     
     /--------\    Integration Tests (30%)
    /          \   - API endpoints
   /            \  - Database operations
  /              \ - External services
 /                \
/------------------\ Unit Tests (60%)
                     - Business logic
                     - Utilities
                     - Components
```

## Test Types & Coverage Targets

### 1. Unit Tests
**Target Coverage: 80%**

#### What to Test
- Pure functions and utilities
- React components (isolated)
- Custom hooks
- Data transformations
- Validation logic

#### Example
```typescript
// apps/feelsharper/__tests__/unit/utils/calories.test.ts
describe('calculateDailyCalories', () => {
  it('should calculate BMR correctly for male', () => {
    const result = calculateDailyCalories({
      weight: 70,
      height: 175,
      age: 30,
      sex: 'male',
      activityLevel: 'moderate'
    });
    expect(result.bmr).toBe(1673);
    expect(result.tdee).toBe(2593);
  });
});
```

### 2. Integration Tests
**Target Coverage: Critical Paths 100%**

#### What to Test
- API route handlers
- Database operations
- Authentication flows
- Third-party integrations
- Service interactions

#### Example
```typescript
// apps/feelsharper/__tests__/integration/api/workouts.test.ts
describe('POST /api/workouts', () => {
  it('should create workout and update user stats', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: mockWorkoutData,
      headers: { authorization: 'Bearer token' }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toMatchObject({
      workout: expect.objectContaining({
        id: expect.any(String),
        exercises: expect.arrayContaining([])
      }),
      stats: expect.objectContaining({
        totalVolume: expect.any(Number)
      })
    });
  });
});
```

### 3. E2E Tests
**Target: Critical User Journeys**

#### What to Test
- User registration and onboarding
- Core feature workflows
- Payment processing
- Data persistence across sessions

#### Example
```typescript
// apps/feelsharper/__tests__/e2e/onboarding.spec.ts
test('new user onboarding flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Get Started');
  
  // Fill registration
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'SecurePass123!');
  await page.click('text=Sign Up');
  
  // Complete onboarding
  await expect(page).toHaveURL('/onboarding');
  await page.fill('[name=age]', '30');
  await page.selectOption('[name=goal]', 'muscle-gain');
  await page.click('text=Continue');
  
  // Verify dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

## Testing Infrastructure

### Tools & Libraries

#### Core Testing Stack
```json
{
  "devDependencies": {
    // Unit & Integration
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    
    // E2E
    "playwright": "^1.40.1",
    "@playwright/test": "^1.40.1",
    
    // Mocking
    "msw": "^2.0.11",
    "jest-mock-extended": "^3.0.5",
    
    // Coverage
    "@vitest/coverage-v8": "^1.1.0"
  }
}
```

### Test Data Management

#### Fixtures
```typescript
// packages/test-utils/fixtures/user.ts
export const createTestUser = (overrides = {}) => ({
  id: 'test-user-123',
  email: 'test@example.com',
  profile: {
    age: 30,
    weight: 70,
    height: 175,
    goal: 'maintenance'
  },
  ...overrides
});
```

#### Database Seeding
```typescript
// packages/test-utils/seed.ts
export async function seedTestDatabase() {
  await prisma.user.createMany({
    data: testUsers
  });
  await prisma.workout.createMany({
    data: testWorkouts
  });
}
```

## Implementation Plan

### Phase 1: Setup (Day 1)
- [ ] Configure Jest for monorepo
- [ ] Set up React Testing Library
- [ ] Configure Playwright
- [ ] Create test utilities package

### Phase 2: Unit Tests (Day 2-3)
- [ ] Test all utility functions
- [ ] Test React components
- [ ] Test custom hooks
- [ ] Test data validators

### Phase 3: Integration Tests (Day 4-5)
- [ ] Test API routes
- [ ] Test database operations
- [ ] Test authentication
- [ ] Test external services

### Phase 4: E2E Tests (Day 6-7)
- [ ] User registration flow
- [ ] Core feature workflows
- [ ] Payment flow (when ready)
- [ ] Cross-browser testing

## CI/CD Integration

### Pre-commit Hooks
```json
// .husky/pre-commit
{
  "hooks": {
    "pre-commit": "pnpm test:affected"
  }
}
```

### GitHub Actions
```yaml
# Already configured in .github/workflows/ci.yml
- Run on every PR
- Block merge if tests fail
- Generate coverage reports
- Upload artifacts
```

## Testing Guidelines

### Best Practices

#### DO ✅
- Write tests alongside feature development
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies
- Test edge cases and error states
- Keep tests isolated and independent

#### DON'T ❌
- Test implementation details
- Use arbitrary wait times
- Share state between tests
- Test third-party libraries
- Write brittle selectors
- Ignore flaky tests

### Test Organization
```
__tests__/
├── unit/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── lib/
├── integration/
│   ├── api/
│   ├── database/
│   └── services/
├── e2e/
│   ├── flows/
│   └── smoke/
└── fixtures/
    ├── data/
    └── mocks/
```

## Coverage Requirements

### Minimum Coverage by Type
| Type | Coverage | Required |
|------|----------|----------|
| Utilities | 95% | Yes |
| API Routes | 90% | Yes |
| Components | 80% | Yes |
| Hooks | 85% | Yes |
| Services | 90% | Yes |
| Pages | 70% | No |

### Coverage Reports
- Generated on every CI run
- Published to CodeCov
- Tracked in pull requests
- Monthly coverage trends

## Performance Testing

### Load Testing
```javascript
// k6 load test example
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function() {
  let response = http.get('https://feelsharper.com/api/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Monitoring & Alerts

### Test Metrics
- Test execution time
- Flaky test detection
- Coverage trends
- Failed test patterns

### Alerts
- Slack notification on test failures
- Daily coverage report
- Weekly test health summary

## Maintenance

### Weekly Tasks
- Review and fix flaky tests
- Update test data
- Review coverage gaps
- Optimize slow tests

### Monthly Tasks
- Audit test strategy
- Update testing docs
- Review testing tools
- Plan coverage improvements

---

*Last Updated: 2025-01-13*
*Coverage Target: 80% overall, 100% critical paths*
*Status: Ready for implementation*