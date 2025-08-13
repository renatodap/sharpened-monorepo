import { faker } from '@faker-js/faker';

// User fixtures
export const createTestUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  username: faker.internet.userName(),
  createdAt: faker.date.past(),
  profile: {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 80 }),
    weight: faker.number.int({ min: 50, max: 150 }),
    height: faker.number.int({ min: 150, max: 210 }),
    goal: faker.helpers.arrayElement(['weight-loss', 'muscle-gain', 'maintenance', 'performance']),
    activityLevel: faker.helpers.arrayElement(['sedentary', 'light', 'moderate', 'active', 'very-active']),
  },
  ...overrides,
});

// Workout fixtures
export const createTestWorkout = (overrides = {}) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  name: faker.helpers.arrayElement(['Push Day', 'Pull Day', 'Leg Day', 'Full Body']),
  date: faker.date.recent(),
  duration: faker.number.int({ min: 30, max: 120 }),
  exercises: [],
  notes: faker.lorem.sentence(),
  ...overrides,
});

// Exercise fixtures
export const createTestExercise = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(['Bench Press', 'Squat', 'Deadlift', 'Pull Up', 'Push Up']),
  category: faker.helpers.arrayElement(['chest', 'back', 'legs', 'shoulders', 'arms', 'core']),
  sets: faker.number.int({ min: 3, max: 5 }),
  reps: faker.number.int({ min: 5, max: 15 }),
  weight: faker.number.int({ min: 20, max: 200 }),
  restTime: faker.number.int({ min: 30, max: 180 }),
  ...overrides,
});

// Food fixtures
export const createTestFood = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.helpers.arrayElement(['Chicken Breast', 'Brown Rice', 'Broccoli', 'Apple', 'Eggs']),
  brand: faker.company.name(),
  barcode: faker.string.numeric(12),
  nutrition: {
    calories: faker.number.int({ min: 20, max: 500 }),
    protein: faker.number.float({ min: 0, max: 50, precision: 0.1 }),
    carbs: faker.number.float({ min: 0, max: 100, precision: 0.1 }),
    fat: faker.number.float({ min: 0, max: 30, precision: 0.1 }),
    fiber: faker.number.float({ min: 0, max: 10, precision: 0.1 }),
    sugar: faker.number.float({ min: 0, max: 50, precision: 0.1 }),
    sodium: faker.number.int({ min: 0, max: 1000 }),
  },
  servingSize: faker.number.int({ min: 50, max: 200 }),
  servingUnit: faker.helpers.arrayElement(['g', 'oz', 'cup', 'tbsp', 'tsp', 'piece']),
  ...overrides,
});

// Meal fixtures
export const createTestMeal = (overrides = {}) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  name: faker.helpers.arrayElement(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
  date: faker.date.recent(),
  foods: [],
  totalCalories: faker.number.int({ min: 200, max: 800 }),
  totalProtein: faker.number.float({ min: 10, max: 50, precision: 0.1 }),
  totalCarbs: faker.number.float({ min: 20, max: 100, precision: 0.1 }),
  totalFat: faker.number.float({ min: 5, max: 40, precision: 0.1 }),
  ...overrides,
});

// Body measurement fixtures
export const createTestMeasurement = (overrides = {}) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  date: faker.date.recent(),
  weight: faker.number.float({ min: 50, max: 150, precision: 0.1 }),
  bodyFat: faker.number.float({ min: 5, max: 35, precision: 0.1 }),
  muscleMass: faker.number.float({ min: 20, max: 80, precision: 0.1 }),
  measurements: {
    chest: faker.number.int({ min: 80, max: 120 }),
    waist: faker.number.int({ min: 60, max: 110 }),
    hips: faker.number.int({ min: 80, max: 120 }),
    thighs: faker.number.int({ min: 40, max: 70 }),
    arms: faker.number.int({ min: 25, max: 45 }),
    neck: faker.number.int({ min: 30, max: 45 }),
  },
  ...overrides,
});

// API response fixtures
export const createSuccessResponse = (data: any, overrides = {}) => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
  ...overrides,
});

export const createErrorResponse = (message: string, code = 'ERROR', overrides = {}) => ({
  success: false,
  error: {
    message,
    code,
    timestamp: new Date().toISOString(),
  },
  ...overrides,
});

// Pagination fixtures
export const createPaginatedResponse = (items: any[], overrides = {}) => ({
  items,
  pagination: {
    page: 1,
    pageSize: 10,
    totalItems: items.length,
    totalPages: Math.ceil(items.length / 10),
    hasNext: false,
    hasPrev: false,
  },
  ...overrides,
});