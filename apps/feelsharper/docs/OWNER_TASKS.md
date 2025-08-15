# OWNER TASKS - Feel Sharper Setup Requirements

## Overview
This document tracks all owner-action items required to fully enable Feel Sharper's features. Each task requires manual configuration that cannot be automated via code.

## Task Table

| ID | Title | Why it matters | Time | Risk | Prereqs | Steps Guide | Status | Owner Notes |
|----|-------|----------------|------|------|---------|-------------|--------|-------------|
| OT-001 | Configure Supabase Project | Database, auth, and real-time features won't work without it | 15 | Critical | Supabase account | [GUIDE-supabase-setup.md](./GUIDE-supabase-setup.md) | Todo | |
| OT-002 | Set OpenAI API Key | AI features, embeddings, and voice transcription require this | 5 | High | OpenAI account with billing | [GUIDE-openai-setup.md](./GUIDE-openai-setup.md) | Todo | |
| OT-003 | Set Anthropic API Key | Smart coaching and AI assistant features need Claude | 5 | High | Anthropic account | [GUIDE-anthropic-setup.md](./GUIDE-anthropic-setup.md) | Todo | |
| OT-004 | Generate VAPID Keys | Push notifications for PWA functionality | 2 | Medium | None | [GUIDE-vapid-setup.md](./GUIDE-vapid-setup.md) | Todo | |
| OT-005 | Configure Stripe Payments | Premium subscriptions and payment processing | 20 | High | Stripe account, business verification | [GUIDE-stripe-setup.md](./GUIDE-stripe-setup.md) | Todo | |
| OT-006 | Set up PostHog Analytics | User behavior tracking and feature adoption metrics | 10 | Low | PostHog account | [GUIDE-posthog-setup.md](./GUIDE-posthog-setup.md) | Todo | |
| OT-007 | Configure Apple HealthKit | Apple Watch integration for wearables data | 30 | Medium | Apple Developer account ($99/year) | [GUIDE-healthkit-setup.md](./GUIDE-healthkit-setup.md) | Todo | |
| OT-008 | Configure Garmin Connect | Garmin device integration | 20 | Medium | Garmin Connect Developer account | [GUIDE-garmin-setup.md](./GUIDE-garmin-setup.md) | Todo | |
| OT-009 | Set up Resend Email Service | Transactional emails and notifications | 10 | Low | Resend account | [GUIDE-resend-setup.md](./GUIDE-resend-setup.md) | Todo | |
| OT-010 | Configure Sentry Monitoring | Error tracking and performance monitoring | 10 | Low | Sentry account | [GUIDE-sentry-setup.md](./GUIDE-sentry-setup.md) | Todo | |
| OT-011 | Set up OAuth Providers | Social login (Google, GitHub) | 15 | Low | Provider developer accounts | [GUIDE-oauth-setup.md](./GUIDE-oauth-setup.md) | Todo | |
| OT-012 | Configure Domain & SSL | Production deployment with custom domain | 30 | Medium | Domain name, hosting provider | [GUIDE-domain-setup.md](./GUIDE-domain-setup.md) | Todo | |

## Priority Order

### Critical (Blocks Core Features)
1. **OT-001**: Supabase - Without this, the app won't function at all
2. **OT-002**: OpenAI - Required for AI features and embeddings
3. **OT-003**: Anthropic - Required for smart coaching

### High Priority (Major Features)
4. **OT-005**: Stripe - Needed for monetization
5. **OT-004**: VAPID Keys - Enables mobile PWA experience

### Medium Priority (Enhanced Experience)
6. **OT-007**: Apple HealthKit - Key differentiator for iOS users
7. **OT-008**: Garmin Connect - Important for fitness enthusiasts
8. **OT-012**: Domain & SSL - Required for production launch

### Low Priority (Nice to Have)
9. **OT-006**: PostHog - Analytics for growth
10. **OT-009**: Resend - Email notifications
11. **OT-010**: Sentry - Error monitoring
12. **OT-011**: OAuth - Social login convenience

## Verification Checklist
- [ ] All `.env.local` variables are set
- [ ] `npm run dev` starts without errors
- [ ] Database migrations applied successfully
- [ ] API endpoints return expected responses
- [ ] Push notifications prompt appears
- [ ] Payment flow completes in test mode

## Notes
- Start with Critical tasks to get basic functionality
- Test each integration thoroughly before moving to the next
- Keep API keys secure - never commit to git
- Document any issues or custom configurations in Owner Notes column

Last Updated: 2025-08-14