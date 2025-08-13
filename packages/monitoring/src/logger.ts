type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  
  private logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] >= this.logLevels[this.logLevel];
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.log(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage, error?.stack || '');
        break;
    }

    // In production, send to external logging service
    if (!this.isDevelopment && level === 'error' && error) {
      // This would integrate with Sentry or another service
      this.sendToExternalService(level, message, context, error);
    }
  }

  private sendToExternalService(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ) {
    // Placeholder for external logging service integration
    // This could be Sentry, LogRocket, DataDog, etc.
    try {
      // Example: Sentry integration
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          level,
          extra: { message, ...context },
        });
      }
    } catch (e) {
      // Fail silently to avoid breaking the app
      console.error('Failed to send log to external service:', e);
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, context, error);
  }

  // Specialized logging methods
  api(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this.log(
      level,
      `API ${method} ${path} ${statusCode} ${duration}ms`,
      context
    );
  }

  database(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    context?: LogContext
  ) {
    const level = success ? 'debug' : 'error';
    this.log(
      level,
      `DB ${operation} ${table} ${success ? 'SUCCESS' : 'FAILED'} ${duration}ms`,
      context
    );
  }

  performance(
    metric: string,
    value: number,
    unit: string,
    context?: LogContext
  ) {
    this.info(`PERF ${metric}: ${value}${unit}`, context);
  }

  security(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: LogContext
  ) {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    this.log(level, `SECURITY [${severity.toUpperCase()}] ${event}`, context);
  }
}

// Singleton instance
export const logger = new Logger();

// Middleware for Express/Next.js API routes
export const loggingMiddleware = (
  req: any,
  res: any,
  next: any
) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // Add request ID to request object
  req.requestId = requestId;

  // Log request
  logger.info(`Request ${req.method} ${req.url}`, {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Intercept response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    
    logger.api(
      req.method,
      req.url,
      res.statusCode,
      duration,
      {
        requestId,
        responseSize: JSON.stringify(data).length,
      }
    );

    originalSend.call(this, data);
  };

  next();
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      logger.error('Async handler error', error, {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
      });
      next(error);
    });
  };
};

// Performance timer
export class Timer {
  private startTime: number;
  private marks: Map<string, number>;

  constructor() {
    this.startTime = performance.now();
    this.marks = new Map();
  }

  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark?: string, endMark?: string) {
    const start = startMark ? this.marks.get(startMark) : this.startTime;
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (!start || !end) {
      logger.warn(`Invalid marks for measurement: ${name}`);
      return 0;
    }

    const duration = end - start;
    logger.performance(name, duration, 'ms');
    return duration;
  }

  getDuration() {
    return performance.now() - this.startTime;
  }
}