/**
 * Team Calendar Page
 * 
 * Main calendar interface for viewing and managing team events
 */

'use client'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { CalendarView } from '@/components/calendar/CalendarView'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

export default function CalendarPage() {
  const { user, loading } = useRequireAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

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

  const canCreateEvents = ['coach', 'assistant_coach', 'captain'].includes(user.role)

  const handleEventSelect = (event: any) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  const handleCreateEvent = (date?: Date) => {
    setSelectedDate(date || selectedDate)
    setShowCreateModal(true)
  }

  const handleEventCreated = () => {
    setShowCreateModal(false)
    // Refresh calendar data
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-gray-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-white">
                Team Calendar
              </h1>
              <p className="text-sm text-text-secondary">
                Schedule and manage team events, practices, and matches
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {canCreateEvents && (
                <Button onClick={() => handleCreateEvent()}>
                  + Create Event
                </Button>
              )}
              <Button variant="secondary" size="sm">
                Export Calendar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Quick Actions & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="font-medium text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-2">
                {canCreateEvents && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleCreateEvent()}
                    >
                      🎾 Schedule Practice
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleCreateEvent()}
                    >
                      🏆 Add Match
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleCreateEvent()}
                    >
                      🚌 Plan Travel
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  disabled
                >
                  📱 Add to Phone
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  disabled
                >
                  🔔 Set Reminders
                </Button>
              </div>
            </Card>

            {/* Event Filters */}
            <Card className="p-4">
              <h3 className="font-medium text-white mb-4">Filter Events</h3>
              
              <div className="space-y-3">
                {[
                  { type: 'practice', label: 'Practices', icon: '🎾', count: 12 },
                  { type: 'match', label: 'Matches', icon: '🏆', count: 8 },
                  { type: 'travel', label: 'Travel', icon: '🚌', count: 5 },
                  { type: 'meeting', label: 'Meetings', icon: '🤝', count: 3 },
                  { type: 'social', label: 'Social', icon: '🎉', count: 2 },
                ].map(({ type, label, icon, count }) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-gray-dark bg-surface text-navy focus:ring-navy"
                    />
                    <span className="flex-1 flex items-center justify-between text-sm text-white">
                      <span>{icon} {label}</span>
                      <span className="text-text-muted">{count}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="p-4">
              <h3 className="font-medium text-white mb-4">Upcoming Events</h3>
              
              <div className="space-y-3">
                {[
                  {
                    title: 'Team Practice',
                    type: 'practice',
                    date: 'Tomorrow',
                    time: '5:00 PM',
                    icon: '🎾'
                  },
                  {
                    title: 'vs. Butler University',
                    type: 'match',
                    date: 'Friday',
                    time: '2:00 PM',
                    icon: '🏆'
                  },
                  {
                    title: 'Travel to Indy',
                    type: 'travel',
                    date: 'Saturday',
                    time: '8:00 AM',
                    icon: '🚌'
                  }
                ].map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="text-lg" role="img">
                      {event.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {event.date} • {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="ghost" size="sm" className="w-full mt-4">
                View All →
              </Button>
            </Card>

            {/* Team Schedule Sync */}
            <Card className="p-4">
              <h3 className="font-medium text-white mb-4">Schedule Integration</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Google Calendar</span>
                  <Button variant="ghost" size="sm" disabled>
                    Connect
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Outlook</span>
                  <Button variant="ghost" size="sm" disabled>
                    Connect
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Apple Calendar</span>
                  <Button variant="ghost" size="sm" disabled>
                    Connect
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-warning/20 border border-warning rounded">
                <p className="text-xs text-warning">
                  🚧 Integration features coming soon
                </p>
              </div>
            </Card>
          </div>

          {/* Main Calendar */}
          <div className="lg:col-span-3">
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onEventSelect={handleEventSelect}
              onCreateEvent={handleCreateEvent}
            />
          </div>
        </div>
      </main>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {selectedEvent.title}
                </h3>
                <p className="text-sm text-text-muted capitalize">
                  {selectedEvent.eventType} Event
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEventModal(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white">Time</label>
                <p className="text-sm text-text-secondary">
                  {new Date(selectedEvent.startTime).toLocaleDateString()} •{' '}
                  {selectedEvent.isAllDay ? 'All Day' : 
                    `${new Date(selectedEvent.startTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} - ${new Date(selectedEvent.endTime).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}`
                  }
                </p>
              </div>

              {selectedEvent.location && (
                <div>
                  <label className="text-sm font-medium text-white">Location</label>
                  <p className="text-sm text-text-secondary">{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <label className="text-sm font-medium text-white">Description</label>
                  <p className="text-sm text-text-secondary">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.requiresAttendance && (
                <div>
                  <label className="text-sm font-medium text-white">Attendance</label>
                  <p className="text-sm text-text-secondary">
                    {selectedEvent.attendanceCount || 0} confirmed
                    {selectedEvent.maxParticipants && ` (max ${selectedEvent.maxParticipants})`}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                {selectedEvent.requiresAttendance && (
                  <Button className="flex-1">
                    Mark Attending
                  </Button>
                )}
                <Button variant="secondary" className="flex-1">
                  Add to Calendar
                </Button>
                {canCreateEvents && (
                  <Button variant="ghost">
                    Edit Event
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Create Event Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create Event</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🚧</div>
              <p className="text-text-muted">
                Event creation form coming soon...
              </p>
              <Button
                className="mt-4"
                onClick={() => setShowCreateModal(false)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}