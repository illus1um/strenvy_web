import { createSlice } from '@reduxjs/toolkit';

// Load progress from localStorage
const loadProgress = () => {
    try {
        const saved = localStorage.getItem('strenvy_progress');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const saveProgress = (progress) => {
    localStorage.setItem('strenvy_progress', JSON.stringify(progress));
};

const initialState = {
    workoutHistory: loadProgress(),
    stats: {
        totalWorkouts: 0,
        totalExercises: 0,
        totalVolume: 0,
        streak: 0,
    },
};

// Calculate stats from workout history
const calculateStats = (history) => {
    const totalWorkouts = history.length;
    const totalExercises = history.reduce((acc, w) => acc + (w.exercises?.length || 0), 0);
    const totalVolume = history.reduce((acc, w) => {
        return acc + (w.exercises?.reduce((eAcc, e) => {
            return eAcc + (e.sets?.reduce((sAcc, s) => sAcc + (s.weight || 0) * (s.reps || 0), 0) || 0);
        }, 0) || 0);
    }, 0);

    // Calculate streak
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
        } else {
            break;
        }
    }

    return { totalWorkouts, totalExercises, totalVolume, streak };
};

const progressSlice = createSlice({
    name: 'progress',
    initialState: {
        ...initialState,
        stats: calculateStats(initialState.workoutHistory),
    },
    reducers: {
        logWorkout: (state, action) => {
            const entry = {
                ...action.payload,
                id: Date.now().toString(),
                completedAt: new Date().toISOString(),
            };
            state.workoutHistory.push(entry);
            state.stats = calculateStats(state.workoutHistory);
            saveProgress(state.workoutHistory);
        },
        updateWorkoutLog: (state, action) => {
            const index = state.workoutHistory.findIndex(w => w.id === action.payload.id);
            if (index !== -1) {
                state.workoutHistory[index] = { ...state.workoutHistory[index], ...action.payload };
                state.stats = calculateStats(state.workoutHistory);
                saveProgress(state.workoutHistory);
            }
        },
        deleteWorkoutLog: (state, action) => {
            state.workoutHistory = state.workoutHistory.filter(w => w.id !== action.payload);
            state.stats = calculateStats(state.workoutHistory);
            saveProgress(state.workoutHistory);
        },
    },
});

// Selectors
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

export const { logWorkout, updateWorkoutLog, deleteWorkoutLog } = progressSlice.actions;
export default progressSlice.reducer;
