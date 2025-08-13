import { test, expect } from '@playwright/test';
import { E2ETestHelpers, customExpect } from '@/test-utils/e2e-helpers';

test.describe('Accessibility E2E Tests', () => {
  let helpers: E2ETestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new E2ETestHelpers(page);
  });

  test('should have proper heading structure on all main pages', async ({ page }) => {
    const pages = [
      '/dashboard',
      '/workouts',
      '/food',
      '/weight',
      '/progress'
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await customExpect.toHaveCorrectHeadingStructure(page);
      
      console.log(`✅ Heading structure valid for ${pagePath}`);
    }
  });

  test('should have accessible forms with proper labels', async ({ page }) => {
    // Test workout form
    await helpers.navigateToWorkouts();
    await page.click('[data-testid="add-workout-button"]');

    // Check form accessibility
    const workoutInput = page.locator('[data-testid="workout-input"]');
    await customExpect.toHaveAccessibleName(workoutInput, 'workout');

    const dateInput = page.locator('[data-testid="workout-date"]');
    const dateLabel = await dateInput.getAttribute('aria-label');
    expect(dateLabel).toBeTruthy();

    // Test food search form
    await helpers.navigateToFood();
    await page.click('[data-testid="add-food-button"]');

    const foodSearch = page.locator('[data-testid="food-search"]');
    await customExpect.toHaveAccessibleName(foodSearch, 'search');

    // Check all form inputs have proper labels or aria-labels
    const formInputs = await page.locator('input, textarea, select').all();
    for (const input of formInputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      } else {
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should support keyboard navigation throughout the app', async ({ page }) => {
    await helpers.navigateToWorkouts();

    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();

    // Navigate through several elements
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.locator(':focus').first();
      await expect(focusedElement).toBeVisible();
    }

    // Test reverse tab navigation
    await page.keyboard.press('Shift+Tab');
    focusedElement = await page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();

    // Test Enter key on focusable elements
    await page.keyboard.press('Tab');
    const enterElement = await page.locator(':focus').first();
    const tagName = await enterElement.evaluate(el => el.tagName.toLowerCase());
    
    if (['button', 'a', 'input'].includes(tagName)) {
      await page.keyboard.press('Enter');
      // Should not throw error or cause page crash
      await page.waitForTimeout(500);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const pagesToTest = [
      '/dashboard',
      '/workouts', 
      '/food',
      '/progress'
    ];

    for (const pagePath of pagesToTest) {
      await page.goto(pagePath);
      
      const contrastIssues = await helpers.checkColorContrast();
      
      if (contrastIssues.length > 0) {
        console.warn(`Color contrast issues on ${pagePath}:`, contrastIssues);
      }
      
      // Should have minimal contrast issues
      expect(contrastIssues.length).toBeLessThan(5);
    }
  });

  test('should have proper alt text for all images', async ({ page }) => {
    await page.goto('/dashboard');
    
    const accessibilityIssues = await helpers.checkPageAccessibility();
    const imageIssues = accessibilityIssues.filter(issue => 
      issue.includes('alt text')
    );
    
    // All images should have alt text
    expect(imageIssues).toEqual([]);
    
    // Test specific image elements
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      
      // Decorative images should have empty alt or presentation role
      // Content images should have descriptive alt text
      expect(alt !== null || role === 'presentation').toBeTruthy();
      
      if (alt && alt.length > 0) {
        // Alt text should be descriptive but not too verbose
        expect(alt.length).toBeGreaterThan(3);
        expect(alt.length).toBeLessThan(150);
      }
    }
  });

  test('should support screen readers with proper ARIA attributes', async ({ page }) => {
    await helpers.navigateToWorkouts();
    
    // Check for proper ARIA landmarks
    await expect(page.locator('[role="main"], main')).toBeVisible();
    await expect(page.locator('[role="navigation"], nav')).toBeVisible();
    
    // Check interactive elements have proper ARIA attributes
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaDescribedBy = await button.getAttribute('aria-describedby');
      const textContent = await button.textContent();
      
      // Button should have accessible name
      expect(ariaLabel || textContent?.trim()).toBeTruthy();
      
      // Check for proper expanded state if it's a toggle
      const ariaExpanded = await button.getAttribute('aria-expanded');
      if (ariaExpanded !== null) {
        expect(['true', 'false']).toContain(ariaExpanded);
      }
    }
    
    // Check form controls have proper labels
    const selects = await page.locator('select').all();
    for (const select of selects) {
      const ariaLabel = await select.getAttribute('aria-label');
      const ariaLabelledBy = await select.getAttribute('aria-labelledby');
      const id = await select.getAttribute('id');
      
      const hasLabel = id ? await page.locator(`label[for="${id}"]`).count() > 0 : false;
      
      expect(ariaLabel || ariaLabelledBy || hasLabel).toBeTruthy();
    }
  });

  test('should handle focus management properly', async ({ page }) => {
    await helpers.navigateToWorkouts();
    
    // Test modal focus management
    await page.click('[data-testid="add-workout-button"]');
    
    // Focus should move to modal
    const modal = page.locator('[data-testid="workout-modal"]');
    await expect(modal).toBeVisible();
    
    const focusedElement = await page.locator(':focus').first();
    const isInModal = await focusedElement.evaluate((el, modal) => {
      return modal.contains(el);
    }, await modal.elementHandle());
    
    expect(isInModal).toBeTruthy();
    
    // Test focus trap in modal
    await page.keyboard.press('Tab');
    const secondFocus = await page.locator(':focus').first();
    const secondInModal = await secondFocus.evaluate((el, modal) => {
      return modal.contains(el);
    }, await modal.elementHandle());
    
    expect(secondInModal).toBeTruthy();
    
    // Close modal and check focus return
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
    
    // Focus should return to trigger element
    const finalFocus = await page.locator(':focus').first();
    const addButton = page.locator('[data-testid="add-workout-button"]');
    
    expect(await finalFocus.evaluate(el => el.tagName)).toBe(
      await addButton.evaluate(el => el.tagName)
    );
  });

  test('should support high contrast and dark mode', async ({ page }) => {
    // Test default dark theme
    await page.goto('/dashboard');
    
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });
    
    // Should have dark background and light text
    expect(bodyStyles.backgroundColor).toMatch(/rgb\(10,\s*10,\s*10\)|#0A0A0A/i);
    expect(bodyStyles.color).toMatch(/rgb\(255,\s*255,\s*255\)|#FFFFFF/i);
    
    // Test forced-colors media query support
    await page.emulateMedia({ forcedColors: 'active' });
    
    // App should adapt to high contrast mode
    const highContrastStyles = await page.evaluate(() => {
      return window.matchMedia('(forced-colors: active)').matches;
    });
    
    if (highContrastStyles) {
      // Check that custom colors are overridden
      const linkColor = await page.locator('a').first().evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      
      // Should use system colors in high contrast mode
      expect(linkColor).toMatch(/LinkText|ButtonText/);
    }
  });

  test('should provide proper error announcements', async ({ page }) => {
    await helpers.navigateToWorkouts();
    
    // Test form validation errors
    await page.click('[data-testid="add-workout-button"]');
    await page.click('[data-testid="submit-workout"]'); // Submit empty form
    
    // Error should be announced to screen readers
    const errorElement = page.locator('[data-testid="workout-error"]');
    await expect(errorElement).toBeVisible();
    
    const ariaLive = await errorElement.getAttribute('aria-live');
    expect(['polite', 'assertive']).toContain(ariaLive || '');
    
    const role = await errorElement.getAttribute('role');
    expect(['alert', 'status']).toContain(role || '');
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Test with reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/dashboard');
    
    // Check that animations are disabled or reduced
    const animatedElements = await page.locator('[class*="animate"], [class*="transition"]').all();
    
    for (const element of animatedElements) {
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          animationDuration: computed.animationDuration,
          transitionDuration: computed.transitionDuration
        };
      });
      
      // Animations should be disabled or very short
      if (styles.animationDuration !== 'none') {
        expect(parseFloat(styles.animationDuration)).toBeLessThan(0.1);
      }
      if (styles.transitionDuration !== 'none') {
        expect(parseFloat(styles.transitionDuration)).toBeLessThan(0.1);
      }
    }
  });

  test('should have accessible data tables', async ({ page }) => {
    await helpers.navigateToProgress();
    
    // Look for data tables
    const tables = await page.locator('table').all();
    
    for (const table of tables) {
      // Table should have caption or accessible name
      const caption = table.locator('caption');
      const ariaLabel = await table.getAttribute('aria-label');
      const ariaLabelledBy = await table.getAttribute('aria-labelledby');
      
      const hasCaption = await caption.count() > 0;
      expect(hasCaption || ariaLabel || ariaLabelledBy).toBeTruthy();
      
      // Headers should be properly marked
      const headers = await table.locator('th').all();
      for (const header of headers) {
        const scope = await header.getAttribute('scope');
        expect(['col', 'row', 'colgroup', 'rowgroup']).toContain(scope || 'col');
      }
    }
  });
});