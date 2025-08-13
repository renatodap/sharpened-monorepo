import type { Metadata } from "next";
import { Inter, Crimson_Text, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { UpgradeBanner } from "@/components/premium/UpgradePrompt";
import { PWAProvider } from "@/components/pwa/PWAProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const crimson = Crimson_Text({
  subsets: ["latin"],
  variable: "--font-crimson",
  weight: ["400", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Feel Sharper | Your Sharpest Self, Every Day",
  description: "Your all-in-one performance platform — tracking your workouts, nutrition, and recovery while keeping you motivated through AI-driven coaching and community support.",
  keywords: ["fitness tracking", "workout log", "nutrition", "AI coaching", "performance", "health metrics", "recovery", "evidence-based"],
  authors: [{ name: "Feel Sharper" }],
  creator: "Feel Sharper",
  publisher: "Feel Sharper",
  metadataBase: new URL('https://feelsharper.com'),
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Feel Sharper | Your Sharpest Self, Every Day",
    description: "Your all-in-one performance platform — tracking your workouts, nutrition, and recovery while keeping you motivated through AI-driven coaching and community support.",
    url: 'https://feelsharper.com',
    siteName: 'Feel Sharper',
    type: 'website',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Feel Sharper - Your Sharpest Self, Every Day',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Feel Sharper | Your Sharpest Self, Every Day",
    description: "Your all-in-one performance platform — tracking your workouts, nutrition, and recovery with AI-driven coaching.",
    images: ['/images/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Feel Sharper',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Feel Sharper',
    'application-name': 'Feel Sharper',
    'msapplication-TileColor': '#0B2A4A',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#0B2A4A',
  },
};

/**
 * Root layout component - ensures single header/footer rendering
 * Provides consistent typography, theming, and layout structure
 * Fixed: Removed duplicate AskFeelSharper to prevent layout conflicts
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${crimson.variable} ${jetbrainsMono.variable} scroll-smooth`}>
      <head>
        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-640x1136-iphone5.svg" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-750x1334-iphone6.svg" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1242x2208-iphone6plus.svg" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-828x1792-iphonexr.svg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1125x2436-iphonex.svg" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1242x2688-iphonexsmax.svg" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1170x2532-iphone12.svg" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1284x2778-iphone12promax.svg" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1536x2048-ipad.svg" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1668x2224-ipadpro10.svg" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-1668x2388-ipadpro11.svg" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/apple-splash-2048x2732-ipadpro12.svg" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png.svg" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png.svg" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-128x128.png.svg" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/icon-128x128.png.svg" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/icon-72x72.png.svg" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png.svg" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/icon-72x72.png.svg" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/icon-72x72.png.svg" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/icons/icon-72x72.png.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-72x72.png.svg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png.svg" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-bg text-text-primary">
        <ThemeProvider>
          <PWAProvider>
            <UpgradeBanner />
            {children}
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
