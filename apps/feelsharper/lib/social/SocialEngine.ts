/**
 * SocialEngine - Social features and community management
 * Maps to PRD: Social Features & Community Engagement
 */

export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinDate: Date;
  lastActive: Date;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  primaryGoals: string[];
  interests: string[];
  privacy: PrivacySettings;
  stats: UserStats;
  badges: Badge[];
  verificationStatus: 'none' | 'email' | 'verified' | 'coach';
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  workoutVisibility: 'public' | 'friends' | 'private';
  statisticsVisibility: 'public' | 'friends' | 'private';
  allowDirectMessages: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
  shareAchievements: boolean;
}

export interface UserStats {
  totalWorkouts: number;
  totalMealsLogged: number;
  currentStreak: number;
  longestStreak: number;
  joinedChallenges: number;
  challengesWon: number;
  friendsCount: number;
  followersCount: number;
  followingCount: number;
  totalLikes: number;
  totalComments: number;
}

export interface Friendship {
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  initiatedBy: string;
  createdAt: Date;
  acceptedAt?: Date;
  mutualFriends: number;
  sharedInterests: string[];
}

export interface SocialPost {
  postId: string;
  userId: string;
  type: 'workout' | 'achievement' | 'progress' | 'motivation' | 'challenge' | 'meal';
  content: string;
  media?: SocialMedia[];
  workoutData?: any;
  achievementData?: any;
  progressData?: any;
  tags: string[];
  mentions: string[];
  visibility: 'public' | 'friends' | 'private';
  createdAt: Date;
  editedAt?: Date;
  likes: string[]; // user IDs who liked
  comments: Comment[];
  shares: string[]; // user IDs who shared
  impressions: number;
  engagement: number;
}

export interface SocialMedia {
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnailUrl?: string;
  duration?: number; // for videos
  width: number;
  height: number;
  altText?: string;
}

export interface Comment {
  commentId: string;
  userId: string;
  postId: string;
  content: string;
  mentions: string[];
  createdAt: Date;
  editedAt?: Date;
  likes: string[];
  replies: Reply[];
  parentCommentId?: string;
}

export interface Reply {
  replyId: string;
  userId: string;
  commentId: string;
  content: string;
  mentions: string[];
  createdAt: Date;
  editedAt?: Date;
  likes: string[];
}

export interface Challenge {
  challengeId: string;
  creatorId: string;
  title: string;
  description: string;
  type: 'workout_count' | 'streak' | 'distance' | 'weight_loss' | 'strength' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  duration: number; // days
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  entryRequirement?: 'open' | 'invite_only' | 'skill_level';
  rules: string[];
  prizes: Prize[];
  participants: ChallengeParticipant[];
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  visibility: 'public' | 'friends' | 'private';
  tags: string[];
  media?: SocialMedia[];
  leaderboard: LeaderboardEntry[];
  updates: ChallengeUpdate[];
}

export interface Prize {
  rank: number;
  type: 'badge' | 'premium_days' | 'merchandise' | 'custom';
  value: string;
  description: string;
  claimCode?: string;
}

export interface ChallengeParticipant {
  userId: string;
  joinedAt: Date;
  status: 'active' | 'completed' | 'dropped_out';
  progress: any; // Specific to challenge type
  lastUpdate: Date;
  personalGoal?: string;
  motivation?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  score: number;
  progress: any;
  trend: 'up' | 'down' | 'same';
  lastUpdate: Date;
}

export interface ChallengeUpdate {
  updateId: string;
  userId: string;
  type: 'progress' | 'milestone' | 'completion' | 'motivation';
  content: string;
  data?: any;
  createdAt: Date;
  visibility: 'public' | 'participants_only';
}

export interface Badge {
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'workout' | 'nutrition' | 'social' | 'achievement' | 'streak' | 'special';
  criteria: BadgeCriteria;
  earnedAt?: Date;
  progress?: number; // 0-100%
  nextMilestone?: number;
}

