import React, { memo, useState, useCallback } from 'react';
import { Eye, Plus, Check } from 'lucide-react';
import './ExerciseCard.css';

const ExerciseCard = memo(function ExerciseCard({
    exercise,
    onSelect,
    onViewDetails,
    isSelected = false,
    selectable = false
}) {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    const handleClick = useCallback(() => {
        if (selectable && onSelect) {
            onSelect(exercise);
        } else if (onViewDetails) {
            onViewDetails(exercise);
        }
    }, [selectable, onSelect, onViewDetails, exercise]);

    const imageSrc = isHovered && !imageError
        ? exercise.localGif
        : (imageError ? '/placeholder.png' : exercise.localPng);

    return (
        <div
            className={`exercise-card ${isSelected ? 'selected' : ''} ${selectable ? 'selectable' : ''}`}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="exercise-image-container">
                <img
                    src={imageSrc}
                    alt={exercise.name}
                    className="exercise-image"
                    loading="lazy"
                    onError={handleImageError}
                />
                {isSelected && (
                    <div className="selected-overlay">
                        <Check size={24} />
                    </div>
                )}
            </div>

            <div className="exercise-content">
                <h3 className="exercise-name">{exercise.name}</h3>

                <div className="exercise-meta">
                    <span className="badge">{exercise.target}</span>
                    <span className="badge">{exercise.bodyPart}</span>
                </div>

                <div className="exercise-equipment">
                    {exercise.equipment}
                </div>
            </div>

            <div className="exercise-actions">
                {selectable ? (
                    <button className="btn btn-sm btn-primary">
                        {isSelected ? <Check size={16} /> : <Plus size={16} />}
                        {isSelected ? 'Selected' : 'Add'}
                    </button>
                ) : (
                    <button
                        className="btn btn-sm btn-secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails?.(exercise);
                        }}
                    >
                        <Eye size={16} />
                        View
                    </button>
                )}
            </div>
        </div>
    );
});

export default ExerciseCard;
