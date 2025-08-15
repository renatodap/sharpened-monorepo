import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Sharpened Brand System Colors
      colors: {
        // Primary Brand
        navy: {
          DEFAULT: '#0B2A4A',
          light: '#1A3B5C',
          dark: '#051A2F',
        },
        
        // Backgrounds
        bg: '#0A0A0A',
        surface: '#151515',
        'surface-elevated': '#1F1F1F',
        
        // Text Colors
        text: {
          primary: '#FFFFFF',
          secondary: '#C7CBD1',
          muted: '#8B9096',
          dark: '#4A4A4A',
        },
        
        // Status Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        
        // Court/Tennis Specific
        court: {
          outdoor: '#10B981',
          indoor: '#3B82F6',
          bubble: '#8B5CF6',
        },
      },
      
      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      
      // Spacing for Mobile-First Design
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      
      // Mobile-Friendly Touch Targets
      minHeight: {
        'touch': '44px', // iOS minimum touch target
      },
      
      minWidth: {
        'touch': '44px',
      },
      
      // Animation & Transitions
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-subtle': 'bounceSubtle 1s infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
      },
      
      // Box Shadows for Depth
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'hard': '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(11, 42, 74, 0.3)',
      },
      
      // Border Radius
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      
      // Grid Templates for Calendar
      gridTemplateColumns: {
        'calendar': 'repeat(7, minmax(0, 1fr))',
        'court-grid': 'repeat(auto-fit, minmax(280px, 1fr))',
      },
      
      // Backdrop Blur for Glass Effect
      backdropBlur: {
        'xs': '2px',
      },
      
      // Z-Index Scale
      zIndex: {
        'modal': '100',
        'overlay': '90',
        'header': '80',
        'nav': '70',
        'toast': '110',
      },
    },
  },
  plugins: [
    // Form Styling
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    
    // Container Queries
    require('@tailwindcss/container-queries'),
    
    // Custom Plugins
    function({ addUtilities }: any) {
      addUtilities({
        // Touch-friendly utilities
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        
        // Safe area utilities for mobile
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        
        // Scrollbar styling
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            'display': 'none',
          },
        },
        
        // Glass morphism effect
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        
        // Tennis court specific utilities
        '.court-outdoor': {
          'background': 'linear-gradient(135deg, #10B981, #059669)',
        },
        '.court-indoor': {
          'background': 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
        },
        '.court-bubble': {
          'background': 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
        },
      })
    },
  ],
}

export default config