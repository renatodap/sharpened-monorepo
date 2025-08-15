'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { Select } from '@/components/ui/Select'
import Link from 'next/link'

interface SignUpFormProps {
  inviteCode?: string
}

export function SignUpForm({ inviteCode }: SignUpFormProps) {
  const { signUp, acceptInvite, loading, error, clearError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    preferredName: '',
    role: inviteCode ? 'player' : 'coach',
    classYear: '',
    institution: '',
    teamName: '',
    gender: '',
  })
  const [step, setStep] = useState(1)

  const isCoachSignup = formData.role === 'coach' && !inviteCode
  const totalSteps = isCoachSignup ? 3 : 2

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (formData.password !== formData.confirmPassword) {
      return // This should be handled by form validation
    }

    try {
      const userData = {
        email: formData.email,
        fullName: formData.fullName,
        preferredName: formData.preferredName || undefined,
        role: formData.role as any,
        classYear: formData.classYear ? parseInt(formData.classYear) : undefined,
      }

      if (inviteCode) {
        await acceptInvite(inviteCode, userData)
      } else {
        await signUp(formData.email, formData.password, userData)
      }
    } catch (err) {
      // Error is handled by the auth context
    }
  }

  const canProceedStep1 = formData.email && formData.fullName && formData.password && 
                          formData.password === formData.confirmPassword

  const canProceedStep2 = formData.role && (formData.role !== 'player' || formData.classYear)

  const canSubmit = isCoachSignup 
    ? formData.institution && formData.teamName && formData.gender
    : true

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          {inviteCode ? 'Join Your Team' : 'Create Your Team'}
        </h1>
        <p className="text-text-secondary">
          {inviteCode 
            ? 'Complete your profile to join the team'
            : 'Set up CourtSync for your tennis program'
          }
        </p>
        
        {/* Progress indicator */}
        <div className="flex items-center justify-center mt-4 space-x-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i + 1 <= step ? 'bg-navy' : 'bg-gray-dark'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Basic Information */}
        {step === 1 && (
          <>
            <Input
              label="Full Name"
              value={formData.fullName}
              onChange={(value) => setFormData(prev => ({ ...prev, fullName: value }))}
              placeholder="John Smith"
              required
              autoComplete="name"
            />

            <Input
              label="Preferred Name (Optional)"
              value={formData.preferredName}
              onChange={(value) => setFormData(prev => ({ ...prev, preferredName: value }))}
              placeholder="Johnny"
              help="What should we call you?"
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              placeholder="player@rosehulman.edu"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
              placeholder="Choose a strong password"
              required
              autoComplete="new-password"
              help="At least 8 characters"
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              placeholder="Confirm your password"
              required
              error={formData.confirmPassword && formData.password !== formData.confirmPassword 
                ? 'Passwords do not match' 
                : undefined
              }
            />

            <Button
              type="button"
              onClick={handleNext}
              fullWidth
              disabled={!canProceedStep1}
            >
              Continue
            </Button>
          </>
        )}

        {/* Step 2: Role & Tennis Info */}
        {step === 2 && (
          <>
            {!inviteCode && (
              <Select
                label="Your Role"
                value={formData.role}
                onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                options={[
                  { value: 'coach', label: 'Head Coach' },
                  { value: 'assistant_coach', label: 'Assistant Coach' },
                ]}
                required
              />
            )}

            {formData.role === 'player' && (
              <Select
                label="Class Year"
                value={formData.classYear}
                onChange={(value) => setFormData(prev => ({ ...prev, classYear: value }))}
                options={[
                  { value: '2025', label: 'Senior (2025)' },
                  { value: '2026', label: 'Junior (2026)' },
                  { value: '2027', label: 'Sophomore (2027)' },
                  { value: '2028', label: 'Freshman (2028)' },
                ]}
                required
              />
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
              
              {isCoachSignup ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceedStep2}
                  className="flex-1"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!canProceedStep2}
                  className="flex-1"
                >
                  {inviteCode ? 'Join Team' : 'Create Account'}
                </Button>
              )}
            </div>
          </>
        )}

        {/* Step 3: Team Setup (Coach only) */}
        {step === 3 && isCoachSignup && (
          <>
            <Input
              label="Institution"
              value={formData.institution}
              onChange={(value) => setFormData(prev => ({ ...prev, institution: value }))}
              placeholder="Rose-Hulman Institute of Technology"
              required
            />

            <Input
              label="Team Name"
              value={formData.teamName}
              onChange={(value) => setFormData(prev => ({ ...prev, teamName: value }))}
              placeholder="Rose-Hulman Engineers"
              required
              help="This will be the display name for your team"
            />

            <Select
              label="Team Gender"
              value={formData.gender}
              onChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
              options={[
                { value: 'men', label: "Men's Tennis" },
                { value: 'women', label: "Women's Tennis" },
                { value: 'mixed', label: 'Mixed/Co-ed' },
              ]}
              required
            />

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
              
              <Button
                type="submit"
                loading={loading}
                disabled={!canSubmit}
                className="flex-1"
              >
                Create Team
              </Button>
            </div>
          </>
        )}
      </form>

      {step === 1 && (
        <div className="mt-6 pt-6 border-t border-gray-dark">
          <div className="text-center text-sm text-text-muted">
            Already have an account?{' '}
            <Link 
              href={inviteCode ? `/auth/signin?invite=${inviteCode}` : '/auth/signin'}
              className="text-navy hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </Card>
  )
}