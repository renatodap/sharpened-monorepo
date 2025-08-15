# Claude Code Development Helper Script (PowerShell)
# Optimized workflows for efficient development with Claude Code on Windows

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Project = "feel"
)

# Colors for output
function Write-Info($message) {
    Write-Host "[INFO] $message" -ForegroundColor Blue
}

function Write-Success($message) {
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Write-Warning($message) {
    Write-Host "[WARNING] $message" -ForegroundColor Yellow
}

function Write-Error($message) {
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# Function to start development server for any project
function Start-DevServer($project) {
    switch ($project) {
        { $_ -in "feel", "feelsharper" } {
            Write-Info "Starting FeelSharper development server..."
            Set-Location "apps/feelsharper"
            npm run dev
        }
        { $_ -in "study", "studysharper" } {
            Write-Info "Starting StudySharper development server..."
            Set-Location "apps/studysharper/apps/web"
            npm run dev
        }
        { $_ -in "reading", "reading-tracker" } {
            Write-Info "Starting Reading Tracker development server..."
            Set-Location "apps/reading-tracker"
            npm run dev
        }
        "website" {
            Write-Info "Starting Website development server..."
            Set-Location "apps/website"
            npm run dev
        }
        "all" {
            Write-Info "Starting all development servers..."
            pnpm run dev:all
        }
        default {
            Write-Error "Unknown project: $project"
            Write-Host "Available projects: feel, study, reading, website, all"
            exit 1
        }
    }
}

# Function to run comprehensive tests
function Test-Project($project) {
    switch ($project) {
        { $_ -in "feel", "feelsharper" } {
            Write-Info "Running FeelSharper tests..."
            Set-Location "apps/feelsharper"
            npm run typecheck
            npm run lint
            npm run test
        }
        "all" {
            Write-Info "Running all tests..."
            pnpm run test:all
        }
        default {
            Write-Error "Unknown project: $project"
            exit 1
        }
    }
}

# Function to build and deploy
function Deploy-Project($project) {
    switch ($project) {
        { $_ -in "feel", "feelsharper" } {
            Write-Info "Building and deploying FeelSharper..."
            Set-Location "apps/feelsharper"
            npm run typecheck
            npm run build
            Write-Success "FeelSharper built successfully!"
            Write-Info "Deploy with: vercel --prod"
        }
        "website" {
            Write-Info "Building and deploying Website..."
            Set-Location "apps/website"
            npm run build
            Write-Success "Website built successfully!"
        }
        default {
            Write-Error "Unknown project: $project"
            exit 1
        }
    }
}

# Function to clean and reset everything
function Reset-Environment {
    Write-Warning "This will clean all node_modules and rebuild..."
    $response = Read-Host "Are you sure? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Info "Cleaning all dependencies..."
        pnpm run clean:deep
        Write-Info "Reinstalling dependencies..."
        pnpm install
        Write-Success "Clean reset completed!"
    } else {
        Write-Info "Operation cancelled."
    }
}

# Function to setup new development environment
function Setup-Development {
    Write-Info "Setting up development environment..."
    
    # Install dependencies
    Write-Info "Installing dependencies with pnpm..."
    pnpm install
    
    # Setup FeelSharper (primary focus)
    Write-Info "Setting up FeelSharper..."
    Set-Location "apps/feelsharper"
    
    if (!(Test-Path ".env.local")) {
        Write-Warning "No .env.local found. Copy from .env.example and add your keys."
        if (Test-Path "env.example") {
            Copy-Item "env.example" ".env.local"
            Write-Info "Created .env.local from env.example"
        }
    }
    
    # Generate embeddings if needed
    if (Test-Path "scripts/generate-embeddings.ts") {
        Write-Info "Generating AI embeddings..."
        npm run generate-embeddings
    }
    
    Set-Location "../.."
    Write-Success "Development environment setup complete!"
    Write-Info "Run 'pnpm dev' to start FeelSharper development server"
}

# Function to quick-check health of all projects
function Test-Health {
    Write-Info "Running health check on all projects..."
    
    $projects = @("feelsharper", "studysharper/apps/web", "reading-tracker", "website")
    
    foreach ($project in $projects) {
        $projectPath = "apps/$project"
        if (Test-Path $projectPath) {
            Write-Info "Checking $project..."
            Set-Location $projectPath
            
            # Check if package.json exists and dependencies are installed
            if ((Test-Path "package.json") -and (Test-Path "node_modules")) {
                Write-Success "$project`: Dependencies OK"
            } else {
                Write-Warning "$project`: Missing dependencies"
            }
            
            # Check TypeScript if available
            if (Test-Path "tsconfig.json") {
                try {
                    npm run typecheck --silent 2>$null
                    Write-Success "$project`: TypeScript OK"
                } catch {
                    Write-Warning "$project`: TypeScript errors"
                }
            }
            
            Set-Location "../.."
        } else {
            Write-Warning "Project not found: $project"
        }
    }
    
    Write-Success "Health check completed!"
}

# Function to show quick development status
function Show-Status {
    Write-Info "=== Sharpened Development Status ==="
    Write-Host ""
    Write-Info "Primary Focus: FeelSharper (AI Fitness Platform)"
    Write-Info "Business Model: Freemium SaaS"
    Write-Info "Tech Stack: Next.js, TypeScript, Supabase, Claude AI"
    Write-Host ""
    
    # Check if development servers are running
    $nextProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*next dev*" }
    if ($nextProcesses) {
        Write-Success "Development server is running"
    } else {
        Write-Warning "No development server detected"
    }
    
    # Check last commit
    try {
        $lastCommit = git log -1 --pretty=format:"%h - %s (%cr)"
        Write-Info "Last commit: $lastCommit"
    } catch {
        # Git not available or not in a git repository
    }
    
    Write-Host ""
    Write-Info "Quick commands:"
    Write-Host "  pnpm dev              # Start FeelSharper (primary focus)"
    Write-Host "  pnpm test:feel        # Test FeelSharper"
    Write-Host "  pnpm build:feel       # Build FeelSharper"
    Write-Host "  .\scripts\claude-dev.ps1 setup  # Setup dev environment"
}

# Main command handler
switch ($Command.ToLower()) {
    "dev" {
        Start-DevServer $Project
    }
    "test" {
        Test-Project $Project
    }
    "deploy" {
        Deploy-Project $Project
    }
    "clean" {
        Reset-Environment
    }
    "setup" {
        Setup-Development
    }
    "health" {
        Test-Health
    }
    "status" {
        Show-Status
    }
    { $_ -in "help", "--help", "-h", "" } {
        Write-Host "Claude Code Development Helper (PowerShell)"
        Write-Host ""
        Write-Host "Usage: .\scripts\claude-dev.ps1 <command> [project]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  dev [project]      Start development server (default: feelsharper)"
        Write-Host "  test [project]     Run tests (default: feelsharper)"
        Write-Host "  deploy [project]   Build and prepare for deployment"
        Write-Host "  clean              Clean and reset all dependencies"
        Write-Host "  setup              Setup development environment"
        Write-Host "  health             Check health of all projects"
        Write-Host "  status             Show development status"
        Write-Host "  help               Show this help message"
        Write-Host ""
        Write-Host "Projects: feel, study, reading, website, all"
        Write-Host ""
        Write-Host "Examples:"
        Write-Host "  .\scripts\claude-dev.ps1 dev          # Start FeelSharper"
        Write-Host "  .\scripts\claude-dev.ps1 dev study    # Start StudySharper"
        Write-Host "  .\scripts\claude-dev.ps1 test         # Test FeelSharper"
        Write-Host "  .\scripts\claude-dev.ps1 setup        # Setup everything"
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Host "Run '.\scripts\claude-dev.ps1 help' for usage information"
        exit 1
    }
}