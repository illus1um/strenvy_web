import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'strenvy_active_session';

const loadSession = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
};

const saveSession = (session) => {
    if (session?.active) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
};

const savedSession = loadSession();

const initialState = savedSession || {
    active: false,
    workout: null,
    startedAt: null,
    currentExerciseIndex: 0,
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        startSession: (state, action) => {
            const { name, programId, exercises } = action.payload;

            state.active = true;
            state.startedAt = new Date().toISOString();
            state.currentExerciseIndex = 0;
            state.workout = {
                name,
                programId: programId || null,
                exercises: exercises.map(ex => ({
                    id: ex.id,
                    name: ex.name,
                    bodyPart: ex.bodyPart || '',
                    target: ex.target || '',
                    secondaryMuscles: ex.secondaryMuscles || [],
                    localGif: ex.localGif || '',
                    rest: ex.rest || 60,
                    sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
                        setNumber: i + 1,
                        weight: 0,
                        reps: ex.reps || 10,
                        completed: false,
                    })),
                })),
            };

            saveSession(state);
        },

        updateSet: (state, action) => {
            const { exerciseIndex, setIndex, field, value } = action.payload;
            const exercise = state.workout?.exercises?.[exerciseIndex];
            if (exercise?.sets?.[setIndex]) {
                exercise.sets[setIndex][field] = value;
                saveSession(state);
            }
        },

        toggleSetComplete: (state, action) => {
            const { exerciseIndex, setIndex } = action.payload;
            const exercise = state.workout?.exercises?.[exerciseIndex];
            if (exercise?.sets?.[setIndex]) {
                exercise.sets[setIndex].completed = !exercise.sets[setIndex].completed;
                saveSession(state);
            }
        },

        addSet: (state, action) => {
            const exerciseIndex = action.payload;
            const exercise = state.workout?.exercises?.[exerciseIndex];
            if (exercise) {
                const lastSet = exercise.sets[exercise.sets.length - 1];
                exercise.sets.push({
                    setNumber: exercise.sets.length + 1,
                    weight: lastSet?.weight || 0,
                    reps: lastSet?.reps || 10,
                    completed: false,
                });
                saveSession(state);
            }
        },

        removeSet: (state, action) => {
            const { exerciseIndex, setIndex } = action.payload;
            const exercise = state.workout?.exercises?.[exerciseIndex];
            if (exercise && exercise.sets.length > 1) {
                exercise.sets.splice(setIndex, 1);
                exercise.sets.forEach((s, i) => { s.setNumber = i + 1; });
                saveSession(state);
            }
        },

        setCurrentExercise: (state, action) => {
            state.currentExerciseIndex = action.payload;
            saveSession(state);
        },

        endSession: (state) => {
            state.active = false;
            state.workout = null;
            state.startedAt = null;
            state.currentExerciseIndex = 0;
            localStorage.removeItem(STORAGE_KEY);
        },
    },
});

export const {
    startSession,
    updateSet,
    toggleSetComplete,
    addSet,
    removeSet,
    setCurrentExercise,
    endSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;
