import React, { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import { forgotPassword, clearError, clearMessage } from '../store/slices/userSlice';
import './ProfilePage.css';

const ForgotPasswordPage = memo(function ForgotPasswordPage() {
    const dispatch = useDispatch();
    const { loading, error, message } = useSelector(state => state.user);
    const [email, setEmail] = useState('');

    useEffect(() => {
        return () => {
            dispatch(clearError());
            dispatch(clearMessage());
        };
    }, [dispatch]);

    const handleSubmit = useCallback(() => {
        if (!email.trim()) return;
        dispatch(forgotPassword(email));
    }, [email, dispatch]);

    if (message) {
        return (
            <div className="page profile-page">
                <div className="container">
                    <div className="auth-container">
                        <div className="auth-card">
                            <div className="auth-header">
                                <CheckCircle size={40} style={{ color: 'var(--color-success, #22c55e)' }} />
                                <h1>Check Your Email</h1>
                                <p style={{ marginTop: '12px', lineHeight: '1.6' }}>{message}</p>
                            </div>
                            <div className="auth-form">
                                <Link to="/login" className="btn btn-primary btn-lg" style={{ textAlign: 'center', textDecoration: 'none' }}>
                                    Back to Login
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
                            <Mail size={40} />
                            <h1>Forgot Password</h1>
                            <p>Enter your email and we'll send you a reset link</p>
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
                                <label className="input-label">Email</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) dispatch(clearError());
                                    }}
                                    disabled={loading}
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleSubmit}
                                disabled={!email.trim() || loading}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                Remember your password? <Link to="/login" style={{ color: 'var(--color-accent-primary)', fontWeight: '600', textDecoration: 'none' }}>Log in</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ForgotPasswordPage;
