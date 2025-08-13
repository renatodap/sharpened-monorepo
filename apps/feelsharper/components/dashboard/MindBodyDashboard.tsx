// Unified Mind-Body Dashboard for Builder-Athletes
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { 
  Brain, 
  Dumbbell, 
  Target, 
  TrendingUp, 
  Clock,
  Flame,
  Trophy,
  Users,
  Calendar,
  BarChart3,
  Zap,
  Heart
} from 'lucide-react';

interface MindBodyStats {
  // Physical stats
  workoutsThisWeek: number;
  totalVolume: number;
  caloriesBurned: number;
  activeMinutes: number;
  restingHeartRate: number;
  recoveryScore: number;
  
  // Mental stats
  studyHoursThisWeek: number;
  focusScore: number;
  pomodorosCompleted: number;
  productivityScore: number;
  streakDays: number;
  
  // Combined metrics
  overallSharpness: number; // 0-100
  energyLevel: number; // 0-100
  stressLevel: number; // 0-100
  momentum: number; // -100 to +100 (trending)
}

interface DailyGoals {
  workout: { target: number; completed: number; unit: string };
  study: { target: number; completed: number; unit: string };
  calories: { target: number; completed: number; unit: string };
  water: { target: number; completed: number; unit: string };
  sleep: { target: number; completed: number; unit: string };
}

interface InsightCard {
  type: 'recommendation' | 'achievement' | 'warning' | 'correlation';
  title: string;
  description: string;
  action?: string;
  icon: React.ReactNode;
}

