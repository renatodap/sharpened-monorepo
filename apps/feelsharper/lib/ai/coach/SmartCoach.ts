import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { 
  AIContext, 
  CoachResponse,
  ActionItem,
  DataReference,
  ModelConfig 
} from '@/lib/ai/types';

export class SmartCoach {
  private anthropic: Anthropic;
  private supabase;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.supabase = createClient();
  }

  async process(
    message: string, 
    context: AIContext, 
    config: ModelConfig
  ): Promise<{ data: CoachResponse; confidence: number; tokens_used: number }> {
    try {
      // Build comprehensive system prompt
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Get conversation history
      const conversationHistory = await this.getConversationHistory(context.userId);
      
      // Call Claude for coaching response
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: config.max_tokens || 2000,
        temperature: config.temperature || 0.7,
        system: systemPrompt,
        messages: [
          ...conversationHistory,
          { role: 'user', content: message }
        ]
      });

      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';
      
      // Parse structured response
      const parsed = this.parseCoachResponse(content, context);
      
      // Store conversation
      await this.storeConversation(context.userId, message, content, context);
      
      // Calculate confidence based on context relevance
      const confidence = this.calculateConfidence(parsed, context);
      
      return {
        data: parsed,
        confidence,
        tokens_used: response.usage?.input_tokens + response.usage?.output_tokens || 0
      };
      
    } catch (error) {
      console.error('Smart coach error:', error);
      throw new Error('Failed to generate coaching response');
    }
  }

  private buildSystemPrompt(context: AIContext): string {
    const recentWorkouts = this.summarizeWorkouts(context.recentWorkouts);
    const nutritionSummary = this.summarizeNutrition(context.recentNutrition);
    const progressSummary = this.summarizeProgress(context.bodyMetrics);
    const goalsSummary = this.summarizeGoals(context.goals);
    
    return `You are an expert personal fitness coach with deep knowledge of exercise science, nutrition, and behavior change. You provide evidence-based, personalized coaching.

USER PROFILE:
- Age: ${context.profile?.age || 'unknown'}
- Height: ${context.profile?.height_cm ? context.profile.height_cm + 'cm' : 'unknown'}
- Training Style: ${context.profile?.training_style || 'general fitness'}
- Activity Level: ${context.profile?.activity_level || 'moderate'}
- Subscription: ${context.profile?.subscription_tier || 'free'} tier

RECENT ACTIVITY (Last 30 days):
${recentWorkouts}

NUTRITION (Last 7 days):
${nutritionSummary}

BODY METRICS:
${progressSummary}

ACTIVE GOALS:
${goalsSummary}

COACHING PRINCIPLES:
1. Always reference specific user data when giving advice
2. Be encouraging but realistic
3. Provide actionable suggestions (not generic advice)
4. Use scientific principles (progressive overload, ACWR, etc.)
5. Consider user's schedule and preferences
6. Acknowledge progress and celebrate wins
7. Address potential issues proactively
8. Keep responses concise and focused

RESPONSE STRUCTURE:
1. Acknowledge the user's question/concern
2. Reference relevant data from their history
3. Provide specific, actionable advice
4. Suggest 1-3 concrete next steps
5. End with encouragement

IMPORTANT:
- Never provide medical advice
- Don't recommend extreme diets or training
- Focus on sustainable, healthy habits
- If user shows signs of overtraining or disordered eating, gently suggest rest or professional help
- Rate your confidence (0-1) based on available data`;
  }

  private summarizeWorkouts(workouts: any[]): string {
    if (!workouts.length) return 'No recent workouts recorded';
    
    const totalWorkouts = workouts.length;
    const avgPerWeek = Math.round((totalWorkouts / 4) * 10) / 10;
    
    // Get most common exercises
    const exerciseCounts: Record<string, number> = {};
    workouts.forEach(w => {
      w.exercises?.forEach((ex: any) => {
        exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1;
      });
    });
    
    const topExercises = Object.entries(exerciseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
    
    // Get recent workout summary
    const lastWorkout = workouts[0];
    const daysSinceLastWorkout = Math.floor(
      (Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return `
- Total Workouts: ${totalWorkouts} (${avgPerWeek}/week average)
- Last Workout: ${daysSinceLastWorkout} days ago
- Top Exercises: ${topExercises.join(', ')}
- Recent Focus: ${this.detectFocus(workouts)}`;
  }

  private summarizeNutrition(nutrition: any[]): string {
    if (!nutrition.length) return 'No recent nutrition data';
    
    const avgCalories = Math.round(
      nutrition.reduce((sum, log) => sum + (log.total_calories || 0), 0) / nutrition.length
    );
    
    const avgProtein = Math.round(
      nutrition.reduce((sum, log) => sum + (log.total_protein || 0), 0) / nutrition.length
    );
    
    const consistency = Math.round((nutrition.length / 7) * 100);
    
    return `
- Average Daily Calories: ${avgCalories}
- Average Daily Protein: ${avgProtein}g
- Logging Consistency: ${consistency}%
- Meal Timing: ${this.detectMealPattern(nutrition)}`;
  }

  private summarizeProgress(metrics: any[]): string {
    if (!metrics.length) return 'No body metrics recorded';
    
    const latest = metrics[0];
    const oldest = metrics[metrics.length - 1];
    
    const weightChange = latest.weight_kg && oldest.weight_kg 
      ? Math.round((latest.weight_kg - oldest.weight_kg) * 10) / 10
      : 0;
    
    return `
- Current Weight: ${latest.weight_kg || 'unknown'}kg
- Weight Change: ${weightChange > 0 ? '+' : ''}${weightChange}kg
- Last Updated: ${this.daysAgo(latest.date)} days ago`;
  }

  private summarizeGoals(goals: any[]): string {
    if (!goals.length) return 'No active goals set';
    
    return goals.map(goal => 
      `- ${goal.type}: ${goal.target_value} by ${new Date(goal.target_date).toLocaleDateString()}`
    ).join('\n');
  }

  private detectFocus(workouts: any[]): string {
    // Analyze workout patterns to detect focus
    const types: Record<string, number> = {};
    
    workouts.forEach(w => {
      const type = w.workout_type || 'general';
      types[type] = (types[type] || 0) + 1;
    });
    
    const primary = Object.entries(types)
      .sort((a, b) => b[1] - a[1])[0];
    
    return primary ? primary[0] : 'varied';
  }

  private detectMealPattern(nutrition: any[]): string {
    const mealTimes: Record<string, number> = {};
    
    nutrition.forEach(log => {
      const type = log.meal_type || 'unknown';
      mealTimes[type] = (mealTimes[type] || 0) + 1;
    });
    
    const mostFrequent = Object.entries(mealTimes)
      .sort((a, b) => b[1] - a[1])[0];
    
    return mostFrequent ? `Most logged: ${mostFrequent[0]}` : 'Varied';
  }

  private daysAgo(date: string): number {
    return Math.floor(
      (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  private async getConversationHistory(userId: string): Promise<any[]> {
    const { data } = await this.supabase
      .from('ai_conversation_memory')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Convert to Claude format and reverse for chronological order
    return (data || [])
      .reverse()
      .map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));
  }

  private parseCoachResponse(content: string, context: AIContext): CoachResponse {
    // Extract action items if mentioned
    const actionItems = this.extractActionItems(content);
    
    // Extract data references
    const references = this.extractReferences(content, context);
    
    // Extract suggestions
    const suggestions = this.extractSuggestions(content);
    
    // Basic confidence extraction (look for confidence indicators)
    const confidence = content.toLowerCase().includes('based on your data') ? 0.9 :
                      content.toLowerCase().includes('generally') ? 0.6 : 0.7;
    
    return {
      message: content,
      suggestions,
      action_items: actionItems,
      references,
      confidence
    };
  }

  private extractActionItems(content: string): ActionItem[] {
    const items: ActionItem[] = [];
    
    // Look for numbered lists or action-oriented phrases
    const actionPhrases = [
      /(?:you should|try to|consider|i recommend|next step[s]?:?)\s+([^.!?]+)/gi,
      /\d+\.\s+([^.!?\n]+)/g
    ];
    
    actionPhrases.forEach(regex => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const text = match[1].trim();
        
        // Categorize action
        const type = text.includes('workout') || text.includes('exercise') ? 'workout' :
                    text.includes('eat') || text.includes('nutrition') || text.includes('protein') ? 'nutrition' :
                    text.includes('rest') || text.includes('recover') ? 'rest' : 'measurement';
        
        // Determine priority
        const priority = text.includes('important') || text.includes('critical') ? 'high' :
                        text.includes('consider') || text.includes('might') ? 'low' : 'medium';
        
        items.push({
          type,
          description: text,
          priority
        });
      }
    });
    
    return items.slice(0, 3); // Max 3 action items
  }

  private extractReferences(content: string, context: AIContext): DataReference[] {
    const references: DataReference[] = [];
    
    // Look for mentions of specific workouts or dates
    if (content.includes('last workout') && context.recentWorkouts.length > 0) {
      const lastWorkout = context.recentWorkouts[0];
      references.push({
        type: 'workout',
        id: lastWorkout.id,
        date: lastWorkout.date,
        summary: `${lastWorkout.exercises?.length || 0} exercises`
      });
    }
    
    // Look for goal references
    context.goals.forEach(goal => {
      if (content.toLowerCase().includes(goal.type)) {
        references.push({
          type: 'goal',
          id: goal.id,
          date: goal.target_date || new Date(),
          summary: `${goal.type}: ${goal.target_value}`
        });
      }
    });
    
    return references;
  }

  private extractSuggestions(content: string): string[] {
    const suggestions: string[] = [];
    
    // Extract suggestions from common patterns
    const suggestionPatterns = [
      /(?:you could|might want to|consider)\s+([^.!?]+)/gi,
      /(?:try|experiment with)\s+([^.!?]+)/gi
    ];
    
    suggestionPatterns.forEach(regex => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        suggestions.push(match[1].trim());
      }
    });
    
    return suggestions.slice(0, 3);
  }

  private async storeConversation(
    userId: string,
    userMessage: string,
    assistantMessage: string,
    context: AIContext
  ) {
    const conversationId = crypto.randomUUID();
    
    // Store user message
    await this.supabase.from('ai_conversation_memory').insert({
      user_id: userId,
      conversation_id: conversationId,
      message_role: 'user',
      content: userMessage,
      context_snapshot: {
        workout_count: context.recentWorkouts.length,
        avg_calories: context.profile?.avg_daily_calories,
        current_weight: context.bodyMetrics[0]?.weight_kg
      }
    });
    
    // Store assistant response
    await this.supabase.from('ai_conversation_memory').insert({
      user_id: userId,
      conversation_id: conversationId,
      message_role: 'assistant',
      content: assistantMessage,
      model_used: 'claude-3-haiku'
    });
  }

  private calculateConfidence(response: CoachResponse, context: AIContext): number {
    let confidence = 0.5;
    
    // Higher confidence with more context data
    if (context.recentWorkouts.length > 10) confidence += 0.2;
    if (context.recentNutrition.length > 5) confidence += 0.1;
    if (context.bodyMetrics.length > 3) confidence += 0.1;
    if (context.goals.length > 0) confidence += 0.1;
    
    // Adjust based on response specificity
    if (response.references.length > 0) confidence += 0.1;
    if (response.action_items.length > 0) confidence += 0.1;
    
    return Math.min(1, confidence);
  }
}