import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/auth/user.json';

setup('authenticate', async ({ page }) => {
  // Go to the app
  await page.goto('/');

  // Check if we need to sign up or sign in
  const hasSignUp = await page.locator('[data-testid="sign-up-link"]').isVisible().catch(() => false);
  
  if (hasSignUp) {
    // Go to sign up page
    await page.click('[data-testid="sign-up-link"]');
    
    // Fill registration form
    await page.fill('[data-testid="email"]', 'playwright-test@example.com');
    await page.fill('[data-testid="password"]', 'PlaywrightTest123!');
    await page.fill('[data-testid="confirm-password"]', 'PlaywrightTest123!');
    
    // Submit registration
    await page.click('[data-testid="sign-up-button"]');
  } else {
    // Try to sign in with existing account
    await page.click('[data-testid="sign-in-link"]');
    
    // Fill sign in form
    await page.fill('[data-testid="email"]', 'playwright-test@example.com');
    await page.fill('[data-testid="password"]', 'PlaywrightTest123!');
    
    // Submit sign in
    await page.click('[data-testid="sign-in-button"]');
  }

  // Wait for successful authentication
  await page.waitForURL('/dashboard');
  
  // Verify we're authenticated
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});