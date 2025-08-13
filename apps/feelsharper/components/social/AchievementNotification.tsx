'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Trophy, 
  X, 
  Share2,
  Sparkles,
  Crown,
  Star,
  Award,
  Zap,
  Heart,
  Target,
  Flame
} from 'lucide-react';
import { SocialShareModal } from './SocialShareModal';

interface AchievementBadge {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  points: number;
}

interface AchievementNotificationProps {
  badge: AchievementBadge;
  isVisible: boolean;
  onClose: () => void;
  onShare?: () => void;
}

export function AchievementNotification({ 
  badge, 
  isVisible, 
  onClose, 
  onShare 
}: AchievementNotificationProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setAnimate(true);
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleShare = () => {
    setShowShareModal(true);
    onShare?.();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'consistency': return <Flame className="h-4 w-4" />;
      case 'strength': return <Zap className="h-4 w-4" />;
      case 'endurance': return <Target className="h-4 w-4" />;
      case 'nutrition': return <Heart className="h-4 w-4" />;
      case 'community': return <Star className="h-4 w-4" />;
      case 'milestone': return <Crown className="h-4 w-4" />;
      case 'special': return <Award className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'consistency': return 'bg-orange-500';
      case 'strength': return 'bg-red-500';
      case 'endurance': return 'bg-blue-500';
      case 'nutrition': return 'bg-green-500';
      case 'community': return 'bg-purple-500';
      case 'milestone': return 'bg-yellow-500';
      case 'special': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Achievement Notification */}
      <div className={`fixed top-4 right-4 z-50 transform transition-all duration-500 ease-out ${
        animate ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <Card className="w-80 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-800 shadow-xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20"></div>
              <div className="absolute top-0 right-0 transform rotate-12 translate-x-4 -translate-y-2">
                <div className="w-16 h-16 bg-yellow-300/30 rounded-full"></div>
              </div>
              <div className="absolute bottom-0 left-0 transform -rotate-12 -translate-x-2 translate-y-2">
                <div className="w-12 h-12 bg-orange-300/30 rounded-full"></div>
              </div>
              
              {/* Content */}
              <div className="relative p-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-semibold">Achievement Unlocked!</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClose}
                    className="h-6 w-6 p-0 hover:bg-yellow-200/50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Badge Display */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 mb-3">
                {/* Badge Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg ${getCategoryColor(badge.category)}`}
                     style={{ backgroundColor: badge.color }}>
                  {badge.icon}
                </div>
                
                {/* Badge Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Category and Points */}
              <div className="flex items-center justify-between mb-3">
                <Badge 
                  variant="outline" 
                  className="text-xs capitalize"
                  style={{ borderColor: badge.color, color: badge.color }}
                >
                  {getCategoryIcon(badge.category)}
                  <span className="ml-1">{badge.category}</span>
                </Badge>
                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-sm font-semibold">{badge.points} XP</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleShare}
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
                <Button 
                  onClick={handleClose}
                  variant="outline" 
                  size="sm"
                  className="px-3"
                >
                  Nice!
                </Button>
              </div>
            </div>

            {/* Celebration Animation Elements */}
            <div className="absolute top-2 left-2 animate-bounce">
              <Sparkles className="h-3 w-3 text-yellow-400" />
            </div>
            <div className="absolute top-3 right-8 animate-pulse">
              <Star className="h-2 w-2 text-yellow-400 fill-current" />
            </div>
            <div className="absolute bottom-4 right-2 animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Trophy className="h-3 w-3 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareType="achievement"
        contentId={badge.id}
        metadata={{ badgeName: badge.name, description: badge.description }}
      />
    </>
  );
}

interface AchievementNotificationManagerProps {
  children: React.ReactNode;
}

export function AchievementNotificationManager({ children }: AchievementNotificationManagerProps) {
  const [notifications, setNotifications] = useState<AchievementBadge[]>([]);
  const [currentNotification, setCurrentNotification] = useState<AchievementBadge | null>(null);

  // Listen for achievement events
  useEffect(() => {
    const handleAchievementUnlocked = (event: CustomEvent<AchievementBadge>) => {
      setNotifications(prev => [...prev, event.detail]);
    };

    window.addEventListener('achievementUnlocked', handleAchievementUnlocked as EventListener);
    
    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievementUnlocked as EventListener);
    };
  }, []);

  // Show notifications one by one
  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      setCurrentNotification(notifications[0]);
      setNotifications(prev => prev.slice(1));
    }
  }, [notifications, currentNotification]);

  const handleNotificationClose = () => {
    setCurrentNotification(null);
  };

  return (
    <>
      {children}
      {currentNotification && (
        <AchievementNotification
          badge={currentNotification}
          isVisible={!!currentNotification}
          onClose={handleNotificationClose}
        />
      )}
    </>
  );
}

// Utility function to trigger achievement notifications
export function triggerAchievementNotification(badge: AchievementBadge) {
  const event = new CustomEvent('achievementUnlocked', { detail: badge });
  window.dispatchEvent(event);
}