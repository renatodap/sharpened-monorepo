# Security and Privacy Documentation

## Data Classification

### PII Categories
| Level | Data Type | Examples | Protection Required |
|-------|-----------|----------|-------------------|
| Critical | Authentication | Passwords, tokens | Hashed, encrypted at rest |
| High | Health Data | Weight, workouts, meals | Encrypted, user-owned |
| Medium | Profile | Name, email, preferences | Encrypted, GDPR compliant |
| Low | Analytics | Page views, feature usage | Anonymized, aggregated |

## Security Measures

### Application Security
- **Authentication**: Supabase Auth with JWT
- **Authorization**: Row-Level Security (RLS) on all tables
- **Input Validation**: Zod schemas on all inputs
- **XSS Protection**: React automatic escaping
- **CSRF Protection**: SameSite cookies
- **SQL Injection**: Parameterized queries only
- **Rate Limiting**: 100 requests/minute per user

### Infrastructure Security
- **Hosting**: Vercel (SOC 2 compliant)
- **Database**: Supabase (encrypted at rest)
- **TLS**: 1.3 minimum, HSTS enabled
- **Secrets**: Environment variables, never in code
- **Backups**: Daily automated, encrypted
- **Monitoring**: Error tracking, anomaly detection

## Privacy Policy Requirements

### Data Collection (Minimal)
- Email (required for auth)
- Health metrics (user-entered)
- Usage analytics (anonymized)
- No third-party tracking
- No advertising IDs
- No location tracking

### Data Rights (GDPR Compliant)
- **Access**: Export all data in JSON
- **Rectification**: Edit any data
- **Erasure**: Delete account completely
- **Portability**: Standard format export
- **Objection**: Opt-out of all processing
- **Restriction**: Pause account

### Data Retention 🔐 DECISION GATE
- Active accounts: Indefinite
- Inactive accounts: 90 days
- Deleted accounts: 30 days (soft delete)
- Backups: 30 days
- Logs: 30 days
- Analytics: Aggregated only

## Compliance Checklist

### GDPR Requirements
- [ ] Privacy policy
- [ ] Cookie consent (minimal cookies)
- [ ] Data Processing Agreement
- [ ] Privacy by design
- [ ] Data Protection Officer (when required)
- [ ] Breach notification process

### CCPA Requirements
- [ ] Do Not Sell declaration
- [ ] Privacy rights notice
- [ ] Opt-out mechanism
- [ ] Data inventory

### HIPAA Considerations
- Not currently HIPAA covered entity
- Will require BAA if healthcare partnerships
- PHI handling procedures ready

## Incident Response Plan

### Severity Levels
1. **Critical**: Data breach, service compromise
2. **High**: Authentication bypass, data exposure risk
3. **Medium**: Feature abuse, suspicious activity
4. **Low**: Failed attempts, minor vulnerabilities

### Response Timeline
- Detection → Assessment: 15 minutes
- Assessment → Containment: 1 hour
- Containment → Communication: 4 hours
- Communication → Resolution: 24 hours
- Resolution → Post-mortem: 72 hours

### Communication Plan
1. Internal team notification
2. Affected users notification
3. Regulatory notification (if required)
4. Public disclosure (if required)

## Security Audit Checklist

### Weekly
- [ ] Review failed login attempts
- [ ] Check for unusual API usage
- [ ] Verify backup completion
- [ ] Review error logs

### Monthly
- [ ] Dependency updates
- [ ] Security patch review
- [ ] Access audit
- [ ] Penetration testing (quarterly)

### Annually
- [ ] Full security audit
- [ ] Privacy policy review
- [ ] Compliance check
- [ ] Disaster recovery drill

---

*Security is everyone's responsibility*