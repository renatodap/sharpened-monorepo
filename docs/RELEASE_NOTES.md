# Release Notes

## Version: Sprint 2025-01-14

### 🚀 New Features

#### StudySharper: Focus Tracking System
- **Passive Focus Tracking**: Automatically tracks study time without any user input
- **Privacy Mode**: Hide your stats while still tracking progress
- **CSV Export**: Download your focus data anytime
- **Activity Detection**: Smart detection of active vs idle time
- **Visual Indicators**: Clear UI showing when tracking is active

#### StudySharper: Micro-League System  
- **Weekly Competitions**: Compete with 7 other students each week
- **Automatic Grouping**: Get assigned to a league automatically
- **Real-time Leaderboard**: See your ranking update live
- **Points System**: Earn 5 points per minute of focused study time
- **Streak Tracking**: Build momentum with consecutive study days

#### Website: Enhanced Landing Page
- **Single Clear CTA**: "Get Early Access" as primary action
- **Fixed CSS Issues**: Proper Tailwind compilation
- **Improved Hero**: Better value proposition messaging
- **Demo Links**: Try live products directly
- **Mobile Optimized**: Responsive design improvements

### 📝 Documentation

#### Marketing Materials
- `landing-copy.md`: Complete landing page copy
- `email-capture-flow.md`: Email sequence templates
- `launch-posts.md`: Social media launch content
- `demo-script.md`: 60-second video script

#### Legal Documents
- `privacy.md`: Plain English privacy policy
- `terms.md`: User-friendly terms of service
- `tracking-disclosure.md`: Detailed focus tracking explanation

#### Technical Documentation
- `SPRINT_PLAN.md`: Detailed sprint planning
- `ARCHITECTURE_STUDY_SHARPER.md`: System architecture with diagrams
- `DECISION_LOG.md`: Key technical and product decisions
- `RELEASE_NOTES.md`: This document

### 🛠 Technical Improvements

#### Build System
- Added `npm run dev:study` for StudySharper development
- Added `npm run test:all` for comprehensive testing
- Added `npm run ci:study` for StudySharper CI checks
- Fixed PostCSS configuration for proper Tailwind compilation

#### Database Schema
- Added `focus_sessions` table for tracking data
- Added `leagues` and `league_memberships` tables
- Added `profiles` table for user data
- Implemented RLS policies for security
- Added automatic triggers for point calculation

### 🎯 Feature Flags

All new features are behind feature flags (disabled by default):
- `focusTrackingEnabled`: Enable focus tracking
- `leagueSystemEnabled`: Enable league competitions
- `focusPrivacyMode`: Enable privacy mode

### 📊 Performance Metrics

*To be measured after deployment:*
- [ ] Lighthouse Performance Score: Target > 80
- [ ] Lighthouse Accessibility Score: Target > 90
- [ ] Lighthouse Best Practices Score: Target > 90
- [ ] Lighthouse SEO Score: Target > 90

### 🐛 Known Issues

1. **Focus Tracking**: May undercount if user reads without interacting for >5 minutes
2. **Leagues**: Mock data shown if Supabase connection fails
3. **Export**: Large datasets (>10k sessions) may be slow to export

### 🔄 Migration Guide

For existing StudySharper users:
1. Run migration: `20250814000001_focus_tracking_leagues.sql`
2. Clear browser cache to get new features
3. Enable features via dashboard toggles

### 🚦 Testing Checklist

- [x] Focus tracking saves to database
- [x] League assignment works for new users
- [x] Privacy mode hides stats correctly
- [x] CSV export generates valid file
- [x] Website CSS properly compiled
- [ ] TypeScript compilation passes
- [ ] All tests green
- [ ] Lighthouse scores meet targets

### 📝 How to Test Locally

```bash
# Start StudySharper dev server
npm run dev:study

# In another terminal, run tests
npm run test:all

# Check types
npm run typecheck:study
```

### 🎉 Contributors

- AI-powered sprint team (PM, Dev, Design, Marketing, Legal)
- Built in 4-hour sprint
- Zero budget, maximum impact

### 📅 Next Sprint Preview

- Mobile PWA optimizations
- Offline sync queue
- Push notifications
- AI study recommendations
- Pomodoro timer integration

---

**Note**: All features are in beta and behind feature flags. Enable in dashboard to test.