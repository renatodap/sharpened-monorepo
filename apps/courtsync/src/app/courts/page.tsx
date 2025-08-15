/**
 * Court Booking Page
 * 
 * Main interface for court booking with calendar view, court grid,
 * and quick booking functionality
 */

'use client'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/useAuth'
import { CourtGrid } from '@/components/booking/CourtGrid'
import { QuickBooking } from '@/components/booking/QuickBooking'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

const TIME_SLOTS = [
  { start: '06:00', end: '08:00', label: '6:00 AM - 8:00 AM' },
  { start: '08:00', end: '10:00', label: '8:00 AM - 10:00 AM' },
  { start: '10:00', end: '12:00', label: '10:00 AM - 12:00 PM' },
  { start: '12:00', end: '14:00', label: '12:00 PM - 2:00 PM' },
  { start: '14:00', end: '16:00', label: '2:00 PM - 4:00 PM' },
  { start: '16:00', end: '18:00', label: '4:00 PM - 6:00 PM' },
  { start: '18:00', end: '20:00', label: '6:00 PM - 8:00 PM' },
  { start: '20:00', end: '22:00', label: '8:00 PM - 10:00 PM' },
]

export default function CourtsPage() {
  const { user, loading } = useRequireAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string } | null>(null)
  const [showQuickBooking, setShowQuickBooking] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState<any>(null)

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isFutureDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + days)
    setSelectedDate(newDate)
    setSelectedTimeSlot(null) // Reset time slot when date changes
  }

  const handleCourtSelect = (court: any) => {
    setSelectedCourt(court)
    // Could open a detailed view or booking modal
  }

  const handleBookCourt = (court: any) => {
    setSelectedCourt(court)
    setShowQuickBooking(true)
  }

  const handleBookingCreated = (booking: any) => {
    // Refresh court grid or show success message
    console.log('Booking created:', booking)
    setShowQuickBooking(false)
    setSelectedCourt(null)
    setSelectedTimeSlot(null)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-gray-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-white">
                Court Booking
              </h1>
              <p className="text-sm text-text-secondary">
                Reserve courts for practice, matches, and training
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowQuickBooking(true)}
                disabled={!selectedTimeSlot}
              >
                Quick Book
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Date and Time Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Date Navigation */}
            <Card className="p-4">
              <h3 className="font-medium text-white mb-4">Select Date</h3>
              
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateChange(-1)}
                  disabled={!isFutureDate(new Date(selectedDate.getTime() - 86400000))}
                >
                  ←
                </Button>
                <div className="text-center">
                  <div className="text-white font-medium">
                    {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-xs text-text-muted">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateChange(1)}
                >
                  →
                </Button>
              </div>

              <div className="text-sm text-center">
                <div className="text-white">{formatDate(selectedDate)}</div>
                {isToday(selectedDate) && (
                  <div className="text-navy font-medium mt-1">Today</div>
                )}
              </div>

              {/* Quick Date Buttons */}
              <div className="mt-4 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setSelectedDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    const tomorrow = new Date()
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    setSelectedDate(tomorrow)
                  }}
                >
                  Tomorrow
                </Button>
              </div>
            </Card>

            {/* Time Slot Selection */}
            <Card className="p-4">
              <h3 className="font-medium text-white mb-4">Select Time Slot</h3>
              
              <div className="space-y-2">
                {TIME_SLOTS.map(slot => (
                  <Button
                    key={`${slot.start}-${slot.end}`}
                    variant={
                      selectedTimeSlot?.start === slot.start && selectedTimeSlot?.end === slot.end
                        ? 'default'
                        : 'ghost'
                    }
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => setSelectedTimeSlot({ start: slot.start, end: slot.end })}
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>

              {selectedTimeSlot && (
                <div className="mt-4 p-3 bg-navy/20 border border-navy rounded">
                  <div className="text-sm text-white font-medium">Selected Time</div>
                  <div className="text-sm text-text-secondary">
                    {selectedTimeSlot.start} - {selectedTimeSlot.end}
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="font-medium text-white mb-4">Quick Actions</h3>
              
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowQuickBooking(true)}
                  disabled={!selectedTimeSlot}
                >
                  🎾 Quick Book Practice
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  disabled
                >
                  📅 View My Bookings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  disabled
                >
                  ⚡ Team Schedule
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content - Court Grid */}
          <div className="lg:col-span-3">
            {selectedTimeSlot ? (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    Available Courts
                  </h2>
                  <div className="text-sm text-text-muted">
                    {formatDate(selectedDate)} • {selectedTimeSlot.start} - {selectedTimeSlot.end}
                  </div>
                </div>
                
                <CourtGrid
                  selectedDate={selectedDate}
                  selectedTimeSlot={selectedTimeSlot}
                  onCourtSelect={handleCourtSelect}
                  onBookCourt={handleBookCourt}
                />
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">🎾</div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Select a Time Slot
                </h2>
                <p className="text-text-muted">
                  Choose a date and time slot to view available courts and make bookings.
                </p>
              </Card>
            )}

            {/* Booking Legend */}
            <Card className="p-4 mt-6">
              <h3 className="font-medium text-white mb-3">Legend</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-success/20 border border-success rounded"></div>
                  <span className="text-white">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-error/20 border border-error rounded"></div>
                  <span className="text-white">Booked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-warning/20 border border-warning rounded"></div>
                  <span className="text-white">Maintenance</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Quick Booking Modal */}
      {showQuickBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <QuickBooking
              selectedDate={selectedDate}
              onBookingCreated={handleBookingCreated}
              onClose={() => setShowQuickBooking(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}