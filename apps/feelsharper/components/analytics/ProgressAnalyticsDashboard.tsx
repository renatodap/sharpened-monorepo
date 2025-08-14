'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Calendar,
  Zap,
  Award,
  BarChart3,
  LineChart,
  PieChart,
  Settings,
  Filter,
  Download,
  Share,
  AlertCircle,
  CheckCircle,
  Clock,
  Flame,
  Heart,
  Dumbbell
} from 'lucide-react';

interface MetricData {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  unit: string;
  timeframe: string;
}

interface ProgressData {
  date: string;
  weight: number;
  muscle_mass: number;
  body_fat: number;
  workouts_completed: number;
  calories_burned: number;
  sleep_hours: number;
  stress_level: number;
  energy_level: number;
}

interface PredictionData {
  metric: string;
  current: number;
  predicted_1week: number;
  predicted_1month: number;
  predicted_3months: number;
  confidence: number;
  factors: string[];
}

export default function ProgressAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['weight', 'workouts', 'nutrition']);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeframe]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulate loading real analytics data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock historical data
    const mockData: ProgressData[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        weight: 75 + Math.sin(i * 0.1) * 2 + (Math.random() - 0.5) * 0.5,
        muscle_mass: 35 + Math.sin(i * 0.05) * 1.5 + (Math.random() - 0.5) * 0.3,
        body_fat: 15 - Math.sin(i * 0.07) * 1 + (Math.random() - 0.5) * 0.2,
        workouts_completed: Math.floor(Math.random() * 2),
        calories_burned: 200 + Math.random() * 400,
        sleep_hours: 7 + (Math.random() - 0.5) * 2,
        stress_level: Math.random() * 10,
        energy_level: 5 + Math.random() * 5
      });
    }
    
    const mockPredictions: PredictionData[] = [
      {
        metric: 'Weight',
        current: 74.2,
        predicted_1week: 73.8,
        predicted_1month: 72.5,
        predicted_3months: 70.0,
        confidence: 87,
        factors: ['Consistent calorie deficit', 'Regular exercise', 'Improved sleep quality']
      },
      {
        metric: 'Muscle Mass',
        current: 36.1,
        predicted_1week: 36.3,
        predicted_1month: 37.2,
        predicted_3months: 38.8,
        confidence: 82,
        factors: ['Progressive overload', 'Adequate protein intake', 'Recovery optimization']
      },
      {
        metric: 'Body Fat %',
        current: 14.2,
        predicted_1week: 13.9,
        predicted_1month: 12.8,
        predicted_3months: 11.2,
        confidence: 79,
        factors: ['Cardio consistency', 'Nutrition adherence', 'Metabolic adaptation']
      }
    ];
    
    setProgressData(mockData);
    setPredictions(mockPredictions);
    setIsLoading(false);
  };

  const getCurrentMetrics = (): Record<string, MetricData> => {
    if (progressData.length === 0) return {};
    
    const latest = progressData[progressData.length - 1];
    const previous = progressData[progressData.length - 7] || progressData[0];
    
    return {
      weight: {
        value: latest.weight,
        change: ((latest.weight - previous.weight) / previous.weight) * 100,
        trend: latest.weight < previous.weight ? 'down' : latest.weight > previous.weight ? 'up' : 'stable',
        target: 70,
        unit: 'kg',
        timeframe: '7 days'
      },
      muscle_mass: {
        value: latest.muscle_mass,
        change: ((latest.muscle_mass - previous.muscle_mass) / previous.muscle_mass) * 100,
        trend: latest.muscle_mass > previous.muscle_mass ? 'up' : latest.muscle_mass < previous.muscle_mass ? 'down' : 'stable',
        target: 40,
        unit: 'kg',
        timeframe: '7 days'
      },
      body_fat: {
        value: latest.body_fat,
        change: ((latest.body_fat - previous.body_fat) / previous.body_fat) * 100,
        trend: latest.body_fat < previous.body_fat ? 'down' : latest.body_fat > previous.body_fat ? 'up' : 'stable',
        target: 12,
        unit: '%',
        timeframe: '7 days'
      },
      workouts: {
        value: progressData.reduce((sum, day) => sum + day.workouts_completed, 0),
        change: 12.5,
        trend: 'up',
        target: 20,
        unit: 'sessions',
        timeframe: '30 days'
      },
      calories_burned: {
        value: Math.round(progressData.reduce((sum, day) => sum + day.calories_burned, 0) / progressData.length),
        change: 8.3,
        trend: 'up',
        unit: 'kcal/day',
        timeframe: 'average'
      },
      sleep: {
        value: progressData.reduce((sum, day) => sum + day.sleep_hours, 0) / progressData.length,
        change: 5.2,
        trend: 'up',
        target: 8,
        unit: 'hrs/night',
        timeframe: 'average'
      }
    };
  };

  const renderMiniChart = (data: number[], color: string = '#3B82F6') => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg className="w-16 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          points={points}
        />
      </svg>
    );
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  const getProgressToTarget = (current: number, target?: number) => {
    if (!target) return 0;
    return Math.round((current / target) * 100);
  };

  const metrics = getCurrentMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Loading Analytics</h3>
            <p className="text-text-secondary">Processing your progress data and generating insights...</p>
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
          <h1 className="text-2xl font-bold text-white">Progress Analytics</h1>
          <p className="text-text-secondary">Real-time insights and predictive modeling</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            Share
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', '1y'] as const).map((period) => (
          <Button
            key={period}
            variant={timeframe === period ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeframe(period)}
          >
            {period.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(metrics).map(([key, metric]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary capitalize">{key.replace('_', ' ')}</span>
                  {getTrendIcon(metric.trend, metric.change)}
                </div>
                <div className="text-xl font-bold text-white">
                  {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
                  <span className="text-sm text-text-secondary ml-1">{metric.unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${metric.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                  {renderMiniChart(
                    progressData.slice(-7).map(d => {
                      switch (key) {
                        case 'weight': return d.weight;
                        case 'muscle_mass': return d.muscle_mass;
                        case 'body_fat': return d.body_fat;
                        case 'sleep': return d.sleep_hours;
                        default: return d.energy_level;
                      }
                    }),
                    metric.trend === 'up' ? '#10B981' : metric.trend === 'down' ? '#EF4444' : '#6B7280'
                  )}
                </div>
                {metric.target && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Target Progress</span>
                      <span className="text-text-secondary">{getProgressToTarget(metric.value, metric.target)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-navy h-1 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(getProgressToTarget(metric.value, metric.target), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <LineChart className="w-5 h-5" />
              Body Composition Trends
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-48 bg-surface rounded-lg p-4 flex items-center justify-center">
                <div className="text-center text-text-secondary">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Interactive body composition chart would render here</p>
                  <p className="text-sm">Weight, Muscle Mass, Body Fat % over time</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-blue-400">{metrics.weight?.value.toFixed(1)} kg</div>
                  <div className="text-xs text-text-secondary">Weight</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-400">{metrics.muscle_mass?.value.toFixed(1)} kg</div>
                  <div className="text-xs text-text-secondary">Muscle</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-yellow-400">{metrics.body_fat?.value.toFixed(1)}%</div>
                  <div className="text-xs text-text-secondary">Body Fat</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Metrics
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-48 bg-surface rounded-lg p-4 flex items-center justify-center">
                <div className="text-center text-text-secondary">
                  <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Performance breakdown chart would render here</p>
                  <p className="text-sm">Workouts, Sleep, Energy, Stress levels</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Workouts</span>
                    <span className="text-white">{metrics.workouts?.value || 0}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Sleep Avg</span>
                    <span className="text-white">{metrics.sleep?.value.toFixed(1)}h</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Predictions */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            AI Predictions & Projections
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {predictions.map((prediction) => (
              <div key={prediction.metric} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-white">{prediction.metric}</h4>
                  <Badge className="bg-navy/20 text-navy">
                    {prediction.confidence}% confidence
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-white">{prediction.current}</div>
                    <div className="text-xs text-text-secondary">Current</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-400">{prediction.predicted_1week}</div>
                    <div className="text-xs text-text-secondary">1 Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-400">{prediction.predicted_1month}</div>
                    <div className="text-xs text-text-secondary">1 Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-yellow-400">{prediction.predicted_3months}</div>
                    <div className="text-xs text-text-secondary">3 Months</div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-white mb-2">Key Factors</h5>
                  <div className="flex flex-wrap gap-2">
                    {prediction.factors.map((factor) => (
                      <Badge key={factor} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions & Insights
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <div className="font-medium text-white">Consistency Streak</div>
                <div className="text-sm text-text-secondary">12 days of logging</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <div>
                <div className="font-medium text-white">Sleep Optimization</div>
                <div className="text-sm text-text-secondary">Average 6.8h - target 8h</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
              <Award className="w-6 h-6 text-navy" />
              <div>
                <div className="font-medium text-white">Progress Milestone</div>
                <div className="text-sm text-text-secondary">5% body fat reduction!</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}