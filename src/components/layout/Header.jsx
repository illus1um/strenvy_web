import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Dumbbell,
    Home,
    Library,
    Calendar,
    BarChart3,
    User,
    Menu,
    X
} from 'lucide-react';
import './Header.css';

const Header = memo(function Header({ onMenuToggle, isMenuOpen }) {
    const location = useLocation();
    const { isAuthenticated, currentUser } = useSelector(state => state.user);

    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/exercises', label: 'Exercises', icon: Library },
        { path: '/programs', label: 'Programs', icon: Calendar },
        { path: '/progress', label: 'Progress', icon: BarChart3 },
        { path: '/profile', label: 'Profile', icon: User },
    ];

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
                        <div className="user-avatar">
                            {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    ) : (
                        <Link to="/profile" className="btn btn-primary btn-sm">
                            Get Started
                        </Link>
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
