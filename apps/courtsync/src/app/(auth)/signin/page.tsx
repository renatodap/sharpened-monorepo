import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/SignInForm'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import Link from 'next/link'

interface PageProps {
  searchParams: {
    invite?: string
    redirect?: string
  }
}

export default function SignInPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoadingSkeleton lines={6} className="space-y-4" />}>
          <SignInForm 
            inviteCode={searchParams.invite}
            redirectTo={searchParams.redirect}
          />
        </Suspense>
        
        {/* Back to home */}
        <div className="text-center mt-6">
          <Link 
            href="/"
            className="text-sm text-text-muted hover:text-navy transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}