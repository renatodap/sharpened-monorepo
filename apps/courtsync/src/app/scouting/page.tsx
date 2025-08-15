/**
 * Scouting Reports Page
 * 
 * Interface for viewing and creating opponent scouting reports
 */

'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

interface ScoutingReport {
  id: string
  title: string
  opponentName: string
  opponentStrengths: string
  opponentWeaknesses: string
  recommendedStrategy: string
  keyPlayers?: string
  confidenceLevel: number
  isConfidential: boolean
  authorName: string
  createdAt: string
  tags?: string[]
}

export default function ScoutingPage() {
  const { user, loading } = useRequireAuth()
  const [reports, setReports] = useState<ScoutingReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ScoutingReport | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    opponentId: '',
    opponentStrengths: '',
    opponentWeaknesses: '',
    recommendedStrategy: '',
    keyPlayers: '',
    confidenceLevel: 3,
    isConfidential: false,
    tags: '',
  })

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user])

  const fetchReports = async () => {
    try {
      setLoadingReports(true)
      setError(null)

      const response = await fetch('/api/scouting')
      
      if (!response.ok) {
        throw new Error('Failed to fetch scouting reports')
      }

      const data = await response.json()
      setReports(data.reports || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setLoadingReports(false)
    }
  }

  const handleCreateReport = async () => {
    try {
      const reportData = {
        ...formData,
        tags: formData.tags.trim() ? formData.tags.split(',').map(t => t.trim()) : undefined,
      }

      const response = await fetch('/api/scouting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      })

      if (!response.ok) {
        throw new Error('Failed to create report')
      }

      const result = await response.json()
      setReports(prev => [result.report, ...prev])
      setShowCreateForm(false)
      resetForm()
    } catch (error) {
      console.error('Create report failed:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      opponentId: '',
      opponentStrengths: '',
      opponentWeaknesses: '',
      recommendedStrategy: '',
      keyPlayers: '',
      confidenceLevel: 3,
      isConfidential: false,
      tags: '',
    })
  }

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.opponentName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const canCreateReports = ['coach', 'assistant_coach', 'captain'].includes(user?.role || '')

  const getConfidenceStars = (level: number) => {
    return '⭐'.repeat(level) + '☆'.repeat(5 - level)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <LoadingSkeleton lines={8} />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-gray-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-white">
                Opponent Scouting
              </h1>
              <p className="text-sm text-text-secondary">
                Analyze opponents and develop winning strategies
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {canCreateReports && (
                <Button onClick={() => setShowCreateForm(true)}>
                  + Create Report
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCreateForm ? (
          <Card className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Create Scouting Report</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Report Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Butler University - Spring Match Analysis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Opponent Strengths *
                </label>
                <textarea
                  value={formData.opponentStrengths}
                  onChange={(e) => setFormData(prev => ({ ...prev, opponentStrengths: e.target.value }))}
                  placeholder="Describe what the opponent does well..."
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-gray-dark rounded text-white placeholder-text-muted focus:border-navy focus:ring-1 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Opponent Weaknesses *
                </label>
                <textarea
                  value={formData.opponentWeaknesses}
                  onChange={(e) => setFormData(prev => ({ ...prev, opponentWeaknesses: e.target.value }))}
                  placeholder="Identify areas where opponent struggles..."
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-gray-dark rounded text-white placeholder-text-muted focus:border-navy focus:ring-1 focus:ring-navy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Recommended Strategy *
                </label>
                <textarea
                  value={formData.recommendedStrategy}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendedStrategy: e.target.value }))}
                  placeholder="How should we approach this opponent..."
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-gray-dark rounded text-white placeholder-text-muted focus:border-navy focus:ring-1 focus:ring-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Key Players
                  </label>
                  <Input
                    value={formData.keyPlayers}
                    onChange={(e) => setFormData(prev => ({ ...prev, keyPlayers: e.target.value }))}
                    placeholder="Notable players to watch..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Confidence Level
                  </label>
                  <Select
                    value={formData.confidenceLevel.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, confidenceLevel: parseInt(value) }))}
                  >
                    <option value="1">1 - Low Confidence</option>
                    <option value="2">2 - Fair Confidence</option>
                    <option value="3">3 - Good Confidence</option>
                    <option value="4">4 - High Confidence</option>
                    <option value="5">5 - Very High Confidence</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tags (comma separated)
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="power game, serve and volley, left-handed..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confidential"
                  checked={formData.isConfidential}
                  onChange={(e) => setFormData(prev => ({ ...prev, isConfidential: e.target.checked }))}
                  className="rounded border-gray-dark bg-surface text-navy focus:ring-navy"
                />
                <label htmlFor="confidential" className="text-sm text-white">
                  Mark as confidential (coaches/captains only)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button onClick={handleCreateReport} className="flex-1">
                  Create Report
                </Button>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search reports or opponents..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-text-muted">
                    {filteredReports.length} reports
                  </span>
                </div>
              </div>
            </Card>

            {/* Reports Grid */}
            {loadingReports ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <LoadingSkeleton lines={6} />
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="p-6 text-center">
                <div className="text-error mb-4">❌</div>
                <p className="text-error font-medium mb-2">Failed to load reports</p>
                <p className="text-text-muted text-sm mb-4">{error}</p>
                <Button onClick={fetchReports} size="sm">
                  Try Again
                </Button>
              </Card>
            ) : filteredReports.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No scouting reports yet
                </h3>
                <p className="text-text-muted mb-6">
                  Create your first scouting report to analyze opponents
                </p>
                {canCreateReports && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    Create Report
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map(report => (
                  <Card 
                    key={report.id} 
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-white truncate flex-1">
                        {report.title}
                      </h4>
                      {report.isConfidential && (
                        <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded ml-2">
                          🔒 Confidential
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-text-muted">Opponent:</span>
                        <span className="text-white ml-2">{report.opponentName || 'TBD'}</span>
                      </div>

                      <div>
                        <span className="text-text-muted">Confidence:</span>
                        <span className="ml-2">{getConfidenceStars(report.confidenceLevel)}</span>
                      </div>

                      <div>
                        <span className="text-text-muted">By:</span>
                        <span className="text-white ml-2">{report.authorName}</span>
                      </div>

                      <div>
                        <span className="text-text-muted">Created:</span>
                        <span className="text-white ml-2">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {report.tags && report.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {report.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="bg-navy/20 text-navy text-xs px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {report.tags.length > 3 && (
                            <span className="text-text-muted text-xs">
                              +{report.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {selectedReport.title}
                  </h3>
                  <p className="text-sm text-text-muted">
                    Scouting Report • {getConfidenceStars(selectedReport.confidenceLevel)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-white mb-2">Opponent Strengths</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {selectedReport.opponentStrengths}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Opponent Weaknesses</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {selectedReport.opponentWeaknesses}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-white mb-2">Recommended Strategy</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {selectedReport.recommendedStrategy}
                  </p>
                </div>

                {selectedReport.keyPlayers && (
                  <div>
                    <h4 className="font-medium text-white mb-2">Key Players</h4>
                    <p className="text-sm text-text-secondary">
                      {selectedReport.keyPlayers}
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-dark pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">
                      Created by {selectedReport.authorName}
                    </span>
                    <span className="text-text-muted">
                      {new Date(selectedReport.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}