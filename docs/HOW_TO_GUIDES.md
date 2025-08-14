# 📖 HOW TO GUIDES - Step-by-Step Instructions
*Everything you need to execute your plans*

## 🚀 DEPLOYMENT GUIDES

### Deploy FeelSharper to Vercel
**Time**: 30 minutes | **Skill Level**: Beginner

#### Step 1: Create Vercel Account (5 min)
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" 
3. Choose "Continue with GitHub"
4. Authorize Vercel access
5. Select "Hobby" plan (free)

#### Step 2: Import Project (10 min)
1. Click "Add New..." → "Project"
2. Find "sharpened-monorepo" in list
3. Click "Import"
4. **CRITICAL Settings**:
   - Framework: Next.js
   - Root Directory: `apps/feelsharper`
   - Build Command: `cd ../.. && pnpm install && cd apps/feelsharper && npm run build`

#### Step 3: Environment Variables (10 min)
Click "Environment Variables", add these:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_key
```

#### Step 4: Deploy & Fix (5 min)
1. Click "Deploy"
2. If build fails, check error logs
3. Most common fix: Override install command in Settings
4. Test your live URL

**Success**: Live FeelSharper site you can share

---

### Set Up Supabase Database
**Time**: 15 minutes | **Skill Level**: Beginner

#### Step 1: Create Project (3 min)
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. "New project" → Name it "feelsharper"
5. Choose region closest to you
6. Generate strong password, save it

#### Step 2: Get API Keys (2 min)
1. Go to Settings → API
2. Copy "Project URL"
3. Copy "anon public" key
4. Save both for Vercel environment variables

#### Step 3: Set Up Database (10 min)
The app will create tables automatically, but you can:
1. Go to SQL Editor
2. Run any custom setup queries
3. Check Table Editor to see data structure

**Success**: Database ready for user data

---

## 💳 PAYMENT SETUP GUIDES

### LemonSqueezy Integration
**Time**: 45 minutes | **Skill Level**: Intermediate

#### Step 1: Account Setup (10 min)
1. Go to [lemonsqueezy.com](https://lemonsqueezy.com)
2. Sign up for account
3. Verify email and complete onboarding
4. Connect bank account for payouts

#### Step 2: Create Store (10 min)
1. Dashboard → "Stores" → "New Store"
2. Name: "FeelSharper"
3. Description: "AI-powered fitness coaching"
4. Set currency (USD) and timezone

#### Step 3: Create Product (15 min)
1. Products → "New Product"
2. Name: "FeelSharper Pro"
3. Price: $9.99/month
4. Description: "Unlimited AI coaching, advanced analytics"
5. Enable subscription billing
6. Set trial period: 7 days

#### Step 4: Get API Keys (5 min)
1. Settings → API
2. Copy API Key
3. Copy Store ID
4. Generate webhook secret

#### Step 5: Test Integration (5 min)
1. Add keys to Vercel environment
2. Test checkout flow
3. Verify webhooks receive events

**Success**: Users can pay $9.99/month

---

## 📊 ANALYTICS & TRACKING GUIDES

### PostHog Setup (Free Analytics)
**Time**: 20 minutes | **Skill Level**: Beginner

#### Step 1: Account (5 min)
1. Go to [posthog.com](https://posthog.com)
2. Sign up (free tier: 1M events/month)
3. Create project: "FeelSharper"

#### Step 2: Integration (10 min)
1. Copy Project API Key
2. Add to Vercel: `POSTHOG_API_KEY=ph_xxx`
3. Code is already integrated in app

#### Step 3: Dashboards (5 min)
1. Create dashboard for key metrics:
   - Daily active users
   - Workout logs per day  
   - AI conversations
   - Conversion funnel

**Success**: Track user behavior

---

## 🎯 MARKETING GUIDES

### Reddit Launch Strategy
**Time**: 2 hours | **Skill Level**: Beginner

#### Step 1: Account Preparation (15 min)
1. Use existing Reddit account (build credibility)
2. Join these communities:
   - r/fitness
   - r/bodyweightfitness  
   - r/getdisciplined
   - r/entrepreneur

#### Step 2: Value-First Posting (60 min)
**Template for r/fitness daily thread**:
```
"I've been tracking workouts for 6 months and got tired of 
MyFitnessPal's complexity, so I built an AI coach that understands 
natural language. You can just type 'did 3x10 pushups' and it 
tracks everything + gives personalized advice. Still very early 
but would love feedback: [link]"
```

#### Step 3: Engagement (45 min)
1. Respond to every comment within 1 hour
2. Be helpful, not salesy
3. Offer personal workout tips
4. DM interested users for feedback calls

**Success**: 10-50 signups per good post

---

### Product Hunt Launch
**Time**: 1 day prep + launch day | **Skill Level**: Intermediate

#### Step 1: Assets Preparation (2 hours)
1. **Gallery**: 5-6 screenshots showing key features
2. **GIF**: 30-second demo of core workflow
3. **Logo**: Clean 240x240px version
4. **Description**: 260 characters max, compelling

#### Step 2: Pre-Launch (1 week before)
1. Create "coming soon" page
2. Build email list of supporters
3. Schedule for Tuesday 12:01 AM PT
4. Prepare social media assets

#### Step 3: Launch Day (12 hours)
1. **12:01 AM PT**: Product goes live
2. **Morning**: Share on all personal channels
3. **Midday**: Email your network
4. **Afternoon**: Engage with all comments
5. **Evening**: Thank supporters, analyze

**Success**: Top 5 product of the day

---

## 👥 USER RESEARCH GUIDES

### User Interview Process
**Time**: 30 min per interview | **Skill Level**: Beginner

#### Step 1: Recruiting (5 min)
Email template:
```
Subject: Quick feedback on fitness app?

