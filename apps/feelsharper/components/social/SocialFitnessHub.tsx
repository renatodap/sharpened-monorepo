'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  Trophy,
  Medal,
  Crown,
  Star,
  Flame,
  Target,
  Share2,
  MessageCircle,
  Heart,
  TrendingUp,
  Calendar,
  Zap,
  Award,
  Plus,
  UserPlus,
  Settings,
  MoreHorizontal,
  CheckCircle,
  Camera,
  Image,
  Send,
  ThumbsUp,
  Bookmark,
  Flag,
  MapPin,
  Clock
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'strength' | 'cardio' | 'consistency' | 'nutrition' | 'social' | 'milestone';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlocked_at?: string;
  progress: number;
  total_required: number;
  reward_points: number;
  badge_color: string;
}

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  level: number;
  total_points: number;
  achievements_count: number;
  current_streak: number;
  location?: string;
  bio?: string;
  following: boolean;
  follower_count: number;
  following_count: number;
}

interface SocialPost {
  id: string;
  user: User;
  type: 'workout' | 'achievement' | 'progress' | 'motivation' | 'photo';
  content: string;
  image_url?: string;
  workout_data?: {
    name: string;
    duration: number;
    calories: number;
    exercises: string[];
  };
  achievement_data?: Achievement;
  created_at: string;
  likes: number;
  comments: number;
  liked_by_user: boolean;
  bookmarked_by_user: boolean;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  category: 'individual' | 'team' | 'community';
  duration_days: number;
  start_date: string;
  end_date: string;
  participants: number;
  target_value: number;
  target_unit: string;
  prize_description: string;
  user_progress: number;
  user_rank: number;
  is_participating: boolean;
}

