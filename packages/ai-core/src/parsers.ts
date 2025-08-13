// Specialized parsers for different domains
import { z } from 'zod';

// Workout parsing schemas
export const WorkoutSchema = z.object({
  title: z.string(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.array(z.object({
      reps: z.number(),
      weight: z.number(),
      notes: z.string().optional(),
    })),
  })),
  duration_minutes: z.number().optional(),
  notes: z.string().optional(),
});

export const FoodLogSchema = z.object({
  items: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    unit: z.string(),
    calories: z.number().optional(),
  })),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  notes: z.string().optional(),
});

// Natural language workout parser
export class WorkoutParser {
  private static exerciseAliases: Record<string, string> = {
    'bench': 'bench press',
    'squat': 'squats',
    'deadlift': 'deadlifts',
    'ohp': 'overhead press',
    'row': 'barbell rows',
    'pullup': 'pull-ups',
    'chinup': 'chin-ups',
    'dip': 'dips',
  };

  private static weightUnits: Record<string, number> = {
    'kg': 1,
    'kgs': 1,
    'lb': 2.205,
    'lbs': 2.205,
    'pounds': 2.205,
  };

  static parseInput(input: string): any {
    const lines = input.split('\n').map(line => line.trim()).filter(Boolean);
    const exercises: any[] = [];
    let currentExercise: any = null;
    let title = '';
    let duration: number | undefined;

    for (const line of lines) {
      // Check for duration
      const durationMatch = line.match(/(\d+)\s*(?:min|minutes|hrs|hours)/i);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        duration = line.includes('hr') || line.includes('hour') ? value * 60 : value;
        continue;
      }

      // Check for title (first line if no exercise pattern)
      if (!title && !this.isExerciseLine(line)) {
        title = line;
        continue;
      }

      // Parse exercise line
      const exerciseData = this.parseExerciseLine(line);
      if (exerciseData) {
        if (exerciseData.name) {
          // New exercise
          if (currentExercise) {
            exercises.push(currentExercise);
          }
          currentExercise = {
            name: this.normalizeExerciseName(exerciseData.name),
            sets: exerciseData.set ? [exerciseData.set] : [],
          };
        } else if (currentExercise && exerciseData.set) {
          // Additional set for current exercise
          currentExercise.sets.push(exerciseData.set);
        }
      }
    }

    if (currentExercise) {
      exercises.push(currentExercise);
    }

    return {
      title: title || 'Workout',
      exercises,
      duration_minutes: duration,
    };
  }

  private static isExerciseLine(line: string): boolean {
    // Check for patterns like "exercise: sets" or "reps x weight"
    return /\d+\s*x\s*\d+|:\s*\d+/.test(line) || 
           Object.keys(this.exerciseAliases).some(alias => 
             line.toLowerCase().includes(alias)
           );
  }

  private static parseExerciseLine(line: string): any {
    // Pattern: "Exercise: 3x8 @ 100kg" or "3x8 @ 100kg"
    const exerciseMatch = line.match(/^([^:]+):\s*(.+)$/);
    const exerciseName = exerciseMatch?.[1]?.trim();
    const setData = exerciseMatch?.[2]?.trim() || line.trim();

    // Parse sets: "3x8 @ 100kg", "8 reps @ 100kg", "3 sets of 8 @ 100kg"
    const setMatch = setData.match(/(\d+)\s*(?:x|sets?\s*of)\s*(\d+)(?:\s*@\s*(\d+(?:\.\d+)?)\s*(\w+)?)?/i) ||
                     setData.match(/(\d+)\s*reps?(?:\s*@\s*(\d+(?:\.\d+)?)\s*(\w+)?)?/i);

    if (setMatch) {
      const reps = setMatch[2] ? parseInt(setMatch[2]) : parseInt(setMatch[1]);
      const sets = setMatch[2] ? parseInt(setMatch[1]) : 1;
      const weightValue = setMatch[3] ? parseFloat(setMatch[3]) : 0;
      const weightUnit = setMatch[4] || 'kg';
      
      const weight = this.convertWeight(weightValue, weightUnit);

      const set = { reps, weight };
      
      if (exerciseName) {
        return { name: exerciseName, set };
      } else {
        // Multiple sets of the same exercise
        const allSets = [];
        for (let i = 0; i < sets; i++) {
          allSets.push({ reps, weight });
        }
        return { sets: allSets };
      }
    }

    // Just exercise name
    if (exerciseName && !setData.includes('x') && !setData.includes('reps')) {
      return { name: exerciseName };
    }

    return null;
  }

  private static convertWeight(value: number, unit: string): number {
    const multiplier = this.weightUnits[unit.toLowerCase()] || 1;
    return value / multiplier; // Convert to kg
  }

  private static normalizeExerciseName(name: string): string {
    const normalized = name.toLowerCase().trim();
    return this.exerciseAliases[normalized] || name.trim();
  }
}

