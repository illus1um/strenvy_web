import { createSlice } from '@reduxjs/toolkit';

// Load workouts from localStorage
const loadWorkouts = () => {
    try {
        const saved = localStorage.getItem('strenvy_workouts');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

// Save workouts to localStorage
const saveWorkouts = (workouts) => {
    localStorage.setItem('strenvy_workouts', JSON.stringify(workouts));
};

const initialState = {
    items: loadWorkouts(),
    currentWorkout: null,
    editingWorkout: null,
};

const workoutsSlice = createSlice({
    name: 'workouts',
    initialState,
    reducers: {
        addWorkout: (state, action) => {
            const workout = {
                ...action.payload,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
            };
            state.items.push(workout);
            saveWorkouts(state.items);
        },
        updateWorkout: (state, action) => {
            const index = state.items.findIndex(w => w.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = { ...state.items[index], ...action.payload };
                saveWorkouts(state.items);
            }
        },
        deleteWorkout: (state, action) => {
            state.items = state.items.filter(w => w.id !== action.payload);
            saveWorkouts(state.items);
        },
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
});

export const {
    addWorkout,
    updateWorkout,
    deleteWorkout,
    setCurrentWorkout,
    setEditingWorkout,
    clearEditingWorkout,
} = workoutsSlice.actions;

export default workoutsSlice.reducer;
