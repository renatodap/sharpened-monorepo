#!/bin/bash
# Sharpened Monorepo Setup Script (macOS/Linux)
# Run: ./scripts/setup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Setting up Sharpened Monorepo...${NC}"

# Check prerequisites
echo -e "\n${YELLOW}📋 Checking prerequisites...${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 20+ from https://nodejs.org${NC}"
    exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}📦 Installing pnpm...${NC}"
    npm install -g pnpm
fi
PNPM_VERSION=$(pnpm --version)
echo -e "${GREEN}✅ pnpm version: $PNPM_VERSION${NC}"

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅ Git version: $GIT_VERSION${NC}"
else
    echo -e "${YELLOW}⚠️  Git is not installed. Version control won't be available.${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
pnpm install

# Setup environment files
echo -e "\n${YELLOW}🔧 Setting up environment files...${NC}"

# Feel Sharper
FEELSHARPER_ENV="apps/feelsharper/.env.local"
if [ ! -f "$FEELSHARPER_ENV" ]; then
    if [ -f "apps/feelsharper/env.example" ]; then
        cp "apps/feelsharper/env.example" "$FEELSHARPER_ENV"
        echo -e "${GREEN}✅ Created $FEELSHARPER_ENV${NC}"
        echo -e "${YELLOW}⚠️  Please update $FEELSHARPER_ENV with your API keys${NC}"
    fi
else
    echo -e "✓ $FEELSHARPER_ENV already exists"
fi

# Study Sharper
STUDYSHARPER_ENV="apps/studysharper/apps/web/.env.local"
if [ ! -f "$STUDYSHARPER_ENV" ]; then
    if [ -f "apps/studysharper/apps/web/.env.example" ]; then
        cp "apps/studysharper/apps/web/.env.example" "$STUDYSHARPER_ENV"
        echo -e "${GREEN}✅ Created $STUDYSHARPER_ENV${NC}"
        echo -e "${YELLOW}⚠️  Please update $STUDYSHARPER_ENV with your API keys${NC}"
    fi
else
    echo -e "✓ $STUDYSHARPER_ENV already exists"
fi

# Website
WEBSITE_ENV="apps/website/.env.local"
if [ ! -f "$WEBSITE_ENV" ]; then
    if [ -f "apps/website/.env.example" ]; then
        cp "apps/website/.env.example" "$WEBSITE_ENV"
        echo -e "${GREEN}✅ Created $WEBSITE_ENV${NC}"
    fi
else
    echo -e "✓ $WEBSITE_ENV already exists"
fi

# Setup Git hooks
if [ -d ".git" ]; then
    echo -e "\n${YELLOW}🪝 Setting up Git hooks...${NC}"
    pnpm prepare
    echo -e "${GREEN}✅ Git hooks configured${NC}"
fi

# Build packages
echo -e "\n${YELLOW}🔨 Building shared packages...${NC}"
pnpm run build --filter="@sharpened/*"

# Type checking
echo -e "\n${YELLOW}🔍 Running type checks...${NC}"
if pnpm run typecheck; then
    echo -e "${GREEN}✅ Type checking passed${NC}"
else
    echo -e "${YELLOW}⚠️  Type checking has issues. Run 'pnpm typecheck' to see details${NC}"
fi

# Database setup reminder
echo -e "\n${YELLOW}💾 Database Setup Required:${NC}"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Run migrations in supabase/migrations/"
echo "3. Update .env.local files with your Supabase credentials"

# Display next steps
echo -e "\n${GREEN}✨ Setup Complete!${NC}"
echo -e "\n${CYAN}📝 Next Steps:${NC}"
echo "1. Update environment variables in .env.local files"
echo "2. Run 'pnpm dev' to start development servers"
echo "3. Visit http://localhost:3000 for Feel Sharper"
echo "4. Visit http://localhost:3001 for Study Sharper"
echo "5. Visit http://localhost:3002 for Marketing Website"

echo -e "\n${CYAN}📚 Documentation:${NC}"
echo "- Technical Roadmap: docs/TECHNICAL_ROADMAP.md"
echo "- Testing Strategy: docs/TESTING_STRATEGY.md"
echo "- Business Development: docs/BUSINESS_DEVELOPMENT.md"

echo -e "\n${CYAN}🎯 Available Commands:${NC}"
echo "pnpm dev         - Start all development servers"
echo "pnpm build       - Build all applications"
echo "pnpm test        - Run all tests"
echo "pnpm lint        - Lint all code"
echo "pnpm typecheck   - Check TypeScript types"
echo "pnpm format      - Format code with Prettier"