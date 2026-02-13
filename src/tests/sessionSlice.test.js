import { describe, test, expect, beforeEach, vi } from 'vitest';
import sessionReducer, {
    startSession,
    updateSet,
    toggleSetComplete,
    addSet,
    removeSet,
    setCurrentExercise,
    endSession,
} from '../store/slices/sessionSlice';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('sessionSlice', () => {
    const initialState = {
        active: false,
        workout: null,
        startedAt: null,
        currentExerciseIndex: 0,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // --- Initial State ---

    test('should return the initial state', () => {
        const state = sessionReducer(undefined, { type: 'unknown' });
        expect(state.active).toBe(false);
        expect(state.workout).toBeNull();
        expect(state.startedAt).toBeNull();
        expect(state.currentExerciseIndex).toBe(0);
    });

    // --- startSession ---

    test('should handle startSession', () => {
        const payload = {
            name: 'Morning Workout',
            programId: 'prog-1',
            exercises: [
                { id: 'e1', name: 'Push-up', bodyPart: 'chest', target: 'pectorals', sets: 3, reps: 10, rest: 60 },
                { id: 'e2', name: 'Squat', bodyPart: 'upper legs', target: 'quads', sets: 4, reps: 12, rest: 90 },
            ],
        };

        const state = sessionReducer(initialState, startSession(payload));

        expect(state.active).toBe(true);
        expect(state.startedAt).toBeDefined();
        expect(state.currentExerciseIndex).toBe(0);
        expect(state.workout.name).toBe('Morning Workout');
        expect(state.workout.programId).toBe('prog-1');
        expect(state.workout.exercises.length).toBe(2);

        // Check exercise structure
        const ex1 = state.workout.exercises[0];
        expect(ex1.name).toBe('Push-up');
        expect(ex1.bodyPart).toBe('chest');
        expect(ex1.sets.length).toBe(3);
        expect(ex1.sets[0].setNumber).toBe(1);
        expect(ex1.sets[0].weight).toBe(0);
        expect(ex1.sets[0].reps).toBe(10);
        expect(ex1.sets[0].completed).toBe(false);

        const ex2 = state.workout.exercises[1];
        expect(ex2.sets.length).toBe(4);
        expect(ex2.sets[0].reps).toBe(12);
        expect(ex2.rest).toBe(90);
    });

    test('should use default values for missing exercise fields', () => {
        const payload = {
            name: 'Quick Workout',
            exercises: [{ id: 'e1', name: 'Exercise' }],
        };

        const state = sessionReducer(initialState, startSession(payload));

        const ex = state.workout.exercises[0];
        expect(ex.bodyPart).toBe('');
        expect(ex.target).toBe('');
        expect(ex.rest).toBe(60);
        expect(ex.sets.length).toBe(3); // default
        expect(ex.sets[0].reps).toBe(10); // default
        expect(state.workout.programId).toBeNull();
    });

    test('should persist session to localStorage on start', () => {
        const payload = {
            name: 'Test',
            exercises: [{ id: 'e1', name: 'Ex' }],
        };

        sessionReducer(initialState, startSession(payload));
        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    // --- updateSet ---

    test('should handle updateSet for weight', () => {
        const activeState = createActiveSessionState();

        const state = sessionReducer(activeState, updateSet({
            exerciseIndex: 0,
            setIndex: 0,
            field: 'weight',
            value: 50,
        }));

        expect(state.workout.exercises[0].sets[0].weight).toBe(50);
    });

    test('should handle updateSet for reps', () => {
        const activeState = createActiveSessionState();

        const state = sessionReducer(activeState, updateSet({
            exerciseIndex: 0,
            setIndex: 1,
            field: 'reps',
            value: 15,
        }));

        expect(state.workout.exercises[0].sets[1].reps).toBe(15);
    });

    test('should not crash on invalid exercise index', () => {
        const activeState = createActiveSessionState();

        const state = sessionReducer(activeState, updateSet({
            exerciseIndex: 99,
            setIndex: 0,
            field: 'weight',
            value: 50,
        }));

        // State unchanged
        expect(state.workout.exercises[0].sets[0].weight).toBe(0);
    });

    // --- toggleSetComplete ---

    test('should handle toggleSetComplete', () => {
        const activeState = createActiveSessionState();

        let state = sessionReducer(activeState, toggleSetComplete({
            exerciseIndex: 0,
            setIndex: 0,
        }));
        expect(state.workout.exercises[0].sets[0].completed).toBe(true);

        // Toggle back
        state = sessionReducer(state, toggleSetComplete({
            exerciseIndex: 0,
            setIndex: 0,
        }));
        expect(state.workout.exercises[0].sets[0].completed).toBe(false);
    });

    // --- addSet ---

    test('should handle addSet', () => {
        const activeState = createActiveSessionState();
        const originalSetsCount = activeState.workout.exercises[0].sets.length;

        const state = sessionReducer(activeState, addSet(0));

        expect(state.workout.exercises[0].sets.length).toBe(originalSetsCount + 1);
        const newSet = state.workout.exercises[0].sets[originalSetsCount];
        expect(newSet.setNumber).toBe(originalSetsCount + 1);
        expect(newSet.completed).toBe(false);
    });

    test('addSet should copy weight/reps from last set', () => {
        const activeState = createActiveSessionState();
        // Update last set to have specific values
        activeState.workout.exercises[0].sets[2].weight = 40;
        activeState.workout.exercises[0].sets[2].reps = 8;

        const state = sessionReducer(activeState, addSet(0));

        const newSet = state.workout.exercises[0].sets[3];
        expect(newSet.weight).toBe(40);
        expect(newSet.reps).toBe(8);
    });

    // --- removeSet ---

    test('should handle removeSet', () => {
        const activeState = createActiveSessionState();

        const state = sessionReducer(activeState, removeSet({
            exerciseIndex: 0,
            setIndex: 1,
        }));

        expect(state.workout.exercises[0].sets.length).toBe(2);
        // Set numbers should be renumbered
        expect(state.workout.exercises[0].sets[0].setNumber).toBe(1);
        expect(state.workout.exercises[0].sets[1].setNumber).toBe(2);
    });

    test('should not remove last remaining set', () => {
        const activeState = createActiveSessionState();
        // Reduce to 1 set
        activeState.workout.exercises[0].sets = [{ setNumber: 1, weight: 0, reps: 10, completed: false }];

        const state = sessionReducer(activeState, removeSet({
            exerciseIndex: 0,
            setIndex: 0,
        }));

        // Should still have 1 set (cannot remove last)
        expect(state.workout.exercises[0].sets.length).toBe(1);
    });

    // --- setCurrentExercise ---

    test('should handle setCurrentExercise', () => {
        const activeState = createActiveSessionState();

        const state = sessionReducer(activeState, setCurrentExercise(1));
        expect(state.currentExerciseIndex).toBe(1);
    });

    // --- endSession ---

    test('should handle endSession', () => {
        const activeState = createActiveSessionState();

        const state = sessionReducer(activeState, endSession());

        expect(state.active).toBe(false);
        expect(state.workout).toBeNull();
        expect(state.startedAt).toBeNull();
        expect(state.currentExerciseIndex).toBe(0);
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('strenvy_active_session');
    });
});

// Helper to create an active session state for testing
function createActiveSessionState() {
    return {
        active: true,
        startedAt: '2026-02-10T10:00:00.000Z',
        currentExerciseIndex: 0,
        workout: {
            name: 'Test Workout',
            programId: 'prog-1',
            exercises: [
                {
                    id: 'e1',
                    name: 'Push-up',
                    bodyPart: 'chest',
                    target: 'pectorals',
                    secondaryMuscles: [],
                    localGif: '',
                    rest: 60,
                    sets: [
                        { setNumber: 1, weight: 0, reps: 10, completed: false },
                        { setNumber: 2, weight: 0, reps: 10, completed: false },
                        { setNumber: 3, weight: 0, reps: 10, completed: false },
                    ],
                },
                {
                    id: 'e2',
                    name: 'Squat',
                    bodyPart: 'upper legs',
                    target: 'quads',
                    secondaryMuscles: [],
                    localGif: '',
                    rest: 90,
                    sets: [
                        { setNumber: 1, weight: 0, reps: 12, completed: false },
                        { setNumber: 2, weight: 0, reps: 12, completed: false },
                    ],
                },
            ],
        },
    };
}
