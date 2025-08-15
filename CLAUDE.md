# CLAUDE.md - Sharpened Business Ecosystem

This file provides guidance to Claude Code when working with the Sharpened business ecosystem.

## 🎯 Business Focus & Strategy

**Primary Focus**: FeelSharper - AI-powered fitness and wellness platform
**Business Model**: Freemium SaaS with premium coaching features
**Target Market**: Health-conscious individuals seeking personalized fitness guidance

### Current Business Priorities
1. **FeelSharper** - Core revenue driver, full production deployment
2. **StudySharper** - Educational focus tracking, MVP stage
3. **ReadingTracker** - Simple book tracking, utility app
4. **Website** - Professional presence and lead generation
5. **CourtSync** - Tennis court booking (DO NOT TOUCH - separate project)

## 🚀 Development Workflow & Commands

### Universal Commands (run from repo root)
```bash
# Install all dependencies across monorepo
pnpm install

# Development servers (choose one)
pnpm --filter feelsharper dev          # Primary business focus
pnpm --filter studysharper dev         # Education tracking
pnpm --filter reading-tracker dev      # Book tracking
pnpm --filter website dev              # Marketing site

# Build and deploy
pnpm --filter feelsharper build        # Production build
pnpm --filter feelsharper typecheck    # Type safety
pnpm --filter feelsharper lint         # Code quality

# Testing
pnpm --filter feelsharper test:e2e     # End-to-end tests
```

### FeelSharper Specific Commands
```bash
cd apps/feelsharper

# Core development workflow
npm run dev                    # Local development server
npm run build                  # Production build
npm run typecheck             # TypeScript validation
npm run lint                  # ESLint checks

# AI and data operations
npm run generate-embeddings   # Generate AI content embeddings
npm run seed                  # Seed database with initial data
npm run test-assistant        # Test AI coaching features

# Testing suite
npm run test:e2e             # Playwright end-to-end tests
npm test                     # Jest unit tests
```

## 📁 Repository Structure

```
sharpened-monorepo/
├── apps/
│   ├── feelsharper/         # 🎯 PRIMARY BUSINESS - AI Fitness Platform
│   ├── studysharper/        # Educational focus tracking
│   ├── reading-tracker/     # Simple book tracking utility
│   ├── website/             # Marketing and portfolio site
│   └── courtsync/           # ⚠️ DO NOT TOUCH - Separate business
├── docs/                    # Consolidated business documentation
├── legacy/                  # Archived files and old documentation
├── scripts/                 # Automation and development scripts
└── packages/                # Shared utilities and components
```

## 🏗️ Technology Stack

### Frontend & Full-Stack
- **Next.js 15** with App Router and React 19
- **TypeScript** for type safety across all projects
- **Tailwind CSS 4** for styling
- **Supabase** for database, auth, and real-time features
- **Vercel** for deployment and hosting

### AI & Machine Learning
- **Anthropic Claude** for AI coaching and content generation
- **OpenAI** for embeddings and additional AI features
- **Vector databases** for semantic search and RAG
- **Computer vision** for photo analysis (FeelSharper)

### Development Tools
- **pnpm** for package management (monorepo)
- **ESLint + Prettier** for code quality
- **Playwright** for end-to-end testing
- **Jest** for unit testing
- **Vercel CLI** for deployment

## 🎯 FeelSharper - Core Business Architecture

### Key Features
- **AI Fitness Coach**: Personalized workout and nutrition guidance
- **Smart Food Logging**: Photo-based nutrition tracking
- **Progress Analytics**: Advanced body metrics and progress visualization
- **Social Features**: Community, leaderboards, and referral systems
- **Freemium Model**: Core features free, premium AI coaching paid

### Development Patterns
- **Component-driven**: Reusable UI components in `components/`
- **API-first**: Next.js API routes for all backend logic
- **Type-safe**: Full TypeScript coverage with Supabase types
- **Mobile-first**: PWA with offline support and native app feel
- **AI-enhanced**: Claude integration for coaching and content

### Database Schema (Supabase)
- Users, profiles, and authentication
- Workouts, exercises, and program templates
- Food logging with nutrition data
- Body metrics and progress tracking
- Social features (follows, achievements)
- Subscription and payment processing

