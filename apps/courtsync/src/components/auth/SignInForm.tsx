'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import Link from 'next/link'

interface SignInFormProps {
  redirectTo?: string
  inviteCode?: string
}

export function SignInForm({ redirectTo, inviteCode }: SignInFormProps) {
  const { signIn, sendMagicLink, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (useMagicLink) {
        await sendMagicLink(formData.email)
        setMagicLinkSent(true)
      } else {
        await signIn(formData.email, formData.password)
      }
    } catch (err) {
      // Error is handled by the auth context
    }
  }

  const handleMagicLinkToggle = () => {
    setUseMagicLink(!useMagicLink)
    setMagicLinkSent(false)
    clearError()
  }

  if (magicLinkSent) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-navy/10 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-navy"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
            <p className="text-text-secondary">
              We sent a magic link to <strong>{formData.email}</strong>
            </p>
            <p className="text-text-muted text-sm mt-2">
              Click the link in the email to sign in. The link will expire in 24 hours.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setMagicLinkSent(false)
              setUseMagicLink(false)
            }}
            className="w-full"
          >
            ← Back to sign in
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome to CourtSync
        </h1>
        <p className="text-text-secondary">
          {inviteCode 
            ? 'You\'ve been invited to join a tennis team'
            : 'Sign in to your tennis team'
          }
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
          placeholder="player@rosehulman.edu"
          required
          autoComplete="email"
        />

        {!useMagicLink && (
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        )}

        <Button
          type="submit"
          fullWidth
          loading={loading}
          disabled={!formData.email || (!useMagicLink && !formData.password)}
        >
          {useMagicLink ? 'Send Magic Link' : 'Sign In'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleMagicLinkToggle}
            className="text-sm text-navy hover:underline"
          >
            {useMagicLink 
              ? 'Use password instead' 
              : 'Send me a magic link instead'
            }
          </button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-dark">
        <div className="text-center text-sm text-text-muted">
          {inviteCode ? (
            <>
              Don't have an account?{' '}
              <Link 
                href={`/auth/signup?invite=${inviteCode}`}
                className="text-navy hover:underline"
              >
                Accept invitation
              </Link>
            </>
          ) : (
            <>
              Need to create a team?{' '}
              <Link href="/auth/signup" className="text-navy hover:underline">
                Sign up as coach
              </Link>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}