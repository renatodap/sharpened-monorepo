# Sharpened Operating Principles

## Decision Making Framework

### Speed vs. Reversibility Matrix
| Decision Type | Reversible | Irreversible |
|--------------|------------|--------------|
| **Low Impact** | Immediate execution | 1-day consideration |
| **High Impact** | 2-day consideration | Decision gate required |

### Decision Gates
Decisions requiring Owner approval are marked with 🔐 and tracked in `/docs/OWNER/DECISIONS_PENDING.md`

### Default to Action
- Bias toward shipping and learning
- Perfect is the enemy of good
- Launch at 70% confidence, iterate to 100%
- Measure everything, adjust quickly

## Safety First

### User Data Protection
- **Principle**: User data is sacred
- **Practice**: 
  - Minimal collection (only what directly helps users)
  - Maximum security (encryption at rest and in transit)
  - Zero third-party sharing without explicit consent
  - 30-day default retention for non-essential data
  - GDPR-ready from day one

### Code Safety
- All changes through pull requests
- Automated testing before merge
- Feature flags for risky changes
- Rollback plan for every deployment
- No secrets in code, ever

### Financial Safety
- No spending without decision gate
- Track burn rate weekly
- 6-month runway minimum
- Revenue before expenses
- Default alive, not default dead

## User Respect

### Honest Communication
- Never promise what we can't deliver
- Acknowledge limitations openly
- Share methodology transparently
- Admit mistakes quickly
- Under-promise, over-deliver

### Time Respect
- Every feature must save user time
- No dark patterns or engagement tricks
- Clear, immediate value proposition
- Unsubscribe/delete in one click
- No unnecessary notifications

### Privacy by Design
- Opt-in for everything non-essential
- Clear data usage explanations
- User owns their data, always
- Export everything on request
- Delete completely on request

## Engineering Excellence

### Code Quality Standards
```
✅ DO                           ❌ DON'T
- Type everything               - Use 'any' type
- Write tests first            - Ship without tests  
- Document complex logic       - Leave TODOs forever
- Refactor continuously        - Accumulate tech debt
- Review all code              - Merge without review
```

### Performance Targets
- Page load: < 2 seconds
- API response: < 200ms p50, < 1s p99
- Zero runtime errors in production
- 99.9% uptime SLA
- Mobile-first, always

### Technical Decisions
- Boring technology for critical path
- Proven over trendy
- Monolith first, microservices when needed
- Buy (SaaS) for non-core, build for differentiators
- Open source when possible

## Growth Philosophy

### Sustainable Growth
- Organic > Paid acquisition
- Word-of-mouth through excellence
- Content marketing over ads
- Community building over broadcasting
- Retention before acquisition

### Pricing Strategy 
- Free tier: Genuinely useful, not crippled
- Paid tiers: Clear value multiplication
- Transparent pricing, no hidden fees
- Annual discounts for commitment
- Never compete on price alone

### Market Approach
- Start narrow, expand deliberately
- Depth before breadth
- Serve power users first
- Geographic focus before global
- One platform excellence before multi-platform

## Team Operations

### Async First
- Documentation over meetings
- Written decisions with rationale
- Clear ownership and accountability
- 24-hour response time SLA
- Time zone inclusive practices

### Continuous Improvement
- Weekly retrospectives
- Monthly strategy reviews
- Quarterly goal setting
- Annual vision alignment
- Daily standup via written updates

### Knowledge Management
- Everything documented
- Single source of truth
- Version control for decisions
- Searchable and indexed
- Regular pruning and updates

## Customer Success

### Support Philosophy
- Every complaint is a product improvement opportunity
- Response within 24 hours
- Resolution within 72 hours
- Public status page for incidents
- Proactive communication always

### Feature Development
- User request → Research → Prototype → Test → Ship
- No feature without user validation
- Measure adoption for every feature
- Sunset unused features gracefully
- Backwards compatibility when possible

### Community Building
- Users are partners, not customers
- Transparency builds trust
- Share the journey publicly
- Celebrate user wins
- Learn from user failures

## Financial Discipline

### Unit Economics
- Know CAC, LTV, and payback period
- Track by cohort and channel
- Optimize for profitability, not growth
- Sustainable margins from day one
- No blitzscaling

### Resource Allocation
- 40% Product development
- 20% Infrastructure and operations
- 20% Growth and marketing
- 10% Customer success
- 10% Buffer for opportunities

### Spending Rules
- Every dollar must return three
- Measure ROI on everything
- Cancel what doesn't work
- Negotiate everything
- Pay annually for discounts

## Risk Management

### Identified Risks
1. **Technical**: Single points of failure
2. **Market**: Competitor with more resources
3. **Financial**: Runway depletion
4. **Legal**: Data breach or compliance failure
5. **Team**: Key person dependency

### Mitigation Strategies
- Technical: Redundancy and backups
- Market: Differentiation through depth
- Financial: Revenue diversity
- Legal: Compliance-first development
- Team: Documentation and cross-training

## Success Metrics

### Leading Indicators
- Daily active users
- Feature adoption rate
- Support ticket volume
- Code deployment frequency
- Test coverage percentage

### Lagging Indicators
- Monthly recurring revenue
- Churn rate
- Customer lifetime value
- Net promoter score
- Gross margin

## Cultural Values

### What We Celebrate
- Shipping meaningful improvements
- Saying no to feature creep
- Finding simpler solutions
- Helping users succeed
- Learning from failures

### What We Avoid
- Perfection paralysis
- Not-invented-here syndrome
- Growth at all costs
- Complexity for its own sake
- Meetings that should be emails

## Escalation Triggers

### Immediate Escalation Required
- Security breach or vulnerability
- User data exposure
- Service outage > 15 minutes
- Legal notice or threat
- Media inquiry

### Decision Gate Required 🔐
- Pricing changes
- New vendor contracts > $500/month
- Hiring decisions
- Architecture changes
- Partnership agreements

---

*These principles are living documents. Propose changes via PR with rationale.*