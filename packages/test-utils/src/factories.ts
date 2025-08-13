import { faker } from '@faker-js/faker';

// Factory base class
abstract class Factory<T> {
  abstract build(overrides?: Partial<T>): T;
  
  buildMany(count: number, overrides?: Partial<T>): T[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }
}

// User factory
export class UserFactory extends Factory<any> {
  build(overrides = {}) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      username: faker.internet.userName(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      emailVerified: faker.datatype.boolean(),
      profile: new UserProfileFactory().build(),
      ...overrides,
    };
  }
}

// User profile factory
export class UserProfileFactory extends Factory<any> {
  build(overrides = {}) {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
      age: faker.number.int({ min: 18, max: 65 }),
      gender: faker.helpers.arrayElement(['male', 'female', 'other']),
      weight: faker.number.float({ min: 50, max: 150, precision: 0.1 }),
      height: faker.number.int({ min: 150, max: 210 }),
      activityLevel: faker.helpers.arrayElement(['sedentary', 'light', 'moderate', 'active', 'very-active']),
      goal: faker.helpers.arrayElement(['weight-loss', 'muscle-gain', 'maintenance', 'performance']),
      targetWeight: faker.number.float({ min: 50, max: 150, precision: 0.1 }),
      weeklyWeightGoal: faker.number.float({ min: -1, max: 1, precision: 0.1 }),
      ...overrides,
    };
  }
}

// Workout factory
export class WorkoutFactory extends Factory<any> {
  build(overrides = {}) {
    const exerciseCount = faker.number.int({ min: 3, max: 8 });
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      name: faker.helpers.arrayElement(['Push Day', 'Pull Day', 'Leg Day', 'Full Body', 'Upper Body', 'Lower Body']),
      date: faker.date.recent(),
      startTime: faker.date.recent(),
      endTime: faker.date.recent(),
      duration: faker.number.int({ min: 30, max: 120 }),
      exercises: new ExerciseFactory().buildMany(exerciseCount),
      notes: faker.lorem.sentence(),
      rating: faker.number.int({ min: 1, max: 5 }),
      completed: faker.datatype.boolean(),
      ...overrides,
    };
  }
}

// Exercise factory
export class ExerciseFactory extends Factory<any> {
  build(overrides = {}) {
    const setCount = faker.number.int({ min: 3, max: 5 });
    return {
      id: faker.string.uuid(),
      exerciseId: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        'Bench Press', 'Squat', 'Deadlift', 'Pull Up', 'Push Up',
        'Overhead Press', 'Barbell Row', 'Dumbbell Curl', 'Tricep Extension',
        'Leg Press', 'Lunges', 'Calf Raises', 'Plank', 'Sit Ups'
      ]),
      category: faker.helpers.arrayElement(['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio']),
      equipment: faker.helpers.arrayElement(['barbell', 'dumbbell', 'machine', 'bodyweight', 'cable', 'band']),
      sets: new SetFactory().buildMany(setCount),
      notes: faker.lorem.sentence(),
      restTime: faker.number.int({ min: 30, max: 180 }),
      ...overrides,
    };
  }
}

// Set factory
export class SetFactory extends Factory<any> {
  build(overrides = {}) {
    return {
      id: faker.string.uuid(),
      setNumber: faker.number.int({ min: 1, max: 5 }),
      reps: faker.number.int({ min: 5, max: 15 }),
      weight: faker.number.float({ min: 20, max: 200, precision: 2.5 }),
      unit: faker.helpers.arrayElement(['kg', 'lbs']),
      rpe: faker.number.int({ min: 5, max: 10 }),
      completed: faker.datatype.boolean(),
      ...overrides,
    };
  }
}