export interface BadgeCriteria {
  type: 'workout_count' | 'streak_days' | 'weight_lifted' | 'calories_burned' | 'social_activity' | 'custom';
  target: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  conditions?: any[];
}

export interface Notification {
  notificationId: string;
  userId: string;
  type: 'friend_request' | 'challenge_invite' | 'post_like' | 'comment' | 'mention' | 'achievement' | 'reminder';
  title: string;
  message: string;
  actionUrl?: string;
  fromUserId?: string;
  relatedId?: string; // post ID, challenge ID, etc.
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface SocialActivity {
  activityId: string;
  userId: string;
  type: 'post_created' | 'workout_shared' | 'challenge_joined' | 'achievement_earned' | 'friend_added';
  description: string;
  relatedId?: string;
  visibility: 'public' | 'friends' | 'private';
  createdAt: Date;
}

export class SocialEngine {
  private static instance: SocialEngine;

  private constructor() {}

  static getInstance(): SocialEngine {
    if (!SocialEngine.instance) {
      SocialEngine.instance = new SocialEngine();
    }
    return SocialEngine.instance;
  }

  /**
   * User Profile Management
   */
  async createUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const profile: UserProfile = {
      userId,
      username: data.username || `user_${userId.slice(0, 8)}`,
      displayName: data.displayName || data.username || 'New User',
      avatar: data.avatar,
      bio: data.bio,
      location: data.location,
      joinDate: new Date(),
      lastActive: new Date(),
      fitnessLevel: data.fitnessLevel || 'beginner',
      primaryGoals: data.primaryGoals || [],
      interests: data.interests || [],
      privacy: data.privacy || this.getDefaultPrivacySettings(),
      stats: this.getInitialStats(),
      badges: [],
      verificationStatus: 'none'
    };

    // Save to database
    await this.saveUserProfile(profile);
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getUserProfile(userId);
    if (!profile) throw new Error('User profile not found');

    const updatedProfile = { ...profile, ...updates, lastActive: new Date() };
    await this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // Mock implementation - replace with database query
    return null;
  }

