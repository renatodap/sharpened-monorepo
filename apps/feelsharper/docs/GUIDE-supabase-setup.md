# GUIDE — Supabase Project Setup

**Purpose**: Configure Supabase for database, authentication, and real-time features. Without this, Feel Sharper cannot store or retrieve any data.

**Estimated Time**: 15 minutes  
**Preconditions**: Email address for Supabase account

**Links**: [PRD Database Requirements](../PRODUCT_REQUIREMENTS.md#core-technical-features), [Implementation Plan](../IMPLEMENTATION_START.md), [AI Plan Database Schema](../AI_ENHANCEMENT_PLAN.md#database-schema-updates)

## Steps (Do exactly in order)

### 1. Create Supabase Account & Project
1. Navigate to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Click "New project"
5. Fill in:
   - Organization: Choose or create one
   - Project name: `feelsharper-prod` (or `feelsharper-dev` for development)
   - Database Password: Generate a strong password and SAVE IT
   - Region: Choose closest to your users (e.g., US East for US market)
   - Pricing Plan: Free tier to start
6. Click "Create new project" and wait ~2 minutes for provisioning

### 2. Get API Keys
1. Once project is ready, go to Settings (gear icon) → API
2. Copy these values:
   - **Project URL**: `https://[YOUR_PROJECT_ID].supabase.co`
   - **Anon/Public Key**: Long string starting with `eyJ...`
   - **Service Role Key**: Different long string (KEEP SECRET!)

### 3. Configure Authentication
1. Go to Authentication → Providers
2. Enable "Email" provider (should be on by default)
3. Configure email settings:
   - Enable "Confirm email": ON
   - Enable "Secure email change": ON
   - Minimum password length: 8
4. (Optional) Enable social providers later via OT-011

### 4. Apply Database Schema
1. Go to SQL Editor
2. Click "New query"
3. Run the migrations from `supabase/migrations/` folder in order:
   ```sql
   -- Run each .sql file contents here
   -- Start with initial schema, then subsequent migrations
   ```
4. Verify tables created: Go to Table Editor, should see:
   - `foods`, `workouts`, `body_weight`, `user_profiles`
   - New AI tables: `user_context_store`, `ai_conversation_memory`, etc.

### 5. Configure Row Level Security (RLS)
1. Go to Authentication → Policies
2. Ensure RLS is enabled for all tables
3. Policies should be auto-created by migrations
4. Verify each table has "Users can only see their own data" policy

### 6. Set up Storage Buckets (if needed)
1. Go to Storage
2. Create bucket: `avatars` (public)
3. Create bucket: `progress-photos` (private)
4. Set policies for user-specific access

## Environment Variables

Add to `.env.local` (create file if doesn't exist):
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# Database Direct Connection (optional, for migrations)
DATABASE_URL=postgresql://postgres:[YOUR_DB_PASSWORD]@db.[YOUR_PROJECT_ID].supabase.co:5432/postgres
```

Update `.env.example` (already configured with placeholders)

## Verify

### Test Connection
```bash
# Install dependencies if not done
npm install

# Run development server
npm run dev
```

Navigate to http://localhost:3000 and check:
1. No Supabase connection errors in console
2. Can create account/sign in
3. Data persists after page refresh

### Test Database
```bash
# Run seed script to verify database
npm run seed
```

Expected output: "Database seeded successfully" with sample foods added

### Check Supabase Dashboard
1. Go to Table Editor → `foods`
2. Should see USDA food entries
3. Go to Authentication → Users
4. Should see test users after signup

## Rollback & Pitfalls

### Rollback
1. Delete project in Supabase dashboard → Settings → General → Delete project
2. Remove credentials from `.env.local`
3. Create new project and restart guide

### Common Pitfalls
1. **Wrong keys**: Anon key goes in `NEXT_PUBLIC_`, service key without prefix
2. **CORS errors**: Check project URL is correct (no trailing slash)
3. **Auth not working**: Ensure email provider is enabled
4. **RLS blocking queries**: Check policies are set correctly
5. **Migration order**: Run migrations sequentially, not all at once

## Next Steps
After Supabase is configured:
1. Set up OpenAI (OT-002) for AI features
2. Set up Anthropic (OT-003) for coaching
3. Generate VAPID keys (OT-004) for push notifications

## Support
- Supabase Discord: https://discord.supabase.com
- Documentation: https://supabase.com/docs
- Status: https://status.supabase.com