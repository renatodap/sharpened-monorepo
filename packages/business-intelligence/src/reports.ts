// Business reporting utilities
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import type { UserMetrics, RevenueMetrics, ProductMetrics, HealthMetrics } from './metrics';

export interface BusinessReport {
  period: string;
  generatedAt: Date;
  summary: ReportSummary;
  sections: ReportSection[];
  recommendations: string[];
}

export interface ReportSummary {
  keyInsights: string[];
  alertsAndConcerns: string[];
  winsCelebrations: string[];
}

export interface ReportSection {
  title: string;
  type: 'metrics' | 'chart' | 'table' | 'text';
  data: any;
  insights?: string[];
}

export class BusinessReporter {
  constructor(private metricsCalculator: any) {}

  async generateWeeklyReport(): Promise<BusinessReport> {
    const now = new Date();
    const period = `${format(startOfWeek(now), 'MMM dd')} - ${format(endOfWeek(now), 'MMM dd, yyyy')}`;

    const [userMetrics, revenueMetrics, productMetrics, healthMetrics] = await Promise.all([
      this.metricsCalculator.calculateUserMetrics('week'),
      this.metricsCalculator.calculateRevenueMetrics(),
      this.metricsCalculator.calculateProductMetrics(),
      this.metricsCalculator.calculateHealthMetrics('week'),
    ]);

    const sections = [
      this.createUserMetricsSection(userMetrics),
      this.createRevenueSection(revenueMetrics),
      this.createProductSection(productMetrics),
      this.createHealthSection(healthMetrics),
      this.createTrendAnalysisSection(),
    ];

    const summary = this.generateSummary(userMetrics, revenueMetrics, productMetrics, healthMetrics);
    const recommendations = this.generateRecommendations(userMetrics, revenueMetrics, productMetrics);

    return {
      period,
      generatedAt: now,
      summary,
      sections,
      recommendations,
    };
  }

  async generateMonthlyReport(): Promise<BusinessReport> {
    const now = new Date();
    const period = format(now, 'MMMM yyyy');

    const [userMetrics, revenueMetrics, productMetrics, healthMetrics] = await Promise.all([
      this.metricsCalculator.calculateUserMetrics('month'),
      this.metricsCalculator.calculateRevenueMetrics(),
      this.metricsCalculator.calculateProductMetrics(),
      this.metricsCalculator.calculateHealthMetrics('month'),
    ]);

    const sections = [
      this.createExecutiveSummary(userMetrics, revenueMetrics),
      this.createUserMetricsSection(userMetrics),
      this.createRevenueSection(revenueMetrics),
      this.createProductSection(productMetrics),
      this.createHealthSection(healthMetrics),
      this.createCohortAnalysisSection(),
      this.createCompetitiveAnalysisSection(),
    ];

    const summary = this.generateSummary(userMetrics, revenueMetrics, productMetrics, healthMetrics);
    const recommendations = this.generateStrategicRecommendations(userMetrics, revenueMetrics, productMetrics);

    return {
      period,
      generatedAt: now,
      summary,
      sections,
      recommendations,
    };
  }

  private createExecutiveSummary(userMetrics: UserMetrics, revenueMetrics: RevenueMetrics): ReportSection {
    return {
      title: 'Executive Summary',
      type: 'metrics',
      data: {
        totalUsers: userMetrics.totalUsers,
        activeUsers: userMetrics.activeUsers,
        mrr: revenueMetrics.mrr,
        growthRate: revenueMetrics.growthRate,
      },
      insights: [
        `${userMetrics.activeUsers} active users this month`,
        `$${revenueMetrics.mrr.toFixed(0)} MRR with ${revenueMetrics.growthRate.toFixed(1)}% growth`,
        `${userMetrics.retentionRate.toFixed(1)}% user retention rate`,
      ],
    };
  }

