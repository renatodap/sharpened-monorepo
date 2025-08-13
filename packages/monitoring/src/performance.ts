// Performance monitoring utilities

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  // Web Vitals monitoring
  initWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // First Input Delay (FID)
    this.observeFID();
    
    // Cumulative Layout Shift (CLS)
    this.observeCLS();
    
    // First Contentful Paint (FCP)
    this.observeFCP();
    
    // Time to First Byte (TTFB)
    this.observeTTFB();
    
    // Interaction to Next Paint (INP)
    this.observeINP();
  }

  private observeLCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      this.recordMetric({
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { url: window.location.href },
      });
    });

    try {
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.set('lcp', observer);
    } catch (e) {
      // LCP is not supported
    }
  }

  private observeFID() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.name === 'first-input') {
          this.recordMetric({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
            tags: { eventType: entry.name },
          });
        }
      });
    });

    try {
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.set('fid', observer);
    } catch (e) {
      // FID is not supported
    }
  }

  private observeCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let clsEntries: any[] = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      });

      // Record CLS when it stabilizes
      if (clsEntries.length > 0) {
        this.recordMetric({
          name: 'CLS',
          value: clsValue,
          unit: 'score',
          timestamp: Date.now(),
        });
      }
    });

    try {
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.set('cls', observer);
    } catch (e) {
      // CLS is not supported
    }
  }

  private observeFCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric({
            name: 'FCP',
            value: entry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
          });
        }
      });
    });

    try {
      observer.observe({ type: 'paint', buffered: true });
      this.observers.set('fcp', observer);
    } catch (e) {
      // FCP is not supported
    }
  }

  private observeTTFB() {
    if (!('performance' in window)) return;

    const navigationTiming = performance.getEntriesByType('navigation')[0] as any;
    if (navigationTiming) {
      const ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
      this.recordMetric({
        name: 'TTFB',
        value: ttfb,
        unit: 'ms',
        timestamp: Date.now(),
      });
    }
  }

  private observeINP() {
    if (!('PerformanceObserver' in window)) return;

    let maxDuration = 0;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.duration > maxDuration) {
          maxDuration = entry.duration;
          this.recordMetric({
            name: 'INP',
            value: maxDuration,
            unit: 'ms',
            timestamp: Date.now(),
            tags: { interactionType: entry.name },
          });
        }
      });
    });

    try {
      observer.observe({ type: 'event', buffered: true });
      this.observers.set('inp', observer);
    } catch (e) {
      // INP is not supported
    }
  }

  // Record custom metric
  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERF] ${metric.name}: ${metric.value}${metric.unit}`, metric.tags);
    }

    // Send to analytics service
    this.sendToAnalytics(metric);
  }

  // Send metrics to analytics service
  private sendToAnalytics(metric: PerformanceMetric) {
    // This would integrate with your analytics service
    // Example: Google Analytics, Mixpanel, or custom backend
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance', {
        metric_name: metric.name,
        value: metric.value,
        unit: metric.unit,
        ...metric.tags,
      });
    }
  }

  // Get all recorded metrics
  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = [];
  }

  // Disconnect all observers
  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }

  // Measure function execution time
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
      });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { error: 'true' },
      });
      throw error;
    }
  }

  // Measure sync function execution time
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
      });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
        tags: { error: 'true' },
      });
      throw error;
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformance = (componentName: string) => {
  const renderStart = performance.now();

  if (typeof window !== 'undefined') {
    // Record component render time
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStart;
      performanceMonitor.recordMetric({
        name: `Component.${componentName}.render`,
        value: renderTime,
        unit: 'ms',
        timestamp: Date.now(),
      });
    });
  }

  return {
    measureAsync: (name: string, fn: () => Promise<any>) =>
      performanceMonitor.measureAsync(`${componentName}.${name}`, fn),
    measure: (name: string, fn: () => any) =>
      performanceMonitor.measure(`${componentName}.${name}`, fn),
  };
};

// Resource timing utilities
export const getResourceTimings = () => {
  if (!('performance' in window)) return [];

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  return resources.map((resource) => ({
    name: resource.name,
    type: resource.initiatorType,
    duration: resource.duration,
    size: resource.transferSize,
    cached: resource.transferSize === 0 && resource.decodedBodySize > 0,
    protocol: resource.nextHopProtocol,
    timing: {
      dns: resource.domainLookupEnd - resource.domainLookupStart,
      tcp: resource.connectEnd - resource.connectStart,
      ttfb: resource.responseStart - resource.requestStart,
      download: resource.responseEnd - resource.responseStart,
    },
  }));
};

// Bundle size tracking
export const trackBundleSize = () => {
  if (!('performance' in window)) return;

  const resources = getResourceTimings();
  const jsResources = resources.filter((r) => r.type === 'script');
  const cssResources = resources.filter((r) => r.type === 'link');

  const totalJsSize = jsResources.reduce((sum, r) => sum + r.size, 0);
  const totalCssSize = cssResources.reduce((sum, r) => sum + r.size, 0);

  performanceMonitor.recordMetric({
    name: 'bundle.js.size',
    value: totalJsSize,
    unit: 'bytes',
    timestamp: Date.now(),
    tags: { count: String(jsResources.length) },
  });

  performanceMonitor.recordMetric({
    name: 'bundle.css.size',
    value: totalCssSize,
    unit: 'bytes',
    timestamp: Date.now(),
    tags: { count: String(cssResources.length) },
  });
};