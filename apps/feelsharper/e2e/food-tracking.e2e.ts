import { test, expect } from '@playwright/test';
import { E2ETestHelpers, FoodPageObject } from '@/test-utils/e2e-helpers';

test.describe('Food Tracking E2E', () => {
  let helpers: E2ETestHelpers;
  let foodPage: FoodPageObject;

  test.beforeEach(async ({ page }) => {
    helpers = new E2ETestHelpers(page);
    foodPage = new FoodPageObject(page);
    await helpers.navigateToFood();
  });

  test('should complete full food logging and nutrition tracking flow', async ({ page }) => {
    // Log breakfast foods
    await foodPage.logFood('oatmeal', 50, 'breakfast');
    await foodPage.logFood('banana', 120, 'breakfast');
    await foodPage.logFood('milk', 200, 'breakfast');

    // Verify breakfast totals
    const breakfastCalories = await foodPage.getTotalCalories();
    expect(breakfastCalories).toBeGreaterThan(300);

    // Log lunch
    await foodPage.logFood('chicken breast', 150, 'lunch');
    await foodPage.logFood('rice', 100, 'lunch');
    await foodPage.logFood('broccoli', 80, 'lunch');

    // Check daily totals updated
    const totalCalories = await foodPage.getTotalCalories();
    expect(totalCalories).toBeGreaterThan(600);

    // Verify nutrition breakdown
    await expect(page.locator('[data-testid="daily-protein"]')).toContainText(/\d+g/);
    await expect(page.locator('[data-testid="daily-carbs"]')).toContainText(/\d+g/);
    await expect(page.locator('[data-testid="daily-fat"]')).toContainText(/\d+g/);

    // Check progress towards goals
    const caloriesProgress = page.locator('[data-testid="calories-progress"]');
    await expect(caloriesProgress).toHaveAttribute('value');
    
    const progressValue = await caloriesProgress.getAttribute('value');
    expect(parseInt(progressValue || '0')).toBeGreaterThan(0);
  });

  test('should handle food search with various inputs', async ({ page }) => {
    const searchTerms = [
      'chicken',
      'broccoli',
      'quinoa',
      'avocado',
      'sweet potato'
    ];

    for (const term of searchTerms) {
      await page.click('[data-testid="add-food-button"]');
      await page.fill('[data-testid="food-search"]', term);
      
      // Wait for search results
      await page.waitForSelector('[data-testid="food-result"]');
      
      // Verify results contain search term
      const results = page.locator('[data-testid="food-result"]');
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
      
      // Check first result contains search term
      const firstResult = results.first();
      const resultText = await firstResult.textContent();
      expect(resultText?.toLowerCase()).toContain(term);
      
      // Close search
      await page.click('[data-testid="cancel-add-food"]');
    }
  });

  test('should support barcode scanning for quick food entry', async ({ page }) => {
    // Mock barcode scanner
    await page.addInitScript(() => {
      (window as any).BarcodeDetector = class {
        async detect() {
          return [{ rawValue: '1234567890123' }];
        }
      };
    });

    await page.click('[data-testid="add-food-button"]');
    await page.click('[data-testid="scan-barcode"]');

    // Wait for camera permission (mock) and scan
    await page.waitForSelector('[data-testid="barcode-scanner"]');
    
    // Simulate successful scan
    await page.click('[data-testid="simulate-scan"]');
    
    // Verify food was found and pre-filled
    await expect(page.locator('[data-testid="selected-food"]')).toBeVisible();
    
    // Complete the food entry
    await page.fill('[data-testid="food-amount"]', '100');
    await page.click('[data-testid="log-food"]');
    
    // Verify food was logged
    await expect(page.locator('[data-testid="food-entry"]')).toHaveCount(1);
  });

  test('should create and use meal templates', async ({ page }) => {
    // Create meals for template
    await foodPage.logFood('chicken breast', 150, 'dinner');
    await foodPage.logFood('rice', 100, 'dinner');
    await foodPage.logFood('vegetables', 80, 'dinner');

    // Navigate to templates
    await page.click('[data-testid="meal-templates-tab"]');
    
    // Create template from recent meal
    await page.click('[data-testid="create-template-from-meal"]');
    await page.selectOption('[data-testid="template-meal"]', 'dinner');
    
    await page.fill('[data-testid="template-name"]', 'Healthy Dinner Template');
    await page.click('[data-testid="save-template"]');

    // Verify template was created
    await expect(page.locator('[data-testid="template-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="template-name"]')).toContainText('Healthy Dinner Template');

    // Use template for next day
    await page.click('[data-testid="use-template"]');
    await page.selectOption('[data-testid="apply-to-meal"]', 'dinner');
    await page.click('[data-testid="apply-template"]');

    // Navigate back to food log
    await page.click('[data-testid="food-log-tab"]');
    
    // Verify template foods were added
    const dinnerEntries = await foodPage.getMealEntries('dinner');
    expect(dinnerEntries).toBe(6); // 3 original + 3 from template
  });

  test('should track nutrition goals and provide insights', async ({ page }) => {
    // Set nutrition goals
    await page.click('[data-testid="nutrition-goals"]');
    
    await page.fill('[data-testid="calories-goal"]', '2000');
    await page.fill('[data-testid="protein-goal"]', '150');
    await page.fill('[data-testid="carbs-goal"]', '200');
    await page.fill('[data-testid="fat-goal"]', '65');
    
    await page.click('[data-testid="save-goals"]');

    // Log foods throughout the day
    await foodPage.logFood('eggs', 100, 'breakfast');
    await foodPage.logFood('toast', 60, 'breakfast');
    await foodPage.logFood('salmon', 120, 'lunch');
    await foodPage.logFood('quinoa', 80, 'lunch');
    await foodPage.logFood('chicken', 150, 'dinner');
    await foodPage.logFood('sweet potato', 100, 'dinner');

    // Check progress indicators
    await expect(page.locator('[data-testid="calories-progress"]')).toHaveAttribute('value');
    await expect(page.locator('[data-testid="protein-progress"]')).toHaveAttribute('value');
    
    // Get nutrition insights
    await page.click('[data-testid="nutrition-insights"]');
    
    // Verify insights are provided
    await expect(page.locator('[data-testid="macro-balance"]')).toBeVisible();
    await expect(page.locator('[data-testid="calorie-deficit"]')).toBeVisible();
    await expect(page.locator('[data-testid="nutrient-recommendations"]')).toBeVisible();
  });

  test('should handle food editing and deletion', async ({ page }) => {
    // Log some foods
    await foodPage.logFood('apple', 150, 'snack');
    await foodPage.logFood('nuts', 30, 'snack');

    // Edit first food entry
    await page.click('[data-testid="edit-food-entry"]:first-child');
    
    // Change amount
    const amountInput = page.locator('[data-testid="edit-amount"]');
    await amountInput.clear();
    await amountInput.fill('200');
    
    await page.click('[data-testid="save-edit"]');
    
    // Verify change was saved
    await expect(page.locator('[data-testid="food-amount"]').first()).toContainText('200g');

    // Delete second food entry
    await page.click('[data-testid="delete-food-entry"]:nth-child(2)');
    await page.click('[data-testid="confirm-delete"]');
    
    // Verify entry was deleted
    await expect(page.locator('[data-testid="food-entry"]')).toHaveCount(1);
  });

  test('should sync food data and handle offline mode', async ({ page, context }) => {
    // Log food while online
    await foodPage.logFood('banana', 120, 'breakfast');
    
    // Simulate offline mode
    await context.setOffline(true);
    
    // Try to log food offline
    await page.click('[data-testid="add-food-button"]');
    await page.fill('[data-testid="food-search"]', 'apple');
    
    // Should show offline message
    await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    
    // Can still view cached data
    await page.click('[data-testid="cancel-add-food"]');
    await expect(page.locator('[data-testid="food-entry"]')).toHaveCount(1);
    
    // Go back online
    await context.setOffline(false);
    
    // Verify sync happens
    await page.reload();
    await expect(page.locator('[data-testid="sync-status"]')).toContainText('Synced');
  });

  test('should provide detailed nutrition analysis', async ({ page }) => {
    // Log diverse foods to test analysis
    await foodPage.logFood('spinach', 100, 'lunch');
    await foodPage.logFood('salmon', 150, 'lunch');
    await foodPage.logFood('avocado', 80, 'lunch');
    await foodPage.logFood('blueberries', 50, 'snack');

    // Go to nutrition analysis page
    await page.click('[data-testid="detailed-analysis"]');
    
    // Check micronutrient tracking
    await expect(page.locator('[data-testid="vitamin-c"]')).toBeVisible();
    await expect(page.locator('[data-testid="iron"]')).toBeVisible();
    await expect(page.locator('[data-testid="omega-3"]')).toBeVisible();
    
    // Check food quality scores
    await expect(page.locator('[data-testid="nutrient-density-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="processed-food-ratio"]')).toBeVisible();
    
    // View weekly trends
    await page.click('[data-testid="weekly-trends"]');
    
    // Verify trend charts
    await expect(page.locator('[data-testid="calories-trend-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="macros-trend-chart"]')).toBeVisible();
  });
});