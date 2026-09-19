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
import ProfilePage from '../pages/profile/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

// Route Guard
import ProtectedRoute, { StudentRoute, StaffRoute, AdminRoute } from './ProtectedRoute';
import { ROLES } from '../constants/roles';
import { useAuth } from '../context/AuthContext';

// Profile Redirector helper component
const ProfileRedirector = () => {
  const { role } = useAuth();
  if (role === ROLES.STAFF) return <Navigate to="/staff/profile" replace />;
  if (role === ROLES.ADMIN) return <Navigate to="/admin/profile" replace />;
  return <Navigate to="/student/profile" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Direct /profile shortcut */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileRedirector />
          </ProtectedRoute>
        }
      />

      {/* Student Portal */}
      <Route
        path="/student"
        element={
          <StudentRoute>
            <StudentLayout />
          </StudentRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route index element={<Navigate to="/student/dashboard" replace />} />
      </Route>

      {/* Staff Portal */}
      <Route
        path="/staff"
        element={
          <StaffRoute>
            <StaffLayout />
          </StaffRoute>
        }
      >
        <Route path="dashboard" element={<StaffDashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route index element={<Navigate to="/staff/dashboard" replace />} />
      </Route>

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="profile" element={<ProfilePage />} />
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
