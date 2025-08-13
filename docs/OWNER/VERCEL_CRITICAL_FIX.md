# 🚨 CRITICAL VERCEL FIX - WRONG REPOSITORY CONNECTED

## THE PROBLEM
Your Vercel is connected to the OLD repository `renatodap/feelsharper` (single app)
But you need it connected to the NEW repository `renatodap/sharpened-monorepo` (monorepo with all 3 apps)

## IMMEDIATE FIX - TWO OPTIONS

### OPTION A: Create New Project (RECOMMENDED - 5 minutes)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Create NEW Project**
   - Click "Add New..." → "Project"
   - **IMPORTANT**: Select `sharpened-monorepo` (NOT feelsharper)
   - If you don't see it, click "Import Git Repository" and search for "sharpened-monorepo"

3. **Configure Settings EXACTLY**:
   ```
   Framework Preset: Next.js
   Root Directory: apps/feelsharper
   Build Command: pnpm run build
   Output Directory: .next
   Install Command: npm install -g pnpm && pnpm install
   ```

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   # Add your other keys when ready
   ```

5. **Deploy**
   - Click "Deploy"
   - Should work immediately!

### OPTION B: Update Existing Project (More Complex)

1. **Go to Project Settings**
   - Click on your feelsharper project
   - Go to "Settings" → "Git"

2. **Disconnect Current Repo**
   - Click "Disconnect" from `renatodap/feelsharper`

3. **Connect New Repo**
   - Click "Connect Git Repository"
   - Select `renatodap/sharpened-monorepo`
   - Choose `ops/bootstrap-2025-01-13` branch (or main if you merged)

4. **Update Build Settings**
   - Go to "Build & Development Settings"
   - Set Root Directory: `apps/feelsharper`
   - Set Install Command: `npm install -g pnpm && pnpm install`
   - Set Build Command: `pnpm run build`

5. **Redeploy**
   - Go to Deployments
   - Click "Redeploy" on latest

## WHY THIS IS HAPPENING

- You have TWO GitHub repositories:
  1. `renatodap/feelsharper` - OLD single app (what Vercel is using)
  2. `renatodap/sharpened-monorepo` - NEW monorepo with all 3 apps (what you need)

- Vercel is trying to deploy from the OLD repo which doesn't have `apps/feelsharper` directory
- The NEW monorepo has the correct structure with `apps/feelsharper`, `apps/studysharper`, `apps/website`

## VERIFY SUCCESS

After fixing, your build logs should show:
```
Cloning github.com/renatodap/sharpened-monorepo (not feelsharper)
Installing pnpm...
Running pnpm install...
Building apps/feelsharper...
```

## YOUR REPOS FOR REFERENCE

- OLD (don't use): https://github.com/renatodap/feelsharper
- NEW (use this): https://github.com/renatodap/sharpened-monorepo

**Choose Option A for quickest fix - just create a new Vercel project from the monorepo!**