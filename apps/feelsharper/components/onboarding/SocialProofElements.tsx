"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  Star,
  TrendingUp,
  Trophy,
  Zap,
  CheckCircle2,
  Timer,
  Target,
  Heart,
  MessageSquare,
  Award,
  Activity,
  Flame
} from 'lucide-react';

interface LiveStats {
  todayJoined: number;
  weeklyActiveUsers: number;
  totalWorkouts: number;
  avgRating: number;
  successRate: number;
}

interface Achievement {
  id: string;
  user: string;
  action: string;
  timeAgo: string;
  type: 'workout' | 'weight_loss' | 'streak' | 'goal';
  icon: any;
  color: string;
}

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  quote: string;
  achievement: string;
  rating: number;
  timeframe: string;
}

export function LiveUserCounter() {
  const [stats, setStats] = useState<LiveStats>({
    todayJoined: 247,
    weeklyActiveUsers: 12847,
    totalWorkouts: 2487391,
    avgRating: 4.9,
    successRate: 89
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        todayJoined: prev.todayJoined + Math.floor(Math.random() * 3),
        totalWorkouts: prev.totalWorkouts + Math.floor(Math.random() * 15),
      }));
    }, 30000); // Update every 30 seconds

    // Show component after brief delay
    setTimeout(() => setIsVisible(true), 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-bold text-slate-800">
                  {stats.todayJoined}
                </span>
              </div>
              <span className="text-xs text-slate-600">joined today</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <Users className="w-3 h-3 text-blue-600" />
                <span className="text-lg font-bold text-slate-800">
                  {stats.weeklyActiveUsers.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-slate-600">active this week</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <Trophy className="w-3 h-3 text-yellow-600" />
                <span className="text-lg font-bold text-slate-800">
                  {stats.successRate}%
                </span>
              </div>
              <span className="text-xs text-slate-600">reach goals</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-lg font-bold text-slate-800">
                  {stats.avgRating}
                </span>
              </div>
              <span className="text-xs text-slate-600">user rating</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RecentAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      user: 'Sarah M.',
      action: 'completed her first 5K run',
      timeAgo: '2 minutes ago',
      type: 'workout',
      icon: Target,
      color: 'text-green-600'
    },
    {
      id: '2',
      user: 'Mike D.',
      action: 'lost 10 lbs this month',
      timeAgo: '5 minutes ago',
      type: 'weight_loss',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      id: '3',
      user: 'Jenny K.',
      action: 'hit a 30-day workout streak',
      timeAgo: '8 minutes ago',
      type: 'streak',
      icon: Flame,
      color: 'text-orange-600'
    },
    {
      id: '4',
      user: 'Alex R.',
      action: 'reached their muscle gain goal',
      timeAgo: '12 minutes ago',
      type: 'goal',
      icon: Award,
      color: 'text-purple-600'
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % achievements.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [achievements.length]);

  return (
    <div className="h-16 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-slate-200"
        >
          <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center`}>
            {React.createElement(achievements[currentIndex].icon, { 
              className: `w-4 h-4 ${achievements[currentIndex].color}` 
            })}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">
              <span className="font-semibold">{achievements[currentIndex].user}</span>{' '}
              {achievements[currentIndex].action}
            </p>
            <p className="text-xs text-slate-500">{achievements[currentIndex].timeAgo}</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function TestimonialCarousel() {
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Emma Thompson',
      avatar: '👩‍💼',
      quote: "The AI coach feels like having a personal trainer who knows exactly what I need. Lost 15 lbs in 2 months!",
      achievement: 'Lost 15 lbs',
      rating: 5,
      timeframe: '2 months'
    },
    {
      id: '2',
      name: 'James Rodriguez',
      avatar: '👨‍💻',
      quote: "Finally found an app that works with my busy schedule. The quick logging saves me so much time.",
      achievement: '90-day streak',
      rating: 5,
      timeframe: '3 months'
    },
    {
      id: '3',
      name: 'Lisa Chen',
      avatar: '👩‍🎓',
      quote: "The insights are incredible. I can see exactly how my workouts impact my progress week by week.",
      achievement: '+12 lb muscle gain',
      rating: 5,
      timeframe: '4 months'
    },
    {
      id: '4',
      name: 'David Park',
      avatar: '👨‍🚀',
      quote: "From couch to 10K in 3 months. The progression was perfect and I never felt overwhelmed.",
      achievement: 'Ran first 10K',
      rating: 5,
      timeframe: '3 months'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="font-bold text-slate-800 mb-2">What our community says</h3>
          <div className="flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="text-4xl mb-4">{testimonials[currentIndex].avatar}</div>
            
            <blockquote className="text-slate-700 mb-4 italic leading-relaxed">
              "{testimonials[currentIndex].quote}"
            </blockquote>

            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="flex">
                {Array.from({ length: testimonials[currentIndex].rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {testimonials[currentIndex].achievement}
              </Badge>
            </div>

            <div className="text-sm">
              <div className="font-semibold text-slate-800">{testimonials[currentIndex].name}</div>
              <div className="text-slate-600">in {testimonials[currentIndex].timeframe}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export function TrustSignals() {
  const signals = [
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data stays yours',
      color: 'text-green-600'
    },
    {
      icon: Zap,
      title: 'No Ads',
      description: 'Clean, focused experience',
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      title: 'Science-Based',
      description: 'Backed by research',
      color: 'text-red-600'
    },
    {
      icon: CheckCircle2,
      title: 'Free Forever',
      description: 'Core features always free',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {signals.map((signal, index) => (
        <motion.div
          key={signal.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="text-center p-3 bg-white/50 rounded-lg border border-slate-200"
        >
          <signal.icon className={`w-6 h-6 mx-auto mb-2 ${signal.color}`} />
          <div className="text-sm font-semibold text-slate-800">{signal.title}</div>
          <div className="text-xs text-slate-600">{signal.description}</div>
        </motion.div>
      ))}
    </div>
  );
}

// Hook for getting real-time social proof data
export function useSocialProofData() {
  const [data, setData] = useState({
    activeUsers: 1247,
    todaySignups: 247,
    totalWorkouts: 2487391,
    avgRating: 4.9,
    successRate: 89,
    recentAchievements: []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      // In production, this would be a real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setData({
        activeUsers: 1247 + Math.floor(Math.random() * 100),
        todaySignups: 247 + Math.floor(Math.random() * 20),
        totalWorkouts: 2487391 + Math.floor(Math.random() * 1000),
        avgRating: 4.9,
        successRate: 89,
        recentAchievements: []
      });
      
      setIsLoading(false);
    };

    fetchData();

    // Update data periodically
    const interval = setInterval(fetchData, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading };
}

// Combined social proof section
interface SocialProofSectionProps {
  variant?: 'compact' | 'full' | 'testimonials-only';
  className?: string;
}

export function SocialProofSection({ variant = 'full', className = '' }: SocialProofSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(variant === 'full' || variant === 'compact') && <LiveUserCounter />}
      
      {variant === 'full' && (
        <>
          <TrustSignals />
          <RecentAchievements />
          <TestimonialCarousel />
        </>
      )}
      
      {(variant === 'testimonials-only' || variant === 'full') && variant !== 'compact' && (
        <TestimonialCarousel />
      )}
      
      {variant === 'compact' && <RecentAchievements />}
    </div>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}