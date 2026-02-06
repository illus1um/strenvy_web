import { describe, test, expect } from 'vitest';
import exercisesReducer, {
    setFilter,
    clearFilters,
    fetchExercises
} from '../store/slices/exercisesSlice';

describe('exercisesSlice', () => {
    const initialState = {
        items: [],
        filtered: [],
        loading: false,
        error: null,
        filters: {
            bodyPart: '',
            equipment: '',
            target: '',
            search: '',
        },
        bodyParts: [],
        equipments: [],
        targets: [],
    };

    test('should return the initial state', () => {
        expect(exercisesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    test('should handle setFilter', () => {
        const state = {
            ...initialState,
            items: [
                { id: '1', name: 'Push-up', bodyPart: 'chest', equipment: 'body weight', target: 'pectorals' },
                { id: '2', name: 'Squat', bodyPart: 'upper legs', equipment: 'body weight', target: 'quads' },
            ],
            filtered: [
                { id: '1', name: 'Push-up', bodyPart: 'chest', equipment: 'body weight', target: 'pectorals' },
                { id: '2', name: 'Squat', bodyPart: 'upper legs', equipment: 'body weight', target: 'quads' },
            ],
        };

        const newState = exercisesReducer(state, setFilter({ key: 'bodyPart', value: 'chest' }));

        expect(newState.filters.bodyPart).toBe('chest');
        expect(newState.filtered.length).toBe(1);
        expect(newState.filtered[0].name).toBe('Push-up');
    });

    test('should handle clearFilters', () => {
        const state = {
            ...initialState,
            items: [
                { id: '1', name: 'Push-up', bodyPart: 'chest', equipment: 'body weight', target: 'pectorals' },
            ],
            filtered: [],
            filters: {
                bodyPart: 'chest',
                equipment: 'barbell',
                target: 'abs',
                search: 'test',
            },
        };

        const newState = exercisesReducer(state, clearFilters());

        expect(newState.filters).toEqual({
            bodyPart: '',
            equipment: '',
            target: '',
            search: '',
        });
        expect(newState.filtered).toEqual(state.items);
    });

    test('should handle fetchExercises.pending', () => {
        const action = { type: fetchExercises.pending.type };
        const state = exercisesReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    test('should handle fetchExercises.rejected', () => {
        const action = {
            type: fetchExercises.rejected.type,
            payload: 'Network error'
        };
        const state = exercisesReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Network error');
    });

    test('should handle search filter', () => {
        const state = {
            ...initialState,
            items: [
                { id: '1', name: 'Push-up', bodyPart: 'chest', equipment: 'body weight', target: 'pectorals' },
                { id: '2', name: 'Pull-up', bodyPart: 'back', equipment: 'body weight', target: 'lats' },
                { id: '3', name: 'Squat', bodyPart: 'upper legs', equipment: 'body weight', target: 'quads' },
            ],
            filtered: [
                { id: '1', name: 'Push-up', bodyPart: 'chest', equipment: 'body weight', target: 'pectorals' },
                { id: '2', name: 'Pull-up', bodyPart: 'back', equipment: 'body weight', target: 'lats' },
                { id: '3', name: 'Squat', bodyPart: 'upper legs', equipment: 'body weight', target: 'quads' },
            ],
        };

        const newState = exercisesReducer(state, setFilter({ key: 'search', value: 'push' }));

        expect(newState.filtered.length).toBe(1);
        expect(newState.filtered[0].name).toBe('Push-up');
    });

    test('should handle multiple filters combined', () => {
        const state = {
            ...initialState,
            items: [
                { id: '1', name: 'Barbell Squat', bodyPart: 'upper legs', equipment: 'barbell', target: 'quads' },
                { id: '2', name: 'Dumbbell Squat', bodyPart: 'upper legs', equipment: 'dumbbell', target: 'quads' },
                { id: '3', name: 'Push-up', bodyPart: 'chest', equipment: 'body weight', target: 'pectorals' },
            ],
            filtered: [
                { id: '1', name: 'Barbell Squat', bodyPart: 'upper legs', equipment: 'barbell', target: 'quads' },
                { id: '2', name: 'Dumbbell Squat', bodyPart: 'upper legs', equipment: 'dumbbell', target: 'quads' },
                { id: '3', name: 'Push-up', bodyPart: 'chest', equipment: 'body weight', target: 'pectorals' },
            ],
        };

        // First filter by body part
        let newState = exercisesReducer(state, setFilter({ key: 'bodyPart', value: 'upper legs' }));
        expect(newState.filtered.length).toBe(2);

        // Then filter by equipment
        newState = exercisesReducer(newState, setFilter({ key: 'equipment', value: 'barbell' }));
        expect(newState.filtered.length).toBe(1);
        expect(newState.filtered[0].name).toBe('Barbell Squat');
    });
});
