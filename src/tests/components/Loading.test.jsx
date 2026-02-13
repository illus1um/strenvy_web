import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from '../../components/common/Loading';

describe('Loading component', () => {
    test('should render with default text', () => {
        render(<Loading />);
        expect(screen.getByText('Loading...')).toBeDefined();
    });

    test('should render with custom text', () => {
        render(<Loading text="Please wait..." />);
        expect(screen.getByText('Please wait...')).toBeDefined();
    });

    test('should render spinner rings', () => {
        const { container } = render(<Loading />);
        const rings = container.querySelectorAll('.spinner-ring');
        expect(rings.length).toBe(3);
    });

    test('should have loading-container class', () => {
        const { container } = render(<Loading />);
        expect(container.querySelector('.loading-container')).not.toBeNull();
    });
});
