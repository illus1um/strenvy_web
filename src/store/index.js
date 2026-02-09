import { configureStore } from '@reduxjs/toolkit';
import exercisesReducer from './slices/exercisesSlice';
import workoutsReducer from './slices/workoutsSlice';
import programsReducer from './slices/programsSlice';
import progressReducer from './slices/progressSlice';
import userReducer from './slices/userSlice';
import usersReducer from './slices/usersSlice';
import sessionReducer from './slices/sessionSlice';

export const store = configureStore({
    reducer: {
        exercises: exercisesReducer,
        workouts: workoutsReducer,
        programs: programsReducer,
        progress: progressReducer,
        user: userReducer,
        users: usersReducer,
        session: sessionReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
