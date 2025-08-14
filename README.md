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

### Current Goals
- 🎯 100 beta users (Month 1)
- 🎯 $1K MRR (Month 3)
- 🎯 10K users (Month 6)
- 🎯 Default alive (Month 4)

## 🔗 Links

- [Documentation Hub](./docs/) - All documentation
- [Changelog](./docs/development/CHANGELOG.md)
- [Migration Notes](./MIGRATION.md)
- [Current Status](./docs/reports/STATUS.md)

## 📄 License

Proprietary - All rights reserved

---

*Building the future of personal improvement, one commit at a time.*
