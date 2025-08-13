# Feel Sharper Testing Infrastructure

This directory contains comprehensive testing setup for the Feel Sharper application, including unit tests, integration tests, end-to-end tests, and performance benchmarks.

## Test Structure

```
__tests__/
├── components/          # Component unit tests
├── integration/         # Integration tests for complete user flows
├── lib/                # Utility and helper function tests
├── pages/              # Page component tests
├── performance/        # Performance benchmarking tests
└── README.md           # This file

e2e/                    # End-to-end tests using Playwright
├── auth.setup.ts       # Authentication setup for E2E tests
├── global-setup.ts     # Global test setup (test data, etc.)
├── global-teardown.ts  # Global cleanup after tests
├── *.e2e.ts           # E2E test suites
├── *.accessibility.ts  # Accessibility-focused E2E tests
├── *.performance.ts    # Performance-focused E2E tests
└── auth/              # Authentication state files
```

## Test Types and Commands

### Unit Tests
Test individual components and functions in isolation.

```bash
npm run test                    # Run all Jest tests
npm run test:unit              # Run only unit tests
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Run tests with coverage report
```

### Integration Tests
Test complete user flows with mocked external dependencies.

```bash
npm run test:integration       # Run integration tests only
```

Example integration tests:
- `workout-flow.test.ts` - Complete workout creation, editing, deletion
- `food-logging-flow.test.ts` - Food search, logging, nutrition tracking

### End-to-End Tests
Test the complete application in a real browser environment.

```bash
npm run test:e2e              # Run all E2E tests headlessly
npm run test:e2e:ui           # Run E2E tests with UI
npm run test:e2e:headed       # Run E2E tests in headed mode
npm run test:e2e:debug        # Run E2E tests in debug mode
```

Specialized E2E test suites:
```bash
npm run test:visual           # Visual regression tests
npm run test:accessibility    # Accessibility compliance tests
npm run test:performance:e2e  # Performance tests in browser
```

### Performance Tests
Benchmark application performance and identify bottlenecks.

```bash
npm run test:performance      # Run performance benchmark tests
```

Performance test categories:
- **AI Processing**: Workout parsing, food search, AI responses
- **Component Rendering**: List rendering, chart generation
- **Database Operations**: Query performance, data processing
- **Memory Management**: Memory leaks, garbage collection
- **Bundle Analysis**: Code splitting, asset optimization

### All Tests
Run the complete test suite:

```bash
npm run test:all              # Run unit, integration, and E2E tests
```

## Testing Best Practices

### 1. Test Organization
- **Unit tests**: Test individual functions and components
- **Integration tests**: Test feature workflows end-to-end
- **E2E tests**: Test user journeys in real browser
- **Performance tests**: Benchmark and monitor performance

### 2. Test Data Management
- Use factories and builders for test data creation
- Mock external APIs and services consistently
- Clean up test data between tests
- Use realistic data that matches production scenarios

### 3. Test Reliability
- Tests should be deterministic and repeatable
- Avoid hard-coded timeouts; use proper waiting strategies
- Mock time-dependent operations
- Handle async operations properly

### 4. Test Maintainability
- Use Page Object Model for E2E tests
- Create reusable test helpers and utilities
- Keep tests focused and well-named
- Update tests when functionality changes

## Test Configuration

### Jest Configuration
- **Config file**: `jest.config.js`
- **Setup**: `jest.setup.js`, `jest.env.js`
- **Coverage threshold**: 70% for all metrics
- **Timeout**: 30 seconds for performance tests

### Playwright Configuration
- **Config file**: `playwright.config.ts`
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Authentication**: Stored in `e2e/auth/user.json`

### Environment Variables
Test environment uses these mock values:
```env
NODE_ENV=test
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test_anon_key
ANTHROPIC_API_KEY=test_anthropic_key
OPENAI_API_KEY=test_openai_key
```

## Test Utilities and Helpers

### Shared Test Utilities
Located in `packages/test-utils/`:
- **test-helpers.ts**: Mock data, rendering utilities
- **e2e-helpers.ts**: E2E test helpers and page objects
- **performance-testing.ts**: Performance benchmarking tools
- **accessibility-testing.ts**: Accessibility testing utilities

### Mock Data
Pre-built mock objects for:
- User profiles and authentication
- Workout data and exercises
- Food database entries
- Nutrition logs and calculations
- Progress tracking data

### Custom Matchers
Extended Jest matchers for:
- Accessibility testing
- Performance assertions
- UI state verification
- Data validation

## Continuous Integration

### Pre-commit Hooks
```bash
npm run verify                 # Typecheck + lint + test + build
```

### CI Pipeline Tests
1. **Unit & Integration**: Fast feedback on core functionality
2. **E2E Core**: Critical user journeys
3. **Performance**: Regression detection
4. **Accessibility**: Compliance verification

### Test Reporting
- **HTML reports**: Generated for all test types
- **Coverage reports**: Available in `coverage/` directory  
- **Performance reports**: Detailed benchmarking results
- **Visual diff reports**: Screenshot comparisons

## Debugging Tests

### Unit/Integration Tests
```bash
npm run test:watch            # Watch mode for rapid feedback
node --inspect-brk node_modules/.bin/jest --runInBand
```

### E2E Tests
```bash
npm run test:e2e:debug        # Step through tests in browser
npm run test:e2e:headed       # See tests run in real browser
```

### Performance Tests
- Use Chrome DevTools for profiling
- Monitor memory usage in test output
- Analyze bundle size reports
- Review network timing data

## Writing New Tests

### Unit Test Example
```javascript
import { render, screen } from '@/test-utils/test-helpers';
import WorkoutCard from '@/components/workouts/WorkoutCard';

describe('WorkoutCard', () => {
  it('should display workout information', () => {
    const workout = createWorkout({ title: 'Test Workout' });
    render(<WorkoutCard workout={workout} />);
    
    expect(screen.getByText('Test Workout')).toBeInTheDocument();
  });
});
```

### Integration Test Example
```javascript
import { render, screen, waitFor } from '@/test-utils/test-helpers';
import { userEvent } from '@testing-library/user-event';

describe('Workout Flow', () => {
  it('should create and save workout', async () => {
    const user = userEvent.setup();
    render(<WorkoutPage />);
    
    await user.click(screen.getByRole('button', { name: /add workout/i }));
    await user.type(screen.getByLabelText(/workout/i), 'bench press 3x8');
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(screen.getByText('bench press')).toBeInTheDocument();
    });
  });
});
```

### E2E Test Example
```javascript
import { test, expect } from '@playwright/test';
import { E2ETestHelpers } from '@/test-utils/e2e-helpers';

test('should complete workout flow', async ({ page }) => {
  const helpers = new E2ETestHelpers(page);
  
  await helpers.navigateToWorkouts();
  await helpers.addWorkout('squats 4x10 at 100kg');
  
  await expect(page.locator('[data-testid="workout-card"]')).toBeVisible();
});
```

## Performance Monitoring

The test suite includes comprehensive performance monitoring:

### Metrics Tracked
- **Page load times**: Initial and subsequent loads
- **Component render times**: Individual component performance
- **API response times**: Database and external API calls
- **Memory usage**: Heap size and garbage collection
- **Bundle sizes**: JavaScript and CSS optimization

### Performance Thresholds
- Page loads: < 3 seconds
- Component renders: < 100ms
- API calls: < 500ms
- Memory growth: < 50MB per session
- Bundle sizes: JS < 500KB, CSS < 100KB

### Performance Regression Detection
Tests fail if performance degrades beyond acceptable thresholds, ensuring the app remains fast and responsive as new features are added.