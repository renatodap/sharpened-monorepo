'use client'

import { useRequireAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useRequireAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <LoadingSkeleton lines={6} className="space-y-4" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null // useRequireAuth will redirect to sign in
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-gray-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-white">
                Court<span className="text-navy">Sync</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-text-secondary">
                Welcome, {user.preferredName || user.fullName}
              </span>
              <Button variant="ghost" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to your team dashboard
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Your tennis team management hub is ready. Start by exploring the features below.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Court Booking"
              description="Schedule practice and match courts with conflict detection"
              icon="🎾"
              href="/courts"
              status="Available"
            />
            
            <FeatureCard
              title="Team Calendar"
              description="View and manage team schedules, events, and travel"
              icon="📅"
              href="/calendar"
              status="Available"
            />
            
            <FeatureCard
              title="Video Analysis"
              description="Upload and analyze practice and match videos"
              icon="📹"
              href="/video"
              status="Available"
            />
            
            <FeatureCard
              title="Opponent Scouting"
              description="Build intelligence on upcoming opponents"
              icon="🔍"
              href="/scouting"
              status="Available"
            />
            
            <FeatureCard
              title="Travel Planning"
              description="Coordinate team travel and accommodations"
              icon="🧳"
              href="/travel"
              status="Available"
            />
            
            <FeatureCard
              title="Team Communication"
              description="Internal messaging and announcements"
              icon="💬"
              href="/communication"
              status="Available"
            />
          </div>

          {/* User Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Profile</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Role:</span>
                <span className="text-white capitalize">{user.role.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Email:</span>
                <span className="text-white">{user.email}</span>
              </div>
              {user.classYear && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Class Year:</span>
                  <span className="text-white">{user.classYear}</span>
                </div>
              )}
              {user.teamId && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Team ID:</span>
                  <span className="text-white">{user.teamId}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ 
  title, 
  description, 
  icon, 
  href, 
  status 
}: { 
  title: string
  description: string
  icon: string
  href: string
  status: string
}) {
  const isAvailable = status === 'Available'
  
  const CardContent = (
    <Card className={`p-6 transition-colors ${
      isAvailable 
        ? 'hover:border-navy/50 cursor-pointer' 
        : 'opacity-60 cursor-not-allowed'
    }`}>
      <div className="flex items-start space-x-4">
        <div className="text-3xl" role="img" aria-hidden="true">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${
              isAvailable 
                ? 'bg-success/20 text-success' 
                : 'bg-warning/20 text-warning'
            }`}>
              {status}
            </span>
          </div>
          <p className="text-sm text-text-muted mb-4">{description}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={!isAvailable}
            className="w-full"
          >
            {isAvailable ? 'Open' : 'Coming Soon'}
          </Button>
        </div>
      </div>
    </Card>
  )

  return isAvailable ? (
    <Link href={href}>
      {CardContent}
    </Link>
  ) : (
    CardContent
  )
}