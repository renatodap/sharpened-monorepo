// Gamification System for Builder-Athletes

export interface UserLevel {
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  totalXP: number;
  perks: string[];
  badge: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'fitness' | 'study' | 'consistency' | 'social' | 'milestone';
  progress?: number;
  maxProgress?: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'workout' | 'study' | 'mixed' | 'social';
  requirements: ChallengeRequirement[];
  rewards: Reward[];
  startDate: Date;
  endDate: Date;
  participants?: string[];
  leaderboard?: LeaderboardEntry[];
  completed: boolean;
}

interface ChallengeRequirement {
  type: string;
  target: number;
  current: number;
  unit: string;
}

interface Reward {
  type: 'xp' | 'badge' | 'title' | 'boost' | 'unlock';
  value: any;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
}

export class GamificationSystem {
  // Level progression (exponential curve)
  private readonly levelCurve = {
    base: 100,
    multiplier: 1.5,
    maxLevel: 100,
  };

  // Level titles for builder-athletes
  private readonly levelTitles: Record<number, string> = {
    1: 'Novice',
    5: 'Apprentice',
    10: 'Practitioner',
    15: 'Dedicated',
    20: 'Committed',
    25: 'Warrior',
    30: 'Elite',
    35: 'Master',
    40: 'Champion',
    45: 'Legend',
    50: 'Titan',
    60: 'Olympian',
    70: 'Demigod',
    80: 'Immortal',
    90: 'Transcendent',
    100: 'Peak Human',
  };

  // XP rewards for different activities
  private readonly xpRewards = {
    // Workout activities
    workout_completed: 50,
    exercise_perfect_form: 10,
    new_pr: 100,
    workout_streak_day: 20,
    
    // Study activities
    study_session_completed: 40,
    pomodoro_completed: 15,
    focus_hour: 25,
    study_streak_day: 20,
    
    // Mixed activities
    morning_workout_before_study: 75,
    balanced_day: 100, // Both workout and study
    
    // Social activities
    challenge_completed: 150,
    challenge_won: 300,
    friend_encouraged: 25,
    group_workout: 75,
    
    // Milestones
    first_workout: 200,
    first_study_session: 200,
    week_streak: 500,
    month_streak: 2000,
  };

  // Achievement definitions
  private achievements: Achievement[] = [
    // Fitness achievements
    {
      id: 'iron_will',
      name: 'Iron Will',
      description: 'Complete 100 workouts',
      icon: '💪',
      xpReward: 1000,
      rarity: 'epic',
      category: 'fitness',
      maxProgress: 100,
      progress: 0,
      unlocked: false,
    },
    {
      id: 'morning_warrior',
      name: 'Morning Warrior',
      description: 'Complete 30 morning workouts before 8 AM',
      icon: '🌅',
      xpReward: 750,
      rarity: 'rare',
      category: 'fitness',
      maxProgress: 30,
      progress: 0,
      unlocked: false,
    },
    
    // Study achievements
    {
      id: 'focus_master',
      name: 'Focus Master',
      description: 'Maintain 90%+ focus for 10 study sessions',
      icon: '🧠',
      xpReward: 800,
      rarity: 'rare',
      category: 'study',
      maxProgress: 10,
      progress: 0,
      unlocked: false,
    },
    {
      id: 'knowledge_seeker',
      name: 'Knowledge Seeker',
      description: 'Study for 100 hours total',
      icon: '📚',
      xpReward: 1000,
      rarity: 'epic',
      category: 'study',
      maxProgress: 100,
      progress: 0,
      unlocked: false,
    },
    
    // Consistency achievements
    {
      id: 'unstoppable',
      name: 'Unstoppable',
      description: '30-day streak of daily activity',
      icon: '🔥',
      xpReward: 2000,
      rarity: 'legendary',
      category: 'consistency',
      maxProgress: 30,
      progress: 0,
      unlocked: false,
    },
    {
      id: 'balanced_life',
      name: 'Perfectly Balanced',
      description: 'Complete both workout and study for 7 days straight',
      icon: '⚖️',
      xpReward: 500,
      rarity: 'rare',
      category: 'consistency',
      maxProgress: 7,
      progress: 0,
      unlocked: false,
    },
    
    // Social achievements
    {
      id: 'motivator',
      name: 'Motivator',
      description: 'Encourage 50 friends',
      icon: '📣',
      xpReward: 600,
      rarity: 'rare',
      category: 'social',
      maxProgress: 50,
      progress: 0,
      unlocked: false,
    },
    {
      id: 'competitor',
      name: 'Fierce Competitor',
      description: 'Win 10 challenges',
      icon: '🏆',
      xpReward: 1500,
      rarity: 'epic',
      category: 'social',
      maxProgress: 10,
      progress: 0,
      unlocked: false,
    },
  ];

