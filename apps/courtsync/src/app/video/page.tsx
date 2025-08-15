/**
 * Video Management Page
 * 
 * Interface for uploading, viewing, and managing team videos
 */

'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { VideoUpload } from '@/components/video/VideoUpload'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

interface Video {
  id: string
  title: string
  description?: string
  videoType: string
  fileUrl: string
  thumbnailUrl?: string
  duration: number
  fileSize: number
  uploadedBy: string
  uploadedAt: string
  tags?: string[]
  isPublic: boolean
  status: string
}

export default function VideoPage() {
  const { user, loading } = useRequireAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchVideos()
    }
  }, [user, selectedFilter])

  const fetchVideos = async () => {
    try {
      setLoadingVideos(true)
      setError(null)

      const params = new URLSearchParams()
      if (selectedFilter !== 'all') {
        params.append('videoType', selectedFilter)
      }

      const response = await fetch(`/api/videos?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos')
      }

      const data = await response.json()
      setVideos(data.videos || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos')
    } finally {
      setLoadingVideos(false)
    }
  }

  const handleUploadComplete = (video: Video) => {
    setVideos(prev => [video, ...prev])
    setShowUpload(false)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getVideoTypeIcon = (type: string) => {
    switch (type) {
      case 'practice': return '🎾'
      case 'match': return '🏆'
      case 'training': return '💪'
      case 'analysis': return '📊'
      default: return '🎥'
    }
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-gray-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-white">
                Video Library
              </h1>
              <p className="text-sm text-text-secondary">
                Upload and analyze practice and match videos
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowUpload(true)}>
                + Upload Video
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showUpload ? (
          <VideoUpload
            onUploadComplete={handleUploadComplete}
            onClose={() => setShowUpload(false)}
          />
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">Filter Videos</h3>
                <div className="flex space-x-2">
                  {[
                    { value: 'all', label: 'All Videos' },
                    { value: 'practice', label: 'Practice' },
                    { value: 'match', label: 'Matches' },
                    { value: 'training', label: 'Training' },
                    { value: 'analysis', label: 'Analysis' },
                  ].map(filter => (
                    <Button
                      key={filter.value}
                      variant={selectedFilter === filter.value ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedFilter(filter.value)}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Video Grid */}
            {loadingVideos ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <LoadingSkeleton lines={4} />
                  </Card>
                ))}
              </div>
            ) : error ? (
              <Card className="p-6 text-center">
                <div className="text-error mb-4">❌</div>
                <p className="text-error font-medium mb-2">Failed to load videos</p>
                <p className="text-text-muted text-sm mb-4">{error}</p>
                <Button onClick={fetchVideos} size="sm">
                  Try Again
                </Button>
              </Card>
            ) : videos.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No videos yet
                </h3>
                <p className="text-text-muted mb-6">
                  Upload your first video to get started with video analysis
                </p>
                <Button onClick={() => setShowUpload(true)}>
                  Upload Video
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Video Thumbnail */}
                    <div className="aspect-video bg-gray-dark relative">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-4xl text-text-muted">
                            {getVideoTypeIcon(video.videoType)}
                          </div>
                        </div>
                      )}
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      {video.duration > 0 && (
                        <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          video.status === 'uploaded' 
                            ? 'bg-success/20 text-success' 
                            : 'bg-warning/20 text-warning'
                        }`}>
                          {video.status}
                        </span>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-white truncate flex-1">
                          {video.title}
                        </h4>
                        <span className="text-lg ml-2">
                          {getVideoTypeIcon(video.videoType)}
                        </span>
                      </div>

                      {video.description && (
                        <p className="text-sm text-text-muted mb-3 line-clamp-2">
                          {video.description}
                        </p>
                      )}

                      <div className="space-y-2 text-xs text-text-muted">
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{formatFileSize(video.fileSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uploaded:</span>
                          <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                        </div>
                        {video.tags && video.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {video.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className="bg-navy/20 text-navy text-xs px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {video.tags.length > 3 && (
                              <span className="text-text-muted text-xs">
                                +{video.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 mt-4">
                        <Button size="sm" className="flex-1">
                          Play
                        </Button>
                        <Button variant="ghost" size="sm">
                          📝
                        </Button>
                        <Button variant="ghost" size="sm">
                          📤
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}