  /**
   * Friend Management
   */
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<Friendship> {
    // Check if friendship already exists
    const existing = await this.getFriendship(fromUserId, toUserId);
    if (existing) {
      throw new Error('Friendship already exists or pending');
    }

    // Check privacy settings
    const toUser = await this.getUserProfile(toUserId);
    if (!toUser?.privacy.allowFriendRequests) {
      throw new Error('User does not accept friend requests');
    }

    const friendship: Friendship = {
      userId: fromUserId,
      friendId: toUserId,
      status: 'pending',
      initiatedBy: fromUserId,
      createdAt: new Date(),
      mutualFriends: await this.countMutualFriends(fromUserId, toUserId),
      sharedInterests: await this.findSharedInterests(fromUserId, toUserId)
    };

    await this.saveFriendship(friendship);
    
    // Send notification
    await this.sendNotification({
      userId: toUserId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${await this.getDisplayName(fromUserId)} sent you a friend request`,
      fromUserId,
      relatedId: friendship.userId,
      priority: 'medium'
    });

    return friendship;
  }

  async acceptFriendRequest(userId: string, friendId: string): Promise<Friendship> {
    const friendship = await this.getFriendship(friendId, userId);
    if (!friendship || friendship.status !== 'pending') {
      throw new Error('No pending friend request found');
    }

    friendship.status = 'accepted';
    friendship.acceptedAt = new Date();

    await this.saveFriendship(friendship);
    
    // Update user stats
    await this.incrementUserStat(userId, 'friendsCount');
    await this.incrementUserStat(friendId, 'friendsCount');

    // Send notification
    await this.sendNotification({
      userId: friendId,
      type: 'friend_request',
      title: 'Friend Request Accepted',
      message: `${await this.getDisplayName(userId)} accepted your friend request`,
      fromUserId: userId,
      priority: 'medium'
    });

    return friendship;
  }

  async getFriends(userId: string, status: 'accepted' | 'pending' = 'accepted'): Promise<UserProfile[]> {
    const friendships = await this.getUserFriendships(userId, status);
    const friendIds = friendships.map(f => f.userId === userId ? f.friendId : f.userId);
    
    const friends = await Promise.all(
      friendIds.map(id => this.getUserProfile(id))
    );

    return friends.filter(Boolean) as UserProfile[];
  }

  /**
   * Social Posts Management
   */
  async createPost(userId: string, postData: Partial<SocialPost>): Promise<SocialPost> {
    const post: SocialPost = {
      postId: this.generateId(),
      userId,
      type: postData.type || 'motivation',
      content: postData.content || '',
      media: postData.media || [],
      workoutData: postData.workoutData,
      achievementData: postData.achievementData,
      progressData: postData.progressData,
      tags: postData.tags || [],
      mentions: this.extractMentions(postData.content || ''),
      visibility: postData.visibility || 'public',
      createdAt: new Date(),
      likes: [],
      comments: [],
      shares: [],
      impressions: 0,
      engagement: 0
    };

    await this.savePost(post);

    // Send notifications for mentions
    await this.notifyMentions(post);

    // Create social activity
    await this.createSocialActivity({
      userId,
      type: 'post_created',
      description: `Posted: ${post.content.slice(0, 50)}...`,
      relatedId: post.postId,
      visibility: post.visibility
    });

    return post;
  }

  async likePost(userId: string, postId: string): Promise<void> {
    const post = await this.getPost(postId);
    if (!post) throw new Error('Post not found');

    if (post.likes.includes(userId)) {
      // Unlike
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      // Like
      post.likes.push(userId);
      
      // Send notification to post owner
      if (post.userId !== userId) {
        await this.sendNotification({
          userId: post.userId,
          type: 'post_like',
          title: 'New Like',
          message: `${await this.getDisplayName(userId)} liked your post`,
          fromUserId: userId,
          relatedId: postId,
          priority: 'low'
        });
      }
    }

    post.engagement = this.calculateEngagement(post);
    await this.savePost(post);
  }

  async commentOnPost(userId: string, postId: string, content: string): Promise<Comment> {
    const post = await this.getPost(postId);
    if (!post) throw new Error('Post not found');

    const comment: Comment = {
      commentId: this.generateId(),
      userId,
      postId,
      content,
      mentions: this.extractMentions(content),
      createdAt: new Date(),
      likes: [],
      replies: []
    };

    post.comments.push(comment);
    post.engagement = this.calculateEngagement(post);
    await this.savePost(post);

    // Send notification to post owner
    if (post.userId !== userId) {
      await this.sendNotification({
        userId: post.userId,
        type: 'comment',
        title: 'New Comment',
        message: `${await this.getDisplayName(userId)} commented on your post`,
        fromUserId: userId,
        relatedId: postId,
        priority: 'medium'
      });
    }

    // Notify mentions
    await this.notifyMentions({ ...post, content });

    return comment;
  }

  async getTimeline(userId: string, page: number = 1, limit: number = 20): Promise<SocialPost[]> {
    const friends = await this.getFriends(userId);
    const friendIds = friends.map(f => f.userId);
    const userIds = [userId, ...friendIds];

    const posts = await this.getPostsByUsers(userIds, page, limit);
    
    // Sort by engagement and recency
    return posts.sort((a, b) => {
      const scoreA = this.calculateTimelineScore(a, userId);
      const scoreB = this.calculateTimelineScore(b, userId);
      return scoreB - scoreA;
    });
  }

  /**
   * Challenge Management
   */
  async createChallenge(creatorId: string, challengeData: Partial<Challenge>): Promise<Challenge> {
    const challenge: Challenge = {
      challengeId: this.generateId(),
      creatorId,
      title: challengeData.title || '',
      description: challengeData.description || '',
      type: challengeData.type || 'custom',
      difficulty: challengeData.difficulty || 'medium',
      duration: challengeData.duration || 30,
      startDate: challengeData.startDate || new Date(),
      endDate: challengeData.endDate || new Date(Date.now() + (challengeData.duration || 30) * 24 * 60 * 60 * 1000),
      maxParticipants: challengeData.maxParticipants,
      entryRequirement: challengeData.entryRequirement || 'open',
      rules: challengeData.rules || [],
      prizes: challengeData.prizes || [],
      participants: [],
      status: 'upcoming',
      visibility: challengeData.visibility || 'public',
      tags: challengeData.tags || [],
      media: challengeData.media || [],
      leaderboard: [],
      updates: []
    };

    await this.saveChallenge(challenge);
    return challenge;
  }

  async joinChallenge(userId: string, challengeId: string, motivation?: string): Promise<void> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    if (challenge.status !== 'upcoming' && challenge.status !== 'active') {
      throw new Error('Challenge is not accepting participants');
    }

    if (challenge.maxParticipants && challenge.participants.length >= challenge.maxParticipants) {
      throw new Error('Challenge is full');
    }

    const participant: ChallengeParticipant = {
      userId,
      joinedAt: new Date(),
      status: 'active',
      progress: this.getInitialProgress(challenge.type),
      lastUpdate: new Date(),
      motivation
    };

    challenge.participants.push(participant);
    await this.saveChallenge(challenge);

    // Update user stats
    await this.incrementUserStat(userId, 'joinedChallenges');

    // Send notification to challenge creator
    await this.sendNotification({
      userId: challenge.creatorId,
      type: 'challenge_invite',
      title: 'New Challenge Participant',
      message: `${await this.getDisplayName(userId)} joined your challenge: ${challenge.title}`,
      fromUserId: userId,
      relatedId: challengeId,
      priority: 'low'
    });
  }

  async updateChallengeProgress(userId: string, challengeId: string, progressData: any): Promise<void> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    const participant = challenge.participants.find(p => p.userId === userId);
    if (!participant) throw new Error('User not participating in challenge');

    participant.progress = { ...participant.progress, ...progressData };
    participant.lastUpdate = new Date();

    // Update leaderboard
    this.updateLeaderboard(challenge, userId);

    await this.saveChallenge(challenge);

    // Create challenge update
    await this.createChallengeUpdate(challenge, userId, 'progress', 'Progress updated', progressData);
  }

  async getChallengeLeaderboard(challengeId: string, limit: number = 50): Promise<LeaderboardEntry[]> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) throw new Error('Challenge not found');

    return challenge.leaderboard.slice(0, limit);
  }

  /**
   * Badge System
   */
  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const userStats = await this.getUserStats(userId);
    const existingBadges = await this.getUserBadges(userId);
    const existingBadgeIds = existingBadges.map(b => b.badgeId);

    const availableBadges = await this.getAvailableBadges();
    const newBadges: Badge[] = [];

    for (const badge of availableBadges) {
      if (existingBadgeIds.includes(badge.badgeId)) continue;

      if (this.checkBadgeCriteria(badge.criteria, userStats)) {
        badge.earnedAt = new Date();
        newBadges.push(badge);
        
        await this.awardBadge(userId, badge);
        
        // Send notification
        await this.sendNotification({
          userId,
          type: 'achievement',
          title: 'Badge Earned!',
          message: `You earned the "${badge.name}" badge!`,
          relatedId: badge.badgeId,
          priority: 'high'
        });
      }
    }

    return newBadges;
  }

  /**
   * Notification Management
   */
  async sendNotification(notification: Omit<Notification, 'notificationId' | 'read' | 'createdAt'>): Promise<void> {
    const fullNotification: Notification = {
      notificationId: this.generateId(),
      read: false,
      createdAt: new Date(),
      ...notification
    };

    await this.saveNotification(fullNotification);
  }

  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const notifications = await this.getUserNotifications(userId);
    
    if (unreadOnly) {
      return notifications.filter(n => !n.read);
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    const notification = await this.getNotification(notificationId);
    if (!notification || notification.userId !== userId) return;

    notification.read = true;
    await this.saveNotification(notification);
  }

  /**
   * Discovery and Recommendations
   */
  async discoverUsers(userId: string, criteria: {
    fitnessLevel?: string;
    goals?: string[];
    location?: string;
    interests?: string[];
  }): Promise<UserProfile[]> {
    const allUsers = await this.getAllUsers();
    const currentUser = await this.getUserProfile(userId);
    if (!currentUser) return [];

    const friends = await this.getFriends(userId);
    const friendIds = friends.map(f => f.userId);

    return allUsers
      .filter(user => user.userId !== userId && !friendIds.includes(user.userId))
      .filter(user => this.matchesCriteria(user, criteria))
      .sort((a, b) => this.calculateCompatibilityScore(currentUser, b) - this.calculateCompatibilityScore(currentUser, a))
      .slice(0, 20);
  }

  async recommendChallenges(userId: string): Promise<Challenge[]> {
    const user = await this.getUserProfile(userId);
    if (!user) return [];

    const allChallenges = await this.getActiveChallenges();
    
    return allChallenges
      .filter(challenge => !challenge.participants.some(p => p.userId === userId))
      .sort((a, b) => this.calculateChallengeRelevance(user, b) - this.calculateChallengeRelevance(user, a))
      .slice(0, 10);
  }

  /**
   * Analytics and Insights
   */
  async getSocialAnalytics(userId: string): Promise<{
    engagement: number;
    reach: number;
    topPosts: SocialPost[];
    friendsGrowth: number[];
    challengePerformance: any;
  }> {
    const posts = await this.getUserPosts(userId);
    const friends = await this.getFriends(userId);
    
    const totalLikes = posts.reduce((sum, post) => sum + post.likes.length, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
    const totalImpressions = posts.reduce((sum, post) => sum + post.impressions, 0);

    const engagement = totalImpressions > 0 ? ((totalLikes + totalComments) / totalImpressions) * 100 : 0;
    
    const topPosts = posts
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);

    return {
      engagement,
      reach: totalImpressions,
      topPosts,
      friendsGrowth: await this.getFriendsGrowthData(userId),
      challengePerformance: await this.getChallengePerformanceData(userId)
    };
  }

  /**
   * Helper Methods
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private getDefaultPrivacySettings(): PrivacySettings {
    return {
      profileVisibility: 'public',
      workoutVisibility: 'friends',
      statisticsVisibility: 'friends',
      allowDirectMessages: true,
      allowFriendRequests: true,
      showOnlineStatus: true,
      shareAchievements: true
    };
  }

  private getInitialStats(): UserStats {
    return {
      totalWorkouts: 0,
      totalMealsLogged: 0,
      currentStreak: 0,
      longestStreak: 0,
      joinedChallenges: 0,
      challengesWon: 0,
      friendsCount: 0,
      followersCount: 0,
      followingCount: 0,
      totalLikes: 0,
      totalComments: 0
    };
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  }

  private calculateEngagement(post: SocialPost): number {
    const likes = post.likes.length;
    const comments = post.comments.length;
    const shares = post.shares.length;
    const impressions = Math.max(post.impressions, 1);
    
    return ((likes + comments * 2 + shares * 3) / impressions) * 100;
  }

  private calculateTimelineScore(post: SocialPost, userId: string): number {
    const recencyScore = this.getRecencyScore(post.createdAt);
    const engagementScore = post.engagement;
    const relevanceScore = this.getRelevanceScore(post, userId);
    
    return (recencyScore * 0.3) + (engagementScore * 0.4) + (relevanceScore * 0.3);
  }

  private getRecencyScore(date: Date): number {
    const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 100 - (hoursAgo * 2)); // Decay over time
  }

  private getRelevanceScore(post: SocialPost, userId: string): number {
    // Mock implementation - would consider user interests, past interactions, etc.
    return 75;
  }

  private updateLeaderboard(challenge: Challenge, userId: string): void {
    const participant = challenge.participants.find(p => p.userId === userId);
    if (!participant) return;

    const score = this.calculateChallengeScore(challenge.type, participant.progress);
    
    let entry = challenge.leaderboard.find(e => e.userId === userId);
    if (entry) {
      const oldRank = entry.rank;
      entry.score = score;
      entry.progress = participant.progress;
      entry.lastUpdate = new Date();
    } else {
      entry = {
        rank: 0, // Will be calculated
        userId,
        score,
        progress: participant.progress,
        trend: 'same',
        lastUpdate: new Date()
      };
      challenge.leaderboard.push(entry);
    }

    // Recalculate rankings
    challenge.leaderboard.sort((a, b) => b.score - a.score);
    challenge.leaderboard.forEach((e, index) => {
      e.rank = index + 1;
    });
  }

  private calculateChallengeScore(type: string, progress: any): number {
    // Mock implementation - would calculate based on challenge type
    switch (type) {
      case 'workout_count':
        return progress.workouts || 0;
      case 'streak':
        return progress.currentStreak || 0;
      case 'distance':
        return progress.totalDistance || 0;
      default:
        return progress.score || 0;
    }
  }

  private checkBadgeCriteria(criteria: BadgeCriteria, stats: UserStats): boolean {
    switch (criteria.type) {
      case 'workout_count':
        return stats.totalWorkouts >= criteria.target;
      case 'streak_days':
        return stats.longestStreak >= criteria.target;
      case 'social_activity':
        return (stats.totalLikes + stats.totalComments) >= criteria.target;
      default:
        return false;
    }
  }

  private calculateCompatibilityScore(user1: UserProfile, user2: UserProfile): number {
    let score = 0;
    
    // Shared interests
    const sharedInterests = user1.interests.filter(i => user2.interests.includes(i));
    score += sharedInterests.length * 10;
    
    // Similar fitness level
    if (user1.fitnessLevel === user2.fitnessLevel) score += 20;
    
    // Shared goals
    const sharedGoals = user1.primaryGoals.filter(g => user2.primaryGoals.includes(g));
    score += sharedGoals.length * 15;
    
    return score;
  }

  private calculateChallengeRelevance(user: UserProfile, challenge: Challenge): number {
    let score = 0;
    
    // Difficulty match
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    const userLevel = difficultyMap[user.fitnessLevel] || 1;
    const challengeLevel = { easy: 1, medium: 2, hard: 3, extreme: 4 }[challenge.difficulty];
    
    if (Math.abs(userLevel - challengeLevel) <= 1) score += 30;
    
    // Interest match
    const matchingTags = challenge.tags.filter(tag => 
      user.interests.some(interest => interest.toLowerCase().includes(tag.toLowerCase()))
    );
    score += matchingTags.length * 10;
    
    return score;
  }

  private matchesCriteria(user: UserProfile, criteria: any): boolean {
    if (criteria.fitnessLevel && user.fitnessLevel !== criteria.fitnessLevel) return false;
    if (criteria.location && user.location !== criteria.location) return false;
    
    if (criteria.goals && criteria.goals.length > 0) {
      const hasMatchingGoal = criteria.goals.some((goal: string) => user.primaryGoals.includes(goal));
      if (!hasMatchingGoal) return false;
    }
    
    if (criteria.interests && criteria.interests.length > 0) {
      const hasMatchingInterest = criteria.interests.some((interest: string) => user.interests.includes(interest));
      if (!hasMatchingInterest) return false;
    }
    
    return true;
  }

  private getInitialProgress(challengeType: string): any {
    switch (challengeType) {
      case 'workout_count':
        return { workouts: 0, target: 30 };
      case 'streak':
        return { currentStreak: 0, maxStreak: 0 };
      case 'distance':
        return { totalDistance: 0, target: 100 };
      default:
        return { score: 0 };
    }
  }

  // Mock database methods - replace with actual implementations
  private async saveUserProfile(profile: UserProfile): Promise<void> {
    console.log('Saving user profile:', profile.userId);
  }

  private async saveFriendship(friendship: Friendship): Promise<void> {
    console.log('Saving friendship:', friendship);
  }

  private async savePost(post: SocialPost): Promise<void> {
    console.log('Saving post:', post.postId);
  }

  private async saveChallenge(challenge: Challenge): Promise<void> {
    console.log('Saving challenge:', challenge.challengeId);
  }

  private async saveNotification(notification: Notification): Promise<void> {
    console.log('Saving notification:', notification.notificationId);
  }

  private async awardBadge(userId: string, badge: Badge): Promise<void> {
    console.log('Awarding badge:', badge.name, 'to user:', userId);
  }

  private async getFriendship(userId: string, friendId: string): Promise<Friendship | null> {
    return null; // Mock
  }

  private async getUserFriendships(userId: string, status: string): Promise<Friendship[]> {
    return []; // Mock
  }

  private async getPost(postId: string): Promise<SocialPost | null> {
    return null; // Mock
  }

  private async getPostsByUsers(userIds: string[], page: number, limit: number): Promise<SocialPost[]> {
    return []; // Mock
  }

  private async getChallenge(challengeId: string): Promise<Challenge | null> {
    return null; // Mock
  }

  private async getNotification(notificationId: string): Promise<Notification | null> {
    return null; // Mock
  }

  private async getUserNotifications(userId: string): Promise<Notification[]> {
    return []; // Mock
  }

  private async getAllUsers(): Promise<UserProfile[]> {
    return []; // Mock
  }

  private async getActiveChallenges(): Promise<Challenge[]> {
    return []; // Mock
  }

  private async getUserPosts(userId: string): Promise<SocialPost[]> {
    return []; // Mock
  }

  private async getUserStats(userId: string): Promise<UserStats> {
    return this.getInitialStats(); // Mock
  }

  private async getUserBadges(userId: string): Promise<Badge[]> {
    return []; // Mock
  }

  private async getAvailableBadges(): Promise<Badge[]> {
    return []; // Mock
  }

  private async incrementUserStat(userId: string, stat: keyof UserStats): Promise<void> {
    console.log('Incrementing stat:', stat, 'for user:', userId);
  }

  private async countMutualFriends(userId1: string, userId2: string): Promise<number> {
    return 0; // Mock
  }

  private async findSharedInterests(userId1: string, userId2: string): Promise<string[]> {
    return []; // Mock
  }

  private async getDisplayName(userId: string): Promise<string> {
    return 'User'; // Mock
  }

  private async notifyMentions(post: SocialPost): Promise<void> {
    // Mock implementation
  }

  private async createSocialActivity(activity: Omit<SocialActivity, 'activityId' | 'createdAt'>): Promise<void> {
    console.log('Creating social activity:', activity);
  }

  private async createChallengeUpdate(challenge: Challenge, userId: string, type: string, content: string, data?: any): Promise<void> {
    console.log('Creating challenge update:', content);
  }

  private async getFriendsGrowthData(userId: string): Promise<number[]> {
    return [0, 5, 12, 18, 25, 30, 35]; // Mock weekly growth
  }

  private async getChallengePerformanceData(userId: string): Promise<any> {
    return { participated: 5, won: 2, completion_rate: 80 }; // Mock
  }
}

// Export singleton instance
export const socialEngine = SocialEngine.getInstance();