# Development Documentation

## Overview
Product development guidelines, technical specifications, and implementation details for all Sharpened products.

## Documents

### Development Guidelines
- [Development Playbook](./DEVELOPMENT_PLAYBOOK.md) - Comprehensive development practices and workflows
- [Changelog](./CHANGELOG.md) - Version history and release notes
- [Product Decision Logs](./PRODUCT_DECISION_LOGS.md) - Key product decisions and rationale

### Product Specifications
- [FeelSharper PRD](./PRODUCT_PRD_feelsharper.md) - Product requirements for FeelSharper
- [Product Ecosystem](./SHARPENED_PRODUCT_ECOSYSTEM.md) - Overview of all products and integrations

## Development Standards

### Code Quality
- **Type Safety**: 100% TypeScript coverage for JavaScript projects
- **Testing**: Minimum 80% test coverage for critical paths
- **Linting**: ESLint for JS/TS, Black/Flake8 for Python
- **Documentation**: Inline comments for complex logic, API documentation

### Git Workflow
```bash
# Feature development
git checkout -b feature/feature-name
git commit -m "feat: add new feature"
git push origin feature/feature-name

# Bug fixes
git checkout -b fix/bug-description
git commit -m "fix: resolve issue with..."

# Documentation
git checkout -b docs/update-description
git commit -m "docs: update documentation for..."
```

### Development Environment

#### Prerequisites
- Node.js 18+ and pnpm
- Python 3.10+ with pip
- Git and GitHub CLI
- Docker (optional)

#### Quick Start
```bash
# Clone repository
git clone https://github.com/sharpened/monorepo.git
cd monorepo

# Install dependencies
pnpm install

# Start development servers
# FeelSharper
cd apps/feelsharper
npm run dev

# StudySharper
cd apps/studysharper
pnpm dev
```

### Testing Strategy

#### Unit Tests
```bash
# JavaScript/TypeScript
npm test
npm run test:watch

# Python
python -m pytest
python -m pytest --cov=backend/
```

#### Integration Tests
```bash
# E2E tests with Playwright
npm run test:e2e

# API tests
npm run test:api
```

## Release Process

### Version Management
- Semantic versioning (MAJOR.MINOR.PATCH)
- Automated changelog generation
- Git tags for releases

### Deployment Pipeline
1. **Development** - Feature branches, local testing
2. **Staging** - Preview deployments on Vercel
3. **Production** - Main branch auto-deploy

### Quality Gates
- ✅ All tests passing
- ✅ Type checking passes
- ✅ Linting passes
- ✅ Security scan passes
- ✅ Performance benchmarks met

## Related Documentation
- [Architecture Overview](../architecture/ARCHITECTURE_OVERVIEW.md)
- [Testing Strategy](../architecture/TESTING_STRATEGY.md)
- [Technical Roadmap](../architecture/TECHNICAL_ROADMAP.md)