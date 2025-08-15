'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Alert } from '@/components/ui/Alert'

interface ScoutingFormData {
  opponentName: string
  matchDate: string
  venue: string
  reportType: 'general' | 'pre_match' | 'post_match' | 'player_specific'
  overallAssessment: string
  teamStrengths: string[]
  teamWeaknesses: string[]
  recommendedStrategy: string
  weatherConditions: string
  courtConditions: string
  confidenceLevel: number
  isConfidential: boolean
}

interface ScoutingFormProps {
  onSubmit: (data: ScoutingFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<ScoutingFormData>
  isLoading?: boolean
  mode?: 'create' | 'edit'
}

export function ScoutingForm({ 
  onSubmit, 
  onCancel, 
  initialData = {}, 
  isLoading = false,
  mode = 'create'
}: ScoutingFormProps) {
  const [formData, setFormData] = useState<ScoutingFormData>({
    opponentName: initialData.opponentName || '',
    matchDate: initialData.matchDate || '',
    venue: initialData.venue || '',
    reportType: initialData.reportType || 'general',
    overallAssessment: initialData.overallAssessment || '',
    teamStrengths: initialData.teamStrengths || [],
    teamWeaknesses: initialData.teamWeaknesses || [],
    recommendedStrategy: initialData.recommendedStrategy || '',
    weatherConditions: initialData.weatherConditions || '',
    courtConditions: initialData.courtConditions || '',
    confidenceLevel: initialData.confidenceLevel || 3,
    isConfidential: initialData.isConfidential || false,
  })

  const [strengthInput, setStrengthInput] = useState('')
  const [weaknessInput, setWeaknessInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const newErrors: Record<string, string> = {}
    if (!formData.opponentName.trim()) {
      newErrors.opponentName = 'Opponent name is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onSubmit(formData)
      setErrors({})
    } catch (error) {
      console.error('Form submission error:', error)
      setErrors({ submit: 'Failed to save scouting report. Please try again.' })
    }
  }

  const addStrength = () => {
    if (strengthInput.trim() && !formData.teamStrengths.includes(strengthInput.trim())) {
      setFormData(prev => ({
        ...prev,
        teamStrengths: [...prev.teamStrengths, strengthInput.trim()]
      }))
      setStrengthInput('')
    }
  }

  const removeStrength = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamStrengths: prev.teamStrengths.filter((_, i) => i !== index)
    }))
  }

  const addWeakness = () => {
    if (weaknessInput.trim() && !formData.teamWeaknesses.includes(weaknessInput.trim())) {
      setFormData(prev => ({
        ...prev,
        teamWeaknesses: [...prev.teamWeaknesses, weaknessInput.trim()]
      }))
      setWeaknessInput('')
    }
  }

  const removeWeakness = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamWeaknesses: prev.teamWeaknesses.filter((_, i) => i !== index)
    }))
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {mode === 'create' ? 'Create Scouting Report' : 'Edit Scouting Report'}
          </h2>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="confidential"
              checked={formData.isConfidential}
              onChange={(e) => setFormData(prev => ({ ...prev, isConfidential: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="confidential" className="text-sm text-text-secondary">
              Confidential Report
            </label>
          </div>
        </div>

        {errors.submit && (
          <Alert variant="error" title="Error">
            {errors.submit}
          </Alert>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Opponent Name *
            </label>
            <Input
              value={formData.opponentName}
              onChange={(e) => setFormData(prev => ({ ...prev, opponentName: e.target.value }))}
              error={errors.opponentName}
              placeholder="Enter opponent team name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Report Type
            </label>
            <Select
              value={formData.reportType}
              onChange={(value) => setFormData(prev => ({ ...prev, reportType: value as any }))}
              options={[
                { value: 'general', label: 'General Report' },
                { value: 'pre_match', label: 'Pre-Match Analysis' },
                { value: 'post_match', label: 'Post-Match Review' },
                { value: 'player_specific', label: 'Player-Specific' },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Match Date
            </label>
            <Input
              type="date"
              value={formData.matchDate}
              onChange={(e) => setFormData(prev => ({ ...prev, matchDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Venue
            </label>
            <Input
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
              placeholder="Match venue location"
            />
          </div>
        </div>

        {/* Assessment */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Overall Assessment
          </label>
          <textarea
            className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-white resize-y min-h-[100px]"
            value={formData.overallAssessment}
            onChange={(e) => setFormData(prev => ({ ...prev, overallAssessment: e.target.value }))}
            placeholder="Overall team assessment and key observations..."
          />
        </div>

        {/* Team Strengths */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Team Strengths
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={strengthInput}
              onChange={(e) => setStrengthInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
              placeholder="Add a team strength..."
              className="flex-1"
            />
            <Button type="button" onClick={addStrength} variant="secondary" size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.teamStrengths.map((strength, index) => (
              <div key={index} className="bg-navy/20 border border-navy rounded-lg px-3 py-1 text-sm flex items-center gap-2">
                <span>{strength}</span>
                <button
                  type="button"
                  onClick={() => removeStrength(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Team Weaknesses */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Team Weaknesses
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={weaknessInput}
              onChange={(e) => setWeaknessInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWeakness())}
              placeholder="Add a team weakness..."
              className="flex-1"
            />
            <Button type="button" onClick={addWeakness} variant="secondary" size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.teamWeaknesses.map((weakness, index) => (
              <div key={index} className="bg-error/20 border border-error rounded-lg px-3 py-1 text-sm flex items-center gap-2">
                <span>{weakness}</span>
                <button
                  type="button"
                  onClick={() => removeWeakness(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Recommended Strategy
          </label>
          <textarea
            className="w-full p-3 bg-surface border border-gray-600 rounded-lg text-white resize-y min-h-[100px]"
            value={formData.recommendedStrategy}
            onChange={(e) => setFormData(prev => ({ ...prev, recommendedStrategy: e.target.value }))}
            placeholder="Recommended game plan and tactics..."
          />
        </div>

        {/* Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Weather Conditions
            </label>
            <Input
              value={formData.weatherConditions}
              onChange={(e) => setFormData(prev => ({ ...prev, weatherConditions: e.target.value }))}
              placeholder="Weather during match/observation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Court Conditions
            </label>
            <Input
              value={formData.courtConditions}
              onChange={(e) => setFormData(prev => ({ ...prev, courtConditions: e.target.value }))}
              placeholder="Court surface and conditions"
            />
          </div>
        </div>

        {/* Confidence Level */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Confidence Level: {formData.confidenceLevel}/5
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.confidenceLevel}
            onChange={(e) => setFormData(prev => ({ ...prev, confidenceLevel: parseInt(e.target.value) }))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={isLoading}>
            {mode === 'create' ? 'Create Report' : 'Update Report'}
          </Button>
        </div>
      </form>
    </Card>
  )
}