import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'CourtSync - Tennis Team Management',
  description: 'Complete tennis team management for NCAA Division III programs. Schedule courts, coordinate travel, analyze video, and scout opponents.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Court<span className="text-navy">Sync</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto">
              Complete tennis team management for NCAA Division III programs
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
            <FeatureCard
              icon="🎾"
              title="Court Booking"
              description="Smart scheduling with conflict detection"
            />
            <FeatureCard
              icon="📹"
              title="Video Analysis"
              description="iPad capture with time-stamped annotations"
            />
            <FeatureCard
              icon="🗺️"
              title="Travel Coordination"
              description="Complete trip planning and logistics"
            />
            <FeatureCard
              icon="🔍"
              title="Opponent Scouting"
              description="Build competitive intelligence"
            />
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/auth/signup">
                  Start Your Team
                </Link>
              </Button>
              <Button variant="secondary" asChild size="lg">
                <Link href="/auth/signin">
                  Sign In
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-text-muted">
              Free for teams • $10/month for advanced features
            </p>
          </div>

          {/* Social Proof */}
          <div className="pt-8 border-t border-gray-dark">
            <p className="text-text-muted mb-4">Trusted by NCAA Division III tennis programs</p>
            <div className="flex items-center justify-center space-x-8 opacity-60">
              <div className="text-sm font-medium">Rose-Hulman Institute</div>
              <div className="w-1 h-1 bg-text-muted rounded-full"></div>
              <div className="text-sm font-medium">HCAC Conference</div>
              <div className="w-1 h-1 bg-text-muted rounded-full"></div>
              <div className="text-sm font-medium">NCAA DIII</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-dark py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-text-muted">
            © 2024 CourtSync. Built for tennis teams.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-text-muted hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-text-muted hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/support" className="text-text-muted hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: string
  title: string
  description: string 
}) {
  return (
    <div className="bg-surface rounded-lg p-6 border border-gray-dark hover:border-navy/50 transition-colors">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-text-muted">{description}</p>
    </div>
  )
}