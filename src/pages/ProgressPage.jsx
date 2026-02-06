import React, { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
    Flame,
    Target,
    Dumbbell,
    TrendingUp,
    Calendar,
    Activity
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
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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

const ProgressPage = memo(function ProgressPage() {
    const { workoutHistory, stats } = useSelector(state => state.progress);
    const { isAuthenticated } = useSelector(state => state.user);

    // Calculate workout frequency by week
    const weeklyData = useMemo(() => {
        const weeks = [];
        const now = new Date();

        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i * 7));
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);

            const count = workoutHistory.filter(w => {
                const date = new Date(w.completedAt);
                return date >= weekStart && date < weekEnd;
            }).length;

            weeks.push({
                label: `Week ${8 - i}`,
                count,
            });
        }

        return weeks;
    }, [workoutHistory]);

    // Calculate muscle group distribution
    const muscleDistribution = useMemo(() => {
        const distribution = {};
        workoutHistory.forEach(workout => {
            workout.exercises?.forEach(exercise => {
                const target = exercise.target || 'other';
                distribution[target] = (distribution[target] || 0) + 1;
            });
        });
        return distribution;
    }, [workoutHistory]);

    // Chart configurations
    const lineChartData = {
        labels: weeklyData.map(w => w.label),
        datasets: [
            {
                label: 'Workouts',
                data: weeklyData.map(w => w.count),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#71717a' },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#71717a' },
            },
        },
    };

    const doughnutData = {
        labels: Object.keys(muscleDistribution),
        datasets: [
            {
                data: Object.values(muscleDistribution),
                backgroundColor: [
                    '#6366f1',
                    '#8b5cf6',
                    '#22c55e',
                    '#f59e0b',
                    '#ef4444',
                    '#3b82f6',
                    '#ec4899',
                    '#14b8a6',
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
                labels: { color: '#a1a1aa', padding: 20 },
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
                            <span className="stat-value">{stats.streak}</span>
                            <span className="stat-label">Day Streak</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)' }}>
                            <Target size={24} style={{ color: '#6366f1' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalWorkouts}</span>
                            <span className="stat-label">Total Workouts</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}>
                            <Dumbbell size={24} style={{ color: '#8b5cf6' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.totalExercises}</span>
                            <span className="stat-label">Exercises Done</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}>
                            <TrendingUp size={24} style={{ color: '#22c55e' }} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{Math.round(stats.totalVolume / 1000)}k</span>
                            <span className="stat-label">Total Volume (kg)</span>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>
                            <Calendar size={18} />
                            Weekly Activity
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
                        <h3>
                            <Activity size={18} />
                            Muscle Group Distribution
                        </h3>
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
                            {workoutHistory.slice(-5).reverse().map(workout => (
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
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ProgressPage;
