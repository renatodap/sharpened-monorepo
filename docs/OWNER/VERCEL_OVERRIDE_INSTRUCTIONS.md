# 🚨 VERCEL MANUAL OVERRIDE - STEP BY STEP

## THE PROBLEM
Vercel keeps using `npm install` even though we need `pnpm install`

## THE SOLUTION - MANUAL OVERRIDE IN VERCEL DASHBOARD

### 📍 Step 1: Go to Your Project
1. Open https://vercel.com/dashboard
2. Click on your **feelsharper** project

### 📍 Step 2: Navigate to Settings
1. Click the **"Settings"** tab at the top
2. Make sure you're in **"General"** section (left sidebar)

### 📍 Step 3: Find Build & Development Settings
Scroll down to find **"Build & Development Settings"** section

### 📍 Step 4: Override Install Command
Look for this section:
```
Install Command
The command that is used to install your Project's software dependencies. 
If you don't need to install dependencies, override this field and leave it empty.

[Override] ← TOGGLE THIS ON

[___________________________] ← TYPE IN THIS BOX
```

### 📍 Step 5: Enter the Correct Command
In the text box, type EXACTLY:
```
npm install -g pnpm && pnpm install
```

### 📍 Step 6: Save Changes
Click the **"Save"** button at the bottom of the section

### 📍 Step 7: Redeploy
1. Go to **"Deployments"** tab
2. Find your latest deployment
3. Click the **"..."** menu
4. Select **"Redeploy"**
5. Click **"Redeploy"** (don't use cache)

## ✅ WHAT YOU SHOULD SEE AFTER FIXING

In the build logs:
```
Running "install" command: `npm install -g pnpm && pnpm install`...
+ pnpm@8.15.6
Packages: +XXX
Progress: resolved XXX, reused XXX, downloaded XXX, added XXX
```

## ❌ WHAT YOU'RE SEEING NOW (WRONG)
```
Running "install" command: `npm install`...
npm error code EUNSUPPORTEDPROTOCOL
```

## 🎯 ALTERNATIVE: Command Line Override

If you have Vercel CLI installed locally:
```bash
vercel --build-env INSTALL_COMMAND="npm install -g pnpm && pnpm install"
```

## 📝 IMPORTANT NOTES

1. **Override is REQUIRED** - The toggle must be ON
2. **Exact command** - Must be `npm install -g pnpm && pnpm install`
3. **Save is REQUIRED** - Click Save after changing
4. **Redeploy is REQUIRED** - Changes only apply to new deployments

## 🔍 WHERE TO FIND IT

```
Vercel Dashboard
└── Your Project (feelsharper)
    └── Settings Tab
        └── General (left sidebar)
            └── Build & Development Settings
                └── Install Command
                    └── Override Toggle → ON
                    └── Text Field → npm install -g pnpm && pnpm install
                    └── Save Button
```

**THIS IS THE ONLY WAY TO FIX IT - VERCEL IS IGNORING ALL CONFIG FILES**