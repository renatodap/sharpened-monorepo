import OpenAI from 'openai';
import { 
  AIContext, 
  ParsedWorkout, 
  Exercise, 
  UserPattern,
  ModelConfig 
} from '@/lib/ai/types';

export class WorkoutParser {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async process(
    input: string, 
    context: AIContext, 
    config: ModelConfig
  ): Promise<{ data: ParsedWorkout; confidence: number; tokens_used: number }> {
    try {
      // Pre-process with user patterns
      const enrichedInput = this.applyUserPatterns(input, context.patterns);
      
      // Build system prompt with user context
      const systemPrompt = this.buildSystemPrompt(context);
      
      // Call GPT for structured extraction
      const completion = await this.openai.chat.completions.create({
        model: config.model,
        temperature: config.temperature || 0.2,
        max_tokens: config.max_tokens || 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: enrichedInput }
        ],
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0].message.content;
      const parsed = JSON.parse(response || '{}');
      
      // Auto-correct exercise names
      const corrected = await this.autoCorrectExercises(parsed, context);
      
      // Validate and enhance
      const enhanced = this.validateAndEnhance(corrected, input);
      
      // Calculate confidence
      const confidence = this.calculateConfidence(enhanced);
      
      return {
        data: enhanced,
        confidence,
        tokens_used: completion.usage?.total_tokens || 0
      };
      
    } catch (error) {
      console.error('Workout parsing error:', error);
      throw new Error('Failed to parse workout');
    }
  }

  private applyUserPatterns(input: string, patterns: UserPattern[]): string {
    let processed = input;
    
    // Apply known exercise aliases
    const exerciseAliases = patterns.filter(p => p.pattern_type === 'exercise_alias');
    for (const alias of exerciseAliases) {
      const regex = new RegExp(`\\b${alias.pattern_key}\\b`, 'gi');
      processed = processed.replace(regex, alias.pattern_value.full_name);
    }
    
    return processed;
  }

  private buildSystemPrompt(context: AIContext): string {
    const recentExercises = this.extractRecentExercises(context.recentWorkouts);
    const userPatterns = context.patterns
      .filter(p => p.pattern_type === 'exercise_alias')
      .map(p => `"${p.pattern_key}" means "${p.pattern_value.full_name}"`)
      .join(', ');

    return `You are an expert fitness tracker that parses natural language workout descriptions into structured data.

USER CONTEXT:
- Common exercises: ${recentExercises.join(', ')}
- Known abbreviations: ${userPatterns || 'none'}
- Training style: ${context.profile?.training_style || 'general fitness'}

PARSING RULES:
1. Extract all exercises with sets, reps, weight, distance, duration, rest periods
2. Handle various formats: "3x8", "3 sets of 8", "3*8", "3 x 8 reps"
3. Convert weights to kg (lbs * 0.453592)
4. Handle circuits: "3 rounds of: exercise1, exercise2, exercise3"
5. Handle supersets: exercises marked with same letter or "superset with"
6. Handle AMRAP/EMOM/Tabata/HIIT formats
7. Handle cardio: running, cycling, rowing with distance/duration/pace
8. Handle bodyweight exercises (no weight needed)
9. Handle tempo notation: "3-1-2-0" (eccentric-pause-concentric-pause)
10. Handle RPE (1-10 scale) and percentages

OUTPUT FORMAT (JSON):
{
  "exercises": [
    {
      "name": "exercise name (lowercase, normalized)",
      "sets": number or null,
      "reps": number or null,
      "weight_kg": number or null,
      "distance_km": number or null,
      "duration_minutes": number or null,
      "rest_seconds": number or null,
      "rpe": number or null,
      "tempo": "3-1-2-0" or null,
      "notes": "any additional notes"
    }
  ],
  "workout_type": "strength|cardio|hiit|crossfit|powerlifting|bodybuilding|mixed",
  "total_duration_minutes": number or null,
  "intensity_level": "low|moderate|high|max"
}

EXAMPLES:
Input: "Bench press 3x8 @135lbs, squats 5x5 @225"
Output: exercises with bench press (3 sets, 8 reps, 61.2kg) and squats (5 sets, 5 reps, 102kg)

Input: "5k run in 25:30"
Output: exercise "running" with distance_km: 5, duration_minutes: 25.5

Input: "AMRAP 20: 5 pullups, 10 pushups, 15 squats"
Output: 3 exercises each with duration_minutes: 20, notes: "AMRAP format"`;
  }

  private extractRecentExercises(workouts: any[]): string[] {
    const exercises = new Set<string>();
    
    for (const workout of workouts.slice(0, 10)) {
      if (workout.exercises) {
        workout.exercises.forEach((ex: any) => {
          exercises.add(ex.name);
        });
      }
    }
    
    return Array.from(exercises).slice(0, 20);
  }

  private async autoCorrectExercises(
    parsed: any, 
    context: AIContext
  ): Promise<any> {
    // Common exercise name corrections
    const corrections: Record<string, string> = {
      'benchpress': 'bench press',
      'bench': 'bench press',
      'bp': 'bench press',
      'squats': 'squat',
      'deads': 'deadlift',
      'deadlifts': 'deadlift',
      'pullup': 'pull-up',
      'pullups': 'pull-up',
      'pushup': 'push-up',
      'pushups': 'push-up',
      'ohp': 'overhead press',
      'rows': 'row',
      'curls': 'bicep curl',
      'tris': 'tricep extension',
      'flys': 'fly',
      'flyes': 'fly'
    };

    if (parsed.exercises) {
      parsed.exercises = parsed.exercises.map((ex: any) => {
        const nameLower = ex.name.toLowerCase();
        const corrected = corrections[nameLower] || ex.name;
        return { ...ex, name: corrected };
      });
    }

    return parsed;
  }

  private validateAndEnhance(parsed: any, originalInput: string): ParsedWorkout {
    const exercises: Exercise[] = [];
    
    if (parsed.exercises && Array.isArray(parsed.exercises)) {
      for (const ex of parsed.exercises) {
        // Ensure valid exercise object
        const exercise: Exercise = {
          name: ex.name || 'unknown exercise',
          sets: ex.sets || undefined,
          reps: ex.reps || undefined,
          weight_kg: ex.weight_kg || undefined,
          distance_km: ex.distance_km || undefined,
          duration_minutes: ex.duration_minutes || undefined,
          rest_seconds: ex.rest_seconds || undefined,
          rpe: ex.rpe || undefined,
          tempo: ex.tempo || undefined
        };
        
        // Clean up undefined values
        Object.keys(exercise).forEach(key => {
          if (exercise[key as keyof Exercise] === undefined) {
            delete exercise[key as keyof Exercise];
          }
        });
        
        exercises.push(exercise);
      }
    }

    // Calculate total volume (sets x reps x weight)
    const totalVolume = exercises.reduce((sum, ex) => {
      if (ex.sets && ex.reps && ex.weight_kg) {
        return sum + (ex.sets * ex.reps * ex.weight_kg);
      }
      return sum;
    }, 0);

    // Estimate calories (rough estimate)
    const estimatedCalories = this.estimateCalories(exercises, parsed.total_duration_minutes);

    return {
      exercises,
      total_volume: totalVolume > 0 ? totalVolume : undefined,
      estimated_calories: estimatedCalories,
      workout_type: parsed.workout_type || this.detectWorkoutType(exercises),
      intensity_score: this.calculateIntensityScore(exercises),
      raw_input: originalInput
    };
  }

  private detectWorkoutType(exercises: Exercise[]): string {
    const hasCardio = exercises.some(ex => ex.distance_km || 
      ['running', 'cycling', 'rowing', 'swimming'].includes(ex.name.toLowerCase()));
    
    const hasStrength = exercises.some(ex => ex.weight_kg);
    
    if (hasCardio && hasStrength) return 'mixed';
    if (hasCardio) return 'cardio';
    if (hasStrength) return 'strength';
    
    return 'bodyweight';
  }

  private estimateCalories(exercises: Exercise[], duration?: number): number {
    // Very rough estimates based on MET values
    let calories = 0;
    const bodyWeight = 75; // Default 75kg if not provided
    
    for (const ex of exercises) {
      if (ex.duration_minutes) {
        // Cardio exercises
        const met = ex.name.includes('run') ? 10 : 
                   ex.name.includes('cycl') ? 8 : 
                   ex.name.includes('row') ? 7 : 6;
        calories += met * bodyWeight * (ex.duration_minutes / 60);
      } else if (ex.sets && ex.reps) {
        // Strength exercises (rough estimate: 0.5 cal per rep)
        calories += ex.sets * ex.reps * 0.5;
      }
    }
    
    // If no specific exercise calories but duration provided
    if (calories === 0 && duration) {
      calories = 6 * bodyWeight * (duration / 60); // Default 6 MET
    }
    
    return Math.round(calories);
  }

  private calculateIntensityScore(exercises: Exercise[]): number {
    let score = 5; // Default moderate
    
    // Check for high intensity indicators
    const hasHighRPE = exercises.some(ex => ex.rpe && ex.rpe >= 8);
    const hasLowRest = exercises.some(ex => ex.rest_seconds && ex.rest_seconds <= 30);
    const hasHighVolume = exercises.filter(ex => ex.sets && ex.sets >= 5).length >= 2;
    
    if (hasHighRPE || hasLowRest) score += 2;
    if (hasHighVolume) score += 1;
    
    // Check for low intensity indicators
    const hasLongRest = exercises.some(ex => ex.rest_seconds && ex.rest_seconds >= 180);
    const hasLowRPE = exercises.some(ex => ex.rpe && ex.rpe <= 5);
    
    if (hasLongRest || hasLowRPE) score -= 2;
    
    return Math.max(1, Math.min(10, score));
  }

  private calculateConfidence(workout: ParsedWorkout): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for well-structured data
    if (workout.exercises.length > 0) confidence += 0.2;
    if (workout.exercises.every(ex => ex.name !== 'unknown exercise')) confidence += 0.1;
    if (workout.workout_type) confidence += 0.1;
    if (workout.total_volume || workout.estimated_calories) confidence += 0.1;
    
    return Math.min(1, confidence);
  }
}