  private createUserMetricsSection(userMetrics: UserMetrics): ReportSection {
    return {
      title: 'User Growth & Engagement',
      type: 'metrics',
      data: userMetrics,
      insights: [
        `Added ${userMetrics.newUsers} new users`,
        `${userMetrics.retentionRate.toFixed(1)}% retention rate`,
        `Average ${userMetrics.avgDailySessions.toFixed(1)} sessions per user per day`,
      ],
    };
  }

  private createRevenueSection(revenueMetrics: RevenueMetrics): ReportSection {
    return {
      title: 'Revenue & Business Metrics',
      type: 'metrics',
      data: revenueMetrics,
      insights: [
        `$${revenueMetrics.mrr.toFixed(0)} Monthly Recurring Revenue`,
        `$${revenueMetrics.arpu.toFixed(2)} Average Revenue Per User`,
        `${revenueMetrics.churnRate.toFixed(2)}% monthly churn rate`,
      ],
    };
  }

  private createProductSection(productMetrics: ProductMetrics): ReportSection {
    return {
      title: 'Product Usage',
      type: 'metrics',
      data: productMetrics,
      insights: [
        `${productMetrics.stickiness.toFixed(1)}% stickiness ratio (DAU/MAU)`,
        `${productMetrics.timeToValue} days average time to value`,
        `Top feature: ${this.getTopFeature(productMetrics.featureAdoption)}`,
      ],
    };
  }

  private createHealthSection(healthMetrics: HealthMetrics): ReportSection {
    return {
      title: 'Health & Fitness Tracking',
      type: 'metrics',
      data: healthMetrics,
      insights: [
        `${healthMetrics.workoutsLogged} workouts logged this period`,
        `${healthMetrics.avgWorkoutsPerUser.toFixed(1)} workouts per active user`,
        `${healthMetrics.activeStreaks} users with active streaks`,
      ],
    };
  }

  private createTrendAnalysisSection(): ReportSection {
    return {
      title: 'Trend Analysis',
      type: 'chart',
      data: {
        // This would contain chart data for trends
        timeframe: 'last_30_days',
        metrics: ['users', 'revenue', 'engagement'],
      },
      insights: [
        'User growth accelerating in the last two weeks',
        'Revenue growth stable month-over-month',
        'Engagement dip on weekends, peak on Tuesdays',
      ],
    };
  }

  private createCohortAnalysisSection(): ReportSection {
    return {
      title: 'Cohort Analysis',
      type: 'table',
      data: {
        // Cohort retention data by signup month
        cohorts: [
          { month: 'Dec 2024', retained: [100, 85, 72, 65] },
          { month: 'Jan 2025', retained: [100, 88, 75] },
          { month: 'Feb 2025', retained: [100, 90] },
        ],
      },
      insights: [
        'New user cohorts showing improved retention',
        'Month 1 retention improved from 85% to 90%',
        'Need to focus on 3+ month retention',
      ],
    };
  }

  private createCompetitiveAnalysisSection(): ReportSection {
    return {
      title: 'Market Position',
      type: 'text',
      data: {
        content: `
## Competitive Landscape
- MyFitnessPal: 200M+ users, dominant in food logging
- Strong: 50M+ users, focused on gym workouts  
- Cronometer: Premium nutrition tracking, smaller user base
- Apple Health/Google Fit: Platform integration advantages

## Our Differentiators
- AI-powered natural language parsing
- Zero-friction logging experience
- Evidence-based coaching insights
- Dark-first, minimal design

## Strategic Opportunities
- Mobile app launch to compete directly
- API integrations with wearables
- Social features for accountability
        `,
      },
      insights: [
        'Market opportunity remains large with 500M+ fitness app users globally',
        'AI-first approach differentiates from legacy solutions',
        'Premium positioning working with $9.99 pricing',
      ],
    };
  }

