# SPRINT PLAN: StudySharper Focus & Leaderboard MVP
**Date**: 2025-08-14
**Sprint Duration**: 4 hours
**Branch**: `sprint/studysharper-focus-leaderboard-2025-08-14`

## Repository Structure Analysis
- **Monorepo Type**: pnpm workspace with Turborepo
- **Apps**: 
  - `apps/feelsharper` ⚠️ NO-TOUCH (existing fitness app)
  - `apps/studysharper` ✅ MODIFIABLE (study app) 
  - `apps/website` ✅ MODIFIABLE (landing site)
  - `apps/sharplens` ✅ MODIFIABLE (if needed)
- **Package Manager**: pnpm
- **Build System**: Turborepo

## High-ROI Sprint Tasks

### 1. StudySharper: Passive Focus Tracking System
**Goal**: Ship zero-friction focus tracking with privacy-first design
**Rationale**: Core value prop - automatic study time tracking without manual input
**Files**: 
- `apps/studysharper/components/focus-tracking/PassiveFocusTracker.tsx`
- `apps/studysharper/lib/focus/tracker.ts`
- `apps/studysharper/app/api/focus/route.ts`
**Tests**: Unit tests for tracker logic, privacy toggle, data persistence
**Acceptance**: Toggle enables tracking, data persists, CSV export works

### 2. StudySharper: Micro-League Leaderboard
**Goal**: Weekly small-group competition with automatic grouping
**Rationale**: Social motivation through competitive gamification
**Files**:
- `apps/studysharper/components/leagues/MicroLeagueSystem.tsx`
- `apps/studysharper/lib/leagues/scoring.ts`
- `apps/studysharper/app/api/leagues/route.ts`
**Tests**: Scoring algorithm, group formation, weekly reset logic
**Acceptance**: Users auto-grouped, points calculated, leaderboard displays

### 3. Website: Fix CSS & Ship Crisp Landing
**Goal**: Diagnose CSS issues, create conversion-optimized landing
**Rationale**: First impression matters - need professional appearance
**Files**:
- `apps/website/src/app/globals.css`
- `apps/website/src/app/page.tsx`
- `apps/website/src/components/*`
**Tests**: Lighthouse scores > 80
**Acceptance**: CSS properly applied, single CTA, 3 value sections

### 4. Marketing Content Creation
**Goal**: Ready-to-ship launch content
**Rationale**: Need materials for launch amplification
**Files**:
- `/marketing/landing-copy.md`
- `/marketing/email-capture-flow.md`
- `/marketing/launch-posts.md`
- `/marketing/demo-script.md`
**Acceptance**: All drafts complete, ready for polish

### 5. Legal/Privacy Drafts
**Goal**: Compliance-ready legal docs
**Rationale**: Required for launch, builds trust
**Files**:
- `/legal/privacy.md`
- `/legal/terms.md`
- `/legal/tracking-disclosure.md`
**Acceptance**: Plain language, covers focus tracking

### 6. CI/CD Hardening & Scripts
**Goal**: Robust development workflow
**Rationale**: Prevent regressions, smooth DX
**Files**:
- `package.json` (root scripts)
- `apps/studysharper/package.json`
- `.github/workflows/*` (if exists)
**Tests**: All scripts run successfully
**Acceptance**: Scripts work, CI green

## Execution Order
1. Create feature branch
2. StudySharper focus tracking (backend → frontend)
3. StudySharper leaderboard (data model → UI)
4. Website CSS fix & landing polish
5. Marketing/legal content creation
6. CI/CD setup
7. Testing & documentation

## Risk Mitigation
- **FeelSharper Protection**: No shared packages, no cascading changes
- **Feature Flags**: All new features behind flags, default OFF
- **Data Privacy**: Opt-in by default, clear disclosure
- **Testing**: Unit tests for critical paths before shipping

## Success Metrics
- [ ] Focus tracking works with zero user input
- [ ] Leaderboard shows weekly competition
- [ ] Website Lighthouse scores > 80 all categories
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Feature flags configured and working
- [ ] Documentation complete

## No-Touch Zones
- ❌ `apps/feelsharper/*` - DO NOT MODIFY
- ❌ Any shared package used exclusively by FeelSharper
- ❌ Root configs that would affect FeelSharper build