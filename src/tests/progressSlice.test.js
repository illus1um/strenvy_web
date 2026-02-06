import { describe, test, expect, beforeEach, vi } from 'vitest';
import progressReducer, {
    logWorkout,
    updateWorkoutLog,
    deleteWorkoutLog,
} from '../store/slices/progressSlice';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('progressSlice', () => {
    const initialState = {
        workoutHistory: [],
        stats: {
            totalWorkouts: 0,
            totalExercises: 0,
            totalVolume: 0,
            streak: 0,
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should return the initial state', () => {
        const state = progressReducer(undefined, { type: 'unknown' });

        expect(state.workoutHistory).toEqual([]);
        expect(state.stats.totalWorkouts).toBe(0);
    });

    test('should handle logWorkout', () => {
        const workout = {
            name: 'Morning Workout',
            exercises: [
                { id: '1', name: 'Push-up', target: 'chest', sets: [{ weight: 0, reps: 10 }] },
                { id: '2', name: 'Squat', target: 'quads', sets: [{ weight: 50, reps: 12 }] },
            ],
        };

        const state = progressReducer(initialState, logWorkout(workout));

        expect(state.workoutHistory.length).toBe(1);
        expect(state.workoutHistory[0].name).toBe('Morning Workout');
        expect(state.workoutHistory[0].id).toBeDefined();
        expect(state.workoutHistory[0].completedAt).toBeDefined();
        expect(state.stats.totalWorkouts).toBe(1);
        expect(state.stats.totalExercises).toBe(2);
    });

    test('should calculate total volume correctly', () => {
        const workout = {
            name: 'Strength Workout',
            exercises: [
                {
                    id: '1',
                    name: 'Bench Press',
                    target: 'chest',
                    sets: [
                        { weight: 60, reps: 8 },
                        { weight: 60, reps: 8 },
                        { weight: 60, reps: 6 },
                    ]
                },
            ],
        };

        const state = progressReducer(initialState, logWorkout(workout));

        // Expected volume: (60*8) + (60*8) + (60*6) = 480 + 480 + 360 = 1320
        expect(state.stats.totalVolume).toBe(1320);
    });

    test('should handle updateWorkoutLog', () => {
        const stateWithWorkout = {
            ...initialState,
            workoutHistory: [{
                id: '123',
                name: 'Original Workout',
                exercises: [],
                completedAt: '2024-01-01',
            }],
        };

        const state = progressReducer(
            stateWithWorkout,
            updateWorkoutLog({ id: '123', name: 'Updated Workout' })
        );

        expect(state.workoutHistory[0].name).toBe('Updated Workout');
    });

    test('should handle deleteWorkoutLog', () => {
        const stateWithWorkouts = {
            ...initialState,
            workoutHistory: [
                { id: '1', name: 'Workout A', exercises: [], completedAt: '2024-01-01' },
                { id: '2', name: 'Workout B', exercises: [], completedAt: '2024-01-02' },
            ],
            stats: { totalWorkouts: 2, totalExercises: 0, totalVolume: 0, streak: 0 },
        };

        const state = progressReducer(stateWithWorkouts, deleteWorkoutLog('1'));

        expect(state.workoutHistory.length).toBe(1);
        expect(state.workoutHistory[0].id).toBe('2');
        expect(state.stats.totalWorkouts).toBe(1);
    });

    test('should accumulate multiple workouts', () => {
        let state = initialState;

        state = progressReducer(state, logWorkout({
            name: 'Workout 1',
            exercises: [{ id: '1', target: 'chest', sets: [{ weight: 10, reps: 10 }] }],
        }));

        state = progressReducer(state, logWorkout({
            name: 'Workout 2',
            exercises: [{ id: '2', target: 'back', sets: [{ weight: 20, reps: 10 }] }],
        }));

        expect(state.workoutHistory.length).toBe(2);
        expect(state.stats.totalWorkouts).toBe(2);
        expect(state.stats.totalExercises).toBe(2);
        expect(state.stats.totalVolume).toBe(300); // (10*10) + (20*10)
    });
});
