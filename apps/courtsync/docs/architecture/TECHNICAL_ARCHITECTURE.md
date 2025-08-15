# CourtSync - Technical Architecture

## Architecture Overview

CourtSync is built as a modern Progressive Web App (PWA) using Next.js 15, designed for mobile-first usage with desktop compatibility. The architecture prioritizes offline capabilities, real-time updates, and efficient mobile performance.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (PWA)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Mobile    │  │   Tablet    │  │   Desktop   │        │
│  │   (Primary) │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ App Router  │  │ API Routes  │  │ Middleware  │        │
│  │             │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Supabase   │  │   Vercel    │  │ External    │        │
│  │  Database   │  │   Edge      │  │   APIs      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Core Technology Stack
- **Framework**: Next.js 15.4.5 with App Router
- **Runtime**: React 19.1.0 with TypeScript 5.6.3
- **Styling**: Tailwind CSS 4 with Sharpened brand system
- **PWA**: Service Workers with offline-first approach
- **State Management**: React Context + Custom hooks
- **Testing**: Jest + Testing Library + Playwright

### Component Architecture
```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Authentication routes
│   ├── (dashboard)/           # Protected dashboard routes
│   ├── api/                   # API endpoints
│   ├── calendar/              # Calendar management
│   ├── communication/         # Messaging system
│   ├── travel/                # Travel planning
│   ├── video/                 # Video analysis
│   ├── scouting/              # Opponent scouting
│   └── globals.css            # Global styles
├── components/                 # Reusable components
│   ├── ui/                    # Base UI components
│   ├── calendar/              # Calendar-specific
│   ├── communication/         # Messaging components
│   ├── travel/                # Travel components
│   ├── video/                 # Video components
│   └── scouting/              # Scouting components
├── lib/                       # Utilities and services
│   ├── supabase/              # Database client
│   ├── auth/                  # Authentication logic
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Helper functions
│   └── types/                 # TypeScript definitions
└── public/                    # Static assets
```

### Mobile-First Design Principles
1. **Touch-Friendly Interface**: Minimum 44px touch targets
2. **Responsive Breakpoints**: 
   - Mobile: 320px - 768px (primary)
   - Tablet: 768px - 1024px
   - Desktop: 1024px+ (secondary)
3. **Performance**: Core Web Vitals optimization
4. **Offline-First**: Essential features work without connectivity

## Backend Architecture

### Database Design (Supabase PostgreSQL)

#### Core Tables Structure
```sql
-- User Management
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('coach', 'captain', 'player')),
    team_id UUID REFERENCES teams(id),
    class_schedule JSONB,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Organization
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sport TEXT DEFAULT 'tennis',
    gender TEXT CHECK (gender IN ('men', 'women', 'mixed')),
    season_year INTEGER NOT NULL,
    coach_id UUID REFERENCES profiles(id),
    institution TEXT NOT NULL,
    conference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facility Management
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('outdoor', 'indoor', 'bubble')),
    capacity INTEGER NOT NULL,
    weather_dependent BOOLEAN DEFAULT TRUE,
    location_lat DECIMAL,
    location_lng DECIMAL,
    team_id UUID REFERENCES teams(id)
);

-- Event Scheduling
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type TEXT CHECK (event_type IN ('practice', 'match', 'meeting', 'travel')),
    team_id UUID REFERENCES teams(id),
    facility_id UUID REFERENCES facilities(id),
    opponent TEXT,
    location_override TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability Tracking
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    event_id UUID REFERENCES events(id),
    status TEXT CHECK (status IN ('available', 'unavailable', 'maybe', 'confirmed')),
    notes TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication System
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('team', 'coaches', 'social', 'direct')),
    team_id UUID REFERENCES teams(id),
    private BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id),
    sender_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'announcement')),
    attachments JSONB,
    reply_to UUID REFERENCES messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Travel Management
CREATE TABLE travel_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    departure_time TIMESTAMP WITH TIME ZONE,
    return_time TIMESTAMP WITH TIME ZONE,
    departure_location TEXT,
    transportation_type TEXT,
    transportation_details JSONB,
    accommodation JSONB,
    meal_arrangements JSONB,
    documents JSONB
);

-- Video Management
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    duration_seconds INTEGER,
    uploader_id UUID REFERENCES profiles(id),
    video_type TEXT CHECK (video_type IN ('practice', 'match', 'drill', 'analysis')),
    visibility TEXT DEFAULT 'team' CHECK (visibility IN ('team', 'coaches', 'player_specific')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE video_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id),
    timestamp_seconds INTEGER NOT NULL,
    comment TEXT NOT NULL,
    annotation_type TEXT DEFAULT 'note' CHECK (annotation_type IN ('note', 'technique', 'strategy', 'highlight')),
    author_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opponent Scouting
CREATE TABLE opponents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    institution TEXT,
    conference TEXT,
    division TEXT,
    location TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE scouting_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opponent_id UUID REFERENCES opponents(id),
    team_id UUID REFERENCES teams(id),
    author_id UUID REFERENCES profiles(id),
    match_date DATE,
    content TEXT NOT NULL,
    player_notes JSONB,
    strategy_notes JSONB,
    attachments JSONB,
    confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
-- ... (all other tables)

-- Profiles: Users can only see team members
CREATE POLICY "Users can view team profiles" ON profiles
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Events: Team members can view team events
CREATE POLICY "Team members can view events" ON events
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- Messages: Users can view messages in channels they have access to
CREATE POLICY "Users can view channel messages" ON messages
    FOR SELECT USING (
        channel_id IN (
            SELECT c.id FROM channels c
            JOIN profiles p ON p.team_id = c.team_id
            WHERE p.user_id = auth.uid()
        )
    );
```

