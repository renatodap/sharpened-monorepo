// Content Security Policy configuration

export interface CSPConfig {
  reportOnly?: boolean;
  reportUri?: string;
  nonce?: string;
}

// Generate Content Security Policy
export function generateCSP(config: CSPConfig = {}): string {
  const { reportOnly = false, reportUri, nonce } = config;
  
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    
    'script-src': [
      "'self'",
      nonce ? `'nonce-${nonce}'` : "'unsafe-inline'", // Use nonce in production
      "'unsafe-eval'", // Required for Next.js in dev
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://vercel.live',
    ],
    
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for inline styles
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
    ],
    
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      'http://localhost:*',
    ],
    
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
    ],
    
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'https://*.supabase.in',
      'https://api.anthropic.com',
      'https://api.openai.com',
      'https://www.google-analytics.com',
      'https://vitals.vercel-insights.com',
      'wss://*.supabase.co',
      'wss://*.supabase.in',
      process.env.NODE_ENV === 'development' ? 'ws://localhost:*' : '',
      process.env.NODE_ENV === 'development' ? 'http://localhost:*' : '',
    ].filter(Boolean),
    
    'media-src': ["'self'", 'blob:', 'data:'],
    
    'object-src': ["'none'"],
    
    'frame-src': [
      "'self'",
      'https://www.youtube.com',
      'https://player.vimeo.com',
    ],
    
    'frame-ancestors': ["'self'"],
    
    'base-uri': ["'self'"],
    
    'form-action': ["'self'"],
    
    'manifest-src': ["'self'"],
    
    'worker-src': ["'self'", 'blob:'],
    
    'child-src': ["'self'", 'blob:'],
  };
  
  // Add report URI if provided
  if (reportUri) {
    directives['report-uri'] = [reportUri];
    directives['report-to'] = ['csp-endpoint'];
  }
  
  // Build CSP string
  const cspString = Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
  
  return cspString;
}

// Generate nonce for inline scripts
export function generateNonce(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for Node.js
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Buffer.from(array).toString('base64');
}

// CSP middleware for Next.js
export function cspMiddleware(req: any, res: any, next: any) {
  const nonce = generateNonce();
  const csp = generateCSP({ nonce });
  
  // Store nonce for use in rendering
  res.locals = res.locals || {};
  res.locals.nonce = nonce;
  
  // Set CSP header
  res.setHeader('Content-Security-Policy', csp);
  
  // Set Report-To header for CSP reporting
  const reportTo = {
    group: 'csp-endpoint',
    max_age: 10886400,
    endpoints: [
      {
        url: process.env.CSP_REPORT_URI || '/api/csp-report',
      },
    ],
  };
  
  res.setHeader('Report-To', JSON.stringify(reportTo));
  
  next();
}

// CSP violation report handler
export async function handleCSPReport(request: Request): Promise<Response> {
  try {
    const report = await request.json();
    
    // Log CSP violation
    console.warn('CSP Violation:', {
      documentUri: report['csp-report']?.['document-uri'],
      violatedDirective: report['csp-report']?.['violated-directive'],
      blockedUri: report['csp-report']?.['blocked-uri'],
      sourceFile: report['csp-report']?.['source-file'],
      lineNumber: report['csp-report']?.['line-number'],
      columnNumber: report['csp-report']?.['column-number'],
    });
    
    // In production, you might want to send this to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
      // await sendToMonitoring(report);
    }
    
    return new Response('CSP report received', { status: 204 });
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return new Response('Error processing report', { status: 500 });
  }
}

// Trusted types policy (for browsers that support it)
export const trustedTypesPolicy = `
  trusted-types default dompurify;
  require-trusted-types-for 'script';
`;

// Subresource Integrity (SRI) hash generator
export async function generateSRIHash(content: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    // Fallback for environments without Web Crypto API
    return '';
  }
  
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-384', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  return `sha384-${hashBase64}`;
}

// Feature Policy configuration
export const featurePolicy = {
  'accelerometer': ["'none'"],
  'ambient-light-sensor': ["'none'"],
  'autoplay': ["'self'"],
  'battery': ["'none'"],
  'camera': ["'none'"],
  'display-capture': ["'none'"],
  'document-domain': ["'none'"],
  'encrypted-media': ["'self'"],
  'fullscreen': ["'self'"],
  'geolocation': ["'none'"],
  'gyroscope': ["'none'"],
  'magnetometer': ["'none'"],
  'microphone': ["'none'"],
  'midi': ["'none'"],
  'payment': ["'self'"],
  'picture-in-picture': ["'self'"],
  'publickey-credentials-get': ["'none'"],
  'sync-xhr': ["'none'"],
  'usb': ["'none'"],
  'xr-spatial-tracking': ["'none'"],
};

// Generate Feature Policy header
export function generateFeaturePolicy(): string {
  return Object.entries(featurePolicy)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}