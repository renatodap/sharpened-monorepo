/**
 * NutritionOptimizer - AI-powered nutrition optimization and meal planning
 * Maps to PRD: Nutrition Intelligence & Meal Optimization
 */

export interface NutritionProfile {
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number; // kg
  height: number; // cm
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  goal: 'fat_loss' | 'muscle_gain' | 'maintenance' | 'athletic_performance';
  dietaryRestrictions: string[];
  allergies: string[];
  preferredMeals: number; // meals per day
  budgetConstraint?: 'low' | 'medium' | 'high';
  cookingSkill: 'beginner' | 'intermediate' | 'advanced';
  timeConstraint: 'low' | 'medium' | 'high'; // time available for meal prep
}

export interface MacroTargets {
  calories: number;
  protein: number; // grams
  carbohydrates: number; // grams
  fat: number; // grams
  fiber: number; // grams
  sugar: number; // grams (max)
  sodium: number; // mg (max)
  proteinPerKg: number; // g/kg body weight
  carbsPerKg: number; // g/kg body weight
  fatPercentage: number; // % of total calories
}

export interface MealTimingStrategy {
  strategy: 'standard' | 'intermittent_fasting' | 'athlete' | 'shift_worker';
  eatingWindow?: { start: string; end: string }; // HH:MM format
  preworkoutTiming?: number; // hours before workout
  postworkoutTiming?: number; // hours after workout
  preworkoutMacros: { carbs: number; protein: number; fat: number };
  postworkoutMacros: { carbs: number; protein: number; fat: number };
  mealDistribution: number[]; // percentage of daily calories per meal
}

export interface NutrientTiming {
  meal: 'breakfast' | 'lunch' | 'dinner' | 'snack1' | 'snack2' | 'preworkout' | 'postworkout';
  timeOfDay: string; // HH:MM
  targetMacros: MacroTargets;
  priority: 'protein' | 'carbs' | 'fat' | 'balanced';
  foods: OptimizedFood[];
  alternatives: OptimizedFood[][];
}

export interface OptimizedFood {
  foodId: string;
  name: string;
  quantity: number; // grams
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  micronutrients: { [key: string]: number };
  satietyScore: number; // 1-10
  nutritionDensity: number; // 1-10
  costPerServing?: number;
  prepTime?: number; // minutes
  bioavailability: { protein: number; carbs: number; fat: number }; // 0-1
}

export interface MealPlan {
  date: Date;
  totalMacros: MacroTargets;
  meals: NutrientTiming[];
  supplementRecommendations: Supplement[];
  hydrationTarget: number; // liters
  adherenceScore: number; // 0-100%
  optimizationScore: number; // 0-100%
  cost: number;
  prepTime: number; // total minutes
  shoppingList: ShoppingItem[];
}

export interface Supplement {
  name: string;
  dosage: string;
  timing: 'morning' | 'preworkout' | 'postworkout' | 'evening' | 'with_meal';
  reason: string;
  priority: 'essential' | 'beneficial' | 'optional';
  cost?: number;
}

export interface ShoppingItem {
  name: string;
  quantity: string;
  category: string;
  estimatedCost: number;
  alternatives: string[];
}

export interface NutritionInsight {
  type: 'deficiency' | 'excess' | 'timing' | 'balance' | 'efficiency';
  severity: 'low' | 'medium' | 'high';
  nutrient?: string;
  message: string;
  recommendation: string;
  impact: string;
  timeframe: string;
}

export class NutritionOptimizer {
  private static instance: NutritionOptimizer;

  private constructor() {}

  static getInstance(): NutritionOptimizer {
    if (!NutritionOptimizer.instance) {
      NutritionOptimizer.instance = new NutritionOptimizer();
    }
    return NutritionOptimizer.instance;
  }