### API Design

#### RESTful Endpoints
```typescript
// Authentication
POST   /api/auth/signin
POST   /api/auth/signup
DELETE /api/auth/signout
GET    /api/auth/user

// Calendar & Events
GET    /api/events?team_id=&start_date=&end_date=
POST   /api/events
PUT    /api/events/[id]
DELETE /api/events/[id]
GET    /api/events/[id]/availability
POST   /api/events/[id]/availability

// Facilities
GET    /api/facilities?team_id=
POST   /api/facilities
GET    /api/facilities/availability?date=&start_time=&end_time=

// Communication
GET    /api/channels?team_id=
POST   /api/channels
GET    /api/channels/[id]/messages?limit=&offset=
POST   /api/channels/[id]/messages
PUT    /api/messages/[id]
DELETE /api/messages/[id]

// Travel
GET    /api/travel?team_id=&start_date=&end_date=
POST   /api/travel
PUT    /api/travel/[id]
GET    /api/travel/[id]/documents

// Video
GET    /api/videos?team_id=&event_id=
POST   /api/videos/upload
GET    /api/videos/[id]
POST   /api/videos/[id]/annotations
GET    /api/videos/[id]/annotations

// Scouting
GET    /api/opponents?search=
POST   /api/opponents
GET    /api/scouting-reports?opponent_id=&team_id=
POST   /api/scouting-reports
PUT    /api/scouting-reports/[id]
```

#### Real-time Subscriptions (Supabase)
```typescript
// Live message updates
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `channel_id=eq.${channelId}`
  }, (payload) => {
    // Handle new message
  })
  .subscribe();

// Live event updates
const eventSubscription = supabase
  .channel('events')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'events',
    filter: `team_id=eq.${teamId}`
  }, (payload) => {
    // Handle event changes
  })
  .subscribe();
```

## Security Architecture

### Authentication & Authorization
- **Provider**: Supabase Auth with email/password
- **Session Management**: JWT tokens with automatic refresh
- **Role-Based Access**: Coach > Captain > Player hierarchy
- **Row Level Security**: Database-enforced data isolation

### Data Protection
- **FERPA Compliance**: Student data protection protocols
- **Encryption**: TLS 1.3 for data in transit
- **Privacy**: Minimal data collection, user consent
- **Audit Trail**: Action logging for sensitive operations

### Security Headers (Next.js Middleware)
```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}
```

## Performance Architecture

### Frontend Optimization
```typescript
// Dynamic imports for code splitting
const VideoPlayer = dynamic(() => import('@/components/video/VideoPlayer'), {
  loading: () => <VideoPlayerSkeleton />,
  ssr: false
});

// Image optimization
import Image from 'next/image';
<Image
  src="/team-photo.jpg"
  alt="Team photo"
  width={400}
  height={300}
  priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Service Worker for offline caching
const CACHE_NAME = 'courtsync-v1';
const urlsToCache = [
  '/',
  '/calendar',
  '/communication',
  '/static/js/bundle.js',
  '/static/css/main.css'
];
```

### Database Optimization
```sql
-- Indexes for performance
CREATE INDEX idx_events_team_date ON events(team_id, start_time);
CREATE INDEX idx_messages_channel_created ON messages(channel_id, created_at DESC);
CREATE INDEX idx_videos_event ON videos(event_id);
CREATE INDEX idx_availability_user_event ON availability(user_id, event_id);

-- Partial indexes for active data
CREATE INDEX idx_active_events ON events(team_id, start_time) 
WHERE start_time > NOW() - INTERVAL '7 days';
```

### Caching Strategy
- **Static Assets**: CDN caching via Vercel
- **API Responses**: Supabase query caching
- **Client-Side**: React Query for server state
- **Service Worker**: Offline-first resource caching

## Deployment Architecture

### Infrastructure
```yaml
# Vercel Deployment
name: courtsync
framework: nextjs
buildCommand: npm run build
outputDirectory: .next
installCommand: npm ci
devCommand: npm run dev

environment:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXT_PUBLIC_APP_URL
```

### Environment Configuration
```typescript
// lib/config.ts
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL!,
    environment: process.env.NODE_ENV
  },
  features: {
    videoAnalysis: process.env.ENABLE_VIDEO_ANALYSIS === 'true',
    realTimeChat: process.env.ENABLE_REALTIME_CHAT === 'true'
  }
};
```

## Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: Vercel Analytics
- **Error Tracking**: Sentry integration
- **Database Performance**: Supabase dashboard
- **User Analytics**: Privacy-focused usage tracking

### Health Checks
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    
    return Response.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        auth: 'operational'
      }
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    );
  }
}
```

## Scalability Considerations

### Horizontal Scaling
- **Stateless Architecture**: No server-side session storage
- **Database Scaling**: Supabase automatic scaling
- **CDN Distribution**: Global edge network via Vercel
- **API Rate Limiting**: Built-in Supabase limits

### Multi-Tenancy
- **Team Isolation**: Row-level security by team_id
- **Resource Sharing**: Shared infrastructure, isolated data
- **Feature Flags**: Team-specific feature enablement
- **Custom Branding**: Institution-specific theming

This architecture provides a solid foundation for rapid development while maintaining scalability, security, and performance requirements for the CourtSync tennis team management application.