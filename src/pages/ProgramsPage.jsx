import React, { memo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Plus,
    Calendar,
    Clock,
    Target as TargetIcon,
    ChevronRight,
    Play,
    Edit,
    Trash2,
    Star
} from 'lucide-react';
import { setActiveProgram, deleteProgram, setEditingProgram } from '../store/slices/programsSlice';
import ProgramForm from '../components/programs/ProgramForm';
import './ProgramsPage.css';

const ProgramsPage = memo(function ProgramsPage() {
    const dispatch = useDispatch();
    const { adminPrograms, userPrograms, activeProgram } = useSelector(state => state.programs);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const handleStartProgram = useCallback((programId) => {
        dispatch(setActiveProgram(programId));
    }, [dispatch]);

    const handleDeleteProgram = useCallback((programId) => {
        if (window.confirm('Are you sure you want to delete this program?')) {
            dispatch(deleteProgram(programId));
        }
    }, [dispatch]);

    const handleEditProgram = useCallback((program) => {
        setEditingId(program.id);
        dispatch(setEditingProgram(program));
        setShowForm(true);
    }, [dispatch]);

    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingId(null);
        dispatch(setEditingProgram(null));
    }, [dispatch]);

    const getDifficultyColor = (difficulty) => {
        const colors = {
            beginner: '#22c55e',
            intermediate: '#f59e0b',
            advanced: '#ef4444',
        };
        return colors[difficulty] || colors.beginner;
    };

    return (
        <div className="page programs-page">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Training Programs</h1>
                        <p className="text-muted">
                            Choose a pre-made program or create your own
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus size={18} />
                        Create Program
                    </button>
                </div>

                {/* Active Program Banner */}
                {activeProgram && (
                    <div className="active-program-banner">
                        <div className="active-program-content">
                            <span className="badge badge-success">Currently Active</span>
                            <h3>{activeProgram.name}</h3>
                            <p>Week {activeProgram.currentWeek} of {activeProgram.duration} weeks</p>
                        </div>
                        <button className="btn btn-primary">
                            <Play size={18} />
                            Continue
                        </button>
                    </div>
                )}

                {/* Admin Programs */}
                <section className="programs-section">
                    <h2 className="section-title">
                        <Star size={20} className="section-icon" />
                        Featured Programs
                    </h2>
                    <div className="programs-grid">
                        {adminPrograms.map(program => (
                            <div key={program.id} className="program-card">
                                <div className="program-header">
                                    <span
                                        className="difficulty-badge"
                                        style={{ backgroundColor: `${getDifficultyColor(program.difficulty)}20`, color: getDifficultyColor(program.difficulty) }}
                                    >
                                        {program.difficulty}
                                    </span>
                                    {activeProgram?.id === program.id && (
                                        <span className="badge badge-success">Active</span>
                                    )}
                                </div>
                                <h3 className="program-name">{program.name}</h3>
                                <p className="program-description">{program.description}</p>
                                <div className="program-meta">
                                    <span>
                                        <Calendar size={16} />
                                        {program.duration} weeks
                                    </span>
                                    <span>
                                        <Clock size={16} />
                                        {program.daysPerWeek.length} days/week
                                    </span>
                                </div>
                                <div className="program-days">
                                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                                        <span
                                            key={day}
                                            className={`day-dot ${program.daysPerWeek.some(d => d.startsWith(day)) ? 'active' : ''
                                                }`}
                                            title={day}
                                        >
                                            {day[0].toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    className="btn btn-primary program-start"
                                    onClick={() => handleStartProgram(program.id)}
                                    disabled={activeProgram?.id === program.id}
                                >
                                    {activeProgram?.id === program.id ? 'Active' : 'Start Program'}
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* User Programs */}
                <section className="programs-section">
                    <h2 className="section-title">
                        <TargetIcon size={20} className="section-icon" />
                        Your Programs
                    </h2>
                    {userPrograms.length === 0 ? (
                        <div className="empty-state">
                            <p>You haven't created any programs yet.</p>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowForm(true)}
                            >
                                <Plus size={18} />
                                Create Your First Program
                            </button>
                        </div>
                    ) : (
                        <div className="programs-grid">
                            {userPrograms.map(program => (
                                <div key={program.id} className="program-card user-program">
                                    <div className="program-header">
                                        <span className="badge">Custom</span>
                                        {activeProgram?.id === program.id && (
                                            <span className="badge badge-success">Active</span>
                                        )}
                                        <div className="program-actions">
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => handleEditProgram(program)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={() => handleDeleteProgram(program.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="program-name">{program.name}</h3>
                                    {program.description && (
                                        <p className="program-description">{program.description}</p>
                                    )}
                                    <div className="program-meta">
                                        <span>
                                            <Calendar size={16} />
                                            {program.duration} weeks
                                        </span>
                                        <span>
                                            <Clock size={16} />
                                            {program.daysPerWeek?.length || 0} days/week
                                        </span>
                                    </div>
                                    <button
                                        className="btn btn-primary program-start"
                                        onClick={() => handleStartProgram(program.id)}
                                        disabled={activeProgram?.id === program.id}
                                    >
                                        {activeProgram?.id === program.id ? 'Active' : 'Start Program'}
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Program Form Modal */}
                {showForm && (
                    <ProgramForm
                        onClose={handleCloseForm}
                        editingId={editingId}
                    />
                )}
            </div>
        </div>
    );
});

export default ProgramsPage;
