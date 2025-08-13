# Sharpened Business Operations Manual

*Last Updated: January 13, 2025*

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Model](#business-model)
3. [Product Portfolio](#product-portfolio)
4. [Technology Infrastructure](#technology-infrastructure)
5. [Operations Workflows](#operations-workflows)
6. [Customer Success](#customer-success)
7. [Growth Strategy](#growth-strategy)
8. [Financial Management](#financial-management)
9. [Risk Management](#risk-management)
10. [Appendices](#appendices)

---

## Executive Summary

### Mission Statement
Sharpened helps people become the sharpened version of themselves through AI-powered personal improvement tools that remove friction from fitness tracking, learning, and habit formation.

### Current Status (Q1 2025)
- **Monthly Active Users**: ~900 (projected)
- **Monthly Recurring Revenue**: ~$13K (projected)
- **Product Focus**: Feel Sharper (fitness tracking) with Study Sharper in development
- **Team Size**: 1 (founder/developer) + AI assistance
- **Business Stage**: Early growth, approaching product-market fit

### Key Performance Indicators
- **North Star Metric**: Weekly Active Users (users logging ≥3 items/week)
- **Growth Target**: 20% MoM user growth
- **Revenue Target**: $10K MRR by Q2 2025
- **Retention Target**: 40% six-month retention rate

---

## Business Model

### Revenue Streams

#### Primary: Subscription SaaS (B2C)
- **Free Tier**: Basic tracking (food, workouts, weight)
- **Basic Tier ($4.99/month)**: AI coach, advanced insights, unlimited tracking
- **Premium Tier ($9.99/month)**: All features + program templates, priority support

#### Secondary: API Access (B2B)
- **Developer API**: $0.01 per AI analysis call
- **White-label Solutions**: Custom pricing based on usage

### Value Propositions

#### For Free Users
- Zero-friction logging with natural language parsing
- Beautiful, dark-first interface optimized for daily use
- Core tracking functionality without artificial limitations

#### For Paid Users
- AI-powered insights and coaching recommendations
- Advanced analytics with trend analysis
- Structured workout programs with progression tracking
- Priority email support and feature requests

### Competitive Advantages
1. **AI-First Architecture**: Natural language parsing eliminates logging friction
2. **Evidence-Based Approach**: No vanity metrics, transparent methodology
3. **Developer-Friendly**: Clean codebase, comprehensive documentation
4. **Privacy-Focused**: No data sales, minimal data collection
5. **Design Excellence**: Dark-first UI optimized for daily engagement

---

## Product Portfolio

### Feel Sharper (Flagship Product)

#### Core Features
- **Natural Language Workout Parsing**: "Bench press 3x8 at 100kg" → structured data
- **Comprehensive Food Logging**: 8,000+ verified USDA foods database
- **Weight Tracking with Trends**: 7-day EMA smoothing for accurate progress
- **AI Coach Integration**: Personalized insights based on user patterns
- **Progress Visualization**: Recharts-powered graphs and analytics

#### User Journey
1. **Discovery**: Landing page emphasizing zero-friction promise
2. **Onboarding**: Quick setup with goal selection and preferences
3. **Habit Formation**: Daily logging with streak tracking
4. **Value Realization**: Weekly AI-generated progress reviews
5. **Upgrade Decision**: Premium features unlock after usage patterns establish
6. **Retention**: Ongoing coaching and program progression

#### Technical Architecture
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI/ML**: Anthropic Claude + OpenAI Embeddings
- **Infrastructure**: Vercel deployment with Cloudflare CDN

### Study Sharper (Development Stage)

#### Planned Features
- **PDF Content Ingestion**: AI-powered document processing
- **Spaced Repetition Flashcards**: SM-2 algorithm implementation
- **Study Schedule Generation**: Adaptive planning based on content volume
- **Progress Analytics**: Learning velocity and retention metrics

#### Development Timeline
- **Q1 2025**: Core PDF processing and flashcard system
- **Q2 2025**: Study planning and analytics
- **Q3 2025**: Social features and study groups
- **Q4 2025**: Mobile app for both products

---

## Technology Infrastructure

### Monorepo Architecture

```
sharpened-monorepo/
├── apps/
│   ├── website/          # Marketing site
│   ├── feelsharper/      # Fitness tracking app
│   └── studysharper/     # Study tools app
├── packages/
│   ├── ai-core/          # AI providers and agents
│   ├── database/         # Shared database utilities
│   ├── automation/       # Workflow automation
│   ├── analytics/        # Business intelligence
│   ├── feature-flags/    # A/B testing and rollouts
│   ├── email/           # Transactional emails
│   ├── payments/        # Subscription management
│   └── ui/              # Shared components
└── docs/                # Business documentation
```

### Core Technologies
- **Development**: TypeScript, Node.js, pnpm workspaces
- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Supabase, PostgreSQL, Row Level Security
- **AI/ML**: Claude (chat), OpenAI (embeddings), custom parsers
- **Infrastructure**: Vercel, Cloudflare, Resend (email)
- **Monitoring**: Built-in analytics, error tracking
- **Testing**: Jest, Playwright, custom test utilities

### Shared Package System

#### `@sharpened/ai-core`
- **ClaudeProvider**: Chat completions with streaming
- **OpenAIProvider**: Embeddings and legacy models
- **Specialized Agents**: FitnessCoach, NutritionCoach, StudyCoach
- **Parsing Utilities**: Workout, food, study content parsers

#### `@sharpened/automation`
- **Workflow Engine**: Event-driven automation
- **Trigger System**: Schedule, webhook, event-based triggers
- **Action Library**: Email, database, AI analysis actions
- **Pre-built Templates**: Welcome sequences, retention campaigns

#### `@sharpened/business-intelligence`
- **Metrics Calculator**: User, revenue, product, health metrics
- **Report Generator**: Automated weekly/monthly reports
- **Dashboard Components**: Real-time business analytics
- **Cohort Analysis**: User retention and engagement tracking

---

## Operations Workflows

### Daily Operations

#### 8:00 AM - Daily Metrics Review
- Check admin dashboard for key metrics
- Review overnight user activity and system health
- Monitor revenue and subscription changes
- Identify any critical issues requiring attention

#### 10:00 AM - Customer Support
- Process support emails and feature requests
- Update documentation based on common questions
- Engage with community feedback and social media

#### 2:00 PM - Product Development
- Code new features based on roadmap priorities
- Fix bugs and optimize performance
- Update tests and documentation
- Deploy improvements to production

#### 5:00 PM - Business Analysis
- Analyze user behavior and engagement patterns
- Review funnel metrics and conversion rates
- Plan next day's priorities and objectives

### Weekly Operations

#### Monday: Planning & Strategy
- Review previous week's performance against goals
- Set priorities for the week based on data
- Update roadmap and timeline estimates
- Plan content creation and marketing activities

#### Wednesday: Customer Research
- Analyze support tickets for product insights
- Review user feedback and feature requests
- Conduct user interviews when possible
- Update persona and use case documentation

#### Friday: Performance Review
- Generate automated weekly business report
- Review financial performance and projections
- Assess product development velocity
- Plan weekend maintenance and improvements

### Monthly Operations

#### Business Review
- Comprehensive metrics analysis and reporting
- Financial review including cash flow projection
- Product-market fit assessment
- Competitive analysis update
- Risk assessment and mitigation planning

#### Product Planning
- Roadmap review and adjustment
- Feature prioritization based on usage data
- Technical debt assessment
- Infrastructure scaling preparation

---

## Customer Success

### User Onboarding Journey

#### Day 0: Registration
- **Automated**: Welcome email with quick start guide
- **Goal**: Complete first workout or food log within 24 hours
- **Success Metric**: 70% activation rate

#### Days 1-7: Habit Formation
- **Automated**: Daily tips via email for first week
- **Manual**: Personal follow-up for high-value signups
- **Goal**: Log at least 3 items during first week
- **Success Metric**: 60% week-1 retention

#### Days 8-30: Value Realization
- **Automated**: Weekly progress reports with AI insights
- **Trigger**: Premium upgrade prompts for active users
- **Goal**: Experience clear value from AI coaching
- **Success Metric**: 40% month-1 retention

#### Days 31+: Long-term Engagement
- **Automated**: Monthly deep-dive reports
- **Community**: Feature in success stories (with permission)
- **Goal**: Establish consistent usage patterns
- **Success Metric**: 25% month-6 retention

### Support Operations

#### Tier 1: Automated Support
- **FAQ Chatbot**: Common questions with instant answers
- **Help Documentation**: Searchable knowledge base
- **Video Tutorials**: Screen recordings for complex features

#### Tier 2: Human Support
- **Email Support**: Response within 24 hours
- **Feature Requests**: Track and prioritize user suggestions
- **Bug Reports**: Immediate triage and resolution timeline

#### Tier 3: Customer Success
- **Premium User Success**: Proactive outreach for high-value users
- **Churn Prevention**: Automated campaigns for at-risk users
- **Power User Program**: Beta testing and advisory relationships

---

## Growth Strategy

### Organic Growth Channels

#### Content Marketing
- **SEO-Optimized Blog**: Fitness and productivity topics
- **YouTube Channel**: Product demos and tutorials
- **Social Media**: Twitter/X for developer community
- **Newsletter**: Weekly tips and product updates

#### Community Building
- **Discord Server**: User community and support
- **GitHub Discussions**: Open source components
- **Product Hunt**: Launch announcements
- **Indie Hacker Community**: Transparent building journey

#### Referral Program
- **User Referrals**: Free premium month for successful referrals
- **Developer Referrals**: API credits for integration partners
- **Influencer Partnerships**: Fitness and productivity YouTubers

### Paid Growth Channels

#### Phase 1: Validation (Current)
- **Google Ads**: High-intent fitness tracking keywords
- **Budget**: $500-1000/month with careful tracking
- **Goal**: CAC < 3-month LTV validation

#### Phase 2: Scale (Q2 2025)
- **Facebook/Instagram Ads**: Lookalike audiences
- **LinkedIn Ads**: Productivity-focused professionals
- **Podcast Sponsorships**: Fitness and productivity shows
- **Budget**: $2000-5000/month with proven unit economics

### Product-Led Growth

#### Viral Mechanisms
- **Progress Sharing**: Beautiful charts for social media
- **Workout Buddy Features**: Accountability partnerships
- **Public Profiles**: Optional progress showcasing
- **API Integrations**: Fitness app ecosystem connections

#### Expansion Strategy
- **Feature Expansion**: Add habit tracking, meal planning
- **Platform Expansion**: Mobile apps for iOS and Android
- **Market Expansion**: International localization
- **Vertical Expansion**: B2B wellness programs

---

## Financial Management

### Revenue Projections (2025)

#### Q1 2025
- **Target MRR**: $15K
- **Free Users**: 2,000
- **Paid Users**: 800 (40% conversion)
- **ARPU**: $7.50

#### Q2 2025
- **Target MRR**: $25K
- **Free Users**: 4,000
- **Paid Users**: 1,400 (35% conversion)
- **ARPU**: $8.20

#### Q3 2025
- **Target MRR**: $40K
- **Free Users**: 7,000
- **Paid Users**: 2,300 (33% conversion)
- **ARPU**: $8.75

#### Q4 2025
- **Target MRR**: $60K
- **Free Users**: 12,000
- **Paid Users**: 3,500 (29% conversion)
- **ARPU**: $9.15

### Cost Structure

#### Fixed Costs (Monthly)
- **Infrastructure**: $200-500 (Vercel, Supabase, CDN)
- **SaaS Tools**: $300-600 (Email, Analytics, Support)
- **AI/ML APIs**: $400-1000 (Claude, OpenAI usage-based)
- **Legal/Accounting**: $200-400
- **Domain/Security**: $50-100

#### Variable Costs
- **Customer Acquisition**: 20-30% of revenue
- **Payment Processing**: 3% of revenue
- **Support**: $2-5 per support ticket
- **Hosting**: $0.10-0.20 per active user per month

#### Profitability Timeline
- **Break-even**: $8K MRR (Q1 2025 target)
- **Default Alive**: $15K MRR with 6 months runway
- **Sustainable Growth**: $25K MRR with reinvestment capability

### Financial Controls

#### Monthly Reviews
- **Cash Flow Analysis**: Track burn rate and runway
- **Unit Economics**: Monitor CAC, LTV, churn rate
- **Revenue Recognition**: Subscription accounting accuracy
- **Expense Management**: Optimize tool spending

#### Quarterly Planning
- **Budget Forecasting**: Next quarter expense planning
- **Investment Priorities**: Feature development vs growth
- **Fundraising Decisions**: Bootstrap vs external funding
- **Tax Optimization**: Quarterly estimated payments

---

## Risk Management

### Technical Risks

#### Dependency Risks
- **Mitigation**: Multi-provider strategy for critical services
- **AI Provider Changes**: Prepared for API changes/pricing
- **Infrastructure Outages**: Monitoring and failover procedures
- **Security Breaches**: Regular security audits and updates

#### Scalability Risks
- **Database Performance**: Query optimization and indexing
- **API Rate Limits**: Caching and request optimization
- **Cost Explosion**: Usage monitoring and alerts
- **Technical Debt**: Regular refactoring and testing

### Business Risks

#### Market Risks
- **Competition**: Large incumbents entering market
- **Economic Downturn**: Subscription spending reduction
- **Regulatory Changes**: Privacy and health data regulations
- **Technology Shifts**: Mobile-first user behavior

#### Operational Risks
- **Single Founder Risk**: Documentation and process automation
- **Customer Concentration**: Diversified user acquisition
- **Feature Creep**: Focus on core value proposition
- **Burnout Prevention**: Sustainable work practices

### Legal and Compliance

#### Data Protection
- **GDPR Compliance**: EU user data handling
- **CCPA Compliance**: California privacy rights
- **Health Data**: HIPAA considerations for fitness data
- **International**: Data residency requirements

#### Intellectual Property
- **Trademark Protection**: Brand name registration
- **Code Protection**: Open source licensing strategy
- **Patent Considerations**: Defensive patent research
- **Terms of Service**: Regular legal review and updates

---

## Appendices

### Appendix A: Standard Operating Procedures

#### Code Deployment Process
1. Feature development in feature branch
2. Comprehensive testing (unit, integration, e2e)
3. Code review and TypeScript validation
4. Staging deployment and QA testing
5. Production deployment with monitoring
6. Post-deployment verification and rollback procedures

#### Customer Support Process
1. Ticket creation via email or in-app
2. Automatic categorization and priority assignment
3. First response within 24 hours (4 hours for premium)
4. Resolution with user confirmation
5. Follow-up satisfaction survey
6. Knowledge base article creation for common issues

### Appendix B: Emergency Response Procedures

#### System Outage Response
1. **Detection**: Automated monitoring alerts
2. **Assessment**: Determine scope and impact
3. **Communication**: Status page and user notifications
4. **Resolution**: Fix deployment or service restoration
5. **Post-mortem**: Root cause analysis and prevention

#### Security Incident Response
1. **Identification**: Security alert or user report
2. **Containment**: Immediate threat mitigation
3. **Assessment**: Scope of potential data exposure
4. **Notification**: User and regulatory notifications as required
5. **Recovery**: System restoration and security hardening

### Appendix C: Key Metrics Definitions

#### User Metrics
- **Daily Active Users (DAU)**: Users who log at least one item per day
- **Weekly Active Users (WAU)**: Users who log at least three items per week
- **Monthly Active Users (MAU)**: Users who log at least one item per month
- **Stickiness**: DAU/MAU ratio indicating engagement quality

#### Business Metrics
- **Monthly Recurring Revenue (MRR)**: Normalized monthly subscription revenue
- **Customer Acquisition Cost (CAC)**: Total acquisition cost / new customers
- **Lifetime Value (LTV)**: Average revenue per user over subscription lifetime
- **Churn Rate**: Monthly cancellation rate for paying customers

#### Product Metrics
- **Time to Value**: Days from signup to first AI-generated insight
- **Feature Adoption**: Percentage of users using key features
- **Support Ticket Rate**: Tickets per 100 active users per month
- **Net Promoter Score (NPS)**: User satisfaction and referral likelihood

---

*This document serves as the comprehensive operations manual for Sharpened. It should be reviewed monthly and updated as the business evolves.*