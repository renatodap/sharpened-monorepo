import { Suspense } from 'react'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import Link from 'next/link'

interface PageProps {
  searchParams: {
    invite?: string
  }
}

export default function SignUpPage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoadingSkeleton lines={8} className="space-y-4" />}>
          <SignUpForm inviteCode={searchParams.invite} />
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