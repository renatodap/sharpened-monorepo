// Social Competition & Leaderboard System for Builder-Athletes
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Progress } from '@/components/ui/Progress';
import {
  Trophy,
  Users,
  Target,
  Flame,
  TrendingUp,
  Medal,
  Crown,
  Swords,
  UserPlus,
  Share2,
  ChevronUp,
  ChevronDown,
  Star,
  Zap,
  Award,
  Dumbbell,
  Brain,
  Plus
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  achievements: number;
  status: 'online' | 'studying' | 'working-out' | 'offline';
}

interface LeaderboardEntry extends User {
  rank: number;
  score: number;
  change: number; // Position change from last period
  stats: {
    workouts: number;
    studyHours: number;
    challenges: number;
  };
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'solo' | '1v1' | 'team' | 'community';
  category: 'workout' | 'study' | 'mixed';
  participants: User[];
  duration: { start: Date; end: Date };
  prize: { xp: number; badge?: string };
  requirements: { metric: string; target: number }[];
  progress: Map<string, number>;
  status: 'upcoming' | 'active' | 'completed';
}

interface Squad {
  id: string;
  name: string;
  motto: string;
  members: User[];
  captain: string;
  totalXP: number;
  rank: number;
  challenges: Challenge[];
}

export function LeaderboardSystem() {
  const [activeTab, setActiveTab] = useState<'global' | 'friends' | 'squads' | 'challenges'>('global');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'fitness' | 'study'>('overall');
  
  // Mock data
  const [currentUser] = useState<User>({
    id: 'current',
    username: 'You',
    avatar: '/avatar-you.jpg',
    level: 24,
    xp: 12500,
    streak: 12,
    achievements: 18,
    status: 'online',
  });

  const [leaderboard] = useState<LeaderboardEntry[]>([
    {
      id: '1',
      username: 'IronMind92',
      avatar: '/avatar-1.jpg',
      level: 31,
      xp: 18750,
      streak: 45,
      achievements: 32,
      status: 'working-out',
      rank: 1,
      score: 18750,
      change: 0,
      stats: { workouts: 28, studyHours: 120, challenges: 15 },
    },
    {
      id: '2',
      username: 'StudyWarrior',
      avatar: '/avatar-2.jpg',
      level: 28,
      xp: 16200,
      streak: 38,
      achievements: 28,
      status: 'studying',
      rank: 2,
      score: 16200,
      change: 2,
      stats: { workouts: 22, studyHours: 145, challenges: 12 },
    },
    {
      id: '3',
      username: 'AlphaBuilder',
      avatar: '/avatar-3.jpg',
      level: 27,
      xp: 15800,
      streak: 31,
      achievements: 25,
      status: 'online',
      rank: 3,
      score: 15800,
      change: -1,
      stats: { workouts: 30, studyHours: 98, challenges: 14 },
    },
    {
      id: 'current',
      username: 'You',
      avatar: '/avatar-you.jpg',
      level: 24,
      xp: 12500,
      streak: 12,
      achievements: 18,
      status: 'online',
      rank: 8,
      score: 12500,
      change: 3,
      stats: { workouts: 18, studyHours: 84, challenges: 8 },
    },
  ]);

  const [activeChallenges] = useState<Challenge[]>([
    {
      id: 'c1',
      name: 'Dawn Warrior',
      description: 'Complete 5 morning workouts before 7 AM this week',
      type: 'solo',
      category: 'workout',
      participants: [currentUser],
      duration: { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      prize: { xp: 500, badge: 'early_bird' },
      requirements: [{ metric: 'morning_workouts', target: 5 }],
      progress: new Map([['current', 2]]),
      status: 'active',
    },
    {
      id: 'c2',
      name: 'Focus Duel',
      description: 'Highest total focus time wins',
      type: '1v1',
      category: 'study',
      participants: [
        currentUser,
        { id: 'opponent', username: 'StudyRival', avatar: '/avatar-4.jpg', level: 26, xp: 14000, streak: 20, achievements: 22, status: 'studying' },
      ],
      duration: { start: new Date(), end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      prize: { xp: 750 },
      requirements: [{ metric: 'focus_hours', target: 20 }],
      progress: new Map([['current', 12], ['opponent', 14]]),
      status: 'active',
    },
    {
      id: 'c3',
      name: 'Squad Goals',
      description: 'Team up to burn 10,000 calories together',
      type: 'team',
      category: 'mixed',
      participants: [/* squad members */],
      duration: { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      prize: { xp: 1000, badge: 'team_player' },
      requirements: [{ metric: 'calories', target: 10000 }],
      progress: new Map([['team', 6500]]),
      status: 'active',
    },
  ]);

  // Get rank badge
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return <span className="text-sm font-bold">#{rank}</span>;
  };

  // Get status color
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'studying': return 'bg-blue-500';
      case 'working-out': return 'bg-orange-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with user stats */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-3 border-white">
                <img src={currentUser.avatar} alt={currentUser.username} />
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{currentUser.username}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="secondary" className="bg-white/20">
                    Level {currentUser.level}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    {currentUser.streak} day streak
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    Rank #{leaderboard.find(e => e.id === 'current')?.rank}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30">
                <UserPlus className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30">
                <Swords className="h-4 w-4 mr-2" />
                Challenge
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global">
            <Trophy className="h-4 w-4 mr-2" />
            Global
          </TabsTrigger>
          <TabsTrigger value="friends">
            <Users className="h-4 w-4 mr-2" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="squads">
            <Target className="h-4 w-4 mr-2" />
            Squads
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Swords className="h-4 w-4 mr-2" />
            Challenges
          </TabsTrigger>
        </TabsList>

        {/* Global Leaderboard */}
        <TabsContent value="global" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1).replace('-', ' ')}
                </Button>
              ))}
            </div>
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {(['overall', 'fitness', 'study'] as const).map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                      entry.id === 'current' ? 'bg-primary/10 border border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 flex justify-center">
                        {getRankBadge(entry.rank)}
                      </div>
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <img src={entry.avatar} alt={entry.username} />
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(entry.status)}`} />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {entry.username}
                          {entry.id === 'current' && <Badge variant="outline" className="text-xs">You</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Level {entry.level} • {entry.xp.toLocaleString()} XP
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold">{entry.score.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                          {entry.change > 0 ? (
                            <><ChevronUp className="h-3 w-3 text-green-500" /> +{entry.change}</>
                          ) : entry.change < 0 ? (
                            <><ChevronDown className="h-3 w-3 text-red-500" /> {entry.change}</>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">
                          <Dumbbell className="h-3 w-3 mr-1" />
                          {entry.stats.workouts}
                        </Badge>
                        <Badge variant="outline">
                          <Brain className="h-3 w-3 mr-1" />
                          {entry.stats.studyHours}h
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Challenges */}
            {activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="overflow-hidden">
                <div className={`h-2 ${
                  challenge.category === 'workout' ? 'bg-orange-500' :
                  challenge.category === 'study' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`} />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {challenge.name}
                        {challenge.type === '1v1' && <Swords className="h-4 w-4" />}
                        {challenge.type === 'team' && <Users className="h-4 w-4" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge variant="outline">
                      <Zap className="h-3 w-3 mr-1" />
                      {challenge.prize.xp} XP
                    </Badge>
                  </div>

                  {/* Progress */}
                  {challenge.type === 'solo' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{challenge.progress.get('current')}/{challenge.requirements[0].target}</span>
                      </div>
                      <Progress 
                        value={(challenge.progress.get('current')! / challenge.requirements[0].target) * 100} 
                      />
                    </div>
                  )}

                  {challenge.type === '1v1' && (
                    <div className="space-y-2">
                      {challenge.participants.map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <img src={p.avatar} alt={p.username} />
                            </Avatar>
                            <span className="text-sm">{p.username}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(challenge.progress.get(p.id)! / challenge.requirements[0].target) * 100} 
                              className="w-20 h-2"
                            />
                            <span className="text-sm font-medium">
                              {challenge.progress.get(p.id)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Time remaining */}
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {Math.ceil((challenge.duration.end.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days left
                    </span>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create Challenge Card */}
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Challenge</h3>
                    <p className="text-sm text-muted-foreground">
                      Challenge friends or join community goals
                    </p>
                  </div>
                  <Button>
                    <Swords className="h-4 w-4 mr-2" />
                    New Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}