import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import StudentLayout from '../layouts/StudentLayout';
import StaffLayout from '../layouts/StaffLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import StudentDashboard from '../pages/student/StudentDashboard';
import StaffDashboard from '../pages/staff/StaffDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import NotFoundPage from '../pages/NotFoundPage';

// Route Guard
import ProtectedRoute from './ProtectedRoute';
import { ROLES } from '../constants/roles';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Student Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT, ROLES.ADMIN]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route index element={<Navigate to="/student/dashboard" replace />} />
      </Route>

      {/* Staff Portal */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.ADMIN]}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
      </Route>

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* 404 Fallback */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
