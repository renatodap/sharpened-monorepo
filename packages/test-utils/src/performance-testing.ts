// Performance testing utilities and benchmarking
export class PerformanceBenchmark {
  private measurements: Map<string, number[]> = new Map();
  private memoryBaseline: number = 0;

  constructor() {
    if (typeof performance !== 'undefined') {
      this.memoryBaseline = this.getMemoryUsage();
    }
  }

  // Time-based performance testing
  async measureAsync<T>(
    name: string, 
    operation: () => Promise<T>,
    iterations = 1
  ): Promise<{ result: T; stats: PerformanceStats }> {
    const durations: number[] = [];
    let result: T;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      result = await operation();
      const duration = performance.now() - start;
      durations.push(duration);
    }

    const stats = this.calculateStats(durations);
    this.measurements.set(name, durations);
    
    return { result: result!, stats };
  }

  measureSync<T>(
    name: string,
    operation: () => T,
    iterations = 1
  ): { result: T; stats: PerformanceStats } {
    const durations: number[] = [];
    let result: T;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      result = operation();
      const duration = performance.now() - start;
      durations.push(duration);
    }

    const stats = this.calculateStats(durations);
    this.measurements.set(name, durations);
    
    return { result: result!, stats };
  }

  // Memory usage testing
  measureMemoryUsage<T>(name: string, operation: () => T): T {
    const beforeMemory = this.getMemoryUsage();
    const result = operation();
    const afterMemory = this.getMemoryUsage();
    
    console.log(`Memory usage for ${name}:`, {
      before: this.formatMemory(beforeMemory),
      after: this.formatMemory(afterMemory),
      delta: this.formatMemory(afterMemory - beforeMemory)
    });

    return result;
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window as any).performance) {
      return (window as any).performance.memory.usedJSHeapSize;
    }
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  private formatMemory(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  // Component render performance
  measureRenderPerformance(componentName: string) {
    const measurements: number[] = [];
    let observer: PerformanceObserver | null = null;

    if (typeof PerformanceObserver !== 'undefined') {
      observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes(componentName)) {
            measurements.push(entry.duration);
          }
        });
      });

      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    }

    return {
      stop: () => {
        if (observer) {
          observer.disconnect();
        }
        return this.calculateStats(measurements);
      },
      getMeasurements: () => [...measurements]
    };
  }

  // API performance testing
  async benchmarkAPI(
    url: string,
    options: RequestInit = {},
    iterations = 10,
    concurrency = 1
  ): Promise<APIBenchmarkResult> {
    const results: APIResult[] = [];
    
    for (let batch = 0; batch < Math.ceil(iterations / concurrency); batch++) {
      const batchSize = Math.min(concurrency, iterations - batch * concurrency);
      const promises = Array(batchSize).fill(0).map(async () => {
        const start = performance.now();
        try {
          const response = await fetch(url, options);
          const duration = performance.now() - start;
          const size = parseInt(response.headers.get('content-length') || '0');
          
          return {
            duration,
            status: response.status,
            size,
            success: response.ok
          };
        } catch (error) {
          const duration = performance.now() - start;
          return {
            duration,
            status: 0,
            size: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
    }

    return this.analyzeAPIResults(results);
  }

  private analyzeAPIResults(results: APIResult[]): APIBenchmarkResult {
    const durations = results.map(r => r.duration);
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    return {
      totalRequests: results.length,
      successfulRequests: successfulResults.length,
      failedRequests: failedResults.length,
      successRate: (successfulResults.length / results.length) * 100,
      performanceStats: this.calculateStats(durations),
      averageResponseSize: successfulResults.length > 0 
        ? successfulResults.reduce((sum, r) => sum + r.size, 0) / successfulResults.length 
        : 0,
      errors: failedResults.map(r => r.error).filter(Boolean) as string[]
    };
  }

  // Bundle size analysis
  async analyzeBundleSize(bundlePath: string): Promise<BundleSizeAnalysis> {
    try {
      const response = await fetch(bundlePath);
      const text = await response.text();
      
      return {
        totalSize: text.length,
        gzipEstimate: this.estimateGzipSize(text),
        jsSize: this.analyzeJavaScriptSize(text),
        cssSize: this.analyzeCSSSize(text),
        recommendations: this.generateBundleRecommendations(text)
      };
    } catch (error) {
      throw new Error(`Failed to analyze bundle: ${error}`);
    }
  }

  private estimateGzipSize(content: string): number {
    // Rough estimation of gzip compression (typically 70-80% reduction)
    return Math.floor(content.length * 0.3);
  }

  private analyzeJavaScriptSize(content: string): number {
    const jsMatches = content.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    return jsMatches.reduce((total, match) => total + match.length, 0);
  }

  private analyzeCSSSize(content: string): number {
    const cssMatches = content.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || [];
    const linkMatches = content.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [];
    return cssMatches.reduce((total, match) => total + match.length, 0) + 
           linkMatches.reduce((total, match) => total + match.length, 0);
  }

  private generateBundleRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const size = content.length;

    if (size > 1000000) { // 1MB
      recommendations.push('Bundle size is large. Consider code splitting.');
    }

    if (content.includes('node_modules')) {
      recommendations.push('Bundle may include unnecessary node_modules. Check tree shaking.');
    }

    if (!content.includes('async') && !content.includes('defer')) {
      recommendations.push('Consider using async/defer for script loading.');
    }

    return recommendations;
  }

  // Component performance profiling
  profileComponent<T extends Record<string, any>>(
    componentName: string,
    props: T,
    renderFunction: (props: T) => any
  ) {
    const profile = {
      componentName,
      renderTime: 0,
      memoryDelta: 0,
      propsSerialized: JSON.stringify(props),
      timestamp: new Date().toISOString()
    };

    const beforeMemory = this.getMemoryUsage();
    const { stats } = this.measureSync(`${componentName}_render`, () => 
      renderFunction(props)
    );

    profile.renderTime = stats.average;
    profile.memoryDelta = this.getMemoryUsage() - beforeMemory;

    return profile;
  }

  // Statistical analysis
  private calculateStats(values: number[]): PerformanceStats {
    if (values.length === 0) {
      return {
        min: 0, max: 0, average: 0, median: 0,
        p95: 0, p99: 0, standardDeviation: 0, count: 0
      };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;

    const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      average,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      standardDeviation,
      count: values.length
    };
  }

  // Reporting
  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      measurements: {},
      summary: {
        totalMeasurements: this.measurements.size,
        slowestOperations: [],
        memoryDelta: this.getMemoryUsage() - this.memoryBaseline
      }
    };

    // Process each measurement
    for (const [name, values] of this.measurements.entries()) {
      const stats = this.calculateStats(values);
      report.measurements[name] = stats;

      // Track slowest operations
      report.summary.slowestOperations.push({
        name,
        averageTime: stats.average
      });
    }

    // Sort slowest operations
    report.summary.slowestOperations.sort((a, b) => b.averageTime - a.averageTime);
    report.summary.slowestOperations = report.summary.slowestOperations.slice(0, 5);

    return report;
  }

  // Performance assertions for tests
  expectPerformance(name: string, maxDuration: number) {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) {
      throw new Error(`No measurements found for ${name}`);
    }

    const stats = this.calculateStats(measurements);
    if (stats.average > maxDuration) {
      throw new Error(
        `Performance assertion failed: ${name} averaged ${stats.average.toFixed(2)}ms, ` +
        `expected less than ${maxDuration}ms`
      );
    }
  }

  clear() {
    this.measurements.clear();
    this.memoryBaseline = this.getMemoryUsage();
  }
}

