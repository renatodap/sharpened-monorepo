/**
 * Video Upload Component
 * 
 * Drag and drop video upload interface with progress tracking
 */

'use client'

import React, { useState, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/hooks/useAuth'

interface VideoUploadProps {
  eventId?: string
  onUploadComplete?: (video: any) => void
  onClose?: () => void
}

interface UploadState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
}

export function VideoUpload({ eventId, onUploadComplete, onClose }: VideoUploadProps) {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>({ 
    status: 'idle', 
    progress: 0 
  })
  
  // Form data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoType, setVideoType] = useState<string>('practice')
  const [tags, setTags] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Please select a supported video file (MP4, MOV, AVI, WebM)'
      })
      return
    }

    // Validate file size (500MB limit for MVP)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'File size must be less than 500MB'
      })
      return
    }

    setSelectedFile(file)
    setUploadState({ status: 'idle', progress: 0 })
    
    // Auto-generate title from filename if empty
    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setTitle(nameWithoutExt.replace(/[_-]/g, ' '))
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: 'Please select a file and provide a title'
      })
      return
    }

    setUploadState({ status: 'uploading', progress: 0 })

    try {
      // Step 1: Get upload URL
      const uploadUrlResponse = await fetch(
        `/api/videos?action=get-upload-url&fileName=${encodeURIComponent(selectedFile.name)}&fileType=${encodeURIComponent(selectedFile.type)}`
      )

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL')
      }

      const { uploadUrl, fileKey } = await uploadUrlResponse.json()

      // Step 2: Simulate file upload with progress
      // In a real implementation, this would upload to cloud storage
      await simulateUpload()

      // Step 3: Create video record
      const videoData = {
        title: title.trim(),
        description: description.trim() || undefined,
        eventId: eventId || undefined,
        videoType,
        tags: tags.trim() ? tags.split(',').map(t => t.trim()) : undefined,
        isPublic,
      }

      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData),
      })

      if (!response.ok) {
        throw new Error('Failed to save video')
      }

      const result = await response.json()

      setUploadState({ status: 'completed', progress: 100 })
      onUploadComplete?.(result.video)

      // Reset form after successful upload
      setTimeout(() => {
        resetForm()
      }, 2000)

    } catch (error) {
      console.error('Upload failed:', error)
      setUploadState({
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      })
    }
  }

  const simulateUpload = (): Promise<void> => {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setUploadState({ status: 'processing', progress: 100 })
          setTimeout(resolve, 1000) // Simulate processing time
        } else {
          setUploadState({ status: 'uploading', progress })
        }
      }, 200)
    })
  }

  const resetForm = () => {
    setSelectedFile(null)
    setTitle('')
    setDescription('')
    setVideoType('practice')
    setTags('')
    setIsPublic(false)
    setUploadState({ status: 'idle', progress: 0 })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Upload Video</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-navy bg-navy/10'
            : selectedFile
            ? 'border-success bg-success/10'
            : 'border-gray-dark bg-surface/50'
        } ${uploadState.status === 'uploading' || uploadState.status === 'processing' ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="text-4xl">🎥</div>
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-text-muted text-sm">
                {formatFileSize(selectedFile.size)} • {selectedFile.type}
              </p>
            </div>
            {uploadState.status === 'idle' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
              >
                Remove File
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl text-text-muted">📹</div>
            <div>
              <p className="text-white font-medium mb-2">
                Drag and drop your video here
              </p>
              <p className="text-text-muted text-sm mb-4">
                or click to browse files
              </p>
              <input
                type="file"
                accept="video/mp4,video/mov,video/avi,video/webm"
                onChange={handleFileInputChange}
                className="hidden"
                id="video-upload"
              />
              <Button
                as="label"
                htmlFor="video-upload"
                variant="secondary"
                size="sm"
              >
                Choose File
              </Button>
            </div>
            <p className="text-xs text-text-muted">
              Supported formats: MP4, MOV, AVI, WebM • Max size: 500MB
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white">
              {uploadState.status === 'uploading' ? 'Uploading...' : 'Processing...'}
            </span>
            <span className="text-sm text-text-muted">
              {Math.round(uploadState.progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-dark rounded-full h-2">
            <div
              className="bg-navy h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {uploadState.status === 'error' && uploadState.error && (
        <Alert variant="error" className="mt-4">
          {uploadState.error}
        </Alert>
      )}

      {/* Success Display */}
      {uploadState.status === 'completed' && (
        <Alert variant="success" className="mt-4">
          Video uploaded successfully! Processing complete.
        </Alert>
      )}

      {/* Metadata Form */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title..."
            disabled={uploadState.status === 'uploading' || uploadState.status === 'processing'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description..."
            rows={3}
            className="w-full px-3 py-2 bg-surface border border-gray-dark rounded text-white placeholder-text-muted focus:border-navy focus:ring-1 focus:ring-navy"
            disabled={uploadState.status === 'uploading' || uploadState.status === 'processing'}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Video Type
            </label>
            <Select
              value={videoType}
              onValueChange={setVideoType}
              disabled={uploadState.status === 'uploading' || uploadState.status === 'processing'}
            >
              <option value="practice">Practice</option>
              <option value="match">Match</option>
              <option value="training">Training</option>
              <option value="analysis">Analysis</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tags (comma separated)
            </label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="forehand, serve, rally..."
              disabled={uploadState.status === 'uploading' || uploadState.status === 'processing'}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="video-public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-gray-dark bg-surface text-navy focus:ring-navy"
            disabled={uploadState.status === 'uploading' || uploadState.status === 'processing'}
          />
          <label htmlFor="video-public" className="text-sm text-white">
            Make video publicly visible to team
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-6">
        <Button
          onClick={handleUpload}
          disabled={
            !selectedFile || 
            !title.trim() || 
            uploadState.status === 'uploading' || 
            uploadState.status === 'processing' ||
            uploadState.status === 'completed'
          }
          className="flex-1"
        >
          {uploadState.status === 'uploading' && 'Uploading...'}
          {uploadState.status === 'processing' && 'Processing...'}
          {uploadState.status === 'completed' && 'Upload Complete'}
          {uploadState.status === 'idle' && 'Upload Video'}
          {uploadState.status === 'error' && 'Retry Upload'}
        </Button>
        
        {uploadState.status === 'idle' && (
          <Button variant="ghost" onClick={resetForm}>
            Clear
          </Button>
        )}
      </div>
    </Card>
  )
}