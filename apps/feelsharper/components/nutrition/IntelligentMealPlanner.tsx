'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ChefHat,
  Target,
  Clock,
  DollarSign,
  ShoppingCart,
  Utensils,
  Zap,
  Heart,
  Brain,
  Scale,
  Calendar,
  Plus,
  Minus,
  Edit3,
  Save,
  RefreshCw,
  Filter,
  Star,
  AlertCircle,
  CheckCircle,
  Flame,
  Leaf,
  Fish,
  Apple,
  Cookie
} from 'lucide-react';

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar_max: number;
}

interface DietaryRestrictions {
  vegetarian: boolean;
  vegan: boolean;
  gluten_free: boolean;
  dairy_free: boolean;
  nut_free: boolean;
  low_carb: boolean;
  keto: boolean;
  paleo: boolean;
}

interface Meal {
  id: string;
  name: string;
  description: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cost_per_serving: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  dietary_flags: Partial<DietaryRestrictions>;
  image_url?: string;
  rating: number;
  prep_ahead: boolean;
  ai_score: number;
  substitutions: string[];
}

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: 'protein' | 'carbs' | 'vegetables' | 'fruits' | 'dairy' | 'fats' | 'spices' | 'other';
  cost_estimate: number;
  in_season?: boolean;
}

interface MealPlan {
  date: string;
  meals: {
    breakfast: Meal | null;
    lunch: Meal | null;
    dinner: Meal | null;
    snacks: Meal[];
  };
  daily_nutrition: NutritionGoals;
  daily_cost: number;
  prep_time_total: number;
  grocery_list: Ingredient[];
}

interface PlanningPreferences {
  budget_per_day: number;
  max_prep_time: number;
  meal_variety: 'low' | 'medium' | 'high';
  batch_cooking: boolean;
  leftover_tolerance: number;
  cuisine_preferences: string[];
  avoid_foods: string[];
  prioritize_local: boolean;
  organic_preference: boolean;
}

