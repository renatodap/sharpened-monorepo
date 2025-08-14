# Product Selection Matrix

## Evaluation Criteria
| Product | Time-to-MVP | Reusability | User-wow/effort | Risk | DX Leverage | Total Score |
|---------|------------|-------------|-----------------|------|-------------|-------------|
| Reading Tracker | 9/10 | 8/10 | 9/10 | 2/10 (low) | 9/10 | **37/50** |
| Finance Organizer | 5/10 | 7/10 | 7/10 | 4/10 (medium) | 6/10 | **29/50** |
| Music Coach | 8/10 | 9/10 | 8/10 | 2/10 (low) | 8/10 | **35/50** |

## Selected Products for MVP

### 1. Reading Tracker (Priority 1)
**Rationale**: Highest score, minimal dependencies, immediate value for builder-athletes tracking learning
- **Core Features**: Quick log, auto-fill from URL/ISBN, streak tracking, CSV export
- **Tech Stack**: Next.js, SQLite via Prisma, local-only storage
- **Time Estimate**: 90 minutes to functional MVP

### 2. Music Coach (Priority 2)  
**Rationale**: Strong reusability, complements athletic mindset with practice discipline
- **Core Features**: Practice blocks, timer, tags, streaks, export
- **Tech Stack**: Next.js, SQLite, React hooks for timer
- **Time Estimate**: 75 minutes to functional MVP

## Deferred: Finance Organizer
**Reason**: More complex data modeling, higher risk of scope creep, less immediate ROI for target users