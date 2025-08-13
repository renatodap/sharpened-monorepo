// Micro-League System (5-12 people) - Based on Market Intelligence
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import {
  Users,
  Trophy,
  Target,
  Clock,
  Brain,
  TrendingUp,
  Award,
  UserPlus,
  Shield,
  Star,
  Zap,
  BookOpen,
  Timer,
  BarChart3,
  Medal
} from 'lucide-react';

interface LeagueMember {
  id: string;
  username: string;
  avatar: string;
  university?: string;
  major?: string;
  focusMinutes: number;
  noDistractionBlocks: number;
  recoveryStreaks: number;
  handicap: number; // For different schedules
  rank: number;
  change: number; // Rank change from last week
  todayMinutes: number;
  isOnline: boolean;
  currentActivity?: 'focusing' | 'break' | 'offline';
}

interface MicroLeague {
  id: string;
  name: string;
  captain: string;
  members: LeagueMember[];
  weekStartDate: Date;
  weekEndDate: Date;
  type: 'university' | 'friends' | 'random' | 'club';
  affiliation?: string; // e.g., "Stanford CS", "MIT Running Club"
  weekNumber: number;
  totalFocusMinutes: number;
  topPerformer?: string;
}

interface FocusSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  minutes: number;
  distractionFree: boolean;
  verified: boolean;
}

interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  metric: 'focus_minutes' | 'distraction_free' | 'consistency';
  target: number;
  reward: string;
  progress: Map<string, number>;
}