Hi [Name],

I saw you signed up for FeelSharper - thank you! Would you have 
15 minutes this week to chat about your experience? I'm trying 
to make it as useful as possible.

Happy to send you a Starbucks gift card as thanks.

Best,
[Your name]
```

#### Step 2: Interview Questions (20 min)
1. "Walk me through how you currently track workouts"
2. "What's frustrating about current apps?"
3. "Show me how you used FeelSharper"
4. "What confused you?"
5. "What would make this a must-have for you?"
6. "Would you pay $10/month? Why or why not?"

#### Step 3: Follow-up (5 min)
1. Send thank you + gift card
2. Note key insights in spreadsheet
3. Categorize feedback (bugs, features, pricing)

**Success**: Clear priorities for next features

---

## 📈 GROWTH HACKING GUIDES

### Referral Program Implementation
**Time**: 3 hours | **Skill Level**: Intermediate  

#### Step 1: Mechanics Design (30 min)
- Give: 1 month free Pro
- Get: 1 month free Pro
- Tracking: Unique referral codes
- Limit: No limit (viral friendly)

#### Step 2: Technical Implementation (2 hours)
1. Generate unique codes per user
2. Track code usage in database
3. Apply credits automatically
4. Send notification emails

#### Step 3: Promotion (30 min)
1. In-app popup for existing users
2. Email campaign announcement
3. Social sharing buttons
4. Leaderboard for top referrers

**Success**: 30%+ of users refer at least one person

---

## 🔧 TECHNICAL GUIDES

### Add New Feature Process
**Time**: Varies | **Skill Level**: Advanced

#### Step 1: User Story (5 min)
"As a [user type], I want [goal] so that [benefit]"

#### Step 2: Technical Design (30 min)
1. Database changes needed?
2. API endpoints required?
3. UI components to build?
4. Third-party integrations?

#### Step 3: Implementation (2-8 hours)
1. Backend first (API, database)
2. Frontend components
3. Integration and testing
4. Error handling

#### Step 4: Testing (30 min)
1. Manual testing of happy path
2. Edge cases and errors
3. Mobile responsiveness
4. Performance check

#### Step 5: Deployment (15 min)
1. Commit changes
2. Vercel auto-deploys
3. Test production
4. Monitor for errors

**Success**: New feature live without breaking anything

---

## 🆘 TROUBLESHOOTING GUIDES

### Vercel Build Failures
**Most Common Issues**:

1. **Wrong install command**
   - Fix: Override in Settings → "npm install -g pnpm && pnpm install"

2. **Environment variables missing**
   - Fix: Add all required vars in Environment Variables

3. **Build timeout**
   - Fix: Optimize build, remove unused dependencies

4. **Memory issues**
   - Fix: Upgrade to Pro plan or optimize bundle size

### User Can't Sign Up
**Debugging Steps**:
1. Check Supabase logs
2. Verify API keys are correct
3. Test locally with same environment
4. Check browser console for errors

### Payments Not Working
**Common Issues**:
1. Webhook not receiving events
2. API keys incorrect
3. Product not properly configured
4. User email mismatch

---

## 📋 CHECKLISTS

### Pre-Launch Checklist
- [ ] Site deployed and live
- [ ] All core features working
- [ ] Payment integration tested
- [ ] Analytics tracking
- [ ] Error monitoring set up
- [ ] Legal pages (privacy, terms)
- [ ] Demo video recorded
- [ ] Landing page copy finalized

### Launch Day Checklist
- [ ] Final functionality test
- [ ] Share on personal social media
- [ ] Post in relevant communities
- [ ] Email personal network
- [ ] Monitor for issues
- [ ] Respond to feedback quickly
- [ ] Track signups hourly

### Post-Launch Checklist
- [ ] User interviews scheduled
- [ ] Top bugs prioritized
- [ ] Metrics dashboard set up
- [ ] Next week priorities defined
- [ ] Thank you emails sent
- [ ] Growth experiments planned

---

**REMEMBER**: Done is better than perfect. Ship fast, learn fast, improve fast.