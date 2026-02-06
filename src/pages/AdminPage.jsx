import React, { memo, useState, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Plus,
    Edit,
    Trash2,
    Users,
    BarChart3,
    Dumbbell,
    Calendar,
    ChevronDown,
    ChevronUp,
    Save,
    X,
    Shield
} from 'lucide-react';
import {
    addAdminProgram,
    updateAdminProgram,
    deleteAdminProgram
} from '../store/slices/programsSlice';
import { fetchExercises } from '../store/slices/exercisesSlice';
import './AdminPage.css';

const DAYS = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
];

const AdminPage = memo(function AdminPage() {
    const dispatch = useDispatch();
    const { adminPrograms, userPrograms } = useSelector(state => state.programs);
    const { filtered: exercises } = useSelector(state => state.exercises);
    const { currentUser } = useSelector(state => state.user);

    const [activeTab, setActiveTab] = useState('programs');
    const [showForm, setShowForm] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [expandedProgram, setExpandedProgram] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 4,
        difficulty: 'beginner',
        daysPerWeek: [],
        schedule: {},
    });

    useEffect(() => {
        if (exercises.length === 0) {
            dispatch(fetchExercises());
        }
    }, [dispatch, exercises.length]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleDayToggle = useCallback((day) => {
        setFormData(prev => {
            const isSelected = prev.daysPerWeek.includes(day);
            const newDays = isSelected
                ? prev.daysPerWeek.filter(d => d !== day)
                : [...prev.daysPerWeek, day];

            const newSchedule = { ...prev.schedule };
            if (!isSelected) {
                newSchedule[day] = { name: `${day} Workout`, exercises: [] };
            } else {
                delete newSchedule[day];
            }

            return { ...prev, daysPerWeek: newDays, schedule: newSchedule };
        });
    }, []);

    const handleEditProgram = useCallback((program) => {
        setEditingProgram(program);
        setFormData({
            name: program.name,
            description: program.description,
            duration: program.duration,
            difficulty: program.difficulty,
            daysPerWeek: program.daysPerWeek,
            schedule: program.schedule,
        });
        setShowForm(true);
    }, []);

    const handleDeleteProgram = useCallback((programId) => {
        if (window.confirm('Are you sure you want to delete this program?')) {
            dispatch(deleteAdminProgram(programId));
        }
    }, [dispatch]);

    const handleSubmit = useCallback(() => {
        if (!formData.name.trim()) return;

        if (editingProgram) {
            dispatch(updateAdminProgram({
                id: editingProgram.id,
                ...formData,
            }));
        } else {
            dispatch(addAdminProgram(formData));
        }

        setShowForm(false);
        setEditingProgram(null);
        setFormData({
            name: '',
            description: '',
            duration: 4,
            difficulty: 'beginner',
            daysPerWeek: [],
            schedule: {},
        });
    }, [formData, editingProgram, dispatch]);

    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingProgram(null);
        setFormData({
            name: '',
            description: '',
            duration: 4,
            difficulty: 'beginner',
            daysPerWeek: [],
            schedule: {},
        });
    }, []);

    const getDifficultyColor = (difficulty) => {
        const colors = {
            beginner: '#22c55e',
            intermediate: '#f59e0b',
            advanced: '#ef4444',
        };
        return colors[difficulty] || colors.beginner;
    };

    // Stats
    const stats = {
        totalPrograms: adminPrograms.length,
        totalUserPrograms: userPrograms.length,
        totalExercises: exercises.length,
    };

    return (
        <div className="page admin-page">
            <div className="container">
                <div className="admin-header">
                    <div className="admin-title">
                        <Shield size={28} />
                        <div>
                            <h1>Admin Panel</h1>
                            <p className="text-muted">Welcome, {currentUser?.name}</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="admin-stats">
                    <div className="stat-card">
                        <BarChart3 size={24} />
                        <div>
                            <span className="stat-value">{stats.totalPrograms}</span>
                            <span className="stat-label">Admin Programs</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Users size={24} />
                        <div>
                            <span className="stat-value">{stats.totalUserPrograms}</span>
                            <span className="stat-label">User Programs</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <Dumbbell size={24} />
                        <div>
                            <span className="stat-value">{stats.totalExercises}</span>
                            <span className="stat-label">Exercises</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`tab ${activeTab === 'programs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('programs')}
                    >
                        <Calendar size={18} />
                        Programs
                    </button>
                    <button
                        className={`tab ${activeTab === 'exercises' ? 'active' : ''}`}
                        onClick={() => setActiveTab('exercises')}
                    >
                        <Dumbbell size={18} />
                        Exercises
                    </button>
                </div>

                {/* Programs Tab */}
                {activeTab === 'programs' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <h2>Manage Programs</h2>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowForm(true)}
                            >
                                <Plus size={18} />
                                Add Program
                            </button>
                        </div>

                        <div className="programs-list">
                            {adminPrograms.map(program => (
                                <div key={program.id} className="admin-program-card">
                                    <div
                                        className="program-row"
                                        onClick={() => setExpandedProgram(
                                            expandedProgram === program.id ? null : program.id
                                        )}
                                    >
                                        <div className="program-info">
                                            <span
                                                className="difficulty-dot"
                                                style={{ backgroundColor: getDifficultyColor(program.difficulty) }}
                                            />
                                            <h3>{program.name}</h3>
                                            <span className="program-meta-inline">
                                                {program.duration} weeks • {program.daysPerWeek.length} days/week
                                            </span>
                                        </div>
                                        <div className="program-actions">
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditProgram(program);
                                                }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProgram(program.id);
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            {expandedProgram === program.id ? (
                                                <ChevronUp size={20} />
                                            ) : (
                                                <ChevronDown size={20} />
                                            )}
                                        </div>
                                    </div>
                                    {expandedProgram === program.id && (
                                        <div className="program-details">
                                            <p>{program.description}</p>
                                            <div className="schedule-preview">
                                                {Object.entries(program.schedule).map(([day, workout]) => (
                                                    <div key={day} className="day-preview">
                                                        <strong>{day}</strong>: {workout.name}
                                                        {workout.exercises.length > 0 && (
                                                            <span className="exercise-count">
                                                                ({workout.exercises.length} exercises)
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Exercises Tab */}
                {activeTab === 'exercises' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <h2>Exercise Library</h2>
                            <span className="text-muted">{exercises.length} exercises loaded</span>
                        </div>
                        <p className="info-text">
                            Exercises are loaded from the JSON database. To add new exercises,
                            update the <code>exercises.json</code> file and add corresponding GIF files.
                        </p>
                        <div className="exercises-preview">
                            {exercises.slice(0, 6).map(exercise => (
                                <div key={exercise.id} className="exercise-preview-card">
                                    <img
                                        src={exercise.localPng || exercise.localGif}
                                        alt={exercise.name}
                                    />
                                    <span>{exercise.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Program Form Modal */}
                {showForm && (
                    <div className="modal-overlay" onClick={handleCloseForm}>
                        <div className="modal admin-form-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingProgram ? 'Edit Program' : 'Add Program'}</h2>
                                <button className="btn btn-ghost btn-icon" onClick={handleCloseForm}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="input-group">
                                    <label className="input-label">Program Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input"
                                        placeholder="e.g., Advanced Strength Program"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Description</label>
                                    <textarea
                                        name="description"
                                        className="input"
                                        placeholder="Describe the program..."
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label className="input-label">Duration (weeks)</label>
                                        <input
                                            type="number"
                                            name="duration"
                                            className="input"
                                            min={1}
                                            max={52}
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Difficulty</label>
                                        <select
                                            name="difficulty"
                                            className="input select"
                                            value={formData.difficulty}
                                            onChange={handleInputChange}
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Training Days</label>
                                    <div className="days-selector">
                                        {DAYS.map(({ key, label }) => (
                                            <button
                                                key={key}
                                                type="button"
                                                className={`day-btn ${formData.daysPerWeek.includes(key) ? 'selected' : ''}`}
                                                onClick={() => handleDayToggle(key)}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-ghost" onClick={handleCloseForm}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={!formData.name.trim()}
                                >
                                    <Save size={18} />
                                    {editingProgram ? 'Save Changes' : 'Create Program'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default AdminPage;
