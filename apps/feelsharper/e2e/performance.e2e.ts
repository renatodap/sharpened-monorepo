import { test, expect } from '@playwright/test';
import { E2ETestHelpers } from '@/test-utils/e2e-helpers';

test.describe('Performance E2E Tests', () => {
  let helpers: E2ETestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new E2ETestHelpers(page);
  });

  test('should load main pages within acceptable time limits', async ({ page }) => {
    // Test page load times
    const pageLoadTests = [
      { url: '/', name: 'Homepage', maxTime: 3000 },
      { url: '/dashboard', name: 'Dashboard', maxTime: 4000 },
      { url: '/workouts', name: 'Workouts', maxTime: 4000 },
      { url: '/food', name: 'Food', maxTime: 4000 },
      { url: '/progress', name: 'Progress', maxTime: 5000 },
    ];

    for (const pageTest of pageLoadTests) {
      const loadTime = await helpers.measurePageLoadTime(pageTest.url);
      
      console.log(`${pageTest.name} loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(pageTest.maxTime);
    }
  });

  test('should maintain good performance with large datasets', async ({ page }) => {
    await helpers.navigateToWorkouts();
    
    // Create many workouts to test performance
    const workouts = Array.from({ length: 50 }, (_, i) => 
      `Workout ${i + 1}: bench press 3x8 at ${80 + i}kg`
    );

    console.log('Creating 50 workouts for performance testing...');
    
    for (const workout of workouts) {
      await helpers.addWorkout(workout);
      
      // Every 10 workouts, check page performance
      if ((workouts.indexOf(workout) + 1) % 10 === 0) {
        const scrollTime = await helpers.measureInteractionTime(async () => {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        });
        
        expect(scrollTime).toBeLessThan(200); // Scrolling should be smooth
      }
    }

    // Test search performance with large dataset
    const searchTime = await helpers.measureInteractionTime(async () => {
      await page.fill('[data-testid="workout-search"]', 'bench press');
      await page.waitForSelector('[data-testid="workout-card"]');
    });

    expect(searchTime).toBeLessThan(1000); // Search should be fast
    
    // Test filtering performance
    const filterTime = await helpers.measureInteractionTime(async () => {
      await page.click('[data-testid="filter-strength"]');
      await page.waitForSelector('[data-testid="workout-card"]');
    });

    expect(filterTime).toBeLessThan(500); // Filtering should be instant
  });

  test('should handle concurrent user interactions efficiently', async ({ page, context }) => {
    // Simulate multiple concurrent actions
    await helpers.navigateToFood();

    // Start multiple food searches simultaneously
    const searchPromises = [
      'chicken',
      'rice', 
      'broccoli',
      'salmon',
      'quinoa'
    ].map(async (term, index) => {
      // Stagger the searches slightly
      await new Promise(resolve => setTimeout(resolve, index * 100));
      
      const startTime = Date.now();
      
      await page.click('[data-testid="add-food-button"]');
      await page.fill('[data-testid="food-search"]', term);
      await page.waitForSelector('[data-testid="food-result"]');
      await page.click('[data-testid="cancel-add-food"]');
      
      return Date.now() - startTime;
    });

    const searchTimes = await Promise.all(searchPromises);
    
    // All searches should complete reasonably quickly even when concurrent
    searchTimes.forEach((time, index) => {
      console.log(`Search ${index + 1} took ${time}ms`);
      expect(time).toBeLessThan(3000);
    });
  });

  test('should handle memory efficiently during extended usage', async ({ page }) => {
    // Simulate extended app usage
    await helpers.navigateToWorkouts();

    // Create and delete workouts repeatedly to test memory management
    for (let i = 0; i < 20; i++) {
      // Add workout
      await helpers.addWorkout(`Test workout ${i}`);
      
      // Delete workout
      const workoutCard = page.locator('[data-testid="workout-card"]').first();
      await workoutCard.locator('[data-testid="workout-menu"]').click();
      await workoutCard.locator('[data-testid="delete-workout"]').click();
      await page.click('[data-testid="confirm-delete"]');
      
      // Wait for deletion
      await expect(workoutCard).not.toBeVisible();
      
      // Check memory periodically
      if (i % 5 === 0) {
        const memoryInfo = await page.evaluate(() => {
          return (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize
          } : null;
        });
        
        if (memoryInfo) {
          const memoryUsageMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
          console.log(`Memory usage after ${i + 1} cycles: ${memoryUsageMB.toFixed(2)} MB`);
          
          // Memory shouldn't grow excessively
          expect(memoryUsageMB).toBeLessThan(100);
        }
      }
    }
  });

  test('should have fast AI response times', async ({ page }) => {
    await helpers.navigateToWorkouts();

    // Test AI workout parsing speed
    const workoutParsingTests = [
      'bench press 3x8 at 100kg',
      'running 30 minutes at moderate pace', 
      'full body: squats 3x10, pushups 3x12, plank 60 seconds',
      'leg day: squats 4x8 at 120kg, lunges 3x12 each leg, calf raises 3x20'
    ];

    for (const workout of workoutParsingTests) {
      const parseTime = await helpers.measureInteractionTime(async () => {
        await helpers.addWorkout(workout);
        await page.waitForSelector('[data-testid="workout-card"]');
      });

      console.log(`AI parsing for "${workout}" took ${parseTime}ms`);
      expect(parseTime).toBeLessThan(5000); // AI parsing should be under 5 seconds
    }
  });

  test('should maintain performance across different network conditions', async ({ page, context }) => {
    // Test with slow 3G connection
    await context.route('**/*', route => {
      // Simulate slow network
      setTimeout(() => route.continue(), 100);
    });

    const slowLoadTime = await helpers.measurePageLoadTime('/dashboard');
    console.log(`Dashboard load time with slow network: ${slowLoadTime}ms`);

    // Remove network simulation
    await context.unroute('**/*');

    // Test normal network
    const normalLoadTime = await helpers.measurePageLoadTime('/dashboard');
    console.log(`Dashboard load time with normal network: ${normalLoadTime}ms`);

    // App should still be usable on slow networks
    expect(slowLoadTime).toBeLessThan(10000);
    expect(normalLoadTime).toBeLessThan(3000);
  });

  test('should optimize bundle sizes and loading', async ({ page }) => {
    // Check initial bundle load
    const responses: any[] = [];
    
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          size: parseInt(response.headers()['content-length'] || '0'),
          status: response.status()
        });
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Check JavaScript bundle sizes
    const jsBundles = responses.filter(r => r.url.includes('.js'));
    const totalJSSize = jsBundles.reduce((sum, bundle) => sum + bundle.size, 0);
    
    console.log(`Total JavaScript bundle size: ${(totalJSSize / 1024).toFixed(2)} KB`);
    console.log(`Number of JS files: ${jsBundles.length}`);

    // Main bundle shouldn't be too large
    expect(totalJSSize).toBeLessThan(500 * 1024); // 500KB limit

    // Check CSS bundle sizes
    const cssBundles = responses.filter(r => r.url.includes('.css'));
    const totalCSSSize = cssBundles.reduce((sum, bundle) => sum + bundle.size, 0);
    
    console.log(`Total CSS bundle size: ${(totalCSSSize / 1024).toFixed(2)} KB`);
    
    // CSS should be optimized
    expect(totalCSSSize).toBeLessThan(100 * 1024); // 100KB limit
  });

  test('should handle image loading and optimization', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check that images are properly optimized
    const images = await page.locator('img').all();
    
    for (const image of images) {
      const src = await image.getAttribute('src');
      const loading = await image.getAttribute('loading');
      
      // Images should have proper loading attributes
      if (src && !src.startsWith('data:')) {
        expect(loading).toBe('lazy');
      }
      
      // Check image load time
      const loadTime = await image.evaluate((img: HTMLImageElement) => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(0);
          } else {
            const start = Date.now();
            img.onload = () => resolve(Date.now() - start);
            img.onerror = () => resolve(-1);
          }
        });
      });

      if (typeof loadTime === 'number' && loadTime > 0) {
        expect(loadTime).toBeLessThan(2000); // Images should load within 2 seconds
      }
    }
  });
});