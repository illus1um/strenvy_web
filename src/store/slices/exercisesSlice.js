import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper to extract image ID from URL
const getImageId = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
};

// Async thunk to load exercises
export const fetchExercises = createAsyncThunk(
    'exercises/fetchExercises',
    async (_, { rejectWithValue }) => {
        try {
            const response = await import('../../data/exercises.json');
            return response.default.map(exercise => ({
                ...exercise,
                localGif: `/gifs/${getImageId(exercise.gifUrl)}.gif`,
                localPng: `/gifs/${getImageId(exercise.gifUrl)}.png`,
            }));
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    items: [],
    filtered: [],
    loading: false,
    error: null,
    filters: {
        bodyPart: '',
        equipment: '',
        target: '',
        search: '',
    },
    bodyParts: [],
    equipments: [],
    targets: [],
};

const exercisesSlice = createSlice({
    name: 'exercises',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            const { key, value } = action.payload;
            state.filters[key] = value;
            state.filtered = filterExercises(state.items, state.filters);
        },
        clearFilters: (state) => {
            state.filters = { bodyPart: '', equipment: '', target: '', search: '' };
            state.filtered = state.items;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExercises.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExercises.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.filtered = action.payload;
                // Extract unique values for filters
                state.bodyParts = [...new Set(action.payload.map(e => e.bodyPart))].sort();
                state.equipments = [...new Set(action.payload.map(e => e.equipment))].sort();
                state.targets = [...new Set(action.payload.map(e => e.target))].sort();
            })
            .addCase(fetchExercises.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// Helper function to filter exercises
const filterExercises = (items, filters) => {
    return items.filter(exercise => {
        const matchesBodyPart = !filters.bodyPart || exercise.bodyPart === filters.bodyPart;
        const matchesEquipment = !filters.equipment || exercise.equipment === filters.equipment;
        const matchesTarget = !filters.target || exercise.target === filters.target;
        const matchesSearch = !filters.search ||
            exercise.name.toLowerCase().includes(filters.search.toLowerCase());
        return matchesBodyPart && matchesEquipment && matchesTarget && matchesSearch;
    });
};

export const { setFilter, clearFilters } = exercisesSlice.actions;
export default exercisesSlice.reducer;
