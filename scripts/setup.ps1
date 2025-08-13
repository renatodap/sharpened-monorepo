# Sharpened Monorepo Setup Script (Windows PowerShell)
# Run: .\scripts\setup.ps1

Write-Host "🚀 Setting up Sharpened Monorepo..." -ForegroundColor Cyan

# Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 20+ from https://nodejs.org" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
}

# Check pnpm
$pnpmVersion = pnpm --version 2>$null
if (-not $pnpmVersion) {
    Write-Host "📦 Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    $pnpmVersion = pnpm --version
}
Write-Host "✅ pnpm version: $pnpmVersion" -ForegroundColor Green

# Check Git
$gitVersion = git --version 2>$null
if (-not $gitVersion) {
    Write-Host "⚠️  Git is not installed. Version control won't be available." -ForegroundColor Yellow
} else {
    Write-Host "✅ Git version: $gitVersion" -ForegroundColor Green
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Setup environment files
Write-Host "`n🔧 Setting up environment files..." -ForegroundColor Yellow

# Feel Sharper
$feelSharperEnv = "apps/feelsharper/.env.local"
if (-not (Test-Path $feelSharperEnv)) {
    Copy-Item "apps/feelsharper/env.example" $feelSharperEnv
    Write-Host "✅ Created $feelSharperEnv" -ForegroundColor Green
    Write-Host "⚠️  Please update $feelSharperEnv with your API keys" -ForegroundColor Yellow
} else {
    Write-Host "✓ $feelSharperEnv already exists" -ForegroundColor Gray
}

# Study Sharper
$studySharperEnv = "apps/studysharper/apps/web/.env.local"
if (-not (Test-Path $studySharperEnv)) {
    if (Test-Path "apps/studysharper/apps/web/.env.example") {
        Copy-Item "apps/studysharper/apps/web/.env.example" $studySharperEnv
        Write-Host "✅ Created $studySharperEnv" -ForegroundColor Green
        Write-Host "⚠️  Please update $studySharperEnv with your API keys" -ForegroundColor Yellow
    }
} else {
    Write-Host "✓ $studySharperEnv already exists" -ForegroundColor Gray
}

# Website
$websiteEnv = "apps/website/.env.local"
if (-not (Test-Path $websiteEnv)) {
    if (Test-Path "apps/website/.env.example") {
        Copy-Item "apps/website/.env.example" $websiteEnv
        Write-Host "✅ Created $websiteEnv" -ForegroundColor Green
    }
} else {
    Write-Host "✓ $websiteEnv already exists" -ForegroundColor Gray
}

# Setup Git hooks
if (Test-Path ".git") {
    Write-Host "`n🪝 Setting up Git hooks..." -ForegroundColor Yellow
    pnpm prepare
    Write-Host "✅ Git hooks configured" -ForegroundColor Green
}

# Build packages
Write-Host "`n🔨 Building shared packages..." -ForegroundColor Yellow
pnpm run build --filter="@sharpened/*"

# Type checking
Write-Host "`n🔍 Running type checks..." -ForegroundColor Yellow
$typeCheckResult = pnpm run typecheck 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Type checking passed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Type checking has issues. Run 'pnpm typecheck' to see details" -ForegroundColor Yellow
}

# Database setup reminder
Write-Host "`n💾 Database Setup Required:" -ForegroundColor Yellow
Write-Host "1. Create a Supabase project at https://supabase.com" -ForegroundColor White
Write-Host "2. Run migrations in supabase/migrations/" -ForegroundColor White
Write-Host "3. Update .env.local files with your Supabase credentials" -ForegroundColor White

# Display next steps
Write-Host "`n✨ Setup Complete!" -ForegroundColor Green
Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update environment variables in .env.local files" -ForegroundColor White
Write-Host "2. Run 'pnpm dev' to start development servers" -ForegroundColor White
Write-Host "3. Visit http://localhost:3000 for Feel Sharper" -ForegroundColor White
Write-Host "4. Visit http://localhost:3001 for Study Sharper" -ForegroundColor White
Write-Host "5. Visit http://localhost:3002 for Marketing Website" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "- Technical Roadmap: docs/TECHNICAL_ROADMAP.md" -ForegroundColor White
Write-Host "- Testing Strategy: docs/TESTING_STRATEGY.md" -ForegroundColor White
Write-Host "- Business Development: docs/BUSINESS_DEVELOPMENT.md" -ForegroundColor White

Write-Host "`n🎯 Available Commands:" -ForegroundColor Cyan
Write-Host "pnpm dev         - Start all development servers" -ForegroundColor White
Write-Host "pnpm build       - Build all applications" -ForegroundColor White
Write-Host "pnpm test        - Run all tests" -ForegroundColor White
Write-Host "pnpm lint        - Lint all code" -ForegroundColor White
Write-Host "pnpm typecheck   - Check TypeScript types" -ForegroundColor White
Write-Host "pnpm format      - Format code with Prettier" -ForegroundColor White