import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Reusable Role-based Protected Route component
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7FAF7] gap-3">
        <LoadingSpinner size="lg" color="text-[#168451]" />
        <p className="text-xs text-[#647168] font-medium">Verifying campus credentials...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, ensure caller possesses an allowed role
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === ROLES.STAFF) return <Navigate to="/staff/dashboard" replace />;
    if (role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

/**
 * Specific Route Wrappers for Student, Staff, and Admin
 */
export const StudentRoute = ({ children }) => {
  const { role } = useAuth();
  if (role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
  if (role === ROLES.STAFF) return <Navigate to="/staff/dashboard" replace />;
  return (
    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      {children}
    </ProtectedRoute>
  );
};

export const StaffRoute = ({ children }) => {
  const { role } = useAuth();
  if (role === ROLES.STUDENT) return <Navigate to="/student/dashboard" replace />;
  return (
    <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
      {children}
    </ProtectedRoute>
  );
};

export const AdminRoute = ({ children }) => {
  const { role } = useAuth();
  if (role === ROLES.STUDENT) return <Navigate to="/student/dashboard" replace />;
  if (role === ROLES.STAFF) return <Navigate to="/staff/dashboard" replace />;
  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
