# Contributing to Sharpened

Welcome! We're excited you want to contribute to Sharpened. This guide will help you get started quickly.

## 🚨 Critical Rule

**DO NOT modify anything in `apps/feelsharper/`** - This is our production app with real users. Any changes here require special review.

## Quick Start

```bash
# Clone the repo
git clone [repo-url]
cd sharpened-monorepo

# Install dependencies
pnpm install

# Start development
npm run dev:study  # For StudySharper
npm run dev        # For website
npm run dev:all    # All apps (resource intensive)
```

## Repository Structure

```
sharpened-monorepo/
├── apps/
│   ├── feelsharper/     ❌ DO NOT MODIFY
│   ├── studysharper/    ✅ Open for contributions
│   ├── website/         ✅ Open for contributions
│   └── sharplens/       ✅ Open for contributions
├── packages/            ✅ Shared packages (be careful)
├── docs/                ✅ Documentation
├── marketing/           ✅ Marketing materials
└── legal/              ⚠️  Legal docs (needs review)
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Use prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test improvements

### 2. Make Your Changes

Follow these guidelines:
- Write TypeScript, not JavaScript
- Use existing UI components when possible
- Follow the existing code style
- Add tests for new features
- Update documentation

### 3. Test Your Changes

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Tests
npm run test

# All checks
npm run test:all
```

### 4. Commit Your Changes

Write clear commit messages:
```bash
git commit -m "feat: add focus tracking export to PDF"
git commit -m "fix: league assignment for new users"
git commit -m "docs: update architecture diagram"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request with:
- Clear title describing the change
- Description of what and why
- Screenshots for UI changes
- Test results

## Code Style Guide

### TypeScript/React

```tsx
// ✅ Good
export function ComponentName() {
  const [state, setState] = useState<string>('')
  
  return (
    <div className="flex items-center">
      <Button onClick={() => setState('clicked')}>
        Click me
      </Button>
    </div>
  )
}

// ❌ Bad
export default function componentName() {
  const [state, setState] = useState('')
  
  return (
    <div style={{display: 'flex'}}>
      <button onClick={() => setState('clicked')}>
        Click me
      </button>
    </div>
  )
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `FocusTracker.tsx`)
- Utilities: `camelCase.ts` (e.g., `calculatePoints.ts`)
- API Routes: `route.ts` in appropriate folder
- Tests: `ComponentName.test.tsx`

### CSS/Styling

Use Tailwind classes, not inline styles:
```tsx
// ✅ Good
<div className="bg-blue-500 p-4 rounded-lg">

// ❌ Bad
<div style={{ backgroundColor: 'blue', padding: '1rem' }}>
```

## Testing Guidelines

### What to Test

1. **Critical User Flows**: Sign up, core features
2. **Data Transformations**: Point calculations, data processing
3. **API Routes**: Request/response handling
4. **Error States**: What happens when things fail

### Test Structure

```typescript
describe('FocusTracker', () => {
  it('should start tracking when enabled', () => {
    // Arrange
    const tracker = new FocusTracker()
    
    // Act
    tracker.start()
    
    // Assert
    expect(tracker.isActive).toBe(true)
  })
})
```

## Feature Flags

New features should be behind flags:

```typescript
// In component
const [featureEnabled, setFeatureEnabled] = useState(
  localStorage.getItem('myFeatureFlag') === 'true'
)

if (!featureEnabled) {
  return <DefaultExperience />
}

return <NewFeature />
```

## Database Changes

1. Create migration in `supabase/migrations/`
2. Name with timestamp: `20250114000001_description.sql`
3. Include rollback instructions in PR
4. Test migration locally first

## Documentation

Update docs when you:
- Add new features
- Change APIs
- Modify architecture
- Fix important bugs

Docs to update:
- `README.md` - For major features
- `ARCHITECTURE_*.md` - For system changes
- `DECISION_LOG.md` - For significant decisions
- API docs in `docs/api/`

## Getting Help

### Resources

- Architecture docs in `/docs`
- Existing code as examples
- Type definitions in `/types`

### Communication

- Open an issue for bugs
- Discuss features in issues first
- Ask questions in PR comments
- Tag maintainers for reviews

## Review Process

PRs are reviewed for:
1. **Functionality**: Does it work?
2. **Code Quality**: Is it maintainable?
3. **Performance**: Is it efficient?
4. **Security**: Is it safe?
5. **Tests**: Is it tested?
6. **Documentation**: Is it documented?

## Common Patterns

### API Routes

```typescript
export async function POST(req: NextRequest) {
  try {
    // Authenticate
    const user = await authenticate(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Validate
    const body = await req.json()
    const validated = schema.parse(body)
    
    // Process
    const result = await processRequest(validated)
    
    // Respond
    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    )
  }
}
```

### Component Structure

```tsx
interface Props {
  title: string
  onAction: () => void
}

export function Component({ title, onAction }: Props) {
  // Hooks first
  const [state, setState] = useState()
  const router = useRouter()
  
  // Effects second
  useEffect(() => {
    // Effect logic
  }, [])
  
  // Handlers third
  const handleClick = () => {
    onAction()
  }
  
  // Render last
  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

## Performance Guidelines

- Lazy load heavy components
- Use `useMemo` for expensive calculations
- Debounce user input handlers
- Optimize images with Next.js Image
- Keep bundle size small

## Security Guidelines

- Never commit secrets
- Validate all user input
- Use parameterized queries
- Implement rate limiting
- Follow OWASP guidelines

## Questions?

Open an issue or reach out to maintainers. We're here to help!

Happy coding! 🚀