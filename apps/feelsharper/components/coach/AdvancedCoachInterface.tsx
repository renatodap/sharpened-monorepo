"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  Brain,
  Target,
  Calendar,
  TrendingUp,
  Activity,
  Apple,
  Moon,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Star,
  BarChart3,
  MessageSquare,
  PlusCircle,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoachingPlan {
  id: string;
  type: 'workout' | 'nutrition' | 'lifestyle';
  title: string;
  duration: string;
  description: string;
  phases: CoachingPhase[];
  progress: number;
  status: 'active' | 'completed' | 'paused' | 'draft';
}

interface CoachingPhase {
  id: string;
  name: string;
  duration: string;
  goals: string[];
  workouts?: WorkoutTemplate[];
  nutritionGuidelines?: NutritionGuideline[];
  milestones: Milestone[];
  isActive: boolean;
  isCompleted: boolean;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  type: string;
  duration: number;
  exercises: Exercise[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  duration?: string;
  instructions?: string;
}

interface NutritionGuideline {
  id: string;
  category: string;
  recommendation: string;
  targetCalories?: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  mealTiming?: string[];
}

interface Milestone {
  id: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
  metrics?: Record<string, number>;
}

interface PerformanceMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export function AdvancedCoachInterface() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [currentPlans, setCurrentPlans] = useState<CoachingPlan[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [recentInsights, setRecentInsights] = useState<any[]>([]);

  useEffect(() => {
    loadCoachingData();
  }, []);

  const loadCoachingData = async () => {
    // Simulate loading coaching data
    // In a real implementation, this would fetch from APIs
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentPlans([
      {
        id: '1',
        type: 'workout',
        title: 'Strength Building Program',
        duration: '12 weeks',
        description: 'Progressive overload program focused on compound movements',
        phases: [
          {
            id: '1',
            name: 'Foundation Phase',
            duration: '4 weeks',
            goals: ['Build movement patterns', 'Establish consistency'],
            milestones: [
              { id: '1', description: 'Complete 12 workouts', targetDate: '2025-02-15', isCompleted: true },
              { id: '2', description: 'Master squat form', targetDate: '2025-02-10', isCompleted: true }
            ],
            isActive: false,
            isCompleted: true
          },
          {
            id: '2',
            name: 'Strength Phase',
            duration: '6 weeks',
            goals: ['Increase compound lift numbers', 'Build work capacity'],
            milestones: [
              { id: '3', description: 'Squat bodyweight for 5 reps', targetDate: '2025-03-01', isCompleted: false },
              { id: '4', description: 'Bench press 80% bodyweight', targetDate: '2025-03-15', isCompleted: false }
            ],
            isActive: true,
            isCompleted: false
          }
        ],
        progress: 65,
        status: 'active'
      }
    ]);

    setPerformanceMetrics([
      { name: 'Weekly Workouts', current: 4, target: 4, unit: 'sessions', trend: 'stable', change: 0 },
      { name: 'Squat 1RM', current: 95, target: 110, unit: 'kg', trend: 'up', change: 8 },
      { name: 'Body Weight', current: 72.5, target: 70, unit: 'kg', trend: 'down', change: -1.5 },
      { name: 'Sleep Quality', current: 7.8, target: 8.0, unit: '/10', trend: 'up', change: 0.3 }
    ]);

    setRecentInsights([
      {
        id: '1',
        type: 'performance',
        title: 'Strength Gains Accelerating',
        description: 'Your squat has increased 12% over the past month, showing excellent progression.',
        confidence: 0.92,
        actionItems: ['Continue current program', 'Focus on recovery between sessions']
      },
      {
        id: '2',
        type: 'nutrition',
        title: 'Protein Timing Optimization',
        description: 'Consider spreading protein intake more evenly throughout the day for better muscle synthesis.',
        confidence: 0.78,
        actionItems: ['Add protein to breakfast', 'Include protein in afternoon snack']
      }
    ]);
  };

  const generateNewPlan = async (type: 'workout' | 'nutrition' | 'lifestyle') => {
    setIsGeneratingPlan(true);
    
    try {
      // Simulate AI plan generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real implementation, this would call the AI service
      console.log(`Generating ${type} plan...`);
      
      // Show success notification
      alert(`New ${type} plan generated successfully!`);
      
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => (
          <Card key={metric.name} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm text-text-muted">{metric.name}</h3>
              <div className={cn(
                "flex items-center space-x-1",
                metric.trend === 'up' ? 'text-green-600' : 
                metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              )}>
                <TrendingUp className={cn(
                  "w-3 h-3",
                  metric.trend === 'down' && "rotate-180"
                )} />
                <span className="text-xs">
                  {metric.change > 0 ? '+' : ''}{metric.change}
                </span>
              </div>
            </div>
            <div className="mb-2">
              <span className="text-2xl font-bold">{metric.current}</span>
              <span className="text-sm text-text-muted ml-1">{metric.unit}</span>
            </div>
            <Progress 
              value={(metric.current / metric.target) * 100} 
              className="h-1"
            />
            <p className="text-xs text-text-muted mt-1">
              Target: {metric.target}{metric.unit}
            </p>
          </Card>
        ))}
      </div>

      {/* Active Plans */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Active Plans</h2>
          <Button variant="outline" size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
        
        <div className="space-y-4">
          {currentPlans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    plan.type === 'workout' ? 'bg-blue-100 text-blue-600' :
                    plan.type === 'nutrition' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  )}>
                    {plan.type === 'workout' ? <Activity className="w-4 h-4" /> :
                     plan.type === 'nutrition' ? <Apple className="w-4 h-4" /> :
                     <Brain className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-semibold">{plan.title}</h3>
                    <p className="text-sm text-text-muted">{plan.duration}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                    {plan.status}
                  </Badge>
                  <span className="text-sm font-medium">{plan.progress}%</span>
                </div>
              </div>
              
              <p className="text-sm text-text-muted mb-3">{plan.description}</p>
              
              <Progress value={plan.progress} className="mb-3" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-text-muted">
                  <span>{plan.phases.length} phases</span>
                  <span>•</span>
                  <span>{plan.phases.filter(p => p.isCompleted).length} completed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    {plan.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Insights */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
        <div className="space-y-4">
          {recentInsights.map((insight) => (
            <div key={insight.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{insight.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{insight.description}</p>
                  {insight.actionItems && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-text-muted mb-1">Recommended Actions:</p>
                      <ul className="text-xs space-y-1">
                        {insight.actionItems.map((action: string, index: number) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-xs">{Math.round(insight.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderPlanGeneratorTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <Brain className="w-12 h-12 mx-auto mb-4 text-blue-600" />
        <h2 className="text-2xl font-semibold mb-2">AI Plan Generator</h2>
        <p className="text-text-muted max-w-md mx-auto">
          Generate personalized workout, nutrition, or lifestyle plans based on your data and goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer" 
              onClick={() => generateNewPlan('workout')}>
          <Activity className="w-8 h-8 mx-auto mb-4 text-blue-600" />
          <h3 className="font-semibold mb-2">Workout Plan</h3>
          <p className="text-sm text-text-muted mb-4">
            Generate a personalized training program based on your goals and current fitness level.
          </p>
          <Button className="w-full" disabled={isGeneratingPlan}>
            {isGeneratingPlan ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Create Workout Plan'
            )}
          </Button>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => generateNewPlan('nutrition')}>
          <Apple className="w-8 h-8 mx-auto mb-4 text-green-600" />
          <h3 className="font-semibold mb-2">Nutrition Plan</h3>
          <p className="text-sm text-text-muted mb-4">
            Create a meal plan optimized for your dietary preferences and fitness goals.
          </p>
          <Button className="w-full" disabled={isGeneratingPlan}>
            {isGeneratingPlan ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Create Nutrition Plan'
            )}
          </Button>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => generateNewPlan('lifestyle')}>
          <Moon className="w-8 h-8 mx-auto mb-4 text-purple-600" />
          <h3 className="font-semibold mb-2">Lifestyle Plan</h3>
          <p className="text-sm text-text-muted mb-4">
            Develop habits for better sleep, stress management, and overall wellness.
          </p>
          <Button className="w-full" disabled={isGeneratingPlan}>
            {isGeneratingPlan ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Create Lifestyle Plan'
            )}
          </Button>
        </Card>
      </div>

      {/* Plan Generation Options */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Customization Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Primary Goal</Label>
            <select className="w-full mt-1 p-2 border rounded-lg">
              <option>Build Muscle</option>
              <option>Lose Weight</option>
              <option>Improve Endurance</option>
              <option>General Fitness</option>
              <option>Sport-Specific</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Time Commitment</Label>
            <select className="w-full mt-1 p-2 border rounded-lg">
              <option>3-4 days/week</option>
              <option>4-5 days/week</option>
              <option>5-6 days/week</option>
              <option>Daily</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Experience Level</Label>
            <select className="w-full mt-1 p-2 border rounded-lg">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div>
            <Label className="text-sm font-medium">Plan Duration</Label>
            <select className="w-full mt-1 p-2 border rounded-lg">
              <option>4 weeks</option>
              <option>8 weeks</option>
              <option>12 weeks</option>
              <option>16 weeks</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-green-600" />
        <h2 className="text-2xl font-semibold mb-2">Performance Analytics</h2>
        <p className="text-text-muted max-w-md mx-auto">
          Deep insights into your progress and patterns powered by AI analysis.
        </p>
      </div>

      {/* Progress Trends */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Progress Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Strength Progress</span>
              <span className="text-sm text-green-600">↑ 12% this month</span>
            </div>
            <Progress value={78} />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Consistency Score</span>
              <span className="text-sm text-green-600">↑ 5% this month</span>
            </div>
            <Progress value={92} />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recovery Quality</span>
              <span className="text-sm text-yellow-600">→ Stable</span>
            </div>
            <Progress value={85} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Nutrition Adherence</span>
              <span className="text-sm text-green-600">↑ 8% this month</span>
            </div>
            <Progress value={89} />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sleep Quality</span>
              <span className="text-sm text-green-600">↑ 3% this month</span>
            </div>
            <Progress value={76} />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="text-sm text-green-600">↑ 7% this month</span>
            </div>
            <Progress value={84} />
          </div>
        </div>
      </Card>

      {/* AI Recommendations */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">AI Recommendations</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
            <div>
              <h4 className="font-medium">Consider Deload Week</h4>
              <p className="text-sm text-text-muted">
                Your performance metrics suggest you might benefit from a recovery week to optimize future gains.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium">Excellent Consistency</h4>
              <p className="text-sm text-text-muted">
                Your workout consistency has improved significantly. Keep up the great work!
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h4 className="font-medium">Protein Timing Opportunity</h4>
              <p className="text-sm text-text-muted">
                Adjusting your post-workout protein intake could enhance recovery and muscle growth.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">AI Plans</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {renderOverviewTab()}
        </TabsContent>
        
        <TabsContent value="plans" className="mt-6">
          {renderPlanGeneratorTab()}
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          {renderAnalyticsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}