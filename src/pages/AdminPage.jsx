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
    removeProgram,
    setEditingProgram,
} from '../store/slices/programsSlice';
import { fetchExercises, editExercise } from '../store/slices/exercisesSlice';
import {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
} from '../store/slices/usersSlice';
import ProgramForm from '../components/programs/ProgramForm';
import Loading from '../components/common/Loading';
import './AdminPage.css';

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
    const [editingId, setEditingId] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [expandedProgram, setExpandedProgram] = useState(null);

    // Search states
    const [userSearch, setUserSearch] = useState('');
    const [exerciseSearch, setExerciseSearch] = useState('');
    const [exerciseBodyPart, setExerciseBodyPart] = useState('');
    const [exercisesShown, setExercisesShown] = useState(EXERCISES_PER_PAGE);

    // Exercise edit state
    const [editingExercise, setEditingExercise] = useState(null);
    const [exerciseFormData, setExerciseFormData] = useState(null);

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

    const handleUserInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleEditProgram = useCallback((program) => {
        setEditingId(program.id);
        dispatch(setEditingProgram(program));
        setShowForm(true);
    }, [dispatch]);

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

    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingId(null);
        dispatch(setEditingProgram(null));
    }, [dispatch]);

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

    const handleEditExercise = useCallback((exercise) => {
        setEditingExercise(exercise);
        setExerciseFormData({
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            equipment: exercise.equipment,
            target: exercise.target,
            secondaryMuscles: exercise.secondaryMuscles || [],
            instructions: exercise.instructions || [],
        });
    }, []);

    const handleExerciseFormChange = useCallback((field, value) => {
        setExerciseFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleAddArrayItem = useCallback((field) => {
        setExerciseFormData(prev => ({
            ...prev,
            [field]: [...prev[field], ''],
        }));
    }, []);

    const handleUpdateArrayItem = useCallback((field, index, value) => {
        setExerciseFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item),
        }));
    }, []);

    const handleRemoveArrayItem = useCallback((field, index) => {
        setExerciseFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    }, []);

    const handleExerciseSubmit = useCallback(() => {
        if (!editingExercise || !exerciseFormData.name.trim()) return;
        dispatch(editExercise({
            id: editingExercise.id,
            ...exerciseFormData,
            secondaryMuscles: exerciseFormData.secondaryMuscles.filter(s => s.trim()),
            instructions: exerciseFormData.instructions.filter(s => s.trim()),
        }));
        setEditingExercise(null);
        setExerciseFormData(null);
    }, [editingExercise, exerciseFormData, dispatch]);

    const handleCloseExerciseForm = useCallback(() => {
        setEditingExercise(null);
        setExerciseFormData(null);
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
                                                    {program.duration} weeks &bull; {
                                                        (program.scheduleDates && Object.keys(program.scheduleDates).length > 0)
                                                            ? `${Object.keys(program.scheduleDates).length} days`
                                                            : `${program.daysPerWeek?.length || 0} days/week`
                                                    }
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
                                                    {Object.entries(
                                                        (program.scheduleDates && Object.keys(program.scheduleDates).length > 0)
                                                            ? program.scheduleDates
                                                            : (program.schedule || {})
                                                    ).map(([day, workout]) => (
                                                        <div key={day} className="day-preview">
                                                            <strong>{day}</strong>: {workout.name}
                                                            {workout.exercises?.length > 0 && (
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
                                        <div
                                            key={exercise.id}
                                            className="exercise-preview-card clickable"
                                            onClick={() => handleEditExercise(exercise)}
                                        >
                                            <img
                                                src={exercise.localPng || exercise.localGif}
                                                alt={exercise.name}
                                                loading="lazy"
                                            />
                                            <span className="exercise-preview-name">{exercise.name}</span>
                                            <span className="exercise-preview-body">{exercise.bodyPart}</span>
                                            <div className="exercise-edit-overlay">
                                                <Edit size={16} />
                                            </div>
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
                    <ProgramForm
                        onClose={handleCloseForm}
                        editingId={editingId}
                        isAdmin
                    />
                )}

                {/* Exercise Edit Modal */}
                {editingExercise && exerciseFormData && (
                    <div className="modal-overlay" onClick={handleCloseExerciseForm}>
                        <div className="modal exercise-edit-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit Exercise</h2>
                                <button className="btn btn-ghost btn-icon" onClick={handleCloseExerciseForm}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body exercise-edit-body">
                                <div className="exercise-edit-layout">
                                    {/* GIF Preview (read-only) */}
                                    <div className="exercise-gif-preview">
                                        <img
                                            src={editingExercise.localGif || editingExercise.localPng}
                                            alt={editingExercise.name}
                                        />
                                    </div>

                                    {/* Editable fields */}
                                    <div className="exercise-edit-fields">
                                        <div className="input-group">
                                            <label className="input-label">Name *</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={exerciseFormData.name}
                                                onChange={(e) => handleExerciseFormChange('name', e.target.value)}
                                            />
                                        </div>

                                        <div className="form-row">
                                            <div className="input-group">
                                                <label className="input-label">Body Part</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={exerciseFormData.bodyPart}
                                                    onChange={(e) => handleExerciseFormChange('bodyPart', e.target.value)}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Target Muscle</label>
                                                <input
                                                    type="text"
                                                    className="input"
                                                    value={exerciseFormData.target}
                                                    onChange={(e) => handleExerciseFormChange('target', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Equipment</label>
                                            <input
                                                type="text"
                                                className="input"
                                                value={exerciseFormData.equipment}
                                                onChange={(e) => handleExerciseFormChange('equipment', e.target.value)}
                                            />
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Secondary Muscles</label>
                                            {exerciseFormData.secondaryMuscles.map((muscle, idx) => (
                                                <div key={idx} className="array-item-row">
                                                    <input
                                                        type="text"
                                                        className="input"
                                                        value={muscle}
                                                        placeholder="e.g., biceps"
                                                        onChange={(e) => handleUpdateArrayItem('secondaryMuscles', idx, e.target.value)}
                                                    />
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        onClick={() => handleRemoveArrayItem('secondaryMuscles', idx)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                className="btn btn-ghost btn-sm add-item-btn"
                                                onClick={() => handleAddArrayItem('secondaryMuscles')}
                                            >
                                                <Plus size={14} />
                                                Add Muscle
                                            </button>
                                        </div>

                                        <div className="input-group">
                                            <label className="input-label">Instructions</label>
                                            {exerciseFormData.instructions.map((instruction, idx) => (
                                                <div key={idx} className="array-item-row">
                                                    <span className="instruction-number">{idx + 1}.</span>
                                                    <textarea
                                                        className="input"
                                                        rows={2}
                                                        value={instruction}
                                                        placeholder="Describe the step..."
                                                        onChange={(e) => handleUpdateArrayItem('instructions', idx, e.target.value)}
                                                    />
                                                    <button
                                                        className="btn btn-ghost btn-icon btn-sm"
                                                        onClick={() => handleRemoveArrayItem('instructions', idx)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                className="btn btn-ghost btn-sm add-item-btn"
                                                onClick={() => handleAddArrayItem('instructions')}
                                            >
                                                <Plus size={14} />
                                                Add Step
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-ghost" onClick={handleCloseExerciseForm}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleExerciseSubmit}
                                    disabled={!exerciseFormData.name.trim()}
                                >
                                    <Save size={18} />
                                    Save Changes
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
