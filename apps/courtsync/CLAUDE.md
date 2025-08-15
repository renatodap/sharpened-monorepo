# CourtSync - Claude Code Instructions

## Project Overview
**CourtSync** is a mobile-first NCAA Division III tennis team management app for Rose Hulman Institute of Technology. Built using the Sharpened brand system, it provides comprehensive team management for coaches and players with scheduling, communication, video analysis, and opponent scouting.

## Development Sprint Overview
**Timeline**: 2 weeks (14 days)
**Target**: MVP with all 7 core features functional
**Platform**: Mobile-first Progressive Web App (PWA) + Desktop responsive

## Core Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API routes + Supabase
- **Database**: PostgreSQL (Supabase)
- **UI**: Tailwind CSS 4 (Sharpened brand system)
- **Mobile**: PWA with offline capabilities
- **Video**: File upload with cloud storage integration
- **Auth**: Supabase Auth with role-based access

## Brand System (Sharpened)
- **Primary**: Navy `#0B2A4A` 
- **Background**: Black `#0A0A0A`
- **Text**: White `#FFFFFF`
- **Secondary**: Gray `#C7CBD1`
- **Muted**: Gray `#8B9096`
- **NO** purple, indigo, pink, or other colors

## Essential Commands
```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run typecheck    # TypeScript validation
npm run lint         # ESLint validation
npm test             # Jest tests
npm run test:e2e     # Playwright E2E tests
```

## 7 Core Features (Development Priority)

### 1. Centralized Scheduling & Calendar (Sprint 1 - Days 1-2)
- **Mobile-first calendar view** (daily/weekly/monthly)
- Event creation with court allocation tracking
- Class schedule conflict detection
- External calendar sync (Google Cal, iCal)
- Push notifications for schedule changes
- **Key Components**: `CalendarView`, `EventCreator`, `ConflictDetector`

### 2. Facility & Court Management (Sprint 1 - Days 2-3)
- Court availability tracker (6 outdoor + 6 indoor bubble)
- Prevent double-booking with real-time validation
- Color-coded facility indicators
- Weather-based indoor/outdoor suggestions
- **Key Components**: `CourtBooking`, `FacilityMap`, `AvailabilityGrid`

### 3. Team Communication Hub (Sprint 1 - Days 3-4)
- In-app messaging (group + direct)
- Push notifications for critical updates
- File/image sharing capabilities
- Channel organization (coaches, team, social)
- **Key Components**: `MessageCenter`, `NotificationSystem`, `FileUpload`

### 4. Travel & Event Management (Sprint 2 - Days 5-7)
- Travel itinerary management
- Departure/arrival tracking
- Hotel and meal information
- Document sharing (forms, rosters)
- GPS integration for venues
- **Key Components**: `TravelPlanner`, `ItineraryView`, `DocumentLibrary`

### 5. Video Recording & Analysis (Sprint 2 - Days 8-10)
- iPad video upload integration
- Video library with event tagging
- Time-stamped comments and annotations
- Player-specific video access
- **Key Components**: `VideoUploader`, `VideoPlayer`, `AnnotationSystem`

### 6. Opponent Scouting System (Sprint 2 - Days 11-12)
- Opponent profiles and history
- Scouting notes and strategy tips
- Media attachment capabilities
- Match preparation summaries
- **Key Components**: `OpponentProfile`, `ScoutingNotes`, `MatchPrep`

### 7. User Roles & Engagement (Sprint 2 - Days 13-14)
- Role-based access (Coach, Captain, Player)
- Daily check-in workflows
- Mobile-optimized interfaces
- Admin dashboard for coaches
- **Key Components**: `UserDashboard`, `RoleManager`, `DailyCheckin`

## Database Schema (Supabase)

### Core Tables
```sql
-- Users and roles
profiles (id, email, role, team_id, class_schedule)
teams (id, name, sport, season, coach_id)

-- Scheduling
events (id, title, start_time, end_time, event_type, team_id, facility_id)
facilities (id, name, type, capacity, weather_dependent)
availability (id, user_id, event_id, status)

-- Communication
messages (id, sender_id, channel_id, content, attachments)
channels (id, name, type, team_id, private)

-- Travel
travel_events (id, event_id, departure_time, return_time, transportation)
itineraries (id, travel_event_id, details, documents)

-- Video & Scouting
videos (id, event_id, title, file_url, uploader_id)
video_annotations (id, video_id, timestamp, comment, user_id)
opponents (id, name, conference, notes)
scouting_reports (id, opponent_id, author_id, content, match_date)
```

