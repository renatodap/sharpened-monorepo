import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Intersection Observer options
interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

// useLazyLoad hook
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>(
  options: LazyLoadOptions = {}
) {
  const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<T>(null);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting;
        
        if (intersecting && triggerOnce && hasTriggered.current) {
          return;
        }
        
        setIsIntersecting(intersecting);
        
        if (intersecting && triggerOnce) {
          hasTriggered.current = true;
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: targetRef, isIntersecting };
}

// LazyLoad component wrapper
interface LazyLoadProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  options?: LazyLoadOptions;
  className?: string;
}

export function LazyLoad({
  children,
  placeholder = <div>Loading...</div>,
  onLoad,
  options = {},
  className,
}: LazyLoadProps) {
  const { ref, isIntersecting } = useLazyLoad<HTMLDivElement>(options);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
      onLoad?.();
    }
  }, [isIntersecting, hasLoaded, onLoad]);

  return (
    <div ref={ref} className={className}>
      {hasLoaded ? children : placeholder}
    </div>
  );
}

// Lazy image component
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  onLoad?: () => void;
  options?: LazyLoadOptions;
}

export function LazyImage({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23cccccc"/%3E%3C/svg%3E',
  onLoad,
  options = {},
  className,
  ...props
}: LazyImageProps) {
  const { ref, isIntersecting } = useLazyLoad<HTMLImageElement>(options);
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isIntersecting && imageSrc === placeholder) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
    }
  }, [isIntersecting, src, placeholder, imageSrc, onLoad]);

  return (
    <img
      ref={ref}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? '' : 'blur-sm'} transition-all duration-300`}
      {...props}
    />
  );
}

// Dynamic import with loading states
export function lazyComponent<P = {}>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  options?: {
    loading?: React.ComponentType;
    error?: React.ComponentType<{ error: Error }>;
    delay?: number;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading || (() => <div>Loading component...</div>),
    ssr: options?.ssr ?? true,
  });
}

// Preload component
export function preloadComponent(
  importFunc: () => Promise<{ default: React.ComponentType<any> }>
) {
  // Start loading the component immediately
  const componentPromise = importFunc();
  
  return {
    // Preload function to call before navigation
    preload: () => componentPromise,
    // Component to render
    Component: dynamic(() => componentPromise),
  };
}

// Resource hints
export function ResourceHints() {
  return (
    <>
      {/* DNS Prefetch for external domains */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      
      {/* Preconnect for critical resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Prefetch for likely next pages */}
      <link rel="prefetch" href="/dashboard" />
      <link rel="prefetch" href="/workouts" />
      
      {/* Preload critical resources */}
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
}

// Progressive hydration wrapper
interface ProgressiveHydrationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
}

export function ProgressiveHydration({
  children,
  fallback = null,
  priority = 'medium',
}: ProgressiveHydrationProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 500;
    
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [priority]);

  if (!isHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Lazy load utilities
export const LazyUtils = {
  // Preload image
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  // Preload multiple images
  preloadImages: async (srcs: string[]): Promise<void> => {
    await Promise.all(srcs.map(src => LazyUtils.preloadImage(src)));
  },

  // Lazy load script
  loadScript: (src: string, attributes?: Record<string, string>): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          script.setAttribute(key, value);
        });
      }
      
      script.onload = () => resolve();
      script.onerror = reject;
      
      document.head.appendChild(script);
    });
  },

  // Lazy load CSS
  loadCSS: (href: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      
      link.onload = () => resolve();
      link.onerror = reject;
      
      document.head.appendChild(link);
    });
  },
};