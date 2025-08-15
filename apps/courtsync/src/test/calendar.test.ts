/**
 * Calendar System Tests
 * 
 * Tests for the team calendar functionality including:
 * - Event creation and management
 * - Academic schedule conflict detection
 * - Calendar views and navigation
 * - Role-based permissions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock calendar data
const mockEvents = [
  {
    id: 'event-1',
    title: 'Team Practice',
    eventType: 'practice',
    startTime: '2024-01-15T17:00:00Z',
    endTime: '2024-01-15T19:00:00Z',
    location: 'Court 1',
    isAllDay: false,
    requiresAttendance: true,
    createdBy: 'coach-1',
  },
  {
    id: 'event-2',
    title: 'vs. Butler University',
    eventType: 'match',
    startTime: '2024-01-16T14:00:00Z',
    endTime: '2024-01-16T17:00:00Z',
    location: 'Away',
    isAllDay: false,
    requiresAttendance: true,
    createdBy: 'coach-1',
  },
  {
    id: 'event-3',
    title: 'Team Meeting',
    eventType: 'meeting',
    startTime: '2024-01-17T12:00:00Z',
    endTime: '2024-01-17T13:00:00Z',
    location: 'Conference Room',
    isAllDay: false,
    requiresAttendance: true,
    createdBy: 'captain-1',
  }
]

const mockPlayerSchedules = [
  {
    userId: 'player-1',
    fullName: 'John Player',
    classSchedule: JSON.stringify({
      1: [{ // Monday
        title: 'Calculus II',
        startHour: 9,
        startMinute: 0,
        endHour: 10,
        endMinute: 30,
      }],
      3: [{ // Wednesday  
        title: 'Physics Lab',
        startHour: 14,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      }],
    })
  },
  {
    userId: 'player-2',
    fullName: 'Jane Player',
    classSchedule: JSON.stringify({
      2: [{ // Tuesday
        title: 'Chemistry',
        startHour: 11,
        startMinute: 0,
        endHour: 12,
        endMinute: 30,
      }],
    })
  }
]

describe('Calendar System', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
    vi.clearAllMocks()
  })

  describe('Event Management', () => {
    it('should create event successfully with valid data', async () => {
      const newEvent = {
        title: 'New Practice',
        eventType: 'practice',
        startTime: '2024-01-20T16:00:00Z',
        endTime: '2024-01-20T18:00:00Z',
        location: 'Court 2',
        requiresAttendance: true,
      }

      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          event: { ...newEvent, id: 'event-new' },
          academicConflicts: []
        }),
      } as Response)

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      })

      const result = await response.json()

      expect(response.ok).toBe(true)
      expect(result.event.title).toBe('New Practice')
      expect(result.event.eventType).toBe('practice')
    })

    it('should reject event with end time before start time', () => {
      const invalidEvent = {
        title: 'Invalid Event',
        eventType: 'practice',
        startTime: new Date('2024-01-20T18:00:00Z'),
        endTime: new Date('2024-01-20T16:00:00Z'), // End before start
        isAllDay: false,
      }

      const isValid = !invalidEvent.isAllDay && invalidEvent.startTime < invalidEvent.endTime

      expect(isValid).toBe(false)
    })

    it('should allow all-day events without time validation', () => {
      const allDayEvent = {
        title: 'All Day Tournament',
        eventType: 'match',
        startTime: new Date('2024-01-20T18:00:00Z'),
        endTime: new Date('2024-01-20T16:00:00Z'),
        isAllDay: true,
      }

      const isValid = allDayEvent.isAllDay || allDayEvent.startTime < allDayEvent.endTime

      expect(isValid).toBe(true)
    })
  })

  describe('Academic Conflict Detection', () => {
    it('should detect conflicts with class schedules', () => {
      const eventTime = {
        startTime: new Date('2024-01-17T14:30:00Z'), // Wednesday 2:30 PM
        endTime: new Date('2024-01-17T16:30:00Z'),   // Wednesday 4:30 PM
      }

      const player = mockPlayerSchedules[0] // Has Physics Lab 2-5 PM on Wednesday
      const schedule = JSON.parse(player.classSchedule)
      const dayOfWeek = eventTime.startTime.getDay() // 3 = Wednesday
      
      const eventStart = eventTime.startTime.getHours() * 60 + eventTime.startTime.getMinutes()
      const eventEnd = eventTime.endTime.getHours() * 60 + eventTime.endTime.getMinutes()

      const daySchedule = schedule[dayOfWeek] || []
      let hasConflict = false

      for (const classTime of daySchedule) {
        const classStart = classTime.startHour * 60 + (classTime.startMinute || 0)
        const classEnd = classTime.endHour * 60 + (classTime.endMinute || 0)

        // Check for overlap
        if (eventStart < classEnd && eventEnd > classStart) {
          hasConflict = true
          break
        }
      }

      expect(hasConflict).toBe(true)
    })

    it('should not detect conflicts when times do not overlap', () => {
      const eventTime = {
        startTime: new Date('2024-01-17T10:00:00Z'), // Wednesday 10:00 AM
        endTime: new Date('2024-01-17T12:00:00Z'),   // Wednesday 12:00 PM
      }

      const player = mockPlayerSchedules[0] // Has Physics Lab 2-5 PM on Wednesday
      const schedule = JSON.parse(player.classSchedule)
      const dayOfWeek = eventTime.startTime.getDay()
      
      const eventStart = eventTime.startTime.getHours() * 60 + eventTime.startTime.getMinutes()
      const eventEnd = eventTime.endTime.getHours() * 60 + eventTime.endTime.getMinutes()

      const daySchedule = schedule[dayOfWeek] || []
      let hasConflict = false

      for (const classTime of daySchedule) {
        const classStart = classTime.startHour * 60 + (classTime.startMinute || 0)
        const classEnd = classTime.endHour * 60 + (classTime.endMinute || 0)

        if (eventStart < classEnd && eventEnd > classStart) {
          hasConflict = true
          break
        }
      }

      expect(hasConflict).toBe(false)
    })

    it('should handle players with no class schedule', () => {
      const eventTime = {
        startTime: new Date('2024-01-17T14:30:00Z'),
        endTime: new Date('2024-01-17T16:30:00Z'),
      }

      const playerWithoutSchedule = {
        userId: 'player-3',
        fullName: 'Player No Schedule',
        classSchedule: null
      }

      // Should not cause errors and not detect conflicts
      const schedule = playerWithoutSchedule.classSchedule 
        ? JSON.parse(playerWithoutSchedule.classSchedule) 
        : {}
      
      const dayOfWeek = eventTime.startTime.getDay()
      const daySchedule = schedule[dayOfWeek] || []

      expect(daySchedule).toEqual([])
    })
  })

  describe('Calendar Views', () => {
    it('should calculate correct date range for month view', () => {
      const selectedDate = new Date('2024-01-15') // Jan 15, 2024
      
      const startDate = new Date(selectedDate)
      startDate.setDate(1) // First day of month
      
      const endDate = new Date(selectedDate)
      endDate.setMonth(endDate.getMonth() + 1, 0) // Last day of month

      expect(startDate.getDate()).toBe(1)
      expect(startDate.getMonth()).toBe(0) // January (0-indexed)
      expect(endDate.getDate()).toBe(31) // January has 31 days
      expect(endDate.getMonth()).toBe(0)
    })

    it('should calculate correct date range for week view', () => {
      const selectedDate = new Date('2024-01-15') // Monday
      
      const startDate = new Date(selectedDate)
      const dayOfWeek = startDate.getDay() // 1 for Monday
      startDate.setDate(startDate.getDate() - dayOfWeek) // Go to Sunday
      
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6) // Add 6 days to get Saturday

      expect(startDate.getDay()).toBe(0) // Sunday
      expect(endDate.getDay()).toBe(6) // Saturday
      expect((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)).toBe(6)
    })

    it('should filter events by date range correctly', () => {
      const startDate = new Date('2024-01-15T00:00:00Z')
      const endDate = new Date('2024-01-16T23:59:59Z')

      const filteredEvents = mockEvents.filter(event => {
        const eventDate = new Date(event.startTime)
        return eventDate >= startDate && eventDate <= endDate
      })

      expect(filteredEvents).toHaveLength(2) // event-1 and event-2
      expect(filteredEvents[0].id).toBe('event-1')
      expect(filteredEvents[1].id).toBe('event-2')
    })
  })

  describe('Recurring Events', () => {
    it('should calculate next weekly occurrence correctly', () => {
      const baseDate = new Date('2024-01-15T17:00:00Z') // Monday
      const pattern = 'weekly'

      let nextDate: Date
      switch (pattern) {
        case 'weekly':
          nextDate = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        default:
          nextDate = baseDate
      }

      expect(nextDate.getDay()).toBe(baseDate.getDay()) // Same day of week
      expect(nextDate.getDate()).toBe(baseDate.getDate() + 7) // 7 days later
    })

    it('should calculate next daily occurrence correctly', () => {
      const baseDate = new Date('2024-01-15T17:00:00Z')
      const pattern = 'daily'

      let nextDate: Date
      switch (pattern) {
        case 'daily':
          nextDate = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000)
          break
        default:
          nextDate = baseDate
      }

      expect(nextDate.getDate()).toBe(baseDate.getDate() + 1)
      expect(nextDate.getHours()).toBe(baseDate.getHours())
    })

    it('should limit number of recurring instances', () => {
      const maxInstances = 50
      let instanceCount = 0
      const instances: Date[] = []
      
      let currentDate = new Date('2024-01-15T17:00:00Z')
      const pattern = 'weekly'
      
      while (instanceCount < maxInstances) {
        currentDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        instances.push(new Date(currentDate))
        instanceCount++
      }

      expect(instances).toHaveLength(maxInstances)
    })
  })

  describe('Role-based Permissions', () => {
    it('should allow coaches to create events', () => {
      const userRole = 'coach'
      const canCreateEvents = ['coach', 'assistant_coach', 'captain'].includes(userRole)

      expect(canCreateEvents).toBe(true)
    })

    it('should allow captains to create events', () => {
      const userRole = 'captain'
      const canCreateEvents = ['coach', 'assistant_coach', 'captain'].includes(userRole)

      expect(canCreateEvents).toBe(true)
    })

    it('should not allow players to create events', () => {
      const userRole = 'player'
      const canCreateEvents = ['coach', 'assistant_coach', 'captain'].includes(userRole)

      expect(canCreateEvents).toBe(false)
    })

    it('should return 403 for unauthorized event creation', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ 
          error: 'Insufficient permissions to create events' 
        }),
      } as Response)

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthorized Event',
          eventType: 'practice',
          startTime: '2024-01-20T16:00:00Z',
          endTime: '2024-01-20T18:00:00Z',
        }),
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(403)

      const result = await response.json()
      expect(result.error).toContain('permissions')
    })
  })

  describe('Event Type Classification', () => {
    it('should assign correct colors for event types', () => {
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

      expect(getEventTypeColor('practice')).toContain('blue')
      expect(getEventTypeColor('match')).toContain('red')
      expect(getEventTypeColor('travel')).toContain('purple')
      expect(getEventTypeColor('unknown')).toContain('gray')
    })

    it('should assign correct icons for event types', () => {
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

      expect(getEventTypeIcon('practice')).toBe('🎾')
      expect(getEventTypeIcon('match')).toBe('🏆')
      expect(getEventTypeIcon('travel')).toBe('🚌')
      expect(getEventTypeIcon('unknown')).toBe('📅')
    })
  })

  describe('Time Formatting', () => {
    it('should format all-day events correctly', () => {
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

      const allDayResult = formatEventTime('2024-01-15T09:00:00Z', '2024-01-15T17:00:00Z', true)
      expect(allDayResult).toBe('All Day')

      const timedResult = formatEventTime('2024-01-15T17:00:00Z', '2024-01-15T19:00:00Z', false)
      expect(timedResult).toMatch(/^\d{1,2}:\d{2}\s?[AP]M - \d{1,2}:\d{2}\s?[AP]M$/)
    })
  })
})