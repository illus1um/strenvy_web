import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExerciseCard from '../../components/exercises/ExerciseCard';

const mockExercise = {
    id: '0001',
    name: 'Push-up',
    bodyPart: 'chest',
    equipment: 'body weight',
    target: 'pectorals',
    localGif: '/gifs/0001.gif',
    localPng: '/gifs/0001.png',
};

describe('ExerciseCard component', () => {
    test('should render exercise name', () => {
        render(<ExerciseCard exercise={mockExercise} />);
        expect(screen.getByText('Push-up')).toBeDefined();
    });

    test('should render exercise target and bodyPart badges', () => {
        render(<ExerciseCard exercise={mockExercise} />);
        expect(screen.getByText('pectorals')).toBeDefined();
        expect(screen.getByText('chest')).toBeDefined();
    });

    test('should render exercise equipment', () => {
        render(<ExerciseCard exercise={mockExercise} />);
        expect(screen.getByText('body weight')).toBeDefined();
    });

    test('should show View button when not selectable', () => {
        render(<ExerciseCard exercise={mockExercise} onViewDetails={() => {}} />);
        expect(screen.getByText('View')).toBeDefined();
    });

    test('should show Add button when selectable and not selected', () => {
        render(
            <ExerciseCard
                exercise={mockExercise}
                selectable={true}
                isSelected={false}
                onSelect={() => {}}
            />
        );
        expect(screen.getByText('Add')).toBeDefined();
    });

    test('should show Selected button when selectable and selected', () => {
        render(
            <ExerciseCard
                exercise={mockExercise}
                selectable={true}
                isSelected={true}
                onSelect={() => {}}
            />
        );
        expect(screen.getByText('Selected')).toBeDefined();
    });

    test('should call onSelect when selectable and clicked', () => {
        const onSelect = vi.fn();
        const { container } = render(
            <ExerciseCard
                exercise={mockExercise}
                selectable={true}
                onSelect={onSelect}
            />
        );

        fireEvent.click(container.querySelector('.exercise-card'));
        expect(onSelect).toHaveBeenCalledWith(mockExercise);
    });

    test('should call onViewDetails when not selectable and clicked', () => {
        const onViewDetails = vi.fn();
        const { container } = render(
            <ExerciseCard
                exercise={mockExercise}
                onViewDetails={onViewDetails}
            />
        );

        fireEvent.click(container.querySelector('.exercise-card'));
        expect(onViewDetails).toHaveBeenCalledWith(mockExercise);
    });

    test('should have selected class when isSelected is true', () => {
        const { container } = render(
            <ExerciseCard
                exercise={mockExercise}
                selectable={true}
                isSelected={true}
                onSelect={() => {}}
            />
        );

        expect(container.querySelector('.exercise-card.selected')).not.toBeNull();
    });

    test('should render image with lazy loading', () => {
        render(<ExerciseCard exercise={mockExercise} />);
        const img = screen.getByAltText('Push-up');
        expect(img.getAttribute('loading')).toBe('lazy');
    });
});
