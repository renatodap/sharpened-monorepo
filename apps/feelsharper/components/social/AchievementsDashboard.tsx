'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  Trophy, 
  Star, 
  Target,
  Lock,
  Crown,
  Award,
  Zap,
  Heart,
  Users,
  Flame,
  Calendar,
  TrendingUp,
  Sparkles,
  Share2,
  Eye,
  EyeOff
} from 'lucide-react';
import { SocialShareModal } from './SocialShareModal';
import { triggerAchievementNotification } from './AchievementNotification';

interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  points: number;
  earned: boolean;
  earned_at?: string;
  progress: number;
  progress_text: string;
  is_featured: boolean;
}

interface AchievementData {
  badges: Achievement[];
  categorized: Record<string, Achievement[]>;
  earned_count: number;
  total_count: number;
  total_points: number;
}

export function AchievementsDashboard() {
  const [achievementData, setAchievementData] = useState<AchievementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievementData(data);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewAchievements = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_achievements' })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.newly_earned?.length > 0) {
          // Trigger notifications for newly earned badges
          data.newly_earned.forEach((badge: Achievement) => {
            triggerAchievementNotification(badge);
          });
          
          // Refresh achievements data
          fetchAchievements();
        }
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    } finally {
      setChecking(false);
    }
  };

  const featureBadge = async (badgeId: string) => {
    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'feature_badge', 
          badge_id: badgeId 
        })
      });

      if (response.ok) {
        fetchAchievements(); // Refresh to show updated featured status
      }
    } catch (error) {
      console.error('Failed to feature badge:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'consistency': return <Flame className="h-4 w-4" />;
      case 'strength': return <Zap className="h-4 w-4" />;
      case 'endurance': return <Target className="h-4 w-4" />;
      case 'nutrition': return <Heart className="h-4 w-4" />;
      case 'community': return <Users className="h-4 w-4" />;
      case 'milestone': return <Crown className="h-4 w-4" />;
      case 'special': return <Award className="h-4 w-4" />;
      case 'seasonal': return <Calendar className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-yellow-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const categories = achievementData?.categorized ? Object.keys(achievementData.categorized) : [];
  const filteredAchievements = selectedCategory === 'all' 
    ? achievementData?.badges || []
    : achievementData?.categorized[selectedCategory] || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!achievementData) {
    return <div>Failed to load achievements</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Achievements
          </h1>
          <p className="text-muted-foreground">
            Track your progress and unlock rewards for staying consistent
          </p>
        </div>
        <Button 
          onClick={checkForNewAchievements}
          disabled={checking}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
        >
          {checking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Checking...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Check Progress
            </>
          )}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Earned Badges</p>
                <p className="text-3xl font-bold text-green-600">
                  {achievementData.earned_count}
                </p>
                <p className="text-sm text-muted-foreground">
                  of {achievementData.total_count}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {achievementData.total_points}
                </p>
                <p className="text-sm text-muted-foreground">XP earned</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-3xl font-bold text-blue-600">
                  {Math.round((achievementData.earned_count / achievementData.total_count) * 100)}%
                </p>
                <Progress 
                  value={(achievementData.earned_count / achievementData.total_count) * 100}
                  className="mt-2"
                />
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="text-xs capitalize">
              {getCategoryIcon(category)}
              <span className="ml-1 hidden sm:inline">{category}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Achievements Grid */}
        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  achievement.earned 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800' 
                    : 'hover:border-primary/50'
                }`}
              >
                {/* Featured Badge */}
                {achievement.is_featured && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-yellow-500 text-yellow-50">
                      <Crown className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}

                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Badge Icon */}
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-md ${
                        achievement.earned ? '' : 'grayscale opacity-50'
                      }`}
                      style={{ backgroundColor: achievement.color }}
                    >
                      {achievement.earned ? achievement.icon : <Lock className="h-5 w-5" />}
                    </div>

                    {/* Badge Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${achievement.earned ? 'text-green-700 dark:text-green-300' : ''}`}>
                          {achievement.name}
                        </h3>
                        {achievement.earned && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {achievement.points}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {achievement.description}
                      </p>

                      {/* Progress Bar */}
                      {!achievement.earned && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{achievement.progress_text}</span>
                          </div>
                          <Progress 
                            value={achievement.progress} 
                            className="h-2"
                          />
                        </div>
                      )}

                      {/* Earned Info */}
                      {achievement.earned && (
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Earned {new Date(achievement.earned_at!).toLocaleDateString()}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAchievement(achievement);
                                setShowShareModal(true);
                              }}
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => featureBadge(achievement.id)}
                            >
                              {achievement.is_featured ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareType="achievement"
        contentId={selectedAchievement?.id}
        metadata={{ 
          badgeName: selectedAchievement?.name,
          description: selectedAchievement?.description 
        }}
      />
    </div>
  );
}