import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, authFetch } from '../../utils/api';

export const registerUser = createAsyncThunk(
    'user/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${api.auth}/register`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const loginUser = createAsyncThunk(
    'user/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${api.auth}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }
            return data.user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const checkAuth = createAsyncThunk(
    'user/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${api.auth}/me`, {
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Not authenticated');
            }
            const data = await response.json();
            return data.user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'user/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authFetch(`${api.auth}/logout`, { method: 'POST' });
            return null;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const verifyEmail = createAsyncThunk(
    'user/verifyEmail',
    async (token, { rejectWithValue }) => {
        try {
            const response = await fetch(`${api.auth}/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Verification failed');
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const forgotPassword = createAsyncThunk(
    'user/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await fetch(`${api.auth}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const resetPassword = createAsyncThunk(
    'user/resetPassword',
    async ({ token, password }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${api.auth}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Reset failed');
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const resendVerification = createAsyncThunk(
    'user/resendVerification',
    async (email, { rejectWithValue }) => {
        try {
            const response = await fetch(`${api.auth}/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async (updates, { rejectWithValue }) => {
        try {
            const response = await authFetch(`${api.user}/profile`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update profile');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUserPreferences = createAsyncThunk(
    'user/updatePreferences',
    async (prefs, { rejectWithValue }) => {
        try {
            const response = await authFetch(`${api.user}/preferences`, {
                method: 'PUT',
                body: JSON.stringify(prefs),
            });
            if (!response.ok) throw new Error('Failed to update preferences');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const setUserGoals = createAsyncThunk(
    'user/setGoals',
    async (goals, { rejectWithValue }) => {
        try {
            const response = await authFetch(`${api.user}/goals`, {
                method: 'PUT',
                body: JSON.stringify(goals),
            });
            if (!response.ok) throw new Error('Failed to update goals');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    currentUser: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
    authChecked: false,
    error: null,
    message: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearMessage: (state) => {
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload;
                state.isAuthenticated = true;
                state.isAdmin = action.payload.role === 'admin';
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Check Auth
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.currentUser = action.payload;
                state.isAuthenticated = true;
                state.isAdmin = action.payload.role === 'admin';
                state.authChecked = true;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.currentUser = null;
                state.isAuthenticated = false;
                state.isAdmin = false;
                state.authChecked = true;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.currentUser = null;
                state.isAuthenticated = false;
                state.isAdmin = false;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.currentUser = null;
                state.isAuthenticated = false;
                state.isAdmin = false;
            })
            // Verify Email
            .addCase(verifyEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Forgot Password
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload.message;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Profile Updates
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.currentUser = action.payload;
            })
            .addCase(updateUserPreferences.fulfilled, (state, action) => {
                state.currentUser = action.payload;
            })
            .addCase(setUserGoals.fulfilled, (state, action) => {
                state.currentUser = action.payload;
            });
    },
});

export const { clearError, clearMessage } = userSlice.actions;
export default userSlice.reducer;
