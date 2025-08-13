# Decisions Pending Owner Approval

## How to Use This Document
1. Each decision is assigned a unique ID (DG-XXX)
2. Review the decision context and options
3. Approve by adding: `APPROVED: DG-XXX <option> <notes>`
4. Decisions block related work until approved

## Pending Decisions

| ID | Decision | Options | Recommendation | Impact | Status |
|----|----------|---------|----------------|--------|--------|
| DG-001 | **Pricing Model** | A) Freemium ($0/$9.99)<br>B) Free trial then paid<br>C) Free forever with limits | **A) Freemium** - Proven model, clear value prop | Affects user acquisition, revenue | 🔐 PENDING |
| DG-002 | **Legal Entity** | A) Delaware C-Corp<br>B) Delaware LLC<br>C) Local jurisdiction | **A) Delaware C-Corp** - Standard for startups | Affects fundraising, taxes | 🔐 PENDING |
| DG-003 | **Terms of Service** | A) Standard template<br>B) Custom drafted<br>C) Hybrid approach | **C) Hybrid** - Template + custom data clauses | Legal compliance | 🔐 PENDING |
| DG-004 | **Data Retention** | A) 30 days<br>B) 90 days<br>C) 1 year<br>D) Indefinite | **B) 90 days** - Balance between UX and privacy | GDPR compliance, storage costs | 🔐 PENDING |
| DG-005 | **Payment Processor** | A) Stripe<br>B) Paddle<br>C) LemonSqueezy | **A) Stripe** - Most flexible, best docs | Revenue collection | 🔐 PENDING |
| DG-006 | **Analytics Provider** | A) Plausible<br>B) PostHog<br>C) Mixpanel<br>D) Build custom | **B) PostHog** - Self-hosted option, full control | User privacy, insights | 🔐 PENDING |
| DG-007 | **Email Service** | A) SendGrid<br>B) Postmark<br>C) Resend | **C) Resend** - Modern, developer-friendly | Transactional emails | 🔐 PENDING |
| DG-008 | **Founding Hire** | A) Full-stack engineer<br>B) Growth marketer<br>C) Designer<br>D) Wait | **A) Full-stack engineer** - Multiply building speed | Burn rate, velocity | 🔐 PENDING |

## Recently Resolved

| ID | Decision | Resolution | Date | Notes |
|----|----------|------------|------|-------|
| | *No resolved decisions yet* | | | |

## Decision Framework

### Urgency Levels
- 🔴 **Critical**: Blocks all progress (24h response needed)
- 🟡 **Important**: Blocks feature work (72h response needed)  
- 🟢 **Standard**: Can work around (1 week response OK)

### Information Provided
Each decision includes:
1. **Context**: Why this decision is needed
2. **Options**: Available choices with pros/cons
3. **Recommendation**: My suggested option with rationale
4. **Impact**: What this affects
5. **Reversibility**: How hard to change later
6. **Cost**: Financial implications

## Escalation Path
If a decision is blocking critical work:
1. Flag in daily standup
2. Send direct message with "BLOCKING: DG-XXX"
3. Provide temporary workaround if possible
4. Document assumption and proceed if no response in SLA

---

*Updated: 2025-01-13*
*Next Review: When any decision is made*