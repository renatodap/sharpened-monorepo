# Decision Log

## 2025-01-14: Sprint Decisions

### 1. Focus Tracking Implementation
**Decision**: Implement passive focus tracking using browser APIs
**Rationale**: 
- Zero friction for users (no manual start/stop)
- Privacy-first with local storage
- Uses proven browser APIs (Page Visibility, activity detection)
**Trade-offs**:
- Less accurate than manual tracking
- May miss reading without interaction
- Accepted for better UX

### 2. Micro-League Size
**Decision**: Cap leagues at 8 people
**Rationale**:
- Dunbar's number suggests 5-9 is optimal for competition
- Small enough to know competitors
- Large enough for variety
**Alternatives Considered**:
- 20+ person leagues (too impersonal)
- 4 person leagues (too small, boring)

### 3. PWA Over Native App
**Decision**: Build as Progressive Web App
**Rationale**:
- No app store friction
- Works on all devices immediately
- Faster iteration and deployment
- Lower maintenance cost
**Trade-offs**:
- Limited iOS functionality
- No app store discovery
- Accepted for speed to market

### 4. Feature Flags in LocalStorage
**Decision**: Store feature flags client-side
**Rationale**:
- Instant toggling without server calls
- Works offline
- Simpler implementation
**Trade-offs**:
- No centralized control
- Can't A/B test easily
- Accepted for MVP simplicity

### 5. Points Calculation
**Decision**: 5 points per minute of focus time
**Rationale**:
- Simple mental math
- Rewards consistency
- 1 hour = 300 points (memorable)
**Alternatives**:
- Complex scoring with bonuses (too complicated)
- 1:1 minute to point (numbers too large)

### 6. Monorepo Protection
**Decision**: Completely isolate FeelSharper from changes
**Rationale**:
- FeelSharper is production with real users
- Prevents accidental breaking changes
- Allows aggressive experimentation elsewhere
**Implementation**:
- No shared packages with FeelSharper
- Separate build pipelines
- Independent deployments

### 7. Single CTA Strategy
**Decision**: One primary "Get Early Access" button
**Rationale**:
- Reduces decision paralysis
- Higher conversion rate
- Clear user journey
**Supporting Elements**:
- Demo links as secondary text links
- Social proof near CTA

### 8. CSV Export Format
**Decision**: Simple CSV with date, duration in seconds and minutes
**Rationale**:
- Universal compatibility
- Easy to import to Excel/Sheets
- Human-readable format
**Headers**: Date, Duration (seconds), Duration (minutes)

### 9. Privacy Mode Design
**Decision**: Hide numbers but keep tracking
**Rationale**:
- Useful for screenshots/screen sharing
- Maintains streak/progress privately
- One-click toggle
**Shows**: Bullets (••••) instead of numbers

### 10. Legal Document Tone
**Decision**: Plain English, conversational tone
**Rationale**:
- Actually readable by users
- Builds trust through transparency
- Legally sufficient while being friendly
**Sections**: Short version first, then details

## Architecture Decisions

### Database Choice
**Decision**: Supabase (PostgreSQL)
**Rationale**:
- Built-in auth and RLS
- Real-time subscriptions
- Generous free tier
- Good DX

### State Management
**Decision**: React hooks + Context (no Redux)
**Rationale**:
- Simpler for current scale
- Less boilerplate
- Easier onboarding for contributors

### Styling Solution
**Decision**: Tailwind CSS + Radix UI
**Rationale**:
- Rapid prototyping with Tailwind
- Accessible components from Radix
- Consistent design system

## Process Decisions

### Branching Strategy
**Decision**: Feature branches with descriptive names
**Rationale**:
- Clear PR boundaries
- Easy rollback if needed
- Good for async collaboration

### Testing Priority
**Decision**: Focus on integration tests over unit tests for MVP
**Rationale**:
- Better ROI for time invested
- Catches real user flow issues
- Unit tests added as needed

### Documentation Approach
**Decision**: Document as we build, not after
**Rationale**:
- Knowledge fresh in mind
- Helps onboard others quickly
- Prevents technical debt