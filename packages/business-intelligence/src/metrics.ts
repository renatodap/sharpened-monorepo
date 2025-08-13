// Core business metrics calculation
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, format } from 'date-fns';

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  churnedUsers: number;
  retentionRate: number;
  avgSessionDuration: number;
  avgDailySessions: number;
}

export interface RevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  arpu: number; // Average Revenue Per User
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost
  churnRate: number;
  growthRate: number;
}

export interface ProductMetrics {
  dau: number; // Daily Active Users
  wau: number; // Weekly Active Users
  mau: number; // Monthly Active Users
  stickiness: number; // DAU/MAU ratio
  featureAdoption: Record<string, number>;
  timeToValue: number; // Days to first value
}

export interface HealthMetrics {
  workoutsLogged: number;
  avgWorkoutsPerUser: number;
  foodEntriesLogged: number;
  avgFoodEntriesPerUser: number;
  weightEntriesLogged: number;
  activeStreaks: number;
  avgStreakLength: number;
}

export class MetricsCalculator {
  constructor(private databaseQueries: any) {}

  async calculateUserMetrics(timeframe: 'week' | 'month' = 'month'): Promise<UserMetrics> {
    const now = new Date();
    const start = timeframe === 'week' ? startOfWeek(now) : startOfMonth(now);
    const end = timeframe === 'week' ? endOfWeek(now) : endOfMonth(now);
    const previousStart = timeframe === 'week' ? startOfWeek(subDays(now, 7)) : startOfMonth(subDays(now, 30));

    // These would be actual database queries in implementation
    const totalUsers = await this.databaseQueries.getUserCount();
    const activeUsers = await this.databaseQueries.getActiveUserCount(start, end);
    const newUsers = await this.databaseQueries.getNewUserCount(start, end);
    const previousActiveUsers = await this.databaseQueries.getActiveUserCount(previousStart, start);
    const churnedUsers = Math.max(0, previousActiveUsers - activeUsers + newUsers);

    return {
      totalUsers,
      activeUsers,
      newUsers,
      churnedUsers,
      retentionRate: previousActiveUsers > 0 ? ((previousActiveUsers - churnedUsers) / previousActiveUsers) * 100 : 0,
      avgSessionDuration: await this.calculateAvgSessionDuration(start, end),
      avgDailySessions: await this.calculateAvgDailySessions(start, end),
    };
  }

  async calculateRevenueMetrics(): Promise<RevenueMetrics> {
    const now = new Date();
    const thisMonth = startOfMonth(now);
    const lastMonth = startOfMonth(subDays(now, 30));

    const currentMRR = await this.databaseQueries.getMRR(thisMonth);
    const previousMRR = await this.databaseQueries.getMRR(lastMonth);
    const totalUsers = await this.databaseQueries.getUserCount();
    const paidUsers = await this.databaseQueries.getPaidUserCount();

    return {
      mrr: currentMRR,
      arr: currentMRR * 12,
      arpu: paidUsers > 0 ? currentMRR / paidUsers : 0,
      ltv: await this.calculateLTV(),
      cac: await this.calculateCAC(),
      churnRate: await this.calculateChurnRate(),
      growthRate: previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0,
    };
  }

  async calculateProductMetrics(): Promise<ProductMetrics> {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const dau = await this.databaseQueries.getActiveUserCount(now, now);
    const wau = await this.databaseQueries.getActiveUserCount(weekStart, now);
    const mau = await this.databaseQueries.getActiveUserCount(monthStart, now);

    return {
      dau,
      wau,
      mau,
      stickiness: mau > 0 ? (dau / mau) * 100 : 0,
      featureAdoption: await this.calculateFeatureAdoption(monthStart, now),
      timeToValue: await this.calculateTimeToValue(),
    };
  }

