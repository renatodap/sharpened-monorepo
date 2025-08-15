'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'

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
}

interface ItineraryItem {
  id: string
  sequenceOrder: number
  activityTime?: string
  activityType: string
  title: string
  description?: string
  location?: string
  durationMinutes?: number
  responsiblePerson?: string
  notes?: string
}

interface Participant {
  id: string
  userId: string
  userName: string
  participationStatus: string
  roomAssignment?: string
  dietaryRestrictions?: string
  emergencyContact?: Record<string, any>
  travelDocumentsSubmitted: boolean
  notes?: string
}

interface TravelPlanProps {
  travelEvent: TravelEvent
  onUpdate?: () => void
  userRole: string
  currentUserId: string
}

export function TravelPlan({ travelEvent, onUpdate, userRole, currentUserId }: TravelPlanProps) {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'participants'>('overview')
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    activityType: 'activity',
    activityTime: '',
    location: '',
    description: '',
    durationMinutes: 60,
    responsiblePerson: '',
  })

  const canEdit = ['coach', 'assistant_coach', 'captain'].includes(userRole)
  const currentParticipant = participants.find(p => p.userId === currentUserId)

  useEffect(() => {
    fetchTravelData()
  }, [travelEvent.id])

  const fetchTravelData = async () => {
    try {
      setLoading(true)
      
      const [itineraryResponse, participantsResponse] = await Promise.all([
        fetch(`/api/travel?action=itinerary&travelEventId=${travelEvent.id}`),
        fetch(`/api/travel?action=participants&travelEventId=${travelEvent.id}`)
      ])

      if (itineraryResponse.ok) {
        const itineraryData = await itineraryResponse.json()
        setItinerary(itineraryData.itinerary || [])
      }

      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json()
        setParticipants(participantsData.participants || [])
      }
    } catch (error) {
      console.error('Failed to fetch travel data:', error)
      setError('Failed to load travel details')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItineraryItem = async () => {
    try {
      const response = await fetch('/api/travel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add-itinerary-item',
          travelEventId: travelEvent.id,
          sequenceOrder: itinerary.length,
          ...newItem,
          activityTime: newItem.activityTime || undefined,
          durationMinutes: newItem.durationMinutes || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add itinerary item')
      }

      await fetchTravelData()
      setShowAddItem(false)
      setNewItem({
        title: '',
        activityType: 'activity',
        activityTime: '',
        location: '',
        description: '',
        durationMinutes: 60,
        responsiblePerson: '',
      })
    } catch (error) {
      setError('Failed to add itinerary item')
    }
  }

  const handleUpdateParticipantStatus = async (status: string) => {
    try {
      const response = await fetch('/api/travel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-participant',
          travelEventId: travelEvent.id,
          userId: currentUserId,
          participationStatus: status,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update participation status')
      }

      await fetchTravelData()
      onUpdate?.()
    } catch (error) {
      setError('Failed to update participation status')
    }
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getActivityIcon = (type: string) => {
    const icons = {
      departure: '🚌',
      arrival: '📍',
      meal: '🍽️',
      practice: '🎾',
      match: '🏆',
      meeting: '💼',
      free_time: '🕐',
      return: '🏠',
    }
    return icons[type as keyof typeof icons] || '📅'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      invited: 'text-yellow-400',
      confirmed: 'text-green-400',
      declined: 'text-red-400',
      attended: 'text-blue-400',
    }
    return colors[status as keyof typeof colors] || 'text-gray-400'
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-surface-elevated rounded w-1/3"></div>
          <div className="h-4 bg-surface-elevated rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-surface-elevated rounded"></div>
            <div className="h-4 bg-surface-elevated rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      )}

      {/* Header */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {travelEvent.eventTitle || 'Travel Event'}
            </h2>
            <div className="space-y-1 text-sm text-text-secondary">
              {travelEvent.departureTime && (
                <div>Departure: {formatDateTime(travelEvent.departureTime)}</div>
              )}
              {travelEvent.returnTime && (
                <div>Return: {formatDateTime(travelEvent.returnTime)}</div>
              )}
              {travelEvent.destinationLocation && (
                <div>Destination: {travelEvent.destinationLocation}</div>
              )}
            </div>
          </div>

          {currentParticipant && (
            <div className="flex flex-col sm:flex-row gap-2">
              <span className={`text-sm font-medium ${getStatusColor(currentParticipant.participationStatus)}`}>
                Status: {currentParticipant.participationStatus.charAt(0).toUpperCase() + currentParticipant.participationStatus.slice(1)}
              </span>
              {currentParticipant.participationStatus === 'invited' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleUpdateParticipantStatus('confirmed')}>
                    Accept
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleUpdateParticipantStatus('declined')}>
                    Decline
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-gray-600">
        {['overview', 'itinerary', 'participants'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 font-medium capitalize ${
              activeTab === tab
                ? 'text-white border-b-2 border-navy'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transportation */}
          <Card className="p-6">
            <h3 className="font-semibold text-white mb-4">Transportation</h3>
            <div className="space-y-2 text-sm">
              {travelEvent.transportationType && (
                <div>
                  <span className="text-text-secondary">Type: </span>
                  <span className="text-white capitalize">{travelEvent.transportationType}</span>
                </div>
              )}
              {travelEvent.departureLocation && (
                <div>
                  <span className="text-text-secondary">From: </span>
                  <span className="text-white">{travelEvent.departureLocation}</span>
                </div>
              )}
              {travelEvent.destinationLocation && (
                <div>
                  <span className="text-text-secondary">To: </span>
                  <span className="text-white">{travelEvent.destinationLocation}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Accommodation */}
          {Object.keys(travelEvent.accommodation).length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-white mb-4">Accommodation</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                {Object.entries(travelEvent.accommodation).map(([key, value]) => (
                  <div key={key}>
                    <span className="capitalize">{key.replace('_', ' ')}: </span>
                    <span className="text-white">{String(value)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Required Documents */}
          {travelEvent.requiredDocuments.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-white mb-4">Required Documents</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                {travelEvent.requiredDocuments.map((doc, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span>•</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Packing List */}
          {travelEvent.packingList.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold text-white mb-4">Packing List</h3>
              <ul className="space-y-1 text-sm text-text-secondary">
                {travelEvent.packingList.map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'itinerary' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white">Itinerary</h3>
            {canEdit && (
              <Button size="sm" onClick={() => setShowAddItem(true)}>
                Add Item
              </Button>
            )}
          </div>

          {showAddItem && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  placeholder="Activity title"
                  value={newItem.title}
                  onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                />
                <Select
                  value={newItem.activityType}
                  onChange={(value) => setNewItem(prev => ({ ...prev, activityType: value }))}
                  options={[
                    { value: 'departure', label: 'Departure' },
                    { value: 'arrival', label: 'Arrival' },
                    { value: 'meal', label: 'Meal' },
                    { value: 'practice', label: 'Practice' },
                    { value: 'match', label: 'Match' },
                    { value: 'meeting', label: 'Meeting' },
                    { value: 'free_time', label: 'Free Time' },
                    { value: 'return', label: 'Return' },
                  ]}
                />
                <Input
                  type="datetime-local"
                  value={newItem.activityTime}
                  onChange={(e) => setNewItem(prev => ({ ...prev, activityTime: e.target.value }))}
                />
                <Input
                  placeholder="Location"
                  value={newItem.location}
                  onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <textarea
                className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-white mb-4"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddItineraryItem}>
                  Add Item
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAddItem(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          <div className="space-y-3">
            {itinerary.length === 0 ? (
              <Card className="p-6 text-center text-text-secondary">
                No itinerary items yet
              </Card>
            ) : (
              itinerary.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getActivityIcon(item.activityType)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white">{item.title}</h4>
                        {item.activityTime && (
                          <span className="text-sm text-text-secondary">
                            {formatDateTime(item.activityTime)}
                          </span>
                        )}
                      </div>
                      {item.location && (
                        <div className="text-sm text-text-secondary mb-1">📍 {item.location}</div>
                      )}
                      {item.description && (
                        <p className="text-sm text-text-secondary">{item.description}</p>
                      )}
                      {item.responsiblePerson && (
                        <div className="text-xs text-text-secondary mt-2">
                          Responsible: {item.responsiblePerson}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-white">Participants</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {participants.map((participant) => (
              <Card key={participant.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{participant.userName}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(participant.participationStatus)}`}>
                    {participant.participationStatus}
                  </span>
                </div>
                
                {participant.roomAssignment && (
                  <div className="text-sm text-text-secondary mb-1">
                    Room: {participant.roomAssignment}
                  </div>
                )}
                
                {participant.dietaryRestrictions && (
                  <div className="text-sm text-text-secondary mb-1">
                    Dietary: {participant.dietaryRestrictions}
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-xs">
                  <span className={participant.travelDocumentsSubmitted ? 'text-green-400' : 'text-yellow-400'}>
                    {participant.travelDocumentsSubmitted ? '✓' : '⏳'} Documents
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}