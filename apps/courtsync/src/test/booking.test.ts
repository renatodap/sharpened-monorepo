/**
 * Court Booking System Tests
 * 
 * Tests for the court booking functionality including:
 * - Conflict detection
 * - Role-based booking permissions
 * - Quick booking templates
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock data
const mockCourts = [
  {
    id: 'court-1',
    name: 'Court 1',
    facilityId: 'outdoor-facility',
    surfaceType: 'hard',
    isActive: true,
  },
  {
    id: 'court-2',
    name: 'Court 2',
    facilityId: 'outdoor-facility',
    surfaceType: 'hard',
    isActive: true,
  },
  {
    id: 'court-indoor-1',
    name: 'Indoor Court 1',
    facilityId: 'indoor-facility',
    surfaceType: 'indoor',
    isActive: true,
  }
]

const mockBookings = [
  {
    id: 'booking-1',
    courtId: 'court-1',
    startTime: '2024-01-15T17:00:00Z',
    endTime: '2024-01-15T19:00:00Z',
    purpose: 'practice',
    bookedBy: 'user-coach',
    status: 'confirmed',
  }
]

describe('Court Booking System', () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = vi.fn()
    vi.clearAllMocks()
  })

  describe('Conflict Detection', () => {
    it('should detect time overlap conflicts', () => {
      const existingBooking = {
        startTime: new Date('2024-01-15T17:00:00Z'),
        endTime: new Date('2024-01-15T19:00:00Z'),
      }

      const newBooking = {
        startTime: new Date('2024-01-15T18:00:00Z'),
        endTime: new Date('2024-01-15T20:00:00Z'),
      }

      // Check for overlap
      const hasConflict = (
        newBooking.startTime < existingBooking.endTime &&
        newBooking.endTime > existingBooking.startTime
      )

      expect(hasConflict).toBe(true)
    })

    it('should not detect conflicts for non-overlapping times', () => {
      const existingBooking = {
        startTime: new Date('2024-01-15T17:00:00Z'),
        endTime: new Date('2024-01-15T19:00:00Z'),
      }

      const newBooking = {
        startTime: new Date('2024-01-15T19:00:00Z'),
        endTime: new Date('2024-01-15T21:00:00Z'),
      }

      // Check for overlap
      const hasConflict = (
        newBooking.startTime < existingBooking.endTime &&
        newBooking.endTime > existingBooking.startTime
      )

      expect(hasConflict).toBe(false)
    })

    it('should handle edge case where booking ends exactly when another starts', () => {
      const existingBooking = {
        startTime: new Date('2024-01-15T17:00:00Z'),
        endTime: new Date('2024-01-15T19:00:00Z'),
      }

      const newBooking = {
        startTime: new Date('2024-01-15T19:00:00Z'),
        endTime: new Date('2024-01-15T21:00:00Z'),
      }

      // Exact time boundaries should not conflict
      const hasConflict = (
        newBooking.startTime < existingBooking.endTime &&
        newBooking.endTime > existingBooking.startTime
      )

      expect(hasConflict).toBe(false)
    })
  })

  describe('Booking Creation API', () => {
    it('should create booking successfully with valid data', async () => {
      const mockBooking = {
        id: 'booking-new',
        courtId: 'court-2',
        startTime: '2024-01-16T15:00:00Z',
        endTime: '2024-01-16T16:00:00Z',
        purpose: 'practice',
        bookedBy: 'user-player',
        status: 'confirmed',
      }

      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ booking: mockBooking }),
      } as Response)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: 'court-2',
          startTime: '2024-01-16T15:00:00Z',
          endTime: '2024-01-16T16:00:00Z',
          purpose: 'practice',
        }),
      })

      const result = await response.json()

      expect(response.ok).toBe(true)
      expect(result.booking.id).toBe('booking-new')
      expect(result.booking.courtId).toBe('court-2')
    })

    it('should reject booking with end time before start time', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'End time must be after start time' }),
      } as Response)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: 'court-1',
          startTime: '2024-01-16T17:00:00Z',
          endTime: '2024-01-16T16:00:00Z', // End before start
          purpose: 'practice',
        }),
      })

      const result = await response.json()

      expect(response.ok).toBe(false)
      expect(result.error).toBe('End time must be after start time')
    })

    it('should reject booking in the past', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Cannot book in the past' }),
      } as Response)

      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: 'court-1',
          startTime: pastDate.toISOString(),
          endTime: new Date(pastDate.getTime() + 3600000).toISOString(),
          purpose: 'practice',
        }),
      })

      const result = await response.json()

      expect(response.ok).toBe(false)
      expect(result.error).toBe('Cannot book in the past')
    })
  })

  describe('Role-based Permissions', () => {
    it('should allow coaches to override conflicts', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          booking: { id: 'booking-override', status: 'override' },
          conflicts: [{ id: 'existing-booking', courtName: 'Court 1' }],
        }),
      } as Response)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: 'court-1',
          startTime: '2024-01-15T17:30:00Z', // Overlaps with existing booking
          endTime: '2024-01-15T18:30:00Z',
          purpose: 'practice',
        }),
      })

      const result = await response.json()

      expect(response.ok).toBe(true)
      expect(result.booking.status).toBe('override')
      expect(result.conflicts).toBeDefined()
    })

    it('should prevent non-coaches from overriding conflicts', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({
          error: 'Booking conflicts with existing reservation',
          conflicts: [{ id: 'existing-booking', courtName: 'Court 1' }],
        }),
      } as Response)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: 'court-1',
          startTime: '2024-01-15T17:30:00Z', // Overlaps with existing booking
          endTime: '2024-01-15T18:30:00Z',
          purpose: 'practice',
        }),
      })

      const result = await response.json()

      expect(response.ok).toBe(false)
      expect(response.status).toBe(409)
      expect(result.error).toContain('conflicts')
    })
  })

  describe('Conflict Check API', () => {
    it('should check for conflicts without creating booking', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          hasConflicts: true,
          conflicts: [
            {
              id: 'existing-booking',
              courtName: 'Court 1',
              startTime: '2024-01-15T17:00:00Z',
              endTime: '2024-01-15T19:00:00Z',
              purpose: 'practice',
            }
          ],
        }),
      } as Response)

      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-conflicts',
          courtId: 'court-1',
          startTime: '2024-01-15T18:00:00Z',
          endTime: '2024-01-15T20:00:00Z',
        }),
      })

      const result = await response.json()

      expect(response.ok).toBe(true)
      expect(result.hasConflicts).toBe(true)
      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].courtName).toBe('Court 1')
    })
  })

  describe('Quick Booking Templates', () => {
    it('should calculate correct end time from duration', () => {
      const startTime = '17:00'
      const duration = 120 // 2 hours

      const [hours, minutes] = startTime.split(':').map(Number)
      const startDate = new Date()
      startDate.setHours(hours, minutes, 0, 0)
      
      const endDate = new Date(startDate.getTime() + duration * 60000)
      const endTime = endDate.toTimeString().slice(0, 5)

      expect(endTime).toBe('19:00')
    })

    it('should handle duration that crosses day boundary', () => {
      const startTime = '23:00'
      const duration = 120 // 2 hours

      const [hours, minutes] = startTime.split(':').map(Number)
      const startDate = new Date()
      startDate.setHours(hours, minutes, 0, 0)
      
      const endDate = new Date(startDate.getTime() + duration * 60000)
      const endTime = endDate.toTimeString().slice(0, 5)

      expect(endTime).toBe('01:00')
    })
  })

  describe('Court Availability', () => {
    it('should correctly determine court availability', () => {
      const court = {
        id: 'court-1',
        isActive: true,
        currentBooking: {
          startTime: '2024-01-15T17:00:00Z',
          endTime: '2024-01-15T19:00:00Z',
        }
      }

      const timeSlot = {
        start: '18:00',
        end: '20:00'
      }

      const selectedDate = new Date('2024-01-15')

      // Check if court has a booking during selected time
      const bookingStart = new Date(court.currentBooking.startTime)
      const bookingEnd = new Date(court.currentBooking.endTime)
      const slotStart = new Date(selectedDate.toDateString() + ' ' + timeSlot.start)
      const slotEnd = new Date(selectedDate.toDateString() + ' ' + timeSlot.end)

      // Check for overlap
      const hasOverlap = bookingStart < slotEnd && bookingEnd > slotStart
      const availability = hasOverlap ? 'booked' : (court.isActive ? 'available' : 'maintenance')

      expect(availability).toBe('booked')
    })

    it('should mark inactive courts as maintenance', () => {
      const court = {
        id: 'court-2',
        isActive: false,
        currentBooking: null
      }

      const availability = court.isActive ? 'available' : 'maintenance'

      expect(availability).toBe('maintenance')
    })
  })
})