// Types for performance testing
export interface PerformanceStats {
  min: number;
  max: number;
  average: number;
  median: number;
  p95: number;
  p99: number;
  standardDeviation: number;
  count: number;
}

interface APIResult {
  duration: number;
  status: number;
  size: number;
  success: boolean;
  error?: string;
}

export interface APIBenchmarkResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  performanceStats: PerformanceStats;
  averageResponseSize: number;
  errors: string[];
}

interface BundleSizeAnalysis {
  totalSize: number;
  gzipEstimate: number;
  jsSize: number;
  cssSize: number;
  recommendations: string[];
}

interface PerformanceReport {
  timestamp: string;
  measurements: Record<string, PerformanceStats>;
  summary: {
    totalMeasurements: number;
    slowestOperations: Array<{ name: string; averageTime: number }>;
    memoryDelta: number;
  };
}

// Pre-configured benchmark suite
export class BenchmarkSuite {
  private benchmark = new PerformanceBenchmark();

  async runWorkoutParsingBenchmark() {
    const testInputs = [
      'bench press 3x8 at 100kg',
      'squats 4x5 at 120kg, deadlift 1x5 at 150kg',
      'running 30 minutes at moderate pace',
      'full body workout: pushups 3x12, pullups 3x8, squats 3x15, plank 3x60s'
    ];

    const results = [];
    for (const input of testInputs) {
      const { stats } = await this.benchmark.measureAsync(
        `workout_parsing_${input.length}_chars`,
        () => this.mockWorkoutParsing(input),
        5
      );
      results.push({ input, stats });
    }

    return results;
  }

  async runFoodSearchBenchmark() {
    const searchTerms = ['chicken', 'banana', 'oatmeal', 'salmon'];
    const results = [];

    for (const term of searchTerms) {
      const { stats } = await this.benchmark.measureAsync(
        `food_search_${term}`,
        () => this.mockFoodSearch(term),
        10
      );
      results.push({ term, stats });
    }

    return results;
  }

  async runAIResponseBenchmark() {
    const prompts = [
      'Analyze my workout progress',
      'Suggest a meal plan',
      'Explain this exercise form',
      'Create a workout program'
    ];

    const results = [];
    for (const prompt of prompts) {
      const { stats } = await this.benchmark.measureAsync(
        `ai_response_${prompt.split(' ').length}_words`,
        () => this.mockAIResponse(prompt),
        3
      );
      results.push({ prompt, stats });
    }

    return results;
  }

  // Mock implementations for testing
  private async mockWorkoutParsing(input: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    return {
      title: 'Parsed Workout',
      exercises: [{ name: 'exercise', sets: [{ reps: 8, weight: 100 }] }]
    };
  }

  private async mockFoodSearch(term: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 20));
    return [
      { id: 1, name: `${term} result 1`, calories: 100 },
      { id: 2, name: `${term} result 2`, calories: 150 }
    ];
  }

  private async mockAIResponse(prompt: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    return `AI response to: ${prompt}`;
  }

  generateReport() {
    return this.benchmark.generateReport();
  }

  clear() {
    this.benchmark.clear();
  }
}

// Usage example in tests
export const createPerformanceTest = () => {
  const benchmark = new PerformanceBenchmark();
  
  return {
    measure: benchmark.measureAsync.bind(benchmark),
    measureSync: benchmark.measureSync.bind(benchmark),
    measureMemory: benchmark.measureMemoryUsage.bind(benchmark),
    expectPerformance: benchmark.expectPerformance.bind(benchmark),
    report: benchmark.generateReport.bind(benchmark),
    clear: benchmark.clear.bind(benchmark)
  };
};