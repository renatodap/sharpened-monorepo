'use client'

import { useEffect, useState } from 'react'

interface LeaderboardEntry {
  id: string
  userId: string
  userName: string
  totalMinutes: number
  totalSessions: number
  streakDays: number
  points: number
  rank: number
}

interface WeeklyLeaderboardProps {
  groupId?: string
  userId: string
}

export function WeeklyLeaderboard({ groupId, userId }: WeeklyLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState<number | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [groupId])

  const fetchLeaderboard = async () => {
    try {
      const params = new URLSearchParams()
      if (groupId) params.append('groupId', groupId)

      const response = await fetch(`/api/focus/leaderboard?${params}`)
      const data = await response.json()

      setEntries(data.entries)
      const userEntry = data.entries.find((e: LeaderboardEntry) => e.userId === userId)
      setUserRank(userEntry?.rank || null)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return ''
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 2: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 3: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Weekly Leaderboard
          </h2>
          {userRank && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Your Rank: #{userRank}
            </div>
          )}
        </div>

        <div className="space-y-2">
          {entries.map((entry) => {
            const isCurrentUser = entry.userId === userId
            return (
              <div
                key={entry.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg transition-all
                  ${getRankColor(entry.rank)}
                  ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}
                  ${!getRankColor(entry.rank) && (
                    isCurrentUser 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankEmoji(entry.rank) || (
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        #{entry.rank}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {entry.userName}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {entry.totalSessions} sessions • {entry.streakDays} day streak
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    {entry.points}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTime(entry.totalMinutes)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No activity this week yet. Start a focus session to join the leaderboard!
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Points Calculation:</span>
            </div>
            <div className="space-y-1">
              <div>• 1 point per minute focused</div>
              <div>• 50 bonus points per day streak</div>
              <div>• 10 bonus points per session completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}