import { describe, test, expect } from 'vitest';
import progressReducer, {
    fetchHistory,
    logWorkout,
    updateWorkoutLog,
    deleteWorkoutLog,
    selectMuscleGroupDistribution,
} from '../store/slices/progressSlice';

describe('progressSlice', () => {
    const initialState = {
        workoutHistory: [],
        stats: {
            totalWorkouts: 0,
            totalExercises: 0,
            totalVolume: 0,
            streak: 0,
        },
        loading: false,
        error: null,
    };

    // --- Initial State ---

    test('should return the initial state', () => {
        const state = progressReducer(undefined, { type: 'unknown' });
        expect(state.workoutHistory).toEqual([]);
        expect(state.stats.totalWorkouts).toBe(0);
        expect(state.loading).toBe(false);
    });

    // --- fetchHistory ---

    test('should handle fetchHistory.pending', () => {
        const action = { type: fetchHistory.pending.type };
        const state = progressReducer(initialState, action);
        expect(state.loading).toBe(true);
    });

    test('should handle fetchHistory.fulfilled with data', () => {
        const history = [
            {
                id: '1',
                name: 'Workout A',
                completedAt: '2026-02-01',
                exercises: [
                    { id: 'e1', target: 'chest', sets: [{ weight: 60, reps: 10 }] },
                ],
            },
        ];

        const action = { type: fetchHistory.fulfilled.type, payload: history };
        const state = progressReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.workoutHistory.length).toBe(1);
        expect(state.stats.totalWorkouts).toBe(1);
        expect(state.stats.totalExercises).toBe(1);
        expect(state.stats.totalVolume).toBe(600);
    });

    test('should handle fetchHistory.fulfilled with non-array', () => {
        const action = { type: fetchHistory.fulfilled.type, payload: null };
        const state = progressReducer(initialState, action);

        expect(state.workoutHistory).toEqual([]);
        expect(state.stats.totalWorkouts).toBe(0);
    });

    // --- logWorkout ---

    test('should handle logWorkout.fulfilled', () => {
        const workout = {
            id: '1',
            name: 'Morning Workout',
            completedAt: '2026-02-10',
            exercises: [
                { id: 'e1', target: 'chest', sets: [{ weight: 0, reps: 10 }] },
                { id: 'e2', target: 'quads', sets: [{ weight: 50, reps: 12 }] },
            ],
        };

        const action = { type: logWorkout.fulfilled.type, payload: workout };
        const state = progressReducer(initialState, action);

        expect(state.workoutHistory.length).toBe(1);
        expect(state.stats.totalWorkouts).toBe(1);
        expect(state.stats.totalExercises).toBe(2);
        expect(state.stats.totalVolume).toBe(600);
    });

    test('should calculate total volume correctly with multiple sets', () => {
        const workout = {
            id: '1',
            name: 'Strength Workout',
            completedAt: '2026-02-10',
            exercises: [
                {
                    id: 'e1',
                    target: 'chest',
                    sets: [
                        { weight: 60, reps: 8 },
                        { weight: 60, reps: 8 },
                        { weight: 60, reps: 6 },
                    ],
                },
            ],
        };

        const action = { type: logWorkout.fulfilled.type, payload: workout };
        const state = progressReducer(initialState, action);

        // (60*8) + (60*8) + (60*6) = 480 + 480 + 360 = 1320
        expect(state.stats.totalVolume).toBe(1320);
    });

    test('should accumulate multiple workouts', () => {
        let state = initialState;

        const workout1 = {
            id: '1',
            name: 'Workout 1',
            completedAt: '2026-02-08',
            exercises: [{ id: 'e1', target: 'chest', sets: [{ weight: 10, reps: 10 }] }],
        };
        state = progressReducer(state, { type: logWorkout.fulfilled.type, payload: workout1 });

        const workout2 = {
            id: '2',
            name: 'Workout 2',
            completedAt: '2026-02-09',
            exercises: [{ id: 'e2', target: 'back', sets: [{ weight: 20, reps: 10 }] }],
        };
        state = progressReducer(state, { type: logWorkout.fulfilled.type, payload: workout2 });

        expect(state.workoutHistory.length).toBe(2);
        expect(state.stats.totalWorkouts).toBe(2);
        expect(state.stats.totalExercises).toBe(2);
        expect(state.stats.totalVolume).toBe(300);
    });

    // --- updateWorkoutLog ---

    test('should handle updateWorkoutLog.fulfilled', () => {
        const stateWithHistory = {
            ...initialState,
            workoutHistory: [
                {
                    id: '1',
                    name: 'Original',
                    completedAt: '2026-02-01',
                    exercises: [{ id: 'e1', target: 'chest', sets: [{ weight: 10, reps: 10 }] }],
                },
            ],
            stats: { totalWorkouts: 1, totalExercises: 1, totalVolume: 100, streak: 0 },
        };

        const updated = {
            id: '1',
            name: 'Updated Workout',
            completedAt: '2026-02-01',
            exercises: [{ id: 'e1', target: 'chest', sets: [{ weight: 20, reps: 10 }] }],
        };

        const action = { type: updateWorkoutLog.fulfilled.type, payload: updated };
        const state = progressReducer(stateWithHistory, action);

        expect(state.workoutHistory[0].name).toBe('Updated Workout');
        expect(state.stats.totalVolume).toBe(200);
    });

    // --- deleteWorkoutLog ---

    test('should handle deleteWorkoutLog.fulfilled', () => {
        const stateWithHistory = {
            ...initialState,
            workoutHistory: [
                { id: '1', name: 'Workout A', completedAt: '2026-02-01', exercises: [] },
                { id: '2', name: 'Workout B', completedAt: '2026-02-02', exercises: [] },
            ],
            stats: { totalWorkouts: 2, totalExercises: 0, totalVolume: 0, streak: 0 },
        };

        const action = { type: deleteWorkoutLog.fulfilled.type, payload: '1' };
        const state = progressReducer(stateWithHistory, action);

        expect(state.workoutHistory.length).toBe(1);
        expect(state.workoutHistory[0].id).toBe('2');
        expect(state.stats.totalWorkouts).toBe(1);
    });

    // --- Selectors ---

    test('selectMuscleGroupDistribution should count targets correctly', () => {
        const mockState = {
            progress: {
                workoutHistory: [
                    {
                        exercises: [
                            { target: 'chest' },
                            { target: 'chest' },
                            { target: 'back' },
                        ],
                    },
                    {
                        exercises: [
                            { target: 'quads' },
                            { target: 'chest' },
                        ],
                    },
                ],
            },
        };

        const distribution = selectMuscleGroupDistribution(mockState);
        expect(distribution.chest).toBe(3);
        expect(distribution.back).toBe(1);
        expect(distribution.quads).toBe(1);
    });
});
