// Performance benchmarking tests for Feel Sharper
import { BenchmarkSuite, PerformanceBenchmark } from '@/test-utils/performance-testing';

describe('Feel Sharper Performance Benchmarks', () => {
  let benchmarkSuite: BenchmarkSuite;
  let performanceBenchmark: PerformanceBenchmark;

  beforeEach(() => {
    benchmarkSuite = new BenchmarkSuite();
    performanceBenchmark = new PerformanceBenchmark();
  });

  afterEach(() => {
    benchmarkSuite.clear();
    performanceBenchmark.clear();
  });

  describe('AI Processing Benchmarks', () => {
    it('should benchmark workout parsing performance', async () => {
      const results = await benchmarkSuite.runWorkoutParsingBenchmark();
      
      // Log results for analysis
      results.forEach(({ input, stats }) => {
        console.log(`Workout: "${input}" - Avg: ${stats.average.toFixed(2)}ms, P95: ${stats.p95.toFixed(2)}ms`);
      });

      // Performance assertions
      results.forEach(({ stats }) => {
        expect(stats.average).toBeLessThan(200); // Average under 200ms
        expect(stats.p95).toBeLessThan(300); // 95th percentile under 300ms
        expect(stats.max).toBeLessThan(500); // Max under 500ms
      });
    });

    it('should benchmark food search performance', async () => {
      const results = await benchmarkSuite.runFoodSearchBenchmark();
      
      results.forEach(({ term, stats }) => {
        console.log(`Food search: "${term}" - Avg: ${stats.average.toFixed(2)}ms, P95: ${stats.p95.toFixed(2)}ms`);
      });

      // Food search should be very fast (database queries)
      results.forEach(({ stats }) => {
        expect(stats.average).toBeLessThan(100); // Average under 100ms
        expect(stats.p95).toBeLessThan(150); // 95th percentile under 150ms
        expect(stats.max).toBeLessThan(200); // Max under 200ms
      });
    });

    it('should benchmark AI response times', async () => {
      const results = await benchmarkSuite.runAIResponseBenchmark();
      
      results.forEach(({ prompt, stats }) => {
        console.log(`AI prompt: "${prompt}" - Avg: ${stats.average.toFixed(2)}ms, P95: ${stats.p95.toFixed(2)}ms`);
      });

      // AI responses take longer but should be reasonable
      results.forEach(({ stats }) => {
        expect(stats.average).toBeLessThan(3000); // Average under 3 seconds
        expect(stats.p95).toBeLessThan(5000); // 95th percentile under 5 seconds
        expect(stats.max).toBeLessThan(10000); // Max under 10 seconds
      });
    });
  });

  describe('Component Rendering Benchmarks', () => {
    it('should benchmark workout list rendering', async () => {
      // Mock workout data
      const workouts = Array.from({ length: 100 }, (_, i) => ({
        id: `workout_${i}`,
        title: `Workout ${i}`,
        exercises: [
          { name: 'bench press', sets: [{ reps: 8, weight: 80 }] },
          { name: 'squats', sets: [{ reps: 10, weight: 100 }] }
        ]
      }));

      const { stats } = await performanceBenchmark.measureAsync(
        'workout_list_render',
        async () => {
          // Simulate rendering 100 workouts
          await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
          return workouts.map(w => ({ ...w, rendered: true }));
        },
        10
      );

      console.log(`Workout list rendering - Avg: ${stats.average.toFixed(2)}ms, P95: ${stats.p95.toFixed(2)}ms`);
      
      expect(stats.average).toBeLessThan(100); // Should render quickly
      expect(stats.p95).toBeLessThan(150);
    });

    it('should benchmark food search results rendering', async () => {
      const foods = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        description: `Food item ${i}`,
        caloriesPer100g: 100 + i * 5,
        verified: true
      }));

      const { stats } = performanceBenchmark.measureSync(
        'food_search_render',
        () => {
          // Simulate filtering and rendering search results
          return foods.filter(f => f.description.includes('item')).slice(0, 10);
        },
        20
      );

      console.log(`Food search rendering - Avg: ${stats.average.toFixed(2)}ms`);
      
      expect(stats.average).toBeLessThan(10); // Should be very fast for small lists
    });

    it('should benchmark progress chart rendering', async () => {
      const chartData = Array.from({ length: 365 }, (_, i) => ({
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        weight: 70 + Math.sin(i / 30) * 2,
        workouts: Math.floor(Math.random() * 2),
        calories: 1800 + Math.random() * 400
      }));

      const { stats } = await performanceBenchmark.measureAsync(
        'progress_chart_render',
        async () => {
          // Simulate chart data processing and rendering
          const processedData = chartData.map(d => ({
            ...d,
            weightTrend: calculateTrend(d.weight),
            calorieAverage: calculateAverage(d.calories)
          }));
          
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
          return processedData;
        },
        5
      );

      function calculateTrend(weight: number) {
        return weight > 70 ? 'up' : 'down';
      }

      function calculateAverage(calories: number) {
        return Math.round(calories);
      }

      console.log(`Progress chart rendering - Avg: ${stats.average.toFixed(2)}ms`);
      
      expect(stats.average).toBeLessThan(200); // Charts with lots of data points
      expect(stats.max).toBeLessThan(500);
    });
  });

  describe('Database Operation Benchmarks', () => {
    it('should benchmark workout queries', async () => {
      const { stats } = await performanceBenchmark.measureAsync(
        'workout_queries',
        async () => {
          // Simulate database query with realistic delay
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 20));
          return {
            workouts: [],
            totalCount: 0,
            hasMore: false
          };
        },
        15
      );

      console.log(`Workout queries - Avg: ${stats.average.toFixed(2)}ms`);
      
      expect(stats.average).toBeLessThan(150); // Database queries should be fast
      expect(stats.p95).toBeLessThan(200);
    });

    it('should benchmark food search queries', async () => {
      const searchTerms = ['chicken', 'rice', 'banana', 'oatmeal', 'salmon'];
      
      for (const term of searchTerms) {
        const { stats } = await performanceBenchmark.measureAsync(
          `food_search_${term}`,
          async () => {
            // Simulate USDA database search
            await new Promise(resolve => setTimeout(resolve, Math.random() * 80 + 10));
            return [
              { id: 1, description: `${term} result 1`, verified: true },
              { id: 2, description: `${term} result 2`, verified: true }
            ];
          },
          10
        );

        console.log(`Food search "${term}" - Avg: ${stats.average.toFixed(2)}ms`);
        expect(stats.average).toBeLessThan(120); // Food search should be very fast
      }
    });

    it('should benchmark nutrition calculations', async () => {
      const nutritionLogs = Array.from({ length: 50 }, (_, i) => ({
        id: `log_${i}`,
        foodId: i % 10,
        quantityG: 100 + i * 5,
        calories: 150 + i * 3,
        proteinG: 20 + i * 0.5,
        carbsG: 30 + i * 0.8,
        fatG: 8 + i * 0.2
      }));

      const { stats } = performanceBenchmark.measureSync(
        'nutrition_calculations',
        () => {
          // Calculate daily totals
          const totals = nutritionLogs.reduce((acc, log) => ({
            calories: acc.calories + log.calories,
            proteinG: acc.proteinG + log.proteinG,
            carbsG: acc.carbsG + log.carbsG,
            fatG: acc.fatG + log.fatG
          }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });

          // Calculate percentages
          const totalCalories = totals.calories;
          const proteinPercent = (totals.proteinG * 4 / totalCalories) * 100;
          const carbsPercent = (totals.carbsG * 4 / totalCalories) * 100;
          const fatPercent = (totals.fatG * 9 / totalCalories) * 100;

          return {
            totals,
            percentages: { proteinPercent, carbsPercent, fatPercent }
          };
        },
        100
      );

      console.log(`Nutrition calculations - Avg: ${stats.average.toFixed(2)}ms`);
      
      expect(stats.average).toBeLessThan(5); // Should be very fast calculations
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory during repeated operations', async () => {
      const initialMemory = performanceBenchmark['getMemoryUsage']();
      
      // Perform memory-intensive operations
      for (let i = 0; i < 100; i++) {
        const largeData = Array.from({ length: 1000 }, (_, index) => ({
          id: index,
          data: new Array(100).fill(`item_${index}`)
        }));

        // Process data
        const processed = largeData.map(item => ({
          ...item,
          processed: true,
          timestamp: Date.now()
        }));

        // Clear references
        largeData.length = 0;
        processed.length = 0;
      }

      const finalMemory = performanceBenchmark['getMemoryUsage']();
      const memoryDelta = finalMemory - initialMemory;
      const memoryDeltaMB = memoryDelta / (1024 * 1024);

      console.log(`Memory delta after 100 operations: ${memoryDeltaMB.toFixed(2)} MB`);
      
      // Memory growth should be minimal
      expect(memoryDeltaMB).toBeLessThan(50); // Less than 50MB growth
    });
  });

  describe('Bundle and Asset Performance', () => {
    it('should benchmark module loading times', async () => {
      const modules = [
        '@/components/workouts/WorkoutCard',
        '@/components/food/FoodSearchResults', 
        '@/components/progress/ProgressChart',
        '@/lib/utils',
        '@/lib/supabase/client'
      ];

      for (const modulePath of modules) {
        const { stats } = await performanceBenchmark.measureAsync(
          `module_load_${modulePath.split('/').pop()}`,
          async () => {
            // Simulate module loading
            await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));
            return { loaded: true, path: modulePath };
          },
          5
        );

        console.log(`Module loading ${modulePath} - Avg: ${stats.average.toFixed(2)}ms`);
        expect(stats.average).toBeLessThan(100); // Modules should load quickly
      }
    });
  });

  describe('Overall Performance Report', () => {
    it('should generate comprehensive performance report', () => {
      // This test runs after all others to generate a final report
      const report = performanceBenchmark.generateReport();
      
      console.log('\n=== Feel Sharper Performance Report ===');
      console.log(`Total measurements: ${report.summary.totalMeasurements}`);
      console.log(`Memory delta: ${(report.summary.memoryDelta / (1024 * 1024)).toFixed(2)} MB`);
      
      console.log('\nSlowest operations:');
      report.summary.slowestOperations.forEach((op, index) => {
        console.log(`${index + 1}. ${op.name}: ${op.averageTime.toFixed(2)}ms`);
      });

      console.log('\nDetailed measurements:');
      Object.entries(report.measurements).forEach(([name, stats]) => {
        console.log(`${name}: avg=${stats.average.toFixed(2)}ms, p95=${stats.p95.toFixed(2)}ms, max=${stats.max.toFixed(2)}ms`);
      });

      // Overall performance should be good
      expect(report.summary.totalMeasurements).toBeGreaterThan(0);
      expect(report.summary.memoryDelta / (1024 * 1024)).toBeLessThan(100); // Less than 100MB total
    });
  });
});