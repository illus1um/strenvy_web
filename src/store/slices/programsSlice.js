import { createSlice } from '@reduxjs/toolkit';

// Default admin programs with sample exercises
const DEFAULT_ADMIN_PROGRAMS = [
    {
        id: 'admin-1',
        name: 'Beginner Full Body',
        description: 'Perfect for beginners. 3 days per week, focusing on full body compound movements.',
        duration: 4,
        daysPerWeek: ['monday', 'wednesday', 'friday'],
        difficulty: 'beginner',
        isAdmin: true,
        schedule: {
            monday: {
                name: 'Full Body A',
                exercises: [
                    { id: '0001', name: '3/4 sit-up', sets: 3, reps: 15, rest: 60 },
                    { id: '0002', name: '45° side bend', sets: 3, reps: 12, rest: 60 },
                    { id: '0003', name: 'air bike', sets: 3, reps: 20, rest: 45 },
                ]
            },
            wednesday: {
                name: 'Full Body B',
                exercises: [
                    { id: '0004', name: 'all fours squad stretch', sets: 3, reps: 15, rest: 60 },
                    { id: '0005', name: 'alternate heel touchers', sets: 3, reps: 20, rest: 45 },
                    { id: '0006', name: 'alternate lateral pulldown', sets: 3, reps: 12, rest: 90 },
                ]
            },
            friday: {
                name: 'Full Body C',
                exercises: [
                    { id: '0007', name: 'ankle circles', sets: 3, reps: 15, rest: 30 },
                    { id: '0008', name: 'archer pull up', sets: 3, reps: 8, rest: 120 },
                    { id: '0009', name: 'archer push up', sets: 3, reps: 10, rest: 90 },
                ]
            },
        },
    },
    {
        id: 'admin-2',
        name: 'Push Pull Legs',
        description: 'Classic PPL split for intermediate lifters. 6 days per week for maximum gains.',
        duration: 8,
        daysPerWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        difficulty: 'intermediate',
        isAdmin: true,
        schedule: {
            monday: {
                name: 'Push Day',
                exercises: [
                    { id: '0009', name: 'archer push up', sets: 4, reps: 10, rest: 90 },
                    { id: '0010', name: 'arm slingers hanging bent knee legs', sets: 3, reps: 12, rest: 60 },
                ]
            },
            tuesday: {
                name: 'Pull Day',
                exercises: [
                    { id: '0008', name: 'archer pull up', sets: 4, reps: 8, rest: 120 },
                    { id: '0006', name: 'alternate lateral pulldown', sets: 3, reps: 12, rest: 90 },
                ]
            },
            wednesday: {
                name: 'Legs Day',
                exercises: [
                    { id: '0004', name: 'all fours squad stretch', sets: 3, reps: 15, rest: 60 },
                    { id: '0001', name: '3/4 sit-up', sets: 4, reps: 15, rest: 60 },
                ]
            },
            thursday: {
                name: 'Push Day',
                exercises: [
                    { id: '0009', name: 'archer push up', sets: 4, reps: 12, rest: 90 },
                ]
            },
            friday: {
                name: 'Pull Day',
                exercises: [
                    { id: '0008', name: 'archer pull up', sets: 4, reps: 10, rest: 120 },
                ]
            },
            saturday: {
                name: 'Legs Day',
                exercises: [
                    { id: '0004', name: 'all fours squad stretch', sets: 4, reps: 15, rest: 60 },
                ]
            },
        },
    },
    {
        id: 'admin-3',
        name: 'Upper Lower Split',
        description: 'Balanced upper/lower body training. Great for building strength and muscle.',
        duration: 6,
        daysPerWeek: ['monday', 'tuesday', 'thursday', 'friday'],
        difficulty: 'intermediate',
        isAdmin: true,
        schedule: {
            monday: {
                name: 'Upper Body A',
                exercises: [
                    { id: '0009', name: 'archer push up', sets: 4, reps: 10, rest: 90 },
                    { id: '0008', name: 'archer pull up', sets: 4, reps: 8, rest: 120 },
                    { id: '0006', name: 'alternate lateral pulldown', sets: 3, reps: 12, rest: 90 },
                ]
            },
            tuesday: {
                name: 'Lower Body A',
                exercises: [
                    { id: '0004', name: 'all fours squad stretch', sets: 3, reps: 15, rest: 60 },
                    { id: '0001', name: '3/4 sit-up', sets: 4, reps: 20, rest: 45 },
                    { id: '0002', name: '45° side bend', sets: 3, reps: 15, rest: 60 },
                ]
            },
            thursday: {
                name: 'Upper Body B',
                exercises: [
                    { id: '0009', name: 'archer push up', sets: 4, reps: 12, rest: 90 },
                    { id: '0008', name: 'archer pull up', sets: 4, reps: 10, rest: 120 },
                ]
            },
            friday: {
                name: 'Lower Body B',
                exercises: [
                    { id: '0003', name: 'air bike', sets: 4, reps: 25, rest: 45 },
                    { id: '0005', name: 'alternate heel touchers', sets: 3, reps: 20, rest: 45 },
                ]
            },
        },
    },
    {
        id: 'admin-4',
        name: 'Core Crusher',
        description: 'Intensive ab and core workout. 3 days per week for a rock-solid midsection.',
        duration: 4,
        daysPerWeek: ['monday', 'wednesday', 'friday'],
        difficulty: 'advanced',
        isAdmin: true,
        schedule: {
            monday: {
                name: 'Core Blast',
                exercises: [
                    { id: '0001', name: '3/4 sit-up', sets: 4, reps: 25, rest: 45 },
                    { id: '0002', name: '45° side bend', sets: 4, reps: 20, rest: 45 },
                    { id: '0003', name: 'air bike', sets: 4, reps: 30, rest: 30 },
                    { id: '0005', name: 'alternate heel touchers', sets: 4, reps: 25, rest: 45 },
                ]
            },
            wednesday: {
                name: 'Ab Ripper',
                exercises: [
                    { id: '0003', name: 'air bike', sets: 5, reps: 30, rest: 30 },
                    { id: '0001', name: '3/4 sit-up', sets: 4, reps: 30, rest: 45 },
                ]
            },
            friday: {
                name: 'Core Finisher',
                exercises: [
                    { id: '0002', name: '45° side bend', sets: 5, reps: 25, rest: 45 },
                    { id: '0005', name: 'alternate heel touchers', sets: 5, reps: 30, rest: 30 },
                    { id: '0001', name: '3/4 sit-up', sets: 4, reps: 25, rest: 45 },
                ]
            },
        },
    },
];

