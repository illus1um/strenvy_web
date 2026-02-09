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
import { logoutUser, updateUserProfile, updateUserPreferences, setUserGoals, clearError } from '../store/slices/userSlice';
import './ProfilePage.css';

const ProfilePage = memo(function ProfilePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, isAuthenticated, isAdmin, loading, error } = useSelector(state => state.user);
    const preferences = currentUser?.preferences || { units: 'metric', theme: 'light' };

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
        if (error) dispatch(clearError());
    }, [error, dispatch]);

    // Auth handlers moved to LoginPage/RegisterPage

    const handleLogout = useCallback(async () => {
        await dispatch(logoutUser());
        navigate('/login');
    }, [dispatch, navigate]);

    const handleSaveProfile = useCallback(() => {
        dispatch(updateUserProfile({
            name: formData.name,
            email: formData.email,
        }));
        dispatch(setUserGoals({
            type: formData.goalType,
            targetWeight: formData.goalWeight,
            workoutsPerWeek: formData.goalWorkoutsPerWeek,
        }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }, [formData, dispatch]);

    const handlePreferenceChange = useCallback((key, value) => {
        dispatch(updateUserPreferences({ [key]: value }));
    }, [dispatch]);

    // Not logged in - should be handled by PrivateRoute but double check
    if (!isAuthenticated) return null;

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
                    {/* Account Settings */}
                    <div className="profile-section">
                        <h2>
                            <User size={20} />
                            Account Settings
                        </h2>

                        <div className="input-group">
                            <label className="input-label">Name</label>
                            <input
                                type="text"
                                name="name"
                                className="input"
                                value={formData.name || ''}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="input"
                                value={formData.email || ''}
                                onChange={handleInputChange}
                                disabled
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
