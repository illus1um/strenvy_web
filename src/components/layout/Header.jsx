import React, { memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Dumbbell,
    Home,
    Library,
    Calendar,
    BarChart3,
    User,
    Menu,
    X,
    LogOut
} from 'lucide-react';
import { logoutUser } from '../../store/slices/userSlice';
import './Header.css';

const Header = memo(function Header({ onMenuToggle, isMenuOpen }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, currentUser } = useSelector(state => state.user);

    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/exercises', label: 'Exercises', icon: Library },
        { path: '/programs', label: 'Programs', icon: Calendar },
        { path: '/progress', label: 'Progress', icon: BarChart3 },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <Dumbbell className="logo-icon" />
                    <span className="logo-text">Strenvy</span>
                </Link>

                <nav className="nav-desktop">
                    {navLinks.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="header-actions">
                    {isAuthenticated ? (
                        <div className="user-actions">
                            <div className="user-avatar" title={currentUser?.name}>
                                {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <button
                                className="btn btn-ghost btn-icon"
                                onClick={handleLogout}
                                title="Log Out"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Link to="/login" className="btn btn-ghost">
                                Log In
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                Get Started
                            </Link>
                        </div>
                    )}

                    <button
                        className="menu-toggle btn-ghost btn-icon"
                        onClick={onMenuToggle}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <nav className={`nav-mobile ${isMenuOpen ? 'open' : ''}`}>
                {navLinks.map(({ path, label, icon: Icon }) => (
                    <Link
                        key={path}
                        to={path}
                        className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                        onClick={onMenuToggle}
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>
        </header>
    );
});

export default Header;
