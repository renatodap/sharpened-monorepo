'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, Activity, TrendingUp, Settings, Flag, Database, BarChart3 } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { UserMetrics, RevenueMetrics, ProductMetrics, HealthMetrics } from '@/lib/types/database';

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [productMetrics, setProductMetrics] = useState<ProductMetrics | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchMetrics();
  }, [selectedTimeframe]);

  const fetchMetrics = async () => {
    try {
      const [userRes, revenueRes, productRes, healthRes] = await Promise.all([
        fetch(`/api/admin/metrics/users?timeframe=${selectedTimeframe}`),
        fetch('/api/admin/metrics/revenue'),
        fetch('/api/admin/metrics/product'),
        fetch(`/api/admin/metrics/health?timeframe=${selectedTimeframe}`),
      ]);

      if (userRes.ok) setUserMetrics(await userRes.json());
      if (revenueRes.ok) setRevenueMetrics(await revenueRes.json());
      if (productRes.ok) setProductMetrics(await productRes.json());
      if (healthRes.ok) setHealthMetrics(await healthRes.json());

    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatNumber = (value: number) => value.toLocaleString();

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text-primary">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-border rounded mb-8 w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-surface border border-border rounded-xl p-6">
                  <div className="h-4 bg-border rounded mb-4"></div>
                  <div className="h-8 bg-border rounded mb-2"></div>
                  <div className="h-4 bg-border rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-text-secondary text-lg">
              Business overview and management tools
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={selectedTimeframe === 'week' ? 'primary' : 'outline'}
              onClick={() => setSelectedTimeframe('week')}
              size="sm"
            >
              Week
            </Button>
            <Button
              variant={selectedTimeframe === 'month' ? 'primary' : 'outline'}
              onClick={() => setSelectedTimeframe('month')}
              size="sm"
            >
              Month
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Users */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-xs text-text-muted uppercase tracking-wider">Users</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {userMetrics ? formatNumber(userMetrics.activeUsers) : '-'}
            </div>
            <div className="text-sm text-text-secondary">
              Active {selectedTimeframe === 'week' ? 'this week' : 'this month'}
            </div>
            {userMetrics && (
              <div className="text-xs text-success mt-2">
                +{formatNumber(userMetrics.newUsers)} new users
              </div>
            )}
          </div>

          {/* Revenue */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs text-text-muted uppercase tracking-wider">Revenue</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {revenueMetrics ? formatCurrency(revenueMetrics.mrr) : '-'}
            </div>
            <div className="text-sm text-text-secondary">Monthly Recurring</div>
            {revenueMetrics && (
              <div className={`text-xs mt-2 ${revenueMetrics.growthRate >= 0 ? 'text-success' : 'text-red-400'}`}>
                {revenueMetrics.growthRate >= 0 ? '+' : ''}{formatPercentage(revenueMetrics.growthRate)} growth
              </div>
            )}
          </div>

          {/* Product Usage */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-xs text-text-muted uppercase tracking-wider">Engagement</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {productMetrics ? formatPercentage(productMetrics.stickiness) : '-'}
            </div>
            <div className="text-sm text-text-secondary">DAU/MAU Stickiness</div>
            {productMetrics && (
              <div className="text-xs text-text-muted mt-2">
                {formatNumber(productMetrics.dau)} daily active
              </div>
            )}
          </div>

          {/* Health Activity */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <span className="text-xs text-text-muted uppercase tracking-wider">Activity</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {healthMetrics ? formatNumber(healthMetrics.workoutsLogged) : '-'}
            </div>
            <div className="text-sm text-text-secondary">
              Workouts {selectedTimeframe === 'week' ? 'this week' : 'this month'}
            </div>
            {healthMetrics && (
              <div className="text-xs text-text-muted mt-2">
                {healthMetrics.avgWorkoutsPerUser.toFixed(1)} avg/user
              </div>
            )}
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Analytics */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">User Analytics</h3>
            {userMetrics ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Users</span>
                  <span className="font-medium">{formatNumber(userMetrics.totalUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Active Users</span>
                  <span className="font-medium">{formatNumber(userMetrics.activeUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">New Users</span>
                  <span className="font-medium text-success">{formatNumber(userMetrics.newUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Churned Users</span>
                  <span className="font-medium text-red-400">{formatNumber(userMetrics.churnedUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Retention Rate</span>
                  <span className="font-medium">{formatPercentage(userMetrics.retentionRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Avg Session Duration</span>
                  <span className="font-medium">{userMetrics.avgSessionDuration}m</span>
                </div>
              </div>
            ) : (
              <div className="text-text-muted">Loading user analytics...</div>
            )}
          </div>

          {/* Revenue Analytics */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
            {revenueMetrics ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Monthly Recurring Revenue</span>
                  <span className="font-medium">{formatCurrency(revenueMetrics.mrr)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Annual Recurring Revenue</span>
                  <span className="font-medium">{formatCurrency(revenueMetrics.arr)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Average Revenue Per User</span>
                  <span className="font-medium">{formatCurrency(revenueMetrics.arpu)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Customer Lifetime Value</span>
                  <span className="font-medium">{formatCurrency(revenueMetrics.ltv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Customer Acquisition Cost</span>
                  <span className="font-medium">{formatCurrency(revenueMetrics.cac)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Monthly Churn Rate</span>
                  <span className="font-medium text-red-400">{formatPercentage(revenueMetrics.churnRate)}</span>
                </div>
              </div>
            ) : (
              <div className="text-text-muted">Loading revenue analytics...</div>
            )}
          </div>
        </div>

        {/* Feature Adoption */}
        {productMetrics && (
          <div className="bg-surface border border-border rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Feature Adoption</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(productMetrics.featureAdoption).map(([feature, percentage]) => (
                <div key={feature} className="text-center">
                  <div className="text-2xl font-bold text-navy mb-1">{formatPercentage(percentage)}</div>
                  <div className="text-sm text-text-secondary capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="w-full bg-border rounded-full h-1 mt-2">
                    <div 
                      className="bg-navy h-1 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health & Fitness Metrics */}
        {healthMetrics && (
          <div className="bg-surface border border-border rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Health & Fitness Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {formatNumber(healthMetrics.workoutsLogged)}
                </div>
                <div className="text-sm text-text-secondary">Workouts Logged</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {formatNumber(healthMetrics.foodEntriesLogged)}
                </div>
                <div className="text-sm text-text-secondary">Food Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {formatNumber(healthMetrics.weightEntriesLogged)}
                </div>
                <div className="text-sm text-text-secondary">Weight Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {formatNumber(healthMetrics.activeStreaks)}
                </div>
                <div className="text-sm text-text-secondary">Active Streaks</div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tools */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Admin Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2 justify-center py-8"
              onClick={() => window.location.href = '/admin/users'}
            >
              <Users className="w-5 h-5" />
              User Management
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 justify-center py-8"
              onClick={() => window.location.href = '/admin/feature-flags'}
            >
              <Flag className="w-5 h-5" />
              Feature Flags
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 justify-center py-8"
              onClick={() => window.location.href = '/admin/database'}
            >
              <Database className="w-5 h-5" />
              Database Tools
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 justify-center py-8"
              onClick={() => window.location.href = '/admin/reports'}
            >
              <BarChart3 className="w-5 h-5" />
              Reports
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}