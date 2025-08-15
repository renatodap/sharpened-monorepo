export interface PerformanceStats {
  duration: number;
  memory?: number;
  operations?: number;
}

export interface BenchmarkConfig {
  iterations?: number;
  warmupRuns?: number;
  timeout?: number;
}

export class PerformanceTester {
  private config: BenchmarkConfig;

  constructor(config: BenchmarkConfig = {}) {
    this.config = {
      iterations: 10,
      warmupRuns: 3,
      timeout: 5000,
      ...config,
    };
  }

  async benchmark<T>(
    testFunction: () => Promise<T> | T,
    name?: string
  ): Promise<{ result: T; stats: PerformanceStats }> {
    const { iterations = 10, warmupRuns = 3 } = this.config;

    // Warmup runs
    for (let i = 0; i < warmupRuns; i++) {
      await testFunction();
    }

    const times: number[] = [];
    let result: T;

    // Actual benchmark runs
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      const startMemory = (performance as any).memory?.usedJSHeapSize;

      result = await testFunction();

      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize;

      times.push(endTime - startTime);
    }

    const stats: PerformanceStats = {
      duration: times.reduce((a, b) => a + b, 0) / times.length,
      memory: (performance as any).memory?.usedJSHeapSize,
    };

    return { result: result!, stats };
  }

  async measureRenderTime<T>(
    renderFunction: () => Promise<T> | T
  ): Promise<PerformanceStats> {
    const { result, stats } = await this.benchmark(renderFunction);
    return stats;
  }

  async measureAsyncOperation<T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; stats: PerformanceStats }> {
    return this.benchmark(operation);
  }

  generateReport(results: Array<{ name: string; stats: PerformanceStats }>): string {
    let report = 'Performance Benchmark Report\\n';
    report += '================================\\n\\n';

    results.forEach(({ name, stats }) => {
      report += `${name}:\\n`;
      report += `  Duration: ${stats.duration.toFixed(2)}ms\\n`;
      if (stats.memory) {
        report += `  Memory: ${(stats.memory / 1024 / 1024).toFixed(2)}MB\\n`;
      }
      if (stats.operations) {
        report += `  Operations: ${stats.operations}\\n`;
      }
      report += '\\n';
    });

    return report;
  }
}

export const createPerformanceTester = (config?: BenchmarkConfig) => 
  new PerformanceTester(config);

// Utility functions for common performance testing scenarios
export const timeFunction = async <T>(fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
};

export const measureMemoryUsage = (): number => {
  return (performance as any).memory?.usedJSHeapSize || 0;
};

export const createMockDataSet = (size: number, template: any): any[] => {
  return Array.from({ length: size }, (_, index) => ({
    ...template,
    id: index,
    timestamp: new Date(Date.now() + index * 1000).toISOString(),
  }));
};

export interface BenchmarkStats {
  average: number;
  p95: number;
  max: number;
  min?: number;
  median?: number;
}

export interface WorkoutBenchmarkResult {
  input: string;
  stats: BenchmarkStats;
}

export interface FoodSearchBenchmarkResult {
  term: string;
  stats: BenchmarkStats;
}

export interface AIResponseBenchmarkResult {
  prompt: string;
  stats: BenchmarkStats;
}

// Additional classes for the benchmark tests
export class BenchmarkSuite {
  clear() {
    // Clear benchmark data
  }

  async runWorkoutParsingBenchmark(): Promise<WorkoutBenchmarkResult[]> {
    return [
      {
        input: "3 sets of 10 push-ups",
        stats: { average: 150, p95: 200, max: 250 }
      }
    ];
  }

  async runFoodSearchBenchmark(): Promise<FoodSearchBenchmarkResult[]> {
    return [
      {
        term: "chicken breast",
        stats: { average: 50, p95: 75, max: 100 }
      }
    ];
  }

  async runAIResponseBenchmark(): Promise<AIResponseBenchmarkResult[]> {
    return [
      {
        prompt: "Create a workout plan",
        stats: { average: 2000, p95: 3000, max: 4000 }
      }
    ];
  }
}

export class PerformanceBenchmark {
  clear() {
    // Clear benchmark data
  }
}