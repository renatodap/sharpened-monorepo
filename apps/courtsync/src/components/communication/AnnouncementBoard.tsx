'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'

interface Announcement {
  id: string
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  targetRoles: string[]
  scheduledAt?: string
  expiresAt?: string
  requiresAcknowledgment: boolean
  isPinned: boolean
  attachments: Array<Record<string, any>>
  tags: string[]
  authorName: string
  authorRole: string
  createdAt: string
  updatedAt: string
  isAcknowledged: boolean
  acknowledgedAt?: string
}

interface AnnouncementFormData {
  title: string
  content: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  targetRoles: string[]
  scheduledAt: string
  expiresAt: string
  requiresAcknowledgment: boolean
  isPinned: boolean
  tags: string[]
}

interface AnnouncementBoardProps {
  userRole: string
  onAnnouncementCreate?: () => void
}

export function AnnouncementBoard({ userRole, onAnnouncementCreate }: AnnouncementBoardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [submitLoading, setSubmitLoading] = useState(false)

  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    priority: 'normal',
    targetRoles: [],
    scheduledAt: '',
    expiresAt: '',
    requiresAcknowledgment: false,
    isPinned: false,
    tags: [],
  })

  const [tagInput, setTagInput] = useState('')
  const canCreateAnnouncements = ['coach', 'assistant_coach', 'captain'].includes(userRole)

  useEffect(() => {
    fetchAnnouncements()
  }, [filterPriority])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filterPriority !== 'all') {
        params.set('priority', filterPriority)
      }
      
      const response = await fetch(`/api/announcements?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch announcements')
      }
      
      const data = await response.json()
      setAnnouncements(data.announcements || [])
    } catch (error) {
      console.error('Failed to fetch announcements:', error)
      setError('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnnouncement = async () => {
    try {
      setSubmitLoading(true)
      
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          scheduledAt: formData.scheduledAt || undefined,
          expiresAt: formData.expiresAt || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create announcement')
      }

      await fetchAnnouncements()
      setShowCreateForm(false)
      setFormData({
        title: '',
        content: '',
        priority: 'normal',
        targetRoles: [],
        scheduledAt: '',
        expiresAt: '',
        requiresAcknowledgment: false,
        isPinned: false,
        tags: [],
      })
      setError(null)
      onAnnouncementCreate?.()
    } catch (error) {
      console.error('Failed to create announcement:', error)
      setError('Failed to create announcement')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleAcknowledgeAnnouncement = async (announcementId: string) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'acknowledge',
          announcementId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to acknowledge announcement')
      }

      await fetchAnnouncements()
    } catch (error) {
      console.error('Failed to acknowledge announcement:', error)
      setError('Failed to acknowledge announcement')
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-400 bg-gray-400/10',
      normal: 'text-blue-400 bg-blue-400/10',
      high: 'text-yellow-400 bg-yellow-400/10',
      urgent: 'text-red-400 bg-red-400/10',
    }
    return colors[priority as keyof typeof colors] || colors.normal
  }

  const getPriorityIcon = (priority: string) => {
    const icons = {
      low: '📄',
      normal: '📢',
      high: '⚠️',
      urgent: '🚨',
    }
    return icons[priority as keyof typeof icons] || icons.normal
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    // Pinned first
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    
    // Then by priority
    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 }
    const aPriority = priorityOrder[a.priority] || 2
    const bPriority = priorityOrder[b.priority] || 2
    if (aPriority !== bPriority) return bPriority - aPriority
    
    // Finally by date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  if (showCreateForm) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Create Announcement</h3>
          <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
            Cancel
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Error" className="mb-6">
            {error}
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter announcement title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Content *
            </label>
            <textarea
              className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-white resize-y min-h-[120px]"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter announcement content..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Priority
              </label>
              <Select
                value={formData.priority}
                onChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                options={[
                  { value: 'low', label: 'Low Priority' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Target Audience
              </label>
              <Select
                value={formData.targetRoles.length > 0 ? formData.targetRoles[0] : 'all'}
                onChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  targetRoles: value === 'all' ? [] : [value] 
                }))}
                options={[
                  { value: 'all', label: 'All Team Members' },
                  { value: 'coach', label: 'Coaches Only' },
                  { value: 'captain', label: 'Captains Only' },
                  { value: 'player', label: 'Players Only' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Scheduled For (Optional)
              </label>
              <Input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Expires At (Optional)
              </label>
              <Input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="secondary" size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="bg-navy/20 border border-navy rounded-lg px-3 py-1 text-sm flex items-center gap-2">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.requiresAcknowledgment}
                onChange={(e) => setFormData(prev => ({ ...prev, requiresAcknowledgment: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-white">Requires Acknowledgment</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-white">Pin to Top</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
            <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAnnouncement} 
              loading={submitLoading}
              disabled={!formData.title.trim() || !formData.content.trim()}
            >
              Create Announcement
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Team Announcements</h2>
          <p className="text-text-secondary">Stay updated with team news and information</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={filterPriority}
            onChange={setFilterPriority}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'urgent', label: 'Urgent Only' },
              { value: 'high', label: 'High Priority' },
              { value: 'normal', label: 'Normal' },
              { value: 'low', label: 'Low Priority' },
            ]}
          />
          {canCreateAnnouncements && (
            <Button onClick={() => setShowCreateForm(true)}>
              Create Announcement
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Announcements List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-surface-elevated rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-elevated rounded w-3/4"></div>
                  <div className="h-3 bg-surface-elevated rounded w-1/2"></div>
                  <div className="h-3 bg-surface-elevated rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : sortedAnnouncements.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-text-secondary mb-4">No announcements to display</div>
          {canCreateAnnouncements && (
            <Button onClick={() => setShowCreateForm(true)}>
              Create Your First Announcement
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAnnouncements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className={`p-6 ${announcement.isPinned ? 'ring-2 ring-navy/50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{getPriorityIcon(announcement.priority)}</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{announcement.title}</h3>
                        {announcement.isPinned && (
                          <span className="text-xs bg-navy/20 text-navy px-2 py-0.5 rounded">📌 Pinned</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-text-secondary mb-2">
                        By {announcement.authorName} • {formatDate(announcement.createdAt)}
                        {announcement.targetRoles.length > 0 && (
                          <span> • For: {announcement.targetRoles.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-white mb-3 whitespace-pre-wrap">
                    {announcement.content}
                  </div>

                  {announcement.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {announcement.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-surface-elevated text-text-secondary px-2 py-1 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {announcement.expiresAt && (
                    <div className="text-xs text-yellow-400 mb-3">
                      ⏰ Expires: {formatDate(announcement.expiresAt)}
                    </div>
                  )}

                  {announcement.requiresAcknowledgment && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-600">
                      <span className="text-sm text-text-secondary">
                        This announcement requires acknowledgment
                      </span>
                      {!announcement.isAcknowledged ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleAcknowledgeAnnouncement(announcement.id)}
                        >
                          Acknowledge
                        </Button>
                      ) : (
                        <span className="text-sm text-green-400">
                          ✓ Acknowledged {announcement.acknowledgedAt && `on ${formatDate(announcement.acknowledgedAt)}`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}