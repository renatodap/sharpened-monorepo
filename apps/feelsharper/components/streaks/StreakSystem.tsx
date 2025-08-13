// Streak System with Freezes & Grace Periods - Based on Market Intelligence
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  Flame,
  Snowflake,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Shield,
  Clock,
  Trophy,
  Heart,
  Zap
} from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  freezeTokens: number;
  graceWindowActive: boolean;
  graceWindowEnds?: Date;
  lastLogDate: Date;
  streakStartDate: Date;
  weekendSkipEnabled: boolean;
  milestones: StreakMilestone[];
}

interface StreakMilestone {
  days: number;
  title: string;
  reward: string;
  achieved: boolean;
  achievedDate?: Date;
}

interface StreakActivity {
  date: Date;
  logged: boolean;
  frozen?: boolean;
  graceUsed?: boolean;
  skipped?: boolean;
}

export function StreakSystem() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 12,
    longestStreak: 28,
    totalDays: 145,
    freezeTokens: 2,
    graceWindowActive: false,
    lastLogDate: new Date(Date.now() - 86400000), // Yesterday
    streakStartDate: new Date(Date.now() - 12 * 86400000), // 12 days ago
    weekendSkipEnabled: true,
    milestones: [
      { days: 7, title: 'Week Warrior', reward: '100 XP', achieved: true, achievedDate: new Date(Date.now() - 5 * 86400000) },
      { days: 14, title: 'Fortnight Fighter', reward: '250 XP + Badge', achieved: false },
      { days: 30, title: 'Monthly Master', reward: '500 XP + Title', achieved: false },
      { days: 60, title: 'Bimonthly Beast', reward: '1000 XP + Perk', achieved: false },
      { days: 100, title: 'Century Champion', reward: '2000 XP + Exclusive Badge', achieved: false },
    ],
  });

  const [recentActivity, setRecentActivity] = useState<StreakActivity[]>([]);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);

  // Generate recent activity for visualization
  useEffect(() => {
    const activities: StreakActivity[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      activities.push({
        date,
        logged: i === 0 ? false : i <= 12, // Today not logged yet
        skipped: isWeekend && streakData.weekendSkipEnabled && i > 0,
      });
    }
    setRecentActivity(activities);
  }, [streakData.weekendSkipEnabled]);

  // Check if grace window should be activated
  useEffect(() => {
    const hoursSinceLastLog = (Date.now() - streakData.lastLogDate.getTime()) / (1000 * 60 * 60);
    
    // Activate grace window if missed yesterday but within 24-hour grace period
    if (hoursSinceLastLog > 24 && hoursSinceLastLog < 48 && !streakData.graceWindowActive) {
      setStreakData(prev => ({
        ...prev,
        graceWindowActive: true,
        graceWindowEnds: new Date(Date.now() + (48 - hoursSinceLastLog) * 60 * 60 * 1000),
      }));
    }
  }, [streakData.lastLogDate]);

  // Use freeze token
  const useFreezeToken = () => {
    if (streakData.freezeTokens <= 0) return;
    
    setStreakData(prev => ({
      ...prev,
      freezeTokens: prev.freezeTokens - 1,
      lastLogDate: new Date(), // Counts as logged
    }));

    // Mark today as frozen
    setRecentActivity(prev => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return prev.map(activity => {
        const activityDate = new Date(activity.date);
        activityDate.setHours(0, 0, 0, 0);
        
        if (activityDate.getTime() === today.getTime()) {
          return { ...activity, logged: true, frozen: true };
        }
        return activity;
      });
    });
  };

  // Log today's activity
  const logToday = () => {
    const now = new Date();
    
    setStreakData(prev => {
      let newStreak = prev.currentStreak;
      
      // If within grace window, maintain streak
      if (prev.graceWindowActive) {
        newStreak = prev.currentStreak;
      } else {
        // Check if continuing streak or starting new one
        const hoursSinceLastLog = (now.getTime() - prev.lastLogDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastLog < 48) {
          newStreak = prev.currentStreak + 1;
        } else {
          // Streak broken - show recovery prompt
          setShowRecoveryPrompt(true);
          newStreak = 1;
        }
      }

      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        totalDays: prev.totalDays + 1,
        lastLogDate: now,
        graceWindowActive: false,
        graceWindowEnds: undefined,
      };
    });

    // Update activity
    setRecentActivity(prev => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return prev.map(activity => {
        const activityDate = new Date(activity.date);
        activityDate.setHours(0, 0, 0, 0);
        
        if (activityDate.getTime() === today.getTime()) {
          return { ...activity, logged: true };
        }
        return activity;
      });
    });
  };

  // Toggle weekend skip mode
  const toggleWeekendSkip = () => {
    setStreakData(prev => ({
      ...prev,
      weekendSkipEnabled: !prev.weekendSkipEnabled,
    }));
  };

  // Get next milestone
  const getNextMilestone = () => {
    return streakData.milestones.find(m => !m.achieved) || null;
  };

  const nextMilestone = getNextMilestone();
  const progressToNextMilestone = nextMilestone 
    ? (streakData.currentStreak / nextMilestone.days) * 100
    : 100;

  // Calculate streak health
  const getStreakHealth = () => {
    if (streakData.graceWindowActive) return 'warning';
    if (streakData.currentStreak === 0) return 'broken';
    if (streakData.currentStreak >= 7) return 'strong';
    return 'building';
  };

  const streakHealth = getStreakHealth();

  // Check if today is logged
  const isTodayLogged = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastLog = new Date(streakData.lastLogDate);
    lastLog.setHours(0, 0, 0, 0);
    return today.getTime() === lastLog.getTime();
  };

  const todayLogged = isTodayLogged();

  return (
    <div className="space-y-4">
      {/* Main Streak Card */}
      <Card className={`relative overflow-hidden ${
        streakHealth === 'warning' ? 'border-yellow-500' :
        streakHealth === 'broken' ? 'border-red-500' :
        streakHealth === 'strong' ? 'border-green-500' :
        'border-blue-500'
      }`}>
        <div className={`absolute inset-0 opacity-10 ${
          streakHealth === 'warning' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
          streakHealth === 'broken' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
          streakHealth === 'strong' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
          'bg-gradient-to-br from-blue-500 to-purple-500'
        }`} />
        
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Flame className={`h-12 w-12 ${
                  streakHealth === 'strong' ? 'text-orange-500' :
                  streakHealth === 'warning' ? 'text-yellow-500' :
                  streakHealth === 'broken' ? 'text-gray-400' :
                  'text-blue-500'
                }`} />
                {streakData.currentStreak > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {streakData.currentStreak}
                  </div>
                )}
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {streakData.currentStreak} Day Streak
                </div>
                <div className="text-sm text-muted-foreground">
                  Longest: {streakData.longestStreak} days • Total: {streakData.totalDays} days
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              {!todayLogged && (
                <Button 
                  onClick={logToday}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Log Today
                </Button>
              )}
              {streakData.freezeTokens > 0 && !todayLogged && (
                <Button 
                  variant="outline"
                  onClick={useFreezeToken}
                >
                  <Snowflake className="h-4 w-4 mr-2" />
                  Freeze ({streakData.freezeTokens})
                </Button>
              )}
            </div>
          </div>

          {/* Grace Window Alert */}
          {streakData.graceWindowActive && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Grace Period Active</div>
                  <div className="text-xs text-muted-foreground">
                    Log within {Math.ceil((streakData.graceWindowEnds!.getTime() - Date.now()) / (1000 * 60 * 60))} hours to maintain streak
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Streak Calendar */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Last 14 Days</div>
            <div className="grid grid-cols-7 gap-1">
              {recentActivity.slice(-14).map((activity, index) => {
                const isToday = index === 13;
                const dayOfWeek = activity.date.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                
                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs relative ${
                      activity.logged ? 
                        activity.frozen ? 'bg-blue-100 dark:bg-blue-950' :
                        'bg-green-100 dark:bg-green-950' :
                      activity.skipped ? 'bg-gray-100 dark:bg-gray-900' :
                      isToday ? 'bg-yellow-100 dark:bg-yellow-950 border-2 border-yellow-500' :
                      'bg-red-100 dark:bg-red-950'
                    }`}
                  >
                    <div className="font-medium">
                      {activity.date.getDate()}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][dayOfWeek]}
                    </div>
                    {activity.frozen && (
                      <Snowflake className="h-3 w-3 absolute top-0.5 right-0.5 text-blue-500" />
                    )}
                    {activity.logged && !activity.frozen && (
                      <CheckCircle className="h-3 w-3 absolute top-0.5 right-0.5 text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Milestone Progress */}
          {nextMilestone && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Next: {nextMilestone.title}</span>
                <Badge variant="outline">
                  <Trophy className="h-3 w-3 mr-1" />
                  {nextMilestone.reward}
                </Badge>
              </div>
              <Progress value={progressToNextMilestone} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {nextMilestone.days - streakData.currentStreak} days to go
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streak Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Streak Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Weekend Skip Mode</span>
            </div>
            <Button
              size="sm"
              variant={streakData.weekendSkipEnabled ? "default" : "outline"}
              onClick={toggleWeekendSkip}
            >
              {streakData.weekendSkipEnabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Freeze Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`h-6 w-6 rounded-full flex items-center justify-center ${
                    i < streakData.freezeTokens 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                >
                  <Snowflake className="h-3 w-3" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Grace Period</span>
            </div>
            <Badge variant="outline">24 hours</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Prompt (shows after streak break) */}
      {showRecoveryPrompt && (
        <Card className="border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Fresh Start!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Your longest streak of {streakData.longestStreak} days is preserved. 
                  Every champion has setbacks - what matters is getting back up!
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setShowRecoveryPrompt(false)}>
                    Start New Streak
                  </Button>
                  <Button size="sm" variant="outline">
                    View Tips
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones Achieved */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {streakData.milestones.map((milestone) => (
              <div
                key={milestone.days}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  milestone.achieved 
                    ? 'bg-green-50 dark:bg-green-950/20' 
                    : 'bg-gray-50 dark:bg-gray-900/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {milestone.achieved ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{milestone.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {milestone.days} days • {milestone.reward}
                    </div>
                  </div>
                </div>
                {milestone.achieved && milestone.achievedDate && (
                  <Badge variant="outline" className="text-xs">
                    {new Date(milestone.achievedDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}