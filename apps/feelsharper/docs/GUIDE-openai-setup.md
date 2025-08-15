# GUIDE — OpenAI API Setup

**Purpose**: Configure OpenAI API for voice transcription, embeddings, and AI-powered features. Essential for voice input (main differentiator) and intelligent parsing.

**Estimated Time**: 5 minutes  
**Preconditions**: Credit card for billing (pay-as-you-go)

**Links**: [PRD Voice Input](../PRODUCT_REQUIREMENTS.md#voice-input-must-have---immediate), [AI Plan Parser](../AI_ENHANCEMENT_PLAN.md#enhanced-parser-implementation)

## Steps (Do exactly in order)

### 1. Create OpenAI Account
1. Navigate to https://platform.openai.com/signup
2. Sign up with email or Google account
3. Verify email address

### 2. Add Payment Method
1. Go to https://platform.openai.com/account/billing
2. Click "Add payment method"
3. Enter credit card details
4. Set up usage limits (recommended: $50/month initially)

### 3. Generate API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it: `feelsharper-prod` (or `feelsharper-dev`)
4. Copy the key immediately (shown only once!)
5. Save it securely

### 4. Configure Usage Limits (Important!)
1. Go to https://platform.openai.com/account/limits
2. Set monthly budget: $50
3. Set notification threshold: $25
4. Enable email alerts for usage

## Environment Variables

Add to `.env.local`:
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-[YOUR_KEY_HERE]
```

Update `.env.example` (already has placeholder)

## Verify

### Test API Connection
Create test file `test-openai.js`:
```javascript
// Save as test-openai.js in project root
require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "Test embedding for Feel Sharper",
    });
    console.log('✅ OpenAI connected! Embedding dimensions:', response.data[0].embedding.length);
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error.message);
  }
}

test();
```

Run test:
```bash
node test-openai.js
```

Expected output: "✅ OpenAI connected! Embedding dimensions: 1536"

### Test in Application
```bash
npm run dev
```
Navigate to voice input feature - should initialize without errors

## Cost Management

### Estimated Costs (per month)
- **Embeddings**: ~$0.02 per 1000 requests
- **GPT-3.5 Turbo**: ~$0.002 per 1000 tokens
- **Whisper (voice)**: $0.006 per minute
- **GPT-4 Vision**: $0.01 per image

### For 100 Beta Users
- Voice transcription: ~$5/month (assuming 10 min/user/month)
- Parsing & embeddings: ~$10/month
- Total estimate: $15-20/month

### Cost Optimization
1. Cache embeddings aggressively
2. Use GPT-3.5-turbo for parsing (not GPT-4)
3. Batch API calls when possible
4. Implement rate limiting per user

## Rollback & Pitfalls

### Rollback
1. Delete API key from OpenAI dashboard
2. Remove from `.env.local`
3. Generate new key if compromised

### Common Pitfalls
1. **Key exposed**: Never commit `.env.local` to git
2. **Rate limits**: Default is 60 requests/min - implement queuing
3. **Costs spike**: Set hard limits in OpenAI dashboard
4. **Model deprecation**: Use latest model versions
5. **Network errors**: Implement retry logic with exponential backoff

## API Models to Use

### Recommended Models
- **Embeddings**: `text-embedding-3-small` (cheapest, good quality)
- **Parsing**: `gpt-3.5-turbo` (fast, cheap)
- **Voice**: `whisper-1` (only option)
- **Vision**: `gpt-4-vision-preview` (when needed)

### Avoid (Too Expensive)
- `gpt-4` for regular parsing
- `text-embedding-3-large` unless needed
- `gpt-4-turbo` for high-volume tasks

## Next Steps
After OpenAI is configured:
1. Set up Anthropic (OT-003) for coaching
2. Generate VAPID keys (OT-004) for PWA
3. Test voice input functionality

## Support
- OpenAI Documentation: https://platform.openai.com/docs
- API Reference: https://platform.openai.com/docs/api-reference
- Status: https://status.openai.com
- Community: https://community.openai.com