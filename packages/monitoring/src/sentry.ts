import * as Sentry from '@sentry/nextjs';
import type { User } from '@sentry/types';

interface SentryConfig {
  dsn?: string;
  environment: string;
  enabled?: boolean;
  tracesSampleRate?: number;
  debug?: boolean;
  release?: string;
}

// Initialize Sentry
export const initSentry = (config: SentryConfig) => {
  if (!config.enabled || !config.dsn) {
    console.log('Sentry disabled or DSN not provided');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    tracesSampleRate: config.tracesSampleRate || 0.1,
    debug: config.debug || false,
    release: config.release,
    
    // Performance Monitoring
    integrations: [
      new Sentry.BrowserTracing({
        tracingOrigins: ['localhost', /^https:\/\/.*\.feelsharper\.com/],
        routingInstrumentation: Sentry.nextRouterInstrumentation,
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
        sampleRate: config.environment === 'production' ? 0.1 : 1.0,
        errorSampleRate: 1.0,
      }),
    ],
    
    // Release Health
    autoSessionTracking: true,
    
    // Filtering
    beforeSend(event, hint) {
      // Filter out non-error events in production
      if (config.environment === 'production' && !hint.originalException) {
        return null;
      }
      
      // Filter out specific errors
      const error = hint.originalException as Error;
      if (error?.message?.includes('ResizeObserver loop limit exceeded')) {
        return null;
      }
      
      // Sanitize sensitive data
      if (event.request?.cookies) {
        event.request.cookies = '[REDACTED]';
      }
      
      return event;
    },
    
    // Ignore specific errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'Network request failed',
      'Load failed',
    ],
  });
};

// Capture exception with context
export const captureException = (
  error: Error,
  context?: Record<string, any>,
  level: Sentry.SeverityLevel = 'error'
) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    scope.setLevel(level);
    Sentry.captureException(error);
  });
};

// Capture message
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('additional', context);
    }
    scope.setLevel(level);
    Sentry.captureMessage(message);
  });
};

// Set user context
export const setUser = (user: User | null) => {
  Sentry.setUser(user);
};

// Add breadcrumb
export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, any>
) => {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
};

// Create transaction for performance monitoring
export const startTransaction = (
  name: string,
  op: string,
  description?: string
) => {
  return Sentry.startTransaction({
    name,
    op,
    description,
  });
};

// Error boundary component for React
export const ErrorBoundary = Sentry.ErrorBoundary;

// Profiler component for React
export const Profiler = Sentry.Profiler;

// Wrap API routes with error handling
export const withSentry = (handler: any) => Sentry.withSentry(handler);

// Custom error classes
export class ApplicationError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  
  constructor(
    message: string,
    statusCode = 500,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}