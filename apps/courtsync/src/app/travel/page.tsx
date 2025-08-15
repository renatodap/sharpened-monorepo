'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'
import { TravelPlan } from '@/components/travel/TravelPlan'

interface TravelEvent {
  id: string
  eventId: string
  eventTitle?: string
  departureTime?: string
  returnTime?: string
  departureLocation?: string
  destinationLocation?: string
  transportationType?: string
  transportationDetails: Record<string, any>
  accommodation: Record<string, any>
  mealArrangements: Record<string, any>
  requiredDocuments: string[]
  packingList: string[]
  emergencyContacts: Array<Record<string, any>>
  budgetInfo: Record<string, any>
  createdAt: string
}

interface Event {
  id: string
  title: string
  date: string
  location?: string
  type: string
}

export default function TravelPage() {
  const [travelEvents, setTravelEvents] = useState<TravelEvent[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTravel, setSelectedTravel] = useState<TravelEvent | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [userRole, setUserRole] = useState('player') // This would come from auth context
  const [currentUserId, setCurrentUserId] = useState('') // This would come from auth context
  const [submitLoading, setSubmitLoading] = useState(false)

  const [newTravelEvent, setNewTravelEvent] = useState({
    eventId: '',
    departureTime: '',
    returnTime: '',
    departureLocation: '',
    destinationLocation: '',
    transportationType: 'bus',
    requiredDocuments: [] as string[],
    packingList: [] as string[],
    accommodation: {},
    mealArrangements: {},
    budgetInfo: {},
  })

  const [documentInput, setDocumentInput] = useState('')
  const [packingInput, setPackingInput] = useState('')

  const canCreateTravel = ['coach', 'assistant_coach', 'captain'].includes(userRole)

  useEffect(() => {
    fetchData()
    // In a real app, you'd get user info from auth context
    setUserRole('coach') // Mock for demo
    setCurrentUserId('user-123') // Mock for demo
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [travelResponse, eventsResponse] = await Promise.all([
        fetch('/api/travel'),
        fetch('/api/events') // Assuming this exists
      ])

      if (travelResponse.ok) {
        const travelData = await travelResponse.json()
        setTravelEvents(travelData.travelEvents || [])
      }

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setEvents(eventsData.events || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError('Failed to load travel events')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTravelEvent = async () => {
    try {
      setSubmitLoading(true)
      
      const response = await fetch('/api/travel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-event',
          ...newTravelEvent,
          departureTime: newTravelEvent.departureTime || undefined,
          returnTime: newTravelEvent.returnTime || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create travel event')
      }

      await fetchData()
      setShowCreateForm(false)
      setNewTravelEvent({
        eventId: '',
        departureTime: '',
        returnTime: '',
        departureLocation: '',
        destinationLocation: '',
        transportationType: 'bus',
        requiredDocuments: [],
        packingList: [],
        accommodation: {},
        mealArrangements: {},
        budgetInfo: {},
      })
      setError(null)
    } catch (error) {
      console.error('Failed to create travel event:', error)
      setError('Failed to create travel event')
    } finally {
      setSubmitLoading(false)
    }
  }

  const addDocument = () => {
    if (documentInput.trim() && !newTravelEvent.requiredDocuments.includes(documentInput.trim())) {
      setNewTravelEvent(prev => ({
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, documentInput.trim()]
      }))
      setDocumentInput('')
    }
  }

  const removeDocument = (index: number) => {
    setNewTravelEvent(prev => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== index)
    }))
  }

  const addPackingItem = () => {
    if (packingInput.trim() && !newTravelEvent.packingList.includes(packingInput.trim())) {
      setNewTravelEvent(prev => ({
        ...prev,
        packingList: [...prev.packingList, packingInput.trim()]
      }))
      setPackingInput('')
    }
  }

  const removePackingItem = (index: number) => {
    setNewTravelEvent(prev => ({
      ...prev,
      packingList: prev.packingList.filter((_, i) => i !== index)
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (selectedTravel) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedTravel(null)}
            className="mb-4"
          >
            ← Back to Travel Events
          </Button>
        </div>
        
        <TravelPlan
          travelEvent={selectedTravel}
          onUpdate={fetchData}
          userRole={userRole}
          currentUserId={currentUserId}
        />
      </div>
    )
  }

  if (showCreateForm) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Create Travel Event</h2>
            <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>

          {error && (
            <Alert variant="error" title="Error" className="mb-6">
              {error}
            </Alert>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Event *
                </label>
                <Select
                  value={newTravelEvent.eventId}
                  onChange={(value) => setNewTravelEvent(prev => ({ ...prev, eventId: value }))}
                  options={[
                    { value: '', label: 'Select an event' },
                    ...events.map(event => ({
                      value: event.id,
                      label: `${event.title} - ${formatDate(event.date)}`
                    }))
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Transportation Type
                </label>
                <Select
                  value={newTravelEvent.transportationType}
                  onChange={(value) => setNewTravelEvent(prev => ({ ...prev, transportationType: value }))}
                  options={[
                    { value: 'bus', label: 'Bus' },
                    { value: 'van', label: 'Van' },
                    { value: 'car', label: 'Car' },
                    { value: 'flight', label: 'Flight' },
                    { value: 'train', label: 'Train' },
                  ]}
                />
              </div>
            </div>

            {/* Times and Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Departure Time
                </label>
                <Input
                  type="datetime-local"
                  value={newTravelEvent.departureTime}
                  onChange={(e) => setNewTravelEvent(prev => ({ ...prev, departureTime: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Return Time
                </label>
                <Input
                  type="datetime-local"
                  value={newTravelEvent.returnTime}
                  onChange={(e) => setNewTravelEvent(prev => ({ ...prev, returnTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Departure Location
                </label>
                <Input
                  value={newTravelEvent.departureLocation}
                  onChange={(e) => setNewTravelEvent(prev => ({ ...prev, departureLocation: e.target.value }))}
                  placeholder="Where are we leaving from?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Destination
                </label>
                <Input
                  value={newTravelEvent.destinationLocation}
                  onChange={(e) => setNewTravelEvent(prev => ({ ...prev, destinationLocation: e.target.value }))}
                  placeholder="Where are we going?"
                />
              </div>
            </div>

            {/* Required Documents */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Required Documents
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={documentInput}
                  onChange={(e) => setDocumentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
                  placeholder="Add required document..."
                  className="flex-1"
                />
                <Button type="button" onClick={addDocument} variant="secondary" size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newTravelEvent.requiredDocuments.map((doc, index) => (
                  <div key={index} className="bg-navy/20 border border-navy rounded-lg px-3 py-1 text-sm flex items-center gap-2">
                    <span>{doc}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Packing List */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Packing List
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={packingInput}
                  onChange={(e) => setPackingInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPackingItem())}
                  placeholder="Add packing item..."
                  className="flex-1"
                />
                <Button type="button" onClick={addPackingItem} variant="secondary" size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newTravelEvent.packingList.map((item, index) => (
                  <div key={index} className="bg-surface-elevated border border-gray-600 rounded-lg px-3 py-1 text-sm flex items-center gap-2">
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removePackingItem(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTravelEvent} 
                loading={submitLoading}
                disabled={!newTravelEvent.eventId}
              >
                Create Travel Event
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Travel Planning</h1>
          <p className="text-text-secondary">Manage team travel and logistics</p>
        </div>
        {canCreateTravel && (
          <Button onClick={() => setShowCreateForm(true)}>
            Create Travel Event
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error" title="Error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Travel Events List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-surface-elevated rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-surface-elevated rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-surface-elevated rounded"></div>
                <div className="h-3 bg-surface-elevated rounded w-5/6"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : travelEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-text-secondary mb-4">No travel events scheduled</div>
          {canCreateTravel && (
            <Button onClick={() => setShowCreateForm(true)}>
              Create Your First Travel Event
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {travelEvents.map((travelEvent) => (
            <Card 
              key={travelEvent.id} 
              className="p-6 hover:bg-surface-elevated transition-colors cursor-pointer"
              onClick={() => setSelectedTravel(travelEvent)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {travelEvent.eventTitle || 'Travel Event'}
                  </h3>
                  <div className="text-sm text-text-secondary">
                    {travelEvent.destinationLocation && (
                      <div>📍 {travelEvent.destinationLocation}</div>
                    )}
                    {travelEvent.transportationType && (
                      <div className="mt-1 capitalize">
                        🚌 {travelEvent.transportationType}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {travelEvent.departureTime && (
                <div className="text-sm text-text-secondary mb-4">
                  <div>Departure: {formatDate(travelEvent.departureTime)}</div>
                  {travelEvent.returnTime && (
                    <div>Return: {formatDate(travelEvent.returnTime)}</div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Created {formatDate(travelEvent.createdAt)}</span>
                <span className="text-navy hover:underline">View Details →</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}