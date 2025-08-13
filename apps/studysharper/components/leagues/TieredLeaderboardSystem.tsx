// Tiered Leaderboard System - Fair Competition for All Levels
// Based on GPT_DEEP_RESEARCH_02: Skill-based matchmaking, progress over rank emphasis
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Trophy,
  Users,
  TrendingUp,
  Target,
  Award,
  Star,
  Zap,
  ChevronUp,
  ChevronDown,
  Minus,
  Crown,
  Medal,
  Shield,
  Sparkles,
  Heart,
  MessageCircle,
  ThumbsUp,
  BarChart3,
  Clock,
  Flame,
  ArrowUp,
  Info
} from 'lucide-react';

interface LeagueTier {
  id: string;
  name: string;
  icon: string;
  color: string;
  minHours: number; // Min weekly focus hours to qualify
  maxHours: number; // Max weekly focus hours
  description: string;
  rewards: string[];
}

interface LeagueMember {
  id: string;
  username: string;
  avatar: string;
  currentTier: string;
  weeklyHours: number;
  dailyAverage: number;
  personalBest: number;
  weekOverWeekChange: number; // Percentage change
  rank: number;
  previousRank: number;
  supportReceived: number; // Thumbs up from others
  messagesShared: number;
  joinedDate: Date;
  isYou?: boolean;
}

interface WeeklyChallenge {
  id: string;
  name: string;
  description: string;
  type: 'personal' | 'team' | 'tier';
  target: number;
  current: number;
  reward: string;
  endsIn: number; // hours
}

interface PersonalProgress {
  weeklyGoal: number;
  currentProgress: number;
  bestWeek: number;
  currentStreak: number;
  improvementRate: number; // % better than last week
  milestones: {
    title: string;
    achieved: boolean;
    date?: Date;
  }[];
}

const LEAGUE_TIERS: LeagueTier[] = [
  {
    id: 'casual',
    name: 'Casual Focus',
    icon: '🌱',
    color: 'green',
    minHours: 0,
    maxHours: 10,
    description: 'Perfect for beginners and busy schedules',
    rewards: ['50 XP/week', 'Starter Badge'],
  },
  {
    id: 'regular',
    name: 'Regular Scholar',
    icon: '📚',
    color: 'blue',
    minHours: 10,
    maxHours: 25,
    description: 'Consistent learners building habits',
    rewards: ['100 XP/week', 'Scholar Badge', 'Weekly Tips'],
  },
  {
    id: 'dedicated',
    name: 'Dedicated Student',
    icon: '🎯',
    color: 'purple',
    minHours: 25,
    maxHours: 40,
    description: 'Serious students with regular study routines',
    rewards: ['200 XP/week', 'Dedicated Badge', 'Priority Support'],
  },
  {
    id: 'intense',
    name: 'Intense Grinder',
    icon: '🔥',
    color: 'orange',
    minHours: 40,
    maxHours: 60,
    description: 'High achievers pushing their limits',
    rewards: ['350 XP/week', 'Grinder Badge', 'Custom Themes'],
  },
  {
    id: 'elite',
    name: 'Elite Master',
    icon: '👑',
    color: 'yellow',
    minHours: 60,
    maxHours: 999,
    description: 'The top 1% of focused learners',
    rewards: ['500 XP/week', 'Elite Badge', 'Beta Features', 'Hall of Fame'],
  },
];

