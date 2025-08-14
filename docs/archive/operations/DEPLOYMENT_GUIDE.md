# 🚀 VERCEL MIGRATION GUIDE - MONOREPO SETUP
*CRITICAL: Read this completely before starting*
*Estimated Time: 30 minutes*

## 📌 CURRENT SITUATION
You have:
- 3 separate Vercel projects (feelsharper, studysharper, website)
- 3 separate GitHub repos (old structure)
- 1 new monorepo (sharpened-monorepo) with all apps

## 🎯 MIGRATION STRATEGY

### RECOMMENDED: Option A - Fresh Start (Cleaner)
Create new Vercel projects from the monorepo. Old projects will stop updating but won't break.

### ALTERNATIVE: Option B - Update Existing
Reconfigure existing projects to use monorepo. More complex but preserves history.

---

# 📋 OPTION A: FRESH START (RECOMMENDED)

## Step 1: Prepare GitHub
```bash
# First, push monorepo to GitHub
cd C:\Users\pradord\Documents\Projects\sharpened-monorepo
git init
git add .
git commit -m "Initial monorepo setup with all enhancements"
git remote add origin https://github.com/yourusername/sharpened-monorepo.git
git push -u origin main
```

## Step 2: Create Vercel Projects

### 2.1 Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click "Add New..." → "Project"

### 2.2 Create Feel Sharper Project
1. **Import Git Repository** → Select `sharpened-monorepo`
2. **Configure Project:**
   ```
   Project Name: sharpened-feelsharper
   Framework Preset: Next.js
   Root Directory: apps/feelsharper
   
   Build & Development Settings:
   - Build Command: npm run build
   - Output Directory: .next
   - Install Command: cd ../.. && npm install
   - Development Command: npm run dev
   ```

3. **Environment Variables** (Add these):
   ```env
   # From your ACTIONS_TODO.md file
   NEXT_PUBLIC_SUPABASE_URL=https://uayxgxeueyjiokhvmjwd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheXhneGV1ZXlqaW9raHZtandkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzUwOTcsImV4cCI6MjA2OTA1MTA5N30.GunwPyCrUle9ST6_J9kpBwZImmKTniz78ngm9bBewCs
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVheXhneGV1ZXlqaW9raHZtandkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ3NTA5NywiZXhwIjoyMDY5MDUxMDk3fQ.4XSBX-Jkto9oyt7--1zQ4mcTJGuXVzJGh3TCgWMV560
   ANTHROPIC_API_KEY=sk-ant-xxx-[YOUR_KEY_HERE]
   
   # Add when you have them:
   LEMONSQUEEZY_API_KEY=
   NEXT_PUBLIC_POSTHOG_KEY=
   RESEND_API_KEY=
   ```

4. **Click "Deploy"**

### 2.3 Create Study Sharper Project
1. **Repeat process** with new project
2. **Configure Project:**
   ```
   Project Name: sharpened-studysharper
   Framework Preset: Next.js
   Root Directory: apps/studysharper
   
   Build & Development Settings:
   - Build Command: npm run build
   - Output Directory: .next
   - Install Command: cd ../.. && npm install
   - Development Command: npm run dev
   ```

