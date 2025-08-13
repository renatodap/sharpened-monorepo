# Sharpened Financial Model

## Unit Economics

### Customer Acquisition Cost (CAC)
| Channel | Cost per Acquisition | LTV/CAC Ratio | Status |
|---------|---------------------|---------------|--------|
| Organic (Content) | $5 | 20:1 | Active |
| Reddit/Communities | $8 | 12.5:1 | Active |
| Google Ads | $35 | 2.9:1 | Testing |
| Facebook Ads | $42 | 2.4:1 | Testing |
| Influencers | $28 | 3.6:1 | Planned |
| **Blended Average** | **$18** | **5.6:1** | Healthy |

### Customer Lifetime Value (LTV)
```
Monthly Churn Rate: 8%
Average Customer Lifetime: 12.5 months
Monthly Revenue per User: $9.99
Gross Margin: 85%

LTV = $9.99 × 12.5 × 0.85 = $106
```

### Payback Period
```
CAC: $18
Monthly Revenue: $9.99
Gross Margin: 85%
Monthly Profit: $8.49

Payback Period = $18 / $8.49 = 2.1 months
```

## Revenue Projections

### Monthly Recurring Revenue (MRR) Growth
| Month | Free Users | Paid Users | Conversion | MRR | Growth |
|-------|------------|------------|------------|-----|--------|
| 1 | 100 | 5 | 5% | $50 | - |
| 2 | 300 | 20 | 6.7% | $200 | 300% |
| 3 | 600 | 50 | 8.3% | $500 | 150% |
| 4 | 1,200 | 120 | 10% | $1,200 | 140% |
| 5 | 2,000 | 220 | 11% | $2,200 | 83% |
| 6 | 3,500 | 420 | 12% | $4,200 | 91% |
| 9 | 8,000 | 1,120 | 14% | $11,200 | 50% |
| 12 | 15,000 | 2,250 | 15% | $22,500 | 35% |

### Revenue Scenarios

#### Conservative (80% of projections)
- Month 6: $3,360 MRR
- Month 12: $18,000 MRR
- Year 1 Total: $84,000

#### Base Case (100% of projections)
- Month 6: $4,200 MRR
- Month 12: $22,500 MRR
- Year 1 Total: $105,000

#### Optimistic (150% of projections)
- Month 6: $6,300 MRR
- Month 12: $33,750 MRR
- Year 1 Total: $157,500

## Cost Structure

### Fixed Costs (Monthly)
| Category | Cost | Notes |
|----------|------|-------|
| Infrastructure | | |
| - Vercel Hosting | $20 | Pro plan |
| - Supabase | $25 | Pro plan |
| - Domain/DNS | $5 | Cloudflare |
| **Subtotal** | **$50** | |
| | | |
| Tools & Services | | |
| - Email Service | $30 | SendGrid/Resend |
| - Analytics | $0 | Free tier initially |
| - Monitoring | $0 | Free tier initially |
| - CI/CD | $0 | GitHub Actions free |
| **Subtotal** | **$30** | |
| | | |
| APIs | | |
| - Anthropic Claude | $200 | ~4,000 requests |
| - OpenAI | $50 | Embeddings |
| **Subtotal** | **$250** | |
| | | |
| **Total Fixed** | **$330** | |

### Variable Costs
| Category | Cost per User | Notes |
|----------|---------------|-------|
| Infrastructure | $0.05 | Database, bandwidth |
| API Usage | $0.30 | AI features |
| Support | $0.10 | Time allocation |
| **Total Variable** | **$0.45** | Per paid user |

### Gross Margin Calculation
```
Revenue per User: $9.99
Variable Costs: $0.45
Gross Profit: $9.54
Gross Margin: 95.5%

With fixed costs allocated (at 1,000 users):
Effective Gross Margin: 85%
```

## Burn Rate & Runway

### Monthly Burn (Pre-Revenue)
| Category | Cost |
|----------|------|
| Infrastructure | $330 |
| Marketing | $500 |
| Contractors | $0 |
| Legal/Accounting | $200 |
| Miscellaneous | $200 |
| **Total Burn** | **$1,230** |

### Runway Calculation
```
Initial Capital: $25,000
Monthly Burn: $1,230
Runway (no revenue): 20 months

With revenue (Month 6):
Net Burn: $1,230 - $4,200 = -$2,970 (profitable)
```

### Path to Profitability
- **Breakeven**: Month 4 (~120 paid users)
- **Default Alive**: Month 6
- **Cash Flow Positive**: Month 5
- **Target: 30% Net Margin**: Month 9

## Pricing Strategy

### Tier Structure
| Tier | Price | Features | Target Users | % of Users |
|------|-------|----------|--------------|------------|
| Free | $0 | 3 logs/day, 7-day history | Casual | 85% |
| Pro | $9.99/mo | Unlimited, AI coach, exports | Serious | 13% |
| Team | $19.99/mo | Everything + sharing | Trainers | 2% |

### Pricing Experiments 🔐 DECISION GATE
1. **Annual Discount**: 2 months free (16.7% discount)
2. **Student Discount**: 50% off with .edu email
3. **Launch Pricing**: $4.99/mo for first 1,000 users
4. **Bundle Options**: With other Sharpened products

## Investment Requirements

### Bootstrapping Scenario (Recommended)
```
Personal Investment: $10,000
Revenue Reinvestment: 100%
Profitability: Month 4
No External Funding Needed
```

### Seed Round Scenario (If Needed)
```
Raise: $500,000
Valuation: $2.5M (20% dilution)
Use of Funds:
- Engineering (2 hires): $300,000
- Marketing: $100,000
- Operations: $50,000
- Buffer: $50,000
Runway: 18 months
```

## Financial Controls

### Key Metrics to Track
1. **MRR Growth Rate** (target: 20% MoM)
2. **Gross Margin** (target: > 80%)
3. **CAC Payback** (target: < 3 months)
4. **Burn Multiple** (target: < 1)
5. **Quick Ratio** (target: > 3)

### Budget Allocation Rules
- Product: 40%
- Marketing: 30%
- Operations: 20%
- Buffer: 10%

### Spending Approval Limits
- < $100: Automatic
- $100-500: Weekly review
- $500-2,000: Owner approval 🔐
- > $2,000: Decision gate required 🔐

## Scenario Planning

### Best Case (20% probability)
- Viral growth loop works
- 50,000 users by Month 12
- $75K MRR
- Series A ready

### Base Case (60% probability)
- Steady organic growth
- 15,000 users by Month 12
- $22.5K MRR
- Profitable and sustainable

### Worst Case (20% probability)
- Slow growth
- 5,000 users by Month 12
- $7.5K MRR
- Need to cut costs or raise

## Exit Strategy Options

### Acquisition Targets
1. **Fitness Platforms** (Strava, MyFitnessPal)
2. **Health Tech** (Headspace, Calm)
3. **Productivity** (Notion, Obsidian)
4. **AI Companies** (Scale AI, Anthropic)

### Valuation Multiples
- SaaS Average: 5-7x ARR
- AI Premium: 8-12x ARR
- Strategic Acquisition: 10-15x ARR

### Target Exit (3-5 years)
- $10M ARR
- 50-70x multiple
- $50-70M valuation

## Financial Dashboard

### Weekly Metrics
- New signups
- Trial → Paid conversions
- MRR added/churned
- Burn rate
- Cash balance

### Monthly Review
- P&L statement
- Cohort analysis
- CAC by channel
- LTV trends
- Runway update

### Quarterly Planning
- Budget vs. actual
- Forecast update
- Scenario planning
- Investment needs

---

*Model updated monthly with actuals*
*Next review: End of Month 1*