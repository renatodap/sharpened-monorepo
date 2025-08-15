// Integration test for the complete food logging flow
import { render, screen, waitFor } from '../test-utils/test-helpers';
import { userEvent } from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { testDb, mockSupabase, mockAI } from '../test-utils/test-helpers';
import FoodPage from '@/app/food/page';

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => mockSupabase);

describe('Food Logging Flow Integration', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    
    testDb.clear();
    jest.clearAllMocks();
  });

  it('should complete full food search and logging flow', async () => {
    const user = userEvent.setup();
    
    // Mock food search results from USDA database
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        ilike: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({
            data: [
              {
                id: 1,
                description: 'Chicken breast, skinless',
                brandName: null,
                caloriesPer100g: 165,
                proteinG: 31,
                carbsG: 0,
                fatG: 3.6,
                fiberG: 0,
                verified: true
              },
              {
                id: 2, 
                description: 'Chicken breast, with skin',
                brandName: null,
                caloriesPer100g: 197,
                proteinG: 30,
                carbsG: 0,
                fatG: 7.8,
                fiberG: 0,
                verified: true
              }
            ],
            error: null
          }))
        })),
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({
        data: [{
          id: 'nutrition_log_123',
          userId: 'user_test_123',
          date: '2025-01-15',
          mealType: 'lunch',
          foodId: 1,
          quantityG: 150,
          calories: 248,
          proteinG: 46.5,
          carbsG: 0,
          fatG: 5.4
        }],
        error: null
      }))
    }));

    render(<FoodPage />, { queryClient });

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText(/food/i)).toBeInTheDocument();
    });

    // Click add food button
    const addButton = screen.getByRole('button', { name: /add food/i });
    await user.click(addButton);

    // Search for food
    const searchInput = screen.getByLabelText(/search food/i);
    await user.type(searchInput, 'chicken breast');

    // Wait for search results
    await waitFor(() => {
      expect(mockSupabase.from().select().ilike().limit).toHaveBeenCalledWith(
        expect.objectContaining({
          column: 'description',
          pattern: '%chicken breast%'
        }),
        20
      );
    });

    // Select first food result
    await waitFor(() => {
      expect(screen.getByText('Chicken breast, skinless')).toBeInTheDocument();
    });

    const foodResult = screen.getByText('Chicken breast, skinless');
    await user.click(foodResult);

    // Fill in quantity
    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '150');

    // Select meal type
    const mealSelect = screen.getByLabelText(/meal type/i);
    await user.selectOptions(mealSelect, 'lunch');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /log food/i });
    await user.click(submitButton);

    // Wait for food to be logged
    await waitFor(() => {
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: expect.any(String),
          date: expect.any(String),
          mealType: 'lunch',
          foodId: 1,
          quantityG: 150,
          calories: 248,
          proteinG: 46.5,
          carbsG: 0,
          fatG: 5.4
        })
      );
    });

    // Verify food appears in daily log
    await waitFor(() => {
      expect(screen.getByText('Chicken breast, skinless')).toBeInTheDocument();
      expect(screen.getByText('150g')).toBeInTheDocument();
      expect(screen.getByText('248 cal')).toBeInTheDocument();
    });
  });

  it('should calculate daily nutrition totals correctly', async () => {
    const existingLogs = [
      testDb.createNutritionLog({
        date: '2025-01-15',
        mealType: 'breakfast',
        foodId: 1,
        calories: 300,
        proteinG: 25,
        carbsG: 30,
        fatG: 10
      }),
      testDb.createNutritionLog({
        date: '2025-01-15', 
        mealType: 'lunch',
        foodId: 2,
        calories: 450,
        proteinG: 35,
        carbsG: 45,
        fatG: 15
      })
    ];

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: existingLogs,
            error: null
          }))
        }))
      }))
    }));

    render(<FoodPage />, { queryClient });

    // Wait for nutrition totals to calculate
    await waitFor(() => {
      expect(screen.getByText(/750/i)).toBeInTheDocument(); // total calories
      expect(screen.getByText(/60.*g.*protein/i)).toBeInTheDocument(); // total protein
      expect(screen.getByText(/75.*g.*carbs/i)).toBeInTheDocument(); // total carbs
      expect(screen.getByText(/25.*g.*fat/i)).toBeInTheDocument(); // total fat
    });
  });

  it('should handle food search with no results', async () => {
    const user = userEvent.setup();

    // Mock empty search results
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        ilike: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      }))
    }));

    render(<FoodPage />, { queryClient });

    const addButton = screen.getByRole('button', { name: /add food/i });
    await user.click(addButton);

    const searchInput = screen.getByLabelText(/search food/i);
    await user.type(searchInput, 'nonexistent food item');

    // Wait for empty state
    await waitFor(() => {
      expect(screen.getByText(/no foods found/i)).toBeInTheDocument();
    });

    // Verify suggestion to add custom food
    expect(screen.getByText(/add custom food/i)).toBeInTheDocument();
  });

  it('should allow editing logged food entries', async () => {
    const user = userEvent.setup();
    const existingLog = testDb.createNutritionLog({
      date: '2025-01-15',
      mealType: 'dinner',
      foodId: 1,
      quantityG: 100,
      calories: 165
    });

    // Mock fetching existing logs and update operation
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [existingLog],
            error: null
          }))
        }))
      })),
      update: jest.fn(() => Promise.resolve({
        data: [{ ...existingLog, quantityG: 200, calories: 330 }],
        error: null
      }))
    }));

    render(<FoodPage />, { queryClient });

    // Wait for existing log to appear
    await waitFor(() => {
      expect(screen.getByText(existingLog.calories.toString())).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Modify quantity
    const quantityInput = screen.getByDisplayValue('100');
    await user.clear(quantityInput);
    await user.type(quantityInput, '200');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Verify update was called
    await waitFor(() => {
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          quantityG: 200,
          calories: 330
        })
      );
    });
  });

  it('should delete food entries with confirmation', async () => {
    const user = userEvent.setup();
    const existingLog = testDb.createNutritionLog({
      date: '2025-01-15',
      mealType: 'snack',
      calories: 120
    });

    // Mock delete operation
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [existingLog],
            error: null
          }))
        }))
      })),
      delete: jest.fn(() => Promise.resolve({
        data: null,
        error: null
      }))
    }));

    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<FoodPage />, { queryClient });

    // Wait for food entry to load
    await waitFor(() => {
      expect(screen.getByText(existingLog.calories.toString())).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    // Verify confirmation dialog
    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringContaining('delete')
    );

    // Verify delete was called
    await waitFor(() => {
      expect(mockSupabase.from().delete).toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
  });

  it('should handle meal template functionality', async () => {
    const user = userEvent.setup();

    // Mock meal template data
    const mealTemplate = {
      id: 'template_123',
      name: 'Breakfast Template',
      foods: [
        { foodId: 1, quantityG: 100, calories: 165 },
        { foodId: 2, quantityG: 200, calories: 300 }
      ]
    };

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [mealTemplate],
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({
        data: mealTemplate.foods.map(f => ({
          id: `log_${f.foodId}`,
          ...f,
          mealType: 'breakfast',
          date: '2025-01-15'
        })),
        error: null
      }))
    }));

    render(<FoodPage />, { queryClient });

    // Navigate to templates
    const templatesTab = screen.getByRole('tab', { name: /templates/i });
    await user.click(templatesTab);

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByText('Breakfast Template')).toBeInTheDocument();
    });

    // Apply template
    const applyButton = screen.getByRole('button', { name: /apply template/i });
    await user.click(applyButton);

    // Verify all foods from template were logged
    await waitFor(() => {
      expect(mockSupabase.from().insert).toHaveBeenCalledTimes(2);
    });
  });

  it('should track nutrition goals and progress', async () => {
    const user = userEvent.setup();

    // Mock user with nutrition goals
    const userWithGoals = testDb.createUser({
      nutritionGoals: {
        calories: 2000,
        proteinG: 150,
        carbsG: 250,
        fatG: 65
      }
    });

    const dailyLogs = [
      testDb.createNutritionLog({ calories: 400, proteinG: 35, carbsG: 45, fatG: 12 }),
      testDb.createNutritionLog({ calories: 600, proteinG: 45, carbsG: 75, fatG: 20 }),
      testDb.createNutritionLog({ calories: 350, proteinG: 25, carbsG: 40, fatG: 15 })
    ];

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: dailyLogs,
            error: null
          })),
          single: jest.fn(() => Promise.resolve({
            data: userWithGoals,
            error: null
          }))
        }))
      }))
    }));

    render(<FoodPage />, { queryClient });

    // Wait for progress indicators to load
    await waitFor(() => {
      // Total consumed vs goals
      expect(screen.getByText(/1350.*\/.*2000.*calories/i)).toBeInTheDocument();
      expect(screen.getByText(/105.*\/.*150.*protein/i)).toBeInTheDocument();
      expect(screen.getByText(/160.*\/.*250.*carbs/i)).toBeInTheDocument();
      expect(screen.getByText(/47.*\/.*65.*fat/i)).toBeInTheDocument();
    });

    // Check progress bar percentages
    const caloriesProgress = screen.getByRole('progressbar', { name: /calories/i });
    expect(caloriesProgress).toHaveAttribute('value', '67.5'); // 1350/2000 * 100
  });

  it('should handle network errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock network error
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.reject(new Error('Network error')))
        }))
      }))
    }));

    render(<FoodPage />, { queryClient });

    // Verify error state is displayed
    await waitFor(() => {
      expect(screen.getByText(/error loading food log/i)).toBeInTheDocument();
    });

    // Verify retry functionality
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Test retry
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      }))
    }));

    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.queryByText(/error loading food log/i)).not.toBeInTheDocument();
    });
  });

  it('should support barcode scanning for food entry', async () => {
    const user = userEvent.setup();

    // Mock barcode scanner result
    const barcodeFood = {
      id: 999,
      description: 'Oatmeal, Instant',
      brandName: 'Quaker',
      barcode: '1234567890123',
      caloriesPer100g: 380,
      verified: true
    };

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [barcodeFood],
          error: null
        }))
      })),
      insert: jest.fn(() => Promise.resolve({
        data: [{
          id: 'nutrition_log_barcode',
          foodId: 999,
          quantityG: 40,
          calories: 152
        }],
        error: null
      }))
    }));

    // Mock barcode scanner API
    const mockBarcodeScanner = jest.fn().mockResolvedValue('1234567890123');
    (global as any).BarcodeDetector = jest.fn().mockImplementation(() => ({
      detect: mockBarcodeScanner
    }));

    render(<FoodPage />, { queryClient });

    const addButton = screen.getByRole('button', { name: /add food/i });
    await user.click(addButton);

    // Click barcode scan button
    const scanButton = screen.getByRole('button', { name: /scan barcode/i });
    await user.click(scanButton);

    // Wait for barcode scanning and food lookup
    await waitFor(() => {
      expect(mockBarcodeScanner).toHaveBeenCalled();
      expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('barcode', '1234567890123');
    });

    // Verify food was found and pre-filled
    await waitFor(() => {
      expect(screen.getByDisplayValue('Oatmeal, Instant')).toBeInTheDocument();
      expect(screen.getByText('Quaker')).toBeInTheDocument();
    });
  });
});