3. **Environment Variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://sggsgkpwnjarfbghlqgh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZ3Nna3B3bmphcmZiZ2hscWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzU2NjIsImV4cCI6MjA3MDYxMTY2Mn0.3n5t4bkQ0klM9Vsfgtz2QaRwdYqKynriX2E8b1N3FvY
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnZ3Nna3B3bmphcmZiZ2hscWdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTAzNTY2MiwiZXhwIjoyMDcwNjExNjYyfQ.vBN7laMBruKvKsdCMck5hb3Me0_YDY0ocLHaO_HgI9o
   ANTHROPIC_API_KEY=sk-ant-xxx-[YOUR_KEY_HERE]
   
   # Add when you have them:
   LEMONSQUEEZY_API_KEY=
   NEXT_PUBLIC_POSTHOG_KEY=
   RESEND_API_KEY=
   ```

### 2.4 Create Website Project
1. **Repeat process** with new project
2. **Configure Project:**
   ```
   Project Name: sharpened-website
   Framework Preset: Next.js
   Root Directory: apps/website
   
   Build & Development Settings:
   - Build Command: npm run build
   - Output Directory: .next
   - Install Command: cd ../.. && npm install
   - Development Command: npm run dev
   ```

3. **Environment Variables**: Use same as Feel Sharper

## Step 3: Configure Domains

### For Feel Sharper Project:
1. Go to Settings → Domains
2. Add domain: `feelsharper.com` (or `feelsharper.vercel.app` for testing)
3. Follow DNS instructions if using custom domain

### For Study Sharper Project:
1. Go to Settings → Domains
2. Add domain: `studysharper.com` (or `studysharper.vercel.app` for testing)

### For Website Project:
1. Go to Settings → Domains
2. Add domain: `sharpened.app` (or `sharpened.vercel.app` for testing)

---

# 📋 OPTION B: UPDATE EXISTING PROJECTS

## Step 1: Update Each Existing Project

### For your existing Feel Sharper project:
1. Go to https://vercel.com/dashboard
2. Click on your `feelsharper` project
3. Settings → Git
4. **Disconnect** from old repository
5. **Connect** to new repository: `sharpened-monorepo`
6. Settings → General → Root Directory: `apps/feelsharper`
7. Settings → General → Build Command: `npm run build`
8. Settings → General → Install Command: `cd ../.. && npm install`

### Repeat for Study Sharper and Website projects

---

# 🧪 TESTING YOUR DEPLOYMENT

## Local Testing First
```bash
# Test the monorepo locally
cd C:\Users\pradord\Documents\Projects\sharpened-monorepo

# Install dependencies
npm install

# Run all apps
npm run dev

# Or test individually
cd apps/feelsharper && npm run dev
# Visit http://localhost:3000

cd apps/studysharper && npm run dev
# Visit http://localhost:3001

cd apps/website && npm run dev
# Visit http://localhost:3002
```

## Verify Vercel Deployment
1. Check build logs in Vercel dashboard
2. Visit deployment URLs
3. Test key features:
   - [ ] Feel Sharper: Can create account
   - [ ] Feel Sharper: Can log workout
   - [ ] Study Sharper: Can track focus session
   - [ ] Website: Landing page loads

---

# 🔥 COMMON ISSUES & FIXES

## Build Fails
```
Error: Module not found
```
**Fix**: Check `package.json` in the app directory, ensure all deps are listed

```
Error: Environment variable not found
```
**Fix**: Add missing env vars in Vercel project settings

## Deployment Works but App Broken
- Check browser console for errors
- Verify Supabase keys are correct
- Check network tab for failed API calls

## Domain Not Working
- DNS can take 24-48 hours to propagate
- Use `.vercel.app` domain for immediate testing

---

# 🎯 QUICK CHECKLIST

## Before Starting:
- [ ] Monorepo pushed to GitHub
- [ ] Have all API keys ready
- [ ] 30 minutes available

## Option A - Fresh Start:
- [ ] Create 3 new Vercel projects
- [ ] Configure root directories
- [ ] Add environment variables
- [ ] Deploy each project
- [ ] Configure domains
- [ ] Test deployments

## Option B - Update Existing:
- [ ] Disconnect old repos
- [ ] Connect monorepo
- [ ] Update root directories
- [ ] Update build commands
- [ ] Redeploy
- [ ] Test deployments

---

# 💰 NEXT: PAYMENT & SERVICES SETUP

Once Vercel is working, set up:

## 1. LemonSqueezy (Today/Tomorrow)
- Sign up: https://lemonsqueezy.com
- Create products ($0 free, $9.99/mo premium)
- Get API keys
- Add to Vercel env vars

## 2. PostHog Analytics (Tomorrow)
- Sign up: https://posthog.com
- Create project
- Get API key
- Add to Vercel env vars

## 3. Resend Email (Tomorrow)
- Sign up: https://resend.com
- Verify domain
- Get API key
- Add to Vercel env vars

---

# 📞 NEED HELP?

## If stuck on Vercel:
1. Screenshot the error
2. Check build logs (Vercel → Project → Functions → Logs)
3. Common fixes:
   - Clear cache: Settings → Functions → Clear Cache
   - Redeploy: Deployments → ... → Redeploy

## Ask me to:
- Generate specific config files
- Debug specific errors
- Create deployment scripts
- Write missing API endpoints

---

*Remember: Old projects won't break immediately. You can migrate gradually if needed.*