export function MindBodyDashboard() {
  const [stats, setStats] = useState<MindBodyStats>({
    workoutsThisWeek: 4,
    totalVolume: 12500,
    caloriesBurned: 2800,
    activeMinutes: 280,
    restingHeartRate: 62,
    recoveryScore: 85,
    studyHoursThisWeek: 24,
    focusScore: 0.82,
    pomodorosCompleted: 48,
    productivityScore: 78,
    streakDays: 12,
    overallSharpness: 84,
    energyLevel: 75,
    stressLevel: 35,
    momentum: 15,
  });

  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
    workout: { target: 60, completed: 45, unit: 'min' },
    study: { target: 4, completed: 3.2, unit: 'hrs' },
    calories: { target: 2400, completed: 1850, unit: 'cal' },
    water: { target: 3000, completed: 2100, unit: 'ml' },
    sleep: { target: 8, completed: 7.5, unit: 'hrs' },
  });

  const [insights, setInsights] = useState<InsightCard[]>([
    {
      type: 'correlation',
      title: 'Morning Workouts Boost Focus',
      description: 'Your study sessions are 23% more productive on days you exercise before noon',
      action: 'Schedule tomorrow\'s workout',
      icon: <Brain className="h-4 w-4" />,
    },
    {
      type: 'recommendation',
      title: 'Recovery Day Recommended',
      description: 'Your HRV suggests you need rest. Try yoga or light walking today',
      action: 'View recovery exercises',
      icon: <Heart className="h-4 w-4" />,
    },
    {
      type: 'achievement',
      title: '12 Day Streak! 🔥',
      description: 'You\'ve maintained both workout and study habits for 12 days straight',
      icon: <Trophy className="h-4 w-4" />,
    },
  ]);

  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month'>('week');

  // Calculate overall performance score
  const calculatePerformanceScore = () => {
    const physicalScore = (stats.workoutsThisWeek / 5) * 50 + (stats.recoveryScore / 100) * 50;
    const mentalScore = (stats.focusScore * 50) + (stats.productivityScore / 100) * 50;
    return Math.round((physicalScore + mentalScore) / 2);
  };

  // Get motivational message based on performance
  const getMotivationalMessage = () => {
    const score = calculatePerformanceScore();
    if (score >= 90) return "🔥 You're absolutely crushing it! Keep this momentum!";
    if (score >= 75) return "💪 Strong performance! You're in the zone!";
    if (score >= 60) return "📈 Good progress! Push a bit harder to level up!";
    return "🎯 Room to grow! Small steps lead to big gains!";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Hero Section - Overall Status */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Sharpness Score</h1>
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold">{stats.overallSharpness}</div>
                <div className="flex flex-col">
                  <Badge variant="secondary" className="mb-1">
                    {stats.momentum > 0 ? '↑' : '↓'} {Math.abs(stats.momentum)}% this week
                  </Badge>
                  <span className="text-sm opacity-90">{getMotivationalMessage()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <Zap className="h-8 w-8 mb-1 mx-auto" />
                <div className="text-2xl font-bold">{stats.energyLevel}%</div>
                <div className="text-xs opacity-75">Energy</div>
              </div>
              <div className="text-center">
                <Brain className="h-8 w-8 mb-1 mx-auto" />
                <div className="text-2xl font-bold">{Math.round(stats.focusScore * 100)}%</div>
                <div className="text-xs opacity-75">Focus</div>
              </div>
              <div className="text-center">
                <Flame className="h-8 w-8 mb-1 mx-auto" />
                <div className="text-2xl font-bold">{stats.streakDays}</div>
                <div className="text-xs opacity-75">Day Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Today's Goals</span>
            <div className="flex gap-2">
              {Object.values(dailyGoals).filter(g => g.completed >= g.target).length}/5 Complete
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(dailyGoals).map(([key, goal]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize flex items-center gap-2">
                  {key === 'workout' && <Dumbbell className="h-4 w-4" />}
                  {key === 'study' && <Brain className="h-4 w-4" />}
                  {key}
                </span>
                <span className="font-medium">
                  {goal.completed}/{goal.target} {goal.unit}
                </span>
              </div>
              <Progress 
                value={(goal.completed / goal.target) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Split View: Body & Mind Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Physical Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{stats.workoutsThisWeek}</div>
                  <div className="text-sm text-muted-foreground">Workouts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.activeMinutes}</div>
                  <div className="text-sm text-muted-foreground">Active Minutes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{(stats.totalVolume/1000).toFixed(1)}k</div>
                  <div className="text-sm text-muted-foreground">Volume (kg)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.caloriesBurned}</div>
                  <div className="text-sm text-muted-foreground">Calories Burned</div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Recovery Score</span>
                  <span className="font-medium">{stats.recoveryScore}%</span>
                </div>
                <Progress value={stats.recoveryScore} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.recoveryScore >= 80 ? 'Ready for intense training' : 
                   stats.recoveryScore >= 60 ? 'Moderate intensity recommended' :
                   'Focus on recovery today'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mental Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Mental Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{stats.studyHoursThisWeek}</div>
                  <div className="text-sm text-muted-foreground">Study Hours</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.pomodorosCompleted}</div>
                  <div className="text-sm text-muted-foreground">Pomodoros</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{Math.round(stats.focusScore * 100)}%</div>
                  <div className="text-sm text-muted-foreground">Focus Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.productivityScore}%</div>
                  <div className="text-sm text-muted-foreground">Productivity</div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Mental Energy</span>
                  <span className="font-medium">{100 - stats.stressLevel}%</span>
                </div>
                <Progress value={100 - stats.stressLevel} className="h-2" />
                <div className="text-xs text-muted-foreground mt-1">
                  {stats.stressLevel < 30 ? 'Optimal mental state' : 
                   stats.stressLevel < 60 ? 'Manageable stress levels' :
                   'Consider meditation or a break'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${
                insight.type === 'achievement' ? 'border-l-green-500' :
                insight.type === 'warning' ? 'border-l-yellow-500' :
                insight.type === 'correlation' ? 'border-l-blue-500' :
                'border-l-purple-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'achievement' ? 'bg-green-100 text-green-600' :
                      insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      insight.type === 'correlation' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                      {insight.action && (
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          {insight.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button className="h-24 flex-col gap-2" variant="outline">
          <Dumbbell className="h-6 w-6" />
          <span>Start Workout</span>
        </Button>
        <Button className="h-24 flex-col gap-2" variant="outline">
          <Brain className="h-6 w-6" />
          <span>Study Session</span>
        </Button>
        <Button className="h-24 flex-col gap-2" variant="outline">
          <Users className="h-6 w-6" />
          <span>Challenge Friends</span>
        </Button>
        <Button className="h-24 flex-col gap-2" variant="outline">
          <BarChart3 className="h-6 w-6" />
          <span>View Analytics</span>
        </Button>
      </div>
    </div>
  );
}