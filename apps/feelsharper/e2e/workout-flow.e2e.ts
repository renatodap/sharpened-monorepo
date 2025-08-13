import { test, expect } from '@playwright/test';
import { E2ETestHelpers } from '@/test-utils/e2e-helpers';

test.describe('Workout Flow E2E', () => {
  let helpers: E2ETestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new E2ETestHelpers(page);
    await helpers.navigateToWorkouts();
  });

  test('should complete full workout creation and tracking flow', async ({ page }) => {
    // Add a new workout
    await helpers.addWorkout('bench press 3x8 at 100kg, squats 4x10 at 80kg', '2025-01-15');

    // Verify workout appears in list
    await expect(page.locator('[data-testid="workout-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="workout-title"]')).toContainText('Bench Press & Squats');

    // Check exercise details
    await expect(page.locator('[data-testid="exercise-name"]').first()).toContainText('bench press');
    await expect(page.locator('[data-testid="exercise-sets"]').first()).toContainText('3 sets');
    await expect(page.locator('[data-testid="exercise-weight"]').first()).toContainText('100kg');

    // Edit the workout
    await page.click('[data-testid="workout-menu"]');
    await page.click('[data-testid="edit-workout"]');
    
    const titleInput = page.locator('[data-testid="workout-title-input"]');
    await titleInput.clear();
    await titleInput.fill('Updated Strength Session');
    
    await page.click('[data-testid="save-workout"]');
    
    // Verify edit was saved
    await expect(page.locator('[data-testid="workout-title"]')).toContainText('Updated Strength Session');

    // Mark sets as completed
    const setCheckboxes = page.locator('[data-testid="set-completed"]');
    const setCount = await setCheckboxes.count();
    
    for (let i = 0; i < setCount; i++) {
      await setCheckboxes.nth(i).check();
    }

    // Verify workout completion status
    await expect(page.locator('[data-testid="workout-completed"]')).toBeVisible();

    // Go to progress page and verify workout appears in stats
    await helpers.navigateToProgress();
    await expect(page.locator('[data-testid="workouts-this-week"]')).toContainText('1');
    await expect(page.locator('[data-testid="total-volume"]')).toContainText('2400'); // 3*100 + 4*80*10
  });

  test('should handle AI workout parsing correctly', async ({ page }) => {
    // Test various workout formats
    const workoutDescriptions = [
      'running 30 minutes at moderate pace',
      'pushups 3x12, pullups 3x8, plank 60 seconds',
      'bench press: set 1: 8 reps at 80kg, set 2: 8 reps at 80kg, set 3: 6 reps at 80kg'
    ];

    for (const description of workoutDescriptions) {
      await helpers.addWorkout(description);
      
      // Wait for AI parsing to complete
      await page.waitForSelector('[data-testid="workout-card"]');
      
      // Verify workout was parsed and structured
      const workoutCards = page.locator('[data-testid="workout-card"]');
      const count = await workoutCards.count();
      expect(count).toBeGreaterThan(0);

      // Clear for next test
      await page.reload();
    }
  });

  test('should track workout history and progress over time', async ({ page }) => {
    // Create workouts over several days
    const workoutData = [
      { description: 'bench press 3x8 at 80kg', date: '2025-01-10' },
      { description: 'bench press 3x8 at 85kg', date: '2025-01-12' },
      { description: 'bench press 3x8 at 90kg', date: '2025-01-14' },
    ];

    for (const workout of workoutData) {
      await helpers.addWorkout(workout.description, workout.date);
      await page.waitForTimeout(1000); // Brief pause between additions
    }

    // Go to progress page
    await helpers.navigateToProgress();
    
    // Check workout frequency
    await expect(page.locator('[data-testid="workouts-this-week"]')).toContainText('3');
    
    // Switch to strength progress tab
    await page.click('[data-testid="progress-tab-strength"]');
    
    // Verify progression chart shows increasing weights
    await expect(page.locator('[data-testid="strength-chart"]')).toBeVisible();
    
    // Check that the latest workout shows highest weight
    const latestWeight = page.locator('[data-testid="latest-bench-press-weight"]');
    await expect(latestWeight).toContainText('90kg');
  });

  test('should support workout templates and quick routines', async ({ page }) => {
    // Create a custom workout template
    await page.click('[data-testid="workout-templates-tab"]');
    await page.click('[data-testid="create-template-button"]');
    
    await page.fill('[data-testid="template-name"]', 'Push Day Template');
    await page.fill('[data-testid="template-description"]', 'bench press 3x8, shoulder press 3x10, tricep dips 3x12');
    
    await page.click('[data-testid="save-template"]');
    
    // Verify template was created
    await expect(page.locator('[data-testid="template-card"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="template-name"]')).toContainText('Push Day Template');

    // Use template to create workout
    await page.click('[data-testid="use-template"]');
    await page.click('[data-testid="confirm-create-workout"]');
    
    // Verify workout was created from template
    await page.click('[data-testid="my-workouts-tab"]');
    await expect(page.locator('[data-testid="workout-title"]').first()).toContainText('Push Day');
    
    // Check that all exercises from template are present
    await expect(page.locator('[data-testid="exercise-name"]')).toHaveCount(3);
  });

  test('should handle rest timer and workout timing', async ({ page }) => {
    await helpers.addWorkout('bench press 3x8 at 100kg');
    
    // Start workout session
    await page.click('[data-testid="start-workout"]');
    
    // Complete first set
    await page.click('[data-testid="complete-set-0"]');
    
    // Verify rest timer appears
    await expect(page.locator('[data-testid="rest-timer"]')).toBeVisible();
    await expect(page.locator('[data-testid="rest-timer"]')).toContainText('2:00'); // Default rest time
    
    // Skip rest timer
    await page.click('[data-testid="skip-rest"]');
    
    // Complete remaining sets
    await page.click('[data-testid="complete-set-1"]');
    await page.click('[data-testid="skip-rest"]');
    await page.click('[data-testid="complete-set-2"]');
    
    // Finish workout
    await page.click('[data-testid="finish-workout"]');
    
    // Verify workout duration was recorded
    await expect(page.locator('[data-testid="workout-duration"]')).toBeVisible();
    const duration = page.locator('[data-testid="workout-duration"]');
    await expect(duration).toContainText(/\d+ min/); // Should show minutes
  });

  test('should sync workout data across devices', async ({ page, context }) => {
    // Create workout on first "device"
    await helpers.addWorkout('squats 4x10 at 100kg');
    
    // Verify workout exists
    await expect(page.locator('[data-testid="workout-card"]')).toHaveCount(1);
    
    // Open new tab (simulating different device)
    const newPage = await context.newPage();
    const newHelpers = new E2ETestHelpers(newPage);
    
    await newHelpers.navigateToWorkouts();
    
    // Verify workout is synced
    await expect(newPage.locator('[data-testid="workout-card"]')).toHaveCount(1);
    
    // Modify workout on second "device"
    await newPage.click('[data-testid="workout-menu"]');
    await newPage.click('[data-testid="edit-workout"]');
    
    const input = newPage.locator('[data-testid="workout-notes"]');
    await input.fill('Felt strong today!');
    await newPage.click('[data-testid="save-workout"]');
    
    // Check sync back to first device
    await page.reload();
    await expect(page.locator('[data-testid="workout-notes"]')).toContainText('Felt strong today!');
    
    await newPage.close();
  });

  test('should handle workout sharing and social features', async ({ page }) => {
    await helpers.addWorkout('deadlift 1x5 at 140kg PR!');
    
    // Mark as personal record
    await page.click('[data-testid="workout-menu"]');
    await page.click('[data-testid="mark-as-pr"]');
    
    // Verify PR badge appears
    await expect(page.locator('[data-testid="pr-badge"]')).toBeVisible();
    
    // Share workout
    await page.click('[data-testid="share-workout"]');
    
    // Check share options
    await expect(page.locator('[data-testid="share-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-link"]')).toBeVisible();
    
    // Copy share link
    await page.click('[data-testid="copy-share-link"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="copy-success"]')).toBeVisible();
    
    // Close share dialog
    await page.click('[data-testid="close-share-dialog"]');
  });
});