# Feel Sharper - Claude Code Instructions

## Project Overview
Dark-first, free fitness tracker for logging food, workouts, and weight with progress graphs.

## MVP PRIORITY (CURRENT FOCUS)
**Target**: Deliverable MVP for friends/family testing in 1 week

### MVP Core Features (ONLY THESE)
1. **Food Logging** (`/food`, `/food/add`) - USDA verified search & logging
2. **Weight Entry** (`/weight`) - One-tap daily weight tracking  
3. **Today Dashboard** (`/today`) - Today's food + weight summary
4. **Basic Progress** (`/insights`) - Simple weight trend chart

### MVP Exclusions (DO NOT WORK ON)
- ❌ **Workout Tracking** - Too complex for MVP, remove entirely
- ❌ **Advanced Analytics** - Keep only basic weight trends
- ❌ **Goals/Streaks** - Not essential for core value
- ❌ **Social Features** - Future enhancement only

### MVP Operating Rules
1. **Feature Requests**: Only work on MVP core features above
2. **Bug Priority**: Food logging > Weight entry > Today dashboard > Progress
3. **UI Focus**: Make existing flows perfect vs adding new features
4. **Testing**: Every MVP feature must have working user flow
5. **Deployment**: Must be ready for real user testing within 1 week

## Core Tech Stack
- Next.js 15.4.5 + React 19.1.0 + TypeScript
- Supabase (auth + database)
- Tailwind CSS 4 (dark-first design system)
- Jest + Testing Library (testing)

## Essential Commands
```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run typecheck    # TypeScript validation
npm run lint         # ESLint validation
npm test             # Jest tests
npm run seed         # Database seeding
```

## Brand System (ONLY These Colors)
- **Navy**: `#0B2A4A` (primary brand)
- **Black**: `#0A0A0A` (background)
- **White**: `#FFFFFF` (text primary)
- **Grays**: `#C7CBD1` (secondary), `#8B9096` (muted)
- **NO** purple, indigo, pink, or other colors

## Core Features (Implemented)
### MVP Features (Priority)
1. **Food Logging** (`/food`, `/food/add`) - USDA verified food database
2. **Weight Logging** (`/weight`) - One-tap weight entry
3. **Today Dashboard** (`/today`) - Quick action hub
4. **Basic Progress** (`/insights`) - Weight trend visualization

### Post-MVP Features (Disabled for MVP)
- **Workout Tracking** (`/workouts`, `/workouts/add`) - Deterministic AI parser
- **Advanced Analytics** - Complex insights and goal tracking

## Database Architecture
### MVP Tables (Priority)
- `foods` table (USDA verified, 8000+ entries)
- `body_weight` table (daily weight logs)
- `food_logs` table (user food entries)

### Post-MVP Tables (Exists but Disabled)
- `workouts` table (sets/reps/weight tracking)

Row-Level Security enabled for multi-tenant safety

## Key File Locations
- **Pages**: `app/[route]/page.tsx` (Next.js App Router)
- **Components**: `components/[feature]/` organized by domain
- **Database**: `supabase/migrations/` for schema changes
- **Types**: `lib/types/` for TypeScript definitions
- **Styles**: `app/globals.css` + Tailwind utilities

## Development Rules
### MVP Rules (Enforced)
1. **MVP ONLY** - Work only on Food/Weight/Today/Basic Progress
2. **No workout features** - Ignore all workout-related requests until post-MVP
3. **Perfect existing flows** - Fix bugs in MVP features vs adding new ones
4. **1-week deadline** - Prioritize shipping over feature completeness

### General Rules
5. **Always dark-first** - Default to dark theme, black backgrounds
6. **No fake content** - Only real, verified data
7. **No fluff text** - Simple, clear, functional copy only
8. **Test everything** - Write Jest tests for new features
9. **Type everything** - Full TypeScript coverage required

## Testing Strategy
- Component tests in `__tests__/components/`
- Page tests in `__tests__/pages/`
- Utility tests in `__tests__/lib/`
- All tests must pass before deployment

## Common Tasks
### Fix styling issues:
1. Check `tailwind.config.ts` for color definitions
2. Verify `app/globals.css` for global styles
3. Ensure components use dark-first classes

### Add new feature:
1. Create route in `app/[feature]/page.tsx`
2. Add database migration in `supabase/migrations/`
3. Create component in `components/[feature]/`
4. Write tests in `__tests__/`
5. Update navigation in `lib/navigation/routes.ts`

### Database changes:
1. Create migration: `supabase/migrations/XXXX_description.sql`
2. Update types in `lib/types/`
3. Add RLS policies for security
4. Update seed script if needed

## Deployment Checklist
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in production
- [ ] Database migrations applied
- [ ] Environment variables configured

## Troubleshooting
- **White backgrounds**: Check for missing `bg-bg` or `bg-surface` classes
- **Type errors**: Ensure all imports have proper types
- **Test failures**: Update test assertions for new content
- **Build failures**: Check for unused imports or type mismatches

## Performance Notes
- Images optimized with Next.js Image component
- Bundle splitting enabled for code optimization
- Database queries use efficient RLS policies
- Minimal dependencies for fast load times