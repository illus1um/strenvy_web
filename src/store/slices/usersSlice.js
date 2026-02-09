import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, authFetch } from '../../utils/api';

export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authFetch(api.users);
            if (!response.ok) throw new Error('Failed to fetch users');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createUser = createAsyncThunk(
    'users/createUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authFetch(api.users, {
                method: 'POST',
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create user');
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async ({ id, ...updates }, { rejectWithValue }) => {
        try {
            const response = await authFetch(`${api.users}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update user');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await authFetch(`${api.users}/${userId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete user');
            return userId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    users: [],
    loading: false,
    error: null,
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.users.push(action.payload);
            })
            .addCase(createUser.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter(u => u.id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearError } = usersSlice.actions;
export default usersSlice.reducer;
