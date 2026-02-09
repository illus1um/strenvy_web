import React, { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, CheckCircle, XCircle } from 'lucide-react';
import { resetPassword, clearError, clearMessage } from '../store/slices/userSlice';
import './ProfilePage.css';

const ResetPasswordPage = memo(function ResetPasswordPage() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const { loading, error, message } = useSelector(state => state.user);
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        return () => {
            dispatch(clearError());
            dispatch(clearMessage());
        };
    }, [dispatch]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setLocalError('');
        if (error) dispatch(clearError());
    }, [error, dispatch]);

    const handleSubmit = useCallback(() => {
        if (!formData.password.trim() || !formData.confirmPassword.trim()) return;

        if (formData.password !== formData.confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        dispatch(resetPassword({ token, password: formData.password }));
    }, [formData, token, dispatch]);

    if (!token) {
        return (
            <div className="page profile-page">
                <div className="container">
                    <div className="auth-container">
                        <div className="auth-card">
                            <div className="auth-header">
                                <XCircle size={40} style={{ color: 'var(--color-error)' }} />
                                <h1>Invalid Link</h1>
                                <p>No reset token found. Please request a new password reset link.</p>
                            </div>
                            <div className="auth-form">
                                <Link to="/forgot-password" className="btn btn-primary btn-lg" style={{ textAlign: 'center', textDecoration: 'none' }}>
                                    Request New Link
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (message) {
        return (
            <div className="page profile-page">
                <div className="container">
                    <div className="auth-container">
                        <div className="auth-card">
                            <div className="auth-header">
                                <CheckCircle size={40} style={{ color: 'var(--color-success, #22c55e)' }} />
                                <h1>Password Reset!</h1>
                                <p style={{ marginTop: '12px', lineHeight: '1.6' }}>{message}</p>
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

    const displayError = localError || error;

    return (
        <div className="page profile-page">
            <div className="container">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <Lock size={40} />
                            <h1>Reset Password</h1>
                            <p>Enter your new password</p>
                        </div>

                        <div className="auth-form">
                            {displayError && (
                                <div className="error-message-box" style={{
                                    padding: '10px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--color-error)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                    fontSize: '0.9rem'
                                }}>
                                    {displayError}
                                </div>
                            )}

                            <div className="input-group">
                                <label className="input-label">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="input"
                                    placeholder="Min 6 characters"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="input"
                                    placeholder="Repeat your password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleSubmit}
                                disabled={!formData.password.trim() || !formData.confirmPassword.trim() || loading}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>

                            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                <Link to="/login" style={{ color: 'var(--color-accent-primary)', fontWeight: '600', textDecoration: 'none' }}>Back to Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ResetPasswordPage;