## 🔧 Custom Development Scripts & Optimization

### Claude Code Optimized Workflows
```bash
# Cross-platform development helper (Windows)
.\scripts\claude-dev.ps1 dev             # Start FeelSharper (primary focus)
.\scripts\claude-dev.ps1 dev study       # Start StudySharper
.\scripts\claude-dev.ps1 test            # Run comprehensive tests
.\scripts\claude-dev.ps1 deploy          # Build and prepare deployment
.\scripts\claude-dev.ps1 setup           # Setup development environment
.\scripts\claude-dev.ps1 health          # Check project health
.\scripts\claude-dev.ps1 status          # Show development status

# Unix/Linux/Mac
./scripts/claude-dev.sh dev              # Start FeelSharper development
./scripts/claude-dev.sh test             # Run all tests
./scripts/claude-dev.sh setup            # Setup environment
```

### Repository Optimization
```bash
# Repository cleanup and optimization (Windows)
.\scripts\optimize-repo.ps1              # Full optimization
.\scripts\optimize-repo.ps1 -DryRun      # Preview changes
.\scripts\optimize-repo.ps1 -Force       # Auto-approve all changes

# Quick cleanup commands
pnpm clean                               # Clean build artifacts
pnpm clean:deep                          # Deep clean all node_modules
```

### Monorepo Management
```bash
# Business-focused development (primary = FeelSharper)
pnpm dev                                 # Start primary business (FeelSharper)
pnpm dev:feel                            # FeelSharper development
pnpm dev:study                           # StudySharper development
pnpm dev:reading                         # Reading Tracker development
pnpm dev:website                         # Marketing website
pnpm dev:all                             # All projects in parallel

# Testing & Quality Assurance
pnpm typecheck                           # TypeScript validation
pnpm typecheck:feel                      # FeelSharper TypeScript
pnpm lint                                # ESLint checks
pnpm lint:feel                           # FeelSharper linting
pnpm test:feel                           # FeelSharper tests
pnpm test:e2e                            # End-to-end tests
pnpm test:all                            # Comprehensive test suite

# Build & Deployment
pnpm build                               # Build primary (FeelSharper)
pnpm build:feel                          # FeelSharper production build
pnpm build:website                       # Website build
pnpm build:all                           # Build all projects

# AI Operations
pnpm ai:embeddings                       # Generate AI content embeddings
pnpm ai:test                             # Test AI assistant functionality

# Database & Setup
pnpm setup                               # Complete environment setup
pnpm setup:db                            # Initialize database
pnpm seed                                # Seed with initial data
```

## 🚀 Deployment & Production

### Environment Variables Required
```bash
# AI Services
ANTHROPIC_API_KEY=                       # Claude AI integration
OPENAI_API_KEY=                          # OpenAI for embeddings

# Database & Auth
SUPABASE_URL=                            # Supabase project URL
SUPABASE_ANON_KEY=                       # Public Supabase key
SUPABASE_SERVICE_ROLE_KEY=               # Server-side operations

# Analytics & Monitoring
NEXT_PUBLIC_POSTHOG_KEY=                 # User analytics
NEXT_PUBLIC_POSTHOG_HOST=                # Analytics endpoint
```

### Deployment Commands
```bash
# FeelSharper production deployment
cd apps/feelsharper
npm run build                            # Verify build works
vercel --prod                            # Deploy to production

# Website deployment
cd apps/website
npm run build && vercel --prod
```

## 🧪 Testing Strategy

### FeelSharper Testing
```bash
# Full testing pipeline
npm run typecheck                        # TypeScript validation
npm run lint                            # Code quality checks
npm run test                            # Unit tests
npm run test:e2e                        # End-to-end automation
```

### Test Coverage Areas
- Authentication flows and user management
- Food logging and nutrition calculations
- Workout creation and tracking
- AI coaching responses and recommendations
- Payment processing and subscription management

## 🔐 Security & Performance

### Security Practices
- Row-level security (RLS) in Supabase
- API rate limiting for AI endpoints
- Input validation and sanitization
- Secure environment variable management
- HTTPS enforcement and security headers

