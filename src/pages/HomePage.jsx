import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Dumbbell,
    Calendar,
    BarChart3,
    ArrowRight,
    Flame,
    Target,
    Clock
} from 'lucide-react';
import './HomePage.css';

const HomePage = memo(function HomePage() {
    const { stats } = useSelector(state => state.progress);
    const { activeProgram } = useSelector(state => state.programs);
    const { isAuthenticated, currentUser } = useSelector(state => state.user);

    const features = [
        {
            icon: Dumbbell,
            title: '1300+ Exercises',
            description: 'Comprehensive library with GIF animations and detailed instructions',
            link: '/exercises',
            color: '#6366f1'
        },
        {
            icon: Calendar,
            title: 'Training Programs',
            description: 'Pre-made plans or create your own custom programs',
            link: '/programs',
            color: '#8b5cf6'
        },
        {
            icon: BarChart3,
            title: 'Track Progress',
            description: 'Log workouts and visualize your fitness journey',
            link: '/progress',
            color: '#22c55e'
        },
    ];

    return (
        <div className="page home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Train Smarter,
                            <span className="gradient-text"> Get Stronger</span>
                        </h1>
                        <p className="hero-description">
                            Your personal fitness platform. Plan workouts, track progress,
                            and achieve your goals with Strenvy.
                        </p>
                        <div className="hero-actions">
                            <Link to="/exercises" className="btn btn-primary btn-lg">
                                Explore Exercises
                                <ArrowRight size={20} />
                            </Link>
                            <Link to="/programs" className="btn btn-secondary btn-lg">
                                View Programs
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section (if authenticated) */}
            {isAuthenticated && (
                <section className="stats-section">
                    <div className="container">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <Flame className="stat-icon" style={{ color: '#ef4444' }} />
                                <div className="stat-value">{stats.streak}</div>
                                <div className="stat-label">Day Streak</div>
                            </div>
                            <div className="stat-card">
                                <Target className="stat-icon" style={{ color: '#6366f1' }} />
                                <div className="stat-value">{stats.totalWorkouts}</div>
                                <div className="stat-label">Workouts</div>
                            </div>
                            <div className="stat-card">
                                <Dumbbell className="stat-icon" style={{ color: '#8b5cf6' }} />
                                <div className="stat-value">{stats.totalExercises}</div>
                                <div className="stat-label">Exercises Done</div>
                            </div>
                            <div className="stat-card">
                                <Clock className="stat-icon" style={{ color: '#22c55e' }} />
                                <div className="stat-value">{Math.round(stats.totalVolume / 1000)}k</div>
                                <div className="stat-label">Total Volume (kg)</div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Active Program Banner */}
            {activeProgram && (
                <section className="active-program-section">
                    <div className="container">
                        <div className="active-program-card">
                            <div className="active-program-info">
                                <span className="badge badge-success">Active Program</span>
                                <h3>{activeProgram.name}</h3>
                                <p>Week {activeProgram.currentWeek} of {activeProgram.duration}</p>
                            </div>
                            <Link to="/programs" className="btn btn-primary">
                                Continue Training
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Everything You Need</h2>
                    <div className="features-grid">
                        {features.map((feature, idx) => (
                            <Link key={idx} to={feature.link} className="feature-card">
                                <div
                                    className="feature-icon"
                                    style={{ backgroundColor: `${feature.color}20`, color: feature.color }}
                                >
                                    <feature.icon size={24} />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                                <span className="feature-link">
                                    Explore <ArrowRight size={16} />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!isAuthenticated && (
                <section className="cta-section">
                    <div className="container">
                        <div className="cta-card">
                            <h2>Ready to Start Your Journey?</h2>
                            <p>Create your profile and start tracking your fitness progress today.</p>
                            <Link to="/profile" className="btn btn-primary btn-lg">
                                Get Started Free
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
});

export default HomePage;
