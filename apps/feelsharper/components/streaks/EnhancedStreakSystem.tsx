// Enhanced Streak System with Additional Safety Nets
// Based on GPT_DEEP_RESEARCH_02 findings: WeWard's Jokers, better hollow engagement prevention
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Alert, AlertDescription } from '@/components/ui/Alert';
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
  Zap,
  Sparkles,
  Gift,
  Info,
  Star,
  Target,
  Award
} from 'lucide-react';

interface EnhancedStreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  freezeTokens: number;
  jokerTokens: number; // New: Repair missed days (WeWard pattern)
  graceWindowActive: boolean;
  graceWindowEnds?: Date;
  lastLogDate: Date;
  streakStartDate: Date;
  weekendSkipEnabled: boolean;
  minimumActivityThreshold: number; // Minutes/calories to count as "real" activity
  personalBestStreak: number;
  streakTier: 'starter' | 'consistent' | 'dedicated' | 'champion';
  milestones: StreakMilestone[];
  hollowDays: number; // Days with minimal activity
  qualityScore: number; // 0-100 based on activity quality
}

interface StreakMilestone {
  days: number;
  title: string;
  reward: string;
  achieved: boolean;
  achievedDate?: Date;
  icon?: string;
}

interface ActivityLog {
  date: Date;
  type: 'workout' | 'meal' | 'weight' | 'combined';
  duration?: number; // For workouts
  calories?: number; // For meals
  quality: 'high' | 'medium' | 'low'; // Based on effort/completeness
}

