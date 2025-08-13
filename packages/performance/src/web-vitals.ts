import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },   // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  INP: { good: 200, needsImprovement: 500 },   // Interaction to Next Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
};

// Performance rating
export type PerformanceRating = 'good' | 'needs-improvement' | 'poor';

// Get performance rating
export function getPerformanceRating(
  metric: string,
  value: number
): PerformanceRating {
  const threshold = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
  
  if (!threshold) return 'poor';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

// Web Vitals reporter
export interface WebVitalsReport {
  metric: string;
  value: number;
  rating: PerformanceRating;
  timestamp: number;
  id: string;
  navigationType: string;
}

// Report Web Vitals
export function reportWebVitals(onReport: (report: WebVitalsReport) => void) {
  const reportMetric = (metric: Metric) => {
    const report: WebVitalsReport = {
      metric: metric.name,
      value: metric.value,
      rating: getPerformanceRating(metric.name, metric.value),
      timestamp: Date.now(),
      id: metric.id,
      navigationType: metric.navigationType || 'navigate',
    };
    
    onReport(report);
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${metric.name}]`, {
        value: metric.value,
        rating: report.rating,
        delta: metric.delta,
      });
    }
  };
  
  // Register all metrics
  onCLS(reportMetric);
  onFCP(reportMetric);
  onFID(reportMetric);
  onINP(reportMetric);
  onLCP(reportMetric);
  onTTFB(reportMetric);
}

// Send metrics to analytics endpoint
export async function sendToAnalytics(metrics: WebVitalsReport[]) {
  // Only send in production
  if (process.env.NODE_ENV !== 'production') return;
  
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics/vitals';
  
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metrics,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.error('Failed to send Web Vitals:', error);
  }
}

// Performance observer for custom metrics
export class CustomMetrics {
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();
  
  // Mark a point in time
  mark(name: string) {
    this.marks.set(name, performance.now());
  }
  
  // Measure between two marks
  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (!start) {
      console.warn(`Start mark "${startMark}" not found`);
      return 0;
    }
    
    const duration = (end || performance.now()) - start;
    this.measures.set(name, duration);
    
    // Create performance entry
    if (performance.measure) {
      performance.measure(name, startMark, endMark);
    }
    
    return duration;
  }
  
  // Get all measures
  getMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures);
  }
  
  // Clear marks and measures
  clear() {
    this.marks.clear();
    this.measures.clear();
  }
}

// React component render tracker
export function trackComponentRender(componentName: string) {
  const renderStart = performance.now();
  
  return () => {
    const renderTime = performance.now() - renderStart;
    
    // Log slow renders
    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
    }
    
    // Send to analytics if needed
    if (process.env.NODE_ENV === 'production' && renderTime > 100) {
      // Report very slow renders
      sendToAnalytics([{
        metric: 'component-render',
        value: renderTime,
        rating: renderTime < 16 ? 'good' : renderTime < 50 ? 'needs-improvement' : 'poor',
        timestamp: Date.now(),
        id: `${componentName}-${Date.now()}`,
        navigationType: 'component',
      }]);
    }
  };
}

// Navigation timing
export function getNavigationTiming() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;
  
  return {
    // Network timing
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ssl: navigation.secureConnectionStart > 0 
      ? navigation.connectEnd - navigation.secureConnectionStart 
      : 0,
    
    // Server timing
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    
    // Browser timing
    domInteractive: navigation.domInteractive - navigation.responseEnd,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    domComplete: navigation.domComplete - navigation.domInteractive,
    
    // Total timing
    total: navigation.loadEventEnd - navigation.fetchStart,
  };
}

// Resource timing
export function getResourceTiming() {
  if (typeof window === 'undefined' || !window.performance) {
    return [];
  }
  
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  return resources.map(resource => ({
    name: resource.name,
    type: resource.initiatorType,
    duration: resource.duration,
    size: resource.transferSize,
    protocol: resource.nextHopProtocol,
    cached: resource.transferSize === 0 && resource.decodedBodySize > 0,
    timing: {
      dns: resource.domainLookupEnd - resource.domainLookupStart,
      tcp: resource.connectEnd - resource.connectStart,
      ssl: resource.secureConnectionStart > 0
        ? resource.connectEnd - resource.secureConnectionStart
        : 0,
      ttfb: resource.responseStart - resource.requestStart,
      download: resource.responseEnd - resource.responseStart,
    },
  }));
}

// Long task observer
export function observeLongTasks(callback: (duration: number) => void) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Long tasks are tasks that block the main thread for 50ms or more
        if (entry.duration > 50) {
          callback(entry.duration);
        }
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
    
    return () => observer.disconnect();
  } catch (error) {
    console.warn('Long task observer not supported');
    return () => {};
  }
}