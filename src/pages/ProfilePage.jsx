import React, { memo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    User,
    Settings,
    Target,
    LogOut,
    Save,
    Check,
    Shield
} from 'lucide-react';
import { login, loginAsAdmin, logout, updateProfile, updatePreferences, setGoals } from '../store/slices/userSlice';
import './ProfilePage.css';

const ProfilePage = memo(function ProfilePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, isAuthenticated, isAdmin, preferences } = useSelector(state => state.user);

    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        goalType: currentUser?.goals?.type || 'general',
        goalWeight: currentUser?.goals?.targetWeight || '',
        goalWorkoutsPerWeek: currentUser?.goals?.workoutsPerWeek || 3,
    });

    const [saved, setSaved] = useState(false);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSaved(false);
    }, []);

    const handleLogin = useCallback(() => {
        if (!formData.name.trim()) return;

        dispatch(login({
            id: Date.now().toString(),
            name: formData.name,
            email: formData.email,
            createdAt: new Date().toISOString(),
        }));

        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
    }, [formData, dispatch, navigate, location]);

    const handleAdminLogin = useCallback(() => {
        dispatch(loginAsAdmin({
            id: 'admin-' + Date.now().toString(),
            name: 'Admin',
            email: 'admin@strenvy.com',
            createdAt: new Date().toISOString(),
        }));

        navigate('/admin', { replace: true });
    }, [dispatch, navigate]);

    const handleLogout = useCallback(() => {
        dispatch(logout());
    }, [dispatch]);

    const handleSaveProfile = useCallback(() => {
        dispatch(updateProfile({
            name: formData.name,
            email: formData.email,
        }));
        dispatch(setGoals({
            type: formData.goalType,
            targetWeight: formData.goalWeight,
            workoutsPerWeek: formData.goalWorkoutsPerWeek,
        }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }, [formData, dispatch]);

    const handlePreferenceChange = useCallback((key, value) => {
        dispatch(updatePreferences({ [key]: value }));
    }, [dispatch]);

    // Not logged in - show signup/login form
    if (!isAuthenticated) {
        return (
            <div className="page profile-page">
                <div className="container">
                    <div className="auth-container">
                        <div className="auth-card">
                            <div className="auth-header">
                                <User size={40} />
                                <h1>Get Started with Strenvy</h1>
                                <p>Create your profile to track workouts and progress</p>
                            </div>

                            <div className="auth-form">
                                <div className="input-group">
                                    <label className="input-label">Your Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Email (optional)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="input"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleLogin}
                                    disabled={!formData.name.trim()}
                                >
                                    Start Training
                                </button>

                                <div className="auth-divider">
                                    <span>or</span>
                                </div>

                                <button
                                    className="btn btn-secondary btn-admin"
                                    onClick={handleAdminLogin}
                                >
                                    <Shield size={18} />
                                    Login as Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Logged in - show profile settings
    return (
        <div className="page profile-page">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Your Profile</h1>
                        <p className="text-muted">
                            Manage your account and preferences
                            {isAdmin && (
                                <span className="admin-badge">
                                    <Shield size={14} />
                                    Admin
                                </span>
                            )}
                        </p>
                    </div>
                    {isAdmin && (
                        <Link to="/admin" className="btn btn-primary">
                            <Shield size={18} />
                            Admin Panel
                        </Link>
                    )}
                </div>

                <div className="profile-grid">
                    {/* Profile Info */}
                    <div className="profile-section">
                        <h2>
                            <User size={20} />
                            Profile Information
                        </h2>

                        <div className="input-group">
                            <label className="input-label">Name</label>
                            <input
                                type="text"
                                name="name"
                                className="input"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="input"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Goals */}
                    <div className="profile-section">
                        <h2>
                            <Target size={20} />
                            Fitness Goals
                        </h2>

                        <div className="input-group">
                            <label className="input-label">Goal Type</label>
                            <select
                                name="goalType"
                                className="input select"
                                value={formData.goalType}
                                onChange={handleInputChange}
                            >
                                <option value="general">General Fitness</option>
                                <option value="muscle">Build Muscle</option>
                                <option value="weight-loss">Weight Loss</option>
                                <option value="strength">Increase Strength</option>
                                <option value="endurance">Improve Endurance</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Workouts per Week</label>
                            <input
                                type="number"
                                name="goalWorkoutsPerWeek"
                                className="input"
                                min={1}
                                max={7}
                                value={formData.goalWorkoutsPerWeek}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="profile-section">
                        <h2>
                            <Settings size={20} />
                            Preferences
                        </h2>

                        <div className="preference-item">
                            <div className="preference-info">
                                <span className="preference-label">Units</span>
                                <span className="preference-description">
                                    Choose metric (kg) or imperial (lbs)
                                </span>
                            </div>
                            <select
                                className="input select"
                                value={preferences.units}
                                onChange={(e) => handlePreferenceChange('units', e.target.value)}
                            >
                                <option value="metric">Metric (kg)</option>
                                <option value="imperial">Imperial (lbs)</option>
                            </select>
                        </div>

                        <div className="preference-item">
                            <div className="preference-info">
                                <span className="preference-label">Theme</span>
                                <span className="preference-description">
                                    Dark mode for comfortable viewing
                                </span>
                            </div>
                            <select
                                className="input select"
                                value={preferences.theme}
                                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                            >
                                <option value="dark">Dark</option>
                                <option value="light">Light</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="profile-actions">
                    <button
                        className={`btn ${saved ? 'btn-success' : 'btn-primary'}`}
                        onClick={handleSaveProfile}
                    >
                        {saved ? <Check size={18} /> : <Save size={18} />}
                        {saved ? 'Saved!' : 'Save Changes'}
                    </button>

                    <button className="btn btn-ghost" onClick={handleLogout}>
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ProfilePage;
