import type { NextRequest, NextResponse } from 'next/server';

// Security headers configuration
export const securityHeaders = {
  // Prevent XSS attacks
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent clickjacking
  'X-Frame-Options': 'SAMEORIGIN',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (formerly Feature Policy)
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  
  // DNS prefetch control
  'X-DNS-Prefetch-Control': 'on',
  
  // Strict transport security (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Download options
  'X-Download-Options': 'noopen',
  
  // Permitted cross-domain policies
  'X-Permitted-Cross-Domain-Policies': 'none',
};

// Apply security headers to Next.js response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Middleware for Express/Node.js apps
export function securityHeadersMiddleware(req: any, res: any, next: any) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  next();
}

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://feelsharper.com',
      'https://www.feelsharper.com',
      'https://studysharper.com',
      'https://www.studysharper.com',
      'https://sharpened.dev',
      'https://www.sharpened.dev',
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // In development, allow all origins
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400, // 24 hours
};

// Security checks for API routes
export function validateApiRequest(request: NextRequest): {
  isValid: boolean;
  error?: string;
} {
  // Check for suspicious patterns
  const url = request.url;
  const suspiciousPatterns = [
    /\.\.\//g, // Path traversal
    /<script/gi, // XSS attempt
    /javascript:/gi, // XSS attempt
    /on\w+=/gi, // Event handlers
    /union.*select/gi, // SQL injection
    /drop.*table/gi, // SQL injection
    /insert.*into/gi, // SQL injection
    /select.*from/gi, // SQL injection
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      return {
        isValid: false,
        error: 'Suspicious request pattern detected',
      };
    }
  }
  
  // Check request size
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return {
      isValid: false,
      error: 'Request body too large',
    };
  }
  
  // Check for required headers in production
  if (process.env.NODE_ENV === 'production') {
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.length < 10) {
      return {
        isValid: false,
        error: 'Invalid user agent',
      };
    }
  }
  
  return { isValid: true };
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove potential XSS vectors
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<img[^>]*>/gi, '');
  
  // Remove SQL injection attempts
  sanitized = sanitized
    .replace(/(\b(select|insert|update|delete|drop|union|exec|execute)\b)/gi, '')
    .replace(/[';]/g, '');
  
  // Trim and limit length
  sanitized = sanitized.trim().substring(0, 10000);
  
  return sanitized;
}

// Validate file uploads
export function validateFileUpload(file: {
  name: string;
  size: number;
  type: string;
}): {
  isValid: boolean;
  error?: string;
} {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
  ];
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} not allowed`,
    };
  }
  
  // Check file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return {
      isValid: false,
      error: 'File size exceeds 10MB limit',
    };
  }
  
  // Check file name for suspicious patterns
  const suspiciousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.com', '.scr'];
  const fileName = file.name.toLowerCase();
  
  for (const ext of suspiciousExtensions) {
    if (fileName.endsWith(ext)) {
      return {
        isValid: false,
        error: 'Suspicious file extension detected',
      };
    }
  }
  
  // Check for double extensions
  if ((fileName.match(/\./g) || []).length > 1) {
    const parts = fileName.split('.');
    const lastTwo = parts.slice(-2).join('.');
    if (suspiciousExtensions.some(ext => lastTwo.includes(ext))) {
      return {
        isValid: false,
        error: 'Suspicious double extension detected',
      };
    }
  }
  
  return { isValid: true };
}