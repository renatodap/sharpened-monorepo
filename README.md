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
│   ├── website/          # Marketing and landing site
│   ├── feelsharper/      # Fitness tracking app (flagship)
│   └── studysharper/     # Study and learning tools
├── packages/
│   ├── ui/              # Shared UI components
│   ├── config/          # Shared configurations
│   └── prompts/         # AI agent specifications
├── docs/                # Living documentation (Sharpened OS)
├── infra/              # Infrastructure configurations
└── tools/              # Build and development tools
```

## 📚 Documentation

### Core Documents
- [Vision & Mission](./docs/VISION.md) - Why we exist and where we're going
- [Operating Principles](./docs/OPERATING_PRINCIPLES.md) - How we make decisions
- [Architecture Overview](./docs/ARCHITECTURE_OVERVIEW.md) - Technical foundation

### Product & Growth
- [Feel Sharper PRD](./docs/PRODUCT_PRD_feelsharper.md) - Product requirements
- [Market Research](./docs/MARKET_RESEARCH.md) - Market analysis and insights
- [Growth Plan](./docs/GROWTH_PLAN.md) - User acquisition strategy

### Operations
- [Financial Model](./docs/FINANCIAL_MODEL.md) - Unit economics and projections
- [Security & Privacy](./docs/SECURITY_AND_PRIVACY.md) - Data protection
- [HR & Organization](./docs/HR_ORG.md) - Team building plans
- [Legal Checklist](./docs/LEGAL_CHECKLIST.md) - Compliance requirements

### Owner Actions
- [Decisions Pending](./docs/OWNER/DECISIONS_PENDING.md) 🔐 - Awaiting approval
- [Actions Required](./docs/OWNER/ACTIONS_TODO.md) 📋 - Owner todo list

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth), Next.js API Routes
- **AI/ML**: Anthropic Claude, OpenAI Embeddings
- **Infrastructure**: Vercel, Cloudflare
- **Tools**: pnpm workspaces, Turborepo, ESLint, Prettier

## 🎯 Current Status

### Feel Sharper (Flagship Product)
- ✅ Natural language workout parsing
- ✅ Food logging with nutrition data
- ✅ Weight tracking with trends
- 🚧 AI coach integration
- 🚧 Weekly review cycles
- 📅 Mobile app (planned)

### Website
- ✅ Landing page
- 🚧 Conversion optimization
- 📅 Blog and content

### Study Sharper
- ✅ Basic structure
- 📅 Feature development

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

- [Changelog](./docs/CHANGELOG.md)
- [Migration Notes](./MIGRATION.md)

## 📄 License

Proprietary - All rights reserved

---

*Building the future of personal improvement, one commit at a time.*
