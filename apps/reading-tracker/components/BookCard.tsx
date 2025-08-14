'use client'

import { useState } from 'react'

interface Book {
  id: string
  title: string
  author?: string
  totalPages?: number
  currentPage: number
  status: string
  rating?: number
  notes?: string
  dateAdded: string
  dateStarted?: string
  dateFinished?: string
}

interface BookCardProps {
  book: Book
  onUpdate?: () => void
}

export function BookCard({ book, onUpdate }: BookCardProps) {
  const [showSessionForm, setShowSessionForm] = useState(false)
  const [sessionData, setSessionData] = useState({
    minutes: '',
    pages: '',
    notes: ''
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reading': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'wishlist': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getProgressPercentage = () => {
    if (!book.totalPages) return 0
    return Math.round((book.currentPage / book.totalPages) * 100)
  }

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          minutes: parseInt(sessionData.minutes),
          pagesRead: parseInt(sessionData.pages),
          notes: sessionData.notes || null
        })
      })

      if (response.ok) {
        setSessionData({ minutes: '', pages: '', notes: '' })
        setShowSessionForm(false)
        onUpdate?.()
      }
    } catch (error) {
      console.error('Failed to log session:', error)
    }
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {book.title}
          </h3>
          {book.author && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              by {book.author}
            </p>
          )}
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(book.status)}`}>
          {book.status}
        </span>
      </div>

      {book.totalPages && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{book.currentPage} / {book.totalPages} pages ({getProgressPercentage()}%)</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      )}

      {book.rating && (
        <div className="mb-3">
          {renderStars(book.rating)}
        </div>
      )}

      {book.notes && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
          &quot;{book.notes}&quot;
        </p>
      )}

      <div className="flex gap-2">
        {book.status === 'reading' && (
          <button
            onClick={() => setShowSessionForm(true)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Log Session
          </button>
        )}
        <button
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
        >
          Edit
        </button>
      </div>

      {showSessionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Log Reading Session
            </h3>
            <form onSubmit={handleLogSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minutes Read
                </label>
                <input
                  type="number"
                  required
                  value={sessionData.minutes}
                  onChange={(e) => setSessionData(prev => ({ ...prev, minutes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pages Read
                </label>
                <input
                  type="number"
                  required
                  value={sessionData.pages}
                  onChange={(e) => setSessionData(prev => ({ ...prev, pages: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={sessionData.notes}
                  onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Great chapter about..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSessionForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Log Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}