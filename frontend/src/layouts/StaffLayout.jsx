import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import MobileHeader from '../components/layout/MobileHeader';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import BackendStatusBadge from '../components/layout/BackendStatusBadge';
import NotificationDropdown from '../components/layout/NotificationDropdown';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

const StaffLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, profile } = useAuth();

  const displayName = profile?.full_name || profile?.name || user?.email?.split('@')[0] || 'Staff Member';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#F7FAF7] text-[#17211B] antialiased">
      {/* Desktop Sidebar (lg+) */}
      <Sidebar role={ROLES.STAFF} />

      {/* Mobile Slide-Out Drawer (< lg) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[80vw] bg-white flex flex-col h-full shadow-2xl border-r border-[#E1E9E2]">
            <Sidebar
              role={ROLES.STAFF}
              isMobile
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (< lg) */}
        <div className="lg:hidden">
          <MobileHeader title="Staff Console" onOpenMenu={() => setMobileSidebarOpen(true)} />
        </div>

        {/* Desktop Sticky Header (lg+) */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 border-b border-[#E1E9E2] bg-white/95 backdrop-blur-md px-6 lg:px-8 items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-[#647168]">
            <span className="font-bold text-[#17211B]">Staff & Facility Portal</span>
            <span>/</span>
            <span className="text-[#168451] font-semibold">Task Console</span>
          </div>

          <div className="flex items-center gap-3">
            <BackendStatusBadge compact />

            <div className="flex items-center gap-1.5 text-xs text-[#647168] bg-[#F7FAF7] border border-[#E1E9E2] px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
              <span className="font-medium">Staff Operator</span>
            </div>

            <NotificationDropdown />

            <Link
              to="/staff/profile"
              className="flex items-center gap-2 pl-2 border-l border-[#E1E9E2] hover:opacity-85 transition-opacity"
              title="My Profile"
            >
              <div className="w-8 h-8 rounded-full bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center font-bold text-xs overflow-hidden">
                {profile?.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </div>
              <span className="text-xs font-bold text-[#17211B] truncate max-w-[120px]">
                {displayName}
              </span>
            </Link>
          </div>
        </header>

        {/* Viewport Outlet */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          <Outlet />
        </main>

        <MobileBottomNav />
      </div>
    </div>
  );
};

export default StaffLayout;
