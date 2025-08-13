# Sharpened - Unified Business Strategy
*Last Updated: 2025-01-13*

## Executive Summary

**Sharpened** is a zero-friction fitness and study tracking platform for "builder-athletes" - 18-30 year old CS/engineering students who lift/run and study hard. We solve the 71% dropout rate in fitness tracking through AI-powered 1-tap logging and social accountability via micro-leagues.

### The Two-Wedge Strategy

1. **Feel Sharper**: "Quick Log + Streaks" - 1-tap/photo meal logging with streak mechanics
2. **Study Sharper**: "Auto Focus + Leaderboard" - passive focus tracking with weekly competitions

## Market Opportunity

### Problem
- **71% dropout rate** in fitness apps due to manual logging friction
- **Mind-body integration gap** - no tools connect physical and mental performance
- **Social motivation underserved** - global leaderboards are demotivating

### Solution
- **Zero-friction tracking** via AI photo parsing and passive detection
- **Unified dashboard** combining fitness and study metrics
- **Micro-leagues** (5-12 people) for sustainable competition

### Market Size
- 345M+ fitness app users globally
- 850M+ annual fitness app downloads
- 1M+ in online study communities (Discord/Forest)
- Growing campus fitness culture (barbell clubs, running groups)

## Product Architecture

### Core Features Implemented

#### Feel Sharper (Fitness)
- ✅ **QuickLogSystem**: 1-tap weight, meal repeat, photo capture
  - Success metric: TTF-Log ≤12s (meals), ≤4s (weight)
  - 60%+ logs via 1-tap/photo
- ✅ **StreakSystem**: Daily chains with freeze tokens and grace periods
  - 24-hour grace window for recovery
  - Weekend skip mode
  - Milestone achievements
- ✅ **HumanVerificationQueue**: Low-confidence photo logs verified by humans
  - Based on SnapCalorie's marketplace model
  - <1% parse failure rate target

#### Study Sharper (Focus)
- ✅ **PassiveFocusTracker**: Page Visibility + Idle Detection APIs
  - Zero-setup passive tracking
  - Privacy-first local storage option
  - 85%+ accuracy vs self-report
- ✅ **MicroLeagueSystem**: 5-12 person weekly competitions
  - Handicap system for schedule fairness
  - 70% weekly engagement target
  - Campus club integration

#### Platform Features
- ✅ **CampusClubIntegration**: Stanford, MIT, USP, Unicamp partnerships
  - Club-specific challenges and leaderboards
  - Strava integration for running clubs
- ✅ **NotionStreakTemplate**: Viral distribution mechanism
  - Pre-built database with formulas
  - 2-way sync capability
  - Template gallery distribution

## Technical Implementation

### Architecture Overview
```
┌─────────────────────────────────────────┐
│            Frontend Apps                 │
├──────────────┬──────────────┬───────────┤
│ Feel Sharper │ Study Sharper│  Website  │
│   (Next.js)  │   (Next.js)  │ (Next.js) │
└──────────────┴──────────────┴───────────┘
                      │
┌─────────────────────────────────────────┐
│           Shared Packages                │
├──────────────┬──────────────┬───────────┤
│  AI Tracking │ Gamification │Integrations│
│ (TensorFlow) │  (XP/Levels) │  (Notion)  │
└──────────────┴──────────────┴───────────┘
                      │
┌─────────────────────────────────────────┐
│            Backend Services              │
├──────────────┬──────────────┬───────────┤
│   Supabase   │ Verification │ Analytics  │
│  (Database)  │    Queue     │ (PostHog)  │
└──────────────┴──────────────┴───────────┘
```

### Key Technologies
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **AI/ML**: TensorFlow.js (pose detection), Claude/OpenAI APIs
- **Backend**: Supabase (PostgreSQL + Auth), FastAPI (Python services)
- **Monitoring**: Sentry, PostHog, custom performance tracking
- **Deployment**: Vercel (frontend), Railway (services)

## Go-to-Market Strategy

### Phase 1: University Beachheads (Weeks 1-4)
1. **Target Clubs** (6 captains recruited)
   - Stanford: Running Club, Powerlifting Club
   - MIT: Barbell Club, CS Study Groups
   - USP: Atlética Poli-USP
   - Unicamp: Atletismo team

2. **Launch Experiments**
   - Week 1: Ship alpha + recruit captains
   - Week 2: 7-day streak challenges
   - Week 3: Cross-community events (Strava integration)
   - Week 4: Scale to 10 campuses

