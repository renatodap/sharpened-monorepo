"use client";

import { useState } from 'react';
import { BarChart3, TrendingUp, Activity, Apple, Dumbbell, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for demonstration
const weightData = [
  { date: '2025-01-01', weight: 75.0 },
  { date: '2025-01-08', weight: 74.8 },
  { date: '2025-01-15', weight: 74.5 },
  { date: '2025-01-22', weight: 74.2 },
  { date: '2025-01-29', weight: 73.9 },
  { date: '2025-02-05', weight: 73.7 },
  { date: '2025-02-12', weight: 73.4 },
];

const nutritionData = [
  { date: '2025-02-06', calories: 2200, protein: 140, carbs: 250, fat: 75 },
  { date: '2025-02-07', calories: 2100, protein: 135, carbs: 220, fat: 80 },
  { date: '2025-02-08', calories: 2300, protein: 150, carbs: 280, fat: 70 },
  { date: '2025-02-09', calories: 2050, protein: 130, carbs: 200, fat: 85 },
  { date: '2025-02-10', calories: 2250, protein: 145, carbs: 260, fat: 72 },
  { date: '2025-02-11', calories: 2180, protein: 142, carbs: 240, fat: 78 },
  { date: '2025-02-12', calories: 2320, protein: 155, carbs: 290, fat: 68 },
];

const workoutData = [
  { week: 'Week 1', sessions: 3, volume: 12500 },
  { week: 'Week 2', sessions: 4, volume: 15200 },
  { week: 'Week 3', sessions: 3, volume: 13800 },
  { week: 'Week 4', sessions: 4, volume: 16100 },
  { week: 'Week 5', sessions: 5, volume: 18300 },
  { week: 'Week 6', sessions: 4, volume: 17200 },
];

type TimeRange = '7D' | '30D' | '90D' | 'YTD' | 'All';

export default function InsightsPage() {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>('30D');
  const [activeTab, setActiveTab] = useState<'weight'>('weight');

  const timeRanges: TimeRange[] = ['7D', '30D', '90D', 'YTD', 'All'];

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Insights</h1>
            <p className="text-text-secondary text-lg">Track your progress with clear visualizations</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex bg-surface border border-border rounded-xl">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setActiveTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTimeRange === range
                    ? 'bg-navy text-white'
                    : 'text-text-secondary hover:text-text-primary'
                } ${range === '7D' ? 'rounded-l-xl' : ''} ${range === 'All' ? 'rounded-r-xl' : ''}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation - MVP: Only Weight */}
        <div className="flex space-x-1 bg-surface border border-border rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveTab('weight')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-info text-white"
          >
            <Activity className="w-4 h-4" />
            Weight Progress
          </button>
        </div>


        {/* Weight Insights */}
        {activeTab === 'weight' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-text-secondary text-sm font-medium mb-2">Current Weight</h3>
                <div className="text-3xl font-bold">73.4kg</div>
                <div className="text-success text-sm">-0.3kg from last week</div>
              </div>
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-text-secondary text-sm font-medium mb-2">7-Day Average</h3>
                <div className="text-3xl font-bold">73.6kg</div>
                <div className="text-success text-sm">-0.2kg trend</div>
              </div>
              <div className="bg-surface border border-border rounded-xl p-6">
                <h3 className="text-text-secondary text-sm font-medium mb-2">Total Change</h3>
                <div className="text-3xl font-bold">-1.6kg</div>
                <div className="text-success text-sm">Since tracking started</div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-6">Weight Progress</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#23272E" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#8B9096"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke="#8B9096" 
                      tick={{ fontSize: 12 }}
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#161A1F', 
                        border: '1px solid #23272E', 
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }}
                      formatter={(value) => [`${value}kg`, 'Weight']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3B82F6" 
                      strokeWidth={3} 
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                      activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Empty State for No Data */}
        {/* This would be shown when user has no data */}
        {false && (
          <div className="bg-surface-2 border-2 border-dashed border-border rounded-xl p-12 text-center">
            <BarChart3 className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-secondary mb-2">
              Start tracking to see insights
            </h3>
            <p className="text-text-muted mb-6">
              Log your weight to generate meaningful progress charts
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="/weight"
                className="inline-flex items-center px-4 py-2 bg-info text-white rounded-lg hover:bg-info/90 transition-colors"
              >
                <Activity className="w-4 h-4 mr-2" />
                Add Weight
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}