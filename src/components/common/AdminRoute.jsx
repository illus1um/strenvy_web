import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loading from './Loading';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, authChecked } = useSelector(state => state.user);
    const location = useLocation();

    if (!authChecked) {
        return <Loading text="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
