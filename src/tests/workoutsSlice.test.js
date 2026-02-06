import { describe, test, expect, beforeEach, vi } from 'vitest';
import workoutsReducer, {
    addWorkout,
    updateWorkout,
    deleteWorkout,
    setCurrentWorkout,
    setEditingWorkout,
    clearEditingWorkout,
} from '../store/slices/workoutsSlice';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('workoutsSlice', () => {
    const initialState = {
        items: [],
        currentWorkout: null,
        editingWorkout: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should return the initial state', () => {
        expect(workoutsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    test('should handle addWorkout', () => {
        const workout = {
            name: 'Morning Routine',
            exercises: [{ id: '1', name: 'Push-up', sets: 3, reps: 10 }],
        };

        const state = workoutsReducer(initialState, addWorkout(workout));

        expect(state.items.length).toBe(1);
        expect(state.items[0].name).toBe('Morning Routine');
        expect(state.items[0].id).toBeDefined();
        expect(state.items[0].createdAt).toBeDefined();
    });

    test('should handle updateWorkout', () => {
        const stateWithWorkout = {
            ...initialState,
            items: [{
                id: '123',
                name: 'Original Name',
                exercises: [],
                createdAt: '2024-01-01',
            }],
        };

        const state = workoutsReducer(
            stateWithWorkout,
            updateWorkout({ id: '123', name: 'Updated Name' })
        );

        expect(state.items[0].name).toBe('Updated Name');
        expect(state.items[0].id).toBe('123');
    });

    test('should handle deleteWorkout', () => {
        const stateWithWorkouts = {
            ...initialState,
            items: [
                { id: '1', name: 'Workout A' },
                { id: '2', name: 'Workout B' },
            ],
        };

        const state = workoutsReducer(stateWithWorkouts, deleteWorkout('1'));

        expect(state.items.length).toBe(1);
        expect(state.items[0].id).toBe('2');
    });

    test('should handle setCurrentWorkout', () => {
        const workout = { id: '1', name: 'Active Workout' };
        const state = workoutsReducer(initialState, setCurrentWorkout(workout));

        expect(state.currentWorkout).toEqual(workout);
    });

    test('should handle setEditingWorkout and clearEditingWorkout', () => {
        const workout = { id: '1', name: 'Editing Workout' };

        let state = workoutsReducer(initialState, setEditingWorkout(workout));
        expect(state.editingWorkout).toEqual(workout);

        state = workoutsReducer(state, clearEditingWorkout());
        expect(state.editingWorkout).toBeNull();
    });

    test('should not update non-existent workout', () => {
        const stateWithWorkout = {
            ...initialState,
            items: [{ id: '1', name: 'Existing' }],
        };

        const state = workoutsReducer(
            stateWithWorkout,
            updateWorkout({ id: 'non-existent', name: 'Updated' })
        );

        expect(state.items.length).toBe(1);
        expect(state.items[0].name).toBe('Existing');
    });
});
