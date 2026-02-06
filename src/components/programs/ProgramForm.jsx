import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    X,
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Dumbbell,
    Calendar,
    Search,
    Eye
} from 'lucide-react';
import { addProgram, updateProgram, setEditingProgram } from '../../store/slices/programsSlice';
import { fetchExercises, setFilter } from '../../store/slices/exercisesSlice';
import './ProgramForm.css';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ProgramForm = memo(function ProgramForm({ onClose, editingId }) {
    const dispatch = useDispatch();
    const { editingProgram } = useSelector(state => state.programs);
    const { filtered: exercises, loading } = useSelector(state => state.exercises);

    // Calendar state
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState({}); // { 'YYYY-MM-DD': { exercises: [] } }
    const [selectedDate, setSelectedDate] = useState(null); // Currently editing date

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        difficulty: 'beginner',
    });
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1); // 1: info + calendar, 2: exercises for selected day
    const [isValidating, setIsValidating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBodyPart, setFilterBodyPart] = useState('');
    const [filterEquipment, setFilterEquipment] = useState('');
    const [previewExercise, setPreviewExercise] = useState(null);

    useEffect(() => {
        if (editingProgram) {
            setFormData({
                name: editingProgram.name || '',
                description: editingProgram.description || '',
                difficulty: editingProgram.difficulty || 'beginner',
            });
            // Convert schedule to selectedDates format
            if (editingProgram.scheduleDates) {
                setSelectedDates(editingProgram.scheduleDates);
            }
        }
    }, [editingProgram]);

    useEffect(() => {
        if (exercises.length === 0) {
            dispatch(fetchExercises());
        }
    }, [dispatch, exercises.length]);

    // Calendar calculations
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();
        const totalDays = lastDay.getDate();

        const days = [];

        // Previous month padding
        const prevMonth = new Date(year, month, 0);
        for (let i = startPadding - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonth.getDate() - i),
                isCurrentMonth: false,
            });
        }

        // Current month
        for (let i = 1; i <= totalDays; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            });
        }

        // Next month padding
        const remaining = 42 - days.length; // 6 rows × 7 days
        for (let i = 1; i <= remaining; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            });
        }

        return days;
    }, [currentMonth]);

    const formatDateKey = useCallback((date) => {
        return date.toISOString().split('T')[0];
    }, []);

    const handlePrevMonth = useCallback(() => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }, []);

    const handleDateClick = useCallback((date) => {
        const dateKey = formatDateKey(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Don't allow past dates
        if (date < today) return;

        setSelectedDates(prev => {
            if (prev[dateKey]) {
                // Already selected - open exercise editor
                setSelectedDate(dateKey);
                setStep(2);
                return prev;
            } else {
                // Select the date
                return {
                    ...prev,
                    [dateKey]: { name: '', exercises: [] }
                };
            }
        });
    }, [formatDateKey]);

    const handleDateDoubleClick = useCallback((date) => {
        const dateKey = formatDateKey(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date < today) return;

        if (selectedDates[dateKey]) {
            setSelectedDate(dateKey);
            setStep(2);
        }
    }, [formatDateKey, selectedDates]);

    const handleRemoveDate = useCallback((dateKey, e) => {
        e.stopPropagation();
        setSelectedDates(prev => {
            const newDates = { ...prev };
            delete newDates[dateKey];
            return newDates;
        });
    }, []);

    const handleExerciseSelect = useCallback((exercise) => {
        if (!selectedDate) return;

        setSelectedDates(prev => {
            const dayData = prev[selectedDate] || { exercises: [] };
            const exerciseExists = dayData.exercises.some(e => e.id === exercise.id);

            const updatedExercises = exerciseExists
                ? dayData.exercises.filter(e => e.id !== exercise.id)
                : [...dayData.exercises, {
                    id: exercise.id,
                    name: exercise.name,
                    bodyPart: exercise.bodyPart,
                    localGif: exercise.localGif,
                    sets: 3,
                    reps: 10,
                    rest: 60
                }];

            return {
                ...prev,
                [selectedDate]: { ...dayData, exercises: updatedExercises },
            };
        });
    }, [selectedDate]);

    const handleRemoveExercise = useCallback((exerciseId) => {
        if (!selectedDate) return;

        setSelectedDates(prev => {
            const dayData = prev[selectedDate];
            if (!dayData) return prev;

            return {
                ...prev,
                [selectedDate]: {
                    ...dayData,
                    exercises: dayData.exercises.filter(e => e.id !== exerciseId),
                },
            };
        });
    }, [selectedDate]);

    const handleUpdateExercise = useCallback((exerciseId, field, value) => {
        if (!selectedDate) return;

        setSelectedDates(prev => {
            const dayData = prev[selectedDate];
            if (!dayData) return prev;

            return {
                ...prev,
                [selectedDate]: {
                    ...dayData,
                    exercises: dayData.exercises.map(e =>
                        e.id === exerciseId ? { ...e, [field]: parseInt(value) || value } : e
                    ),
                },
            };
        });
    }, [selectedDate]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }, [errors]);

    const validateForm = useCallback(async () => {
        const newErrors = {};
        setIsValidating(true);

        // Simulate async validation
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!formData.name.trim()) {
            newErrors.name = 'Program name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }

        if (Object.keys(selectedDates).length === 0) {
            newErrors.dates = 'Select at least one training day';
        }

        setIsValidating(false);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, selectedDates]);

    const handleSubmit = useCallback(async () => {
        const isValid = await validateForm();
        if (!isValid) return;

        // Calculate duration based on selected dates
        const dates = Object.keys(selectedDates).sort();
        const startDate = dates[0];
        const endDate = dates[dates.length - 1];
        const start = new Date(startDate);
        const end = new Date(endDate);
        const duration = Math.ceil((end - start) / (7 * 24 * 60 * 60 * 1000)) + 1;

        const programData = {
            ...formData,
            scheduleDates: selectedDates,
            duration: duration,
            daysPerWeek: [], // Legacy field
            schedule: {}, // Legacy field
            id: editingId,
        };

        if (editingId) {
            dispatch(updateProgram(programData));
        } else {
            dispatch(addProgram(programData));
        }

        onClose();
    }, [formData, selectedDates, editingId, dispatch, onClose, validateForm]);

    // Get unique values for filters
    const bodyParts = useMemo(() => {
        const parts = [...new Set(exercises.map(e => e.bodyPart))];
        return parts.sort();
    }, [exercises]);

    const equipmentList = useMemo(() => {
        const equip = [...new Set(exercises.map(e => e.equipment))];
        return equip.sort();
    }, [exercises]);

    // Filter exercises
    const filteredExercises = useMemo(() => {
        let filtered = exercises;

        if (searchTerm) {
            filtered = filtered.filter(e =>
                e.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterBodyPart) {
            filtered = filtered.filter(e => e.bodyPart === filterBodyPart);
        }

        if (filterEquipment) {
            filtered = filtered.filter(e => e.equipment === filterEquipment);
        }

        return filtered.slice(0, 30);
    }, [exercises, searchTerm, filterBodyPart, filterEquipment]);

    const totalExercises = useMemo(() => {
        return Object.values(selectedDates).reduce((acc, day) => acc + (day.exercises?.length || 0), 0);
    }, [selectedDates]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal program-form-modal large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <Calendar size={22} />
                        {editingId ? 'Edit Program' : 'Create Training Program'}
                    </h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {step === 1 && (
                        <div className="program-builder">
                            {/* Left side: Form info */}
                            <div className="form-info">
                                <div className="input-group">
                                    <label className="input-label">Program Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className={`input ${errors.name ? 'input-error' : ''}`}
                                        placeholder="e.g., My 4-Week Split"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                    {isValidating && <span className="validating">Checking...</span>}
                                    {errors.name && <span className="error-message">{errors.name}</span>}
                                </div>

                                <div className="input-group">
                                    <label className="input-label">Description</label>
                                    <textarea
                                        name="description"
                                        className="input"
                                        placeholder="Describe your program goals..."
                                        rows={2}
                                        value={formData.description}
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

                                <div className="program-stats">
                                    <div className="stat">
                                        <span className="stat-value">{Object.keys(selectedDates).length}</span>
                                        <span className="stat-label">Days Selected</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-value">{totalExercises}</span>
                                        <span className="stat-label">Total Exercises</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right side: Calendar */}
                            <div className="calendar-container">
                                <div className="calendar-header">
                                    <button className="btn btn-ghost btn-icon" onClick={handlePrevMonth}>
                                        <ChevronLeft size={20} />
                                    </button>
                                    <h3>{MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                                    <button className="btn btn-ghost btn-icon" onClick={handleNextMonth}>
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                <div className="calendar-grid">
                                    {DAY_NAMES.map(day => (
                                        <div key={day} className="calendar-day-name">{day}</div>
                                    ))}

                                    {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                                        const dateKey = formatDateKey(date);
                                        const isSelected = !!selectedDates[dateKey];
                                        const hasExercises = selectedDates[dateKey]?.exercises?.length > 0;
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const isPast = date < today;
                                        const isToday = date.toDateString() === today.toDateString();

                                        return (
                                            <div
                                                key={idx}
                                                className={`calendar-day 
                                                    ${!isCurrentMonth ? 'other-month' : ''} 
                                                    ${isSelected ? 'selected' : ''} 
                                                    ${hasExercises ? 'has-exercises' : ''}
                                                    ${isPast ? 'past' : ''}
                                                    ${isToday ? 'today' : ''}
                                                `}
                                                onClick={() => handleDateClick(date)}
                                                onDoubleClick={() => handleDateDoubleClick(date)}
                                            >
                                                <span className="day-number">{date.getDate()}</span>
                                                {isSelected && (
                                                    <div className="day-indicator">
                                                        {selectedDates[dateKey]?.name ? (
                                                            <span className="day-name-label">
                                                                {selectedDates[dateKey].name}
                                                            </span>
                                                        ) : (
                                                            <Dumbbell size={12} />
                                                        )}
                                                        {hasExercises && (
                                                            <span className="exercise-count">
                                                                {selectedDates[dateKey].exercises.length}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {errors.dates && <span className="error-message">{errors.dates}</span>}

                                <p className="calendar-hint">
                                    Click to select workout days. Click selected day to add exercises.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && selectedDate && (
                        <div className="exercise-editor">
                            <div className="editor-header">
                                <button className="btn btn-ghost" onClick={() => setStep(1)}>
                                    <ChevronLeft size={18} />
                                    Back to Calendar
                                </button>
                                <div className="day-title-section">
                                    <span className="day-date">
                                        {new Date(selectedDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                    <input
                                        type="text"
                                        className="day-name-input"
                                        placeholder="Enter day name (e.g., Chest Day)"
                                        value={selectedDates[selectedDate]?.name || ''}
                                        onChange={(e) => {
                                            setSelectedDates(prev => ({
                                                ...prev,
                                                [selectedDate]: {
                                                    ...prev[selectedDate],
                                                    name: e.target.value
                                                }
                                            }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="editor-content">
                                {/* Selected exercises */}
                                <div className="selected-exercises-panel">
                                    <h4>
                                        <Dumbbell size={18} />
                                        Workout ({selectedDates[selectedDate]?.exercises?.length || 0} exercises)
                                    </h4>

                                    {selectedDates[selectedDate]?.exercises?.length > 0 ? (
                                        <div className="exercise-list">
                                            {selectedDates[selectedDate].exercises.map((ex, idx) => (
                                                <div key={ex.id} className="exercise-item-card">
                                                    <div className="exercise-item-header">
                                                        <span className="exercise-number">{idx + 1}</span>
                                                        <div className="exercise-info">
                                                            <span className="exercise-name">{ex.name}</span>
                                                            <span className="exercise-body-part">{ex.bodyPart}</span>
                                                        </div>
                                                        <button
                                                            className="btn btn-ghost btn-icon delete-btn"
                                                            onClick={() => handleRemoveExercise(ex.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="exercise-config-row">
                                                        <div className="config-item">
                                                            <label>Sets</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="10"
                                                                value={ex.sets}
                                                                onChange={(e) => handleUpdateExercise(ex.id, 'sets', e.target.value)}
                                                            />
                                                        </div>
                                                        <span className="config-separator">×</span>
                                                        <div className="config-item">
                                                            <label>Reps</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="50"
                                                                value={ex.reps}
                                                                onChange={(e) => handleUpdateExercise(ex.id, 'reps', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="config-item rest">
                                                            <label>Rest</label>
                                                            <div className="rest-input">
                                                                <input
                                                                    type="number"
                                                                    min="15"
                                                                    max="300"
                                                                    step="15"
                                                                    value={ex.rest}
                                                                    onChange={(e) => handleUpdateExercise(ex.id, 'rest', e.target.value)}
                                                                />
                                                                <span>s</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="empty-message">No exercises added yet. Select from the list below.</p>
                                    )}
                                </div>

                                {/* Exercise picker */}
                                <div className="exercise-picker-panel">
                                    <div className="picker-header">
                                        <h4>
                                            <Plus size={18} />
                                            Add Exercises
                                        </h4>
                                        <div className="search-box">
                                            <Search size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search exercises..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="filter-row">
                                        <select
                                            className="filter-select"
                                            value={filterBodyPart}
                                            onChange={(e) => setFilterBodyPart(e.target.value)}
                                        >
                                            <option value="">All Body Parts</option>
                                            {bodyParts.map(part => (
                                                <option key={part} value={part}>{part}</option>
                                            ))}
                                        </select>
                                        <select
                                            className="filter-select"
                                            value={filterEquipment}
                                            onChange={(e) => setFilterEquipment(e.target.value)}
                                        >
                                            <option value="">All Equipment</option>
                                            {equipmentList.map(equip => (
                                                <option key={equip} value={equip}>{equip}</option>
                                            ))}
                                        </select>
                                        {(filterBodyPart || filterEquipment || searchTerm) && (
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => {
                                                    setFilterBodyPart('');
                                                    setFilterEquipment('');
                                                    setSearchTerm('');
                                                }}
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>

                                    {loading ? (
                                        <p>Loading exercises...</p>
                                    ) : (
                                        <div className="exercise-picker-grid">
                                            {filteredExercises.map(exercise => {
                                                const isSelected = selectedDates[selectedDate]?.exercises?.some(
                                                    e => e.id === exercise.id
                                                );
                                                return (
                                                    <div
                                                        key={exercise.id}
                                                        className={`picker-exercise-card ${isSelected ? 'selected' : ''}`}
                                                    >
                                                        <img
                                                            src={exercise.localPng || exercise.localGif}
                                                            alt={exercise.name}
                                                            onClick={() => handleExerciseSelect(exercise)}
                                                        />
                                                        <div
                                                            className="picker-exercise-info"
                                                            onClick={() => handleExerciseSelect(exercise)}
                                                        >
                                                            <span className="name">{exercise.name}</span>
                                                            <span className="body-part">{exercise.bodyPart}</span>
                                                        </div>
                                                        <button
                                                            className="btn btn-ghost btn-icon preview-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPreviewExercise(exercise);
                                                            }}
                                                            title="View details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        {isSelected && (
                                                            <div className="selected-badge">✓</div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                    {step === 1 && (
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={isValidating}
                        >
                            {editingId ? 'Save Program' : 'Create Program'}
                        </button>
                    )}
                    {step === 2 && (
                        <button className="btn btn-primary" onClick={() => setStep(1)}>
                            Done Adding Exercises
                        </button>
                    )}
                </div>
            </div>

            {/* Exercise Preview Modal */}
            {previewExercise && (
                <div className="modal-overlay preview-overlay" onClick={() => setPreviewExercise(null)}>
                    <div className="modal exercise-preview-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{previewExercise.name}</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setPreviewExercise(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body preview-body">
                            <div className="preview-gif">
                                <img
                                    src={previewExercise.localGif || previewExercise.localPng}
                                    alt={previewExercise.name}
                                />
                            </div>
                            <div className="preview-details">
                                <div className="detail-row">
                                    <span className="detail-label">Body Part</span>
                                    <span className="detail-value">{previewExercise.bodyPart}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Target Muscle</span>
                                    <span className="detail-value">{previewExercise.target}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Equipment</span>
                                    <span className="detail-value">{previewExercise.equipment}</span>
                                </div>
                                {previewExercise.secondaryMuscles?.length > 0 && (
                                    <div className="detail-row">
                                        <span className="detail-label">Secondary Muscles</span>
                                        <span className="detail-value">
                                            {previewExercise.secondaryMuscles.join(', ')}
                                        </span>
                                    </div>
                                )}
                                {previewExercise.instructions?.length > 0 && (
                                    <div className="instructions-section">
                                        <span className="detail-label">Instructions</span>
                                        <ol className="instructions-list">
                                            {previewExercise.instructions.map((inst, idx) => (
                                                <li key={idx}>{inst}</li>
                                            ))}
                                        </ol>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setPreviewExercise(null)}
                            >
                                Close
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    handleExerciseSelect(previewExercise);
                                    setPreviewExercise(null);
                                }}
                            >
                                <Plus size={18} />
                                Add to Workout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default ProgramForm;
