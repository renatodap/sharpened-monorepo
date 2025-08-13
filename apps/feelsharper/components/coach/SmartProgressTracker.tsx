"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Activity,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Eye,
  Brain,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  isOnTrack: boolean;
  category: 'strength' | 'body_composition' | 'endurance' | 'consistency';
  priority: 'high' | 'medium' | 'low';
}

interface AIInsight {
  id: string;
  type: 'achievement' | 'warning' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  actionItems: string[];
  dataPoints: string[];
  category: string;
}

interface ProgressPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  factors: string[];
  scenario: 'optimistic' | 'realistic' | 'conservative';
}

export function SmartProgressTracker() {
  const [metrics, setMetrics] = useState<ProgressMetric[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [predictions, setPredictions] = useState<ProgressPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [analysisMode, setAnalysisMode] = useState<'overview' | 'detailed'>('overview');

  useEffect(() => {
    loadProgressData();
  }, [selectedTimeframe]);

  const loadProgressData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API calls to load progress data
      await Promise.all([
        loadMetrics(),
        loadInsights(),
        loadPredictions()
      ]);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    // Simulate loading metrics
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setMetrics([
      {
        id: 'squat_1rm',
        name: 'Squat 1RM',
        value: 110,
        target: 120,
        unit: 'kg',
        trend: 'up',
        change: 5,
        changePercent: 4.8,
        isOnTrack: true,
        category: 'strength',
        priority: 'high'
      },
      {
        id: 'body_fat',
        name: 'Body Fat %',
        value: 15.2,
        target: 12.0,
        unit: '%',
        trend: 'down',
        change: -1.3,
        changePercent: -7.9,
        isOnTrack: true,
        category: 'body_composition',
        priority: 'high'
      },
      {
        id: 'workout_consistency',
        name: 'Workout Consistency',
        value: 92,
        target: 90,
        unit: '%',
        trend: 'up',
        change: 3,
        changePercent: 3.4,
        isOnTrack: true,
        category: 'consistency',
        priority: 'medium'
      },
      {
        id: 'vo2_max',
        name: 'VO2 Max (Est.)',
        value: 48,
        target: 52,
        unit: 'ml/kg/min',
        trend: 'up',
        change: 2,
        changePercent: 4.3,
        isOnTrack: true,
        category: 'endurance',
        priority: 'medium'
      }
    ]);
  };

  const loadInsights = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setInsights([
      {
        id: '1',
        type: 'achievement',
        title: 'Strength Milestone Reached',
        description: 'You\'ve achieved a 15% increase in your squat over the past 8 weeks, exceeding your planned progression.',
        confidence: 0.95,
        impact: 'high',
        timeframe: 'Last 8 weeks',
        actionItems: [
          'Consider increasing training volume',
          'Test new 1RM to update baselines',
          'Progress to intermediate program'
        ],
        dataPoints: ['Squat progression', 'Volume increases', 'Recovery metrics'],
        category: 'strength'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Recovery Trending Down',
        description: 'Your subjective recovery scores have decreased by 12% over the past 2 weeks, potentially indicating overreaching.',
        confidence: 0.78,
        impact: 'medium',
        timeframe: 'Last 2 weeks',
        actionItems: [
          'Consider adding extra rest day',
          'Reduce training intensity by 10-15%',
          'Focus on sleep quality improvement'
        ],
        dataPoints: ['Sleep duration', 'HRV trends', 'Subjective scores'],
        category: 'recovery'
      },
      {
        id: '3',
        type: 'prediction',
        title: 'Goal Achievement Projection',
        description: 'Based on current trends, you\'re likely to reach your target body composition 3 weeks ahead of schedule.',
        confidence: 0.85,
        impact: 'high',
        timeframe: 'Next 9 weeks',
        actionItems: [
          'Maintain current nutrition approach',
          'Consider setting stretch goals',
          'Plan transition to maintenance phase'
        ],
        dataPoints: ['Weight loss rate', 'Body fat measurements', 'Nutrition adherence'],
        category: 'body_composition'
      },
      {
        id: '4',
        type: 'recommendation',
        title: 'Nutrition Timing Opportunity',
        description: 'Optimizing your post-workout nutrition timing could enhance recovery and strength gains by an estimated 8-12%.',
        confidence: 0.82,
        impact: 'medium',
        timeframe: 'Ongoing',
        actionItems: [
          'Consume 25-30g protein within 2 hours post-workout',
          'Include 30-40g fast carbs post-workout',
          'Time largest meal 3-4 hours after training'
        ],
        dataPoints: ['Current meal timing', 'Recovery metrics', 'Performance trends'],
        category: 'nutrition'
      }
    ]);
  };

  const loadPredictions = async () => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setPredictions([
      {
        metric: 'Bench Press 1RM',
        currentValue: 85,
        predictedValue: 95,
        timeframe: '8 weeks',
        confidence: 0.87,
        factors: ['Progressive overload', 'Consistency', 'Recovery quality'],
        scenario: 'realistic'
      },
      {
        metric: 'Body Weight',
        currentValue: 75.2,
        predictedValue: 73.5,
        timeframe: '6 weeks',
        confidence: 0.91,
        factors: ['Current deficit', 'Adherence rate', 'Metabolic adaptation'],
        scenario: 'realistic'
      },
      {
        metric: 'Running 5K Time',
        currentValue: 24.5,
        predictedValue: 23.2,
        timeframe: '10 weeks',
        confidence: 0.75,
        factors: ['Training volume', 'Pace progression', 'Recovery'],
        scenario: 'optimistic'
      }
    ]);
  };

  const refreshAnalysis = async () => {
    setIsLoading(true);
    // Simulate AI reanalysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    await loadProgressData();
  };

  const renderMetricsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.id} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm text-text-muted">{metric.name}</h3>
            <div className={cn(
              "flex items-center space-x-1 text-xs",
              metric.trend === 'up' ? 'text-green-600' : 
              metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
            )}>
              {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
               metric.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : 
               <div className="w-3 h-3 rounded-full bg-gray-400" />}
              <span>{metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{metric.value}</span>
              <span className="text-sm text-text-muted">{metric.unit}</span>
            </div>
            <div className="text-xs text-text-muted">
              Target: {metric.target}{metric.unit}
            </div>
          </div>

          <Progress 
            value={(metric.value / metric.target) * 100} 
            className={cn(
              "h-2 mb-2",
              metric.isOnTrack ? "progress-green" : "progress-amber"
            )}
          />
          
          <div className="flex items-center justify-between">
            <Badge 
              variant={metric.isOnTrack ? "default" : "destructive"}
              className="text-xs"
            >
              {metric.isOnTrack ? 'On Track' : 'Behind'}
            </Badge>
            <div className={cn(
              "text-xs px-2 py-1 rounded",
              metric.priority === 'high' ? 'bg-red-100 text-red-800' :
              metric.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            )}>
              {metric.priority} priority
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-4">
      {insights.map((insight) => (
        <Card key={insight.id} className="p-4">
          <div className="flex items-start space-x-4">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
              insight.type === 'achievement' ? 'bg-green-100 text-green-600' :
              insight.type === 'warning' ? 'bg-amber-100 text-amber-600' :
              insight.type === 'recommendation' ? 'bg-blue-100 text-blue-600' :
              'bg-purple-100 text-purple-600'
            )}>
              {insight.type === 'achievement' ? <Award className="w-4 h-4" /> :
               insight.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
               insight.type === 'recommendation' ? <Lightbulb className="w-4 h-4" /> :
               <Brain className="w-4 h-4" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{insight.title}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {insight.timeframe}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs text-text-muted">
                    <Eye className="w-3 h-3" />
                    <span>{Math.round(insight.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-text-muted mb-3">{insight.description}</p>
              
              {insight.actionItems.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-text-muted mb-2">Recommended Actions:</h4>
                  <ul className="space-y-1">
                    {insight.actionItems.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center space-x-2">
                  <span>Based on:</span>
                  <span>{insight.dataPoints.join(', ')}</span>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded",
                  insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                  insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                )}>
                  {insight.impact} impact
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderPredictions = () => (
    <div className="space-y-4">
      {predictions.map((prediction, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{prediction.metric}</h3>
            <Badge variant="outline" className="text-xs">
              {prediction.scenario} scenario
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-muted">
                {prediction.currentValue}
              </div>
              <div className="text-xs text-text-muted">Current</div>
            </div>
            <div className="text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-600" />
              <div className="text-xs text-text-muted">{prediction.timeframe}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {prediction.predictedValue}
              </div>
              <div className="text-xs text-text-muted">Predicted</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Confidence</span>
              <span className="text-sm font-medium">{Math.round(prediction.confidence * 100)}%</span>
            </div>
            <Progress value={prediction.confidence * 100} className="h-2" />
          </div>
          
          <div>
            <h4 className="text-xs font-medium text-text-muted mb-2">Key Factors:</h4>
            <div className="flex flex-wrap gap-1">
              {prediction.factors.map((factor, factorIndex) => (
                <Badge key={factorIndex} variant="secondary" className="text-xs">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-text-muted" />
          <span className="ml-3 text-text-muted">Analyzing your progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Progress Tracker</h2>
          <p className="text-text-muted">AI-powered insights into your fitness journey</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">Last Year</option>
          </select>
          <Button variant="outline" size="sm" onClick={refreshAnalysis} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        {renderMetricsGrid()}
      </div>

      {/* Tabs for detailed analysis */}
      <Tabs value={analysisMode} onValueChange={(value) => setAnalysisMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">AI-Generated Insights</h3>
            {renderInsights()}
          </div>
        </TabsContent>
        
        <TabsContent value="predictions" className="mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Progress Predictions</h3>
            {renderPredictions()}
          </div>
        </TabsContent>
        
        <TabsContent value="detailed" className="mt-6">
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-text-muted" />
            <h3 className="text-lg font-semibold mb-2">Detailed Analysis</h3>
            <p className="text-text-muted">
              Advanced statistical analysis and correlations coming soon...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}