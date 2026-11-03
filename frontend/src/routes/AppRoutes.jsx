import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import StudentLayout from '../layouts/StudentLayout';
import StaffLayout from '../layouts/StaffLayout';
import AdminLayout from '../layouts/AdminLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import StudentDashboard from '../pages/student/StudentDashboard';
import ReportIssuePage from '../pages/student/ReportIssuePage';
import StudentComplaintsPage from '../pages/student/StudentComplaintsPage';
import StudentComplaintDetailPage from '../pages/student/StudentComplaintDetailPage';

// Student Gamification & Wallet Pages
import StudentWalletPage from '../pages/student/StudentWalletPage';
import TransactionHistoryPage from '../pages/student/TransactionHistoryPage';
import RewardStorePage from '../pages/student/RewardStorePage';
import RedemptionHistoryPage from '../pages/student/RedemptionHistoryPage';
import BadgesPage from '../pages/student/BadgesPage';
import MissionsPage from '../pages/student/MissionsPage';
import LeaderboardPage from '../pages/student/LeaderboardPage';

// Staff Pages
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffComplaintsPage from '../pages/staff/StaffComplaintsPage';
import StaffComplaintDetailPage from '../pages/staff/StaffComplaintDetailPage';
import StaffVerifyVoucherPage from '../pages/staff/StaffVerifyVoucherPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminComplaintsPage from '../pages/admin/AdminComplaintsPage';
import AdminComplaintDetailPage from '../pages/admin/AdminComplaintDetailPage';
import AdminRewardsPage from '../pages/admin/AdminRewardsPage';
import AdminRedemptionsPage from '../pages/admin/AdminRedemptionsPage';
import AdminGamificationPage from '../pages/admin/AdminGamificationPage';
import AdminSLAPage from '../pages/admin/AdminSLAPage';

// Common Interactive Pages
import CampusMapPage from '../pages/common/CampusMapPage';
import CommunityBountiesPage from '../pages/common/CommunityBountiesPage';

import ProfilePage from '../pages/profile/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

// Route Guard
import ProtectedRoute, { StudentRoute, StaffRoute, AdminRoute } from './ProtectedRoute';
import { ROLES } from '../constants/roles';
import { useAuth } from '../context/AuthContext';

// Root Path Redirector: If user is authenticated, route to their role dashboard; else route to /login
const RootRedirector = () => {
  const { user, role, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAF7]">
        <div className="w-8 h-8 border-3 border-[#168451] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role === ROLES.STAFF) return <Navigate to="/staff/dashboard" replace />;
  if (role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

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
      {/* Root redirect: Landing page removed, opens straight to Dashboard or Login */}
      <Route path="/" element={<RootRedirector />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/landing" element={<Navigate to="/" replace />} />

      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/campus-map" element={<CampusMapPage />} />
        <Route path="/map" element={<CampusMapPage />} />
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
        <Route path="complaints" element={<StudentComplaintsPage />} />
        <Route path="complaints/new" element={<ReportIssuePage />} />
        <Route path="report" element={<ReportIssuePage />} />
        <Route path="complaints/:id" element={<StudentComplaintDetailPage />} />

        {/* Map & Bounties */}
        <Route path="map" element={<CampusMapPage />} />
        <Route path="bounties" element={<CommunityBountiesPage />} />

        {/* Gamification & Wallet Routes */}
        <Route path="wallet" element={<StudentWalletPage />} />
        <Route path="wallet/transactions" element={<TransactionHistoryPage />} />
        <Route path="rewards" element={<RewardStorePage />} />
        <Route path="rewards/history" element={<RedemptionHistoryPage />} />
        <Route path="badges" element={<BadgesPage />} />
        <Route path="missions" element={<MissionsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />

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
        <Route path="complaints" element={<StaffComplaintsPage />} />
        <Route path="complaints/:id" element={<StaffComplaintDetailPage />} />
        <Route path="verify-voucher" element={<StaffVerifyVoucherPage />} />
        <Route path="map" element={<CampusMapPage />} />
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
        <Route path="complaints" element={<AdminComplaintsPage />} />
        <Route path="complaints/:id" element={<AdminComplaintDetailPage />} />
        <Route path="sla" element={<AdminSLAPage />} />
        <Route path="map" element={<CampusMapPage />} />
        <Route path="bounties" element={<CommunityBountiesPage />} />

        {/* Gamification & Rewards Admin */}
        <Route path="rewards" element={<AdminRewardsPage />} />
        <Route path="rewards/redemptions" element={<AdminRedemptionsPage />} />
        <Route path="gamification" element={<AdminGamificationPage />} />

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
