# Push Monorepo to GitHub - Instructions

## What You Need to Do on GitHub (Web Browser)

### 1. Create New Repository
1. Go to https://github.com/new
2. Repository name: `sharpened` (or `sharpened-monorepo`)
3. Description: "Unified monorepo for Sharpened fitness ecosystem"
4. Keep it **Private** initially (you can make it public later)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

### 2. Push Your Local Monorepo
After creating the empty repo on GitHub, run these commands locally:

```bash
cd C:\Users\pradord\Documents\Projects\sharpened-monorepo

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/sharpened.git

# Push all code and tags
git push -u origin master
```

Or if you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/sharpened.git
git push -u origin master
```

### 3. Archive Original Repositories on GitHub

For each of your original repos (feelsharper, studysharper, sharpened-website):

1. Go to the repository on GitHub
2. Click "Settings" (tab on the right)
3. Scroll down to "Danger Zone"
4. Click "Archive this repository"
5. Type the repository name to confirm
6. Click "I understand the consequences, archive this repository"

**What archiving does:**
- Makes the repo read-only
- Shows "Archived" badge
- Preserves all history
- Can be unarchived later if needed

### 4. Update Repository Descriptions
Add notes to the archived repos' descriptions:
- "⚠️ Archived - Migrated to sharpened monorepo"

### 5. Optional: Update Your Profile README
If you have a profile README, update it to point to the new monorepo.

## Local Commands Summary

```bash
# After creating repo on GitHub:
cd C:\Users\pradord\Documents\Projects\sharpened-monorepo
git remote add origin https://github.com/YOUR_USERNAME/sharpened.git
git push -u origin master
```

## Verification Checklist
- [ ] New monorepo created on GitHub
- [ ] Code pushed successfully
- [ ] Original repos archived
- [ ] Descriptions updated
- [ ] CI/CD pipelines updated (if any)
- [ ] Deployment configs updated (Vercel, etc.)