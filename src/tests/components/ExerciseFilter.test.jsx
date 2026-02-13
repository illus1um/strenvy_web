import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExerciseFilter from '../../components/exercises/ExerciseFilter';

const defaultFilters = {
    search: '',
    bodyPart: '',
    equipment: '',
    target: '',
};

const defaultProps = {
    filters: defaultFilters,
    onFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
    bodyParts: ['chest', 'back', 'upper legs'],
    equipments: ['barbell', 'dumbbell', 'body weight'],
    targets: ['pectorals', 'lats', 'quads'],
};

describe('ExerciseFilter component', () => {
    test('should render search input', () => {
        render(<ExerciseFilter {...defaultProps} />);
        expect(screen.getByPlaceholderText('Search exercises...')).toBeDefined();
    });

    test('should render body part options', () => {
        render(<ExerciseFilter {...defaultProps} />);
        expect(screen.getByText('All Body Parts')).toBeDefined();
        expect(screen.getByText('chest')).toBeDefined();
        expect(screen.getByText('back')).toBeDefined();
    });

    test('should render equipment options', () => {
        render(<ExerciseFilter {...defaultProps} />);
        expect(screen.getByText('All Equipment')).toBeDefined();
        expect(screen.getByText('barbell')).toBeDefined();
    });

    test('should render target options', () => {
        render(<ExerciseFilter {...defaultProps} />);
        expect(screen.getByText('All Targets')).toBeDefined();
        expect(screen.getByText('pectorals')).toBeDefined();
    });

    test('should call onFilterChange when typing in search', () => {
        const onFilterChange = vi.fn();
        render(<ExerciseFilter {...defaultProps} onFilterChange={onFilterChange} />);

        const input = screen.getByPlaceholderText('Search exercises...');
        fireEvent.change(input, { target: { value: 'push' } });

        expect(onFilterChange).toHaveBeenCalledWith('search', 'push');
    });

    test('should call onFilterChange when selecting body part', () => {
        const onFilterChange = vi.fn();
        render(<ExerciseFilter {...defaultProps} onFilterChange={onFilterChange} />);

        const selects = document.querySelectorAll('select');
        fireEvent.change(selects[0], { target: { value: 'chest' } });

        expect(onFilterChange).toHaveBeenCalledWith('bodyPart', 'chest');
    });

    test('should not show Clear button when no filters active', () => {
        render(<ExerciseFilter {...defaultProps} />);
        expect(screen.queryByText('Clear')).toBeNull();
    });

    test('should show Clear button when filters are active', () => {
        const activeFilters = { ...defaultFilters, bodyPart: 'chest' };
        render(<ExerciseFilter {...defaultProps} filters={activeFilters} />);

        expect(screen.getByText('Clear')).toBeDefined();
    });

    test('should call onClearFilters when Clear button clicked', () => {
        const onClearFilters = vi.fn();
        const activeFilters = { ...defaultFilters, search: 'push' };
        render(
            <ExerciseFilter
                {...defaultProps}
                filters={activeFilters}
                onClearFilters={onClearFilters}
            />
        );

        fireEvent.click(screen.getByText('Clear'));
        expect(onClearFilters).toHaveBeenCalled();
    });
});
