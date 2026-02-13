import { describe, test, expect } from 'vitest';
import userReducer, {
    clearError,
    clearMessage,
    registerUser,
    loginUser,
    checkAuth,
    logoutUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateUserProfile,
    updateUserPreferences,
    setUserGoals,
} from '../store/slices/userSlice';

describe('userSlice', () => {
    const initialState = {
        currentUser: null,
        isAuthenticated: false,
        isAdmin: false,
        loading: false,
        authChecked: false,
        error: null,
        message: null,
    };

    // --- Initial State ---

    test('should return the initial state', () => {
        const state = userReducer(undefined, { type: 'unknown' });
        expect(state.currentUser).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isAdmin).toBe(false);
        expect(state.loading).toBe(false);
        expect(state.authChecked).toBe(false);
        expect(state.error).toBeNull();
        expect(state.message).toBeNull();
    });

    // --- Sync Reducers ---

    test('should handle clearError', () => {
        const stateWithError = { ...initialState, error: 'Some error' };
        const state = userReducer(stateWithError, clearError());
        expect(state.error).toBeNull();
    });

    test('should handle clearMessage', () => {
        const stateWithMessage = { ...initialState, message: 'Some message' };
        const state = userReducer(stateWithMessage, clearMessage());
        expect(state.message).toBeNull();
    });

    // --- registerUser ---

    test('should handle registerUser.pending', () => {
        const action = { type: registerUser.pending.type };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.message).toBeNull();
    });

    test('should handle registerUser.fulfilled', () => {
        const action = {
            type: registerUser.fulfilled.type,
            payload: { message: 'Verification email sent' },
        };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.message).toBe('Verification email sent');
    });

    test('should handle registerUser.rejected', () => {
        const action = { type: registerUser.rejected.type, payload: 'Email already exists' };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Email already exists');
    });

    // --- loginUser ---

    test('should handle loginUser.pending', () => {
        const action = { type: loginUser.pending.type };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    test('should handle loginUser.fulfilled for regular user', () => {
        const user = { id: '1', name: 'John', email: 'john@test.com', role: 'user' };
        const action = { type: loginUser.fulfilled.type, payload: user };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.currentUser).toEqual(user);
        expect(state.isAuthenticated).toBe(true);
        expect(state.isAdmin).toBe(false);
    });

    test('should handle loginUser.fulfilled for admin user', () => {
        const admin = { id: '2', name: 'Admin', email: 'admin@test.com', role: 'admin' };
        const action = { type: loginUser.fulfilled.type, payload: admin };
        const state = userReducer(initialState, action);

        expect(state.isAuthenticated).toBe(true);
        expect(state.isAdmin).toBe(true);
    });

    test('should handle loginUser.rejected', () => {
        const action = { type: loginUser.rejected.type, payload: 'Invalid credentials' };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Invalid credentials');
        expect(state.isAuthenticated).toBe(false);
    });

    // --- checkAuth ---

    test('should handle checkAuth.fulfilled', () => {
        const user = { id: '1', name: 'John', role: 'user' };
        const action = { type: checkAuth.fulfilled.type, payload: user };
        const state = userReducer(initialState, action);

        expect(state.currentUser).toEqual(user);
        expect(state.isAuthenticated).toBe(true);
        expect(state.authChecked).toBe(true);
        expect(state.isAdmin).toBe(false);
    });

    test('should handle checkAuth.fulfilled for admin', () => {
        const admin = { id: '2', name: 'Admin', role: 'admin' };
        const action = { type: checkAuth.fulfilled.type, payload: admin };
        const state = userReducer(initialState, action);

        expect(state.isAdmin).toBe(true);
        expect(state.authChecked).toBe(true);
    });

    test('should handle checkAuth.rejected', () => {
        const action = { type: checkAuth.rejected.type, payload: 'Not authenticated' };
        const state = userReducer(initialState, action);

        expect(state.currentUser).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isAdmin).toBe(false);
        expect(state.authChecked).toBe(true);
    });

    // --- logoutUser ---

    test('should handle logoutUser.fulfilled', () => {
        const authenticatedState = {
            ...initialState,
            currentUser: { id: '1', name: 'John' },
            isAuthenticated: true,
            isAdmin: false,
            authChecked: true,
        };

        const action = { type: logoutUser.fulfilled.type };
        const state = userReducer(authenticatedState, action);

        expect(state.currentUser).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.isAdmin).toBe(false);
    });

    test('should handle logoutUser.rejected (still logs out)', () => {
        const authenticatedState = {
            ...initialState,
            currentUser: { id: '1', name: 'John' },
            isAuthenticated: true,
        };

        const action = { type: logoutUser.rejected.type };
        const state = userReducer(authenticatedState, action);

        expect(state.currentUser).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });

    // --- verifyEmail ---

    test('should handle verifyEmail.pending', () => {
        const action = { type: verifyEmail.pending.type };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    test('should handle verifyEmail.fulfilled', () => {
        const action = {
            type: verifyEmail.fulfilled.type,
            payload: { message: 'Email verified successfully' },
        };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.message).toBe('Email verified successfully');
    });

    test('should handle verifyEmail.rejected', () => {
        const action = { type: verifyEmail.rejected.type, payload: 'Invalid token' };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Invalid token');
    });

    // --- forgotPassword ---

    test('should handle forgotPassword.pending', () => {
        const action = { type: forgotPassword.pending.type };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.message).toBeNull();
    });

    test('should handle forgotPassword.fulfilled', () => {
        const action = {
            type: forgotPassword.fulfilled.type,
            payload: { message: 'Reset email sent' },
        };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.message).toBe('Reset email sent');
    });

    test('should handle forgotPassword.rejected', () => {
        const action = { type: forgotPassword.rejected.type, payload: 'User not found' };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe('User not found');
    });

    // --- resetPassword ---

    test('should handle resetPassword.pending', () => {
        const action = { type: resetPassword.pending.type };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
        expect(state.message).toBeNull();
    });

    test('should handle resetPassword.fulfilled', () => {
        const action = {
            type: resetPassword.fulfilled.type,
            payload: { message: 'Password reset successfully' },
        };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.message).toBe('Password reset successfully');
    });

    test('should handle resetPassword.rejected', () => {
        const action = { type: resetPassword.rejected.type, payload: 'Token expired' };
        const state = userReducer(initialState, action);

        expect(state.loading).toBe(false);
        expect(state.error).toBe('Token expired');
    });

    // --- Profile Updates ---

    test('should handle updateUserProfile.fulfilled', () => {
        const authenticatedState = {
            ...initialState,
            currentUser: { id: '1', name: 'John', email: 'john@test.com' },
            isAuthenticated: true,
        };

        const updatedUser = { id: '1', name: 'John Updated', email: 'john@test.com' };
        const action = { type: updateUserProfile.fulfilled.type, payload: updatedUser };
        const state = userReducer(authenticatedState, action);

        expect(state.currentUser.name).toBe('John Updated');
    });

    test('should handle updateUserPreferences.fulfilled', () => {
        const authenticatedState = {
            ...initialState,
            currentUser: { id: '1', name: 'John', preferences: { units: 'kg' } },
            isAuthenticated: true,
        };

        const updatedUser = { id: '1', name: 'John', preferences: { units: 'lbs' } };
        const action = { type: updateUserPreferences.fulfilled.type, payload: updatedUser };
        const state = userReducer(authenticatedState, action);

        expect(state.currentUser.preferences.units).toBe('lbs');
    });

    test('should handle setUserGoals.fulfilled', () => {
        const authenticatedState = {
            ...initialState,
            currentUser: { id: '1', name: 'John', goals: null },
            isAuthenticated: true,
        };

        const updatedUser = {
            id: '1',
            name: 'John',
            goals: { weeklyWorkouts: 4, targetWeight: 80 },
        };
        const action = { type: setUserGoals.fulfilled.type, payload: updatedUser };
        const state = userReducer(authenticatedState, action);

        expect(state.currentUser.goals.weeklyWorkouts).toBe(4);
        expect(state.currentUser.goals.targetWeight).toBe(80);
    });
});