export function EnhancedStreakSystem() {
  const [streakData, setStreakData] = useState<EnhancedStreakData>({
    currentStreak: 12,
    longestStreak: 28,
    totalDays: 145,
    freezeTokens: 3, // More generous initial allocation
    jokerTokens: 1, // Can repair one missed day per week
    graceWindowActive: false,
    lastLogDate: new Date(Date.now() - 86400000),
    streakStartDate: new Date(Date.now() - 12 * 86400000),
    weekendSkipEnabled: true,
    minimumActivityThreshold: 10, // 10 minutes workout or 100+ calorie meal log
    personalBestStreak: 28,
    streakTier: 'consistent',
    hollowDays: 2,
    qualityScore: 78,
    milestones: [
      { days: 3, title: 'Getting Started', reward: '50 XP + Freeze Token', achieved: true, icon: '🌱' },
      { days: 7, title: 'Week Warrior', reward: '100 XP + Badge', achieved: true, icon: '🔥' },
      { days: 14, title: 'Fortnight Fighter', reward: '250 XP + Joker Token', achieved: false, icon: '⚔️' },
      { days: 21, title: 'Habit Former', reward: '400 XP + Title', achieved: false, icon: '🎯' },
      { days: 30, title: 'Monthly Master', reward: '500 XP + Premium Trial', achieved: false, icon: '👑' },
      { days: 50, title: 'Streak Elite', reward: '750 XP + Custom Badge', achieved: false, icon: '💎' },
      { days: 100, title: 'Century Legend', reward: '2000 XP + Lifetime Perk', achieved: false, icon: '🏆' },
    ],
  });

  const [todayActivity, setTodayActivity] = useState<ActivityLog | null>(null);
  const [showMotivationTip, setShowMotivationTip] = useState(false);
  const [streakSociety, setStreakSociety] = useState<boolean>(false); // Duolingo-style exclusive club

  // Calculate streak tier based on current streak
  const calculateStreakTier = (days: number): EnhancedStreakData['streakTier'] => {
    if (days >= 30) return 'champion';
    if (days >= 14) return 'dedicated';
    if (days >= 7) return 'consistent';
    return 'starter';
  };

  // Use Joker token to repair yesterday's miss (WeWard pattern)
  const useJokerToken = () => {
    if (streakData.jokerTokens <= 0) return;
    
    // Can only repair if missed exactly yesterday
    const hoursSinceLastLog = (Date.now() - streakData.lastLogDate.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastLog < 24 || hoursSinceLastLog > 48) {
      alert("Joker tokens can only repair yesterday's missed day");
      return;
    }

    setStreakData(prev => ({
      ...prev,
      jokerTokens: prev.jokerTokens - 1,
      currentStreak: prev.currentStreak, // Maintains streak
      lastLogDate: new Date(Date.now() - 86400000), // Marks yesterday as logged
      hollowDays: prev.hollowDays + 1, // Track that this was a repair
    }));
  };

  // Earn tokens through quality activity
  const earnTokens = () => {
    // Award tokens for high-quality streaks
    if (streakData.currentStreak % 7 === 0 && streakData.qualityScore > 80) {
      setStreakData(prev => ({
        ...prev,
        freezeTokens: Math.min(prev.freezeTokens + 1, 5), // Cap at 5
      }));
      return { type: 'freeze', earned: true };
    }
    
    if (streakData.currentStreak % 14 === 0) {
      setStreakData(prev => ({
        ...prev,
        jokerTokens: Math.min(prev.jokerTokens + 1, 2), // Cap at 2
      }));
      return { type: 'joker', earned: true };
    }
    
    return { earned: false };
  };

  // Log activity with quality check (prevents hollow engagement)
  const logActivity = (activity: Omit<ActivityLog, 'date'>) => {
    const now = new Date();
    
    // Check if activity meets minimum threshold
    const meetsThreshold = 
      (activity.type === 'workout' && (activity.duration || 0) >= streakData.minimumActivityThreshold) ||
      (activity.type === 'meal' && (activity.calories || 0) >= 100) ||
      activity.type === 'weight'; // Weight always counts

    if (!meetsThreshold) {
      setShowMotivationTip(true);
      return false; // Don't count hollow activity
    }

    const newActivity: ActivityLog = {
      ...activity,
      date: now,
    };

    setTodayActivity(newActivity);
    
    // Update streak data
    setStreakData(prev => {
      const hoursSinceLastLog = (now.getTime() - prev.lastLogDate.getTime()) / (1000 * 60 * 60);
      let newStreak = prev.currentStreak;
      
      if (hoursSinceLastLog < 48) {
        newStreak = prev.currentStreak + 1;
      } else {
        newStreak = 1; // Reset but with encouragement
      }

      // Calculate quality score
      const qualityScore = calculateQualityScore(activity, prev);
      
      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        personalBestStreak: Math.max(prev.personalBestStreak, newStreak),
        totalDays: prev.totalDays + 1,
        lastLogDate: now,
        streakTier: calculateStreakTier(newStreak),
        qualityScore,
        graceWindowActive: false,
      };
    });

    // Check for token earnings
    const tokenResult = earnTokens();
    if (tokenResult.earned) {
      // Show celebration
    }

    // Check for Streak Society eligibility (500+ days)
    if (streakData.currentStreak >= 500 && !streakSociety) {
      setStreakSociety(true);
    }

    return true;
  };

  // Calculate quality score based on activity
  const calculateQualityScore = (activity: ActivityLog, prevData: EnhancedStreakData): number => {
    let score = prevData.qualityScore;
    
    if (activity.quality === 'high') {
      score = Math.min(100, score + 2);
    } else if (activity.quality === 'low') {
      score = Math.max(0, score - 1);
    }
    
    // Bonus for consistency
    if (prevData.currentStreak > 7) {
      score = Math.min(100, score + 1);
    }
    
    return score;
  };

  // Get motivational message based on streak status
  const getMotivationalMessage = () => {
    const { currentStreak, longestStreak, streakTier } = streakData;
    
    if (currentStreak === 0) {
      return {
        title: "Ready for a Fresh Start? 🌅",
        message: "Every expert was once a beginner. Your journey starts with a single day.",
        action: "Begin Today"
      };
    }
    
    if (currentStreak < 3) {
      return {
        title: "Building Momentum 🚀",
        message: "The first few days are the hardest. You're doing great!",
        action: "Keep Going"
      };
    }
    
    if (currentStreak === longestStreak - 1) {
      return {
        title: "One Day from Your Record! 🎯",
        message: `Log tomorrow to beat your personal best of ${longestStreak} days!`,
        action: "Make History"
      };
    }
    
    if (streakTier === 'champion') {
      return {
        title: "Champion Status! 👑",
        message: "You're in the top 5% of all users. Keep inspiring others!",
        action: "Stay Legendary"
      };
    }
    
    return {
      title: `${currentStreak} Days Strong! 💪`,
      message: "Consistency is your superpower. Keep it up!",
      action: "Continue Streak"
    };
  };

  const motivationalMessage = getMotivationalMessage();

  // Calculate progress to next tier
  const getNextTierProgress = () => {
    const tiers = { starter: 0, consistent: 7, dedicated: 14, champion: 30 };
    const currentDays = streakData.currentStreak;
    
    if (currentDays >= 30) return 100;
    if (currentDays >= 14) return ((currentDays - 14) / 16) * 100;
    if (currentDays >= 7) return ((currentDays - 7) / 7) * 100;
    return (currentDays / 7) * 100;
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Main Streak Card */}
      <Card className="relative overflow-hidden border-2">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
        
        <CardContent className="relative p-6">
          {/* Streak Header with Tier Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Flame className={`h-14 w-14 ${
                  streakData.streakTier === 'champion' ? 'text-yellow-500' :
                  streakData.streakTier === 'dedicated' ? 'text-orange-500' :
                  streakData.streakTier === 'consistent' ? 'text-red-500' :
                  'text-gray-400'
                }`} />
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm rounded-full h-7 w-7 flex items-center justify-center font-bold">
                  {streakData.currentStreak}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">
                    {streakData.currentStreak} Day Streak
                  </h2>
                  <Badge variant="outline" className="bg-gradient-to-r from-orange-500/20 to-red-500/20">
                    {streakData.streakTier.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Personal Best: {streakData.personalBestStreak} • Total: {streakData.totalDays} days
                </div>
              </div>
            </div>
            
            {/* Quality Score Indicator */}
            <div className="text-center">
              <div className="text-2xl font-bold">{streakData.qualityScore}%</div>
              <div className="text-xs text-muted-foreground">Quality Score</div>
            </div>
          </div>

          {/* Motivational Message */}
          <Alert className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <AlertDescription>
              <div className="font-medium">{motivationalMessage.title}</div>
              <div className="text-sm mt-1">{motivationalMessage.message}</div>
            </AlertDescription>
          </Alert>

          {/* Token Balance */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Freeze Tokens</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-5 w-5 rounded-full ${
                          i < streakData.freezeTokens
                            ? 'bg-blue-500'
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Skip a day without losing streak
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Joker Tokens</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-5 w-5 rounded-full ${
                          i < streakData.jokerTokens
                            ? 'bg-purple-500'
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Repair yesterday's miss
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress to Next Tier */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Progress to Next Tier</span>
              <Badge variant="outline">
                {streakData.streakTier === 'champion' ? 'MAX' :
                 streakData.streakTier === 'dedicated' ? '16 days to Champion' :
                 streakData.streakTier === 'consistent' ? '7 days to Dedicated' :
                 '7 days to Consistent'}
              </Badge>
            </div>
            <Progress value={getNextTierProgress()} className="h-2" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button 
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              onClick={() => logActivity({ 
                type: 'workout', 
                duration: 30, 
                quality: 'high' 
              })}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Log Quality Activity
            </Button>
            
            {streakData.jokerTokens > 0 && (
              <Button
                variant="outline"
                onClick={useJokerToken}
                className="border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                <Gift className="h-4 w-4 mr-2" />
                Use Joker
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Minimum Activity Reminder */}
      {showMotivationTip && (
        <Alert className="border-yellow-500">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium">Quality over Quantity!</div>
            <div className="text-sm mt-1">
              To maintain a meaningful streak, log at least {streakData.minimumActivityThreshold} minutes of exercise or a complete meal. 
              This helps build real habits, not just button clicks!
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Streak Society Card (Duolingo-inspired) */}
      {streakData.currentStreak >= 50 && (
        <Card className="border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold">Welcome to the Streak Society!</h3>
                <p className="text-sm text-muted-foreground">
                  You're among the elite with 50+ day streaks. Exclusive challenges and rewards await!
                </p>
              </div>
              <Button size="sm" variant="outline">
                View Perks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Milestones with Icons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-5 w-5" />
            Milestone Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {streakData.milestones.map((milestone) => (
              <div
                key={milestone.days}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  milestone.achieved 
                    ? 'bg-green-50 dark:bg-green-950/20 border border-green-200' 
                    : 'bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{milestone.icon}</div>
                  <div>
                    <div className="font-medium">{milestone.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Day {milestone.days} • {milestone.reward}
                    </div>
                  </div>
                </div>
                {milestone.achieved ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {milestone.days - streakData.currentStreak > 0 
                      ? `${milestone.days - streakData.currentStreak} days away`
                      : 'Ready to unlock!'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Streak Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Longest Ever</div>
              <div className="text-xl font-bold">{streakData.longestStreak} days</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Logged</div>
              <div className="text-xl font-bold">{streakData.totalDays} days</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Quality Days</div>
              <div className="text-xl font-bold">{streakData.totalDays - streakData.hollowDays}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tokens Earned</div>
              <div className="text-xl font-bold">{streakData.freezeTokens + streakData.jokerTokens}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}