  // Calculate level from total XP
  calculateLevel(totalXP: number): UserLevel {
    let level = 1;
    let xpForCurrentLevel = 0;
    let xpForNextLevel = this.levelCurve.base;

    while (totalXP >= xpForNextLevel && level < this.levelCurve.maxLevel) {
      level++;
      xpForCurrentLevel = xpForNextLevel;
      xpForNextLevel = Math.floor(
        this.levelCurve.base * Math.pow(this.levelCurve.multiplier, level - 1)
      );
    }

    const xpInCurrentLevel = totalXP - xpForCurrentLevel;
    const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;

    // Find appropriate title
    let title = this.levelTitles[1];
    for (const [lvl, t] of Object.entries(this.levelTitles)) {
      if (level >= parseInt(lvl)) {
        title = t;
      }
    }

    // Generate perks based on level
    const perks = this.getLevelPerks(level);

    return {
      level,
      title,
      xp: xpInCurrentLevel,
      xpToNext: xpNeededForNext - xpInCurrentLevel,
      totalXP,
      perks,
      badge: this.getLevelBadge(level),
    };
  }

  // Get perks for a level
  private getLevelPerks(level: number): string[] {
    const perks: string[] = [];

    if (level >= 5) perks.push('Custom workout plans');
    if (level >= 10) perks.push('Advanced analytics');
    if (level >= 15) perks.push('Priority challenge access');
    if (level >= 20) perks.push('Exclusive badges');
    if (level >= 25) perks.push('Mentor status');
    if (level >= 30) perks.push('Beta features');
    if (level >= 40) perks.push('Custom themes');
    if (level >= 50) perks.push('VIP support');

    return perks;
  }

  // Get badge emoji for level
  private getLevelBadge(level: number): string {
    if (level >= 90) return '👑';
    if (level >= 70) return '🏅';
    if (level >= 50) return '🥇';
    if (level >= 30) return '🥈';
    if (level >= 20) return '🥉';
    if (level >= 10) return '🎖️';
    return '🎯';
  }

  // Award XP for an activity
  awardXP(activity: string, multiplier = 1): number {
    const baseXP = this.xpRewards[activity as keyof typeof this.xpRewards] || 10;
    const xpAwarded = Math.floor(baseXP * multiplier);
    
    // Trigger celebration
    this.celebrate(xpAwarded);
    
    return xpAwarded;
  }

