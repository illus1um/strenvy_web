import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, authFetch } from '../../utils/api';

export const fetchHistory = createAsyncThunk(
    'progress/fetchHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authFetch(api.history);
            if (!response.ok) throw new Error('Failed to fetch workout history');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const logWorkout = createAsyncThunk(
    'progress/logWorkout',
    async (workoutData, { rejectWithValue }) => {
        try {
            const response = await authFetch(api.history, {
                method: 'POST',
                body: JSON.stringify(workoutData),
            });
            if (!response.ok) throw new Error('Failed to log workout');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateWorkoutLog = createAsyncThunk(
    'progress/updateWorkoutLog',
    async ({ id, ...updates }, { rejectWithValue }) => {
        try {
            const response = await authFetch(`${api.history}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update workout log');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteWorkoutLog = createAsyncThunk(
    'progress/deleteWorkoutLog',
    async (id, { rejectWithValue }) => {
        try {
            const response = await authFetch(`${api.history}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete workout log');
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const calculateStats = (history) => {
    const totalWorkouts = history.length;
    const totalExercises = history.reduce((acc, w) => acc + (w.exercises?.length || 0), 0);
    const totalVolume = history.reduce((acc, w) => {
        return acc + (w.exercises?.reduce((eAcc, e) => {
            return eAcc + (e.sets?.reduce((sAcc, s) => sAcc + (s.weight || 0) * (s.reps || 0), 0) || 0);
        }, 0) || 0);
    }, 0);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedHistory = [...history].sort((a, b) =>
        new Date(b.completedAt) - new Date(a.completedAt)
    );

    for (let i = 0; i < sortedHistory.length; i++) {
        const workoutDate = new Date(sortedHistory[i].completedAt);
        workoutDate.setHours(0, 0, 0, 0);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (workoutDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else if (i === 0) {
            expectedDate.setDate(today.getDate() - 1);
            if (workoutDate.getTime() === expectedDate.getTime()) {
                streak++;
            } else {
                break;
            }
        } else {
            break;
        }
    }

    return { totalWorkouts, totalExercises, totalVolume, streak };
};

const initialState = {
    workoutHistory: [],
    stats: {
        totalWorkouts: 0,
        totalExercises: 0,
        totalVolume: 0,
        streak: 0,
    },
    loading: false,
    error: null,
};

const progressSlice = createSlice({
    name: 'progress',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchHistory.fulfilled, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload)) {
                    state.workoutHistory = action.payload;
                    state.stats = calculateStats(action.payload);
                } else {
                    state.workoutHistory = [];
                    state.stats = calculateStats([]);
                }
            })
            .addCase(logWorkout.fulfilled, (state, action) => {
                state.workoutHistory.push(action.payload);
                state.stats = calculateStats(state.workoutHistory);
            })
            .addCase(updateWorkoutLog.fulfilled, (state, action) => {
                const index = state.workoutHistory.findIndex(w => w.id === action.payload.id);
                if (index !== -1) {
                    state.workoutHistory[index] = action.payload;
                    state.stats = calculateStats(state.workoutHistory);
                }
            })
            .addCase(deleteWorkoutLog.fulfilled, (state, action) => {
                state.workoutHistory = state.workoutHistory.filter(w => w.id !== action.payload);
                state.stats = calculateStats(state.workoutHistory);
            });
    },
});

export const selectWorkoutsByDateRange = (state, startDate, endDate) => {
    return state.progress.workoutHistory.filter(w => {
        const date = new Date(w.completedAt);
        return date >= startDate && date <= endDate;
    });
};

export const selectMuscleGroupDistribution = (state) => {
    const distribution = {};
    state.progress.workoutHistory.forEach(workout => {
        workout.exercises?.forEach(exercise => {
            const target = exercise.target || 'other';
            distribution[target] = (distribution[target] || 0) + 1;
        });
    });
    return distribution;
};

export default progressSlice.reducer;
