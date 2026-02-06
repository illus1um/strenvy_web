import React, { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = memo(function PrivateRoute({ children }) {
    const { isAuthenticated } = useSelector(state => state.user);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/profile" state={{ from: location }} replace />;
    }

    return children;
});

export default PrivateRoute;