  async calculateHealthMetrics(timeframe: 'week' | 'month' = 'month'): Promise<HealthMetrics> {
    const now = new Date();
    const start = timeframe === 'week' ? startOfWeek(now) : startOfMonth(now);
    const end = now;

    const workoutsLogged = await this.databaseQueries.getWorkoutCount(start, end);
    const foodEntriesLogged = await this.databaseQueries.getFoodEntryCount(start, end);
    const weightEntriesLogged = await this.databaseQueries.getWeightEntryCount(start, end);
    const activeUsers = await this.databaseQueries.getActiveUserCount(start, end);

    return {
      workoutsLogged,
      avgWorkoutsPerUser: activeUsers > 0 ? workoutsLogged / activeUsers : 0,
      foodEntriesLogged,
      avgFoodEntriesPerUser: activeUsers > 0 ? foodEntriesLogged / activeUsers : 0,
      weightEntriesLogged,
      activeStreaks: await this.databaseQueries.getActiveStreakCount(),
      avgStreakLength: await this.calculateAvgStreakLength(),
    };
  }

  private async calculateAvgSessionDuration(start: Date, end: Date): Promise<number> {
    // Calculate average session duration in minutes
    // This would query actual session data
    return 25; // Placeholder
  }

  private async calculateAvgDailySessions(start: Date, end: Date): Promise<number> {
    // Calculate average sessions per day per user
    return 1.8; // Placeholder
  }

  private async calculateLTV(): Promise<number> {
    // Lifetime Value = (Average Order Value) × (Number of Repeat Transactions) × (Gross Margin)
    const avgMonthlyRevenue = await this.databaseQueries.getAvgMonthlyRevenue();
    const avgCustomerLifespan = await this.databaseQueries.getAvgCustomerLifespan(); // in months
    return avgMonthlyRevenue * avgCustomerLifespan;
  }

  private async calculateCAC(): Promise<number> {
    // Customer Acquisition Cost = Total Acquisition Cost / Number of New Customers
    const totalMarketingSpend = await this.databaseQueries.getMarketingSpend();
    const newCustomers = await this.databaseQueries.getNewCustomerCount();
    return newCustomers > 0 ? totalMarketingSpend / newCustomers : 0;
  }

  private async calculateChurnRate(): Promise<number> {
    // Monthly churn rate
    const startOfLastMonth = startOfMonth(subDays(new Date(), 30));
    const customersStart = await this.databaseQueries.getPaidUserCount(startOfLastMonth);
    const customersEnd = await this.databaseQueries.getPaidUserCount();
    const churned = Math.max(0, customersStart - customersEnd);
    return customersStart > 0 ? (churned / customersStart) * 100 : 0;
  }

  private async calculateFeatureAdoption(start: Date, end: Date): Promise<Record<string, number>> {
    // Feature adoption rates
    const totalUsers = await this.databaseQueries.getActiveUserCount(start, end);
    
    return {
      workoutLogging: await this.databaseQueries.getFeatureUsage('workout_logging', start, end) / totalUsers * 100,
      foodLogging: await this.databaseQueries.getFeatureUsage('food_logging', start, end) / totalUsers * 100,
      weightTracking: await this.databaseQueries.getFeatureUsage('weight_tracking', start, end) / totalUsers * 100,
      aiCoach: await this.databaseQueries.getFeatureUsage('ai_coach', start, end) / totalUsers * 100,
      progressGraphs: await this.databaseQueries.getFeatureUsage('progress_graphs', start, end) / totalUsers * 100,
    };
  }

  private async calculateTimeToValue(): Promise<number> {
    // Average days from signup to first valuable action
    return await this.databaseQueries.getAvgTimeToValue();
  }

  private async calculateAvgStreakLength(): Promise<number> {
    // Average streak length across all users
    return await this.databaseQueries.getAvgStreakLength();
  }
}

// Utility functions for metric calculations
export const metricUtils = {
  // Calculate percentage change
  percentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  // Calculate compound growth rate
  cagr(startValue: number, endValue: number, periods: number): number {
    if (startValue <= 0 || periods <= 0) return 0;
    return (Math.pow(endValue / startValue, 1 / periods) - 1) * 100;
  },

  // Format metrics for display
  formatMetric(value: number, type: 'currency' | 'percentage' | 'number'): string {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  },

  // Calculate trend (up, down, flat)
  getTrend(current: number, previous: number): 'up' | 'down' | 'flat' {
    const change = this.percentageChange(current, previous);
    if (Math.abs(change) < 1) return 'flat';
    return change > 0 ? 'up' : 'down';
  },
};