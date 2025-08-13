# 🚨 VERCEL FINAL FIX - INSTALL COMMAND

## THE PROBLEM
Build is failing because npm doesn't understand `workspace:*` dependencies (that's pnpm-specific)

## THE FIX - UPDATE THESE SETTINGS IN VERCEL

### Go to your Vercel Project Settings:

1. **Go to**: https://vercel.com/dashboard → Your project → Settings → Build & Development Settings

2. **Change these EXACT settings**:

```
Framework Preset: Next.js
Root Directory: apps/feelsharper
Build Command: pnpm run build
Output Directory: .next
Install Command: npm install -g pnpm && pnpm install
Development Command: pnpm run dev
```

**CRITICAL**: The Install Command MUST be:
```
npm install -g pnpm && pnpm install
```

This installs pnpm first, then uses it to install dependencies.

3. **Save** the settings

4. **Redeploy**:
   - Go to Deployments tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"
   - Don't use cache - select "Redeploy"

## WHY THIS WORKS

1. `npm install -g pnpm` - Installs pnpm globally on Vercel's build machine
2. `pnpm install` - Uses pnpm to install dependencies (understands workspace:*)
3. `pnpm run build` - Uses pnpm to run the build

## VERIFY IT'S WORKING

In the build logs you should see:
```
Running "install" command: `npm install -g pnpm && pnpm install`...
added 1 package in 2s
Packages: +XXX
```

NOT:
```
Running "install" command: `npm install`...
npm error code EUNSUPPORTEDPROTOCOL
```

## IF STILL FAILING

Make sure in Vercel Settings you have:
- ✅ Root Directory: `apps/feelsharper` (NOT just `/`)
- ✅ Install Command: `npm install -g pnpm && pnpm install` (EXACT)
- ✅ Build Command: `pnpm run build`
- ✅ Framework Preset: Next.js

**This is the final fix - it will work!**