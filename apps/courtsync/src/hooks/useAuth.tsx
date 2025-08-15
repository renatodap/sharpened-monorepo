'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  fullName: string
  preferredName?: string
  role: 'coach' | 'assistant_coach' | 'captain' | 'player'
  teamId?: string
  classYear?: number
  avatarUrl?: string
}

interface AuthResult {
  user?: User
  error?: string
}

interface UserData {
  email: string
  fullName: string
  preferredName?: string
  role: 'coach' | 'assistant_coach' | 'captain' | 'player'
  classYear?: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, userData: UserData) => Promise<AuthResult>
  signInWithMagicLink: (email: string, redirectTo?: string) => Promise<AuthResult>
  sendMagicLink: (email: string) => Promise<AuthResult>
  acceptInvite: (inviteCode: string, userData: UserData) => Promise<AuthResult>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Initialize auth state
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Check for existing session
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const { user } = await response.json()
        setUser(user)
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        router.push('/dashboard')
        return { user: data.user }
      } else {
        setError(data.error || 'Sign in failed')
        return { error: data.error || 'Sign in failed' }
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: UserData): Promise<AuthResult> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...userData })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        router.push('/dashboard')
        return { user: data.user }
      } else {
        setError(data.error || 'Sign up failed')
        return { error: data.error || 'Sign up failed' }
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signInWithMagicLink = async (email: string, redirectTo?: string): Promise<AuthResult> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirectTo })
      })

      const data = await response.json()

      if (response.ok) {
        return { user: data.user }
      } else {
        setError(data.error || 'Failed to send magic link')
        return { error: data.error || 'Failed to send magic link' }
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const sendMagicLink = async (email: string): Promise<AuthResult> => {
    return signInWithMagicLink(email)
  }

  const acceptInvite = async (inviteCode: string, userData: UserData): Promise<AuthResult> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, ...userData })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        router.push('/dashboard')
        return { user: data.user }
      } else {
        setError(data.error || 'Failed to accept invitation')
        return { error: data.error || 'Failed to accept invitation' }
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setUser(null)
      router.push('/')
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithMagicLink,
    sendMagicLink,
    acceptInvite,
    signOut,
    clearError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  return { user, loading }
}

export function useRequireRole(allowedRoles: string[], redirectTo: string = '/dashboard') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/signin')
      } else if (!allowedRoles.includes(user.role)) {
        router.push(redirectTo)
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router])

  return { 
    user, 
    loading, 
    hasAccess: user ? allowedRoles.includes(user.role) : false 
  }
}