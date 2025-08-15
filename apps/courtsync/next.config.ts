import type { NextConfig } from 'next'

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  // PWA Configuration
  experimental: {
    optimizeCss: true,
    serverComponentsExternalPackages: ['postgres'],
  },

  // Performance Optimizations
  poweredByHeader: false,
  compress: true,
  
  // Bundle Optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize chunks for mobile
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 200000, // 200KB limit for mobile
          },
        },
      }
    }
    return config
  },

  // Image Optimization
  images: {
    domains: [
      'localhost',
      // Add Supabase storage domain when configured
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers for Security and Performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/app',
        permanent: true,
      },
    ]
  },

  // Environment Variables Validation
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
}

export default withBundleAnalyzer(nextConfig)