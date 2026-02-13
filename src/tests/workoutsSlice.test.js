import { describe, test, expect } from 'vitest';
import workoutsReducer, {
    setCurrentWorkout,
    setEditingWorkout,
    clearEditingWorkout,
    fetchWorkouts,
    createWorkout,
    editWorkout,
    removeWorkout,
} from '../store/slices/workoutsSlice';

describe('workoutsSlice', () => {
    const initialState = {
        items: [],
        currentWorkout: null,
        editingWorkout: null,
        loading: false,
        error: null,
    };

    // --- Initial State ---

    test('should return the initial state', () => {
        const state = workoutsReducer(undefined, { type: 'unknown' });
        expect(state.items).toEqual([]);
        expect(state.currentWorkout).toBeNull();
        expect(state.editingWorkout).toBeNull();
        expect(state.loading).toBe(false);
    });

    // --- Sync Reducers ---

    test('should handle setCurrentWorkout', () => {
        const workout = { id: '1', name: 'Active Workout' };
        const state = workoutsReducer(initialState, setCurrentWorkout(workout));
        expect(state.currentWorkout).toEqual(workout);
    });

    test('should handle setEditingWorkout', () => {
        const workout = { id: '1', name: 'Editing Workout' };
        const state = workoutsReducer(initialState, setEditingWorkout(workout));
        expect(state.editingWorkout).toEqual(workout);
    });

    test('should handle clearEditingWorkout', () => {
        const stateWithEditing = {
            ...initialState,
            editingWorkout: { id: '1', name: 'Editing' },
        };
        const state = workoutsReducer(stateWithEditing, clearEditingWorkout());
        expect(state.editingWorkout).toBeNull();
    });

    test('should handle setEditingWorkout then clearEditingWorkout', () => {
        const workout = { id: '1', name: 'Editing Workout' };
        let state = workoutsReducer(initialState, setEditingWorkout(workout));
        expect(state.editingWorkout).toEqual(workout);

        state = workoutsReducer(state, clearEditingWorkout());
        expect(state.editingWorkout).toBeNull();
    });

    // --- fetchWorkouts ---

    test('should handle fetchWorkouts.pending', () => {
        const action = { type: fetchWorkouts.pending.type };
        const state = workoutsReducer(initialState, action);
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    test('should handle fetchWorkouts.fulfilled', () => {
        const workouts = [
            { id: '1', name: 'Workout A', exercises: [] },
            { id: '2', name: 'Workout B', exercises: [] },
        ];
        const action = { type: fetchWorkouts.fulfilled.type, payload: workouts };
        const state = workoutsReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.items.length).toBe(2);
        expect(state.items[0].name).toBe('Workout A');
    });

    test('should handle fetchWorkouts.rejected', () => {
        const action = { type: fetchWorkouts.rejected.type, payload: 'Server error' };
        const state = workoutsReducer(initialState, action);
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Server error');
    });

    // --- createWorkout ---

    test('should handle createWorkout.fulfilled', () => {
        const newWorkout = { id: '1', name: 'New Workout', exercises: [] };
        const action = { type: createWorkout.fulfilled.type, payload: newWorkout };
        const state = workoutsReducer(initialState, action);

        expect(state.items.length).toBe(1);
        expect(state.items[0].name).toBe('New Workout');
    });

    test('should append to existing items on createWorkout', () => {
        const stateWithItems = {
            ...initialState,
            items: [{ id: '1', name: 'Existing' }],
        };
        const newWorkout = { id: '2', name: 'New One' };
        const action = { type: createWorkout.fulfilled.type, payload: newWorkout };
        const state = workoutsReducer(stateWithItems, action);

        expect(state.items.length).toBe(2);
    });

    // --- editWorkout ---

    test('should handle editWorkout.fulfilled', () => {
        const stateWithItems = {
            ...initialState,
            items: [
                { id: '1', name: 'Original', exercises: [] },
            ],
        };

        const updated = { id: '1', name: 'Updated Name', exercises: [{ id: 'e1' }] };
        const action = { type: editWorkout.fulfilled.type, payload: updated };
        const state = workoutsReducer(stateWithItems, action);

        expect(state.items[0].name).toBe('Updated Name');
        expect(state.items[0].exercises.length).toBe(1);
    });

    test('should not modify items if editWorkout id not found', () => {
        const stateWithItems = {
            ...initialState,
            items: [{ id: '1', name: 'Existing' }],
        };

        const updated = { id: 'non-existent', name: 'Updated' };
        const action = { type: editWorkout.fulfilled.type, payload: updated };
        const state = workoutsReducer(stateWithItems, action);

        expect(state.items.length).toBe(1);
        expect(state.items[0].name).toBe('Existing');
    });

    // --- removeWorkout ---

    test('should handle removeWorkout.fulfilled', () => {
        const stateWithItems = {
            ...initialState,
            items: [
                { id: '1', name: 'Workout A' },
                { id: '2', name: 'Workout B' },
            ],
        };

        const action = { type: removeWorkout.fulfilled.type, payload: '1' };
        const state = workoutsReducer(stateWithItems, action);

        expect(state.items.length).toBe(1);
        expect(state.items[0].id).toBe('2');
    });

    test('should handle removing last workout', () => {
        const stateWithItems = {
            ...initialState,
            items: [{ id: '1', name: 'Last One' }],
        };

        const action = { type: removeWorkout.fulfilled.type, payload: '1' };
        const state = workoutsReducer(stateWithItems, action);

        expect(state.items.length).toBe(0);
    });
});