export function TieredLeaderboardSystem() {
  const [selectedTier, setSelectedTier] = useState<string>('regular');
  const [viewMode, setViewMode] = useState<'rank' | 'progress' | 'support'>('progress');
  const [currentUser] = useState<LeagueMember>({
    id: 'current_user',
    username: 'You',
    avatar: '/avatar-you.jpg',
    currentTier: 'regular',
    weeklyHours: 18.5,
    dailyAverage: 2.6,
    personalBest: 24,
    weekOverWeekChange: 15, // 15% improvement
    rank: 4,
    previousRank: 6,
    supportReceived: 12,
    messagesShared: 3,
    joinedDate: new Date(Date.now() - 30 * 86400000),
    isYou: true,
  });

  const [leagueMembers, setLeagueMembers] = useState<LeagueMember[]>([
    currentUser,
    {
      id: 'user_2',
      username: 'StudyBuddy',
      avatar: '/avatar-2.jpg',
      currentTier: 'regular',
      weeklyHours: 22.3,
      dailyAverage: 3.2,
      personalBest: 28,
      weekOverWeekChange: -5,
      rank: 1,
      previousRank: 2,
      supportReceived: 24,
      messagesShared: 8,
      joinedDate: new Date(Date.now() - 60 * 86400000),
    },
    {
      id: 'user_3',
      username: 'FocusNinja',
      avatar: '/avatar-3.jpg',
      currentTier: 'regular',
      weeklyHours: 20.1,
      dailyAverage: 2.9,
      personalBest: 22,
      weekOverWeekChange: 8,
      rank: 2,
      previousRank: 3,
      supportReceived: 18,
      messagesShared: 5,
      joinedDate: new Date(Date.now() - 45 * 86400000),
    },
    {
      id: 'user_4',
      username: 'CodeLearner',
      avatar: '/avatar-4.jpg',
      currentTier: 'regular',
      weeklyHours: 19.8,
      dailyAverage: 2.8,
      personalBest: 21,
      weekOverWeekChange: 22,
      rank: 3,
      previousRank: 8,
      supportReceived: 15,
      messagesShared: 6,
      joinedDate: new Date(Date.now() - 20 * 86400000),
    },
  ]);

  const [personalProgress] = useState<PersonalProgress>({
    weeklyGoal: 20,
    currentProgress: 18.5,
    bestWeek: 24,
    currentStreak: 3,
    improvementRate: 15,
    milestones: [
      { title: 'First 10-hour week', achieved: true, date: new Date(Date.now() - 21 * 86400000) },
      { title: 'First 20-hour week', achieved: true, date: new Date(Date.now() - 7 * 86400000) },
      { title: '3-week streak', achieved: true, date: new Date() },
      { title: '30-hour week', achieved: false },
      { title: 'Top 3 in tier', achieved: false },
    ],
  });

  const [weeklyChallenge] = useState<WeeklyChallenge>({
    id: 'weekly_1',
    name: 'Consistency Champion',
    description: 'Study at least 2 hours for 5 days this week',
    type: 'personal',
    target: 5,
    current: 3,
    reward: '100 XP + Consistency Badge',
    endsIn: 72,
  });

  // Get tier info
  const getTierInfo = (tierId: string) => {
    return LEAGUE_TIERS.find(t => t.id === tierId) || LEAGUE_TIERS[0];
  };

  // Sort members based on view mode
  const getSortedMembers = () => {
    const members = [...leagueMembers];
    
    switch (viewMode) {
      case 'rank':
        return members.sort((a, b) => a.rank - b.rank);
      case 'progress':
        return members.sort((a, b) => b.weekOverWeekChange - a.weekOverWeekChange);
      case 'support':
        return members.sort((a, b) => b.supportReceived - a.supportReceived);
      default:
        return members;
    }
  };

  // Get rank change icon
  const getRankChangeIcon = (current: number, previous: number) => {
    if (current < previous) return <ChevronUp className="h-4 w-4 text-green-500" />;
    if (current > previous) return <ChevronDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  // Send support to another member
  const sendSupport = (memberId: string) => {
    setLeagueMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { ...member, supportReceived: member.supportReceived + 1 }
        : member
    ));
  };

  const currentTierInfo = getTierInfo(selectedTier);
  const sortedMembers = getSortedMembers();
  const progressPercentage = (personalProgress.currentProgress / personalProgress.weeklyGoal) * 100;

  return (
    <div className="space-y-4">
      {/* Personal Progress Card - Emphasis on self-improvement */}
      <Card className="border-2 border-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Your Weekly Progress
            </CardTitle>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20">
              {currentTierInfo.icon} {currentTierInfo.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Weekly Goal Progress</span>
              <span>{personalProgress.currentProgress}/{personalProgress.weeklyGoal}h</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Daily avg: {currentUser.dailyAverage}h</span>
              <span>Personal best: {personalProgress.bestWeek}h</span>
            </div>
          </div>

          {/* Improvement Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  +{personalProgress.improvementRate}%
                </div>
                <div className="text-xs text-muted-foreground">vs Last Week</div>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                  <Flame className="h-5 w-5" />
                  {personalProgress.currentStreak}
                </div>
                <div className="text-xs text-muted-foreground">Week Streak</div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  #{currentUser.rank}
                </div>
                <div className="text-xs text-muted-foreground">In Your Tier</div>
              </CardContent>
            </Card>
          </div>

          {/* Motivational Message */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              <div className="font-medium">Great progress this week!</div>
              <div className="text-sm">
                You're {personalProgress.improvementRate}% better than last week. 
                {progressPercentage >= 90 && " You're almost at your goal!"}
                {progressPercentage < 50 && " Keep pushing, you've got this!"}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tier Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">League Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {LEAGUE_TIERS.map(tier => (
              <Button
                key={tier.id}
                variant={selectedTier === tier.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTier(tier.id)}
                className="flex flex-col h-auto py-2"
              >
                <div className="text-2xl mb-1">{tier.icon}</div>
                <div className="text-xs">{tier.minHours}-{tier.maxHours === 999 ? '∞' : tier.maxHours}h</div>
              </Button>
            ))}
          </div>
          
          {/* Tier Description */}
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <div className="font-medium text-sm mb-1">{currentTierInfo.name}</div>
            <div className="text-xs text-muted-foreground mb-2">{currentTierInfo.description}</div>
            <div className="flex gap-2">
              {currentTierInfo.rewards.map((reward, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {reward}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard with View Modes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              {currentTierInfo.name} League
            </CardTitle>
            
            {/* View Mode Selector */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="rank" className="text-xs">Rank</TabsTrigger>
                <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>
                <TabsTrigger value="support" className="text-xs">Support</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedMembers.map((member, index) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  member.isYou ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200' : 
                  'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank or Progress Indicator */}
                  <div className="w-10 text-center">
                    {viewMode === 'rank' ? (
                      index === 0 ? <Crown className="h-5 w-5 text-yellow-500 mx-auto" /> :
                      index === 1 ? <Medal className="h-5 w-5 text-gray-400 mx-auto" /> :
                      index === 2 ? <Medal className="h-5 w-5 text-orange-600 mx-auto" /> :
                      <span className="font-bold text-sm">#{member.rank}</span>
                    ) : viewMode === 'progress' ? (
                      <div className={`text-sm font-bold ${
                        member.weekOverWeekChange > 0 ? 'text-green-500' : 
                        member.weekOverWeekChange < 0 ? 'text-red-500' : 
                        'text-gray-500'
                      }`}>
                        {member.weekOverWeekChange > 0 ? '+' : ''}{member.weekOverWeekChange}%
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="text-xs">{member.supportReceived}</span>
                      </div>
                    )}
                  </div>

                  {/* Member Info */}
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {member.username}
                      {member.isYou && <Badge variant="outline" className="text-xs">You</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {member.weeklyHours}h this week • {member.dailyAverage}h/day avg
                    </div>
                  </div>
                </div>

                {/* Action/Status */}
                <div className="flex items-center gap-2">
                  {viewMode === 'rank' && (
                    <div className="flex items-center gap-1">
                      {getRankChangeIcon(member.rank, member.previousRank)}
                      <span className="text-xs text-muted-foreground">
                        {Math.abs(member.rank - member.previousRank)}
                      </span>
                    </div>
                  )}
                  
                  {viewMode === 'progress' && (
                    <Badge variant={member.weekOverWeekChange > 0 ? 'default' : 'secondary'}>
                      PB: {member.personalBest}h
                    </Badge>
                  )}
                  
                  {viewMode === 'support' && !member.isYou && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => sendSupport(member.id)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Support
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Encouragement Message */}
          <Alert className="mt-4 border-green-200 bg-green-50 dark:bg-green-950/20">
            <Heart className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-sm">
              {viewMode === 'progress' && "Everyone's improving at their own pace! Focus on beating your personal best."}
              {viewMode === 'rank' && "Remember: Progress matters more than rank. You're all doing great!"}
              {viewMode === 'support' && "Send support to motivate your peers. We rise by lifting others!"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Weekly Challenge */}
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              Weekly Challenge
            </CardTitle>
            <Badge variant="outline">
              {weeklyChallenge.endsIn}h left
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="font-medium text-sm">{weeklyChallenge.name}</div>
              <div className="text-xs text-muted-foreground">{weeklyChallenge.description}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{weeklyChallenge.current}/{weeklyChallenge.target}</span>
              </div>
              <Progress 
                value={(weeklyChallenge.current / weeklyChallenge.target) * 100} 
                className="h-2"
              />
            </div>
            
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-xs">
                <Award className="h-3 w-3 mr-1" />
                {weeklyChallenge.reward}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-5 w-5" />
            Your Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {personalProgress.milestones.map((milestone, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  milestone.achieved ? 'bg-green-50 dark:bg-green-950/20' : 'bg-gray-50 dark:bg-gray-900/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {milestone.achieved ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="text-sm">{milestone.title}</span>
                </div>
                {milestone.achieved && milestone.date && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(milestone.date).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}