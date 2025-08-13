// Specialized AI agents for different domains
import { ClaudeProvider } from './providers';
import type { WorkoutParseResult, NutritionAnalysis, StudyPlan } from './types';

export class FitnessCoachAgent {
  private claude: ClaudeProvider;

  constructor(apiKey?: string) {
    this.claude = new ClaudeProvider(apiKey);
  }

  async parseWorkout(input: string): Promise<WorkoutParseResult> {
    const prompt = `Parse this workout description into structured data:
"${input}"

Return a JSON object with this exact structure:
{
  "title": "Brief workout title",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": [
        {"reps": number, "weight": number}
      ]
    }
  ],
  "duration_minutes": number or null,
  "notes": "Additional notes or null"
}

Rules:
- Extract all exercises with sets, reps, and weight
- If weight is mentioned in lbs, convert to kg (divide by 2.2)
- If no weight mentioned, use 0
- Standardize exercise names (e.g., "bench press", "squats")
- Return valid JSON only, no additional text`;

    const response = await this.claude.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.1 });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      throw new Error('Failed to parse workout data from AI response');
    }
  }

  async generateWorkoutPlan(goals: string, experience: string, daysPerWeek: number) {
    const prompt = `Create a ${daysPerWeek}-day workout plan for someone with ${experience} experience.
Goals: ${goals}

Return structured workout plan with exercises, sets, reps, and progression notes.
Focus on compound movements and progressive overload.`;

    const response = await this.claude.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.3 });

    return response.content;
  }

  async analyzeProgress(workoutHistory: any[], weightHistory: any[]) {
    const prompt = `Analyze this fitness progress data and provide insights:

Workouts (last 30 days): ${JSON.stringify(workoutHistory)}
Weight history: ${JSON.stringify(weightHistory)}

Provide:
1. Progress summary
2. Specific achievements
3. Areas for improvement
4. Actionable recommendations

Be encouraging but realistic. Focus on data-driven insights.`;

    const response = await this.claude.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.5 });

    return response.content;
  }
}

export class NutritionCoachAgent {
  private claude: ClaudeProvider;

  constructor(apiKey?: string) {
    this.claude = new ClaudeProvider(apiKey);
  }

  async analyzeMeal(foodItems: any[]): Promise<NutritionAnalysis> {
    const prompt = `Analyze this meal nutritionally:
${JSON.stringify(foodItems)}

Return analysis with:
- Total calories, protein, carbs, fat
- Meal quality rating (1-10)
- Suggestions for improvement
- Missing nutrients

Focus on balance and practical advice.`;

    const response = await this.claude.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.2 });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      return {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        qualityRating: 5,
        suggestions: [response.content],
        missingNutrients: [],
      };
    }
  }

  async suggestMealPlan(goals: string, restrictions: string[], targetCalories: number) {
    const prompt = `Create a meal plan for:
- Goal: ${goals}
- Dietary restrictions: ${restrictions.join(', ')}
- Target calories: ${targetCalories}

Provide 3 meals + 2 snacks with specific foods and portions.
Focus on whole foods and proper macronutrient distribution.`;

    const response = await this.claude.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.4 });

    return response.content;
  }
}

export class StudyCoachAgent {
  private claude: ClaudeProvider;

  constructor(apiKey?: string) {
    this.claude = new ClaudeProvider(apiKey);
  }

  async createStudyPlan(subject: string, timeAvailable: number, difficulty: string): Promise<StudyPlan> {
    const prompt = `Create a study plan for:
- Subject: ${subject}
- Time available: ${timeAvailable} hours per week
- Difficulty level: ${difficulty}

Return a structured plan with:
- Weekly schedule
- Learning objectives
- Study methods
- Progress milestones
- Review cycles

Focus on spaced repetition and active recall techniques.`;

    const response = await this.claude.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.3 });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      return {
        schedule: [],
        objectives: [],
        methods: [],
        milestones: [],
        reviewCycles: [],
        content: response.content,
      };
    }
  }

  async generateFlashcards(content: string, count = 10) {
    const prompt = `Create ${count} flashcards from this content:
"${content}"

Return JSON array of flashcard objects:
[
  {
    "question": "Question text",
    "answer": "Answer text",
    "difficulty": 1-5,
    "tags": ["tag1", "tag2"]
  }
]

Focus on key concepts and vary difficulty levels.`;

    const response = await this.claude.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.4 });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      return [];
    }
  }

  async explainConcept(topic: string, level = 'intermediate') {
    const prompt = `Explain "${topic}" at ${level} level.

Provide:
1. Clear definition
2. Key principles
3. Examples
4. Common misconceptions
5. Study tips

Use simple language and practical examples.`;

    const response = await this.claude.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.3 });

    return response.content;
  }
}