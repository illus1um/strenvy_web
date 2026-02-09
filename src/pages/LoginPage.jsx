import React, { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { loginUser, resendVerification, clearError, clearMessage } from '../store/slices/userSlice';
import './ProfilePage.css';

const LoginPage = memo(function LoginPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error, message } = useSelector(state => state.user);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [resendLoading, setResendLoading] = useState(false);

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

    const handleLogin = useCallback(async () => {
        if (!formData.email.trim() || !formData.password.trim()) return;
        dispatch(loginUser({
            email: formData.email,
            password: formData.password,
        }));
    }, [formData, dispatch]);

    const handleResendVerification = useCallback(async () => {
        if (!formData.email.trim()) return;
        setResendLoading(true);
        await dispatch(resendVerification(formData.email));
        setResendLoading(false);
    }, [formData.email, dispatch]);

    const isEmailNotVerified = error && error.toLowerCase().includes('verify');

    return (
        <div className="page profile-page">
            <div className="container">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <User size={40} />
                            <h1>Welcome Back</h1>
                            <p>Log in to access your workouts</p>
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
                                    {isEmailNotVerified && (
                                        <button
                                            onClick={handleResendVerification}
                                            disabled={resendLoading}
                                            style={{
                                                display: 'block',
                                                marginTop: '8px',
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--color-accent-primary)',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                padding: 0,
                                            }}
                                        >
                                            {resendLoading ? 'Sending...' : 'Resend verification email'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {message && (
                                <div style={{
                                    padding: '10px',
                                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                    color: 'var(--color-success, #22c55e)',
                                    border: '1px solid rgba(34, 197, 94, 0.2)',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '0.9rem'
                                }}>
                                    {message}
                                </div>
                            )}

                            <div className="input-group">
                                <label className="input-label">Email</label>
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
                                <label className="input-label">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                                <Link to="/forgot-password" style={{
                                    color: 'var(--color-accent-primary)',
                                    fontSize: '0.85rem',
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                }}>
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleLogin}
                                disabled={!formData.email.trim() || !formData.password.trim() || loading}
                            >
                                {loading ? 'Logging in...' : 'Log In'}
                            </button>

                            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                Don't have an account? <Link to="/register" style={{ color: 'var(--color-accent-primary)', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default LoginPage;
