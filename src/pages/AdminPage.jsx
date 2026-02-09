import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
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
    Shield,
    Search,
    Filter,
} from 'lucide-react';
import {
    createProgram,
    editProgram,
    removeProgram
} from '../store/slices/programsSlice';
import { fetchExercises } from '../store/slices/exercisesSlice';
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
} from '../store/slices/usersSlice';
import Loading from '../components/common/Loading';
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

const EXERCISES_PER_PAGE = 24;

const AdminPage = memo(function AdminPage() {
    const dispatch = useDispatch();
    const { adminPrograms, userPrograms, loading } = useSelector(state => state.programs);
    const { filtered: exercises, bodyParts } = useSelector(state => state.exercises);
    const { users } = useSelector(state => state.users);
    const { currentUser } = useSelector(state => state.user);

    const [activeTab, setActiveTab] = useState('programs');
    const [showForm, setShowForm] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [expandedProgram, setExpandedProgram] = useState(null);

    // Search states
    const [userSearch, setUserSearch] = useState('');
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [exerciseBodyPart, setExerciseBodyPart] = useState('');
    const [exercisesShown, setExercisesShown] = useState(EXERCISES_PER_PAGE);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 4,
        difficulty: 'beginner',
        daysPerWeek: [],
        schedule: {},
    });

    // User Form state
    const [userFormData, setUserFormData] = useState({
        username: '',
        name: '',
        email: '',
        password: '',
        role: 'user',
    });

    useEffect(() => {
        if (exercises.length === 0) {
            dispatch(fetchExercises());
        }
        dispatch(fetchUsers());
    }, [dispatch, exercises.length]);

    // Reset exercises shown when filters change
    useEffect(() => {
        setExercisesShown(EXERCISES_PER_PAGE);
    }, [exerciseSearch, exerciseBodyPart]);

    // Filtered users
    const filteredUsers = useMemo(() => {
        if (!userSearch.trim()) return users;
        const q = userSearch.toLowerCase();
        return users.filter(u =>
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.username?.toLowerCase().includes(q)
        );
    }, [users, userSearch]);

    // Filtered exercises (local filter on top of slice filter)
    const filteredExercises = useMemo(() => {
        let result = exercises;
        if (exerciseSearch.trim()) {
            const q = exerciseSearch.toLowerCase();
            result = result.filter(e => e.name.toLowerCase().includes(q));
        }
        if (exerciseBodyPart) {
            result = result.filter(e => e.bodyPart === exerciseBodyPart);
        }
        return result;
    }, [exercises, exerciseSearch, exerciseBodyPart]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleUserInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({ ...prev, [name]: value }));
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

    const handleEditUser = useCallback((user) => {
        setEditingUser(user);
        setUserFormData({
            username: user.username || '',
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
        });
        setShowUserForm(true);
    }, []);

    const handleDeleteProgram = useCallback((programId) => {
        if (window.confirm('Are you sure you want to delete this program?')) {
            dispatch(removeProgram(programId));
        }
    }, [dispatch]);

    const handleDeleteUser = useCallback((userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            dispatch(deleteUser(userId));
        }
    }, [dispatch]);

    const handleSubmit = useCallback(() => {
        if (!formData.name.trim()) return;

        if (editingProgram) {
            dispatch(editProgram({
                id: editingProgram.id,
                ...formData,
                isAdmin: true
            }));
        } else {
            dispatch(createProgram({
                ...formData,
                isAdmin: true
            }));
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

    const handleUserSubmit = useCallback(() => {
        if (!userFormData.name.trim() || !userFormData.email.trim()) return;

        if (editingUser) {
            const updates = {
                id: editingUser.id,
                name: userFormData.name,
                role: userFormData.role,
            };
            if (userFormData.password) {
                updates.password = userFormData.password;
            }
            dispatch(updateUser(updates));
        } else {
            if (!userFormData.password || !userFormData.username.trim()) return;
            dispatch(createUser(userFormData));
        }

        setShowUserForm(false);
        setEditingUser(null);
        setUserFormData({
            username: '',
            name: '',
            email: '',
            password: '',
            role: 'user',
        });
    }, [userFormData, editingUser, dispatch]);

    const handleCloseUserForm = useCallback(() => {
        setShowUserForm(false);
        setEditingUser(null);
        setUserFormData({
            username: '',
            name: '',
            email: '',
            password: '',
            role: 'user',
        });
    }, []);

    const handleLoadMore = useCallback(() => {
        setExercisesShown(prev => prev + EXERCISES_PER_PAGE);
    }, []);

    // Stats
    const stats = {
        totalPrograms: adminPrograms.length,
        totalUserPrograms: userPrograms.length,
        totalExercises: exercises.length,
        totalUsers: users.length,
    };

    if (loading && adminPrograms.length === 0) {
        return <Loading text="Loading admin panel..." />;
    }

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
                        <Calendar size={24} />
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
                    <div className="stat-card">
                        <Users size={24} />
                        <div>
                            <span className="stat-value">{stats.totalUsers}</span>
                            <span className="stat-label">Total Users</span>
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
                    <button
                        className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={18} />
                        Users ({stats.totalUsers})
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

                        {adminPrograms.length === 0 ? (
                            <div className="empty-state">
                                <Calendar size={40} />
                                <p>No admin programs yet. Create your first program.</p>
                            </div>
                        ) : (
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
                                                <span className={`difficulty-dot difficulty-${program.difficulty}`} />
                                                <h3>{program.name}</h3>
                                                <span className="program-meta-inline">
                                                    {program.duration} weeks &bull; {program.daysPerWeek.length} days/week
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
                        )}
                    </div>
                )}

                {/* Exercises Tab */}
                {activeTab === 'exercises' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <h2>Exercise Library</h2>
                            <span className="text-muted">{filteredExercises.length} of {exercises.length} exercises</span>
                        </div>

                        <div className="admin-filters">
                            <div className="admin-search">
                                <Search size={16} />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Search exercises..."
                                    value={exerciseSearch}
                                    onChange={(e) => setExerciseSearch(e.target.value)}
                                />
                            </div>
                            <div className="admin-filter-select">
                                <Filter size={16} />
                                <select
                                    className="input select"
                                    value={exerciseBodyPart}
                                    onChange={(e) => setExerciseBodyPart(e.target.value)}
                                >
                                    <option value="">All Body Parts</option>
                                    {bodyParts.map(bp => (
                                        <option key={bp} value={bp}>{bp}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {filteredExercises.length === 0 ? (
                            <div className="empty-state">
                                <Dumbbell size={40} />
                                <p>No exercises match your search.</p>
                            </div>
                        ) : (
                            <>
                                <div className="exercises-preview">
                                    {filteredExercises.slice(0, exercisesShown).map(exercise => (
                                        <div key={exercise.id} className="exercise-preview-card">
                                            <img
                                                src={exercise.localPng || exercise.localGif}
                                                alt={exercise.name}
                                                loading="lazy"
                                            />
                                            <span className="exercise-preview-name">{exercise.name}</span>
                                            <span className="exercise-preview-body">{exercise.bodyPart}</span>
                                        </div>
                                    ))}
                                </div>
                                {exercisesShown < filteredExercises.length && (
                                    <div className="load-more">
                                        <button className="btn btn-secondary" onClick={handleLoadMore}>
                                            Load More ({filteredExercises.length - exercisesShown} remaining)
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="admin-section">
                        <div className="section-header">
                            <h2>Manage Users</h2>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowUserForm(true)}
                            >
                                <Plus size={18} />
                                Add User
                            </button>
                        </div>

                        <div className="admin-filters">
                            <div className="admin-search">
                                <Search size={16} />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Search by name, email, or username..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {filteredUsers.length === 0 ? (
                            <div className="empty-state">
                                <Users size={40} />
                                <p>{userSearch ? 'No users match your search.' : 'No users found.'}</p>
                            </div>
                        ) : (
                            <div className="users-list">
                                {filteredUsers.map(user => (
                                    <div key={user.id} className="user-row">
                                        <div className="user-avatar-placeholder">
                                            {(user.name || user.email || '?')[0].toUpperCase()}
                                        </div>
                                        <div className="user-info">
                                            <div className="user-name">
                                                {user.name}
                                                {user.username && (
                                                    <span className="user-username">@{user.username}</span>
                                                )}
                                            </div>
                                            <span className="user-email">{user.email}</span>
                                        </div>
                                        <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                                            {user.role}
                                        </span>
                                        <span className="user-date">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric', year: 'numeric'
                                            }) : '—'}
                                        </span>
                                        <div className="user-actions-cell">
                                            <button
                                                className="btn btn-ghost btn-icon btn-sm"
                                                onClick={() => handleEditUser(user)}
                                                title="Edit user"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {user.id !== currentUser?.id && (
                                                <button
                                                    className="btn btn-ghost btn-icon btn-sm"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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

                {/* User Form Modal */}
                {showUserForm && (
                    <div className="modal-overlay" onClick={handleCloseUserForm}>
                        <div className="modal admin-form-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingUser ? 'Edit User' : 'Add User'}</h2>
                                <button className="btn btn-ghost btn-icon" onClick={handleCloseUserForm}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                {!editingUser && (
                                    <div className="input-group">
                                        <label className="input-label">Username *</label>
                                        <input
                                            type="text"
                                            name="username"
                                            className="input"
                                            placeholder="johndoe"
                                            value={userFormData.username}
                                            onChange={handleUserInputChange}
                                        />
                                    </div>
                                )}

                                <div className="input-group">
                                    <label className="input-label">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input"
                                        placeholder="John Doe"
                                        value={userFormData.name}
                                        onChange={handleUserInputChange}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="input"
                                        placeholder="john@example.com"
                                        value={userFormData.email}
                                        onChange={handleUserInputChange}
                                        disabled={!!editingUser}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">
                                        {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="input"
                                        placeholder="******"
                                        value={userFormData.password}
                                        onChange={handleUserInputChange}
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Role</label>
                                    <select
                                        name="role"
                                        className="input select"
                                        value={userFormData.role}
                                        onChange={handleUserInputChange}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-ghost" onClick={handleCloseUserForm}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUserSubmit}
                                    disabled={
                                        !userFormData.name.trim() ||
                                        !userFormData.email.trim() ||
                                        (!editingUser && (!userFormData.password || !userFormData.username.trim()))
                                    }
                                >
                                    <Save size={18} />
                                    {editingUser ? 'Save Changes' : 'Create User'}
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
