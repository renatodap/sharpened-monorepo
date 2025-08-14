'use client'

import { useState, useEffect } from 'react'
import { AddBookForm } from '@/components/AddBookForm'
import { BookCard } from '@/components/BookCard'

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

interface Stats {
  streak: { current: number; max: number }
  weekly: { minutes: number; pages: number; sessions: number }
  monthly: { minutes: number; pages: number; sessions: number }
  books: Record<string, number>
}

export default function ReadingTracker() {
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState('reading')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [booksRes, statsRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/stats')
      ])
      
      const booksData = await booksRes.json()
      const statsData = await statsRes.json()
      
      setBooks(booksData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/export')
      const data = await response.json()
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'reading-data.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const filteredBooks = books.filter(book => book.status === activeTab)

  const tabs = [
    { id: 'reading', label: 'Reading', count: stats?.books.reading || 0 },
    { id: 'completed', label: 'Completed', count: stats?.books.completed || 0 },
    { id: 'wishlist', label: 'Wishlist', count: stats?.books.wishlist || 0 },
    { id: 'paused', label: 'Paused', count: stats?.books.paused || 0 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📚 Reading Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your reading progress and build consistent habits
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <AddBookForm onSuccess={fetchData} />
              <button
                onClick={handleExportData}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats?.streak.current || 0} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Math.floor((stats?.weekly.minutes || 0) / 60)}h {(stats?.weekly.minutes || 0) % 60}m
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pages This Week</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats?.weekly.pages || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Books</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {Object.values(stats?.books || {}).reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-300 py-0.5 px-2.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} onUpdate={fetchData} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No books in {activeTab}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {activeTab === 'reading' ? 'Start by adding a book you\'re currently reading.' : 
                   activeTab === 'wishlist' ? 'Add books you want to read later.' :
                   activeTab === 'completed' ? 'Complete a book to see it here.' :
                   'Books you\'ve paused will appear here.'}
                </p>
                <AddBookForm onSuccess={fetchData} />
              </div>
            )}
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📖 Demo Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <h4 className="font-medium mb-2">✅ Implemented:</h4>
              <ul className="space-y-1">
                <li>• Quick book logging with title/author</li>
                <li>• Auto-fill from URL (demo simulation)</li>
                <li>• Reading session tracking</li>
                <li>• Progress tracking with page counts</li>
                <li>• Daily streak calculation</li>
                <li>• Multiple book statuses</li>
                <li>• Weekly/monthly statistics</li>
                <li>• JSON export functionality</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🚀 Try These:</h4>
              <ul className="space-y-1">
                <li>• Add a new book with &quot;Add Book&quot; button</li>
                <li>• Log a reading session on current books</li>
                <li>• Paste an Amazon URL for auto-fill demo</li>
                <li>• Export your data as JSON</li>
                <li>• Watch your streak grow with daily reading</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