3. **Success Metrics**
   - D7 retention ≥35% (Feel Sharper)
   - D7 retention ≥40% (Study Sharper)
   - 70% weekly league engagement
   - 60% 1-tap log rate

### Phase 2: Viral Growth (Months 2-3)
1. **Distribution Channels**
   - Notion Template Gallery
   - University Discord servers
   - Reddit communities (r/fitness, r/getdisciplined)
   - Strava club partnerships

2. **Content Strategy**
   - Weekly challenge results
   - Builder-athlete success stories
   - Study/fitness integration tips
   - API tutorials for developers

### Phase 3: Monetization (Month 4+)
- **Freemium Model** ($0/$9.99/month)
  - Free: Core tracking, 7-day history, 1 league
  - Premium: Unlimited history, multiple leagues, AI coaching
- **B2B2C**: University wellness programs
- **API Access**: Developer tier for integrations

## Financial Projections

### Unit Economics (per user)
- **CAC**: $3-5 (organic/viral focus)
- **LTV**: $89 (9-month avg retention × $9.99)
- **Payback**: 2 months
- **Gross Margin**: 85%

### Revenue Milestones
- Month 1: 1,000 users (100% free)
- Month 3: 10,000 users (10% paid) = $10K MRR
- Month 6: 50,000 users (15% paid) = $75K MRR
- Month 12: 200,000 users (20% paid) = $400K MRR

## Owner Decisions Made

| Decision | Resolution | Date |
|----------|------------|------|
| Pricing Model | Freemium ($0/$9.99) | 2025-01-13 |
| Legal Entity | Delaware C-Corp | 2025-01-13 |
| Payment Processor | Cheapest/easiest option | 2025-01-13 |
| Analytics | PostHog (self-hosted) | 2025-01-13 |
| Email Service | Resend | 2025-01-13 |
| Team Structure | Solo + AI tools | 2025-01-13 |

## Risk Mitigation

### Technical Risks
- **Photo parsing accuracy**: Human verification queue as fallback
- **Privacy concerns**: Local-first option, clear consent UX
- **API availability**: Fallback to manual tracking if APIs unavailable

### Market Risks
- **Streak fatigue**: Grace periods, freeze tokens, gentle recovery
- **Competition**: Focus on builder-athlete niche, not general fitness
- **Retention**: Micro-leagues and campus culture for stickiness

### Operational Risks
- **Solo founder bandwidth**: Heavy automation, AI assistance
- **Verification costs**: $0.10/item sustainable at scale
- **Campus partnerships**: Start with informal clubs, formalize later

## Success Metrics Dashboard

### Primary KPIs
- **Activation**: TTF-Log ≤12s (meals), ≤4s (weight)
- **Retention**: D7 ≥35% (FS), ≥40% (SS)
- **Engagement**: 70% weekly league participation
- **Virality**: K-factor >1.2 (each user brings 1.2+ new users)

### Secondary KPIs
- 1-tap log rate ≥60%
- Parse failure rate <1%
- 50%+ focus time in 25+ min blocks
- 85%+ passive tracking accuracy
- <15 min verification turnaround

## Next 30 Days Roadmap

### Week 1 (Jan 14-20)
- [ ] Deploy alpha to test group
- [ ] Recruit 6 campus captains
- [ ] Launch Notion template
- [ ] Set up PostHog analytics

### Week 2 (Jan 21-27)
- [ ] Run first 7-day streak challenge
- [ ] Launch micro-leagues beta
- [ ] Integrate Strava API
- [ ] Begin verification queue ops

### Week 3 (Jan 28-Feb 3)
- [ ] Host cross-community event
- [ ] Ship mobile PWA
- [ ] Launch on Product Hunt
- [ ] Publish first case study

### Week 4 (Feb 4-10)
- [ ] Scale to 10 campuses
- [ ] Enable premium features
- [ ] Launch affiliate program
- [ ] Prepare Series A deck

## Competitive Advantages

1. **Zero-friction UX** - Lowest TTF-Log in market
2. **Mind-body integration** - Unique positioning
3. **Micro-leagues** - Sustainable social motivation
4. **Builder-athlete focus** - Specific niche dominance
5. **Campus distribution** - Built-in viral loops
6. **AI-powered automation** - Low operational costs

## Long-term Vision

**Year 1**: Dominate builder-athlete niche (200K users)
**Year 2**: Expand to young professionals (1M users)
**Year 3**: Platform for habit-building apps (10M users)
**Year 5**: The "Strava for everything" (100M users)

---

*"The best time to plant a tree was 20 years ago. The second best time is now."*

**Let's build the future of human performance tracking.**