import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, authFetch } from '../../utils/api';

export const fetchWorkouts = createAsyncThunk(
    'workouts/fetchWorkouts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authFetch(api.workouts);
            if (!response.ok) throw new Error('Failed to fetch workout templates');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createWorkout = createAsyncThunk(
    'workouts/createWorkout',
    async (workoutData, { rejectWithValue }) => {
        try {
            const response = await authFetch(api.workouts, {
                method: 'POST',
                body: JSON.stringify(workoutData),
            });
            if (!response.ok) throw new Error('Failed to create workout template');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const editWorkout = createAsyncThunk(
    'workouts/editWorkout',
    async ({ id, ...updates }, { rejectWithValue }) => {
        try {
            const response = await authFetch(`${api.workouts}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update workout template');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeWorkout = createAsyncThunk(
    'workouts/removeWorkout',
    async (id, { rejectWithValue }) => {
        try {
            const response = await authFetch(`${api.workouts}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete workout template');
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    items: [],
    currentWorkout: null,
    editingWorkout: null,
    loading: false,
    error: null,
};

const workoutsSlice = createSlice({
    name: 'workouts',
    initialState,
    reducers: {
        setCurrentWorkout: (state, action) => {
            state.currentWorkout = action.payload;
        },
        setEditingWorkout: (state, action) => {
            state.editingWorkout = action.payload;
        },
        clearEditingWorkout: (state) => {
            state.editingWorkout = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkouts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWorkouts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchWorkouts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createWorkout.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(editWorkout.fulfilled, (state, action) => {
                const index = state.items.findIndex(w => w.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(removeWorkout.fulfilled, (state, action) => {
                state.items = state.items.filter(w => w.id !== action.payload);
            });
    },
});

export const {
    setCurrentWorkout,
    setEditingWorkout,
    clearEditingWorkout,
} = workoutsSlice.actions;

export default workoutsSlice.reducer;
