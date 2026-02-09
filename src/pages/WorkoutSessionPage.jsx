import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus,
    Check,
    Clock,
    Trophy,
    X,
    Timer,
} from 'lucide-react';
import {
    updateSet,
    toggleSetComplete,
    addSet,
    removeSet,
    setCurrentExercise,
    endSession,
} from '../store/slices/sessionSlice';
import { logWorkout } from '../store/slices/progressSlice';
import './WorkoutSessionPage.css';

const WorkoutSessionPage = memo(function WorkoutSessionPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { active, workout, startedAt, currentExerciseIndex } = useSelector(state => state.session);
    const [elapsed, setElapsed] = useState(0);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [restTimer, setRestTimer] = useState(0);
    const [showGif, setShowGif] = useState(true);

    // Timer
    useEffect(() => {
        if (!active || !startedAt) return;
        const start = new Date(startedAt).getTime();
        const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [active, startedAt]);

    // Rest timer countdown
    useEffect(() => {
        if (restTimer <= 0) return;
        const interval = setInterval(() => {
            setRestTimer(prev => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [restTimer]);

    // Redirect if no active session
    useEffect(() => {
        if (!active && !workout) {
            const timer = setTimeout(() => navigate('/'), 100);
            return () => clearTimeout(timer);
        }
    }, [active, workout, navigate]);

    const formatTime = useCallback((seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    }, []);

    const currentExercise = workout?.exercises?.[currentExerciseIndex];
    const totalExercises = workout?.exercises?.length || 0;

    const progress = useMemo(() => {
        if (!workout?.exercises) return { completed: 0, total: 0 };
        let completed = 0;
        let total = 0;
        workout.exercises.forEach(ex => {
            ex.sets.forEach(s => {
                total++;
                if (s.completed) completed++;
            });
        });
        return { completed, total };
    }, [workout]);

    const exerciseProgress = useMemo(() => {
        if (!currentExercise) return { done: 0, total: 0 };
        const done = currentExercise.sets.filter(s => s.completed).length;
        return { done, total: currentExercise.sets.length };
    }, [currentExercise]);

    const handleSetChange = useCallback((setIndex, field, value) => {
        const numValue = value === '' ? 0 : Number(value);
        if (isNaN(numValue) || numValue < 0) return;
        dispatch(updateSet({ exerciseIndex: currentExerciseIndex, setIndex, field, value: numValue }));
    }, [dispatch, currentExerciseIndex]);

    const handleToggleComplete = useCallback((setIndex) => {
        dispatch(toggleSetComplete({ exerciseIndex: currentExerciseIndex, setIndex }));
        const set = currentExercise?.sets?.[setIndex];
        if (set && !set.completed && currentExercise.rest) {
            setRestTimer(currentExercise.rest);
        }
    }, [dispatch, currentExerciseIndex, currentExercise]);

    const handleAddSet = useCallback(() => {
        dispatch(addSet(currentExerciseIndex));
    }, [dispatch, currentExerciseIndex]);

    const handleRemoveSet = useCallback((setIndex) => {
        dispatch(removeSet({ exerciseIndex: currentExerciseIndex, setIndex }));
    }, [dispatch, currentExerciseIndex]);

    const handlePrevExercise = useCallback(() => {
        if (currentExerciseIndex > 0) {
            dispatch(setCurrentExercise(currentExerciseIndex - 1));
            setRestTimer(0);
        }
    }, [dispatch, currentExerciseIndex]);

    const handleNextExercise = useCallback(() => {
        if (currentExerciseIndex < totalExercises - 1) {
            dispatch(setCurrentExercise(currentExerciseIndex + 1));
            setRestTimer(0);
        }
    }, [dispatch, currentExerciseIndex, totalExercises]);

    const handleFinishWorkout = useCallback(async () => {
        if (!workout || saving) return;
        setSaving(true);
        setSaveError(null);

        const workoutData = {
            name: workout.name,
            programId: workout.programId,
            startedAt,
            duration: elapsed,
            exercises: workout.exercises.map(ex => ({
                id: ex.id,
                name: ex.name,
                bodyPart: ex.bodyPart,
                target: ex.target,
                secondaryMuscles: ex.secondaryMuscles,
                sets: ex.sets.filter(s => s.completed).map(s => ({
                    setNumber: s.setNumber,
                    weight: s.weight,
                    reps: s.reps,
                    completed: true,
                })),
            })).filter(ex => ex.sets.length > 0),
        };

        try {
            const result = await dispatch(logWorkout(workoutData));
            if (result.error) {
                setSaveError('Failed to save workout. Try again.');
                setSaving(false);
                return;
            }
            dispatch(endSession());
            navigate('/progress');
        } catch {
            setSaveError('Failed to save workout. Try again.');
            setSaving(false);
        }
    }, [workout, startedAt, elapsed, dispatch, navigate, saving]);

    const handleCancelWorkout = useCallback(() => {
        dispatch(endSession());
        navigate('/');
    }, [dispatch, navigate]);

    if (!active || !workout || !currentExercise) return null;

    const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

    return (
        <div className="page session-page">
            {/* Session Header */}
            <div className="session-header">
                <div className="session-header-top">
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowFinishConfirm(true)} title="Cancel">
                        <X size={20} />
                    </button>
                    <div className="session-timer">
                        <Clock size={16} />
                        <span>{formatTime(elapsed)}</span>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowFinishConfirm(true)}>
                        <Trophy size={16} />
                        Finish
                    </button>
                </div>
                <div className="session-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="progress-text">{progress.completed}/{progress.total} sets</span>
                </div>
            </div>

            {/* Exercise Tabs */}
            <div className="exercise-tabs">
                {workout.exercises.map((ex, idx) => {
                    const allDone = ex.sets.every(s => s.completed);
                    const someDone = ex.sets.some(s => s.completed);
                    return (
                        <button
                            key={idx}
                            className={`exercise-tab ${idx === currentExerciseIndex ? 'active' : ''} ${allDone ? 'done' : someDone ? 'partial' : ''}`}
                            onClick={() => { dispatch(setCurrentExercise(idx)); setRestTimer(0); }}
                        >
                            {allDone && <Check size={12} />}
                            <span>{ex.name.length > 15 ? ex.name.substring(0, 15) + '...' : ex.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Current Exercise */}
            <div className="session-content">
                {/* Exercise Info Card with GIF */}
                <div className="exercise-info-card">
                    {currentExercise.localGif && showGif && (
                        <div className="exercise-gif-wrap">
                            <img src={currentExercise.localGif} alt={currentExercise.name} className="exercise-gif" />
                            <button className="gif-toggle-btn" onClick={() => setShowGif(false)} title="Hide">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className="exercise-info-row">
                        <div className="exercise-info-text">
                            <h2>{currentExercise.name}</h2>
                            <div className="exercise-tags">
                                <span className="etag etag-target">{currentExercise.target || currentExercise.bodyPart}</span>
                                {currentExercise.bodyPart && currentExercise.target && currentExercise.bodyPart !== currentExercise.target && (
                                    <span className="etag etag-body">{currentExercise.bodyPart}</span>
                                )}
                                {currentExercise.rest > 0 && (
                                    <span className="etag etag-rest">
                                        <Timer size={11} />
                                        {currentExercise.rest}s
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="exercise-counter-block">
                            <span className="exercise-counter">{currentExerciseIndex + 1}/{totalExercises}</span>
                            {!showGif && currentExercise.localGif && (
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowGif(true)} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                    Show GIF
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rest Timer */}
                {restTimer > 0 && (
                    <div className="rest-timer-banner">
                        <Timer size={18} />
                        <div className="rest-timer-info">
                            <span className="rest-timer-label">Rest</span>
                            <span className="rest-timer-value">{restTimer}s</span>
                        </div>
                        <div className="rest-timer-bar">
                            <div
                                className="rest-timer-fill"
                                style={{ width: `${(restTimer / (currentExercise.rest || 60)) * 100}%` }}
                            />
                        </div>
                        <button className="btn btn-ghost btn-sm rest-skip-btn" onClick={() => setRestTimer(0)}>Skip</button>
                    </div>
                )}

                {/* Sets Table */}
                <div className="sets-table">
                    <div className="sets-header">
                        <span className="col-set">Set</span>
                        <span className="col-weight">Weight (kg)</span>
                        <span className="col-reps">Reps</span>
                        <span className="col-done"></span>
                        <span className="col-action"></span>
                    </div>

                    {currentExercise.sets.map((set, setIdx) => (
                        <div key={setIdx} className={`set-row ${set.completed ? 'completed' : ''}`}>
                            <span className="col-set">{set.setNumber}</span>
                            <div className="col-weight">
                                <input
                                    type="number"
                                    className="set-input"
                                    value={set.weight || ''}
                                    placeholder="0"
                                    onChange={(e) => handleSetChange(setIdx, 'weight', e.target.value)}
                                    disabled={set.completed}
                                    min="0"
                                    step="0.5"
                                />
                            </div>
                            <div className="col-reps">
                                <input
                                    type="number"
                                    className="set-input"
                                    value={set.reps || ''}
                                    placeholder="0"
                                    onChange={(e) => handleSetChange(setIdx, 'reps', e.target.value)}
                                    disabled={set.completed}
                                    min="0"
                                />
                            </div>
                            <div className="col-done">
                                <button
                                    className={`btn-check ${set.completed ? 'checked' : ''}`}
                                    onClick={() => handleToggleComplete(setIdx)}
                                >
                                    <Check size={16} />
                                </button>
                            </div>
                            <div className="col-action">
                                {currentExercise.sets.length > 1 && !set.completed && (
                                    <button className="btn-remove" onClick={() => handleRemoveSet(setIdx)}>
                                        <Minus size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="btn btn-ghost add-set-btn" onClick={handleAddSet}>
                    <Plus size={16} />
                    Add Set
                </button>

                {/* Exercise mini-progress */}
                <div className="exercise-mini-progress">
                    {exerciseProgress.done}/{exerciseProgress.total} sets completed
                </div>

                {/* Navigation */}
                <div className="exercise-nav">
                    <button className="btn btn-ghost" onClick={handlePrevExercise} disabled={currentExerciseIndex === 0}>
                        <ChevronLeft size={18} />
                        Previous
                    </button>
                    <button
                        className={`btn ${currentExerciseIndex < totalExercises - 1 ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={handleNextExercise}
                        disabled={currentExerciseIndex === totalExercises - 1}
                    >
                        Next Exercise
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Finish Modal */}
            {showFinishConfirm && (
                <div className="modal-overlay" onClick={() => setShowFinishConfirm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Finish Workout?</h3>
                        <p>
                            You've completed {progress.completed} of {progress.total} sets.
                            {progress.completed === 0 && ' No sets will be saved.'}
                        </p>
                        {saveError && (
                            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '12px' }}>{saveError}</p>
                        )}
                        <div className="modal-actions">
                            <button className="btn btn-ghost" onClick={() => { setShowFinishConfirm(false); setSaveError(null); }}>
                                Continue Training
                            </button>
                            {progress.completed > 0 ? (
                                <button className="btn btn-primary" onClick={handleFinishWorkout} disabled={saving}>
                                    <Trophy size={16} />
                                    {saving ? 'Saving...' : 'Save & Finish'}
                                </button>
                            ) : (
                                <button className="btn btn-ghost" style={{ color: 'var(--color-error)' }} onClick={handleCancelWorkout}>
                                    Discard Workout
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default WorkoutSessionPage;
