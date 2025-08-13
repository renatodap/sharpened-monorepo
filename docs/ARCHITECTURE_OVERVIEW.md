# Sharpened Architecture Overview

## System Architecture

### High-Level Stack
```
┌─────────────────────────────────────────┐
│         Frontend Applications           │
│  (Next.js + React + TypeScript)        │
├─────────────────────────────────────────┤
│           API Layer                     │
│  (Next.js API Routes + Edge Functions) │
├─────────────────────────────────────────┤
│         Data Layer                      │
│  (Supabase: PostgreSQL + Auth + RLS)   │
├─────────────────────────────────────────┤
│      Infrastructure                     │
│  (Vercel + Cloudflare + S3)           │
└─────────────────────────────────────────┘
```

## Technology Choices

### Frontend
- **Framework**: Next.js 15.4.5 (App Router)
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 4.0
- **State**: React Context + Server Components
- **Forms**: React Hook Form + Zod

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (JWT-based)
- **File Storage**: Supabase Storage (S3-compatible)
- **Edge Functions**: Vercel Edge Runtime
- **Background Jobs**: Vercel Cron (planned)

### AI/ML Stack
- **LLM**: Anthropic Claude (Sonnet 3.5)
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Store**: Supabase pgvector
- **Search**: Hybrid (keyword + semantic)

### Infrastructure
- **Hosting**: Vercel (frontend + API)
- **Database**: Supabase (managed PostgreSQL)
- **CDN**: Vercel Edge Network
- **DNS**: Cloudflare
- **Monitoring**: Vercel Analytics (planned)
- **Error Tracking**: Sentry (planned)

## Monorepo Structure

```
sharpened-monorepo/
├── apps/
│   ├── website/          # Marketing site
│   ├── feelsharper/      # Fitness tracking app
│   └── studysharper/     # Study tools app
├── packages/
│   ├── ui/              # Shared UI components
│   ├── config/          # Shared configurations
│   └── prompts/         # AI agent specifications
├── docs/                # Living documentation
├── infra/              # Infrastructure configs
└── tools/              # Build and dev tools
```

## Data Architecture

### Database Schema Design Principles
- Normalized for consistency
- Denormalized for performance (where needed)
- Row-Level Security (RLS) for all tables
- Soft deletes with `deleted_at` timestamps
- Audit trails with `created_at`, `updated_at`

### Key Data Models

#### Users & Auth
```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

profiles (
  user_id UUID REFERENCES users,
  display_name TEXT,
  preferences JSONB,
  onboarding_completed BOOLEAN
)
```

#### Feel Sharper Core
```sql
workouts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  date DATE,
  exercises JSONB,
  notes TEXT,
  duration_minutes INTEGER
)

nutrition_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  date DATE,
  meals JSONB,
  total_calories INTEGER,
  macros JSONB
)

body_metrics (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  date DATE,
  weight_kg DECIMAL,
  body_fat_percentage DECIMAL,
  measurements JSONB
)
```

## Security Architecture

### Authentication & Authorization
- JWT-based authentication via Supabase Auth
- Row-Level Security (RLS) policies on all tables
- API route middleware for auth validation
- Session management with secure cookies
- 2FA support (planned)

### Data Protection
- Encryption at rest (Supabase managed)
- Encryption in transit (TLS 1.3)
- Sensitive data hashing (bcrypt)
- PII isolation in separate tables
- GDPR-compliant data handling

### API Security
- Rate limiting per user/IP
- CORS configuration
- Input validation with Zod
- SQL injection prevention (parameterized queries)
- XSS protection (React default escaping)

## Performance Architecture

### Frontend Optimization
- Server-side rendering (SSR) for initial load
- Static generation for marketing pages
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Bundle size monitoring

### Backend Optimization
- Database indexing strategy
- Query optimization with EXPLAIN
- Connection pooling
- Caching strategy (React Query + Redis planned)
- CDN for static assets

### Scaling Strategy
- Vertical scaling first (bigger instances)
- Horizontal scaling when needed
- Database read replicas for analytics
- Edge functions for geo-distribution
- Queue-based processing for heavy tasks

## Development Workflow

### Local Development
```bash
pnpm install        # Install dependencies
pnpm dev           # Start all apps
pnpm build         # Build all apps
pnpm test          # Run tests
pnpm typecheck     # Type checking
```

### CI/CD Pipeline
1. **PR Creation**: Automated checks
2. **Tests**: Unit, integration, type checking
3. **Build**: Production build verification
4. **Preview**: Vercel preview deployment
5. **Merge**: Automatic deployment to production

### Environment Management
- `.env.local` for local development
- Vercel environment variables for production
- Secret rotation every 90 days
- No secrets in code repository

## Integration Points

### Third-Party Services
- **Anthropic**: AI coach and insights
- **OpenAI**: Embeddings and search
- **Stripe**: Payment processing (planned)
- **SendGrid**: Transactional email (planned)
- **Segment**: Analytics (planned)

### Webhooks & Events
- Supabase webhooks for database events
- Stripe webhooks for payment events
- Custom webhooks for integrations
- Event-driven architecture for decoupling

## Monitoring & Observability

### Metrics to Track
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- User session duration
- Feature adoption rates

### Logging Strategy
- Structured logging (JSON)
- Log levels (ERROR, WARN, INFO, DEBUG)
- Centralized log aggregation (planned)
- No PII in logs
- 30-day retention

### Alerting Rules
- API error rate > 1%
- Response time > 2s
- Database connection failures
- Failed payment processing
- Security anomalies

## Disaster Recovery

### Backup Strategy
- Daily automated database backups
- 30-day backup retention
- Point-in-time recovery capability
- Backup testing quarterly
- Geo-redundant storage

### Recovery Procedures
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours
- Documented runbooks
- Regular disaster recovery drills
- Communication plan for incidents

## Future Architecture Considerations

### Phase 2 (3-6 months)
- Redis caching layer
- Background job processing (Bull/BullMQ)
- Real-time features (WebSockets)
- Advanced analytics pipeline
- Multi-region deployment

### Phase 3 (6-12 months)
- Microservices for specific domains
- Event sourcing for audit trails
- GraphQL API layer
- ML model serving infrastructure
- Self-hosted option for enterprises

## Architecture Decision Records (ADRs)

Key decisions are documented in `/docs/architecture/decisions/`:

1. **ADR-001**: Monorepo with Turborepo
2. **ADR-002**: Supabase for Backend
3. **ADR-003**: Vercel for Hosting
4. **ADR-004**: Server Components First
5. **ADR-005**: TypeScript Everywhere

---

*Architecture evolves with the product. Propose changes via ADR process.*