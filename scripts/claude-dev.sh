#!/bin/bash
# Claude Code Development Helper Script
# Optimized workflows for efficient development with Claude Code

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to start development server for any project
dev_server() {
    local project=$1
    
    case $project in
        "feel"|"feelsharper")
            log_info "Starting FeelSharper development server..."
            cd apps/feelsharper && npm run dev
            ;;
        "study"|"studysharper")
            log_info "Starting StudySharper development server..."
            cd apps/studysharper/apps/web && npm run dev
            ;;
        "reading"|"reading-tracker")
            log_info "Starting Reading Tracker development server..."
            cd apps/reading-tracker && npm run dev
            ;;
        "website")
            log_info "Starting Website development server..."
            cd apps/website && npm run dev
            ;;
        "all")
            log_info "Starting all development servers..."
            pnpm run dev:all
            ;;
        *)
            log_error "Unknown project: $project"
            echo "Available projects: feel, study, reading, website, all"
            exit 1
            ;;
    esac
}

# Function to run comprehensive tests
test_project() {
    local project=$1
    
    case $project in
        "feel"|"feelsharper")
            log_info "Running FeelSharper tests..."
            cd apps/feelsharper
            npm run typecheck && npm run lint && npm run test
            ;;
        "all")
            log_info "Running all tests..."
            pnpm run test:all
            ;;
        *)
            log_error "Unknown project: $project"
            exit 1
            ;;
    esac
}

# Function to build and deploy
deploy_project() {
    local project=$1
    
    case $project in
        "feel"|"feelsharper")
            log_info "Building and deploying FeelSharper..."
            cd apps/feelsharper
            npm run typecheck && npm run build
            log_success "FeelSharper built successfully!"
            log_info "Deploy with: vercel --prod"
            ;;
        "website")
            log_info "Building and deploying Website..."
            cd apps/website
            npm run build
            log_success "Website built successfully!"
            ;;
        *)
            log_error "Unknown project: $project"
            exit 1
            ;;
    esac
}

# Function to clean and reset everything
clean_reset() {
    log_warning "This will clean all node_modules and rebuild..."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning all dependencies..."
        pnpm run clean:deep
        log_info "Reinstalling dependencies..."
        pnpm install
        log_success "Clean reset completed!"
    else
        log_info "Operation cancelled."
    fi
}

# Function to setup new development environment
setup_dev() {
    log_info "Setting up development environment..."
    
    # Install dependencies
    log_info "Installing dependencies with pnpm..."
    pnpm install
    
    # Setup FeelSharper (primary focus)
    log_info "Setting up FeelSharper..."
    cd apps/feelsharper
    
    if [ ! -f ".env.local" ]; then
        log_warning "No .env.local found. Copy from .env.example and add your keys."
        if [ -f "env.example" ]; then
            cp env.example .env.local
            log_info "Created .env.local from env.example"
        fi
    fi
    
    # Generate embeddings if needed
    if [ -f "scripts/generate-embeddings.ts" ]; then
        log_info "Generating AI embeddings..."
        npm run generate-embeddings
    fi
    
    cd ../..
    log_success "Development environment setup complete!"
    log_info "Run 'pnpm dev' to start FeelSharper development server"
}

# Function to quick-check health of all projects
health_check() {
    log_info "Running health check on all projects..."
    
    projects=("feelsharper" "studysharper/apps/web" "reading-tracker" "website")
    
    for project in "${projects[@]}"; do
        if [ -d "apps/$project" ]; then
            log_info "Checking $project..."
            cd "apps/$project"
            
            # Check if package.json exists and dependencies are installed
            if [ -f "package.json" ] && [ -d "node_modules" ]; then
                log_success "$project: Dependencies OK"
            else
                log_warning "$project: Missing dependencies"
            fi
            
            # Check TypeScript if available
            if [ -f "tsconfig.json" ]; then
                if npm run typecheck --silent > /dev/null 2>&1; then
                    log_success "$project: TypeScript OK"
                else
                    log_warning "$project: TypeScript errors"
                fi
            fi
            
            cd ../..
        else
            log_warning "Project not found: $project"
        fi
    done
    
    log_success "Health check completed!"
}

# Function to show quick development status
dev_status() {
    log_info "=== Sharpened Development Status ==="
    echo
    log_info "Primary Focus: FeelSharper (AI Fitness Platform)"
    log_info "Business Model: Freemium SaaS"
    log_info "Tech Stack: Next.js, TypeScript, Supabase, Claude AI"
    echo
    
    # Check if development servers are running
    if pgrep -f "next dev" > /dev/null; then
        log_success "Development server is running"
    else
        log_warning "No development server detected"
    fi
    
    # Check last commit
    if git rev-parse --git-dir > /dev/null 2>&1; then
        local last_commit=$(git log -1 --pretty=format:"%h - %s (%cr)")
        log_info "Last commit: $last_commit"
    fi
    
    echo
    log_info "Quick commands:"
    echo "  pnpm dev              # Start FeelSharper (primary focus)"
    echo "  pnpm test:feel        # Test FeelSharper"
    echo "  pnpm build:feel       # Build FeelSharper"
    echo "  ./scripts/claude-dev.sh setup  # Setup dev environment"
}

# Main command handler
case ${1:-""} in
    "dev")
        dev_server ${2:-"feel"}
        ;;
    "test")
        test_project ${2:-"feel"}
        ;;
    "deploy")
        deploy_project ${2:-"feel"}
        ;;
    "clean")
        clean_reset
        ;;
    "setup")
        setup_dev
        ;;
    "health")
        health_check
        ;;
    "status")
        dev_status
        ;;
    "help"|"--help"|"-h"|"")
        echo "Claude Code Development Helper"
        echo
        echo "Usage: ./scripts/claude-dev.sh <command> [project]"
        echo
        echo "Commands:"
        echo "  dev [project]      Start development server (default: feelsharper)"
        echo "  test [project]     Run tests (default: feelsharper)"
        echo "  deploy [project]   Build and prepare for deployment"
        echo "  clean              Clean and reset all dependencies"
        echo "  setup              Setup development environment"
        echo "  health             Check health of all projects"
        echo "  status             Show development status"
        echo "  help               Show this help message"
        echo
        echo "Projects: feel, study, reading, website, all"
        echo
        echo "Examples:"
        echo "  ./scripts/claude-dev.sh dev          # Start FeelSharper"
        echo "  ./scripts/claude-dev.sh dev study    # Start StudySharper"
        echo "  ./scripts/claude-dev.sh test         # Test FeelSharper"
        echo "  ./scripts/claude-dev.sh setup        # Setup everything"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Run './scripts/claude-dev.sh help' for usage information"
        exit 1
        ;;
esac