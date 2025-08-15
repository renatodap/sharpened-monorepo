import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth'
import { Analytics } from '@/components/analytics/Analytics'
import { PWAProvider } from '@/components/pwa/PWAProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CourtSync - Tennis Team Management',
  description: 'Complete tennis team management for NCAA Division III programs. Schedule courts, coordinate travel, analyze video, and scout opponents.',
  manifest: '/manifest.json',
  themeColor: '#0B2A4A',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CourtSync',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'CourtSync - Tennis Team Management',
    description: 'Complete tennis team management for NCAA Division III programs',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'CourtSync',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CourtSync - Tennis Team Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CourtSync - Tennis Team Management',
    description: 'Complete tennis team management for NCAA Division III programs',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B2A4A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CourtSync" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Prefetch critical routes */}
        <link rel="prefetch" href="/app" />
        <link rel="prefetch" href="/auth/signin" />
      </head>
      <body className={`${inter.className} bg-bg text-text-primary antialiased`}>
        <PWAProvider>
          <AuthProvider>
            <div className="min-h-screen bg-bg">
              {children}
            </div>
            <Analytics />
          </AuthProvider>
        </PWAProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}