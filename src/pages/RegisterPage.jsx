import React, { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, CheckCircle } from 'lucide-react';
import { registerUser, clearError, clearMessage } from '../store/slices/userSlice';
import './ProfilePage.css';

const RegisterPage = memo(function RegisterPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error, message } = useSelector(state => state.user);

    const [formData, setFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/profile');
        }
        return () => {
            dispatch(clearError());
            dispatch(clearMessage());
        };
    }, [isAuthenticated, navigate, dispatch]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) dispatch(clearError());
    }, [error, dispatch]);

    const handleRegister = useCallback(async () => {
        if (!formData.username.trim() || !formData.name.trim() || !formData.email.trim() || !formData.password.trim()) return;

        dispatch(registerUser({
            username: formData.username,
            name: formData.name,
            email: formData.email,
            password: formData.password,
        }));
    }, [formData, dispatch]);

    if (message) {
        return (
            <div className="page profile-page">
                <div className="container">
                    <div className="auth-container">
                        <div className="auth-card">
                            <div className="auth-header">
                                <CheckCircle size={40} style={{ color: 'var(--color-success, #22c55e)' }} />
                                <h1>Check Your Email</h1>
                                <p style={{ marginTop: '12px', lineHeight: '1.6' }}>
                                    {message}
                                </p>
                            </div>
                            <div className="auth-form">
                                <Link to="/login" className="btn btn-primary btn-lg" style={{ textAlign: 'center', textDecoration: 'none' }}>
                                    Go to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page profile-page">
            <div className="container">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <User size={40} />
                            <h1>Get Started</h1>
                            <p>Create your account in seconds</p>
                        </div>

                        <div className="auth-form">
                            {error && (
                                <div className="error-message-box" style={{
                                    padding: '10px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--color-error)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '0.9rem'
                                }}>
                                    {error}
                                </div>
                            )}

                            <div className="input-group">
                                <label className="input-label">Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    className="input"
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Your Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="input"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="input"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="input"
                                    placeholder="Create a password (min 6 characters)"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleRegister}
                                disabled={!formData.username.trim() || !formData.name.trim() || !formData.email.trim() || !formData.password.trim() || loading}
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>

                            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                Already have an account? <Link to="/login" style={{ color: 'var(--color-accent-primary)', fontWeight: '600', textDecoration: 'none' }}>Log in</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default RegisterPage;
