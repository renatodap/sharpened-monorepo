'use client'

import { useState, useEffect } from 'react'
import { PassiveFocusTracker } from '@/components/focus/PassiveFocusTracker'
import { WeeklyLeaderboard } from '@/components/leaderboard/WeeklyLeaderboard'

export default function StudySharper() {
  const [userId] = useState('alex@example.com') // Demo user
  const [focusEnabled, setFocusEnabled] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  useEffect(() => {
    // Check if focus tracking feature flag is enabled
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_FOCUS_TRACKING === 'true'
    if (!isEnabled) {
      setFocusEnabled(false)
    }
  }, [])

  const handleToggleFocus = () => {
    if (!focusEnabled) {
      setShowPrivacyModal(true)
    } else {
      setFocusEnabled(false)
    }
  }

  const handleAcceptPrivacy = () => {
    setFocusEnabled(true)
    setShowPrivacyModal(false)
  }

  const handleExportData = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const response = await fetch(`/api/focus/export?userId=${userId}&format=${format}&weeks=4`)
      
      if (format === 'json') {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `focus-data-${userId}-4weeks.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `focus-data-${userId}-4weeks.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Study Sharper
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your focus. Compete with friends. Stay sharp.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={focusEnabled}
                  onChange={handleToggleFocus}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Focus Tracking
                </span>
              </label>
              
              <button
                onClick={() => handleExportData('csv')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">47 min</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Streak</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">3 days</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rank</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">#2</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🚀 Beta Feature
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Auto Focus Tracking</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  focusEnabled 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {focusEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Leaderboard</span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  LIVE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Data Export</span>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  CSV/JSON
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mt-8">
          <WeeklyLeaderboard userId={userId} />
        </div>

        {/* Demo Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📚 Demo Mode
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-3">
            You&apos;re viewing Study Sharper with sample data. Enable focus tracking to start competing!
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Toggle &quot;Focus Tracking&quot; to start monitoring your study sessions</li>
            <li>• Your activity will be automatically tracked when this tab is active</li>
            <li>• Join weekly competitions with friends using group codes</li>
            <li>• Export your data anytime in CSV or JSON format</li>
          </ul>
        </div>
      </main>

      {/* Focus Tracker Component */}
      <PassiveFocusTracker 
        userId={userId} 
        enabled={focusEnabled}
        onSessionUpdate={(data) => {
          console.log('Session updated:', data)
        }}
      />

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Enable Focus Tracking?
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <p>Focus tracking monitors when this browser tab is active and detects idle periods to help you understand your study patterns.</p>
              <p><strong>What we track:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Tab visibility (active/inactive)</li>
                <li>Idle detection (no mouse/keyboard activity)</li>
                <li>Session duration and timing</li>
              </ul>
              <p><strong>Privacy:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Data stored locally (SQLite database)</li>
                <li>No screen content or keystroke logging</li>
                <li>You can export or delete your data anytime</li>
                <li>Data retention: 30 days (configurable)</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptPrivacy}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Accept & Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
