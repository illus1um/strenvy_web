import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { verifyEmail, clearError, clearMessage } from '../store/slices/userSlice';
import './ProfilePage.css';

const VerifyEmailPage = memo(function VerifyEmailPage() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const { loading, error, message } = useSelector(state => state.user);
    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            dispatch(verifyEmail(token));
        }
        return () => {
            dispatch(clearError());
            dispatch(clearMessage());
        };
    }, [token, dispatch]);

    return (
        <div className="page profile-page">
            <div className="container">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            {loading && (
                                <>
                                    <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
                                    <h1>Verifying Email...</h1>
                                    <p>Please wait while we verify your email address.</p>
                                </>
                            )}

                            {!loading && message && (
                                <>
                                    <CheckCircle size={40} style={{ color: 'var(--color-success, #22c55e)' }} />
                                    <h1>Email Verified!</h1>
                                    <p style={{ marginTop: '12px', lineHeight: '1.6' }}>{message}</p>
                                </>
                            )}

                            {!loading && error && (
                                <>
                                    <XCircle size={40} style={{ color: 'var(--color-error)' }} />
                                    <h1>Verification Failed</h1>
                                    <p style={{ marginTop: '12px', lineHeight: '1.6', color: 'var(--color-error)' }}>{error}</p>
                                </>
                            )}

                            {!loading && !token && !message && !error && (
                                <>
                                    <XCircle size={40} style={{ color: 'var(--color-error)' }} />
                                    <h1>Invalid Link</h1>
                                    <p>No verification token found. Please check the link in your email.</p>
                                </>
                            )}
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
});

export default VerifyEmailPage;
