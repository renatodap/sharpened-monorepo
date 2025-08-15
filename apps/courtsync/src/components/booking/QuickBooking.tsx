/**
 * Quick Booking Component
 * 
 * Provides a streamlined interface for common booking scenarios like
 * "Book 5-7 PM Team Practice" with smart defaults and conflict resolution
 */

'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/hooks/useAuth'

interface QuickBookingProps {
  selectedDate: Date
  onBookingCreated?: (booking: any) => void
  onClose?: () => void
}

const QUICK_TEMPLATES = [
  {
    id: 'team-practice',
    name: 'Team Practice',
    duration: 120, // 2 hours
    purpose: 'practice',
    defaultTime: '17:00', // 5 PM
  },
  {
    id: 'individual-training',
    name: 'Individual Training',
    duration: 60, // 1 hour
    purpose: 'training',
    defaultTime: '16:00', // 4 PM
  },
  {
    id: 'match',
    name: 'Match',
    duration: 180, // 3 hours
    purpose: 'match',
    defaultTime: '14:00', // 2 PM
  },
  {
    id: 'custom',
    name: 'Custom Booking',
    duration: 60,
    purpose: 'practice',
    defaultTime: '15:00', // 3 PM
  }
]

export function QuickBooking({ selectedDate, onBookingCreated, onClose }: QuickBookingProps) {
  const { user } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState(QUICK_TEMPLATES[0])
  const [startTime, setStartTime] = useState(selectedTemplate.defaultTime)
  const [duration, setDuration] = useState(selectedTemplate.duration)
  const [purpose, setPurpose] = useState(selectedTemplate.purpose)
  const [notes, setNotes] = useState('')
  const [courtPreference, setCourtPreference] = useState<string>('any')
  const [loading, setLoading] = useState(false)
  const [conflicts, setConflicts] = useState<any[]>([])
  const [showConflictResolution, setShowConflictResolution] = useState(false)

  const calculateEndTime = (start: string, durationMinutes: number) => {
    const [hours, minutes] = start.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
    return endDate.toTimeString().slice(0, 5)
  }

  const handleTemplateChange = (templateId: string) => {
    const template = QUICK_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      setStartTime(template.defaultTime)
      setDuration(template.duration)
      setPurpose(template.purpose)
      setConflicts([])
      setShowConflictResolution(false)
    }
  }

  const checkForConflicts = async () => {
    try {
      const endTime = calculateEndTime(startTime, duration)
      const startDateTime = new Date(selectedDate.toDateString() + ' ' + startTime)
      const endDateTime = new Date(selectedDate.toDateString() + ' ' + endTime)

      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-conflicts',
          courtId: courtPreference === 'any' ? undefined : courtPreference,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      })

      const data = await response.json()
      
      if (data.hasConflicts) {
        setConflicts(data.conflicts)
        setShowConflictResolution(true)
        return false
      }
      
      setConflicts([])
      setShowConflictResolution(false)
      return true
    } catch (error) {
      console.error('Conflict check failed:', error)
      return true // Proceed if check fails
    }
  }

  const handleQuickBook = async () => {
    setLoading(true)
    
    try {
      // First check for conflicts
      const noConflicts = await checkForConflicts()
      
      if (!noConflicts && !['coach', 'assistant_coach'].includes(user?.role || '')) {
        // Non-coaches cannot override conflicts
        setLoading(false)
        return
      }

      // Proceed with booking
      const endTime = calculateEndTime(startTime, duration)
      const startDateTime = new Date(selectedDate.toDateString() + ' ' + startTime)
      const endDateTime = new Date(selectedDate.toDateString() + ' ' + endTime)

      const bookingData = {
        courtId: courtPreference === 'any' ? await findBestAvailableCourt() : courtPreference,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        purpose,
        notes: notes || `${selectedTemplate.name} - Quick booked`,
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Booking failed')
      }

      const result = await response.json()
      onBookingCreated?.(result.booking)
      onClose?.()
      
    } catch (error) {
      console.error('Quick booking failed:', error)
      // Show error to user
    } finally {
      setLoading(false)
    }
  }

  const findBestAvailableCourt = async (): Promise<string> => {
    // This would implement logic to find the best available court
    // For now, return a placeholder
    return 'court-1'
  }

  const handleOverrideConflicts = async () => {
    if (!['coach', 'assistant_coach'].includes(user?.role || '')) {
      return
    }
    
    // Coach can override conflicts
    setShowConflictResolution(false)
    await handleQuickBook()
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Quick Booking</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Booking Type
          </label>
          <Select
            value={selectedTemplate.id}
            onValueChange={handleTemplateChange}
            placeholder="Select booking type"
          >
            {QUICK_TEMPLATES.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Date Display */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Date
          </label>
          <div className="px-3 py-2 bg-surface border border-gray-dark rounded text-white">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Time and Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Start Time
            </label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Duration (minutes)
            </label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="30"
              max="300"
              step="30"
              className="w-full"
            />
          </div>
        </div>

        {/* End Time Display */}
        <div className="text-sm text-text-muted">
          End Time: {calculateEndTime(startTime, duration)}
        </div>

        {/* Purpose and Notes */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Purpose
          </label>
          <Select
            value={purpose}
            onValueChange={setPurpose}
            placeholder="Select purpose"
          >
            <option value="practice">Practice</option>
            <option value="match">Match</option>
            <option value="training">Training</option>
            <option value="maintenance">Maintenance</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Notes (Optional)
          </label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            className="w-full"
          />
        </div>

        {/* Court Preference */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Court Preference
          </label>
          <Select
            value={courtPreference}
            onValueChange={setCourtPreference}
            placeholder="Select court"
          >
            <option value="any">Any Available Court</option>
            <option value="court-1">Court 1 (Outdoor)</option>
            <option value="court-2">Court 2 (Outdoor)</option>
            <option value="court-indoor-1">Indoor Court 1</option>
            <option value="court-indoor-2">Indoor Court 2</option>
          </Select>
        </div>

        {/* Conflict Resolution */}
        {showConflictResolution && (
          <Alert variant="warning">
            <h4 className="font-medium mb-2">Booking Conflicts Detected</h4>
            <div className="space-y-2 mb-4">
              {conflicts.map((conflict, index) => (
                <div key={index} className="text-sm">
                  Court {conflict.courtName}: {conflict.purpose} from{' '}
                  {new Date(conflict.startTime).toLocaleTimeString()} to{' '}
                  {new Date(conflict.endTime).toLocaleTimeString()}
                </div>
              ))}
            </div>
            {['coach', 'assistant_coach'].includes(user?.role || '') ? (
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleOverrideConflicts}>
                  Override Conflicts
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowConflictResolution(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <p className="text-sm">
                Please select a different time or contact your coach to resolve conflicts.
              </p>
            )}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={handleQuickBook}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Booking...' : 'Quick Book'}
          </Button>
          <Button
            onClick={checkForConflicts}
            variant="secondary"
            disabled={loading}
          >
            Check Conflicts
          </Button>
        </div>
      </div>
    </Card>
  )
}