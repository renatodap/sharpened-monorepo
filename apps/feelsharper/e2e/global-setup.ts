import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL, headless } = config.projects[0].use;
  
  console.log('🚀 Starting E2E test setup...');

  // Start browser for authentication setup
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the application
    await page.goto(baseURL || 'http://localhost:3000');

    // Create test user and authenticate
    console.log('Creating test user and authenticating...');
    
    // Go to sign up page
    await page.goto('/auth/sign-up');
    
    // Fill registration form
    await page.fill('[data-testid="email"]', 'e2e-test@example.com');
    await page.fill('[data-testid="password"]', 'testpassword123');
    await page.fill('[data-testid="confirm-password"]', 'testpassword123');
    
    // Submit registration
    await page.click('[data-testid="sign-up-button"]');
    
    // Wait for successful registration and redirect
    await page.waitForURL('/dashboard');
    
    // Verify we're logged in
    await page.waitForSelector('[data-testid="user-menu"]');
    
    // Save authentication state
    await context.storageState({ path: 'e2e/auth/user.json' });
    
    console.log('✅ Authentication setup complete');

    // Setup test data
    console.log('Setting up test data...');
    
    // Create some test workouts
    await page.goto('/workouts');
    await page.click('[data-testid="add-workout-button"]');
    await page.fill('[data-testid="workout-input"]', 'bench press 3x8 at 100kg');
    await page.click('[data-testid="submit-workout"]');
    await page.waitForSelector('[data-testid="workout-card"]');

    // Create another workout
    await page.click('[data-testid="add-workout-button"]');
    await page.fill('[data-testid="workout-input"]', 'squats 4x10 at 80kg, deadlift 1x5 at 120kg');
    await page.click('[data-testid="submit-workout"]');
    await page.waitForSelector('[data-testid="workout-card"]');

    // Log some food
    await page.goto('/food');
    await page.click('[data-testid="add-food-button"]');
    await page.fill('[data-testid="food-search"]', 'chicken');
    await page.waitForSelector('[data-testid="food-result"]');
    await page.click('[data-testid="food-result"]:first-child');
    await page.fill('[data-testid="food-amount"]', '150');
    await page.selectOption('[data-testid="meal-type"]', 'lunch');
    await page.click('[data-testid="log-food"]');

    // Log weight
    await page.goto('/weight');
    await page.fill('[data-testid="weight-input"]', '70');
    await page.click('[data-testid="save-weight"]');

    console.log('✅ Test data setup complete');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('🎯 E2E test setup completed successfully');
}

export default globalSetup;