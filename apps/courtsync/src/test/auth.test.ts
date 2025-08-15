/**
 * Authentication System Tests
 * 
 * Tests for the CourtSync authentication system including:
 * - User registration and login
 * - Role-based access control
 * - Session management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '@/hooks/useAuth'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}))

// Test component to interact with auth context
function TestAuthComponent() {
  const { user, loading, signIn, signUp, signOut } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {user ? (
        <div>
          <p data-testid="user-email">{user.email}</p>
          <p data-testid="user-role">{user.role}</p>
          <button onClick={signOut} data-testid="signout-btn">
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => signIn('coach@test.com', 'password')}
            data-testid="signin-btn"
          >
            Sign In
          </button>
          <button
            onClick={() => signUp('player@test.com', 'password', {
              email: 'player@test.com',
              fullName: 'Test Player',
              role: 'player',
              classYear: 2025,
            })}
            data-testid="signup-btn"
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  )
}

describe('Authentication System', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = vi.fn()
    vi.clearAllMocks()
  })

  describe('AuthProvider', () => {
    it('should render children when not loading', () => {
      render(
        <AuthProvider>
          <div data-testid="auth-content">Test Content</div>
        </AuthProvider>
      )

      expect(screen.getByTestId('auth-content')).toBeInTheDocument()
    })

    it('should provide authentication context', () => {
      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      )

      // Should show sign in/up buttons when not authenticated
      expect(screen.getByTestId('signin-btn')).toBeInTheDocument()
      expect(screen.getByTestId('signup-btn')).toBeInTheDocument()
    })
  })

  describe('Sign In Flow', () => {
    it('should handle successful sign in', async () => {
      const mockUser = {
        id: '1',
        email: 'coach@test.com',
        fullName: 'Test Coach',
        role: 'coach'
      }

      // Mock successful API response
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      } as Response)

      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      )

      await user.click(screen.getByTestId('signin-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('coach@test.com')
        expect(screen.getByTestId('user-role')).toHaveTextContent('coach')
      })
    })

    it('should handle sign in error', async () => {
      // Mock API error response
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      } as Response)

      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      )

      await user.click(screen.getByTestId('signin-btn'))

      // Should still show sign in button (not authenticated)
      await waitFor(() => {
        expect(screen.getByTestId('signin-btn')).toBeInTheDocument()
      })
    })
  })

  describe('Sign Up Flow', () => {
    it('should handle successful sign up', async () => {
      const mockUser = {
        id: '2',
        email: 'player@test.com',
        fullName: 'Test Player',
        role: 'player'
      }

      // Mock successful API response
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      } as Response)

      const user = userEvent.setup()
      
      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      )

      await user.click(screen.getByTestId('signup-btn'))

      await waitFor(() => {
        expect(screen.getByTestId('user-email')).toHaveTextContent('player@test.com')
        expect(screen.getByTestId('user-role')).toHaveTextContent('player')
      })
    })
  })
})