  /**
   * Calculate optimal macro targets based on profile
   */
  calculateMacroTargets(profile: NutritionProfile): MacroTargets {
    // Calculate BMR using Mifflin-St Jeor equation
    let bmr: number;
    if (profile.gender === 'male') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extra_active: 1.9
    };

    let tdee = bmr * activityMultipliers[profile.activityLevel];

    // Adjust for goals
    const goalAdjustments = {
      fat_loss: -0.2, // 20% deficit
      muscle_gain: 0.1, // 10% surplus
      maintenance: 0,
      athletic_performance: 0.05 // 5% surplus
    };

    const calories = Math.round(tdee * (1 + goalAdjustments[profile.goal]));

    // Protein targets (higher for muscle gain/fat loss)
    let proteinPerKg: number;
    switch (profile.goal) {
      case 'fat_loss':
        proteinPerKg = 2.2; // Higher protein for muscle preservation
        break;
      case 'muscle_gain':
        proteinPerKg = 2.0; // Optimal for muscle protein synthesis
        break;
      case 'athletic_performance':
        proteinPerKg = 1.8;
        break;
      default:
        proteinPerKg = 1.6;
    }

    const protein = Math.round(profile.weight * proteinPerKg);

    // Fat targets (minimum for hormone production)
    const fatPercentage = profile.goal === 'fat_loss' ? 25 : 30;
    const fat = Math.round((calories * (fatPercentage / 100)) / 9);

    // Carbs fill the remainder
    const carbsPerKg = profile.goal === 'athletic_performance' ? 6 : 
                      profile.goal === 'muscle_gain' ? 4 : 3;
    const carbohydrates = Math.round(Math.min(
      profile.weight * carbsPerKg,
      (calories - (protein * 4) - (fat * 9)) / 4
    ));