export default function SocialFitnessHub() {
  const [activeTab, setActiveTab] = useState<'feed' | 'achievements' | 'challenges' | 'leaderboard'>('feed');
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSocialData();
  }, []);

  const loadSocialData = async () => {
    setIsLoading(true);
    
    // Simulate loading social data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockPosts: SocialPost[] = [
      {
        id: '1',
        user: {
          id: '1',
          username: '@fitnessjunkie',
          display_name: 'Alex Chen',
          avatar_url: '',
          level: 12,
          total_points: 2450,
          achievements_count: 18,
          current_streak: 15,
          location: 'San Francisco, CA',
          following: true,
          follower_count: 234,
          following_count: 189
        },
        type: 'achievement',
        content: 'Just unlocked the "Iron Will" achievement! 💪 30 days of consistent workouts!',
        achievement_data: {
          id: 'iron_will',
          name: 'Iron Will',
          description: 'Complete 30 consecutive workout days',
          icon: '🔥',
          category: 'consistency',
          rarity: 'epic',
          unlocked: true,
          unlocked_at: '2024-01-13',
          progress: 30,
          total_required: 30,
          reward_points: 500,
          badge_color: '#FF6B35'
        },
        created_at: '2024-01-13T14:30:00Z',
        likes: 42,
        comments: 8,
        liked_by_user: false,
        bookmarked_by_user: false
      },
      {
        id: '2',
        user: {
          id: '2',
          username: '@strengthseeker',
          display_name: 'Maria Rodriguez',
          avatar_url: '',
          level: 8,
          total_points: 1890,
          achievements_count: 12,
          current_streak: 7,
          location: 'Austin, TX',
          following: false,
          follower_count: 156,
          following_count: 98
        },
        type: 'workout',
        content: 'Crushed my deadlift PR today! 🎯 The progressive overload is really working.',
        workout_data: {
          name: 'Strength Training - Lower Body',
          duration: 75,
          calories: 320,
          exercises: ['Deadlifts', 'Squats', 'Hip Thrusts', 'Calf Raises']
        },
        created_at: '2024-01-13T10:15:00Z',
        likes: 28,
        comments: 5,
        liked_by_user: true,
        bookmarked_by_user: true
      },
      {
        id: '3',
        user: {
          id: '3',
          username: '@cardioking',
          display_name: 'David Kim',
          avatar_url: '',
          level: 15,
          total_points: 3200,
          achievements_count: 25,
          current_streak: 45,
          location: 'Seattle, WA',
          following: true,
          follower_count: 567,
          following_count: 203
        },
        type: 'progress',
        content: 'Month 3 transformation update! Down 12lbs and feeling stronger than ever. The journey continues! 🚀',
        image_url: 'progress_photo.jpg',
        created_at: '2024-01-13T08:45:00Z',
        likes: 156,
        comments: 23,
        liked_by_user: true,
        bookmarked_by_user: false
      }
    ];

    const mockAchievements: Achievement[] = [
      {
        id: 'first_workout',
        name: 'First Steps',
        description: 'Complete your first workout',
        icon: '🎯',
        category: 'milestone',
        rarity: 'common',
        unlocked: true,
        unlocked_at: '2024-01-01',
        progress: 1,
        total_required: 1,
        reward_points: 50,
        badge_color: '#10B981'
      },
      {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: 'Complete 7 workouts in a week',
        icon: '⚡',
        category: 'consistency',
        rarity: 'rare',
        unlocked: true,
        unlocked_at: '2024-01-08',
        progress: 7,
        total_required: 7,
        reward_points: 200,
        badge_color: '#3B82F6'
      },
      {
        id: 'iron_will',
        name: 'Iron Will',
        description: 'Complete 30 consecutive workout days',
        icon: '🔥',
        category: 'consistency',
        rarity: 'epic',
        unlocked: true,
        unlocked_at: '2024-01-13',
        progress: 30,
        total_required: 30,
        reward_points: 500,
        badge_color: '#FF6B35'
      },
      {
        id: 'strength_master',
        name: 'Strength Master',
        description: 'Deadlift 2x your body weight',
        icon: '💪',
        category: 'strength',
        rarity: 'legendary',
        unlocked: false,
        progress: 1.7,
        total_required: 2.0,
        reward_points: 1000,
        badge_color: '#F59E0B'
      },
      {
        id: 'nutrition_ninja',
        name: 'Nutrition Ninja',
        description: 'Log food for 30 consecutive days',
        icon: '🥗',
        category: 'nutrition',
        rarity: 'epic',
        unlocked: false,
        progress: 18,
        total_required: 30,
        reward_points: 400,
        badge_color: '#8B5CF6'
      },
      {
        id: 'social_butterfly',
        name: 'Social Butterfly',
        description: 'Get 100 likes on your posts',
        icon: '🦋',
        category: 'social',
        rarity: 'rare',
        unlocked: false,
        progress: 67,
        total_required: 100,
        reward_points: 300,
        badge_color: '#EC4899'
      }
    ];

    const mockChallenges: Challenge[] = [
      {
        id: '1',
        name: 'January Burn Challenge',
        description: 'Burn 10,000 calories this month through exercise',
        category: 'community',
        duration_days: 31,
        start_date: '2024-01-01',
        end_date: '2024-01-31',
        participants: 1247,
        target_value: 10000,
        target_unit: 'calories',
        prize_description: 'Premium app features for 3 months + exclusive badge',
        user_progress: 4650,
        user_rank: 234,
        is_participating: true
      },
      {
        id: '2',
        name: 'Squat Squad',
        description: 'Complete 1000 squats this week with your team',
        category: 'team',
        duration_days: 7,
        start_date: '2024-01-08',
        end_date: '2024-01-14',
        participants: 8,
        target_value: 1000,
        target_unit: 'reps',
        prize_description: 'Team trophy + bragging rights',
        user_progress: 350,
        user_rank: 2,
        is_participating: true
      },
      {
        id: '3',
        name: 'Mindful March',
        description: 'Meditate for 21 days to build the habit',
        category: 'individual',
        duration_days: 21,
        start_date: '2024-03-01',
        end_date: '2024-03-21',
        participants: 0,
        target_value: 21,
        target_unit: 'sessions',
        prize_description: 'Meditation achievement badge + guided session unlock',
        user_progress: 0,
        user_rank: 0,
        is_participating: false
      }
    ];

    const mockLeaderboard: User[] = [
      {
        id: '1',
        username: '@cardioking',
        display_name: 'David Kim',
        avatar_url: '',
        level: 15,
        total_points: 3200,
        achievements_count: 25,
        current_streak: 45,
        location: 'Seattle, WA',
        following: true,
        follower_count: 567,
        following_count: 203
      },
      {
        id: '2',
        username: '@strengthqueen',
        display_name: 'Sarah Johnson',
        avatar_url: '',
        level: 14,
        total_points: 2950,
        achievements_count: 22,
        current_streak: 32,
        location: 'Denver, CO',
        following: false,
        follower_count: 423,
        following_count: 156
      },
      {
        id: '3',
        username: '@fitnessjunkie',
        display_name: 'Alex Chen',
        avatar_url: '',
        level: 12,
        total_points: 2450,
        achievements_count: 18,
        current_streak: 15,
        location: 'San Francisco, CA',
        following: true,
        follower_count: 234,
        following_count: 189
      }
    ];

    setSocialPosts(mockPosts);
    setAchievements(mockAchievements);
    setChallenges(mockChallenges);
    setLeaderboard(mockLeaderboard);
    setIsLoading(false);
  };

  const likePost = (postId: string) => {
    setSocialPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? {
              ...post,
              liked_by_user: !post.liked_by_user,
              likes: post.liked_by_user ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    );
  };

  const bookmarkPost = (postId: string) => {
    setSocialPosts(posts =>
      posts.map(post =>
        post.id === postId
          ? { ...post, bookmarked_by_user: !post.bookmarked_by_user }
          : post
      )
    );
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'legendary': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Loading Social Hub</h3>
            <p className="text-text-secondary">Connecting you with the fitness community...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Social Fitness Hub</h1>
          <p className="text-text-secondary">Connect, compete, and celebrate together</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Find Friends
          </Button>
          <Button className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Share Progress
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['feed', 'achievements', 'challenges', 'leaderboard'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab === 'feed' && <MessageCircle className="w-4 h-4 mr-2" />}
            {tab === 'achievements' && <Trophy className="w-4 h-4 mr-2" />}
            {tab === 'challenges' && <Target className="w-4 h-4 mr-2" />}
            {tab === 'leaderboard' && <Crown className="w-4 h-4 mr-2" />}
            {tab}
          </Button>
        ))}
      </div>

      {/* Content Based on Active Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Create Post */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 space-y-3">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share your fitness journey..."
                    className="w-full bg-surface border border-border rounded-lg p-3 text-white resize-none h-20"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Image className="w-4 h-4" alt="Photo" />
                        Photo
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Achievement
                      </Button>
                    </div>
                    <Button size="sm" className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Posts */}
          <div className="space-y-4">
            {socialPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{post.user.display_name}</span>
                          <span className="text-text-secondary text-sm">{post.user.username}</span>
                          <Badge variant="outline" className="text-xs">
                            Level {post.user.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(post.created_at)}
                          {post.user.location && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              {post.user.location}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-4">
                    <p className="text-white">{post.content}</p>

                    {/* Achievement Display */}
                    {post.type === 'achievement' && post.achievement_data && (
                      <div className={`p-4 rounded-lg border-2 ${getRarityColor(post.achievement_data.rarity)}`}>
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{post.achievement_data.icon}</div>
                          <div>
                            <h4 className="font-semibold text-white">{post.achievement_data.name}</h4>
                            <p className="text-sm text-text-secondary">{post.achievement_data.description}</p>
                            <Badge className="mt-1 capitalize">{post.achievement_data.rarity}</Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Workout Display */}
                    {post.type === 'workout' && post.workout_data && (
                      <div className="p-4 bg-surface rounded-lg">
                        <h4 className="font-semibold text-white mb-2">{post.workout_data.name}</h4>
                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                          <div>
                            <div className="text-lg font-bold text-navy">{post.workout_data.duration}</div>
                            <div className="text-text-secondary">minutes</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-success">{post.workout_data.calories}</div>
                            <div className="text-text-secondary">calories</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-warning">{post.workout_data.exercises.length}</div>
                            <div className="text-text-secondary">exercises</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Progress Photo */}
                    {post.type === 'progress' && post.image_url && (
                      <div className="bg-surface rounded-lg p-4 text-center">
                        <Image className="w-12 h-12 mx-auto mb-2 text-text-secondary" alt="Upload" />
                        <p className="text-text-secondary">Progress photo would display here</p>
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                    <div className="flex gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likePost(post.id)}
                        className={`flex items-center gap-2 ${post.liked_by_user ? 'text-red-400' : ''}`}
                      >
                        <Heart className={`w-4 h-4 ${post.liked_by_user ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => bookmarkPost(post.id)}
                      className={post.bookmarked_by_user ? 'text-yellow-400' : ''}
                    >
                      <Bookmark className={`w-4 h-4 ${post.bookmarked_by_user ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Achievement Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{achievements.filter(a => a.unlocked).length}</div>
                <div className="text-sm text-text-secondary">Unlocked</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-navy">{achievements.reduce((sum, a) => sum + (a.unlocked ? a.reward_points : 0), 0)}</div>
                <div className="text-sm text-text-secondary">Total Points</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">{achievements.filter(a => a.rarity === 'epic' && a.unlocked).length}</div>
                <div className="text-sm text-text-secondary">Epic Badges</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{achievements.filter(a => a.rarity === 'legendary' && a.unlocked).length}</div>
                <div className="text-sm text-text-secondary">Legendary</div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`${achievement.unlocked ? '' : 'opacity-60'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`text-4xl p-3 rounded-lg ${achievement.unlocked ? 'bg-surface' : 'bg-gray-700'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{achievement.name}</h3>
                      <p className="text-sm text-text-secondary mb-2">{achievement.description}</p>
                      <div className="flex gap-2">
                        <Badge className={`capitalize ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="outline">
                          {achievement.reward_points} pts
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {achievement.unlocked ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Unlocked {achievement.unlocked_at && new Date(achievement.unlocked_at).toLocaleDateString()}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Progress</span>
                        <span className="text-white">
                          {typeof achievement.progress === 'number' 
                            ? Math.floor(achievement.progress * 100) / 100 
                            : achievement.progress
                          } / {achievement.total_required}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-navy h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min((achievement.progress / achievement.total_required) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {challenges.map((challenge) => (
            <Card key={challenge.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{challenge.name}</h3>
                    <p className="text-text-secondary">{challenge.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="capitalize">
                      {challenge.category}
                    </Badge>
                    {challenge.is_participating && (
                      <Badge className="bg-success/20 text-success">
                        Participating
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{challenge.participants.toLocaleString()}</div>
                      <div className="text-xs text-text-secondary">Participants</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-navy">{challenge.duration_days}</div>
                      <div className="text-xs text-text-secondary">Days</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-success">{challenge.user_progress.toLocaleString()}</div>
                      <div className="text-xs text-text-secondary">Your Progress</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-warning">#{challenge.user_rank || 'N/A'}</div>
                      <div className="text-xs text-text-secondary">Your Rank</div>
                    </div>
                  </div>

                  {challenge.is_participating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-text-secondary">Progress to Goal</span>
                        <span className="text-white">
                          {challenge.user_progress} / {challenge.target_value.toLocaleString()} {challenge.target_unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-navy h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min((challenge.user_progress / challenge.target_value) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-sm text-text-secondary">Prize: </span>
                      <span className="text-sm text-white">{challenge.prize_description}</span>
                    </div>
                    {!challenge.is_participating ? (
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Join Challenge
                      </Button>
                    ) : (
                      <Button variant="outline">
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {leaderboard.map((user, index) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {index === 0 && <Crown className="w-6 h-6 text-yellow-400" />}
                        {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                        {index === 2 && <Medal className="w-6 h-6 text-yellow-600" />}
                        {index > 2 && (
                          <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      
                      <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{user.display_name}</span>
                          <span className="text-text-secondary text-sm">{user.username}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span>Level {user.level}</span>
                          <span>•</span>
                          <span>{user.achievements_count} achievements</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-400" />
                            {user.current_streak} days
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-white">{user.total_points.toLocaleString()}</div>
                        <div className="text-xs text-text-secondary">Points</div>
                      </div>
                      {!user.following ? (
                        <Button size="sm" className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm">
                          Following
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}