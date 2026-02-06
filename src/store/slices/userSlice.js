import { createSlice } from '@reduxjs/toolkit';

// Load user from localStorage
const loadUser = () => {
    try {
        const saved = localStorage.getItem('strenvy_user');
        return saved ? JSON.parse(saved) : null;
    } catch {
        return null;
    }
};

const saveUser = (user) => {
    if (user) {
        localStorage.setItem('strenvy_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('strenvy_user');
    }
};

const initialState = {
    currentUser: loadUser(),
    isAuthenticated: !!loadUser(),
    isAdmin: loadUser()?.role === 'admin',
    preferences: {
        units: 'metric',
        theme: 'dark',
        notifications: true,
    },
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action) => {
            state.currentUser = action.payload;
            state.isAuthenticated = true;
            state.isAdmin = action.payload.role === 'admin';
            saveUser(action.payload);
        },
        loginAsAdmin: (state, action) => {
            const adminUser = {
                ...action.payload,
                role: 'admin',
            };
            state.currentUser = adminUser;
            state.isAuthenticated = true;
            state.isAdmin = true;
            saveUser(adminUser);
        },
        logout: (state) => {
            state.currentUser = null;
            state.isAuthenticated = false;
            state.isAdmin = false;
            saveUser(null);
        },
        updateProfile: (state, action) => {
            state.currentUser = { ...state.currentUser, ...action.payload };
            saveUser(state.currentUser);
        },
        updatePreferences: (state, action) => {
            state.preferences = { ...state.preferences, ...action.payload };
            if (state.currentUser) {
                state.currentUser.preferences = state.preferences;
                saveUser(state.currentUser);
            }
        },
        setGoals: (state, action) => {
            if (state.currentUser) {
                state.currentUser.goals = action.payload;
                saveUser(state.currentUser);
            }
        },
    },
});

export const { login, loginAsAdmin, logout, updateProfile, updatePreferences, setGoals } = userSlice.actions;
export default userSlice.reducer;