## File Structure
```
apps/courtsync/
├── app/                    # Next.js app router
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API endpoints
│   ├── calendar/          # Scheduling interface
│   ├── communication/     # Messaging hub
│   ├── travel/            # Travel management
│   ├── video/             # Video analysis
│   ├── scouting/          # Opponent scouting
│   └── dashboard/         # User dashboards
├── components/            # React components
│   ├── calendar/          # Calendar-specific
│   ├── communication/     # Messaging components
│   ├── travel/            # Travel planning
│   ├── video/             # Video handling
│   ├── scouting/          # Scouting tools
│   └── ui/                # Shared UI components
├── lib/                   # Utilities and services
│   ├── supabase/          # Database client
│   ├── auth/              # Authentication
│   ├── notifications/     # Push notifications
│   └── utils/             # Helper functions
├── docs/                  # Documentation
└── supabase/              # Database migrations
```

## Development Guidelines

### Sprint 1 (Days 1-4): Foundation
1. **Setup & Infrastructure**
   - Initialize Next.js project with TypeScript
   - Configure Supabase database and auth
   - Implement Sharpened brand system
   - Set up PWA configuration

2. **Core Features Implementation**
   - Calendar scheduling system
   - Court/facility management
   - Basic communication hub
   - User authentication and roles

### Sprint 2 (Days 5-14): Advanced Features
3. **Travel & Video Systems**
   - Travel planning and itineraries
   - Video upload and playback
   - Annotation system

4. **Scouting & Polish**
   - Opponent scouting tools
   - User engagement features
   - Mobile optimizations
   - Testing and bug fixes

### Mobile-First Development Rules
1. **Touch-first UI**: All interactions optimized for touch
2. **Offline capabilities**: Core features work without internet
3. **Performance**: Fast loading, minimal data usage
4. **PWA features**: Home screen install, push notifications
5. **Responsive**: Scales from mobile to desktop seamlessly

### Code Quality Standards
- **TypeScript**: 100% type coverage
- **Testing**: Unit tests for all business logic
- **E2E**: Playwright tests for critical user flows
- **Performance**: Lighthouse scores >90
- **Accessibility**: WCAG 2.1 AA compliance

## Agent Instructions for Claude Code

### When working on CourtSync:
1. **Always reference this CLAUDE.md** for context and constraints
2. **Follow the 2-week sprint timeline** - prioritize MVP features
3. **Use Sharpened brand colors only** - no deviations
4. **Mobile-first approach** - test on mobile sizes first
5. **Supabase for all data** - use existing patterns from FeelSharper
6. **PWA requirements** - ensure offline functionality

### Creating specialized agents:
```bash
# Calendar/Scheduling agent
claude-code task create "Implement calendar scheduling system" --agent calendar-specialist

# Video analysis agent  
claude-code task create "Build video upload and annotation system" --agent video-specialist

# Mobile optimization agent
claude-code task create "Optimize mobile user experience" --agent mobile-specialist
```

### Testing strategy:
- **Unit tests**: All business logic functions
- **Integration tests**: API endpoints and database operations
- **E2E tests**: Complete user workflows
- **Mobile testing**: iOS Safari, Android Chrome
- **Performance testing**: Lighthouse CI

### Deployment checklist:
- [ ] All 7 core features functional
- [ ] Mobile PWA installable
- [ ] Push notifications working
- [ ] Role-based access implemented
- [ ] Video upload/playback working
- [ ] Calendar sync functional
- [ ] Performance metrics met

## Success Metrics
- **User Adoption**: 90% of team members using app daily
- **Performance**: <3 second page load on mobile
- **Engagement**: Average 5 minutes daily usage per user
- **Reliability**: 99.5% uptime during tennis season
- **Coach Efficiency**: 50% reduction in scheduling/communication time

## Budget Constraints
- **$10/month per team** total operating cost
- **Supabase Pro**: $25/month (covers multiple teams)
- **Vercel Pro**: $20/month (hosting and edge functions)
- **Total scalable cost**: <$5/team/month at 10+ teams

This app will revolutionize tennis team management for NCAA Division III programs while staying within tight budget constraints and delivering in an aggressive 2-week timeline.