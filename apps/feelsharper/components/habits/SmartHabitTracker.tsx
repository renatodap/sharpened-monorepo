'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Target,
  TrendingUp,
  Flame,
  Calendar,
  Clock,
  Brain,
  Zap,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  Award,
  AlertTriangle,
  Lightbulb,
  Star,
  Timer,
  MapPin,
  Users,
  Bell
} from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'sleep' | 'mental' | 'productivity';
  frequency: 'daily' | 'weekly' | 'custom';
  target: number;
  unit: string;
  streak: number;
  best_streak: number;
  completion_rate: number;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  last_completed: string | null;
  reminder_time?: string;
  triggers: string[];
  rewards: string[];
  barriers: string[];
}

interface HabitCompletion {
  habit_id: string;
  date: string;
  completed: boolean;
  value?: number;
  notes?: string;
  mood_before: number;
  mood_after: number;
  context: {
    location?: string;
    time_of_day: string;
    energy_level: number;
    stress_level: number;
  };
}

interface BehavioralInsight {
  type: 'pattern' | 'correlation' | 'recommendation' | 'warning';
  title: string;
  description: string;
  confidence: number;
  action_items: string[];
  data_points: number;
}

export default function SmartHabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [insights, setInsights] = useState<BehavioralInsight[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'insights'>('daily');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadHabitsData();
    generateBehavioralInsights();
  }, []);

  const loadHabitsData = async () => {
    // Simulate loading user habits
    const mockHabits: Habit[] = [
      {
        id: '1',
        name: 'Morning Workout',
        description: '30 minutes of exercise to start the day',
        category: 'fitness',
        frequency: 'daily',
        target: 1,
        unit: 'session',
        streak: 12,
        best_streak: 28,
        completion_rate: 85,
        difficulty: 'medium',
        created_at: '2024-01-01',
        last_completed: '2024-01-12',
        reminder_time: '07:00',
        triggers: ['wake_up', 'coffee_ready'],
        rewards: ['energy_boost', 'mood_improvement'],
        barriers: ['lack_of_time', 'low_motivation']
      },
      {
        id: '2',
        name: 'Drink 8 Glasses of Water',
        description: 'Stay hydrated throughout the day',
        category: 'nutrition',
        frequency: 'daily',
        target: 8,
        unit: 'glasses',
        streak: 5,
        best_streak: 15,
        completion_rate: 72,
        difficulty: 'easy',
        created_at: '2024-01-01',
        last_completed: '2024-01-11',
        triggers: ['meal_time', 'workout_finish'],
        rewards: ['better_skin', 'more_energy'],
        barriers: ['forgetting', 'access_to_water']
      },
      {
        id: '3',
        name: '10,000 Steps',
        description: 'Walk at least 10,000 steps daily',
        category: 'fitness',
        frequency: 'daily',
        target: 10000,
        unit: 'steps',
        streak: 8,
        best_streak: 22,
        completion_rate: 78,
        difficulty: 'medium',
        created_at: '2024-01-01',
        last_completed: '2024-01-11',
        triggers: ['lunch_break', 'evening_walk'],
        rewards: ['fitness_improvement', 'stress_relief'],
        barriers: ['weather', 'busy_schedule']
      },
      {
        id: '4',
        name: 'Meditation',
        description: '10 minutes of mindfulness meditation',
        category: 'mental',
        frequency: 'daily',
        target: 10,
        unit: 'minutes',
        streak: 3,
        best_streak: 18,
        completion_rate: 65,
        difficulty: 'medium',
        created_at: '2024-01-01',
        last_completed: '2024-01-10',
        reminder_time: '21:00',
        triggers: ['before_bed', 'stress_high'],
        rewards: ['calm_mind', 'better_sleep'],
        barriers: ['distractions', 'finding_time']
      },
      {
        id: '5',
        name: 'Read for 30 Minutes',
        description: 'Daily reading for personal development',
        category: 'productivity',
        frequency: 'daily',
        target: 30,
        unit: 'minutes',
        streak: 15,
        best_streak: 25,
        completion_rate: 89,
        difficulty: 'easy',
        created_at: '2024-01-01',
        last_completed: '2024-01-12',
        triggers: ['evening_routine', 'commute'],
        rewards: ['knowledge_gain', 'relaxation'],
        barriers: ['screen_time', 'fatigue']
      }
    ];

    setHabits(mockHabits);
  };

  const generateBehavioralInsights = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockInsights: BehavioralInsight[] = [
      {
        type: 'pattern',
        title: 'Peak Performance Window Detected',
        description: 'You complete 73% more habits when starting before 8 AM. Your morning routine is your superpower!',
        confidence: 92,
        action_items: [
          'Schedule challenging habits in your 7-8 AM window',
          'Prepare everything the night before',
          'Use morning momentum for new habit formation'
        ],
        data_points: 45
      },
      {
        type: 'correlation',
        title: 'Sleep-Exercise Connection',
        description: 'Days with 7+ hours of sleep lead to 85% higher workout completion rates. Better rest = better habits.',
        confidence: 87,
        action_items: [
          'Prioritize 7+ hours of sleep nightly',
          'Track sleep quality alongside habit completion',
          'Adjust workout intensity based on sleep quality'
        ],
        data_points: 38
      },
      {
        type: 'recommendation',
        title: 'Habit Stacking Opportunity',
        description: 'Link meditation with your successful reading habit for 40% higher completion rates.',
        confidence: 78,
        action_items: [
          'Meditate immediately after reading',
          'Create a transition ritual between activities',
          'Start with 5-minute sessions to build consistency'
        ],
        data_points: 28
      },
      {
        type: 'warning',
        title: 'Weekend Completion Drop',
        description: 'Habit completion drops 45% on weekends. Your structured weekday routine needs weekend adaptation.',
        confidence: 85,
        action_items: [
          'Create a flexible weekend routine',
          'Set different targets for weekends',
          'Use accountability partners for weekend motivation'
        ],
        data_points: 32
      }
    ];
    
    setInsights(mockInsights);
    setIsAnalyzing(false);
  };

  const completeHabit = async (habitId: string, value?: number) => {
    const completion: HabitCompletion = {
      habit_id: habitId,
      date: selectedDate,
      completed: true,
      value,
      mood_before: 6,
      mood_after: 8,
      context: {
        time_of_day: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening',
        energy_level: 7,
        stress_level: 4
      }
    };
    
    setCompletions([...completions, completion]);
    
    // Update habit streak
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const newStreak = habit.streak + 1;
        return {
          ...habit,
          streak: newStreak,
          best_streak: Math.max(habit.best_streak, newStreak),
          last_completed: selectedDate
        };
      }
      return habit;
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return <Target className="w-4 h-4" />;
      case 'nutrition': return <Zap className="w-4 h-4" />;
      case 'sleep': return <Clock className="w-4 h-4" />;
      case 'mental': return <Brain className="w-4 h-4" />;
      case 'productivity': return <BarChart3 className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness': return 'bg-blue-500/20 text-blue-400';
      case 'nutrition': return 'bg-green-500/20 text-green-400';
      case 'sleep': return 'bg-purple-500/20 text-purple-400';
      case 'mental': return 'bg-yellow-500/20 text-yellow-400';
      case 'productivity': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <TrendingUp className="w-5 h-5 text-blue-400" />;
      case 'correlation': return <BarChart3 className="w-5 h-5 text-green-400" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-yellow-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Brain className="w-5 h-5 text-gray-400" />;
    }
  };

  const isHabitCompletedToday = (habitId: string) => {
    return completions.some(c => c.habit_id === habitId && c.date === selectedDate && c.completed);
  };

  if (viewMode === 'insights') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Behavioral Insights</h1>
            <p className="text-text-secondary">AI-powered habit analysis and recommendations</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setViewMode('daily')}
            >
              Back to Habits
            </Button>
            <Button
              onClick={generateBehavioralInsights}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing...' : 'Refresh Insights'}
            </Button>
          </div>
        </div>

        {isAnalyzing ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-white mb-2">Analyzing Behavior Patterns</h3>
              <p className="text-text-secondary">Processing habit data and identifying optimization opportunities...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {insights.map((insight, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{insight.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Badge variant="outline">{insight.confidence}% confidence</Badge>
                        <span>•</span>
                        <span>{insight.data_points} data points</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-text-secondary">{insight.description}</p>
                    
                    <div>
                      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Action Items
                      </h4>
                      <ul className="space-y-2">
                        {insight.action_items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2 text-sm text-text-secondary">
                            <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Habit Tracker</h1>
          <p className="text-text-secondary">Build lasting habits with behavioral science</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode('insights')}
            className="flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            View Insights
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Habit
          </Button>
        </div>
      </div>

      {/* Date Selector & View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'daily' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('daily')}
          >
            Daily
          </Button>
          <Button
            variant={viewMode === 'weekly' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('weekly')}
          >
            Weekly
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-white"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{habits.filter(h => isHabitCompletedToday(h.id)).length}</div>
            <div className="text-sm text-text-secondary">Completed Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-navy">{Math.max(...habits.map(h => h.streak), 0)}</div>
            <div className="text-sm text-text-secondary">Longest Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{Math.round(habits.reduce((acc, h) => acc + h.completion_rate, 0) / habits.length)}%</div>
            <div className="text-sm text-text-secondary">Avg Completion</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{habits.length}</div>
            <div className="text-sm text-text-secondary">Active Habits</div>
          </CardContent>
        </Card>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        {habits.map((habit) => {
          const isCompleted = isHabitCompletedToday(habit.id);
          
          return (
            <Card key={habit.id} className={`transition-all duration-200 ${isCompleted ? 'bg-green-500/5 border-green-500/20' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getCategoryColor(habit.category)}`}>
                      {getCategoryIcon(habit.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-white">{habit.name}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {habit.difficulty}
                        </Badge>
                        {habit.streak > 0 && (
                          <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-medium text-orange-400">{habit.streak}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary mb-2">{habit.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span>Target: {habit.target} {habit.unit}</span>
                        <span>•</span>
                        <span>{habit.completion_rate}% completion rate</span>
                        <span>•</span>
                        <span>Best streak: {habit.best_streak} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Done!</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => completeHabit(habit.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Complete
                      </Button>
                    )}
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Habit Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Weekly Progress</span>
                    <span className="text-text-secondary">{Math.round((habit.completion_rate / 100) * 7)}/7 days</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-navy h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${habit.completion_rate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Quick Context */}
                {habit.triggers.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-text-secondary">Triggers:</span>
                    <div className="flex gap-1">
                      {habit.triggers.slice(0, 2).map((trigger) => (
                        <Badge key={trigger} variant="secondary" className="text-xs">
                          {trigger.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}