# Feel Sharper AI Enhancement Master Plan

## Executive Summary
Transform Feel Sharper into the ultimate AI-powered fitness companion for busy professionals. Voice-first, offline-capable, wearables-integrated, with extreme ease of logging and intelligent coaching. Freemium model targeting $50/month premium tier with global reach.

## Core Decisions & Architecture

### 1. Business Model
- **Freemium Tiers**:
  - **Free**: Basic logging, limited AI (5 interactions/month), 30-day history
  - **Starter ($9.99/mo)**: Voice input, 50 AI interactions, 90-day history
  - **Pro ($24.99/mo)**: Unlimited voice, 200 AI interactions, wearables integration
  - **Elite ($49.99/mo)**: Unlimited everything, coach dashboard, form checking, B2B features
- **Core Principle**: No user is net-negative (cost < revenue)
- **B2B Option**: Coaches/gyms managing clients (custom pricing)
- **Target Markets**: US & Brazil initially, then global

### 2. Technical Architecture
- **Platform Strategy**: PWA first → Native mobile (React Native) within 12 months
- **Offline-First**: ServiceWorker + IndexedDB for offline logging
- **Real-Time**: WebSocket for live workout tracking and cross-device sync
- **Voice-First**: Web Speech API → Whisper API for accuracy
- **AI Strategy**:
  - Start cost-effective: GPT-3.5-turbo or Claude Haiku
  - Scale with revenue: Upgrade models as user base grows
  - Aggressive caching to minimize API costs
- **Wearables Integration**: Apple Watch + Garmin priority

### 3. Data Philosophy
- **Everything is stored**: Every user input creates/updates database records
- **Complete context**: AI always queries full user history before responding
- **Continuous learning**: User corrections improve system patterns

## Implementation Roadmap

### Phase 1: Core AI Infrastructure (Week 1-2)
**Goal**: Rebuild foundation without @sharpened/ai-core dependency

#### 1.1 Database Schema Updates
```sql
-- New tables for AI context
CREATE TABLE user_context_store (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  context_type TEXT, -- 'workout', 'food', 'chat', 'correction'
  raw_input TEXT,
  parsed_output JSONB,
  confidence FLOAT,
  model_used TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_conversation_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  conversation_id UUID,
  message_role TEXT, -- 'user', 'assistant', 'system'
  content TEXT,
  context_snapshot JSONB, -- User stats at time of message
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  pattern_type TEXT, -- 'exercise_alias', 'food_preference', 'schedule'
  pattern_data JSONB,
  frequency INTEGER DEFAULT 1,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT,
  tokens_used INTEGER,
  cost_cents FLOAT,
  tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 1.2 AI Service Layer
```typescript
// lib/ai/core/AIOrchestrator.ts
export class AIOrchestrator {
  async processRequest(type: AIRequestType, input: string, userId: string) {
    // 1. Load complete user context
    const context = await this.loadUserContext(userId);
    
    // 2. Select optimal model based on request type
    const model = this.selectModel(type);
    
    // 3. Check usage limits
    await this.checkUsageLimits(userId);
    
    // 4. Process with appropriate handler
    const result = await this.handlers[type].process(input, context, model);
    
    // 5. Store everything
    await this.storeContext(userId, type, input, result);
    
    // 6. Track usage for billing
    await this.trackUsage(userId, result.tokensUsed);
    
    return result;
  }
}
```

### Phase 2: Natural Language Workout Parser (Week 2-3)
**Goal**: Handle ANY workout format with high accuracy

#### 2.1 Enhanced Parser Implementation
```typescript
// lib/ai/parsers/WorkoutParser.ts
export class WorkoutParser {
  private gptModel = 'gpt-4o-mini';
  
  async parse(input: string, userPatterns: UserPattern[]): Promise<ParsedWorkout> {
    // Step 1: Pre-process with user's known patterns
    const enrichedInput = this.applyUserPatterns(input, userPatterns);
    
    // Step 2: GPT structured extraction
    const systemPrompt = `Extract workout data from natural language.
    Output JSON: {exercises: [{name, sets, reps, weight_kg, distance_km, duration_min, intensity, rest_seconds}]}
    Handle: circuits, supersets, AMRAP, EMOM, intervals, cardio, strength
    User patterns: ${JSON.stringify(userPatterns)}`;
    
    const parsed = await this.callGPT(systemPrompt, enrichedInput);
    
    // Step 3: Auto-correct exercise names
    const corrected = await this.autoCorrectExercises(parsed);
    
    // Step 4: Validate and enhance
    return this.validateAndEnhance(corrected);
  }
}