// Food parsing utilities
export class FoodParser {
  private static mealKeywords = {
    breakfast: ['breakfast', 'morning', 'am'],
    lunch: ['lunch', 'noon', 'midday'],
    dinner: ['dinner', 'evening', 'supper', 'pm'],
    snack: ['snack', 'between meals'],
  };

  private static unitConversions: Record<string, Record<string, number>> = {
    'cup': { 'ml': 240, 'g': 240 },
    'tbsp': { 'ml': 15, 'g': 15 },
    'tsp': { 'ml': 5, 'g': 5 },
    'oz': { 'g': 28.35, 'ml': 29.57 },
  };

  static parseFoodInput(input: string): any {
    const lines = input.split('\n').map(line => line.trim()).filter(Boolean);
    const items: any[] = [];
    let mealType = 'snack';

    // Detect meal type from input
    const fullText = input.toLowerCase();
    for (const [meal, keywords] of Object.entries(this.mealKeywords)) {
      if (keywords.some(keyword => fullText.includes(keyword))) {
        mealType = meal;
        break;
      }
    }

    for (const line of lines) {
      const item = this.parseFoodLine(line);
      if (item) {
        items.push(item);
      }
    }

    return {
      items,
      meal_type: mealType,
    };
  }

  private static parseFoodLine(line: string): any {
    // Pattern: "100g chicken breast" or "1 cup rice" or "2 eggs"
    const match = line.match(/(\d+(?:\.\d+)?)\s*(\w+)?\s+(.+)/);
    if (!match) return null;

    const amount = parseFloat(match[1]);
    const unit = match[2] || 'g';
    const name = match[3].trim();

    return {
      name,
      amount,
      unit,
    };
  }

  static normalizeUnit(amount: number, fromUnit: string, toUnit: string): number {
    const conversions = this.unitConversions[fromUnit.toLowerCase()];
    if (!conversions || !conversions[toUnit.toLowerCase()]) {
      return amount; // Return original if no conversion available
    }
    return amount * conversions[toUnit.toLowerCase()];
  }
}

// Study content parser
export class StudyParser {
  static parseStudySession(input: string): any {
    const lines = input.split('\n').map(line => line.trim()).filter(Boolean);
    const topics: string[] = [];
    let duration: number | undefined;
    let method: string | undefined;

    for (const line of lines) {
      // Duration
      const durationMatch = line.match(/(\d+)\s*(?:min|minutes|hrs|hours)/i);
      if (durationMatch) {
        const value = parseInt(durationMatch[1]);
        duration = line.includes('hr') || line.includes('hour') ? value * 60 : value;
        continue;
      }

      // Study method
      const methodMatch = line.match(/(?:method|technique|using):\s*(.+)/i);
      if (methodMatch) {
        method = methodMatch[1].trim();
        continue;
      }

      // Topics (lines that don't match special patterns)
      if (!durationMatch && !methodMatch) {
        topics.push(line);
      }
    }

    return {
      topics,
      duration_minutes: duration,
      method: method || 'reading',
    };
  }

  static extractKeyTerms(text: string): string[] {
    // Simple keyword extraction
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    return words
      .filter(word => word.length > 3 && !stopWords.has(word))
      .filter((word, index, array) => array.indexOf(word) === index) // Remove duplicates
      .slice(0, 10); // Limit to top 10
  }
}