'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, TrendingUp, Medal, Crown, Award } from 'lucide-react';

interface LeagueUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  focusMinutes: number;
  streak: number;
  rank?: number;
}

interface League {
  id: string;
  name: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  users: LeagueUser[];
  maxSize: number;
}

export function MicroLeagueSystem() {
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [userRank, setUserRank] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [featureEnabled, setFeatureEnabled] = useState(false);

  useEffect(() => {
    // Check feature flag
    const enabled = localStorage.getItem('leagueSystemEnabled') === 'true';
    setFeatureEnabled(enabled);
    
    if (enabled) {
      loadLeagueData();
    } else {
      setLoading(false);
    }
  }, []);

  const loadLeagueData = async () => {
    try {
      const response = await fetch('/api/leagues/current');
      if (response.ok) {
        const data = await response.json();
        setCurrentLeague(data.league);
        setUserRank(data.userRank);
      }
    } catch (error) {
      console.error('Failed to load league data:', error);
      // Use mock data for demo
      setCurrentLeague(getMockLeague());
      setUserRank(3);
    } finally {
      setLoading(false);
    }
  };

  const getMockLeague = (): League => {
    const weekNumber = Math.floor((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    return {
      id: 'league-' + weekNumber,
      name: 'Study Squad',
      weekNumber,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      maxSize: 8,
      users: [
        { id: '1', name: 'Alex Chen', points: 2850, focusMinutes: 480, streak: 7, rank: 1 },
        { id: '2', name: 'Sarah Kim', points: 2640, focusMinutes: 420, streak: 5, rank: 2 },
        { id: '3', name: 'You', points: 2420, focusMinutes: 380, streak: 4, rank: 3 },
        { id: '4', name: 'Mike Johnson', points: 2100, focusMinutes: 340, streak: 3, rank: 4 },
        { id: '5', name: 'Emma Davis', points: 1890, focusMinutes: 300, streak: 2, rank: 5 },
        { id: '6', name: 'Chris Lee', points: 1650, focusMinutes: 260, streak: 1, rank: 6 },
        { id: '7', name: 'Lisa Park', points: 1200, focusMinutes: 180, streak: 1, rank: 7 },
        { id: '8', name: 'Tom Wilson', points: 950, focusMinutes: 140, streak: 0, rank: 8 },
      ]
    };
  };

  const calculateDaysRemaining = () => {
    if (!currentLeague) return 0;
    const end = new Date(currentLeague.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, diff);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2: return <Medal className="h-4 w-4 text-gray-400" />;
      case 3: return <Award className="h-4 w-4 text-orange-600" />;
      default: return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-orange-600';
      default: return 'text-muted-foreground';
    }
  };

  const enableFeature = () => {
    localStorage.setItem('leagueSystemEnabled', 'true');
    setFeatureEnabled(true);
    loadLeagueData();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (!featureEnabled) {
    return (
      <Card className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">Join Weekly Leagues</h3>
          <p className="text-sm text-muted-foreground">
            Compete with small groups of students each week
          </p>
          <Button onClick={enableFeature} className="mt-4">
            <Users className="h-4 w-4 mr-2" />
            Join League
          </Button>
        </div>
      </Card>
    );
  }

  if (!currentLeague) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No league data available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{currentLeague.name}</h3>
          <Badge variant="secondary">Week {currentLeague.weekNumber}</Badge>
        </div>
        
        <Badge variant="outline">
          {calculateDaysRemaining()} days left
        </Badge>
      </div>

      <div className="space-y-3">
        {currentLeague.users.map((user, index) => {
          const isCurrentUser = user.name === 'You';
          
          return (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                isCurrentUser 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index < 3 ? 'bg-background' : ''
                }`}>
                  {getRankIcon(index + 1) || (
                    <span className={`text-sm font-bold ${getRankColor(index + 1)}`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                      {user.name}
                    </p>
                    {user.streak > 0 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0">
                        🔥 {user.streak}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(user.focusMinutes / 60)}h {user.focusMinutes % 60}m this week
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-bold">{user.points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Your position</span>
          <div className="flex items-center gap-2">
            {userRank <= 3 ? (
              <Badge variant="default">
                <TrendingUp className="h-3 w-3 mr-1" />
                Top 3
              </Badge>
            ) : (
              <Badge variant="secondary">
                Rank #{userRank}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}