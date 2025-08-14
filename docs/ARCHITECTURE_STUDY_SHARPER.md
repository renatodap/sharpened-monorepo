# StudySharper Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      StudySharper PWA                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │Focus Tracker │  │   Leagues    │  │   Study AI   │ │
│  │   (Passive)  │  │  (Social)    │  │  (Coaching)  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                  │                  │         │
│  ┌──────┴──────────────────┴──────────────────┴───────┐│
│  │              Next.js 14 App Router                  ││
│  │         (React 18, TypeScript, Tailwind)           ││
│  └──────────────────────┬──────────────────────────────┘│
│                         │                               │
│  ┌──────────────────────┴──────────────────────────────┐│
│  │                 Supabase Backend                     ││
│  │   (PostgreSQL, Auth, Realtime, Edge Functions)      ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Focus Tracking System

**Purpose**: Automatically track study time without user input

**Components**:
- `PassiveFocusTracker.tsx`: Main UI component
- `/api/focus/route.ts`: Backend API for data persistence
- Local storage for offline-first operation

**Key Features**:
- Tab visibility detection
- Activity monitoring (keyboard, mouse, scroll)
- 5-minute inactivity timeout
- Privacy mode (hide stats)
- CSV export capability

**Data Flow**:
```
User Activity → Browser Events → Focus Tracker
     ↓
Local Storage ← → Supabase DB
     ↓
Analytics & Export
```

### 2. Micro-League System

**Purpose**: Gamify studying through small-group weekly competitions

**Components**:
- `MicroLeagueSystem.tsx`: League dashboard UI
- `/api/leagues/current/route.ts`: League management API
- Automatic user assignment algorithm

**Key Features**:
- 8-person leagues (optimal competition size)
- Weekly reset cycle
- Points based on focus minutes (5 points/minute)
- Automatic league assignment
- Real-time leaderboard updates

**League Assignment Logic**:
```
New User → Find League with Space → Join
          ↓ (if full)
        Create New League → Join as First Member
```

### 3. Database Schema

```sql
-- Core Tables
focus_sessions
├── id (UUID)
├── user_id (FK → auth.users)
├── duration_seconds (INTEGER)
├── tracked_at (TIMESTAMP)
├── metadata (JSONB)
└── is_active (BOOLEAN)

leagues
├── id (UUID)
├── name (TEXT)
├── week_number (INTEGER)
├── start_date (TIMESTAMP)
├── end_date (TIMESTAMP)
└── max_size (INTEGER, default: 8)

league_memberships
├── id (UUID)
├── user_id (FK → auth.users)
├── league_id (FK → leagues)
├── week_number (INTEGER)
├── points (INTEGER)
├── focus_minutes (INTEGER)
└── streak (INTEGER)

profiles
├── id (FK → auth.users)
├── full_name (TEXT)
├── avatar_url (TEXT)
└── preferences (JSONB)
```

## Technical Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React hooks + Context
- **Type Safety**: TypeScript

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **API**: Next.js Route Handlers
- **Storage**: Supabase Storage (future: for exports)

### Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics
- **Error Tracking**: (To be added)

## Security & Privacy

### Data Protection
- Row Level Security (RLS) on all tables
- User can only see/modify own data
- League data visible to league members only
- Encrypted connections (TLS)

### Privacy Features
- Opt-in tracking (disabled by default)
- Privacy mode (hide stats while tracking)
- Local-first data storage
- Complete data export
- One-click data deletion

### Feature Flags
- Stored in localStorage for instant toggling
- No server round-trip for enable/disable
- Graceful degradation if features disabled

## Performance Optimizations

### Frontend
- Lazy loading of components
- Optimistic UI updates
- Debounced activity tracking
- Local caching of league data

### Backend
- Indexed database queries
- Trigger-based point calculations
- Batched focus session updates
- Connection pooling

## Deployment Pipeline

### Development
```bash
npm run dev:study        # Start dev server
npm run typecheck:study  # Type checking
npm run test:study       # Run tests
```

### Production
```bash
npm run build:study      # Production build
npm run ci:study         # Full CI check
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

## Monitoring & Analytics

### Key Metrics
- Daily Active Users (DAU)
- Average focus time per user
- League participation rate
- Feature adoption rates
- Export usage

### Error Tracking
- Client-side error boundaries
- API error logging
- Failed focus session recovery

## Future Enhancements

### Phase 1 (Next 2 weeks)
- [ ] Mobile PWA optimizations
- [ ] Offline sync queue
- [ ] Push notifications for league updates

### Phase 2 (Next month)
- [ ] AI study recommendations
- [ ] Pomodoro timer integration
- [ ] Study streak rewards

### Phase 3 (Next quarter)
- [ ] Team leagues
- [ ] Study pattern analytics
- [ ] Integration with calendar apps

## Development Guidelines

### Code Organization
```
apps/studysharper/
├── app/              # Next.js app router
├── components/       # React components
│   ├── focus-tracking/
│   ├── leagues/
│   └── ui/
├── lib/             # Utilities and helpers
├── types/           # TypeScript definitions
└── supabase/        # Database migrations
```

### Naming Conventions
- Components: PascalCase (`PassiveFocusTracker`)
- Files: kebab-case (`focus-tracker.ts`)
- API routes: kebab-case (`/api/focus`)
- Database: snake_case (`focus_sessions`)

### Testing Strategy
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows
- Manual testing for UI/UX

## Troubleshooting

### Common Issues

**Focus tracking not working**
- Check if feature is enabled in localStorage
- Verify browser supports visibility API
- Check console for errors

**League not loading**
- Verify Supabase connection
- Check if user is authenticated
- Fall back to mock data if API fails

**Data not syncing**
- Check network connection
- Verify Supabase credentials
- Check RLS policies