// Supported formats:
// ✅ "Bench press 3x8 @135lbs, then squats 5x5 @225"
// ✅ "5 rounds: 10 burpees, 20 box jumps, 30 KB swings"
// ✅ "Ran 5k in 25:30, average HR 165"
// ✅ "AMRAP 20min: 5 pullups, 10 pushups, 15 squats"
// ✅ Voice transcription with errors
```

#### 2.2 Voice Integration
```typescript
// lib/ai/voice/VoiceWorkoutLogger.ts
export class VoiceWorkoutLogger {
  async processVoiceInput(audioBlob: Blob): Promise<ParsedWorkout> {
    // 1. Transcribe with Whisper API
    const transcript = await this.transcribe(audioBlob);
    
    // 2. Parse with workout parser
    return await workoutParser.parse(transcript);
  }
}
```

### Phase 3: Food & Nutrition AI (Week 3-4)
**Goal**: Natural language food logging with photo recognition

#### 3.1 Natural Language Food Parser
```typescript
// lib/ai/parsers/FoodParser.ts
export class FoodParser {
  async parse(input: string): Promise<ParsedMeal> {
    const systemPrompt = `Extract food items, portions, and meal context.
    Match to USDA database when possible.
    Estimate portions from descriptions like "bowl of", "handful", "plate of"`;
    
    // Parse with GPT
    const parsed = await this.callGPT(systemPrompt, input);
    
    // Match to USDA database
    const matched = await this.matchToUSDA(parsed);
    
    // Calculate nutrition
    return this.calculateNutrition(matched);
  }
}
```

#### 3.2 Photo Food Recognition
```typescript
// lib/ai/vision/FoodVision.ts
export class FoodVision {
  async analyzePhoto(imageUrl: string): Promise<FoodAnalysis> {
    // Use GPT-4-vision
    const analysis = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: "Identify all foods, estimate portions in grams" },
          { type: "image_url", image_url: { url: imageUrl }}
        ]
      }]
    });
    
    return this.processFoodAnalysis(analysis);
  }
}
```

#### 3.3 Recipe Analyzer
```typescript
// lib/ai/parsers/RecipeParser.ts
export class RecipeParser {
  async parseRecipe(url: string): Promise<Recipe> {
    // 1. Scrape recipe
    const content = await this.scrapeRecipe(url);
    
    // 2. Extract ingredients and instructions
    const recipe = await this.extractRecipe(content);
    
    // 3. Calculate per-serving nutrition
    return this.calculateNutrition(recipe);
  }
}
```

### Phase 4: Intelligent Coaching System (Week 4-5)
**Goal**: Context-aware coaching with complete user understanding

#### 4.1 Context-Aware Coach
```typescript
// lib/ai/coach/SmartCoach.ts
export class SmartCoach {
  async generateResponse(message: string, userId: string): Promise<CoachResponse> {
    // Load EVERYTHING about the user
    const context = await this.loadCompleteContext(userId);
    
    const systemPrompt = `You are a professional fitness coach. Be friendly but focused.
    User Profile: ${JSON.stringify(context.profile)}
    Recent Workouts: ${JSON.stringify(context.workouts)}
    Nutrition Last 7 Days: ${JSON.stringify(context.nutrition)}
    Body Metrics: ${JSON.stringify(context.bodyMetrics)}
    Goals: ${JSON.stringify(context.goals)}
    Past Conversations: ${JSON.stringify(context.conversations)}
    
    ALWAYS reference user's specific data when responding.
    Confidence: Rate your response confidence 0-1`;
    
    const response = await this.callClaude(systemPrompt, message);
    
    // Store conversation with context snapshot
    await this.storeConversation(userId, message, response, context);
    
    return response;
  }
}
```

#### 4.2 Pattern Recognition
```typescript
// lib/ai/patterns/PatternDetector.ts
export class PatternDetector {
  async detectPatterns(userId: string): Promise<UserInsights> {
    const data = await this.loadUserData(userId);
    
    return {
      workoutPatterns: this.detectWorkoutPatterns(data.workouts),
      nutritionPatterns: this.detectNutritionPatterns(data.nutrition),
      progressTrends: this.detectProgressTrends(data.metrics),
      recommendations: this.generateRecommendations(patterns)
    };
  }
}
```

### Phase 5: Progress Analysis & ML Models (Week 5-6)
**Goal**: Scientific training recommendations

#### 5.1 Training Load Management
```typescript
// lib/ai/analysis/TrainingLoadAnalyzer.ts
export class TrainingLoadAnalyzer {
  async analyzeLoad(userId: string): Promise<LoadAnalysis> {
    const workouts = await this.getWorkoutHistory(userId);
    
    // Calculate using proven formulas
    const acuteLoad = this.calculateACWR(workouts, 7); // 7-day
    const chronicLoad = this.calculateACWR(workouts, 28); // 28-day
    const ratio = acuteLoad / chronicLoad;
    
    // Based on sports science research
    if (ratio > 1.5) return { risk: 'high', recommendation: 'Reduce volume by 20%' };
    if (ratio < 0.8) return { risk: 'detraining', recommendation: 'Increase volume gradually' };
    
    return { risk: 'optimal', recommendation: 'Maintain current load' };
  }
}
```

#### 5.2 Recovery Predictor
```typescript
// lib/ai/analysis/RecoveryPredictor.ts
export class RecoveryPredictor {
  async predictRecovery(userId: string): Promise<RecoveryRecommendation> {
    const factors = await this.gatherRecoveryFactors(userId);
    
    // Use proven recovery science
    const score = this.calculateRecoveryScore(factors);
    
    return {
      recoveryHours: this.estimateRecoveryTime(score),
      recommendations: this.getRecoveryStrategies(factors)
    };
  }
}
```

### Phase 6: Integrations (Week 6-7)
**Goal**: Seamless data sync with non-competitors

#### 6.1 Wearables Integration (HIGH PRIORITY - PHASE 2)
```typescript
// lib/integrations/WearableSync.ts
export class WearableSync {
  // Apple Health, Garmin, Whoop, Oura
  async syncHealthData(userId: string, provider: string): Promise<void> {
    const data = await this.providers[provider].fetchData(userId);
    
    // Store in our database
    await this.storeHealthMetrics(userId, data);
    
    // Trigger AI analysis
    await this.analyzeHealthData(userId, data);
  }
}
```

#### 6.2 Coach Dashboard Sharing
```typescript
// lib/sharing/CoachAccess.ts
export class CoachAccess {
  async grantCoachAccess(clientId: string, coachEmail: string): Promise<void> {
    // Create read-only access token
    const token = await this.createAccessToken(clientId, 'read-only');
    
    // Send invite to coach
    await this.sendCoachInvite(coachEmail, token);
  }
}
```

## Pricing & Usage Tiers

### Free Tier (0$/mo)
- 5 AI interactions/month
- Basic logging (manual input)
- 30-day history
- Simple progress graphs

### Starter Tier ($9.99/mo)
- 50 AI interactions/month
- Voice input (limited)
- 90-day history
- Smart suggestions
- Export data

### Pro Tier ($24.99/mo)
- 200 AI interactions/month
- Unlimited voice input
- Unlimited history
- Wearables integration (Apple, Garmin)
- Advanced analytics
- Meal planning

### Elite Tier ($49.99/mo)
- Unlimited everything
- Form checking (video analysis)
- Coach dashboard for clients
- B2B features
- Priority support
- Custom AI personality
- API access (future)

### Usage Tracking
```typescript
// lib/billing/UsageTracker.ts
export class UsageTracker {
  async trackAIUsage(userId: string, tokens: number, endpoint: string) {
    const costCents = this.calculateCost(tokens, endpoint);
    
    await db.insert('ai_usage_tracking', {
      user_id: userId,
      endpoint,
      tokens_used: tokens,
      cost_cents: costCents,
      tier: await this.getUserTier(userId)
    });
    
    // Check if user exceeded free tier
    if (await this.exceededFreeTier(userId)) {
      await this.promptUpgrade(userId);
    }
  }
}
```

## Implementation Priorities (FROM USER REQUIREMENTS)

### IMMEDIATE MUST-HAVES
1. **Voice Input** (CRITICAL - main differentiator)
2. **Offline-First Architecture** (cache + sync)
3. **WebSocket Real-Time** (live workout tracking)
4. **Freemium Paywall** (Stripe integration)
5. **Beta Testing Framework** (email feedback)

### PHASE 1 (0-3 months)
1. **Wearables Integration** (Apple Watch + Garmin)
2. **Multi-language Support** (Portuguese, Spanish)
3. **Meal Planning** with macros
4. **Workout Templates** library
5. **Progress Photos** tracking

### Medium Priority
1. **Injury Risk Assessment** from movement patterns
2. **Optimal Workout Timing** based on circadian rhythm
3. **Meal Prep Plans** generation
4. **Group Challenges** with AI scorekeeping

### Low Priority
1. **A/B Testing Framework** for AI suggestions
2. **White-label Solutions** for gyms
3. **Educational Content** generation
4. **Export to Other Platforms**

## Success Metrics
- AI interaction success rate > 90%
- User correction rate < 10%
- Cost per user < $0.50/month
- Upgrade rate to paid tiers > 15%
- User retention improvement > 25%

## Security & Safety
- Medical disclaimer on all AI responses
- Eating disorder detection patterns
- Overtraining warnings based on ACWR
- Age-appropriate recommendations
- No medical advice, only fitness guidance

## Execution Commands

```bash
# Start implementing Phase 1
npm run ai:setup

# Test workout parser
npm run test:ai:workout

# Test food parser  
npm run test:ai:food

# Monitor usage costs
npm run ai:costs

# Deploy AI endpoints
npm run deploy:ai
```

## Next Steps
1. Create database migrations
2. Implement AIOrchestrator base class
3. Set up GPT-4o-mini for parsing
4. Build usage tracking system
5. Create upgrade prompts UI
6. Test with real user data