### Performance Optimization
- Next.js automatic code splitting
- Image optimization and lazy loading
- API response caching strategies
- Database query optimization
- CDN for static assets

## 🎨 Brand & Marketing

### Brand Identity
- **FeelSharper**: Modern, health-focused, AI-powered
- **Color Palette**: Clean blues, energetic greens, premium grays
- **Typography**: Modern sans-serif for digital interfaces
- **Voice**: Encouraging, expert, personalized, supportive

### Marketing Strategy
- Content marketing through fitness blog
- Social proof via user success stories
- Freemium conversion through premium AI features
- SEO optimization for fitness and nutrition keywords

## 📊 Business Metrics & Analytics

### Key Performance Indicators
- **User Acquisition**: Signups, conversion rates, acquisition costs
- **Engagement**: DAU/MAU, session duration, feature usage
- **Revenue**: MRR, churn rate, LTV, freemium conversion
- **Product**: AI coaching satisfaction, retention by feature

### Analytics Implementation
- PostHog for user behavior and product analytics
- Supabase analytics for database performance
- Vercel analytics for web performance
- Custom dashboards for business metrics

## 🤖 AI Integration Patterns

### Claude AI Usage
- **Coaching**: Personalized workout and nutrition advice
- **Content**: Blog post generation and optimization
- **Analysis**: Progress interpretation and recommendations
- **Support**: User question answering and guidance

### Development Best Practices
- AI response caching for performance
- Fallback strategies for AI service outages
- User privacy protection in AI interactions
- Cost optimization for AI API usage

## 🔄 Workflow Automation

### Git & Development
```bash
# Standard development flow
git checkout -b feature/new-feature       # Create feature branch
# ... make changes ...
npm run typecheck && npm run lint         # Validate before commit
git commit -m "feat: add new feature"     # Conventional commits
git push origin feature/new-feature       # Push for review
```

### Continuous Integration
- Automated testing on pull requests
- Type checking and linting enforcement
- Deployment previews for all changes
- Performance regression testing

## 📱 Mobile & PWA Strategy

### Progressive Web App Features
- **Offline Support**: Core features work without internet
- **Push Notifications**: Workout reminders and achievements
- **Home Screen Install**: Native app-like experience
- **Camera Integration**: Photo-based food logging
- **Background Sync**: Data sync when connection returns

## 🎯 Business Development Focus

### Immediate Priorities (Next 30 Days)
1. **FeelSharper Premium Launch**: Complete subscription system
2. **User Onboarding**: Optimize conversion funnel
3. **Content Marketing**: Expand fitness blog for SEO
4. **Performance**: Optimize app speed and reliability
5. **Analytics**: Implement comprehensive tracking

### Growth Strategy
- **Product-Led Growth**: Freemium model with clear upgrade path
- **Content Marketing**: SEO-optimized fitness and nutrition content
- **Social Features**: Viral mechanics and user-generated content
- **Partnership**: Integration with fitness trackers and health apps
- **Community**: Build engaged user base through social features

---

## 🚨 Critical Development Rules

1. **Always run typecheck before commits**: `npm run typecheck`
2. **Test AI features thoroughly**: `npm run test-assistant`
3. **Maintain database migrations**: Never modify existing migrations
4. **Protect user data**: Follow privacy best practices
5. **Performance first**: Monitor and optimize Core Web Vitals
6. **Mobile responsive**: Test on multiple device sizes
7. **Offline support**: Ensure core features work offline
8. **Security-first**: Validate all inputs, secure all endpoints

## 📞 Emergency Contacts & Resources

### Development Issues
- Check `CLAUDE.md` in individual project directories
- Review error logs in Vercel dashboard
- Monitor Supabase logs for database issues
- Test AI endpoints for API failures

### Business Operations
- Analytics dashboards for user behavior insights
- Financial metrics tracking for subscription revenue
- User feedback collection and prioritization
- Performance monitoring and alerting

---

*This document is the source of truth for Claude Code development in the Sharpened ecosystem. Update this file when making significant architectural or business changes.*