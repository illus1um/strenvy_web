import React, { memo, useMemo, useState, useCallback } from 'react';
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
    ChevronLeft,
    ChevronRight,
    Check,
} from 'lucide-react';
import { startSession } from '../store/slices/sessionSlice';
import './HomePage.css';

const getLocalDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const HomePage = memo(function HomePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { stats = {}, workoutHistory = [] } = useSelector(state => state.progress);
    const { activeProgram } = useSelector(state => state.programs);
    const { isAuthenticated } = useSelector(state => state.user);
    const { active: sessionActive } = useSelector(state => state.session);

    const [calMonth, setCalMonth] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });
    const [selectedDay, setSelectedDay] = useState(null);

    const safeStats = {
        streak: stats?.streak || 0,
        totalWorkouts: stats?.totalWorkouts || 0,
        totalExercises: stats?.totalExercises || 0,
        totalVolume: stats?.totalVolume || 0,
    };

    // Find today's workout from active program
    const todayWorkout = useMemo(() => {
        if (!activeProgram) return null;
        const now = new Date();
        const today = getLocalDateStr(now);

        if (activeProgram.scheduleDates && Object.keys(activeProgram.scheduleDates).length > 0) {
            if (activeProgram.scheduleDates[today]) {
                return { date: today, ...activeProgram.scheduleDates[today] };
            }
            return null;
        }

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

    // Calendar data
    const scheduledDates = useMemo(() => {
        if (!activeProgram?.scheduleDates) return {};
        return activeProgram.scheduleDates;
    }, [activeProgram]);

    const completedDates = useMemo(() => {
        const set = {};
        workoutHistory.forEach(w => {
            if (w.completedAt) {
                const d = getLocalDateStr(new Date(w.completedAt));
                set[d] = true;
            }
        });
        return set;
    }, [workoutHistory]);

    // Build calendar grid (Monday-start)
    const calendarDays = useMemo(() => {
        const { year, month } = calMonth;
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let startOffset = firstDay.getDay() - 1;
        if (startOffset < 0) startOffset = 6;

        const days = [];
        for (let i = 0; i < startOffset; i++) {
            days.push(null);
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({
                day: d,
                dateStr,
                scheduled: !!scheduledDates[dateStr],
                completed: !!completedDates[dateStr],
                isToday: dateStr === getLocalDateStr(new Date()),
            });
        }
        return days;
    }, [calMonth, scheduledDates, completedDates]);

    const calMonthLabel = useMemo(() => {
        return new Date(calMonth.year, calMonth.month).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }, [calMonth]);

    const handlePrevMonth = useCallback(() => {
        setCalMonth(prev => {
            const m = prev.month - 1;
            return m < 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: m };
        });
        setSelectedDay(null);
    }, []);

    const handleNextMonth = useCallback(() => {
        setCalMonth(prev => {
            const m = prev.month + 1;
            return m > 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: m };
        });
        setSelectedDay(null);
    }, []);

    const handleDayClick = useCallback((day) => {
        if (!day) return;
        setSelectedDay(prev => prev === day.dateStr ? null : day.dateStr);
    }, []);

    const selectedWorkout = useMemo(() => {
        if (!selectedDay || !scheduledDates[selectedDay]) return null;
        return scheduledDates[selectedDay];
    }, [selectedDay, scheduledDates]);

    const handleStartWorkout = useCallback(() => {
        if (!todayWorkout?.exercises) return;
        dispatch(startSession({
            name: todayWorkout.name || `${activeProgram.name} - Workout`,
            programId: activeProgram.id,
            exercises: todayWorkout.exercises,
        }));
        navigate('/session');
    }, [todayWorkout, activeProgram, dispatch, navigate]);

    const handleStartSelectedWorkout = useCallback(() => {
        if (!selectedWorkout?.exercises) return;
        dispatch(startSession({
            name: selectedWorkout.name || `${activeProgram.name} - Workout`,
            programId: activeProgram.id,
            exercises: selectedWorkout.exercises,
        }));
        navigate('/session');
    }, [selectedWorkout, activeProgram, dispatch, navigate]);

    const features = [
        {
            icon: Dumbbell,
            title: '1300+ Exercises',
            description: 'Comprehensive library with GIF animations and detailed instructions',
            link: '/exercises',
            colorClass: 'feature-icon-exercises',
        },
        {
            icon: Calendar,
            title: 'Training Programs',
            description: 'Pre-made plans or create your own custom programs',
            link: '/programs',
            colorClass: 'feature-icon-programs',
        },
        {
            icon: BarChart3,
            title: 'Track Progress',
            description: 'Log workouts and visualize your fitness journey',
            link: '/progress',
            colorClass: 'feature-icon-progress',
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

            {/* Stats Section */}
            {isAuthenticated && (
                <section className="stats-section">
                    <div className="container">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <Flame className="stat-icon stat-icon-flame" />
                                <div className="stat-value">{safeStats.streak}</div>
                                <div className="stat-label">Day Streak</div>
                            </div>
                            <div className="stat-card">
                                <Target className="stat-icon stat-icon-target" />
                                <div className="stat-value">{safeStats.totalWorkouts}</div>
                                <div className="stat-label">Workouts</div>
                            </div>
                            <div className="stat-card">
                                <Dumbbell className="stat-icon stat-icon-dumbbell" />
                                <div className="stat-value">{safeStats.totalExercises}</div>
                                <div className="stat-label">Exercises Done</div>
                            </div>
                            <div className="stat-card">
                                <Clock className="stat-icon stat-icon-volume" />
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
                        <div className="active-program-card active-session-card">
                            <div className="active-program-info">
                                <span className="badge badge-warning">Workout In Progress</span>
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
                                        Next workout: {new Date(nextWorkout.date + 'T00:00:00').toLocaleDateString('en-US', {
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

            {/* Training Calendar */}
            {isAuthenticated && activeProgram && (
                <section className="calendar-section">
                    <div className="container">
                        <div className="training-calendar">
                            <div className="cal-header">
                                <h3>
                                    <Calendar size={18} />
                                    Training Schedule
                                </h3>
                                <div className="cal-nav">
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={handlePrevMonth}>
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="cal-month-label">{calMonthLabel}</span>
                                    <button className="btn btn-ghost btn-icon btn-sm" onClick={handleNextMonth}>
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="cal-day-labels">
                                {DAY_LABELS.map(d => (
                                    <span key={d} className="cal-day-label">{d}</span>
                                ))}
                            </div>

                            <div className="cal-grid">
                                {calendarDays.map((day, i) => (
                                    <div
                                        key={i}
                                        className={`cal-day ${!day ? 'empty' : ''} ${day?.isToday ? 'today' : ''} ${day?.scheduled ? 'scheduled' : ''} ${day?.completed ? 'completed' : ''} ${selectedDay === day?.dateStr ? 'selected' : ''}`}
                                        onClick={() => day && handleDayClick(day)}
                                    >
                                        {day && (
                                            <>
                                                <span className="cal-day-num">{day.day}</span>
                                                {day.completed && <Check size={12} className="cal-check" />}
                                                {day.scheduled && !day.completed && <span className="cal-dot" />}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="cal-legend">
                                <span className="cal-legend-item"><span className="cal-dot" /> Scheduled</span>
                                <span className="cal-legend-item"><Check size={12} className="cal-legend-check" /> Completed</span>
                                <span className="cal-legend-item"><span className="cal-today-dot" /> Today</span>
                            </div>

                            {selectedDay && selectedWorkout && (
                                <div className="cal-preview">
                                    <div className="cal-preview-info">
                                        <strong>{selectedWorkout.name || 'Workout'}</strong>
                                        <span>{selectedWorkout.exercises?.length || 0} exercises</span>
                                    </div>
                                    {selectedDay === getLocalDateStr(new Date()) && !sessionActive && (
                                        <button className="btn btn-primary btn-sm" onClick={handleStartSelectedWorkout}>
                                            <Play size={14} />
                                            Start
                                        </button>
                                    )}
                                </div>
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
                                <div className={`feature-icon ${feature.colorClass}`}>
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
                            <Link to="/register" className="btn btn-primary btn-lg">
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
