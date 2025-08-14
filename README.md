# Sharpened Monorepo

> Helping people become the sharpened version of themselves through AI-powered personal improvement tools.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start all apps in development
pnpm dev

# Build all apps
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck
```

## 📁 Repository Structure

```
sharpened-monorepo/
├── apps/
│   ├── website/          # Marketing site (needs content)
│   ├── feelsharper/      # Fitness app (ready for deployment)
│   ├── studysharper/     # Study platform (needs deployment)
│   └── sharplens/        # Computer vision (prototype only)
├── packages/
│   ├── analytics/        # Analytics infrastructure
│   ├── ui/              # Shared UI components (planned)
│   └── config/          # Shared configurations
├── docs/                # Business & technical documentation
└── scripts/             # Build and deployment scripts
```

## 📚 Documentation

### [📖 Complete Documentation Hub](./docs/)
Comprehensive documentation organized by domain - architecture, business, development, operations, research, reports, and strategy.

### Quick Links by Role

#### 🏗️ [Architecture & Technical](./docs/architecture/)
- [Architecture Overview](./docs/architecture/ARCHITECTURE_OVERVIEW.md)
- [API Documentation](./docs/architecture/API_DOCUMENTATION.md)
- [Security & Privacy](./docs/architecture/SECURITY_AND_PRIVACY.md)

#### 💼 [Business & Strategy](./docs/business/)
- [Market Research](./docs/business/MARKET_RESEARCH.md)
- [Financial Model](./docs/business/FINANCIAL_MODEL.md)
- [Growth Plan](./docs/business/GROWTH_PLAN.md)

#### ⚙️ [Development](./docs/development/)
- [Development Playbook](./docs/development/DEVELOPMENT_PLAYBOOK.md)
- [Product Ecosystem](./docs/development/SHARPENED_PRODUCT_ECOSYSTEM.md)
- [FeelSharper PRD](./docs/development/PRODUCT_PRD_feelsharper.md)

#### 🎯 [Strategy & Vision](./docs/strategy/)
- [Vision & Mission](./docs/strategy/VISION.md)
- [Unified Strategy](./docs/strategy/UNIFIED_STRATEGY.md)
- [Execution Roadmap](./docs/strategy/EXECUTION_ROADMAP_2025.md)

#### 👤 [Owner Actions](./docs/OWNER/)
- [Immediate Actions](./docs/OWNER/IMMEDIATE.md) 🚨
- [Decisions Pending](./docs/OWNER/DECISIONS_PENDING.md) 🔐
- [Actions TODO](./docs/OWNER/ACTIONS_TODO.md) 📋

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth), Next.js API Routes
- **AI/ML**: Anthropic Claude, OpenAI Embeddings
- **Infrastructure**: Vercel, Cloudflare
- **Tools**: pnpm workspaces, Turborepo, ESLint, Prettier

## 🎯 Current Status (August 14, 2025)

### Products Built (Not Yet Launched)

#### Feel Sharper (Flagship Product)
- ✅ Natural language workout parsing implemented
- ✅ Food logging with nutrition database
- ✅ Weight tracking with analytics
- ✅ PWA support ready
- 🚧 Needs deployment and user testing
- 📅 Targeting September 2025 public launch

#### Study Sharper
- ✅ RAG pipeline implemented
- ✅ Spaced repetition system built
- ✅ PDF upload and processing ready
- 🚧 Needs Supabase deployment
- 📅 October 2025 launch target

#### SharpLens (Computer Vision)
- ✅ UI prototype complete
- 🚧 Backend integration needed
- 📅 Q4 2025 alpha release

### Business Status
- **Users**: 0 (pre-launch)
- **Revenue**: $0 MRR
- **Team**: 1 founder (solo)
- **Funding**: Bootstrapped, seeking seed round Q4 2025

## 🔐 Environment Setup

Create `.env.local` files in each app with:

```bash
# Required API Keys
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
SUPABASE_URL=your_url_here
SUPABASE_ANON_KEY=your_key_here

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter feelsharper test

# Run e2e tests
pnpm test:e2e
```

## 🚢 Deployment

Each app can be deployed independently:

```bash
# Deploy specific app
pnpm --filter feelsharper build
pnpm --filter feelsharper deploy

# Deploy all apps
pnpm deploy
```

## 📝 Contributing

Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting PRs.

### Commit Convention
We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Testing
- `chore:` Maintenance

## 📊 Metrics & Goals

### North Star Metric
**Weekly Active Users** - Users who log at least 3 items per week

## 📈 Path to $100M ARR

### Phase 1: Launch (Now - Oct 2025)
- Ship FeelSharper → 1,000 users
- Launch StudySharper → 2,000 users  
- Hit $10K MRR
- Raise $500K seed

### Phase 2: Scale (Nov 2025 - Jun 2026)
- Launch 5 more products
- Reach 25,000 users
- Hit $100K MRR
- Raise $5M Series A

### Phase 3: Dominate (Jul 2026 - Dec 2027)
- 15+ products live
- 1 million users
- $8.3M MRR ($100M ARR)
- IPO or acquisition

## 🔥 Why Sharpened Will Win

1. **AI-Native**: Built for AI from day one, not retrofitted
2. **Speed**: Ship daily with Claude Code assistance
3. **Focus**: Personal improvement only, done perfectly
4. **Timing**: 12-18 month window before Big Tech enters
5. **Mission**: Genuinely help people become better

## 🎆 The Vision

**One million people improving themselves measurably every single day.**

In an era where AI replaces jobs, Sharpened gives people the tools to level up. We're not building apps - we're building the infrastructure for human potential.

## 📧 Contact

**Founder**: [Your Name]  
**Updates**: Every Sunday to investors  
**Metrics**: [sharpened.app/metrics](https://sharpened.app/metrics)  

---

**THE TIME IS NOW. SHIP TODAY.**

*"The best time to plant a tree was 20 years ago. The second best time is now."*
