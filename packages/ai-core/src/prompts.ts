// Centralized prompt templates
export const fitnessPrompts = {
  workoutParser: (input: string) => `
Parse this workout description into structured data:
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
- If weight is in lbs, convert to kg (divide by 2.2)
- If no weight mentioned, use 0
- Standardize exercise names
- Return valid JSON only
`.trim(),

  progressAnalysis: (workouts: any[], weights: any[]) => `
Analyze this fitness progress data:

Workouts (last 30 days): ${JSON.stringify(workouts, null, 2)}
Weight history: ${JSON.stringify(weights, null, 2)}

Provide:
1. Progress summary (2-3 sentences)
2. Key achievements (bullet points)
3. Areas for improvement (specific)
4. Next week's focus (actionable)

Be encouraging but realistic. Use data-driven insights.
`.trim(),

  workoutPlan: (goals: string, experience: string, days: number) => `
Create a ${days}-day workout plan for:
- Experience: ${experience}
- Goals: ${goals}

Include:
- Exercise selection with reasoning
- Sets, reps, and progression
- Weekly periodization
- Recovery considerations

Focus on compound movements and progressive overload.
`.trim(),
};

export const nutritionPrompts = {
  mealAnalysis: (foods: any[]) => `
Analyze this meal nutritionally:
${JSON.stringify(foods, null, 2)}

Return JSON:
{
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "qualityRating": 1-10,
  "suggestions": ["specific improvement"],
  "missingNutrients": ["nutrient names"]
}

Focus on macronutrient balance and micronutrient density.
`.trim(),

  mealPlan: (goals: string, restrictions: string[], calories: number) => `
Create a daily meal plan:
- Goal: ${goals}
- Restrictions: ${restrictions.join(', ') || 'None'}
- Target calories: ${calories}

Provide:
- Breakfast, lunch, dinner + 2 snacks
- Specific foods with portions
- Balanced macronutrients
- Practical preparation tips

Focus on whole foods and sustainability.
`.trim(),

  foodSuggestions: (currentIntake: any, goals: string) => `
Based on today's food log: ${JSON.stringify(currentIntake)}
Goal: ${goals}

Suggest 3 specific foods/meals to add or replace that would:
1. Improve nutrient profile
2. Support the stated goal
3. Be realistic and affordable

Be specific with portions and reasoning.
`.trim(),
};

export const studyPrompts = {
  studyPlan: (subject: string, hours: number, level: string) => `
Create a study plan for:
- Subject: ${subject}
- Available time: ${hours} hours/week
- Level: ${level}

Return structured JSON:
{
  "weeklySchedule": [
    {
      "day": "Monday",
      "tasks": ["specific task"],
      "duration": minutes
    }
  ],
  "learningObjectives": ["measurable goals"],
  "methods": ["active techniques"],
  "milestones": [
    {
      "week": number,
      "goal": "specific achievement",
      "assessment": "how to measure"
    }
  ]
}

Use spaced repetition and active recall principles.
`.trim(),

  conceptExplanation: (topic: string, level: string) => `
Explain "${topic}" at ${level} level:

Structure:
1. Definition (1-2 sentences)
2. Key principles (3-5 points)
3. Practical examples
4. Common misconceptions
5. Study tips

Use clear language and concrete examples.
Make it actionable for learning.
`.trim(),

  flashcardGeneration: (content: string, count: number) => `
Create ${count} flashcards from this content:
"${content}"

Return JSON array:
[
  {
    "question": "Clear question",
    "answer": "Concise answer",
    "difficulty": 1-5,
    "tags": ["relevant", "tags"]
  }
]

Vary difficulty levels. Focus on key concepts.
Use different question types (definition, application, analysis).
`.trim(),
};

export const coachingPrompts = {
  weeklyReview: (data: any) => `
Conduct a weekly review based on this data:
${JSON.stringify(data, null, 2)}

Provide:
1. Week's highlights (celebrate wins)
2. Pattern analysis (what's working/not)
3. Specific adjustments for next week
4. One key focus area

Tone: Supportive coach who cares about long-term progress.
Be specific and actionable.
`.trim(),

  motivation: (context: string, struggle: string) => `
User context: ${context}
Current struggle: ${struggle}

Provide:
1. Acknowledgment of the difficulty
2. Reframe the challenge positively
3. One specific, small next step
4. Reminder of their progress/strengths

Be empathetic but not preachy. Focus on action over feelings.
`.trim(),

  goalSetting: (current: string, desired: string, timeframe: string) => `
Help set realistic goals:
- Current state: ${current}
- Desired outcome: ${desired}
- Timeframe: ${timeframe}

Create:
1. SMART goal statement
2. 3 milestone checkpoints
3. Potential obstacles and solutions
4. Daily/weekly habits to build

Make it challenging but achievable.
`.trim(),
};

// Prompt utilities
export const promptUtils = {
  // Add system context to any prompt
  withSystemContext: (prompt: string, role: string) => `
You are a ${role}. Your responses should be:
- Evidence-based and practical
- Encouraging but honest
- Focused on sustainable improvement
- Tailored to the individual's context

${prompt}
`.trim(),

  // Add output format constraints
  withFormatConstraints: (prompt: string, format: string) => `
${prompt}

IMPORTANT: ${format}
Do not include any other text or explanations.
`.trim(),

  // Add length constraints
  withLengthConstraints: (prompt: string, maxWords: number) => `
${prompt}

Keep response under ${maxWords} words. Be concise and actionable.
`.trim(),
};