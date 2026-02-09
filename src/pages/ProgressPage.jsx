import React, { memo, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHistory } from '../store/slices/progressSlice';
import { useEffect } from 'react';
import {
    Flame,
    Target,
    Dumbbell,
    TrendingUp,
    Calendar,
    Activity,
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import './ProgressPage.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

import Loading from '../components/common/Loading';

const TIME_FILTERS = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
];

const getWorkoutVolume = (workout) => {
    return workout.exercises?.reduce((acc, e) => {
        if (Array.isArray(e.sets)) {
            return acc + e.sets.reduce((sAcc, s) => sAcc + (s.weight || 0) * (s.reps || 0), 0);
        }
        return acc + (e.weight || 0) * (e.reps || 0) * (e.sets || 0);
    }, 0) || 0;
};

const formatDuration = (seconds) => {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    return `${m} min`;
};

const ProgressPage = memo(function ProgressPage() {
    const dispatch = useDispatch();
    const { workoutHistory, stats = {}, loading, error } = useSelector(state => state.progress);
    const { isAuthenticated } = useSelector(state => state.user);
    const [timeFilter, setTimeFilter] = useState('all');

    const safeStats = {
        streak: stats?.streak || 0,
        totalWorkouts: stats?.totalWorkouts || 0,
        totalExercises: stats?.totalExercises || 0,
        totalVolume: stats?.totalVolume || 0,
    };

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchHistory());
        }
    }, [dispatch, isAuthenticated]);

    // Filter history by time period
    const filteredHistory = useMemo(() => {
        if (timeFilter === 'all') return workoutHistory;

        const now = new Date();
        let startDate;

        if (timeFilter === 'week') {
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
        } else if (timeFilter === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        return workoutHistory.filter(w => new Date(w.completedAt) >= startDate);
    }, [workoutHistory, timeFilter]);

    // Weekly volume + workout count
    const weeklyData = useMemo(() => {
        const weeks = [];
        const now = new Date();

        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7));
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);

            const weekWorkouts = workoutHistory.filter(w => {
                const date = new Date(w.completedAt);
                return date >= weekStart && date < weekEnd;
            });

            const volume = weekWorkouts.reduce((acc, w) => acc + getWorkoutVolume(w), 0);

            weeks.push({
                label: `Week ${8 - i}`,
                count: weekWorkouts.length,
                volume: Math.round(volume),
            });
        }

        return weeks;
    }, [workoutHistory]);

    // Muscle group distribution with secondary muscles + time filter
    const muscleDistribution = useMemo(() => {
        const distribution = {};
        filteredHistory.forEach(workout => {
            workout.exercises?.forEach(exercise => {
                const target = exercise.target || exercise.bodyPart || 'other';
                distribution[target] = (distribution[target] || 0) + 1;

                if (Array.isArray(exercise.secondaryMuscles)) {
                    exercise.secondaryMuscles.forEach(muscle => {
                        distribution[muscle] = (distribution[muscle] || 0) + 0.5;
                    });
                }
            });
        });
        return distribution;
    }, [filteredHistory]);

    if (loading && workoutHistory.length === 0) {
        return <Loading text="Loading your progress..." />;
    }

    if (error) {
        return (
            <div className="page progress-page">
                <div className="container">
                    <div className="error-container" style={{ textAlign: 'center', padding: '40px' }}>
                        <p style={{ color: '#ef4444' }}>Error loading data: {error}</p>
                        <button className="btn btn-ghost" onClick={() => dispatch(fetchHistory())}>Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    const lineChartData = {
        labels: weeklyData.map(w => w.label),
        datasets: [
            {
                label: 'Volume (kg)',
                data: weeklyData.map(w => w.volume),
                borderColor: '#fbbf24',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fbbf24',
                pointBorderColor: '#000',
                pointBorderWidth: 2,
                pointRadius: 4,
                yAxisID: 'y',
            },
            {
                label: 'Workouts',
                data: weeklyData.map(w => w.count),
                borderColor: '#8b5cf6',
                backgroundColor: 'transparent',
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#000',
                pointBorderWidth: 2,
                pointRadius: 4,
                yAxisID: 'y1',
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                labels: { color: '#a1a1aa', usePointStyle: true },
            },
            tooltip: {
                backgroundColor: '#1a1a24',
                titleColor: '#ffffff',
                bodyColor: '#a1a1aa',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                position: 'left',
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#71717a' },
                title: { display: true, text: 'Volume (kg)', color: '#71717a' },
            },
            y1: {
                beginAtZero: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { color: '#71717a', stepSize: 1 },
                title: { display: true, text: 'Workouts', color: '#71717a' },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#71717a' },
            },
        },
    };

    const doughnutData = {
        labels: Object.keys(muscleDistribution).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
        datasets: [
            {
                data: Object.values(muscleDistribution),
                backgroundColor: [
                    '#fbbf24', '#d97706', '#f59e0b', '#b45309',
                    '#6366f1', '#8b5cf6', '#22c55e', '#ef4444',
                    '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
                ],
                borderWidth: 0,
            },
        ],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: { color: '#a1a1aa', padding: 16, font: { size: 12 } },
            },
        },
    };

    if (!isAuthenticated) {
        return (
            <div className="page progress-page">
                <div className="container">
                    <div className="auth-required">
                        <Activity size={48} />
                        <h2>Track Your Progress</h2>
                        <p>Create a profile to start tracking your workouts and see your progress over time.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page progress-page">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Your Progress</h1>
                        <p className="text-muted">Track your fitness journey</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
                            <Flame size={24} style={{ color: '#ef4444' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{safeStats.streak}</span>
                            <span className="stat-label">Day Streak</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)' }}>
                            <Target size={24} style={{ color: '#fbbf24' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{safeStats.totalWorkouts}</span>
                            <span className="stat-label">Total Workouts</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)' }}>
                            <Dumbbell size={24} style={{ color: '#d97706' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{safeStats.totalExercises}</span>
                            <span className="stat-label">Exercises Done</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}>
                            <TrendingUp size={24} style={{ color: '#22c55e' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{Math.round(safeStats.totalVolume / 1000)}k</span>
                            <span className="stat-label">Total Volume (kg)</span>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>
                            <Calendar size={18} />
                            Weekly Activity & Volume
                        </h3>
                        <div className="chart-container">
                            {workoutHistory.length > 0 ? (
                                <Line data={lineChartData} options={lineChartOptions} />
                            ) : (
                                <div className="empty-chart">
                                    <p>No workout data yet. Start logging your workouts!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="chart-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Activity size={18} />
                                Muscle Groups
                            </h3>
                            <div className="time-filter">
                                {TIME_FILTERS.map(f => (
                                    <button
                                        key={f.key}
                                        className={`filter-btn ${timeFilter === f.key ? 'active' : ''}`}
                                        onClick={() => setTimeFilter(f.key)}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="chart-container">
                            {Object.keys(muscleDistribution).length > 0 ? (
                                <Doughnut data={doughnutData} options={doughnutOptions} />
                            ) : (
                                <div className="empty-chart">
                                    <p>Complete workouts to see muscle group distribution.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Workouts */}
                <div className="recent-workouts">
                    <h3>Recent Workouts</h3>
                    {workoutHistory.length === 0 ? (
                        <div className="empty-state">
                            <p>No workouts logged yet.</p>
                        </div>
                    ) : (
                        <div className="workouts-list">
                            {workoutHistory.slice(-5).reverse().map(workout => {
                                const volume = getWorkoutVolume(workout);
                                const duration = formatDuration(workout.duration);
                                return (
                                    <div key={workout.id} className="workout-item">
                                        <div className="workout-date">
                                            {new Date(workout.completedAt).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </div>
                                        <div className="workout-details">
                                            <span className="workout-name">{workout.name || 'Workout'}</span>
                                            <span className="workout-exercises">
                                                {workout.exercises?.length || 0} exercises
                                                {volume > 0 && ` · ${Math.round(volume)} kg`}
                                                {duration && ` · ${duration}`}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ProgressPage;
