# COMPLETE VERCEL DEPLOYMENT GUIDE FOR MONOREPO
*Last Updated: August 13, 2025*

## Overview
This guide covers deploying all three websites (FeelSharper, StudySharper, Website) from the new monorepo structure to Vercel, even if they're just basic homepages initially.

---

## STEP 1: GITHUB REPOSITORY SETUP

### Push to GitHub (if not already done)
```bash
# Create new repo on GitHub first, then:
git remote add origin https://github.com/pradord/sharpened-monorepo.git
git branch -M main
git push -u origin main
```

---

## STEP 2: VERCEL ACCOUNT SETUP

### Create Vercel Account
1. Go to [vercel.com/signup](https://vercel.com/signup)
2. Click "Continue with GitHub"
3. Authorize Vercel to access your GitHub account
4. Select "Hobby" plan (free for personal use)
5. Complete onboarding

---

## STEP 3: DEPLOY FEELSHARPER APP

### A. Import Project
1. In Vercel Dashboard, click **"Add New Project"**
2. Click **"Import Git Repository"**
3. Find and select **"sharpened-monorepo"**
4. Click **"Import"**

### B. Configure Build Settings
**CRITICAL - These exact settings for monorepo:**

```
Framework Preset: Next.js
Root Directory: apps/feelsharper
Build Command: cd ../.. && pnpm install && cd apps/feelsharper && npm run build
Output Directory: .next
Install Command: cd ../.. && pnpm install
```

### C. Environment Variables
Click **"Environment Variables"** and add these (even with placeholder values to start):

```bash
# Core Required
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key_here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://feelsharper.vercel.app

# Optional (add when you have them)
ANTHROPIC_API_KEY=sk-ant-placeholder
OPENAI_API_KEY=sk-placeholder
SUPABASE_SERVICE_ROLE_KEY=placeholder
LEMONSQUEEZY_API_KEY=placeholder
LEMONSQUEEZY_STORE_ID=placeholder
LEMONSQUEEZY_WEBHOOK_SECRET=placeholder
POSTHOG_API_KEY=placeholder
RESEND_API_KEY=placeholder
```

### D. Advanced Settings
1. **Node.js Version**: 20.x
2. **Package Manager**: pnpm (auto-detected)
3. **Build Frequency**: Auto
4. **Root Directory**: `apps/feelsharper` (double-check this)

### E. Deploy
1. Click **"Deploy"**
2. Wait 3-5 minutes for build
3. If build fails, check logs and fix issues

### F. Access Your Deployment
- Vercel URL: `https://feelsharper-[random].vercel.app`
- Production URL (after domain setup): `https://feelsharper.com`

---

## STEP 4: DEPLOY STUDYSHARPER APP

### A. Add Second Project
1. Go back to Vercel Dashboard
2. Click **"Add New Project"** again
3. Import **"sharpened-monorepo"** again (yes, same repo)
4. **IMPORTANT**: This creates a separate project for StudySharper

### B. Configure Build Settings
```
Framework Preset: Next.js
Root Directory: apps/studysharper
Build Command: cd ../.. && pnpm install && cd apps/studysharper && npm run build
Output Directory: .next
Install Command: cd ../.. && pnpm install
```

### C. Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key_here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://studysharper.vercel.app
# Add others as needed
```

### D. Deploy
1. Click **"Deploy"**
2. Access at: `https://studysharper-[random].vercel.app`

---

## STEP 5: DEPLOY MARKETING WEBSITE

### A. Add Third Project
1. **"Add New Project"** → Import **"sharpened-monorepo"** again
2. This creates the third deployment for the marketing site

### B. Configure Build Settings
```
Framework Preset: Next.js
Root Directory: apps/website
Build Command: cd ../.. && pnpm install && cd apps/website && npm run build
Output Directory: .next
Install Command: cd ../.. && pnpm install
```

### C. Environment Variables (Minimal)
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://sharpened.vercel.app
```

### D. Deploy
1. Click **"Deploy"**
2. Access at: `https://sharpened-[random].vercel.app`

---

## STEP 6: CUSTOM DOMAIN SETUP (OPTIONAL BUT RECOMMENDED)

### A. Purchase Domains
1. Go to [Namecheap](https://namecheap.com) or [GoDaddy](https://godaddy.com)
2. Purchase:
   - `feelsharper.com`
   - `studysharper.com`
   - `sharpened.com` (or `getsharpened.com`)

### B. Connect to Vercel

#### For FeelSharper:
1. Go to FeelSharper project in Vercel
2. Settings → Domains
3. Add `feelsharper.com`
4. Add `www.feelsharper.com`
5. Follow DNS instructions:
   ```
   A Record: @ → 76.76.21.21
   CNAME: www → cname.vercel-dns.com
   ```

#### Repeat for Each Domain:
- StudySharper → `studysharper.com`
- Website → `sharpened.com`

---

## STEP 7: TROUBLESHOOTING COMMON ISSUES

### Build Fails: "Cannot find module"
**Solution**: Ensure monorepo dependencies are installed
```json
// In vercel.json (if needed)
{
  "installCommand": "cd ../.. && pnpm install",
  "buildCommand": "cd ../.. && pnpm install && cd apps/feelsharper && npm run build"
}
```

### Build Fails: "pnpm not found"
**Solution**: Use npm instead or ensure pnpm is in build
```
Install Command: npm install -g pnpm && cd ../.. && pnpm install
```

### Environment Variables Not Working
**Solution**: 
1. Ensure they're added to Vercel project settings
2. Redeploy after adding variables
3. Use `NEXT_PUBLIC_` prefix for client-side variables

### Page Shows 404
**Solution**: 
1. Check Root Directory is correct (`apps/feelsharper`)
2. Ensure `next.config.ts` exists
3. Check Output Directory is `.next`

---

## STEP 8: POST-DEPLOYMENT CHECKLIST

### For Each Deployment:
- [ ] Homepage loads without errors
- [ ] Console has no critical errors
- [ ] Mobile responsive works
- [ ] Navigation links work
- [ ] Forms submit (if any)
- [ ] Images load properly

### Production Readiness:
- [ ] Replace placeholder API keys with real ones
- [ ] Set up error monitoring (Sentry)
- [ ] Configure analytics (PostHog/GA)
- [ ] Test payment flow (if applicable)
- [ ] Set up email notifications
- [ ] Configure rate limiting

---

## STEP 9: CONTINUOUS DEPLOYMENT

### Automatic Deployments
Once set up, Vercel will automatically:
1. Deploy on every push to `main` branch
2. Create preview deployments for PRs
3. Run build checks before deploying

### Manual Redeploy
1. Go to project in Vercel
2. Click "Redeploy"
3. Choose commit to deploy

---

## STEP 10: MONITORING & OPTIMIZATION

### Enable Analytics
1. Go to Project Settings
2. Enable "Web Analytics" (free)
3. View at: `/analytics` in dashboard

### Speed Insights
1. Enable "Speed Insights"
2. Monitor Core Web Vitals
3. Get performance recommendations

### Function Logs
1. Go to "Functions" tab
2. View API route logs
3. Debug server-side issues

---

## QUICK REFERENCE COMMANDS

### Local Testing Before Deploy
```bash
# Test FeelSharper
cd apps/feelsharper
npm run build
npm run start

# Test StudySharper
cd apps/studysharper
npm run build
npm run start

# Test Website
cd apps/website
npm run build
npm run start
```

### Force Redeploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy specific app
cd apps/feelsharper
vercel --prod
```

---

## ESTIMATED TIME

- **Total Setup Time**: 45-60 minutes
  - Vercel Account: 5 minutes
  - Each App Deploy: 10-15 minutes
  - Domain Setup: 15 minutes
  - Testing: 10 minutes

---

## SUPPORT & HELP

### Vercel Documentation
- [Monorepo Guide](https://vercel.com/docs/monorepos)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/environment-variables)

### Common Issues
- Build logs: Check Vercel dashboard → Project → Deployments → View logs
- Support: support@vercel.com or Discord community

---

## YOUR IMMEDIATE NEXT STEPS

1. **Right now**: Create Vercel account with your GitHub
2. **Deploy FeelSharper**: Even with placeholder env vars, get it live
3. **Deploy others**: Repeat for StudySharper and Website
4. **Share URLs**: Send me the Vercel URLs so I can test
5. **Add real keys**: Once you have API keys, update env vars

**Remember**: It's better to have something deployed (even broken) than nothing deployed. We can fix issues after it's live!