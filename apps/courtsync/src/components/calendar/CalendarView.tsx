/**
 * Calendar View Component
 * 
 * Main calendar interface with month/week/day views and event management
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useAuth } from '@/hooks/useAuth'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  eventType: 'practice' | 'match' | 'travel' | 'meeting' | 'social'
  startTime: string
  endTime: string
  location?: string
  isAllDay: boolean
  requiresAttendance: boolean
  createdBy: string
  attendanceCount?: number
  maxParticipants?: number
  hasConflicts?: boolean
}

interface CalendarViewProps {
  selectedDate: Date
  onDateSelect?: (date: Date) => void
  onEventSelect?: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date) => void
}

type ViewMode = 'month' | 'week' | 'day'

export function CalendarView({
  selectedDate,
  onDateSelect,
  onEventSelect,
  onCreateEvent
}: CalendarViewProps) {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [selectedDate, viewMode])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      // Calculate date range based on view mode
      const { startDate, endDate } = getDateRange(selectedDate, viewMode)

      const response = await fetch(
        `/api/events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = (date: Date, mode: ViewMode) => {
    const startDate = new Date(date)
    const endDate = new Date(date)

    switch (mode) {
      case 'month':
        startDate.setDate(1)
        endDate.setMonth(endDate.getMonth() + 1, 0)
        break
      case 'week':
        const dayOfWeek = startDate.getDay()
        startDate.setDate(startDate.getDate() - dayOfWeek)
        endDate.setDate(startDate.getDate() + 6)
        break
      case 'day':
        // Same day for both start and end
        break
    }

    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    return { startDate, endDate }
  }

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'practice':
        return 'bg-blue-500/20 border-blue-500 text-blue-400'
      case 'match':
        return 'bg-red-500/20 border-red-500 text-red-400'
      case 'travel':
        return 'bg-purple-500/20 border-purple-500 text-purple-400'
      case 'meeting':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
      case 'social':
        return 'bg-green-500/20 border-green-500 text-green-400'
      default:
        return 'bg-gray-500/20 border-gray-500 text-gray-400'
    }
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'practice':
        return '🎾'
      case 'match':
        return '🏆'
      case 'travel':
        return '🚌'
      case 'meeting':
        return '🤝'
      case 'social':
        return '🎉'
      default:
        return '📅'
    }
  }

  const formatEventTime = (startTime: string, endTime: string, isAllDay: boolean) => {
    if (isAllDay) return 'All Day'

    const start = new Date(startTime)
    const end = new Date(endTime)

    return `${start.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${end.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)

    switch (viewMode) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
    }

    onDateSelect?.(newDate)
  }

  const handleCreateEvent = (date?: Date) => {
    onCreateEvent?.(date || selectedDate)
  }

  const canCreateEvents = ['coach', 'assistant_coach', 'captain'].includes(user?.role || '')

  if (loading) {
    return (
      <Card className="p-6">
        <LoadingSkeleton lines={8} />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-error mb-4">❌</div>
        <p className="text-error font-medium mb-2">Failed to load calendar</p>
        <p className="text-text-muted text-sm mb-4">{error}</p>
        <Button onClick={fetchEvents} size="sm">
          Try Again
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              ←
            </Button>
            <h2 className="text-lg font-semibold text-white">
              {selectedDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
                ...(viewMode === 'day' && { day: 'numeric' })
              })}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              →
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggles */}
            <div className="flex bg-surface border border-gray-dark rounded overflow-hidden">
              {(['month', 'week', 'day'] as ViewMode[]).map(mode => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none border-0"
                  onClick={() => setViewMode(mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>

            {canCreateEvents && (
              <Button
                onClick={() => handleCreateEvent()}
                size="sm"
              >
                + Add Event
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-blue-400 font-medium">
              {events.filter(e => e.eventType === 'practice').length}
            </div>
            <div className="text-text-muted">Practices</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-medium">
              {events.filter(e => e.eventType === 'match').length}
            </div>
            <div className="text-text-muted">Matches</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-medium">
              {events.filter(e => e.eventType === 'travel').length}
            </div>
            <div className="text-text-muted">Travel</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-medium">
              {events.filter(e => e.hasConflicts).length}
            </div>
            <div className="text-text-muted">Conflicts</div>
          </div>
        </div>
      </Card>

      {/* Calendar Content */}
      {viewMode === 'month' && (
        <MonthView
          selectedDate={selectedDate}
          events={events}
          onDateSelect={onDateSelect}
          onEventSelect={onEventSelect}
          onCreateEvent={handleCreateEvent}
          canCreateEvents={canCreateEvents}
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          selectedDate={selectedDate}
          events={events}
          onEventSelect={onEventSelect}
          onCreateEvent={handleCreateEvent}
          canCreateEvents={canCreateEvents}
        />
      )}

      {viewMode === 'day' && (
        <DayView
          selectedDate={selectedDate}
          events={events}
          onEventSelect={onEventSelect}
          onCreateEvent={handleCreateEvent}
          canCreateEvents={canCreateEvents}
        />
      )}

      {/* Events Legend */}
      <Card className="p-4">
        <h3 className="font-medium text-white mb-3">Event Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          {[
            { type: 'practice', label: 'Practice' },
            { type: 'match', label: 'Match' },
            { type: 'travel', label: 'Travel' },
            { type: 'meeting', label: 'Meeting' },
            { type: 'social', label: 'Social' },
          ].map(({ type, label }) => (
            <div key={type} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded border ${getEventTypeColor(type)}`}></div>
              <span className="text-white">{getEventTypeIcon(type)} {label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// Month View Component
function MonthView({ 
  selectedDate, 
  events, 
  onDateSelect, 
  onEventSelect, 
  onCreateEvent,
  canCreateEvents 
}: any) {
  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay()
  
  const days = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1
    const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth
    const date = isCurrentMonth 
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dayNumber)
      : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dayNumber)

    const dayEvents = events.filter((event: CalendarEvent) => {
      const eventDate = new Date(event.startTime).toDateString()
      return eventDate === date.toDateString()
    })

    return { date, dayNumber, isCurrentMonth, events: dayEvents }
  })

  return (
    <Card className="p-4">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-text-muted py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-24 p-2 border border-gray-dark rounded cursor-pointer hover:bg-surface/50 transition-colors ${
              day.isCurrentMonth ? 'bg-bg' : 'bg-gray-dark/20 opacity-50'
            } ${
              day.date.toDateString() === new Date().toDateString() 
                ? 'ring-2 ring-navy' 
                : ''
            }`}
            onClick={() => day.isCurrentMonth && onDateSelect?.(day.date)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${
                day.isCurrentMonth ? 'text-white' : 'text-text-muted'
              }`}>
                {day.dayNumber}
              </span>
              {day.events.length > 0 && (
                <span className="text-xs text-navy bg-navy/20 px-1 rounded">
                  {day.events.length}
                </span>
              )}
            </div>

            <div className="space-y-1">
              {day.events.slice(0, 2).map((event: CalendarEvent) => (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded cursor-pointer border ${getEventTypeColor(event.eventType)}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventSelect?.(event)
                  }}
                >
                  <div className="truncate font-medium">
                    {getEventTypeIcon(event.eventType)} {event.title}
                  </div>
                  {!event.isAllDay && (
                    <div className="truncate opacity-75">
                      {new Date(event.startTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  )}
                </div>
              ))}
              {day.events.length > 2 && (
                <div className="text-xs text-text-muted">
                  +{day.events.length - 2} more
                </div>
              )}
            </div>

            {canCreateEvents && day.isCurrentMonth && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-1 text-xs opacity-0 hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onCreateEvent?.(day.date)
                }}
              >
                + Add
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// Week View Component (simplified)
function WeekView({ selectedDate, events, onEventSelect }: any) {
  return (
    <Card className="p-4">
      <div className="text-center text-text-muted">
        Week view coming soon...
      </div>
    </Card>
  )
}

// Day View Component (simplified)
function DayView({ selectedDate, events, onEventSelect }: any) {
  const dayEvents = events.filter((event: CalendarEvent) => {
    const eventDate = new Date(event.startTime).toDateString()
    return eventDate === selectedDate.toDateString()
  })

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {dayEvents.length === 0 ? (
          <div className="text-center text-text-muted py-8">
            No events scheduled for this day
          </div>
        ) : (
          dayEvents.map((event: CalendarEvent) => (
            <div
              key={event.id}
              className={`p-4 rounded border cursor-pointer hover:opacity-80 ${getEventTypeColor(event.eventType)}`}
              onClick={() => onEventSelect?.(event)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-white mb-1">
                    {getEventTypeIcon(event.eventType)} {event.title}
                  </h4>
                  <p className="text-sm opacity-75">
                    {formatEventTime(event.startTime, event.endTime, event.isAllDay)}
                  </p>
                  {event.location && (
                    <p className="text-sm opacity-75">📍 {event.location}</p>
                  )}
                </div>
                {event.requiresAttendance && (
                  <div className="text-xs">
                    {event.attendanceCount || 0}
                    {event.maxParticipants && `/${event.maxParticipants}`} attending
                  </div>
                )}
              </div>
              {event.description && (
                <p className="text-sm mt-2 opacity-75">{event.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

// Helper function moved outside component for reuse
function getEventTypeColor(eventType: string) {
  switch (eventType) {
    case 'practice':
      return 'bg-blue-500/20 border-blue-500 text-blue-400'
    case 'match':
      return 'bg-red-500/20 border-red-500 text-red-400'
    case 'travel':
      return 'bg-purple-500/20 border-purple-500 text-purple-400'
    case 'meeting':
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
    case 'social':
      return 'bg-green-500/20 border-green-500 text-green-400'
    default:
      return 'bg-gray-500/20 border-gray-500 text-gray-400'
  }
}

function getEventTypeIcon(eventType: string) {
  switch (eventType) {
    case 'practice':
      return '🎾'
    case 'match':
      return '🏆'
    case 'travel':
      return '🚌'
    case 'meeting':
      return '🤝'
    case 'social':
      return '🎉'
    default:
      return '📅'
  }
}

function formatEventTime(startTime: string, endTime: string, isAllDay: boolean) {
  if (isAllDay) return 'All Day'

  const start = new Date(startTime)
  const end = new Date(endTime)

  return `${start.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })} - ${end.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`
}