'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Alert } from '@/components/ui/Alert'
import { AnnouncementBoard } from '@/components/communication/AnnouncementBoard'

interface CommunicationStats {
  totalAnnouncements: number
  unreadAnnouncements: number
  urgentAnnouncements: number
  pendingAcknowledgments: number
}

export default function CommunicationPage() {
  const [activeTab, setActiveTab] = useState<'announcements' | 'messages' | 'notifications'>('announcements')
  const [stats, setStats] = useState<CommunicationStats>({
    totalAnnouncements: 0,
    unreadAnnouncements: 0,
    urgentAnnouncements: 0,
    pendingAcknowledgments: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userRole, setUserRole] = useState('player') // This would come from auth context

  useEffect(() => {
    fetchCommunicationStats()
    // In a real app, you'd get user info from auth context
    setUserRole('coach') // Mock for demo
  }, [])

  const fetchCommunicationStats = async () => {
    try {
      setLoading(true)
      
      // Fetch communication statistics
      const response = await fetch('/api/announcements')
      
      if (response.ok) {
        const data = await response.json()
        const announcements = data.announcements || []
        
        // Calculate stats from announcements
        const totalAnnouncements = announcements.length
        const unreadAnnouncements = announcements.filter((a: any) => !a.isAcknowledged && a.requiresAcknowledgment).length
        const urgentAnnouncements = announcements.filter((a: any) => a.priority === 'urgent').length
        const pendingAcknowledgments = announcements.filter((a: any) => a.requiresAcknowledgment && !a.isAcknowledged).length
        
        setStats({
          totalAnnouncements,
          unreadAnnouncements,
          urgentAnnouncements,
          pendingAcknowledgments,
        })
      }
    } catch (error) {
      console.error('Failed to fetch communication stats:', error)
      setError('Failed to load communication data')
    } finally {
      setLoading(false)
    }
  }

  const handleAnnouncementCreate = () => {
    fetchCommunicationStats()
  }

  const StatCard = ({ title, value, description, variant = 'default' }: {
    title: string
    value: number
    description: string
    variant?: 'default' | 'urgent' | 'success'
  }) => {
    const variantClasses = {
      default: 'border-gray-600',
      urgent: 'border-red-400 bg-red-400/5',
      success: 'border-green-400 bg-green-400/5',
    }

    return (
      <Card className={`p-4 ${variantClasses[variant]}`}>
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">{value}</div>
          <div className="text-sm font-medium text-white mb-1">{title}</div>
          <div className="text-xs text-text-secondary">{description}</div>
        </div>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Communication</h1>
          <p className="text-text-secondary">Stay connected with your team</p>
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Communication Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="text-center space-y-2">
                <div className="h-8 bg-surface-elevated rounded w-12 mx-auto"></div>
                <div className="h-4 bg-surface-elevated rounded w-20 mx-auto"></div>
                <div className="h-3 bg-surface-elevated rounded w-24 mx-auto"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Announcements"
            value={stats.totalAnnouncements}
            description="All team announcements"
          />
          <StatCard
            title="Pending Actions"
            value={stats.pendingAcknowledgments}
            description="Require acknowledgment"
            variant={stats.pendingAcknowledgments > 0 ? 'urgent' : 'default'}
          />
          <StatCard
            title="Urgent Messages"
            value={stats.urgentAnnouncements}
            description="High priority items"
            variant={stats.urgentAnnouncements > 0 ? 'urgent' : 'default'}
          />
          <StatCard
            title="Unread Items"
            value={stats.unreadAnnouncements}
            description="Unacknowledged messages"
            variant={stats.unreadAnnouncements > 0 ? 'urgent' : 'success'}
          />
        </div>
      )}

      {/* Communication Tabs */}
      <div className="flex border-b border-gray-600 mb-6">
        {[
          { key: 'announcements', label: 'Announcements', badge: stats.pendingAcknowledgments },
          { key: 'messages', label: 'Team Chat', badge: 0, disabled: true },
          { key: 'notifications', label: 'Notifications', badge: 0, disabled: true },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => !tab.disabled && setActiveTab(tab.key as any)}
            disabled={tab.disabled}
            className={`px-4 py-2 font-medium relative ${
              activeTab === tab.key
                ? 'text-white border-b-2 border-navy'
                : tab.disabled
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {tab.badge}
              </span>
            )}
            {tab.disabled && (
              <span className="ml-1 text-xs">(Coming Soon)</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'announcements' && (
        <AnnouncementBoard 
          userRole={userRole} 
          onAnnouncementCreate={handleAnnouncementCreate}
        />
      )}

      {activeTab === 'messages' && (
        <Card className="p-12 text-center">
          <div className="text-text-secondary mb-4">
            💬 Team Chat feature is coming soon!
          </div>
          <div className="text-sm text-text-secondary">
            This will include real-time messaging, group chats, and direct messages between team members.
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="p-12 text-center">
          <div className="text-text-secondary mb-4">
            🔔 Notification Center is coming soon!
          </div>
          <div className="text-sm text-text-secondary">
            This will include push notifications, email alerts, and customizable notification preferences.
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="secondary" 
              fullWidth
              onClick={() => setActiveTab('announcements')}
              className="justify-start"
            >
              📢 View All Announcements
            </Button>
            
            <Button 
              variant="secondary" 
              fullWidth
              disabled
              className="justify-start opacity-50 cursor-not-allowed"
            >
              💬 Open Team Chat (Coming Soon)
            </Button>
            
            <Button 
              variant="secondary" 
              fullWidth
              disabled
              className="justify-start opacity-50 cursor-not-allowed"
            >
              ⚙️ Notification Settings (Coming Soon)
            </Button>
          </div>
        </Card>
      </div>

      {/* Help Section */}
      <div className="mt-8">
        <Card className="p-6 bg-navy/10 border-navy/20">
          <h3 className="text-lg font-semibold text-white mb-4">Communication Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-text-secondary">
            <div>
              <h4 className="font-medium text-white mb-2">For Team Members:</h4>
              <ul className="space-y-1">
                <li>• Check announcements daily</li>
                <li>• Acknowledge important messages promptly</li>
                <li>• Use appropriate priority levels</li>
                <li>• Keep messages clear and concise</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">For Coaches:</h4>
              <ul className="space-y-1">
                <li>• Use urgent priority sparingly</li>
                <li>• Set expiration dates for time-sensitive info</li>
                <li>• Target specific roles when appropriate</li>
                <li>• Pin important ongoing announcements</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}