// Load admin programs from localStorage - ALWAYS use defaults if not found or empty
const loadAdminPrograms = () => {
    try {
        const saved = localStorage.getItem('strenvy_admin_programs');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Return defaults if saved array is empty
            if (parsed.length === 0) {
                return DEFAULT_ADMIN_PROGRAMS;
            }
            return parsed;
        }
    } catch {
        // fallback to defaults
    }
    return DEFAULT_ADMIN_PROGRAMS;
};

const saveAdminPrograms = (programs) => {
    localStorage.setItem('strenvy_admin_programs', JSON.stringify(programs));
};

// Load user programs from localStorage
const loadPrograms = () => {
    try {
        const saved = localStorage.getItem('strenvy_programs');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const savePrograms = (programs) => {
    const userPrograms = programs.filter(p => !p.isAdmin);
    localStorage.setItem('strenvy_programs', JSON.stringify(userPrograms));
};

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
    adminPrograms: loadAdminPrograms(),
    userPrograms: loadPrograms(),
    activeProgram: loadActiveProgram(),
    editingProgram: null,
};

const programsSlice = createSlice({
    name: 'programs',
    initialState,
    reducers: {
        // User program actions
        addProgram: (state, action) => {
            const program = {
                ...action.payload,
                id: Date.now().toString(),
                isAdmin: false,
                createdAt: new Date().toISOString(),
            };
            state.userPrograms.push(program);
            savePrograms(state.userPrograms);
        },
        updateProgram: (state, action) => {
            const index = state.userPrograms.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.userPrograms[index] = { ...state.userPrograms[index], ...action.payload };
                savePrograms(state.userPrograms);
            }
        },
        deleteProgram: (state, action) => {
            state.userPrograms = state.userPrograms.filter(p => p.id !== action.payload);
            savePrograms(state.userPrograms);
            if (state.activeProgram?.id === action.payload) {
                state.activeProgram = null;
                saveActiveProgram(null);
            }
        },

        // Admin program actions
        addAdminProgram: (state, action) => {
            const program = {
                ...action.payload,
                id: `admin-${Date.now()}`,
                isAdmin: true,
                createdAt: new Date().toISOString(),
            };
            state.adminPrograms.push(program);
            saveAdminPrograms(state.adminPrograms);
        },
        updateAdminProgram: (state, action) => {
            const index = state.adminPrograms.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.adminPrograms[index] = { ...state.adminPrograms[index], ...action.payload };
                saveAdminPrograms(state.adminPrograms);
            }
        },
        deleteAdminProgram: (state, action) => {
            state.adminPrograms = state.adminPrograms.filter(p => p.id !== action.payload);
            saveAdminPrograms(state.adminPrograms);
            if (state.activeProgram?.id === action.payload) {
                state.activeProgram = null;
                saveActiveProgram(null);
            }
        },
        resetAdminPrograms: (state) => {
            state.adminPrograms = DEFAULT_ADMIN_PROGRAMS;
            saveAdminPrograms(state.adminPrograms);
        },

        // Common actions
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
        updateProgramSchedule: (state, action) => {
            const { programId, day, exercises } = action.payload;
            const index = state.userPrograms.findIndex(p => p.id === programId);
            if (index !== -1 && state.userPrograms[index].schedule[day]) {
                state.userPrograms[index].schedule[day].exercises = exercises;
                savePrograms(state.userPrograms);
            }
        },
    },
});

export const {
    addProgram,
    updateProgram,
    deleteProgram,
    addAdminProgram,
    updateAdminProgram,
    deleteAdminProgram,
    resetAdminPrograms,
    setActiveProgram,
    clearActiveProgram,
    setEditingProgram,
    updateProgramSchedule,
} = programsSlice.actions;

export default programsSlice.reducer;
