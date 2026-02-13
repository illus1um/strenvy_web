import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock react-router-dom to avoid Navigate hanging
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        Navigate: ({ to }) => <div data-testid="navigate" data-to={to} />,
        useLocation: () => ({ pathname: '/test' }),
    };
});

import PrivateRoute from '../../components/common/PrivateRoute';

const createMockStore = (userState) => {
    return configureStore({
        reducer: {
            user: () => userState,
        },
    });
};

const renderWithStore = (userState, children) => {
    const store = createMockStore(userState);
    return render(
        <Provider store={store}>
            <PrivateRoute>{children}</PrivateRoute>
        </Provider>
    );
};

describe('PrivateRoute component', () => {
    test('should show loading when auth not checked', () => {
        renderWithStore(
            { isAuthenticated: false, authChecked: false },
            <div>Protected Content</div>
        );

        expect(screen.getByText('Checking authentication...')).toBeDefined();
        expect(screen.queryByText('Protected Content')).toBeNull();
    });

    test('should render children when authenticated', () => {
        renderWithStore(
            { isAuthenticated: true, authChecked: true },
            <div>Protected Content</div>
        );

        expect(screen.getByText('Protected Content')).toBeDefined();
    });

    test('should redirect to login when not authenticated', () => {
        renderWithStore(
            { isAuthenticated: false, authChecked: true },
            <div>Protected Content</div>
        );

        expect(screen.queryByText('Protected Content')).toBeNull();
        const navigate = screen.getByTestId('navigate');
        expect(navigate.getAttribute('data-to')).toBe('/login');
    });
});
