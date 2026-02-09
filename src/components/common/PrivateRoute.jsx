import React, { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loading from './Loading';

const PrivateRoute = memo(function PrivateRoute({ children }) {
    const { isAuthenticated, authChecked } = useSelector(state => state.user);
    const location = useLocation();

    if (!authChecked) {
        return <Loading text="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
});

export default PrivateRoute;
