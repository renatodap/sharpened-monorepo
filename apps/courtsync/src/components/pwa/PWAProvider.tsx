'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface PWAContextType {
  isInstalled: boolean
  isOnline: boolean
  showInstallPrompt: boolean
  installApp: () => void
  dismissInstallPrompt: () => void
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if app is installed
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isRunningIOS = window.navigator.standalone === true
    setIsInstalled(isRunningStandalone || isRunningIOS)

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(window.navigator.onLine)

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error installing app:', error)
    }
  }

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false)
    // Remember user dismissed it (you might want to store this in localStorage)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const value: PWAContextType = {
    isInstalled,
    isOnline,
    showInstallPrompt,
    installApp,
    dismissInstallPrompt
  }

  return (
    <PWAContext.Provider value={value}>
      {children}
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 bg-warning text-black text-center py-2 px-4 text-sm font-medium z-50">
          You're offline. Some features may not work.
        </div>
      )}
    </PWAContext.Provider>
  )
}

export function usePWA() {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider')
  }
  return context
}