export default function IntelligentMealPlanner() {
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>({
    calories: 2200,
    protein: 165,
    carbs: 275,
    fat: 73,
    fiber: 35,
    sugar_max: 50
  });
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestrictions>({
    vegetarian: false,
    vegan: false,
    gluten_free: false,
    dairy_free: false,
    nut_free: false,
    low_carb: false,
    keto: false,
    paleo: false
  });
  const [preferences, setPreferences] = useState<PlanningPreferences>({
    budget_per_day: 25,
    max_prep_time: 60,
    meal_variety: 'medium',
    batch_cooking: true,
    leftover_tolerance: 3,
    cuisine_preferences: ['mediterranean', 'asian', 'american'],
    avoid_foods: [],
    prioritize_local: true,
    organic_preference: false
  });
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'plan' | 'recipes' | 'grocery' | 'nutrition'>('plan');

  useEffect(() => {
    generateMealPlan();
  }, []);

  const generateMealPlan = async () => {
    setIsGenerating(true);
    
    // Simulate AI meal planning
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockMeals: Meal[] = [
      {
        id: '1',
        name: 'Greek Yogurt Power Bowl',
        description: 'Protein-packed breakfast with berries, nuts, and honey',
        type: 'breakfast',
        prep_time: 5,
        cook_time: 0,
        servings: 1,
        difficulty: 'easy',
        cost_per_serving: 3.50,
        nutrition: {
          calories: 320,
          protein: 22,
          carbs: 35,
          fat: 12,
          fiber: 8,
          sugar: 18,
          sodium: 95
        },
        ingredients: [
          { name: 'Greek Yogurt', amount: 1, unit: 'cup', category: 'dairy', cost_estimate: 1.50 },
          { name: 'Mixed Berries', amount: 0.5, unit: 'cup', category: 'fruits', cost_estimate: 1.25, in_season: true },
          { name: 'Almonds', amount: 0.25, unit: 'cup', category: 'fats', cost_estimate: 0.75 }
        ],
        instructions: ['Combine yogurt in bowl', 'Top with berries and almonds', 'Drizzle with honey'],
        tags: ['high-protein', 'quick', 'gluten-free'],
        dietary_flags: { vegetarian: true, gluten_free: true },
        rating: 4.8,
        prep_ahead: true,
        ai_score: 92,
        substitutions: ['Use coconut yogurt for dairy-free', 'Replace almonds with seeds for nut-free']
      },
      {
        id: '2',
        name: 'Mediterranean Quinoa Bowl',
        description: 'Nutrient-dense lunch with quinoa, vegetables, and tahini dressing',
        type: 'lunch',
        prep_time: 15,
        cook_time: 20,
        servings: 2,
        difficulty: 'medium',
        cost_per_serving: 4.25,
        nutrition: {
          calories: 485,
          protein: 18,
          carbs: 62,
          fat: 18,
          fiber: 12,
          sugar: 8,
          sodium: 320
        },
        ingredients: [
          { name: 'Quinoa', amount: 1, unit: 'cup', category: 'carbs', cost_estimate: 1.20 },
          { name: 'Chickpeas', amount: 0.5, unit: 'cup', category: 'protein', cost_estimate: 0.75 },
          { name: 'Cucumber', amount: 1, unit: 'medium', category: 'vegetables', cost_estimate: 0.80 },
          { name: 'Cherry Tomatoes', amount: 1, unit: 'cup', category: 'vegetables', cost_estimate: 1.50, in_season: true }
        ],
        instructions: ['Cook quinoa according to package', 'Chop vegetables', 'Combine with tahini dressing'],
        tags: ['mediterranean', 'vegan', 'meal-prep'],
        dietary_flags: { vegetarian: true, vegan: true, gluten_free: true },
        rating: 4.6,
        prep_ahead: true,
        ai_score: 88,
        substitutions: ['Use brown rice instead of quinoa', 'Add grilled chicken for extra protein']
      },
      {
        id: '3',
        name: 'Herb-Crusted Salmon with Roasted Vegetables',
        description: 'Omega-3 rich dinner with seasonal vegetables',
        type: 'dinner',
        prep_time: 20,
        cook_time: 25,
        servings: 2,
        difficulty: 'medium',
        cost_per_serving: 8.50,
        nutrition: {
          calories: 420,
          protein: 35,
          carbs: 18,
          fat: 24,
          fiber: 6,
          sugar: 8,
          sodium: 285
        },
        ingredients: [
          { name: 'Salmon Fillet', amount: 6, unit: 'oz', category: 'protein', cost_estimate: 6.00 },
          { name: 'Broccoli', amount: 2, unit: 'cups', category: 'vegetables', cost_estimate: 1.50 },
          { name: 'Sweet Potato', amount: 1, unit: 'medium', category: 'carbs', cost_estimate: 1.00, in_season: true }
        ],
        instructions: ['Season salmon with herbs', 'Roast vegetables at 400°F', 'Bake salmon 12-15 minutes'],
        tags: ['high-protein', 'omega-3', 'anti-inflammatory'],
        dietary_flags: { gluten_free: true },
        rating: 4.9,
        prep_ahead: false,
        ai_score: 95,
        substitutions: ['Use cod or halibut instead of salmon', 'Replace sweet potato with cauliflower for low-carb']
      },
      {
        id: '4',
        name: 'Energy Balls',
        description: 'No-bake protein-rich snack with dates and nuts',
        type: 'snack',
        prep_time: 15,
        cook_time: 0,
        servings: 12,
        difficulty: 'easy',
        cost_per_serving: 0.75,
        nutrition: {
          calories: 95,
          protein: 3,
          carbs: 12,
          fat: 5,
          fiber: 2,
          sugar: 9,
          sodium: 5
        },
        ingredients: [
          { name: 'Medjool Dates', amount: 1, unit: 'cup', category: 'fruits', cost_estimate: 3.00 },
          { name: 'Almond Butter', amount: 0.25, unit: 'cup', category: 'fats', cost_estimate: 2.50 },
          { name: 'Chia Seeds', amount: 2, unit: 'tbsp', category: 'other', cost_estimate: 1.00 }
        ],
        instructions: ['Process dates until paste forms', 'Mix with nut butter and seeds', 'Roll into balls and chill'],
        tags: ['no-bake', 'energy-boost', 'portable'],
        dietary_flags: { vegetarian: true, vegan: true, gluten_free: true },
        rating: 4.7,
        prep_ahead: true,
        ai_score: 85,
        substitutions: ['Use sunflower seed butter for nut-free', 'Add protein powder for extra protein']
      }
    ];

    // Generate 7-day meal plan
    const weekPlan: MealPlan[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dayPlan: MealPlan = {
        date: date.toISOString().split('T')[0],
        meals: {
          breakfast: mockMeals[0],
          lunch: mockMeals[1],
          dinner: mockMeals[2],
          snacks: [mockMeals[3]]
        },
        daily_nutrition: {
          calories: 1320,
          protein: 78,
          carbs: 127,
          fat: 59,
          fiber: 28,
          sugar_max: 43
        },
        daily_cost: 17.50,
        prep_time_total: 65,
        grocery_list: mockMeals.flatMap(meal => meal.ingredients)
      };
      
      weekPlan.push(dayPlan);
    }
    
    setMealPlan(weekPlan);
    setIsGenerating(false);
  };

  const getNutritionStatus = (actual: number, target: number, type: 'calories' | 'macro' | 'limit') => {
    const percentage = (actual / target) * 100;
    
    if (type === 'limit') {
      return percentage <= 100 ? 'good' : 'over';
    }
    
    if (percentage >= 90 && percentage <= 110) return 'perfect';
    if (percentage >= 80 && percentage <= 120) return 'good';
    if (percentage < 80) return 'under';
    return 'over';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'perfect': return 'text-green-400 bg-green-500/20';
      case 'good': return 'text-blue-400 bg-blue-500/20';
      case 'under': return 'text-yellow-400 bg-yellow-500/20';
      case 'over': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return <Cookie className="w-4 h-4" />;
      case 'lunch': return <Utensils className="w-4 h-4" />;
      case 'dinner': return <ChefHat className="w-4 h-4" />;
      case 'snack': return <Apple className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (isGenerating) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Creating Your Intelligent Meal Plan</h3>
            <p className="text-text-secondary">Analyzing nutrition goals, preferences, and budget constraints...</p>
            <div className="mt-4 space-y-2 text-sm text-text-secondary">
              <div>✓ Calculating optimal macro distribution</div>
              <div>✓ Selecting recipes based on dietary restrictions</div>
              <div>✓ Optimizing for cost and prep time</div>
              <div>✓ Generating grocery list and meal prep schedule</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Intelligent Meal Planner</h1>
          <p className="text-text-secondary">AI-powered nutrition planning tailored to your goals</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Preferences
          </Button>
          <Button onClick={generateMealPlan} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Regenerate Plan
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['plan', 'recipes', 'grocery', 'nutrition'] as const).map((mode) => (
          <Button
            key={mode}
            variant={viewMode === mode ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode(mode)}
            className="capitalize flex items-center gap-2"
          >
            {mode === 'plan' && <Calendar className="w-4 h-4" />}
            {mode === 'recipes' && <ChefHat className="w-4 h-4" />}
            {mode === 'grocery' && <ShoppingCart className="w-4 h-4" />}
            {mode === 'nutrition' && <Target className="w-4 h-4" />}
            {mode}
          </Button>
        ))}
      </div>

      {/* Plan Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              ${mealPlan.reduce((sum, day) => sum + day.daily_cost, 0).toFixed(0)}
            </div>
            <div className="text-sm text-text-secondary">Weekly Budget</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-navy">
              {Math.round(mealPlan.reduce((sum, day) => sum + day.prep_time_total, 0) / 60)}h
            </div>
            <div className="text-sm text-text-secondary">Total Prep Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {Math.round(mealPlan.reduce((sum, day) => sum + day.daily_nutrition.calories, 0) / mealPlan.length)}
            </div>
            <div className="text-sm text-text-secondary">Avg Daily Calories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {Math.round(mealPlan.reduce((sum, day) => sum + day.daily_nutrition.protein, 0) / mealPlan.length)}g
            </div>
            <div className="text-sm text-text-secondary">Avg Daily Protein</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Based on View Mode */}
      {viewMode === 'plan' && (
        <div className="space-y-6">
          {mealPlan.map((day, dayIndex) => (
            <Card key={day.date}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <span>${day.daily_cost.toFixed(2)} budget</span>
                      <span>•</span>
                      <span>{day.prep_time_total}min prep</span>
                      <span>•</span>
                      <span>{day.daily_nutrition.calories} calories</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Breakfast */}
                  {day.meals.breakfast && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-white flex items-center gap-2">
                        <Cookie className="w-4 h-4 text-yellow-400" />
                        Breakfast
                      </h4>
                      <div className="p-3 bg-surface rounded-lg">
                        <div className="font-medium text-white text-sm">{day.meals.breakfast.name}</div>
                        <div className="text-xs text-text-secondary mt-1">
                          {day.meals.breakfast.nutrition.calories} cal • {day.meals.breakfast.prep_time}min
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span className={`text-xs ${getDifficultyColor(day.meals.breakfast.difficulty)}`}>
                            {day.meals.breakfast.difficulty}
                          </span>
                          <span className="text-xs text-text-secondary">•</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(day.meals.breakfast.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lunch */}
                  {day.meals.lunch && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-white flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-green-400" />
                        Lunch
                      </h4>
                      <div className="p-3 bg-surface rounded-lg">
                        <div className="font-medium text-white text-sm">{day.meals.lunch.name}</div>
                        <div className="text-xs text-text-secondary mt-1">
                          {day.meals.lunch.nutrition.calories} cal • {day.meals.lunch.prep_time}min
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span className={`text-xs ${getDifficultyColor(day.meals.lunch.difficulty)}`}>
                            {day.meals.lunch.difficulty}
                          </span>
                          <span className="text-xs text-text-secondary">•</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(day.meals.lunch.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dinner */}
                  {day.meals.dinner && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-white flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-blue-400" />
                        Dinner
                      </h4>
                      <div className="p-3 bg-surface rounded-lg">
                        <div className="font-medium text-white text-sm">{day.meals.dinner.name}</div>
                        <div className="text-xs text-text-secondary mt-1">
                          {day.meals.dinner.nutrition.calories} cal • {day.meals.dinner.prep_time}min
                        </div>
                        <div className="flex items-center gap-1 mt-2">
                          <span className={`text-xs ${getDifficultyColor(day.meals.dinner.difficulty)}`}>
                            {day.meals.dinner.difficulty}
                          </span>
                          <span className="text-xs text-text-secondary">•</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(day.meals.dinner.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Snacks */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      <Apple className="w-4 h-4 text-red-400" />
                      Snacks
                    </h4>
                    <div className="space-y-2">
                      {day.meals.snacks.map((snack) => (
                        <div key={snack.id} className="p-3 bg-surface rounded-lg">
                          <div className="font-medium text-white text-sm">{snack.name}</div>
                          <div className="text-xs text-text-secondary mt-1">
                            {snack.nutrition.calories} cal • {snack.prep_time}min
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daily Nutrition Summary */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h5 className="font-medium text-white mb-3">Daily Nutrition Targets</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'Calories', actual: day.daily_nutrition.calories, target: nutritionGoals.calories, unit: '' },
                      { name: 'Protein', actual: day.daily_nutrition.protein, target: nutritionGoals.protein, unit: 'g' },
                      { name: 'Carbs', actual: day.daily_nutrition.carbs, target: nutritionGoals.carbs, unit: 'g' },
                      { name: 'Fat', actual: day.daily_nutrition.fat, target: nutritionGoals.fat, unit: 'g' }
                    ].map((nutrient) => {
                      const status = getNutritionStatus(nutrient.actual, nutrient.target, 'macro');
                      return (
                        <div key={nutrient.name} className="text-center">
                          <div className="text-sm text-text-secondary">{nutrient.name}</div>
                          <div className="text-lg font-semibold text-white">
                            {nutrient.actual}{nutrient.unit}
                          </div>
                          <div className="text-xs text-text-secondary">
                            of {nutrient.target}{nutrient.unit}
                          </div>
                          <Badge className={`text-xs mt-1 ${getStatusColor(status)}`}>
                            {Math.round((nutrient.actual / nutrient.target) * 100)}%
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewMode === 'grocery' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Weekly Grocery List
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['protein', 'vegetables', 'fruits', 'carbs', 'dairy', 'fats', 'spices', 'other'].map((category) => {
                  const categoryItems = mealPlan[0]?.grocery_list.filter(item => item.category === category) || [];
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category}>
                      <h4 className="font-medium text-white mb-3 capitalize flex items-center gap-2">
                        {category === 'protein' && <Fish className="w-4 h-4" />}
                        {category === 'vegetables' && <Leaf className="w-4 h-4" />}
                        {category === 'fruits' && <Apple className="w-4 h-4" />}
                        {category === 'carbs' && <Cookie className="w-4 h-4" />}
                        {category === 'dairy' && <Heart className="w-4 h-4" />}
                        {category === 'fats' && <Zap className="w-4 h-4" />}
                        {category}
                      </h4>
                      <div className="grid md:grid-cols-3 gap-3">
                        {categoryItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                            <div>
                              <div className="font-medium text-white">{item.name}</div>
                              <div className="text-sm text-text-secondary">
                                {item.amount} {item.unit}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-white">${item.cost_estimate.toFixed(2)}</div>
                              {item.in_season && (
                                <Badge className="text-xs bg-green-500/20 text-green-400">
                                  In Season
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}