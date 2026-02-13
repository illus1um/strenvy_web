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
        useLocation: () => ({ pathname: '/admin' }),
    };
});

import AdminRoute from '../../components/common/AdminRoute';

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
            <AdminRoute>{children}</AdminRoute>
        </Provider>
    );
};

describe('AdminRoute component', () => {
    test('should show loading when auth not checked', () => {
        renderWithStore(
            { isAuthenticated: false, isAdmin: false, authChecked: false },
            <div>Admin Content</div>
        );

        expect(screen.getByText('Checking authentication...')).toBeDefined();
        expect(screen.queryByText('Admin Content')).toBeNull();
    });

    test('should render children when authenticated as admin', () => {
        renderWithStore(
            { isAuthenticated: true, isAdmin: true, authChecked: true },
            <div>Admin Content</div>
        );

        expect(screen.getByText('Admin Content')).toBeDefined();
    });

    test('should redirect to login when not authenticated', () => {
        renderWithStore(
            { isAuthenticated: false, isAdmin: false, authChecked: true },
            <div>Admin Content</div>
        );

        expect(screen.queryByText('Admin Content')).toBeNull();
        const navigate = screen.getByTestId('navigate');
        expect(navigate.getAttribute('data-to')).toBe('/login');
    });

    test('should redirect to home when authenticated but not admin', () => {
        renderWithStore(
            { isAuthenticated: true, isAdmin: false, authChecked: true },
            <div>Admin Content</div>
        );

        expect(screen.queryByText('Admin Content')).toBeNull();
        const navigate = screen.getByTestId('navigate');
        expect(navigate.getAttribute('data-to')).toBe('/');
    });
});
