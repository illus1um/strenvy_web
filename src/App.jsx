import React, { Suspense, lazy, useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Header from './components/layout/Header';
import Loading from './components/common/Loading';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import { checkAuth } from './store/slices/userSlice';
import { fetchPrograms } from './store/slices/programsSlice';
import { fetchHistory } from './store/slices/progressSlice';
import './index.css';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ExercisesPage = lazy(() => import('./pages/ExercisesPage'));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const WorkoutSessionPage = lazy(() => import('./pages/WorkoutSessionPage'));

function AppContent() {
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, isAuthenticated } = useSelector(state => state.user);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPrograms());
      dispatch(fetchHistory());
    }
  }, [dispatch, isAuthenticated]);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  return (
    <BrowserRouter>
      <Header onMenuToggle={handleMenuToggle} isMenuOpen={isMenuOpen} />
      <main>
        <Suspense fallback={<Loading text="Loading page..." />}>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/session"
              element={
                <PrivateRoute>
                  <WorkoutSessionPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/exercises"
              element={
                <PrivateRoute>
                  <ExercisesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/programs"
              element={
                <PrivateRoute>
                  <ProgramsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <PrivateRoute>
                  <ProgressPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
