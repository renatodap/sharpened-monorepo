/**
 * Bottom Navigation Component
 * 
 * Mobile-first navigation between all CourtSync features
 */

'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: '🏠',
    activeIcon: '🏠',
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: '📅',
    activeIcon: '📅',
  },
  {
    href: '/courts',
    label: 'Courts',
    icon: '🎾',
    activeIcon: '🎾',
  },
  {
    href: '/communication',
    label: 'Messages',
    icon: '💬',
    activeIcon: '💬',
  },
  {
    href: '/travel',
    label: 'Travel',
    icon: '🧳',
    activeIcon: '🧳',
  },
]

const secondaryNavItems = [
  {
    href: '/video',
    label: 'Video',
    icon: '📹',
    activeIcon: '📹',
  },
  {
    href: '/scouting',
    label: 'Scouting',
    icon: '🔍',
    activeIcon: '🔍',
  },
]

export function BottomNav() {
  const pathname = usePathname()

  // Don't show nav on auth pages
  if (pathname?.startsWith('/auth') || pathname === '/') {
    return null
  }

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-dark z-50 lg:hidden">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center space-y-1 text-xs transition-colors',
                  isActive
                    ? 'text-navy bg-navy/10'
                    : 'text-text-muted hover:text-white'
                )}
              >
                <span className="text-lg">
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:flex lg:w-64 lg:flex-col lg:bg-surface lg:border-r lg:border-gray-dark">
        <div className="flex h-16 items-center justify-center border-b border-gray-dark">
          <h1 className="text-xl font-bold text-white">CourtSync</h1>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname?.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-navy/20 text-navy'
                      : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                  )}
                >
                  <span className="text-lg">{isActive ? item.activeIcon : item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="border-t border-gray-dark pt-4 mt-4">
            <div className="space-y-1">
              {secondaryNavItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname?.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-navy/20 text-navy'
                        : 'text-text-muted hover:bg-surface-elevated hover:text-white'
                    )}
                  >
                    <span className="text-lg">{isActive ? item.activeIcon : item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        <div className="border-t border-gray-dark p-4">
          <div className="text-xs text-text-muted text-center">
            CourtSync v1.0.0
            <br />
            Rose-Hulman Tennis
          </div>
        </div>
      </aside>

      {/* Content Spacer for Bottom Nav */}
      <div className="h-16 lg:hidden" />
      
      {/* Content Spacer for Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64" />
    </>
  )
}