// Integration test for the complete workout flow
import { render, screen, waitFor } from '@/test-utils/test-helpers';
import { userEvent } from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { testDb, mockSupabase, mockAI } from '@/test-utils/test-helpers';
import WorkoutPage from '@/app/workouts/page';

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => mockSupabase);

// Mock AI services
jest.mock('@/packages/ai-core/src/agents', () => ({
  FitnessCoachAgent: jest.fn().mockImplementation(() => ({
    parseWorkout: mockAI.claude.chat
  }))
}));

describe('Workout Flow Integration', () => {
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

  it('should complete full workout creation flow', async () => {
    const user = userEvent.setup();
    
    // Mock successful API responses
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({
        data: [{
          id: 'workout_123',
          title: 'Bench Press Workout',
          exercises: [
            {
              name: 'bench press',
              sets: [
                { reps: 8, weight: 100 },
                { reps: 8, weight: 100 },
                { reps: 8, weight: 100 }
              ]
            }
          ]
        }],
        error: null
      }))
    }));

    mockAI.claude.chat.mockResolvedValueOnce({
      content: JSON.stringify({
        title: 'Bench Press Workout',
        exercises: [
          {
            name: 'bench press',
            sets: [
              { reps: 8, weight: 100 },
              { reps: 8, weight: 100 },
              { reps: 8, weight: 100 }
            ]
          }
        ],
        duration_minutes: 30
      })
    });

    // Render the workout page
    render(<WorkoutPage />, { queryClient });

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText(/workouts/i)).toBeInTheDocument();
    });

    // Click add workout button
    const addButton = screen.getByRole('button', { name: /add workout/i });
    await user.click(addButton);

    // Fill in workout description
    const workoutInput = screen.getByLabelText(/workout description/i);
    await user.type(workoutInput, 'bench press 3x8 at 100kg');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /save workout/i });
    await user.click(submitButton);

    // Wait for AI parsing
    await waitFor(() => {
      expect(mockAI.claude.chat).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining('bench press 3x8 at 100kg')
          })
        ]),
        expect.any(Object)
      );
    });

    // Wait for workout to be created
    await waitFor(() => {
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Bench Press Workout',
          exercises: expect.arrayContaining([
            expect.objectContaining({
              name: 'bench press',
              sets: expect.arrayContaining([
                { reps: 8, weight: 100 }
              ])
            })
          ])
        })
      );
    });

    // Verify workout appears in list
    await waitFor(() => {
      expect(screen.getByText('Bench Press Workout')).toBeInTheDocument();
    });

    // Verify exercise details
    expect(screen.getByText('bench press')).toBeInTheDocument();
    expect(screen.getByText(/3 sets/i)).toBeInTheDocument();
    expect(screen.getByText(/100kg/i)).toBeInTheDocument();
  });

  it('should handle workout parsing errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock AI parsing failure
    mockAI.claude.chat.mockRejectedValueOnce(new Error('AI service unavailable'));

    render(<WorkoutPage />, { queryClient });

    // Add workout with invalid input
    const addButton = screen.getByRole('button', { name: /add workout/i });
    await user.click(addButton);

    const workoutInput = screen.getByLabelText(/workout description/i);
    await user.type(workoutInput, 'invalid workout data that cannot be parsed');

    const submitButton = screen.getByRole('button', { name: /save workout/i });
    await user.click(submitButton);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(/unable to parse workout/i)).toBeInTheDocument();
    });

    // Verify no workout was created
    expect(mockSupabase.from().insert).not.toHaveBeenCalled();
  });

  it('should allow editing existing workouts', async () => {
    const user = userEvent.setup();
    const existingWorkout = testDb.find('workouts')[0];

    // Mock fetching existing workouts
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [existingWorkout],
            error: null
          }))
        }))
      })),
      update: jest.fn(() => Promise.resolve({
        data: [{ ...existingWorkout, title: 'Updated Workout' }],
        error: null
      }))
    }));

    render(<WorkoutPage />, { queryClient });

    // Wait for workouts to load
    await waitFor(() => {
      expect(screen.getByText(existingWorkout.title)).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    // Modify workout title
    const titleInput = screen.getByDisplayValue(existingWorkout.title);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Workout');

    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Verify update was called
    await waitFor(() => {
      expect(mockSupabase.from().update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Workout'
        })
      );
    });
  });

  it('should delete workouts with confirmation', async () => {
    const user = userEvent.setup();
    const existingWorkout = testDb.find('workouts')[0];

    // Mock delete operation
    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [existingWorkout],
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

    render(<WorkoutPage />, { queryClient });

    // Wait for workouts to load
    await waitFor(() => {
      expect(screen.getByText(existingWorkout.title)).toBeInTheDocument();
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

  it('should display workout statistics correctly', async () => {
    const workouts = [
      testDb.createWorkout({ 
        date: '2025-01-13',
        exercises: [{ name: 'bench press', sets: [{ reps: 8, weight: 100 }] }]
      }),
      testDb.createWorkout({ 
        date: '2025-01-14',
        exercises: [{ name: 'squats', sets: [{ reps: 10, weight: 120 }] }]
      }),
      testDb.createWorkout({ 
        date: '2025-01-15',
        exercises: [{ name: 'deadlift', sets: [{ reps: 5, weight: 140 }] }]
      })
    ];

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: workouts,
            error: null
          }))
        }))
      }))
    }));

    render(<WorkoutPage />, { queryClient });

    // Wait for statistics to load
    await waitFor(() => {
      expect(screen.getByText(/3 workouts/i)).toBeInTheDocument();
    });

    // Verify weekly stats
    expect(screen.getByText(/this week/i)).toBeInTheDocument();
    
    // Verify total volume or other calculated stats
    // This would depend on your actual stats implementation
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

    render(<WorkoutPage />, { queryClient });

    // Verify error state is displayed
    await waitFor(() => {
      expect(screen.getByText(/error loading workouts/i)).toBeInTheDocument();
    });

    // Verify retry button is available
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Test retry functionality
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

    // Verify retry works
    await waitFor(() => {
      expect(screen.queryByText(/error loading workouts/i)).not.toBeInTheDocument();
    });
  });

  it('should maintain state during concurrent operations', async () => {
    const user = userEvent.setup();

    // Mock slow API responses
    let resolveFirst: (value: any) => void;
    let resolveSecond: (value: any) => void;

    const firstPromise = new Promise(resolve => { resolveFirst = resolve; });
    const secondPromise = new Promise(resolve => { resolveSecond = resolve; });

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: jest.fn()
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise)
    }));

    mockAI.claude.chat
      .mockResolvedValueOnce({
        content: JSON.stringify({
          title: 'First Workout',
          exercises: [{ name: 'exercise1', sets: [{ reps: 8, weight: 100 }] }]
        })
      })
      .mockResolvedValueOnce({
        content: JSON.stringify({
          title: 'Second Workout',
          exercises: [{ name: 'exercise2', sets: [{ reps: 10, weight: 120 }] }]
        })
      });

    render(<WorkoutPage />, { queryClient });

    // Start first workout creation
    const addButton = screen.getByRole('button', { name: /add workout/i });
    await user.click(addButton);

    const workoutInput = screen.getByLabelText(/workout description/i);
    await user.type(workoutInput, 'first workout');
    
    const submitButton = screen.getByRole('button', { name: /save workout/i });
    await user.click(submitButton);

    // Start second workout creation before first completes
    await user.click(addButton);
    await user.type(workoutInput, 'second workout');
    await user.click(submitButton);

    // Resolve operations in reverse order
    resolveSecond!({ data: [{ title: 'Second Workout' }], error: null });
    resolveFirst!({ data: [{ title: 'First Workout' }], error: null });

    // Verify both operations completed correctly
    await waitFor(() => {
      expect(screen.getByText('First Workout')).toBeInTheDocument();
      expect(screen.getByText('Second Workout')).toBeInTheDocument();
    });
  });
});