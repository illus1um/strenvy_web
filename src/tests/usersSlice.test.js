import { describe, test, expect } from 'vitest';
import usersReducer, {
    clearError,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
} from '../store/slices/usersSlice';

describe('usersSlice (admin)', () => {
    const initialState = {
        users: [],
        loading: false,
        error: null,
    };

    // --- Initial State ---

    test('should return the initial state', () => {
        const state = usersReducer(undefined, { type: 'unknown' });
        expect(state.users).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
    });

    // --- clearError ---

    test('should handle clearError', () => {
        const stateWithError = { ...initialState, error: 'Something went wrong' };
        const state = usersReducer(stateWithError, clearError());
        expect(state.error).toBeNull();
    });

    // --- fetchUsers ---

    test('should handle fetchUsers.pending', () => {
        const action = { type: fetchUsers.pending.type };
        const state = usersReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    test('should handle fetchUsers.fulfilled', () => {
        const users = [
            { id: '1', name: 'User A', email: 'a@test.com', role: 'user' },
            { id: '2', name: 'User B', email: 'b@test.com', role: 'admin' },
        ];

        const action = { type: fetchUsers.fulfilled.type, payload: users };
        const state = usersReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.users.length).toBe(2);
        expect(state.users[0].name).toBe('User A');
    });

    test('should handle fetchUsers.rejected', () => {
        const action = { type: fetchUsers.rejected.type, payload: 'Unauthorized' };
        const state = usersReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Unauthorized');
    });

    // --- createUser ---

    test('should handle createUser.fulfilled', () => {
        const newUser = { id: '3', name: 'New User', email: 'new@test.com', role: 'user' };
        const action = { type: createUser.fulfilled.type, payload: newUser };
        const state = usersReducer(initialState, action);

        expect(state.users.length).toBe(1);
        expect(state.users[0].name).toBe('New User');
    });

    test('should append to existing users list', () => {
        const stateWithUsers = {
            ...initialState,
            users: [{ id: '1', name: 'Existing' }],
        };

        const newUser = { id: '2', name: 'Another User' };
        const action = { type: createUser.fulfilled.type, payload: newUser };
        const state = usersReducer(stateWithUsers, action);

        expect(state.users.length).toBe(2);
    });

    test('should handle createUser.rejected', () => {
        const action = { type: createUser.rejected.type, payload: 'Email already taken' };
        const state = usersReducer(initialState, action);

        expect(state.error).toBe('Email already taken');
    });

    // --- updateUser ---

    test('should handle updateUser.fulfilled', () => {
        const stateWithUsers = {
            ...initialState,
            users: [
                { id: '1', name: 'Old Name', email: 'test@test.com', role: 'user' },
            ],
        };

        const updated = { id: '1', name: 'New Name', email: 'test@test.com', role: 'admin' };
        const action = { type: updateUser.fulfilled.type, payload: updated };
        const state = usersReducer(stateWithUsers, action);

        expect(state.users[0].name).toBe('New Name');
        expect(state.users[0].role).toBe('admin');
    });

    test('should not modify users if updateUser id not found', () => {
        const stateWithUsers = {
            ...initialState,
            users: [{ id: '1', name: 'Existing' }],
        };

        const updated = { id: 'non-existent', name: 'Updated' };
        const action = { type: updateUser.fulfilled.type, payload: updated };
        const state = usersReducer(stateWithUsers, action);

        expect(state.users[0].name).toBe('Existing');
    });

    test('should handle updateUser.rejected', () => {
        const action = { type: updateUser.rejected.type, payload: 'Failed to update user' };
        const state = usersReducer(initialState, action);

        expect(state.error).toBe('Failed to update user');
    });

    // --- deleteUser ---

    test('should handle deleteUser.fulfilled', () => {
        const stateWithUsers = {
            ...initialState,
            users: [
                { id: '1', name: 'User A' },
                { id: '2', name: 'User B' },
            ],
        };

        const action = { type: deleteUser.fulfilled.type, payload: '1' };
        const state = usersReducer(stateWithUsers, action);

        expect(state.users.length).toBe(1);
        expect(state.users[0].id).toBe('2');
    });

    test('should handle deleting the last user', () => {
        const stateWithUsers = {
            ...initialState,
            users: [{ id: '1', name: 'Only User' }],
        };

        const action = { type: deleteUser.fulfilled.type, payload: '1' };
        const state = usersReducer(stateWithUsers, action);

        expect(state.users.length).toBe(0);
    });

    test('should handle deleteUser.rejected', () => {
        const action = { type: deleteUser.rejected.type, payload: 'Cannot delete admin' };
        const state = usersReducer(initialState, action);

        expect(state.error).toBe('Cannot delete admin');
    });
});
