import { describe, test, expect, beforeEach, vi } from 'vitest';
import programsReducer, {
    setActiveProgram,
    clearActiveProgram,
    setEditingProgram,
    fetchPrograms,
    createProgram,
    editProgram,
    removeProgram,
} from '../store/slices/programsSlice';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('programsSlice', () => {
    const initialState = {
        adminPrograms: [],
        userPrograms: [],
        activeProgram: null,
        editingProgram: null,
        loading: false,
        error: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // --- Sync Reducers ---

    test('should return the initial state', () => {
        const state = programsReducer(undefined, { type: 'unknown' });
        expect(state.adminPrograms).toEqual([]);
        expect(state.userPrograms).toEqual([]);
        expect(state.activeProgram).toBeNull();
        expect(state.loading).toBe(false);
    });

    test('should handle setActiveProgram for admin program', () => {
        const stateWithPrograms = {
            ...initialState,
            adminPrograms: [
                { id: 'admin-1', name: 'Beginner Full Body', isAdmin: true, duration: 4 },
            ],
        };

        const state = programsReducer(stateWithPrograms, setActiveProgram('admin-1'));

        expect(state.activeProgram).not.toBeNull();
        expect(state.activeProgram.name).toBe('Beginner Full Body');
        expect(state.activeProgram.startDate).toBeDefined();
        expect(state.activeProgram.currentWeek).toBe(1);
        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    test('should handle setActiveProgram for user program', () => {
        const stateWithPrograms = {
            ...initialState,
            userPrograms: [
                { id: 'user-1', name: 'My Program', isAdmin: false, duration: 8 },
            ],
        };

        const state = programsReducer(stateWithPrograms, setActiveProgram('user-1'));

        expect(state.activeProgram.name).toBe('My Program');
        expect(state.activeProgram.currentWeek).toBe(1);
    });

    test('should not set active program for non-existent id', () => {
        const state = programsReducer(initialState, setActiveProgram('non-existent'));
        expect(state.activeProgram).toBeNull();
    });

    test('should handle clearActiveProgram', () => {
        const stateWithActive = {
            ...initialState,
            activeProgram: { id: 'admin-1', name: 'Active' },
        };

        const state = programsReducer(stateWithActive, clearActiveProgram());

        expect(state.activeProgram).toBeNull();
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('strenvy_active_program');
    });

    test('should handle setEditingProgram', () => {
        const program = { id: 'user-1', name: 'Edit Me' };
        const state = programsReducer(initialState, setEditingProgram(program));
        expect(state.editingProgram).toEqual(program);
    });

    test('should handle setEditingProgram to null', () => {
        const stateWithEditing = {
            ...initialState,
            editingProgram: { id: 'user-1', name: 'Edit Me' },
        };

        const state = programsReducer(stateWithEditing, setEditingProgram(null));
        expect(state.editingProgram).toBeNull();
    });

    // --- Async Thunk: fetchPrograms ---

    test('should handle fetchPrograms.pending', () => {
        const action = { type: fetchPrograms.pending.type };
        const state = programsReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    test('should handle fetchPrograms.fulfilled with mixed programs', () => {
        const programs = [
            { id: 'admin-1', name: 'Admin Program', isAdmin: true },
            { id: 'user-1', name: 'User Program', isAdmin: false },
            { id: 'admin-2', name: 'Admin Program 2', isAdmin: true },
        ];

        const action = { type: fetchPrograms.fulfilled.type, payload: programs };
        const state = programsReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.adminPrograms.length).toBe(2);
        expect(state.userPrograms.length).toBe(1);
        expect(state.adminPrograms[0].name).toBe('Admin Program');
        expect(state.userPrograms[0].name).toBe('User Program');
    });

    test('should handle fetchPrograms.fulfilled with non-array payload', () => {
        const action = { type: fetchPrograms.fulfilled.type, payload: null };
        const state = programsReducer(initialState, action);

        expect(state.adminPrograms).toEqual([]);
        expect(state.userPrograms).toEqual([]);
    });

    test('should handle fetchPrograms.rejected', () => {
        const action = { type: fetchPrograms.rejected.type, payload: 'Network error' };
        const state = programsReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Network error');
    });

    // --- Async Thunk: createProgram ---

    test('should handle createProgram.fulfilled for user program', () => {
        const newProgram = { id: 'user-2', name: 'New Program', isAdmin: false };
        const action = { type: createProgram.fulfilled.type, payload: newProgram };
        const state = programsReducer(initialState, action);

        expect(state.userPrograms.length).toBe(1);
        expect(state.userPrograms[0].name).toBe('New Program');
    });

    test('should handle createProgram.fulfilled for admin program', () => {
        const newProgram = { id: 'admin-new', name: 'New Admin', isAdmin: true };
        const action = { type: createProgram.fulfilled.type, payload: newProgram };
        const state = programsReducer(initialState, action);

        expect(state.adminPrograms.length).toBe(1);
        expect(state.adminPrograms[0].name).toBe('New Admin');
    });

    // --- Async Thunk: editProgram ---

    test('should handle editProgram.fulfilled', () => {
        const stateWithPrograms = {
            ...initialState,
            userPrograms: [
                { id: 'user-1', name: 'Old Name', isAdmin: false },
            ],
        };

        const updated = { id: 'user-1', name: 'Updated Name', isAdmin: false };
        const action = { type: editProgram.fulfilled.type, payload: updated };
        const state = programsReducer(stateWithPrograms, action);

        expect(state.userPrograms[0].name).toBe('Updated Name');
    });

    test('should update activeProgram when editing the active one', () => {
        const stateWithActive = {
            ...initialState,
            userPrograms: [{ id: 'user-1', name: 'Old', isAdmin: false }],
            activeProgram: { id: 'user-1', name: 'Old', currentWeek: 2 },
        };

        const updated = { id: 'user-1', name: 'New Name', isAdmin: false };
        const action = { type: editProgram.fulfilled.type, payload: updated };
        const state = programsReducer(stateWithActive, action);

        expect(state.activeProgram.name).toBe('New Name');
        expect(state.activeProgram.currentWeek).toBe(2);
    });

    // --- Async Thunk: removeProgram ---

    test('should handle removeProgram.fulfilled', () => {
        const stateWithPrograms = {
            ...initialState,
            userPrograms: [
                { id: 'user-1', name: 'Program A', isAdmin: false },
                { id: 'user-2', name: 'Program B', isAdmin: false },
            ],
        };

        const action = { type: removeProgram.fulfilled.type, payload: 'user-1' };
        const state = programsReducer(stateWithPrograms, action);

        expect(state.userPrograms.length).toBe(1);
        expect(state.userPrograms[0].id).toBe('user-2');
    });

    test('should clear activeProgram when removing the active one', () => {
        const stateWithActive = {
            ...initialState,
            userPrograms: [{ id: 'user-1', name: 'Active', isAdmin: false }],
            activeProgram: { id: 'user-1', name: 'Active' },
        };

        const action = { type: removeProgram.fulfilled.type, payload: 'user-1' };
        const state = programsReducer(stateWithActive, action);

        expect(state.activeProgram).toBeNull();
    });
});
