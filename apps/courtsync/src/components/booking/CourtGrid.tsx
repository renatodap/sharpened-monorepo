/**
 * Court Grid Component
 * 
 * Displays available courts in a grid layout with booking status
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useAuth } from '@/hooks/useAuth'

interface Court {
  id: string
  name: string
  facilityId: string
  surfaceType: 'hard' | 'clay' | 'grass' | 'indoor'
  isActive: boolean
  maintenanceNotes?: string
  currentBooking?: {
    id: string
    purpose: string
    startTime: string
    endTime: string
    bookedBy: string
  }
}

interface Facility {
  id: string
  name: string
  type: 'outdoor' | 'indoor'
  weatherDependent: boolean
}

interface CourtGridProps {
  selectedDate: Date
  selectedTimeSlot?: { start: string; end: string }
  onCourtSelect?: (court: Court) => void
  onBookCourt?: (court: Court) => void
}

export function CourtGrid({ 
  selectedDate, 
  selectedTimeSlot,
  onCourtSelect,
  onBookCourt 
}: CourtGridProps) {
  const { user } = useAuth()
  const [courts, setCourts] = useState<Court[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourtsAndFacilities()
  }, [selectedDate])

  const fetchCourtsAndFacilities = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch courts and facilities in parallel
      const [courtsResponse, facilitiesResponse] = await Promise.all([
        fetch('/api/courts'),
        fetch('/api/facilities')
      ])

      if (!courtsResponse.ok || !facilitiesResponse.ok) {
        throw new Error('Failed to fetch court data')
      }

      const [courtsData, facilitiesData] = await Promise.all([
        courtsResponse.json(),
        facilitiesResponse.json()
      ])

      setCourts(courtsData.courts || [])
      setFacilities(facilitiesData.facilities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courts')
    } finally {
      setLoading(false)
    }
  }

  const getCourtAvailability = (court: Court) => {
    if (!selectedTimeSlot) return 'unknown'
    
    // Check if court has a current booking during selected time
    if (court.currentBooking) {
      const bookingStart = new Date(court.currentBooking.startTime)
      const bookingEnd = new Date(court.currentBooking.endTime)
      const slotStart = new Date(selectedDate.toDateString() + ' ' + selectedTimeSlot.start)
      const slotEnd = new Date(selectedDate.toDateString() + ' ' + selectedTimeSlot.end)

      // Check for overlap
      if (bookingStart < slotEnd && bookingEnd > slotStart) {
        return 'booked'
      }
    }

    return court.isActive ? 'available' : 'maintenance'
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'border-success bg-success/10'
      case 'booked':
        return 'border-error bg-error/10'
      case 'maintenance':
        return 'border-warning bg-warning/10'
      default:
        return 'border-gray-dark'
    }
  }

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available':
        return '✅'
      case 'booked':
        return '❌'
      case 'maintenance':
        return '🔧'
      default:
        return '❓'
    }
  }

  const handleCourtClick = (court: Court) => {
    onCourtSelect?.(court)
  }

  const handleBookClick = (e: React.MouseEvent, court: Court) => {
    e.stopPropagation()
    onBookCourt?.(court)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton lines={3} className="h-32" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-error mb-4">❌</div>
        <p className="text-error font-medium mb-2">Failed to load courts</p>
        <p className="text-text-muted text-sm mb-4">{error}</p>
        <Button onClick={fetchCourtsAndFacilities} size="sm">
          Try Again
        </Button>
      </Card>
    )
  }

  // Group courts by facility
  const courtsByFacility = facilities.map(facility => ({
    facility,
    courts: courts.filter(court => court.facilityId === facility.id)
  }))

  return (
    <div className="space-y-8">
      {courtsByFacility.map(({ facility, courts: facilityCourts }) => (
        <div key={facility.id}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {facility.name}
              <span className="ml-2 text-sm text-text-muted">
                ({facility.type} • {facilityCourts.length} courts)
              </span>
            </h3>
            {facility.weatherDependent && (
              <span className="text-xs px-2 py-1 bg-warning/20 text-warning rounded-full">
                Weather Dependent
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {facilityCourts.map(court => {
              const availability = getCourtAvailability(court)
              const availabilityColor = getAvailabilityColor(availability)
              const canBook = availability === 'available' && selectedTimeSlot

              return (
                <Card
                  key={court.id}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 ${availabilityColor}`}
                  onClick={() => handleCourtClick(court)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{court.name}</h4>
                      <p className="text-sm text-text-muted capitalize">
                        {court.surfaceType} court
                      </p>
                    </div>
                    <div className="text-xl" role="img" aria-label={availability}>
                      {getAvailabilityIcon(availability)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Status:</span>
                      <span className={`capitalize font-medium ${
                        availability === 'available' ? 'text-success' :
                        availability === 'booked' ? 'text-error' :
                        'text-warning'
                      }`}>
                        {availability}
                      </span>
                    </div>

                    {court.currentBooking && availability === 'booked' && (
                      <div className="text-xs text-text-muted">
                        <p>{court.currentBooking.purpose}</p>
                        <p>
                          {new Date(court.currentBooking.startTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(court.currentBooking.endTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    )}

                    {court.maintenanceNotes && availability === 'maintenance' && (
                      <div className="text-xs text-warning">
                        {court.maintenanceNotes}
                      </div>
                    )}
                  </div>

                  {canBook && (
                    <Button
                      onClick={(e) => handleBookClick(e, court)}
                      size="sm"
                      className="w-full mt-3"
                      variant="default"
                    >
                      Book Court
                    </Button>
                  )}

                  {!selectedTimeSlot && (
                    <div className="mt-3 text-xs text-text-muted text-center">
                      Select a time slot to book
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {facilityCourts.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-text-muted">No courts available in this facility</p>
            </Card>
          )}
        </div>
      ))}

      {courtsByFacility.length === 0 && (
        <Card className="p-6 text-center">
          <div className="text-text-muted mb-4">🎾</div>
          <p className="text-text-muted">
            No courts configured yet. Contact your coach to set up courts.
          </p>
        </Card>
      )}
    </div>
  )
}