  // Check and unlock achievements
  checkAchievements(userStats: any): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.achievements) {
      if (achievement.unlocked) continue;

      // Check if achievement should be unlocked
      let shouldUnlock = false;

      switch (achievement.id) {
        case 'iron_will':
          if (userStats.totalWorkouts >= 100) shouldUnlock = true;
          achievement.progress = userStats.totalWorkouts;
          break;
          
        case 'morning_warrior':
          if (userStats.morningWorkouts >= 30) shouldUnlock = true;
          achievement.progress = userStats.morningWorkouts;
          break;
          
        case 'focus_master':
          if (userStats.highFocusSessions >= 10) shouldUnlock = true;
          achievement.progress = userStats.highFocusSessions;
          break;
          
        case 'knowledge_seeker':
          if (userStats.totalStudyHours >= 100) shouldUnlock = true;
          achievement.progress = userStats.totalStudyHours;
          break;
          
        case 'unstoppable':
          if (userStats.currentStreak >= 30) shouldUnlock = true;
          achievement.progress = userStats.currentStreak;
          break;
          
        case 'balanced_life':
          if (userStats.balancedDayStreak >= 7) shouldUnlock = true;
          achievement.progress = userStats.balancedDayStreak;
          break;
          
        case 'motivator':
          if (userStats.friendsEncouraged >= 50) shouldUnlock = true;
          achievement.progress = userStats.friendsEncouraged;
          break;
          
        case 'competitor':
          if (userStats.challengesWon >= 10) shouldUnlock = true;
          achievement.progress = userStats.challengesWon;
          break;
      }

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        newlyUnlocked.push(achievement);
        this.celebrateAchievement(achievement);
      }
    }

    return newlyUnlocked;
  }

  // Create a new challenge
  createChallenge(
    type: Challenge['type'],
    category: Challenge['category'],
    duration?: number
  ): Challenge {
    const now = new Date();
    let endDate = new Date();
    
    switch (type) {
      case 'daily':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      default:
        endDate.setDate(endDate.getDate() + (duration || 7));
    }

    // Generate challenge based on category
    let challenge: Challenge = {
      id: `challenge_${Date.now()}`,
      name: '',
      description: '',
      type,
      category,
      requirements: [],
      rewards: [],
      startDate: now,
      endDate,
      completed: false,
    };

    switch (category) {
      case 'workout':
        challenge.name = 'Iron Challenge';
        challenge.description = 'Complete intense workouts this week';
        challenge.requirements = [
          { type: 'workouts', target: 5, current: 0, unit: 'sessions' },
          { type: 'volume', target: 10000, current: 0, unit: 'kg' },
        ];
        challenge.rewards = [
          { type: 'xp', value: 500 },
          { type: 'badge', value: 'iron_warrior' },
        ];
        break;
        
      case 'study':
        challenge.name = 'Focus Marathon';
        challenge.description = 'Maintain deep focus throughout the week';
        challenge.requirements = [
          { type: 'study_hours', target: 20, current: 0, unit: 'hours' },
          { type: 'focus_score', target: 80, current: 0, unit: '%' },
        ];
        challenge.rewards = [
          { type: 'xp', value: 400 },
          { type: 'title', value: 'Focus Master' },
        ];
        break;
        
      case 'mixed':
        challenge.name = 'Builder-Athlete Supreme';
        challenge.description = 'Excel in both body and mind';
        challenge.requirements = [
          { type: 'workouts', target: 3, current: 0, unit: 'sessions' },
          { type: 'study_hours', target: 15, current: 0, unit: 'hours' },
          { type: 'balanced_days', target: 5, current: 0, unit: 'days' },
        ];
        challenge.rewards = [
          { type: 'xp', value: 750 },
          { type: 'badge', value: 'balanced_warrior' },
          { type: 'boost', value: { type: 'xp_multiplier', duration: 7, multiplier: 1.5 } },
        ];
        break;
        
      case 'social':
        challenge.name = 'Team Power';
        challenge.description = 'Compete with friends for the top spot';
        challenge.requirements = [
          { type: 'combined_xp', target: 2000, current: 0, unit: 'XP' },
        ];
        challenge.rewards = [
          { type: 'xp', value: 1000 },
          { type: 'badge', value: 'team_player' },
        ];
        challenge.leaderboard = [];
        break;
    }

    return challenge;
  }

  // Celebration effects
  private celebrate(xpAmount: number): void {
    // Trigger visual celebration
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('celebration', {
        detail: {
          type: 'xp',
          amount: xpAmount,
        },
      }));
    }
  }

  private celebrateAchievement(achievement: Achievement): void {
    // Trigger achievement celebration
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('achievement-unlocked', {
        detail: achievement,
      }));
    }
  }

  // Get all achievements
  getAchievements(): Achievement[] {
    return this.achievements;
  }

  // Get progress towards next achievement
  getNextAchievements(limit = 3): Achievement[] {
    return this.achievements
      .filter(a => !a.unlocked && a.progress && a.maxProgress)
      .sort((a, b) => {
        const aProgress = (a.progress! / a.maxProgress!) || 0;
        const bProgress = (b.progress! / b.maxProgress!) || 0;
        return bProgress - aProgress;
      })
      .slice(0, limit);
  }

  // Calculate daily bonus XP
  calculateDailyBonus(streakDays: number): number {
    const baseBonus = 50;
    const streakMultiplier = Math.min(streakDays * 0.1, 2); // Max 2x at 20 days
    return Math.floor(baseBonus * (1 + streakMultiplier));
  }

  // Get motivational message based on progress
  getMotivationalMessage(level: UserLevel, recentActivity: string): string {
    const messages = {
      lowLevel: [
        "Every champion started as a beginner. Keep pushing!",
        "Small steps lead to giant leaps. You've got this!",
        "Building habits, building greatness!",
      ],
      midLevel: [
        "You're on fire! Keep that momentum going!",
        "Consistency is your superpower!",
        "The grind is real, and so is your progress!",
      ],
      highLevel: [
        "You're inspiring others with your dedication!",
        "Elite performance is your new normal!",
        "Legendary status incoming!",
      ],
    };

    let messagePool = messages.lowLevel;
    if (level.level >= 30) messagePool = messages.highLevel;
    else if (level.level >= 10) messagePool = messages.midLevel;

    return messagePool[Math.floor(Math.random() * messagePool.length)];
  }
}

// Export singleton instance
export const gamification = new GamificationSystem();