  private generateSummary(
    userMetrics: UserMetrics,
    revenueMetrics: RevenueMetrics,
    productMetrics: ProductMetrics,
    healthMetrics: HealthMetrics
  ): ReportSummary {
    const keyInsights = [
      `${userMetrics.activeUsers} active users with ${userMetrics.retentionRate.toFixed(1)}% retention`,
      `$${revenueMetrics.mrr.toFixed(0)} MRR growing at ${revenueMetrics.growthRate.toFixed(1)}% month-over-month`,
      `${productMetrics.stickiness.toFixed(1)}% user stickiness (DAU/MAU ratio)`,
      `${healthMetrics.avgWorkoutsPerUser.toFixed(1)} average workouts per user`,
    ];

    const alertsAndConcerns = [];
    if (revenueMetrics.churnRate > 10) {
      alertsAndConcerns.push(`High churn rate: ${revenueMetrics.churnRate.toFixed(2)}%`);
    }
    if (productMetrics.stickiness < 15) {
      alertsAndConcerns.push(`Low stickiness: ${productMetrics.stickiness.toFixed(1)}%`);
    }
    if (userMetrics.retentionRate < 60) {
      alertsAndConcerns.push(`Retention below target: ${userMetrics.retentionRate.toFixed(1)}%`);
    }

    const winsCelebrations = [];
    if (userMetrics.newUsers > 50) {
      winsCelebrations.push(`Strong user acquisition: ${userMetrics.newUsers} new users`);
    }
    if (revenueMetrics.growthRate > 20) {
      winsCelebrations.push(`Excellent revenue growth: ${revenueMetrics.growthRate.toFixed(1)}%`);
    }
    if (healthMetrics.activeStreaks > 100) {
      winsCelebrations.push(`${healthMetrics.activeStreaks} users maintaining active streaks`);
    }

    return {
      keyInsights,
      alertsAndConcerns,
      winsCelebrations,
    };
  }

  private generateRecommendations(
    userMetrics: UserMetrics,
    revenueMetrics: RevenueMetrics,
    productMetrics: ProductMetrics
  ): string[] {
    const recommendations = [];

    // User growth recommendations
    if (userMetrics.newUsers < 20) {
      recommendations.push('Focus on user acquisition - consider increasing marketing spend or improving onboarding');
    }

    // Retention recommendations  
    if (userMetrics.retentionRate < 70) {
      recommendations.push('Improve user retention with better onboarding and weekly review cycles');
    }

    // Revenue recommendations
    if (revenueMetrics.arpu < 8) {
      recommendations.push('Increase ARPU through feature upsells or premium tier optimization');
    }

    // Product recommendations
    if (productMetrics.stickiness < 20) {
      recommendations.push('Improve daily engagement with habit-building features and notifications');
    }

    // Feature adoption recommendations
    const topFeature = this.getTopFeature(productMetrics.featureAdoption);
    const lowestFeature = this.getLowestFeature(productMetrics.featureAdoption);
    recommendations.push(`Double down on ${topFeature} success and improve ${lowestFeature} adoption`);

    return recommendations;
  }

  private generateStrategicRecommendations(
    userMetrics: UserMetrics,
    revenueMetrics: RevenueMetrics,
    productMetrics: ProductMetrics
  ): string[] {
    const recommendations = this.generateRecommendations(userMetrics, revenueMetrics, productMetrics);

    // Add strategic recommendations
    recommendations.push(
      'Consider mobile app development to capture mobile-first users',
      'Explore API partnerships with popular fitness wearables',
      'Investigate international expansion to English-speaking markets',
      'Develop enterprise/team features for B2B revenue streams'
    );

    return recommendations;
  }

  private getTopFeature(featureAdoption: Record<string, number>): string {
    return Object.entries(featureAdoption)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
  }

  private getLowestFeature(featureAdoption: Record<string, number>): string {
    return Object.entries(featureAdoption)
      .sort(([,a], [,b]) => a - b)[0]?.[0] || 'unknown';
  }
}