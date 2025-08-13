// Analytics tracking utilities (privacy-focused)

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

interface AnalyticsConfig {
  enabled: boolean;
  debug?: boolean;
  endpoint?: string;
  anonymizeIp?: boolean;
  respectDoNotTrack?: boolean;
}

class Analytics {
  private config: AnalyticsConfig;
  private queue: AnalyticsEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isInitialized = false;

  constructor() {
    this.config = {
      enabled: false,
      debug: process.env.NODE_ENV === 'development',
      anonymizeIp: true,
      respectDoNotTrack: true,
    };
    this.sessionId = this.generateSessionId();
  }

  init(config: Partial<AnalyticsConfig>) {
    this.config = { ...this.config, ...config };

    // Respect Do Not Track
    if (this.config.respectDoNotTrack && this.isDoNotTrackEnabled()) {
      this.config.enabled = false;
      console.log('Analytics disabled: Do Not Track is enabled');
      return;
    }

    // Check for user consent
    if (!this.hasUserConsent()) {
      this.config.enabled = false;
      console.log('Analytics disabled: No user consent');
      return;
    }

    this.isInitialized = true;
    
    // Process queued events
    if (this.queue.length > 0) {
      this.flush();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private isDoNotTrackEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    
    const dnt = navigator.doNotTrack || (window as any).doNotTrack || (navigator as any).msDoNotTrack;
    return dnt === '1' || dnt === 'yes';
  }

  private hasUserConsent(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for consent cookie or localStorage
    const consent = localStorage.getItem('analytics-consent');
    return consent === 'true';
  }

  setUserConsent(hasConsent: boolean) {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('analytics-consent', String(hasConsent));
    this.config.enabled = hasConsent && !this.isDoNotTrackEnabled();
    
    if (hasConsent) {
      this.flush();
    } else {
      this.clearData();
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (!this.config.enabled) return;
    
    this.userId = userId;
    this.track('User Identified', traits);
  }

  track(eventName: string, properties?: Record<string, any>) {
    if (!this.config.enabled) {
      if (this.config.debug) {
        console.log('[Analytics Debug] Event:', eventName, properties);
      }
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    if (!this.isInitialized) {
      this.queue.push(event);
      return;
    }

    this.sendEvent(event);
  }

  page(name?: string, properties?: Record<string, any>) {
    const pageName = name || (typeof window !== 'undefined' ? window.location.pathname : 'unknown');
    this.track('Page Viewed', {
      page: pageName,
      ...properties,
    });
  }

  // Common event helpers
  trackClick(elementId: string, properties?: Record<string, any>) {
    this.track('Element Clicked', {
      elementId,
      ...properties,
    });
  }

  trackFormSubmit(formId: string, properties?: Record<string, any>) {
    this.track('Form Submitted', {
      formId,
      ...properties,
    });
  }

  trackSearch(query: string, results?: number, properties?: Record<string, any>) {
    this.track('Search Performed', {
      query,
      resultsCount: results,
      ...properties,
    });
  }

  trackError(error: Error, properties?: Record<string, any>) {
    this.track('Error Occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      ...properties,
    });
  }

  trackTiming(category: string, variable: string, time: number, label?: string) {
    this.track('Timing Tracked', {
      category,
      variable,
      time,
      label,
    });
  }

  trackPurchase(orderId: string, total: number, items: any[], properties?: Record<string, any>) {
    this.track('Purchase Completed', {
      orderId,
      total,
      items,
      currency: 'USD',
      ...properties,
    });
  }

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) return undefined;

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(properties)) {
      // Remove sensitive fields
      if (this.isSensitiveField(key)) continue;
      
      // Sanitize values
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeProperties(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private isSensitiveField(field: string): boolean {
    const sensitiveFields = [
      'password',
      'token',
      'apiKey',
      'secret',
      'creditCard',
      'ssn',
      'email', // Optionally include email
    ];
    
    return sensitiveFields.some((sensitive) => 
      field.toLowerCase().includes(sensitive.toLowerCase())
    );
  }

  private sanitizeString(value: string): string {
    // Remove potential PII patterns
    // Email addresses
    value = value.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]');
    
    // Phone numbers
    value = value.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
    
    // Credit card numbers
    value = value.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]');
    
    return value;
  }

  private async sendEvent(event: AnalyticsEvent) {
    if (!this.config.endpoint) {
      // Log to console in development
      if (this.config.debug) {
        console.log('[Analytics]', event);
      }
      return;
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          context: this.getContext(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('[Analytics Error]', error);
      }
    }
  }

  private getContext() {
    if (typeof window === 'undefined') {
      return {
        environment: 'server',
      };
    }

    return {
      environment: 'client',
      page: {
        url: window.location.href,
        path: window.location.pathname,
        referrer: document.referrer,
        title: document.title,
      },
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private flush() {
    if (this.queue.length === 0) return;
    
    const events = [...this.queue];
    this.queue = [];
    
    events.forEach((event) => this.sendEvent(event));
  }

  private clearData() {
    this.queue = [];
    this.userId = undefined;
    this.sessionId = this.generateSessionId();
  }

  reset() {
    this.clearData();
  }
}

// Singleton instance
export const analytics = new Analytics();

// React hook for analytics
export const useAnalytics = () => {
  return {
    track: (eventName: string, properties?: Record<string, any>) => 
      analytics.track(eventName, properties),
    page: (name?: string, properties?: Record<string, any>) => 
      analytics.page(name, properties),
    identify: (userId: string, traits?: Record<string, any>) => 
      analytics.identify(userId, traits),
  };
};

// Event tracking decorator for class methods
export function TrackEvent(eventName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const name = eventName || `${target.constructor.name}.${propertyKey}`;
      const startTime = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        analytics.track(name, {
          success: true,
          duration: Date.now() - startTime,
        });
        return result;
      } catch (error) {
        analytics.track(name, {
          success: false,
          duration: Date.now() - startTime,
          error: (error as Error).message,
        });
        throw error;
      }
    };
    
    return descriptor;
  };
}