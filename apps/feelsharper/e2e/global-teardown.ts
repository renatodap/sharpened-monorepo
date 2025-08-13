import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test cleanup...');

  const { baseURL, headless } = config.projects[0].use;
  
  // Start browser for cleanup
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    storageState: 'e2e/auth/user.json'
  });
  const page = await context.newPage();

  try {
    // Navigate to the application
    await page.goto(baseURL || 'http://localhost:3000');

    // Call cleanup API endpoints
    console.log('Cleaning up test data...');
    
    // Delete test user data via API
    await page.goto('/api/test/cleanup/e2e-test@example.com');
    
    console.log('✅ Test data cleanup complete');

    // Optionally sign out
    await page.goto('/dashboard');
    
    try {
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="sign-out"]');
      await page.waitForURL('/');
      console.log('✅ User signed out');
    } catch (error) {
      console.log('⚠️ Sign out failed (user may already be signed out)');
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    // Don't throw - cleanup failure shouldn't fail the tests
  } finally {
    await context.close();
    await browser.close();
  }

  // Clean up auth files
  try {
    const fs = require('fs');
    if (fs.existsSync('e2e/auth/user.json')) {
      fs.unlinkSync('e2e/auth/user.json');
      console.log('✅ Auth state cleaned up');
    }
  } catch (error) {
    console.log('⚠️ Auth cleanup failed:', error);
  }

  console.log('🎯 E2E test cleanup completed');
}

export default globalTeardown;