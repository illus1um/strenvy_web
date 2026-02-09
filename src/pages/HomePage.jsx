import React, { memo, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Dumbbell,
    Calendar,
    BarChart3,
    ArrowRight,
    Flame,
    Target,
    Clock,
    Play,
} from 'lucide-react';
import { startSession } from '../store/slices/sessionSlice';
import './HomePage.css';

const HomePage = memo(function HomePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { stats = {} } = useSelector(state => state.progress);
    const { activeProgram } = useSelector(state => state.programs);
    const { isAuthenticated } = useSelector(state => state.user);
    const { active: sessionActive } = useSelector(state => state.session);

    const safeStats = {
        streak: stats?.streak || 0,
        totalWorkouts: stats?.totalWorkouts || 0,
        totalExercises: stats?.totalExercises || 0,
        totalVolume: stats?.totalVolume || 0,
    };

    const getLocalDateStr = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // Find today's workout from active program
    const todayWorkout = useMemo(() => {
        if (!activeProgram) return null;

        const now = new Date();
        const today = getLocalDateStr(now);

        // Try scheduleDates first (date-based: { '2026-02-09': { name, exercises } })
        if (activeProgram.scheduleDates && Object.keys(activeProgram.scheduleDates).length > 0) {
            if (activeProgram.scheduleDates[today]) {
                return { date: today, ...activeProgram.scheduleDates[today] };
            }
            return null;
        }

        // Fallback to schedule (day-of-week: { monday: { name, exercises } })
        if (activeProgram.schedule && Object.keys(activeProgram.schedule).length > 0) {
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const todayDay = dayNames[now.getDay()];
            if (activeProgram.schedule[todayDay]) {
                return { date: today, ...activeProgram.schedule[todayDay] };
            }
        }

        return null;
    }, [activeProgram]);

    // Find next scheduled workout
    const nextWorkout = useMemo(() => {
        if (!activeProgram) return null;

        // Only scheduleDates has future date keys
        if (activeProgram.scheduleDates && Object.keys(activeProgram.scheduleDates).length > 0) {
            const today = getLocalDateStr(new Date());
            const futureDates = Object.keys(activeProgram.scheduleDates)
                .filter(date => date > today)
                .sort();

            if (futureDates.length > 0) {
                return { date: futureDates[0], ...activeProgram.scheduleDates[futureDates[0]] };
            }
        }

        return null;
    }, [activeProgram]);

    const handleStartWorkout = () => {
        if (!todayWorkout?.exercises) return;
        dispatch(startSession({
            name: todayWorkout.name || `${activeProgram.name} - Workout`,
            programId: activeProgram.id,
            exercises: todayWorkout.exercises,
        }));
        navigate('/session');
    };

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
                                <div className="stat-value">{safeStats.streak}</div>
                                <div className="stat-label">Day Streak</div>
                            </div>
                            <div className="stat-card">
                                <Target className="stat-icon" style={{ color: '#6366f1' }} />
                                <div className="stat-value">{safeStats.totalWorkouts}</div>
                                <div className="stat-label">Workouts</div>
                            </div>
                            <div className="stat-card">
                                <Dumbbell className="stat-icon" style={{ color: '#8b5cf6' }} />
                                <div className="stat-value">{safeStats.totalExercises}</div>
                                <div className="stat-label">Exercises Done</div>
                            </div>
                            <div className="stat-card">
                                <Clock className="stat-icon" style={{ color: '#22c55e' }} />
                                <div className="stat-value">{Math.round(safeStats.totalVolume / 1000)}k</div>
                                <div className="stat-label">Total Volume (kg)</div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Active Session Banner */}
            {sessionActive && (
                <section className="active-program-section">
                    <div className="container">
                        <div className="active-program-card" style={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                            <div className="active-program-info">
                                <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
                                    Workout In Progress
                                </span>
                                <h3>You have an active session</h3>
                                <p>Continue where you left off</p>
                            </div>
                            <Link to="/session" className="btn btn-primary">
                                <Play size={18} />
                                Continue Workout
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Active Program Banner */}
            {activeProgram && !sessionActive && (
                <section className="active-program-section">
                    <div className="container">
                        <div className="active-program-card">
                            <div className="active-program-info">
                                <span className="badge badge-success">Active Program</span>
                                <h3>{activeProgram.name}</h3>
                                {todayWorkout ? (
                                    <p>
                                        Today: <strong>{todayWorkout.name || 'Workout'}</strong>
                                        {' '}({todayWorkout.exercises?.length || 0} exercises)
                                    </p>
                                ) : nextWorkout ? (
                                    <p>
                                        Next workout: {new Date(nextWorkout.date).toLocaleDateString('en-US', {
                                            weekday: 'short', month: 'short', day: 'numeric'
                                        })}
                                    </p>
                                ) : (
                                    <p>Week {activeProgram.currentWeek} of {activeProgram.duration}</p>
                                )}
                            </div>
                            {todayWorkout ? (
                                <button className="btn btn-primary" onClick={handleStartWorkout}>
                                    <Play size={18} />
                                    Start Workout
                                </button>
                            ) : (
                                <Link to="/programs" className="btn btn-primary">
                                    View Program
                                    <ArrowRight size={18} />
                                </Link>
                            )}
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
