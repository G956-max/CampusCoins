import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c14]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-campus-500 border-t-transparent" />
      </div>
    );
  }

  // Allow access in Phase 1 if authenticated, or redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === ROLES.STAFF) return <Navigate to="/staff/dashboard" replace />;
    if (role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
