// End-to-End testing utilities for Playwright
import { Page, Locator, expect } from '@playwright/test';

export class E2ETestHelpers {
  constructor(private page: Page) {}

  // Authentication helpers
  async signIn(email = 'test@example.com', password = 'password123') {
    await this.page.goto('/auth/sign-in');
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="sign-in-button"]');
    
    // Wait for successful sign-in
    await this.page.waitForURL('/dashboard');
  }

  async signOut() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="sign-out"]');
    await this.page.waitForURL('/');
  }

  // Navigation helpers
  async navigateTo(path: string) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToWorkouts() {
    await this.page.click('[data-testid="nav-workouts"]');
    await this.page.waitForURL('/workouts');
  }

  async navigateToFood() {
    await this.page.click('[data-testid="nav-food"]');
    await this.page.waitForURL('/food');
  }

  async navigateToProgress() {
    await this.page.click('[data-testid="nav-progress"]');
    await this.page.waitForURL('/progress');
  }

  // Workout-specific helpers
  async addWorkout(description: string, date?: string) {
    await this.navigateToWorkouts();
    await this.page.click('[data-testid="add-workout-button"]');
    
    // Fill workout form
    await this.page.fill('[data-testid="workout-input"]', description);
    if (date) {
      await this.page.fill('[data-testid="workout-date"]', date);
    }
    
    await this.page.click('[data-testid="submit-workout"]');
    
    // Wait for workout to appear
    await this.page.waitForSelector('[data-testid="workout-card"]');
  }

  async editWorkout(workoutId: string, newDescription: string) {
    await this.page.click(`[data-testid="edit-workout-${workoutId}"]`);
    await this.page.clear('[data-testid="workout-input"]');
    await this.page.fill('[data-testid="workout-input"]', newDescription);
    await this.page.click('[data-testid="save-workout"]');
  }

  async deleteWorkout(workoutId: string) {
    await this.page.click(`[data-testid="workout-menu-${workoutId}"]`);
    await this.page.click(`[data-testid="delete-workout-${workoutId}"]`);
    await this.page.click('[data-testid="confirm-delete"]');
    
    // Wait for workout to disappear
    await this.page.waitForSelector(`[data-testid="workout-card-${workoutId}"]`, { 
      state: 'detached' 
    });
  }

  // Food logging helpers
  async logFood(foodName: string, amount: number, unit = 'g', mealType = 'lunch') {
    await this.navigateToFood();
    await this.page.click('[data-testid="add-food-button"]');
    
    // Search for food
    await this.page.fill('[data-testid="food-search"]', foodName);
    await this.page.waitForSelector('[data-testid="food-result"]');
    await this.page.click('[data-testid="food-result"]:first-child');
    
    // Set amount
    await this.page.fill('[data-testid="food-amount"]', amount.toString());
    await this.page.selectOption('[data-testid="food-unit"]', unit);
    await this.page.selectOption('[data-testid="meal-type"]', mealType);
    
    await this.page.click('[data-testid="log-food"]');
    
    // Wait for food to appear in log
    await this.page.waitForSelector('[data-testid="food-entry"]');
  }

  async logWeight(weight: number, unit = 'kg', date?: string) {
    await this.page.goto('/weight');
    
    if (date) {
      await this.page.fill('[data-testid="weight-date"]', date);
    }
    
    await this.page.fill('[data-testid="weight-input"]', weight.toString());
    await this.page.selectOption('[data-testid="weight-unit"]', unit);
    await this.page.click('[data-testid="save-weight"]');
    
    // Wait for weight to appear in history
    await this.page.waitForSelector('[data-testid="weight-entry"]');
  }

  // Progress tracking helpers
  async checkProgressGraph(graphType: 'weight' | 'workouts' | 'nutrition') {
    await this.navigateToProgress();
    await this.page.click(`[data-testid="graph-tab-${graphType}"]`);
    
    // Wait for graph to load
    await this.page.waitForSelector(`[data-testid="${graphType}-chart"]`);
    
    // Verify graph has data
    const dataPoints = await this.page.locator(`[data-testid="${graphType}-chart"] .recharts-dot`).count();
    expect(dataPoints).toBeGreaterThan(0);
  }

  // AI features helpers
  async getAIInsights() {
    await this.page.goto('/insights');
    
    // Wait for AI analysis to complete
    await this.page.waitForSelector('[data-testid="ai-insights"]', { timeout: 30000 });
    
    const insights = await this.page.textContent('[data-testid="ai-insights"]');
    expect(insights).toBeTruthy();
    return insights;
  }

  async askAIQuestion(question: string) {
    await this.page.goto('/coach');
    
    await this.page.fill('[data-testid="chat-input"]', question);
    await this.page.click('[data-testid="send-message"]');
    
    // Wait for AI response
    await this.page.waitForSelector('[data-testid="ai-response"]', { timeout: 30000 });
    
    const response = await this.page.textContent('[data-testid="ai-response"]:last-child');
    expect(response).toBeTruthy();
    return response;
  }

  // Subscription and premium features
  async upgradeToPremium() {
    await this.page.goto('/settings');
    await this.page.click('[data-testid="upgrade-button"]');
    
    // Select premium plan
    await this.page.click('[data-testid="premium-plan"]');
    
    // Fill payment form (test mode)
    await this.fillPaymentForm();
    
    await this.page.click('[data-testid="complete-purchase"]');
    
    // Wait for successful upgrade
    await this.page.waitForSelector('[data-testid="premium-badge"]');
  }

  private async fillPaymentForm() {
    await this.page.fill('[data-testid="card-number"]', '4242424242424242');
    await this.page.fill('[data-testid="card-expiry"]', '12/28');
    await this.page.fill('[data-testid="card-cvc"]', '123');
    await this.page.fill('[data-testid="card-name"]', 'Test User');
  }

  // Performance helpers
  async measurePageLoadTime(url: string): Promise<number> {
    const startTime = Date.now();
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  async measureInteractionTime(action: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await action();
    return Date.now() - startTime;
  }

  // Accessibility helpers
  async checkPageAccessibility() {
    // Check for basic accessibility issues
    const issues: string[] = [];
    
    // Check for alt text on images
    const images = await this.page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      if (!alt) {
        const src = await img.getAttribute('src');
        issues.push(`Image missing alt text: ${src}`);
      }
    }
    
    // Check for form labels
    const inputs = await this.page.locator('input, textarea, select').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      
      if (id) {
        const label = await this.page.locator(`label[for="${id}"]`).count();
        if (label === 0 && !ariaLabel) {
          issues.push(`Input missing label: ${id}`);
        }
      } else if (!ariaLabel) {
        issues.push('Input missing id and aria-label');
      }
    }
    
    // Check for heading structure
    const h1Count = await this.page.locator('h1').count();
    if (h1Count === 0) {
      issues.push('Page missing h1 heading');
    } else if (h1Count > 1) {
      issues.push('Page has multiple h1 headings');
    }
    
    return issues;
  }

  async checkColorContrast() {
    // Basic color contrast check (simplified)
    const contrastIssues = await this.page.evaluate(() => {
      const issues: string[] = [];
      const elements = document.querySelectorAll('*');
      
      elements.forEach((element, index) => {
        const styles = window.getComputedStyle(element);
        const backgroundColor = styles.backgroundColor;
        const color = styles.color;
        
        // Skip elements with transparent/inherit colors
        if (backgroundColor === 'rgba(0, 0, 0, 0)' || 
            backgroundColor === 'transparent' ||
            color === 'inherit') {
          return;
        }
        
        // Simple check for very light text on light backgrounds
        if (backgroundColor.includes('255, 255, 255') && 
            color.includes('200, 200, 200')) {
          issues.push(`Potential contrast issue at element ${index}`);
        }
      });
      
      return issues;
    });
    
    return contrastIssues;
  }

  // Error handling helpers
  async expectNoJavaScriptErrors() {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    this.page.on('pageerror', err => {
      errors.push(err.message);
    });
    
    return () => {
      expect(errors).toEqual([]);
    };
  }

  async expectNoNetworkErrors() {
    const networkErrors: string[] = [];
    
    this.page.on('response', response => {
      if (!response.ok() && response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    
    return () => {
      expect(networkErrors).toEqual([]);
    };
  }

  // Data cleanup helpers
  async cleanupUserData(userId: string) {
    // This would typically call API endpoints to clean up test data
    await this.page.goto(`/api/test/cleanup/${userId}`);
  }

  // Mobile testing helpers
  async switchToMobile() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async switchToTablet() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  async switchToDesktop() {
    await this.page.setViewportSize({ width: 1440, height: 900 });
  }

  // Utility methods
  async waitForSpinnerToDisappear() {
    await this.page.waitForSelector('[data-testid="loading-spinner"]', { 
      state: 'detached', 
      timeout: 10000 
    });
  }

  async takeFullPageScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`, 
      fullPage: true 
    });
  }

  async expectToastMessage(message: string) {
    await expect(this.page.locator('[data-testid="toast"]')).toContainText(message);
  }

  async dismissToast() {
    await this.page.click('[data-testid="toast-close"]');
    await this.page.waitForSelector('[data-testid="toast"]', { state: 'detached' });
  }
}

// Page Object Models for common flows
export class WorkoutPageObject {
  constructor(private page: Page) {}

  async addWorkout(description: string) {
    await this.page.click('[data-testid="add-workout-button"]');
    await this.page.fill('[data-testid="workout-input"]', description);
    await this.page.click('[data-testid="submit-workout"]');
    await this.page.waitForSelector('[data-testid="workout-card"]');
  }

  async getWorkoutCount() {
    return await this.page.locator('[data-testid="workout-card"]').count();
  }

  async getWorkoutTitles() {
    return await this.page.locator('[data-testid="workout-title"]').allTextContents();
  }
}

export class FoodPageObject {
  constructor(private page: Page) {}

  async logFood(foodName: string, amount: number, mealType = 'lunch') {
    await this.page.click('[data-testid="add-food-button"]');
    await this.page.fill('[data-testid="food-search"]', foodName);
    await this.page.waitForSelector('[data-testid="food-result"]');
    await this.page.click('[data-testid="food-result"]:first-child');
    await this.page.fill('[data-testid="food-amount"]', amount.toString());
    await this.page.selectOption('[data-testid="meal-type"]', mealType);
    await this.page.click('[data-testid="log-food"]');
    await this.page.waitForSelector('[data-testid="food-entry"]');
  }

  async getTotalCalories() {
    const caloriesText = await this.page.textContent('[data-testid="total-calories"]');
    return caloriesText ? parseInt(caloriesText.replace(/[^\d]/g, '')) : 0;
  }

  async getMealEntries(mealType: string) {
    return await this.page.locator(`[data-testid="meal-${mealType}"] [data-testid="food-entry"]`).count();
  }
}

// Custom Playwright matchers
export const customExpect = {
  async toHaveAccessibleName(locator: Locator, name: string) {
    const accessibleName = await locator.getAttribute('aria-label') || 
                          await locator.textContent();
    expect(accessibleName).toContain(name);
  },

  async toBeVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  },

  async toHaveCorrectHeadingStructure(page: Page) {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let currentLevel = 0;
    
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName.charAt(1));
      
      if (currentLevel === 0) {
        expect(level).toBe(1); // First heading should be h1
      } else {
        expect(level).toBeLessThanOrEqual(currentLevel + 1); // No skipping levels
      }
      
      currentLevel = level;
    }
  }
};

// Test data setup helpers
export const setupE2ETestData = {
  async createTestUser(page: Page) {
    // This would typically call your API to create test data
    const response = await page.request.post('/api/test/users', {
      data: {
        email: 'e2e-test@example.com',
        password: 'testpassword123',
        subscriptionTier: 'free'
      }
    });
    return await response.json();
  },

  async createTestWorkouts(page: Page, userId: string, count = 5) {
    const workouts = [];
    for (let i = 0; i < count; i++) {
      const response = await page.request.post('/api/test/workouts', {
        data: {
          userId,
          title: `Test Workout ${i + 1}`,
          exercises: [
            {
              name: 'bench press',
              sets: [{ reps: 8, weight: 80 + i * 5 }]
            }
          ]
        }
      });
      workouts.push(await response.json());
    }
    return workouts;
  },

  async cleanup(page: Page, userId: string) {
    await page.request.delete(`/api/test/users/${userId}`);
  }
};