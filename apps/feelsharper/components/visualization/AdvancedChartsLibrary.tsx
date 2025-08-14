'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Calendar,
  Filter,
  Download,
  Maximize2,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Heart,
  Flame
} from 'lucide-react';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  category?: string;
  metadata?: Record<string, any>;
}

interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'heatmap' | 'scatter';
  title: string;
  data: ChartDataPoint[];
  xAxis: string;
  yAxis: string;
  color: string;
  smoothing?: boolean;
  showTrend?: boolean;
  showAverage?: boolean;
  interactive?: boolean;
}

interface VisualizationMetrics {
  total_workouts: ChartDataPoint[];
  calories_burned: ChartDataPoint[];
  weight_progress: ChartDataPoint[];
  sleep_quality: ChartDataPoint[];
  mood_scores: ChartDataPoint[];
  nutrition_scores: ChartDataPoint[];
  strength_progress: ChartDataPoint[];
  cardio_performance: ChartDataPoint[];
}

export default function AdvancedChartsLibrary() {
  const [metrics, setMetrics] = useState<VisualizationMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([]);
  const [visibleCharts, setVisibleCharts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateVisualizationData();
  }, [selectedTimeframe]);

  const generateVisualizationData = async () => {
    setIsLoading(true);
    
    // Simulate loading comprehensive data
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    const days = selectedTimeframe === '7d' ? 7 : selectedTimeframe === '30d' ? 30 : selectedTimeframe === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const generateDataPoints = (baseValue: number, variance: number, trend?: number): ChartDataPoint[] => {
      const points: ChartDataPoint[] = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const trendValue = trend ? (i / days) * trend : 0;
        const randomVariance = (Math.random() - 0.5) * variance;
        const value = Math.max(0, baseValue + trendValue + randomVariance);
        
        points.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(value * 100) / 100,
          metadata: {
            dayOfWeek: date.getDay(),
            weekNumber: Math.floor(i / 7)
          }
        });
      }
      return points;
    };

    const mockMetrics: VisualizationMetrics = {
      total_workouts: generateDataPoints(1, 0.8, 0.2).map(p => ({
        ...p,
        value: Math.floor(p.value),
        category: p.value > 1 ? 'high' : p.value > 0.5 ? 'medium' : 'low'
      })),
      calories_burned: generateDataPoints(350, 120, 50),
      weight_progress: generateDataPoints(75, 0.5, -2.5),
      sleep_quality: generateDataPoints(7.5, 1.2, 0.3),
      mood_scores: generateDataPoints(7, 1.5, 0.5),
      nutrition_scores: generateDataPoints(80, 15, 5),
      strength_progress: generateDataPoints(100, 8, 25),
      cardio_performance: generateDataPoints(140, 20, 15)
    };

    const configs: ChartConfig[] = [
      {
        type: 'line',
        title: 'Weight Progress Trend',
        data: mockMetrics.weight_progress,
        xAxis: 'Date',
        yAxis: 'Weight (kg)',
        color: '#3B82F6',
        smoothing: true,
        showTrend: true,
        showAverage: true,
        interactive: true
      },
      {
        type: 'bar',
        title: 'Daily Workout Frequency',
        data: mockMetrics.total_workouts,
        xAxis: 'Date',
        yAxis: 'Workouts',
        color: '#10B981',
        interactive: true
      },
      {
        type: 'area',
        title: 'Calories Burned Over Time',
        data: mockMetrics.calories_burned,
        xAxis: 'Date',
        yAxis: 'Calories',
        color: '#F59E0B',
        smoothing: true,
        showAverage: true,
        interactive: true
      },
      {
        type: 'line',
        title: 'Sleep Quality Tracking',
        data: mockMetrics.sleep_quality,
        xAxis: 'Date',
        yAxis: 'Hours',
        color: '#8B5CF6',
        smoothing: true,
        showTrend: true,
        interactive: true
      },
      {
        type: 'radar',
        title: 'Weekly Performance Radar',
        data: [
          { date: 'Strength', value: 85, label: 'Strength' },
          { date: 'Cardio', value: 78, label: 'Cardio' },
          { date: 'Flexibility', value: 65, label: 'Flexibility' },
          { date: 'Nutrition', value: 82, label: 'Nutrition' },
          { date: 'Sleep', value: 75, label: 'Sleep' },
          { date: 'Recovery', value: 70, label: 'Recovery' }
        ],
        xAxis: 'Category',
        yAxis: 'Score',
        color: '#EF4444',
        interactive: true
      },
      {
        type: 'heatmap',
        title: 'Workout Intensity Heatmap',
        data: mockMetrics.total_workouts.map((point, index) => ({
          ...point,
          value: Math.random() * 10,
          metadata: {
            ...point.metadata,
            intensity: Math.random() * 10,
            day: new Date(point.date).getDay()
          }
        })),
        xAxis: 'Week',
        yAxis: 'Day of Week',
        color: '#06B6D4',
        interactive: true
      }
    ];

    setMetrics(mockMetrics);
    setChartConfigs(configs);
    setVisibleCharts(new Set(configs.slice(0, 4).map(c => c.title)));
    setIsLoading(false);
  };

  const renderChart = (config: ChartConfig) => {
    const chartData = config.data;
    const maxValue = Math.max(...chartData.map(d => d.value));
    const minValue = Math.min(...chartData.map(d => d.value));
    const range = maxValue - minValue || 1;

    if (config.type === 'line' || config.type === 'area') {
      const points = chartData.map((point, index) => {
        const x = (index / (chartData.length - 1)) * 300;
        const y = 150 - ((point.value - minValue) / range) * 120;
        return `${x},${y}`;
      }).join(' ');

      const averageLine = config.showAverage ? chartData.reduce((sum, p) => sum + p.value, 0) / chartData.length : 0;
      const avgY = config.showAverage ? 150 - ((averageLine - minValue) / range) * 120 : 0;

      return (
        <div className="relative h-48 bg-surface rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 300 150">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="30" height="15" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 15" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="300" height="150" fill="url(#grid)" />
            
            {/* Area fill for area charts */}
            {config.type === 'area' && (
              <polygon
                fill={config.color}
                fillOpacity="0.2"
                points={`0,150 ${points} ${300},150`}
              />
            )}
            
            {/* Main line */}
            <polyline
              fill="none"
              stroke={config.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            
            {/* Average line */}
            {config.showAverage && (
              <line
                x1="0"
                y1={avgY}
                x2="300"
                y2={avgY}
                stroke="#6B7280"
                strokeWidth="1"
                strokeDasharray="5,5"
                opacity="0.7"
              />
            )}
            
            {/* Data points */}
            {chartData.map((point, index) => {
              const x = (index / (chartData.length - 1)) * 300;
              const y = 150 - ((point.value - minValue) / range) * 120;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={config.color}
                  className="cursor-pointer hover:r-4 transition-all"
                />
              );
            })}
          </svg>
          
          {/* Chart stats overlay */}
          <div className="absolute top-2 right-2 text-xs space-y-1">
            <div className="text-white bg-black/50 px-2 py-1 rounded">
              Max: {maxValue.toFixed(1)}
            </div>
            <div className="text-white bg-black/50 px-2 py-1 rounded">
              Min: {minValue.toFixed(1)}
            </div>
            {config.showAverage && (
              <div className="text-white bg-black/50 px-2 py-1 rounded">
                Avg: {averageLine.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (config.type === 'bar') {
      const barWidth = 300 / chartData.length - 2;
      
      return (
        <div className="relative h-48 bg-surface rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 300 150">
            {/* Grid */}
            <defs>
              <pattern id="bargrid" width="30" height="15" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 15" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="300" height="150" fill="url(#bargrid)" />
            
            {/* Bars */}
            {chartData.map((point, index) => {
              const x = (index / chartData.length) * 300;
              const height = ((point.value - minValue) / range) * 120;
              const y = 150 - height;
              
              return (
                <rect
                  key={index}
                  x={x + 1}
                  y={y}
                  width={barWidth}
                  height={height}
                  fill={config.color}
                  opacity="0.8"
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                />
              );
            })}
          </svg>
        </div>
      );
    }

    if (config.type === 'radar') {
      const centerX = 100;
      const centerY = 75;
      const radius = 60;
      const points = config.data;
      const angleStep = (2 * Math.PI) / points.length;

      const radarPoints = points.map((point, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const value = (point.value / 100) * radius;
        const x = centerX + value * Math.cos(angle);
        const y = centerY + value * Math.sin(angle);
        return `${x},${y}`;
      }).join(' ');

      return (
        <div className="relative h-48 bg-surface rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 200 150">
            {/* Radar grid */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => (
              <circle
                key={scale}
                cx={centerX}
                cy={centerY}
                r={radius * scale}
                fill="none"
                stroke="#374151"
                strokeWidth="1"
                opacity="0.3"
              />
            ))}
            
            {/* Radar axes */}
            {points.map((_, index) => {
              const angle = index * angleStep - Math.PI / 2;
              const x2 = centerX + radius * Math.cos(angle);
              const y2 = centerY + radius * Math.sin(angle);
              return (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={x2}
                  y2={y2}
                  stroke="#374151"
                  strokeWidth="1"
                  opacity="0.3"
                />
              );
            })}
            
            {/* Data polygon */}
            <polygon
              points={radarPoints}
              fill={config.color}
              fillOpacity="0.3"
              stroke={config.color}
              strokeWidth="2"
            />
            
            {/* Data points */}
            {points.map((point, index) => {
              const angle = index * angleStep - Math.PI / 2;
              const value = (point.value / 100) * radius;
              const x = centerX + value * Math.cos(angle);
              const y = centerY + value * Math.sin(angle);
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={config.color}
                />
              );
            })}
            
            {/* Labels */}
            {points.map((point, index) => {
              const angle = index * angleStep - Math.PI / 2;
              const labelRadius = radius + 15;
              const x = centerX + labelRadius * Math.cos(angle);
              const y = centerY + labelRadius * Math.sin(angle);
              return (
                <text
                  key={index}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  className="text-xs fill-white"
                  dy="0.3em"
                >
                  {point.label}
                </text>
              );
            })}
          </svg>
        </div>
      );
    }

    if (config.type === 'heatmap') {
      const weeks = Math.ceil(chartData.length / 7);
      const cellSize = 280 / weeks;
      
      return (
        <div className="relative h-48 bg-surface rounded-lg p-4">
          <svg className="w-full h-full" viewBox="0 0 300 150">
            {chartData.map((point, index) => {
              const week = Math.floor(index / 7);
              const day = index % 7;
              const x = week * cellSize + 5;
              const y = day * (120 / 7) + 10;
              const intensity = (point.value / 10);
              
              return (
                <rect
                  key={index}
                  x={x}
                  y={y}
                  width={cellSize - 1}
                  height={(120 / 7) - 1}
                  fill={config.color}
                  opacity={intensity}
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                />
              );
            })}
            
            {/* Day labels */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <text
                key={day}
                x={2}
                y={index * (120 / 7) + 20}
                className="text-xs fill-white"
              >
                {day}
              </text>
            ))}
          </svg>
        </div>
      );
    }

    // Fallback placeholder
    return (
      <div className="h-48 bg-surface rounded-lg p-4 flex items-center justify-center">
        <div className="text-center text-text-secondary">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{config.type} chart rendering</p>
        </div>
      </div>
    );
  };

  const toggleChartVisibility = (chartTitle: string) => {
    const newVisible = new Set(visibleCharts);
    if (newVisible.has(chartTitle)) {
      newVisible.delete(chartTitle);
    } else {
      newVisible.add(chartTitle);
    }
    setVisibleCharts(newVisible);
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line': return <LineChart className="w-4 h-4" />;
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'area': return <Activity className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      case 'radar': return <Target className="w-4 h-4" />;
      case 'heatmap': return <Calendar className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const calculateTrend = (data: ChartDataPoint[]) => {
    if (data.length < 2) return 0;
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Generating Visualizations</h3>
            <p className="text-text-secondary">Processing your data and creating interactive charts...</p>
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
          <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-text-secondary">Interactive visualizations and data insights</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button onClick={generateVisualizationData} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', '1y'] as const).map((period) => (
          <Button
            key={period}
            variant={selectedTimeframe === period ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeframe(period)}
          >
            {period.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Chart Visibility Controls */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Chart Visibility
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {chartConfigs.map((config) => (
              <Button
                key={config.title}
                variant={visibleCharts.has(config.title) ? 'primary' : 'outline'}
                size="sm"
                onClick={() => toggleChartVisibility(config.title)}
                className="flex items-center gap-2"
              >
                {getChartIcon(config.type)}
                {config.title}
                {visibleCharts.has(config.title) ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {chartConfigs
          .filter(config => visibleCharts.has(config.title))
          .map((config) => {
            const trend = calculateTrend(config.data);
            const latest = config.data[config.data.length - 1]?.value || 0;
            
            return (
              <Card key={config.title}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.color}20` }}>
                        <div style={{ color: config.color }}>
                          {getChartIcon(config.type)}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{config.title}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="capitalize">
                            {config.type}
                          </Badge>
                          <span className="text-text-secondary">
                            Latest: {latest.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {trend > 0 ? <TrendingUp className="w-4 h-4" /> : trend < 0 ? <TrendingDown className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                        {Math.abs(trend).toFixed(1)}%
                      </div>
                      <Button variant="ghost" size="sm">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderChart(config)}
                  
                  {/* Chart Footer Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-white">
                        {Math.max(...config.data.map(d => d.value)).toFixed(1)}
                      </div>
                      <div className="text-text-secondary">Peak</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {(config.data.reduce((sum, d) => sum + d.value, 0) / config.data.length).toFixed(1)}
                      </div>
                      <div className="text-text-secondary">Average</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {config.data.length}
                      </div>
                      <div className="text-text-secondary">Data Points</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Key Insights
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <div>
                <div className="font-medium text-white">Improving Consistency</div>
                <div className="text-sm text-text-secondary">15% increase in workout frequency</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
              <Heart className="w-6 h-6 text-red-400" />
              <div>
                <div className="font-medium text-white">Cardio Progress</div>
                <div className="text-sm text-text-secondary">Heart rate efficiency up 8%</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
              <Flame className="w-6 h-6 text-orange-400" />
              <div>
                <div className="font-medium text-white">Calorie Goals</div>
                <div className="text-sm text-text-secondary">Exceeding daily targets by 12%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}