    return {
      calories,
      protein,
      carbohydrates,
      fat,
      fiber: Math.round(calories / 1000 * 14), // 14g per 1000 calories
      sugar: Math.round(calories * 0.1 / 4), // Max 10% of calories
      sodium: 2300, // mg - general recommendation
      proteinPerKg,
      carbsPerKg,
      fatPercentage
    };
  }

  /**
   * Generate optimal meal timing strategy
   */
  generateMealTiming(profile: NutritionProfile, workoutTimes?: string[]): MealTimingStrategy {
    const defaultStrategy: MealTimingStrategy = {
      strategy: 'standard',
      preworkoutTiming: 2,
      postworkoutTiming: 1,
      preworkoutMacros: { carbs: 30, protein: 20, fat: 10 },
      postworkoutMacros: { carbs: 40, protein: 30, fat: 5 },
      mealDistribution: [25, 35, 30, 10] // breakfast, lunch, dinner, snacks
    };

    // Adjust for goals
    if (profile.goal === 'fat_loss') {
      defaultStrategy.strategy = 'intermittent_fasting';
      defaultStrategy.eatingWindow = { start: '12:00', end: '20:00' };
      defaultStrategy.mealDistribution = [0, 40, 45, 15]; // Skip breakfast
    } else if (profile.goal === 'athletic_performance') {
      defaultStrategy.strategy = 'athlete';
      defaultStrategy.mealDistribution = [20, 25, 25, 15, 15]; // 5 meals
      defaultStrategy.preworkoutMacros = { carbs: 40, protein: 15, fat: 5 };
      defaultStrategy.postworkoutMacros = { carbs: 50, protein: 25, fat: 5 };
    }

    // Adjust for time constraints
    if (profile.timeConstraint === 'high') {
      defaultStrategy.mealDistribution = [30, 40, 30]; // 3 larger meals
    }

    return defaultStrategy;
  }

  /**
   * Create optimized meal plan
   */
  async createMealPlan(
    profile: NutritionProfile,
    targets: MacroTargets,
    timing: MealTimingStrategy,
    days: number = 7
  ): Promise<MealPlan[]> {
    const mealPlans: MealPlan[] = [];

    for (let day = 0; day < days; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);

      const meals = await this.optimizeMealsForDay(profile, targets, timing);
      const supplements = this.recommendSupplements(profile, targets);
      
      const totalMacros = this.calculateTotalMacros(meals);
      const adherenceScore = this.calculateAdherenceScore(totalMacros, targets);
      const optimizationScore = this.calculateOptimizationScore(meals, profile);
      
      const cost = meals.reduce((sum, meal) => 
        sum + meal.foods.reduce((mealSum, food) => mealSum + (food.costPerServing || 0), 0), 0);
      
      const prepTime = meals.reduce((sum, meal) => 
        sum + meal.foods.reduce((mealSum, food) => mealSum + (food.prepTime || 0), 0), 0);

      const shoppingList = this.generateShoppingList(meals);

      mealPlans.push({
        date,
        totalMacros,
        meals,
        supplementRecommendations: supplements,
        hydrationTarget: this.calculateHydrationTarget(profile, targets),
        adherenceScore,
        optimizationScore,
        cost,
        prepTime,
        shoppingList
      });
    }

    return mealPlans;
  }

  /**
   * Optimize meals for a single day
   */
  private async optimizeMealsForDay(
    profile: NutritionProfile,
    targets: MacroTargets,
    timing: MealTimingStrategy
  ): Promise<NutrientTiming[]> {
    const meals: NutrientTiming[] = [];
    const mealTypes = timing.strategy === 'intermittent_fasting' 
      ? ['lunch', 'dinner', 'snack1'] 
      : ['breakfast', 'lunch', 'dinner', 'snack1'];

    for (let i = 0; i < mealTypes.length; i++) {
      const mealType = mealTypes[i] as NutrientTiming['meal'];
      const caloriePercentage = timing.mealDistribution[i] / 100;
      
      const mealTargets: MacroTargets = {
        calories: Math.round(targets.calories * caloriePercentage),
        protein: Math.round(targets.protein * caloriePercentage),
        carbohydrates: Math.round(targets.carbohydrates * caloriePercentage),
        fat: Math.round(targets.fat * caloriePercentage),
        fiber: Math.round(targets.fiber * caloriePercentage),
        sugar: Math.round(targets.sugar * caloriePercentage),
        sodium: Math.round(targets.sodium * caloriePercentage),
        proteinPerKg: targets.proteinPerKg,
        carbsPerKg: targets.carbsPerKg,
        fatPercentage: targets.fatPercentage
      };

      const optimizedFoods = await this.optimizeFoodsForMeal(profile, mealTargets, mealType);
      const alternatives = await this.generateAlternatives(optimizedFoods, profile, mealTargets);

      meals.push({
        meal: mealType,
        timeOfDay: this.getMealTime(mealType, timing),
        targetMacros: mealTargets,
        priority: this.getMealPriority(mealType, profile.goal),
        foods: optimizedFoods,
        alternatives
      });
    }

    return meals;
  }

  /**
   * Optimize foods for a specific meal
   */
  private async optimizeFoodsForMeal(
    profile: NutritionProfile,
    targets: MacroTargets,
    mealType: NutrientTiming['meal']
  ): Promise<OptimizedFood[]> {
    // Get food database (mock implementation)
    const availableFoods = await this.getFoodDatabase(profile);
    
    // Filter by meal type preferences
    const mealAppropriate = this.filterFoodsByMeal(availableFoods, mealType);
    
    // Optimize using genetic algorithm or linear programming
    const optimizedSelection = this.optimizeFoodSelection(
      mealAppropriate,
      targets,
      profile
    );

    return optimizedSelection;
  }

  /**
   * Optimize food selection using constraint optimization
   */
  private optimizeFoodSelection(
    foods: OptimizedFood[],
    targets: MacroTargets,
    profile: NutritionProfile
  ): OptimizedFood[] {
    // Simplified optimization - in reality would use more sophisticated algorithm
    const selected: OptimizedFood[] = [];
    let remainingCalories = targets.calories;
    let remainingProtein = targets.protein;
    let remainingCarbs = targets.carbohydrates;
    let remainingFat = targets.fat;

    // Sort foods by nutrition density and satiety
    const sortedFoods = foods.sort((a, b) => {
      const scoreA = (a.nutritionDensity + a.satietyScore) / 2;
      const scoreB = (b.nutritionDensity + b.satietyScore) / 2;
      return scoreB - scoreA;
    });

    // Greedy selection with macro balancing
    for (const food of sortedFoods) {
      if (remainingCalories <= 0) break;

      // Calculate how much of this food we can include
      const maxByCalories = remainingCalories / food.calories;
      const maxByProtein = food.protein > 0 ? remainingProtein / food.protein : maxByCalories;
      const maxByCarbs = food.carbs > 0 ? remainingCarbs / food.carbs : maxByCalories;
      const maxByFat = food.fat > 0 ? remainingFat / food.fat : maxByCalories;

      const maxQuantity = Math.min(maxByCalories, maxByProtein, maxByCarbs, maxByFat, 1);

      if (maxQuantity >= 0.1) { // Minimum 10% of a serving
        const adjustedFood: OptimizedFood = {
          ...food,
          quantity: Math.round(food.quantity * maxQuantity),
          calories: Math.round(food.calories * maxQuantity),
          protein: Math.round(food.protein * maxQuantity),
          carbs: Math.round(food.carbs * maxQuantity),
          fat: Math.round(food.fat * maxQuantity),
          fiber: Math.round(food.fiber * maxQuantity)
        };

        selected.push(adjustedFood);
        remainingCalories -= adjustedFood.calories;
        remainingProtein -= adjustedFood.protein;
        remainingCarbs -= adjustedFood.carbs;
        remainingFat -= adjustedFood.fat;
      }
    }

    return selected;
  }

  /**
   * Generate food alternatives
   */
  private async generateAlternatives(
    selectedFoods: OptimizedFood[],
    profile: NutritionProfile,
    targets: MacroTargets
  ): Promise<OptimizedFood[][]> {
    const alternatives: OptimizedFood[][] = [];
    
    for (const food of selectedFoods) {
      const similarFoods = await this.findSimilarFoods(food, profile);
      alternatives.push(similarFoods.slice(0, 3)); // Top 3 alternatives
    }

    return alternatives;
  }

  /**
   * Recommend supplements based on profile and targets
   */
  private recommendSupplements(profile: NutritionProfile, targets: MacroTargets): Supplement[] {
    const supplements: Supplement[] = [];

    // Protein powder for muscle gain or if protein target is hard to meet
    if (profile.goal === 'muscle_gain' || targets.proteinPerKg > 2.0) {
      supplements.push({
        name: 'Whey Protein Powder',
        dosage: '25-30g',
        timing: 'postworkout',
        reason: 'Optimize muscle protein synthesis and meet protein targets',
        priority: 'beneficial',
        cost: 1.50
      });
    }

    // Creatine for strength and muscle gain
    if (profile.goal === 'muscle_gain' || profile.goal === 'athletic_performance') {
      supplements.push({
        name: 'Creatine Monohydrate',
        dosage: '5g',
        timing: 'with_meal',
        reason: 'Improve strength, power, and muscle growth',
        priority: 'beneficial',
        cost: 0.25
      });
    }

    // Vitamin D (common deficiency)
    supplements.push({
      name: 'Vitamin D3',
      dosage: '2000-4000 IU',
      timing: 'with_meal',
      reason: 'Support bone health, immune function, and hormone production',
      priority: 'essential',
      cost: 0.10
    });

    // Omega-3 for general health
    supplements.push({
      name: 'Fish Oil (EPA/DHA)',
      dosage: '1-2g',
      timing: 'with_meal',
      reason: 'Support heart health, brain function, and reduce inflammation',
      priority: 'beneficial',
      cost: 0.30
    });

    // Magnesium for sleep and recovery
    if (profile.goal === 'athletic_performance' || profile.activityLevel === 'very_active') {
      supplements.push({
        name: 'Magnesium Glycinate',
        dosage: '200-400mg',
        timing: 'evening',
        reason: 'Improve sleep quality, muscle recovery, and reduce cramping',
        priority: 'beneficial',
        cost: 0.20
      });
    }

    return supplements;
  }

  /**
   * Generate insights from nutrition analysis
   */
  async generateNutritionInsights(
    profile: NutritionProfile,
    recentMeals: any[],
    targets: MacroTargets
  ): Promise<NutritionInsight[]> {
    const insights: NutritionInsight[] = [];

    // Analyze recent intake
    const avgIntake = this.calculateAverageIntake(recentMeals);
    
    // Protein adequacy
    if (avgIntake.protein < targets.protein * 0.8) {
      insights.push({
        type: 'deficiency',
        severity: 'high',
        nutrient: 'protein',
        message: `Protein intake is ${((targets.protein - avgIntake.protein) / targets.protein * 100).toFixed(0)}% below target`,
        recommendation: 'Add lean protein sources like chicken, fish, or protein powder to each meal',
        impact: 'May hinder muscle recovery and growth',
        timeframe: 'Past 7 days'
      });
    }

    // Fiber deficiency
    if (avgIntake.fiber < targets.fiber * 0.7) {
      insights.push({
        type: 'deficiency',
        severity: 'medium',
        nutrient: 'fiber',
        message: 'Fiber intake is significantly below recommendations',
        recommendation: 'Include more vegetables, fruits, whole grains, and legumes',
        impact: 'May affect digestive health and satiety',
        timeframe: 'Past 7 days'
      });
    }

    // Excess sugar
    if (avgIntake.sugar > targets.sugar * 1.5) {
      insights.push({
        type: 'excess',
        severity: 'medium',
        nutrient: 'sugar',
        message: 'Sugar intake is above recommended limits',
        recommendation: 'Reduce processed foods and sugary drinks, choose whole fruits over juice',
        impact: 'May affect energy levels and body composition goals',
        timeframe: 'Past 7 days'
      });
    }

    // Meal timing insights
    const mealTimes = this.analyzeMealTiming(recentMeals);
    if (mealTimes.irregularity > 2) { // More than 2 hours variation
      insights.push({
        type: 'timing',
        severity: 'low',
        message: 'Meal timing is inconsistent',
        recommendation: 'Try to eat meals at similar times each day for better metabolic health',
        impact: 'May affect energy levels and hunger cues',
        timeframe: 'Past 7 days'
      });
    }

    // Calorie balance
    const calorieDeviation = Math.abs(avgIntake.calories - targets.calories) / targets.calories;
    if (calorieDeviation > 0.15) { // More than 15% off target
      const direction = avgIntake.calories > targets.calories ? 'above' : 'below';
      insights.push({
        type: 'balance',
        severity: 'medium',
        message: `Calorie intake is consistently ${direction} target`,
        recommendation: direction === 'above' 
          ? 'Focus on portion control and nutrient-dense, lower-calorie foods'
          : 'Increase portion sizes or add healthy snacks to meet energy needs',
        impact: direction === 'above' 
          ? 'May slow progress toward body composition goals'
          : 'May affect energy levels and recovery',
        timeframe: 'Past 7 days'
      });
    }

    // Efficiency insights
    const cost = this.calculateMealPlanCost(recentMeals);
    const prepTime = this.calculateMealPrepTime(recentMeals);
    
    if (cost > profile.budgetConstraint === 'low' ? 15 : 25) { // Daily cost threshold
      insights.push({
        type: 'efficiency',
        severity: 'low',
        message: 'Meal costs are higher than optimal',
        recommendation: 'Consider batch cooking, seasonal produce, and protein alternatives like legumes',
        impact: 'May affect long-term adherence due to budget constraints',
        timeframe: 'Past 7 days'
      });
    }

    return insights.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Helper methods
   */
  private async getFoodDatabase(profile: NutritionProfile): Promise<OptimizedFood[]> {
    // Mock food database - would be replaced with actual USDA data
    return [
      {
        foodId: '1',
        name: 'Chicken Breast',
        quantity: 100,
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        micronutrients: { 'vitamin_b6': 0.5, 'niacin': 8.5 },
        satietyScore: 8,
        nutritionDensity: 9,
        costPerServing: 2.50,
        prepTime: 15,
        bioavailability: { protein: 0.95, carbs: 0, fat: 0.9 }
      },
      {
        foodId: '2',
        name: 'Brown Rice',
        quantity: 100,
        calories: 112,
        protein: 2.6,
        carbs: 23,
        fat: 0.9,
        fiber: 1.8,
        micronutrients: { 'magnesium': 43, 'selenium': 9.8 },
        satietyScore: 6,
        nutritionDensity: 7,
        costPerServing: 0.75,
        prepTime: 25,
        bioavailability: { protein: 0.7, carbs: 0.85, fat: 0.8 }
      }
      // ... more foods would be added
    ];
  }

  private filterFoodsByMeal(foods: OptimizedFood[], mealType: string): OptimizedFood[] {
    // Simple filtering - would be more sophisticated in reality
    const breakfastFoods = ['oats', 'egg', 'yogurt', 'banana', 'berries'];
    const dinnerProteins = ['chicken', 'beef', 'fish', 'tofu'];
    
    if (mealType === 'breakfast') {
      return foods.filter(food => 
        breakfastFoods.some(breakfast => food.name.toLowerCase().includes(breakfast))
      );
    }
    
    return foods; // Return all for now
  }

  private getMealTime(mealType: string, timing: MealTimingStrategy): string {
    const defaultTimes: Record<string, string> = {
      breakfast: '07:00',
      lunch: '12:00',
      dinner: '18:00',
      snack1: '15:00',
      preworkout: '16:00',
      postworkout: '19:00'
    };

    if (timing.eatingWindow && (mealType === 'breakfast' || mealType === 'lunch')) {
      return mealType === 'breakfast' ? timing.eatingWindow.start : '13:00';
    }

    return defaultTimes[mealType] || '12:00';
  }

  private getMealPriority(mealType: string, goal: string): 'protein' | 'carbs' | 'fat' | 'balanced' {
    if (mealType === 'postworkout') return 'protein';
    if (mealType === 'preworkout') return 'carbs';
    if (goal === 'muscle_gain') return 'protein';
    return 'balanced';
  }

  private async findSimilarFoods(food: OptimizedFood, profile: NutritionProfile): Promise<OptimizedFood[]> {
    // Mock implementation - would use similarity algorithms
    return [];
  }

  private calculateTotalMacros(meals: NutrientTiming[]): MacroTargets {
    return meals.reduce((total, meal) => ({
      calories: total.calories + meal.targetMacros.calories,
      protein: total.protein + meal.targetMacros.protein,
      carbohydrates: total.carbohydrates + meal.targetMacros.carbohydrates,
      fat: total.fat + meal.targetMacros.fat,
      fiber: total.fiber + meal.targetMacros.fiber,
      sugar: total.sugar + meal.targetMacros.sugar,
      sodium: total.sodium + meal.targetMacros.sodium,
      proteinPerKg: total.proteinPerKg,
      carbsPerKg: total.carbsPerKg,
      fatPercentage: total.fatPercentage
    }), {
      calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
      proteinPerKg: 0, carbsPerKg: 0, fatPercentage: 0
    });
  }

  private calculateAdherenceScore(actual: MacroTargets, target: MacroTargets): number {
    const deviations = [
      Math.abs(actual.calories - target.calories) / target.calories,
      Math.abs(actual.protein - target.protein) / target.protein,
      Math.abs(actual.carbohydrates - target.carbohydrates) / target.carbohydrates,
      Math.abs(actual.fat - target.fat) / target.fat
    ];

    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
    return Math.max(0, (1 - avgDeviation) * 100);
  }

  private calculateOptimizationScore(meals: NutrientTiming[], profile: NutritionProfile): number {
    let score = 0;
    let factors = 0;

    meals.forEach(meal => {
      // Nutrition density
      const avgNutritionDensity = meal.foods.reduce((sum, food) => sum + food.nutritionDensity, 0) / meal.foods.length;
      score += avgNutritionDensity * 10;
      factors++;

      // Satiety
      const avgSatiety = meal.foods.reduce((sum, food) => sum + food.satietyScore, 0) / meal.foods.length;
      score += avgSatiety * 10;
      factors++;

      // Cost efficiency (if budget conscious)
      if (profile.budgetConstraint === 'low') {
        const avgCost = meal.foods.reduce((sum, food) => sum + (food.costPerServing || 0), 0) / meal.foods.length;
        const costScore = Math.max(0, 100 - (avgCost * 20)); // Lower cost = higher score
        score += costScore;
        factors++;
      }
    });

    return factors > 0 ? score / factors : 0;
  }

  private calculateHydrationTarget(profile: NutritionProfile, targets: MacroTargets): number {
    // Base hydration + activity adjustment
    const baseHydration = profile.weight * 0.035; // 35ml per kg
    const activityMultipliers = {
      sedentary: 1,
      lightly_active: 1.1,
      moderately_active: 1.2,
      very_active: 1.4,
      extra_active: 1.6
    };

    return Math.round(baseHydration * activityMultipliers[profile.activityLevel] * 10) / 10;
  }

  private generateShoppingList(meals: NutrientTiming[]): ShoppingItem[] {
    const items = new Map<string, ShoppingItem>();

    meals.forEach(meal => {
      meal.foods.forEach(food => {
        if (items.has(food.name)) {
          const existing = items.get(food.name)!;
          existing.quantity = `${parseFloat(existing.quantity) + food.quantity}g`;
          existing.estimatedCost += food.costPerServing || 0;
        } else {
          items.set(food.name, {
            name: food.name,
            quantity: `${food.quantity}g`,
            category: this.getCategoryForFood(food.name),
            estimatedCost: food.costPerServing || 0,
            alternatives: []
          });
        }
      });
    });

    return Array.from(items.values());
  }

  private getCategoryForFood(foodName: string): string {
    const categories: Record<string, string> = {
      'chicken': 'Meat & Poultry',
      'beef': 'Meat & Poultry',
      'fish': 'Seafood',
      'rice': 'Grains',
      'oats': 'Grains',
      'banana': 'Fruits',
      'apple': 'Fruits',
      'broccoli': 'Vegetables',
      'spinach': 'Vegetables'
    };

    for (const [key, category] of Object.entries(categories)) {
      if (foodName.toLowerCase().includes(key)) {
        return category;
      }
    }

    return 'Other';
  }

  private calculateAverageIntake(meals: any[]): any {
    // Mock implementation
    return {
      calories: 2000,
      protein: 120,
      carbohydrates: 200,
      fat: 80,
      fiber: 20,
      sugar: 50,
      sodium: 2000
    };
  }

  private analyzeMealTiming(meals: any[]): { irregularity: number } {
    // Mock implementation
    return { irregularity: 1.5 };
  }

  private calculateMealPlanCost(meals: any[]): number {
    // Mock implementation
    return 18.50;
  }

  private calculateMealPrepTime(meals: any[]): number {
    // Mock implementation
    return 45;
  }
}

// Export singleton instance
export const nutritionOptimizer = NutritionOptimizer.getInstance();