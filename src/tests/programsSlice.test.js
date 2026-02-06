import { describe, test, expect, beforeEach, vi } from 'vitest';
import programsReducer, {
    addProgram,
    updateProgram,
    deleteProgram,
    setActiveProgram,
    clearActiveProgram,
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
    const mockAdminPrograms = [
        {
            id: 'admin-1',
            name: 'Beginner Full Body',
            duration: 4,
            daysPerWeek: ['monday', 'wednesday', 'friday'],
            isAdmin: true,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should have admin programs in initial state', () => {
        const state = programsReducer(undefined, { type: 'unknown' });

        expect(state.adminPrograms.length).toBeGreaterThan(0);
        expect(state.adminPrograms[0].isAdmin).toBe(true);
    });

    test('should handle addProgram', () => {
        const initialState = {
            adminPrograms: mockAdminPrograms,
            userPrograms: [],
            activeProgram: null,
            editingProgram: null,
        };

        const newProgram = {
            name: 'My Custom Program',
            duration: 8,
            daysPerWeek: ['monday', 'tuesday', 'thursday', 'friday'],
            schedule: {},
        };

        const state = programsReducer(initialState, addProgram(newProgram));

        expect(state.userPrograms.length).toBe(1);
        expect(state.userPrograms[0].name).toBe('My Custom Program');
        expect(state.userPrograms[0].isAdmin).toBe(false);
        expect(state.userPrograms[0].id).toBeDefined();
        expect(state.userPrograms[0].createdAt).toBeDefined();
    });

    test('should handle updateProgram', () => {
        const initialState = {
            adminPrograms: mockAdminPrograms,
            userPrograms: [{
                id: 'user-1',
                name: 'Original Name',
                duration: 4,
                daysPerWeek: [],
                isAdmin: false,
            }],
            activeProgram: null,
            editingProgram: null,
        };

        const state = programsReducer(
            initialState,
            updateProgram({ id: 'user-1', name: 'Updated Name', duration: 6 })
        );

        expect(state.userPrograms[0].name).toBe('Updated Name');
        expect(state.userPrograms[0].duration).toBe(6);
    });

    test('should handle deleteProgram', () => {
        const initialState = {
            adminPrograms: mockAdminPrograms,
            userPrograms: [
                { id: 'user-1', name: 'Program A', isAdmin: false },
                { id: 'user-2', name: 'Program B', isAdmin: false },
            ],
            activeProgram: null,
            editingProgram: null,
        };

        const state = programsReducer(initialState, deleteProgram('user-1'));

        expect(state.userPrograms.length).toBe(1);
        expect(state.userPrograms[0].id).toBe('user-2');
    });

    test('should clear active program when deleted', () => {
        const initialState = {
            adminPrograms: mockAdminPrograms,
            userPrograms: [{ id: 'user-1', name: 'Active Program', isAdmin: false }],
            activeProgram: { id: 'user-1', name: 'Active Program' },
            editingProgram: null,
        };

        const state = programsReducer(initialState, deleteProgram('user-1'));

        expect(state.activeProgram).toBeNull();
    });

    test('should handle setActiveProgram for admin program', () => {
        const initialState = {
            adminPrograms: mockAdminPrograms,
            userPrograms: [],
            activeProgram: null,
            editingProgram: null,
        };

        const state = programsReducer(initialState, setActiveProgram('admin-1'));

        expect(state.activeProgram).not.toBeNull();
        expect(state.activeProgram.name).toBe('Beginner Full Body');
        expect(state.activeProgram.startDate).toBeDefined();
        expect(state.activeProgram.currentWeek).toBe(1);
    });

    test('should handle clearActiveProgram', () => {
        const initialState = {
            adminPrograms: mockAdminPrograms,
            userPrograms: [],
            activeProgram: { id: 'admin-1', name: 'Active' },
            editingProgram: null,
        };

        const state = programsReducer(initialState, clearActiveProgram());

        expect(state.activeProgram).toBeNull();
    });
});
