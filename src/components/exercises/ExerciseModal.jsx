import React, { memo } from 'react';
import { X, Target, Dumbbell, Info, ListChecks } from 'lucide-react';
import './ExerciseModal.css';

const ExerciseModal = memo(function ExerciseModal({ exercise, onClose }) {
    if (!exercise) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal exercise-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{exercise.name}</h2>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="exercise-modal-image">
                        <img
                            src={exercise.localGif}
                            alt={exercise.name}
                            onError={(e) => { e.target.src = exercise.localPng; }}
                        />
                    </div>

                    <div className="exercise-modal-info">
                        <div className="info-grid">
                            <div className="info-item">
                                <Target size={18} />
                                <div>
                                    <span className="info-label">Target</span>
                                    <span className="info-value">{exercise.target}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <Dumbbell size={18} />
                                <div>
                                    <span className="info-label">Equipment</span>
                                    <span className="info-value">{exercise.equipment}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <Info size={18} />
                                <div>
                                    <span className="info-label">Body Part</span>
                                    <span className="info-value">{exercise.bodyPart}</span>
                                </div>
                            </div>
                        </div>

                        {exercise.secondaryMuscles?.length > 0 && (
                            <div className="secondary-muscles">
                                <h4>Secondary Muscles</h4>
                                <div className="muscle-tags">
                                    {exercise.secondaryMuscles.map((muscle, idx) => (
                                        <span key={idx} className="badge">{muscle}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {exercise.instructions?.length > 0 && (
                            <div className="instructions">
                                <h4>
                                    <ListChecks size={18} />
                                    Instructions
                                </h4>
                                <ol className="instructions-list">
                                    {exercise.instructions.map((instruction, idx) => (
                                        <li key={idx}>{instruction}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ExerciseModal;
