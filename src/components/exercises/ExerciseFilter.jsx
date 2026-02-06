import React, { memo, useCallback } from 'react';
import { Search, X, Filter } from 'lucide-react';
import './ExerciseFilter.css';

const ExerciseFilter = memo(function ExerciseFilter({
    filters,
    onFilterChange,
    onClearFilters,
    bodyParts = [],
    equipments = [],
    targets = [],
}) {
    const handleSearchChange = useCallback((e) => {
        onFilterChange('search', e.target.value);
    }, [onFilterChange]);

    const handleSelectChange = useCallback((key) => (e) => {
        onFilterChange(key, e.target.value);
    }, [onFilterChange]);

    const hasActiveFilters = filters.search || filters.bodyPart || filters.equipment || filters.target;

    return (
        <div className="exercise-filter">
            <div className="filter-search">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    className="input search-input"
                    placeholder="Search exercises..."
                    value={filters.search}
                    onChange={handleSearchChange}
                />
                {filters.search && (
                    <button
                        className="search-clear"
                        onClick={() => onFilterChange('search', '')}
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="filter-selects">
                <div className="filter-select-wrapper">
                    <Filter size={16} className="filter-icon" />
                    <select
                        className="input select"
                        value={filters.bodyPart}
                        onChange={handleSelectChange('bodyPart')}
                    >
                        <option value="">All Body Parts</option>
                        {bodyParts.map(part => (
                            <option key={part} value={part}>{part}</option>
                        ))}
                    </select>
                </div>

                <select
                    className="input select"
                    value={filters.equipment}
                    onChange={handleSelectChange('equipment')}
                >
                    <option value="">All Equipment</option>
                    {equipments.map(eq => (
                        <option key={eq} value={eq}>{eq}</option>
                    ))}
                </select>

                <select
                    className="input select"
                    value={filters.target}
                    onChange={handleSelectChange('target')}
                >
                    <option value="">All Targets</option>
                    {targets.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                {hasActiveFilters && (
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={onClearFilters}
                    >
                        <X size={16} />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
});

export default ExerciseFilter;