// Food factory
export class FoodFactory extends Factory<any> {
  build(overrides = {}) {
    return {
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement([
        'Chicken Breast', 'Brown Rice', 'Broccoli', 'Apple', 'Eggs',
        'Salmon', 'Sweet Potato', 'Spinach', 'Banana', 'Greek Yogurt',
        'Oatmeal', 'Almonds', 'Avocado', 'Quinoa', 'Cottage Cheese'
      ]),
      brand: faker.company.name(),
      barcode: faker.string.numeric(12),
      category: faker.helpers.arrayElement(['protein', 'carbs', 'fats', 'vegetables', 'fruits', 'dairy', 'grains']),
      nutrition: new NutritionFactory().build(),
      servingSize: faker.number.int({ min: 50, max: 200 }),
      servingUnit: faker.helpers.arrayElement(['g', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice']),
      verified: faker.datatype.boolean(),
      ...overrides,
    };
  }
}

// Nutrition factory
export class NutritionFactory extends Factory<any> {
  build(overrides = {}) {
    const calories = faker.number.int({ min: 20, max: 500 });
    return {
      calories,
      protein: faker.number.float({ min: 0, max: calories / 4, precision: 0.1 }),
      carbs: faker.number.float({ min: 0, max: calories / 4, precision: 0.1 }),
      fat: faker.number.float({ min: 0, max: calories / 9, precision: 0.1 }),
      fiber: faker.number.float({ min: 0, max: 10, precision: 0.1 }),
      sugar: faker.number.float({ min: 0, max: 50, precision: 0.1 }),
      sodium: faker.number.int({ min: 0, max: 1000 }),
      cholesterol: faker.number.int({ min: 0, max: 300 }),
      saturatedFat: faker.number.float({ min: 0, max: 20, precision: 0.1 }),
      transFat: faker.number.float({ min: 0, max: 5, precision: 0.1 }),
      ...overrides,
    };
  }
}

// Meal factory
export class MealFactory extends Factory<any> {
  build(overrides = {}) {
    const foodCount = faker.number.int({ min: 1, max: 5 });
    const foods = new FoodEntryFactory().buildMany(foodCount);
    
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      type: faker.helpers.arrayElement(['breakfast', 'lunch', 'dinner', 'snack']),
      name: faker.helpers.arrayElement(['Breakfast', 'Lunch', 'Dinner', 'Morning Snack', 'Afternoon Snack']),
      date: faker.date.recent(),
      foods,
      totalNutrition: this.calculateTotalNutrition(foods),
      notes: faker.lorem.sentence(),
      ...overrides,
    };
  }

  private calculateTotalNutrition(foods: any[]) {
    return foods.reduce((total, food) => ({
      calories: total.calories + food.nutrition.calories,
      protein: total.protein + food.nutrition.protein,
      carbs: total.carbs + food.nutrition.carbs,
      fat: total.fat + food.nutrition.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }
}

// Food entry factory
export class FoodEntryFactory extends Factory<any> {
  build(overrides = {}) {
    const food = new FoodFactory().build();
    const quantity = faker.number.float({ min: 0.5, max: 3, precision: 0.25 });
    
    return {
      id: faker.string.uuid(),
      food,
      quantity,
      unit: food.servingUnit,
      nutrition: {
        calories: food.nutrition.calories * quantity,
        protein: food.nutrition.protein * quantity,
        carbs: food.nutrition.carbs * quantity,
        fat: food.nutrition.fat * quantity,
      },
      ...overrides,
    };
  }
}

// Body measurement factory
export class BodyMeasurementFactory extends Factory<any> {
  build(overrides = {}) {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      date: faker.date.recent(),
      weight: faker.number.float({ min: 50, max: 150, precision: 0.1 }),
      bodyFat: faker.number.float({ min: 5, max: 35, precision: 0.1 }),
      muscleMass: faker.number.float({ min: 20, max: 80, precision: 0.1 }),
      waterPercentage: faker.number.float({ min: 45, max: 65, precision: 0.1 }),
      boneMass: faker.number.float({ min: 2, max: 5, precision: 0.1 }),
      visceralFat: faker.number.int({ min: 1, max: 15 }),
      bmr: faker.number.int({ min: 1200, max: 2500 }),
      measurements: {
        neck: faker.number.float({ min: 30, max: 45, precision: 0.5 }),
        chest: faker.number.float({ min: 80, max: 120, precision: 0.5 }),
        waist: faker.number.float({ min: 60, max: 110, precision: 0.5 }),
        hips: faker.number.float({ min: 80, max: 120, precision: 0.5 }),
        thighLeft: faker.number.float({ min: 40, max: 70, precision: 0.5 }),
        thighRight: faker.number.float({ min: 40, max: 70, precision: 0.5 }),
        calfLeft: faker.number.float({ min: 30, max: 45, precision: 0.5 }),
        calfRight: faker.number.float({ min: 30, max: 45, precision: 0.5 }),
        armLeft: faker.number.float({ min: 25, max: 45, precision: 0.5 }),
        armRight: faker.number.float({ min: 25, max: 45, precision: 0.5 }),
        forearmLeft: faker.number.float({ min: 20, max: 35, precision: 0.5 }),
        forearmRight: faker.number.float({ min: 20, max: 35, precision: 0.5 }),
      },
      photos: [],
      notes: faker.lorem.sentence(),
      ...overrides,
    };
  }
}

// Export factory instances
export const factories = {
  user: new UserFactory(),
  userProfile: new UserProfileFactory(),
  workout: new WorkoutFactory(),
  exercise: new ExerciseFactory(),
  set: new SetFactory(),
  food: new FoodFactory(),
  nutrition: new NutritionFactory(),
  meal: new MealFactory(),
  foodEntry: new FoodEntryFactory(),
  bodyMeasurement: new BodyMeasurementFactory(),
};