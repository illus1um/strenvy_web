import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin } = useSelector(state => state.user);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/profile" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