export function MicroLeagueSystem() {
  const [currentLeague, setCurrentLeague] = useState<MicroLeague>({
    id: 'league_stanford_cs_001',
    name: 'Stanford CS Warriors',
    captain: 'user_2',
    weekStartDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    weekEndDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    type: 'university',
    affiliation: 'Stanford CS Club',
    weekNumber: 4,
    totalFocusMinutes: 8420,
    topPerformer: 'user_2',
    members: [
      {
        id: 'current_user',
        username: 'You',
        avatar: '/avatar-you.jpg',
        university: 'Stanford',
        major: 'CS',
        focusMinutes: 1250,
        noDistractionBlocks: 18,
        recoveryStreaks: 3,
        handicap: 1.0,
        rank: 3,
        change: 1,
        todayMinutes: 145,
        isOnline: true,
        currentActivity: 'focusing',
      },
      {
        id: 'user_2',
        username: 'CodeRunner',
        avatar: '/avatar-2.jpg',
        university: 'Stanford',
        major: 'CS',
        focusMinutes: 1680,
        noDistractionBlocks: 24,
        recoveryStreaks: 5,
        handicap: 0.9, // Has more free time
        rank: 1,
        change: 0,
        todayMinutes: 210,
        isOnline: true,
        currentActivity: 'focusing',
      },
      {
        id: 'user_3',
        username: 'StudyAthlete',
        avatar: '/avatar-3.jpg',
        university: 'Stanford',
        major: 'CS',
        focusMinutes: 1420,
        noDistractionBlocks: 20,
        recoveryStreaks: 4,
        handicap: 1.1, // Busier schedule
        rank: 2,
        change: 2,
        todayMinutes: 165,
        isOnline: false,
      },
      {
        id: 'user_4',
        username: 'NightOwl',
        avatar: '/avatar-4.jpg',
        university: 'Stanford',
        major: 'EE',
        focusMinutes: 980,
        noDistractionBlocks: 14,
        recoveryStreaks: 2,
        handicap: 1.0,
        rank: 4,
        change: -2,
        todayMinutes: 85,
        isOnline: true,
        currentActivity: 'break',
      },
      {
        id: 'user_5',
        username: 'MorningGrind',
        avatar: '/avatar-5.jpg',
        university: 'Stanford',
        major: 'CS',
        focusMinutes: 890,
        noDistractionBlocks: 12,
        recoveryStreaks: 2,
        handicap: 1.2, // Heavy course load
        rank: 5,
        change: -1,
        todayMinutes: 120,
        isOnline: false,
      },
      {
        id: 'user_6',
        username: 'LibraryLion',
        avatar: '/avatar-6.jpg',
        university: 'Stanford',
        major: 'Math/CS',
        focusMinutes: 760,
        noDistractionBlocks: 10,
        recoveryStreaks: 1,
        handicap: 1.0,
        rank: 6,
        change: 0,
        todayMinutes: 95,
        isOnline: true,
        currentActivity: 'focusing',
      },
    ],
  });

  const [weeklyChallenge] = useState<WeeklyChallenge>({
    id: 'weekly_1',
    name: '50-Minute Power Sessions',
    description: 'Complete 15 distraction-free 50-minute blocks this week',
    metric: 'distraction_free',
    target: 15,
    reward: '500 XP + Focus Master Badge',
    progress: new Map([
      ['current_user', 8],
      ['user_2', 12],
      ['user_3', 10],
      ['user_4', 5],
      ['user_5', 4],
      ['user_6', 3],
    ]),
  });

  const [activeSessions, setActiveSessions] = useState<FocusSession[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'minutes' | 'blocks' | 'adjusted'>('minutes');

  // Calculate adjusted score with handicap
  const getAdjustedScore = (member: LeagueMember) => {
    return Math.round(member.focusMinutes * member.handicap);
  };

  // Sort members by selected metric
  const getSortedMembers = () => {
    return [...currentLeague.members].sort((a, b) => {
      switch (selectedMetric) {
        case 'blocks':
          return b.noDistractionBlocks - a.noDistractionBlocks;
        case 'adjusted':
          return getAdjustedScore(b) - getAdjustedScore(a);
        default:
          return b.focusMinutes - a.focusMinutes;
      }
    });
  };

  // Get member's percentile
  const getMemberPercentile = (memberId: string) => {
    const member = currentLeague.members.find(m => m.id === memberId);
    if (!member) return 0;
    
    const betterThan = currentLeague.members.filter(m => m.focusMinutes < member.focusMinutes).length;
    return Math.round((betterThan / (currentLeague.members.length - 1)) * 100);
  };

  // Calculate days remaining in week
  const getDaysRemaining = () => {
    const now = Date.now();
    const end = currentLeague.weekEndDate.getTime();
    return Math.ceil((end - now) / (24 * 60 * 60 * 1000));
  };

  const daysRemaining = getDaysRemaining();
  const currentUser = currentLeague.members.find(m => m.id === 'current_user')!;
  const sortedMembers = getSortedMembers();

  // Get activity color
  const getActivityColor = (activity?: string) => {
    switch (activity) {
      case 'focusing': return 'bg-green-500';
      case 'break': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  // Success metrics from MARKET_KNOWLEDGE.md
  const ENGAGEMENT_TARGET = 0.7; // 70% weekly league engagement
  const leagueEngagement = currentLeague.members.filter(m => m.focusMinutes > 500).length / currentLeague.members.length;

  return (
    <div className="space-y-4">
      {/* League Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5" />
                <h2 className="text-xl font-bold">{currentLeague.name}</h2>
                {currentLeague.affiliation && (
                  <Badge variant="secondary" className="bg-white/20">
                    {currentLeague.affiliation}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>Week {currentLeague.weekNumber}</span>
                <span>•</span>
                <span>{currentLeague.members.length} members</span>
                <span>•</span>
                <span>{daysRemaining} days left</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {(currentLeague.totalFocusMinutes / 60).toFixed(0)}h
              </div>
              <div className="text-sm opacity-90">Total Focus Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <img src={currentUser.avatar} alt="You" />
              </Avatar>
              <div>
                <div className="font-semibold">Your Performance</div>
                <div className="text-sm text-muted-foreground">
                  Rank #{currentUser.rank} • Top {100 - getMemberPercentile('current_user')}%
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Timer className="h-4 w-4 mr-2" />
                Start Focus
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold">{(currentUser.focusMinutes / 60).toFixed(1)}h</div>
              <div className="text-xs text-muted-foreground">This Week</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{currentUser.noDistractionBlocks}</div>
              <div className="text-xs text-muted-foreground">Clean Blocks</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{currentUser.todayMinutes}</div>
              <div className="text-xs text-muted-foreground">Today (min)</div>
            </div>
            <div>
              <div className="text-2xl font-bold flex items-center justify-center">
                {currentUser.change > 0 ? '↑' : currentUser.change < 0 ? '↓' : '='} 
                {Math.abs(currentUser.change)}
              </div>
              <div className="text-xs text-muted-foreground">vs Last Week</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Weekly Leaderboard
            </CardTitle>
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                size="sm"
                variant={selectedMetric === 'minutes' ? 'default' : 'ghost'}
                onClick={() => setSelectedMetric('minutes')}
              >
                Minutes
              </Button>
              <Button
                size="sm"
                variant={selectedMetric === 'blocks' ? 'default' : 'ghost'}
                onClick={() => setSelectedMetric('blocks')}
              >
                Blocks
              </Button>
              <Button
                size="sm"
                variant={selectedMetric === 'adjusted' ? 'default' : 'ghost'}
                onClick={() => setSelectedMetric('adjusted')}
              >
                Adjusted
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedMembers.map((member, index) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                  member.id === 'current_user' ? 'bg-primary/10 border border-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 text-center">
                    {index === 0 ? <Medal className="h-5 w-5 text-yellow-500" /> :
                     index === 1 ? <Medal className="h-5 w-5 text-gray-400" /> :
                     index === 2 ? <Medal className="h-5 w-5 text-orange-600" /> :
                     <span className="font-bold text-sm">#{index + 1}</span>}
                  </div>
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <img src={member.avatar} alt={member.username} />
                    </Avatar>
                    {member.isOnline && (
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                        getActivityColor(member.currentActivity)
                      }`} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {member.username}
                      {member.id === currentLeague.captain && (
                        <Shield className="h-3 w-3 text-yellow-500" />
                      )}
                      {member.id === 'current_user' && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {member.major} • {member.handicap !== 1.0 && `Handicap ${member.handicap}x`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    {selectedMetric === 'blocks' ? member.noDistractionBlocks :
                     selectedMetric === 'adjusted' ? getAdjustedScore(member) :
                     (member.focusMinutes / 60).toFixed(1) + 'h'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {member.todayMinutes > 0 && `+${member.todayMinutes} today`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenge */}
      <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Weekly Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="font-medium">{weeklyChallenge.name}</div>
              <div className="text-sm text-muted-foreground">{weeklyChallenge.description}</div>
            </div>
            
            <div className="space-y-2">
              {sortedMembers.slice(0, 3).map((member) => {
                const progress = weeklyChallenge.progress.get(member.id) || 0;
                const percentage = (progress / weeklyChallenge.target) * 100;
                
                return (
                  <div key={member.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <img src={member.avatar} alt={member.username} />
                    </Avatar>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-xs font-medium w-12 text-right">
                      {progress}/{weeklyChallenge.target}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center pt-2">
              <Badge variant="outline">
                <Zap className="h-3 w-3 mr-1" />
                {weeklyChallenge.reward}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentLeague.members
              .filter(m => m.isOnline)
              .map((member) => (
                <div key={member.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${getActivityColor(member.currentActivity)}`} />
                    <span>{member.username}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {member.currentActivity === 'focusing' ? 'In focus session' :
                     member.currentActivity === 'break' ? 'Taking a break' :
                     'Online'}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics (Dev Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>League Engagement:</span>
                <span className={leagueEngagement >= ENGAGEMENT_TARGET ? 'text-green-500' : 'text-red-500'}>
                  {(leagueEngagement * 100).toFixed(0)}% (target: 70%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active Members:</span>
                <span>{currentLeague.members.filter(m => m.isOnline).length}/{currentLeague.members.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Focus/Member:</span>
                <span>{(currentLeague.totalFocusMinutes / currentLeague.members.length / 60).toFixed(1)}h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}