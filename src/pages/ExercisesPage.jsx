import React, { memo, useState, useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExercises, setFilter, clearFilters } from '../store/slices/exercisesSlice';
import ExerciseCard from '../components/exercises/ExerciseCard';
import ExerciseFilter from '../components/exercises/ExerciseFilter';
import Loading from '../components/common/Loading';
import ExerciseModal from '../components/exercises/ExerciseModal';
import './ExercisesPage.css';

const ExercisesPage = memo(function ExercisesPage() {
    const dispatch = useDispatch();
    const { filtered, loading, error, filters, bodyParts, equipments, targets } = useSelector(
        state => state.exercises
    );
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [page, setPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        dispatch(fetchExercises());
    }, [dispatch]);

    const handleFilterChange = useCallback((key, value) => {
        dispatch(setFilter({ key, value }));
        setPage(1);
    }, [dispatch]);

    const handleClearFilters = useCallback(() => {
        dispatch(clearFilters());
        setPage(1);
    }, [dispatch]);

    const paginatedExercises = useMemo(() => {
        const start = 0;
        const end = page * itemsPerPage;
        return filtered.slice(start, end);
    }, [filtered, page]);

    const hasMore = paginatedExercises.length < filtered.length;

    const handleLoadMore = useCallback(() => {
        setPage(prev => prev + 1);
    }, []);

    if (loading && filtered.length === 0) {
        return <Loading text="Loading exercises..." />;
    }

    if (error) {
        return (
            <div className="page">
                <div className="container">
                    <div className="error-state">
                        <h2>Error loading exercises</h2>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => dispatch(fetchExercises())}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page exercises-page">
            <div className="container">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Exercise Library</h1>
                        <p className="text-muted">
                            {filtered.length} exercises found
                        </p>
                    </div>
                </div>

                <ExerciseFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    bodyParts={bodyParts}
                    equipments={equipments}
                    targets={targets}
                />

                <div className="exercises-grid">
                    {paginatedExercises.map(exercise => (
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onViewDetails={setSelectedExercise}
                        />
                    ))}
                </div>

                {hasMore && (
                    <div className="load-more">
                        <button className="btn btn-secondary" onClick={handleLoadMore}>
                            Load More ({filtered.length - paginatedExercises.length} remaining)
                        </button>
                    </div>
                )}

                {selectedExercise && (
                    <ExerciseModal
                        exercise={selectedExercise}
                        onClose={() => setSelectedExercise(null)}
                    />
                )}
            </div>
        </div>
    );
});

export default ExercisesPage;
