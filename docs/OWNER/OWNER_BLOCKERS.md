# OWNER BLOCKERS - RENATO DAP
*Updated: 2025-08-13 Evening*

## 🚨 IMMEDIATE BLOCKERS (Stopping 1,000 Users Goal)

### 1. API KEYS & PRODUCTION CREDENTIALS
**BLOCKING**: Cannot launch FeelSharper to ANY users
**WHAT I NEED FROM YOU - RIGHT NOW**: 
- [ ] Supabase production keys (or approve $25/month Pro plan)
- [ ] Anthropic API key (or approve $20/month)
- [ ] LemonSqueezy account for payments (15 min setup)
- **Without these, we have ZERO users, not 1,000**

### 2. DOMAIN & HOSTING - DETAILED VERCEL DEPLOYMENT STEPS
**BLOCKING**: Cannot send users anywhere
**WHAT YOU NEED TO DO - STEP BY STEP**:

#### A. Domain Purchase (15 minutes)
1. Go to namecheap.com or godaddy.com
2. Search for "feelsharper.com" and "studysharper.com"
3. Add both to cart ($12-15 each/year)
4. Complete purchase with your credit card
5. **Save login credentials** for DNS setup

#### B. Vercel Account Setup (10 minutes)
1. Go to vercel.com/signup
2. Sign up with your GitHub account (pradord)
3. Select "Hobby" plan initially (free, upgrade later)
4. Authorize Vercel to access your GitHub repos

#### C. Deploy FeelSharper to Vercel (20 minutes)
1. **In Vercel Dashboard:**
   - Click "Add New Project"
   - Import from GitHub → select "sharpened-monorepo"
   - **IMPORTANT**: Set these configurations:
     ```
     Framework Preset: Next.js
     Root Directory: apps/feelsharper
     Build Command: cd ../.. && pnpm install && cd apps/feelsharper && npm run build
     Output Directory: .next
     Install Command: cd ../.. && pnpm install
     ```

2. **Environment Variables (CRITICAL):**
   Click "Environment Variables" and add ALL of these:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ANTHROPIC_API_KEY=your_anthropic_key
   OPENAI_API_KEY=your_openai_key
   LEMONSQUEEZY_API_KEY=your_lemonsqueezy_key
   LEMONSQUEEZY_STORE_ID=your_store_id
   LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
   POSTHOG_API_KEY=your_posthog_key
   RESEND_API_KEY=your_resend_key
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://feelsharper.com
   ```

3. **Deploy Settings:**
   - Node.js Version: 20.x
   - Package Manager: pnpm
   - Build & Development Settings:
     - Output Directory: Keep default (.next)
     - Install Command Override: `cd ../.. && pnpm install`

4. Click "Deploy" and wait 3-5 minutes

#### D. Deploy StudySharper (Same Process)
1. Add New Project → Import "sharpened-monorepo" again
2. Set Root Directory: `apps/studysharper`
3. Same build commands but for studysharper path
4. Add similar environment variables
5. Deploy

#### E. Connect Custom Domains (10 minutes each)
1. **In Vercel Project Settings → Domains:**
   - Add "feelsharper.com" 
   - Add "www.feelsharper.com"
   
2. **In Namecheap/GoDaddy DNS:**
   - Add A Record: @ → 76.76.21.21 (Vercel IP)
   - Add CNAME: www → cname.vercel-dns.com
   - Remove any existing A/CNAME records

3. **Wait 5-30 minutes for DNS propagation**

#### F. Post-Deployment Checklist
- [ ] Test production URL works
- [ ] Test login/signup flow
- [ ] Test payment integration
- [ ] Set up monitoring alerts
- [ ] Configure error tracking

### 3. PAYMENT PROCESSING ENTITY
**BLOCKING**: Cannot accept $9.99/month subscriptions
**WHAT I NEED FROM YOU**:
- [ ] Business entity name for LemonSqueezy
- [ ] Bank account to connect for payouts
- **This blocks ALL revenue**

## NON-BLOCKING BUT TIME-SENSITIVE

### Service Account Creation (Can wait until launch week)
- LemonSqueezy payment account
- PostHog analytics account  
- Resend email service account
- **TIME NEEDED**: 1 hour total to set up all

### Demo Video Recording
- 2-3 minute Feel Sharper demo
- Show workout parsing and AI coach
- **TIME NEEDED**: 30 minutes

## WHAT I'M HANDLING WITHOUT YOUR INPUT
- All technical development
- Documentation and planning
- Market research and competitive analysis
- Architecture and infrastructure
- Testing and quality assurance
- Feature implementation

## YOUR ROLE
1. Make strategic decisions when blocked
2. Handle external communications (experts, contractors, legal)
3. Approve major budget items
4. Record demo videos/marketing content

---
*I will continue aggressive execution on everything else. Only contact me for the items above.*