import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, authFetch } from '../../utils/api';

export const fetchPrograms = createAsyncThunk(
    'programs/fetchPrograms',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(api.programs, { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch programs');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createProgram = createAsyncThunk(
    'programs/createProgram',
    async (programData, { rejectWithValue }) => {
        try {
            const response = await authFetch(api.programs, {
                method: 'POST',
                body: JSON.stringify(programData),
            });
            if (!response.ok) throw new Error('Failed to create program');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const editProgram = createAsyncThunk(
    'programs/editProgram',
    async ({ id, ...updates }, { rejectWithValue }) => {
        try {
            const response = await authFetch(`${api.programs}/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Failed to update program');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const removeProgram = createAsyncThunk(
    'programs/removeProgram',
    async (id, { rejectWithValue }) => {
        try {
            const response = await authFetch(`${api.programs}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete program');
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const loadActiveProgram = () => {
    try {
        const saved = localStorage.getItem('strenvy_active_program');
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
};

const saveActiveProgram = (program) => {
    if (program) {
        localStorage.setItem('strenvy_active_program', JSON.stringify(program));
    } else {
        localStorage.removeItem('strenvy_active_program');
    }
};

const initialState = {
    adminPrograms: [],
    userPrograms: [],
    activeProgram: loadActiveProgram(),
    editingProgram: null,
    loading: false,
    error: null,
};

const programsSlice = createSlice({
    name: 'programs',
    initialState,
    reducers: {
        setActiveProgram: (state, action) => {
            const allPrograms = [...state.adminPrograms, ...state.userPrograms];
            const program = allPrograms.find(p => p.id === action.payload);
            if (program) {
                state.activeProgram = {
                    ...program,
                    startDate: new Date().toISOString(),
                    currentWeek: 1,
                };
                saveActiveProgram(state.activeProgram);
            }
        },
        clearActiveProgram: (state) => {
            state.activeProgram = null;
            saveActiveProgram(null);
        },
        setEditingProgram: (state, action) => {
            state.editingProgram = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPrograms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPrograms.fulfilled, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload)) {
                    state.adminPrograms = action.payload.filter(p => p.isAdmin);
                    state.userPrograms = action.payload.filter(p => !p.isAdmin);
                } else {
                    state.adminPrograms = [];
                    state.userPrograms = [];
                }
            })
            .addCase(fetchPrograms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createProgram.fulfilled, (state, action) => {
                if (action.payload.isAdmin) {
                    state.adminPrograms.push(action.payload);
                } else {
                    state.userPrograms.push(action.payload);
                }
            })
            .addCase(editProgram.fulfilled, (state, action) => {
                const targetList = action.payload.isAdmin ? state.adminPrograms : state.userPrograms;
                const index = targetList.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    targetList[index] = action.payload;
                }
                if (state.activeProgram?.id === action.payload.id) {
                    state.activeProgram = { ...state.activeProgram, ...action.payload };
                    saveActiveProgram(state.activeProgram);
                }
            })
            .addCase(removeProgram.fulfilled, (state, action) => {
                state.adminPrograms = state.adminPrograms.filter(p => p.id !== action.payload);
                state.userPrograms = state.userPrograms.filter(p => p.id !== action.payload);
                if (state.activeProgram?.id === action.payload) {
                    state.activeProgram = null;
                    saveActiveProgram(null);
                }
            });
    },
});

export const {
    setActiveProgram,
    clearActiveProgram,
    setEditingProgram,
} = programsSlice.actions;

export default programsSlice.reducer;
