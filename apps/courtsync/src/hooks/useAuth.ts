'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { auth, type User, type AuthResult, type SignUpData } from '@/lib/auth/auth-adapter'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password?: string) => Promise<void>
  signUp: (email: string, password: string, userData: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  sendMagicLink: (email: string) => Promise<void>
  acceptInvite: (inviteCode: string, userData: SignUpData) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Auth initialization error:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const signIn = async (email: string, password?: string) => {
    try {
      setLoading(true)
      setError(null)

      const result = await auth.signInWithEmail(email, password)
      
      if (result.user.id) {
        setUser(result.user)
        router.push('/app')
      } else {
        // Magic link sent
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      setLoading(true)
      setError(null)

      const result = await auth.signUp(email, password, userData)
      setUser(result.user)
      
      // Redirect based on role
      if (result.user.role === 'coach') {
        router.push('/onboarding/coach')
      } else {
        router.push('/onboarding/player')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await auth.signOut()
      setUser(null)
      router.push('/auth/signin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  const sendMagicLink = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      await auth.sendMagicLink(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const acceptInvite = async (inviteCode: string, userData: SignUpData) => {
    try {
      setLoading(true)
      setError(null)

      const result = await auth.acceptTeamInvite(inviteCode, userData)
      setUser(result.user)
      
      router.push('/onboarding/team-member')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
      throw err
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
    signOut,
    sendMagicLink,
    acceptInvite,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// Auth guard hook for protected routes
export function useRequireAuth(redirectTo: string = '/auth/signin') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading }
}

// Role-based access hook
export function useRequireRole(allowedRoles: string[], redirectTo: string = '/app') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && !allowedRoles.includes(user.role)) {
      router.push(redirectTo)
    }
  }, [user, loading, allowedRoles, router, redirectTo])

  return { user, loading, hasAccess: user ? allowedRoles.includes(user.role) : false }
}

// Team membership hook
export function useTeamMembership() {
  const { user } = useAuth()
  
  return {
    isTeamMember: !!user?.teamId,
    teamId: user?.teamId,
    isCoach: user?.role === 'coach' || user?.role === 'assistant_coach',
    isCaptain: user?.role === 'captain',
    isPlayer: user?.role === 'player',
  }
}