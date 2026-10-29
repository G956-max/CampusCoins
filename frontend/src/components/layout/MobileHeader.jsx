import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Coins, ChevronLeft, Menu, Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import BackendStatusBadge from './BackendStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

const TITLE_MAP = {
  '/student': 'CampusCoins',
  '/student/dashboard': 'Dashboard',
  '/student/complaints': 'Campus Issues',
  '/student/report': 'Report Issue',
  '/student/map': 'Campus Map',
  '/student/rewards': 'Rewards Store',
  '/student/wallet': 'My Wallet',
  '/student/leaderboard': 'Leaderboard',
  '/student/missions': 'Daily Missions',
  '/student/badges': 'My Badges',
  '/student/profile': 'My Profile',
  '/staff': 'Staff Console',
  '/staff/complaints': 'Assigned Tasks',
  '/staff/verify-voucher': 'Verify Voucher',
  '/staff/profile': 'Staff Profile',
  '/admin': 'Admin Portal',
  '/admin/complaints': 'All Complaints',
  '/admin/rewards': 'Manage Rewards',
  '/admin/analytics': 'Analytics',
  '/admin/sla': 'SLA Monitoring',
  '/admin/profile': 'Admin Profile',
};

const MobileHeader = ({ title: overrideTitle, onOpenMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, wallet, role } = useAuth();

  const pathname = location.pathname.toLowerCase().replace(/\/+$/, '');
  const isRootTab =
    pathname === '/student' ||
    pathname === '/student/dashboard' ||
    pathname === '/staff' ||
    pathname === '/staff/dashboard' ||
    pathname === '/admin' ||
    pathname === '/admin/dashboard';

  const title = overrideTitle || TITLE_MAP[pathname] || 'CampusCoins';
  const displayName = profile?.full_name || profile?.name || user?.email?.split('@')[0] || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const coinBalance = wallet?.balance ?? 0;

  const profilePath =
    role === ROLES.STAFF
      ? '/staff/profile'
      : role === ROLES.ADMIN
      ? '/admin/profile'
      : '/student/profile';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E1E9E2] h-14 px-3 flex items-center justify-between shadow-xs">
      {/* Left section: Hamburger or Back Button + Title */}
      <div className="flex items-center gap-2 min-w-0">
        {isRootTab ? (
          <button
            type="button"
            onClick={onOpenMenu}
            className="p-1.5 -ml-1 rounded-xl text-[#17211B] hover:bg-[#F7FAF7] active:scale-95 transition-transform"
            aria-label="Open menu drawer"
          >
            <Menu size={22} className="text-[#17211B]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1 rounded-xl text-[#17211B] hover:bg-[#F7FAF7] active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <ChevronLeft size={22} className="text-[#17211B]" />
          </button>
        )}

        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-[#17211B] truncate leading-tight">
            {title}
          </span>
          <span className="text-[10px] text-[#647168] font-medium leading-none truncate">
            {displayName}
          </span>
        </div>
      </div>

      {/* Right section: Wallet, Notification, Profile */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Backend live status indicator */}
        <BackendStatusBadge compact />

        {/* Live Coins pill (Student only) */}
        {role === ROLES.STUDENT && (
          <Link
            to="/student/wallet"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAF6EE] border border-[#CBE7D4] text-[#168451] text-xs font-bold active:scale-95 transition-transform"
          >
            <Coins size={13} className="text-[#168451]" />
            <span>{coinBalance}</span>
          </Link>
        )}

        {/* In-app Notifications Bell */}
        <NotificationDropdown />

        {/* Profile Avatar Button */}
        <Link
          to={profilePath}
          className="w-8 h-8 rounded-full bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4] flex items-center justify-center font-bold text-xs overflow-hidden active:scale-95 transition-transform"
        >
          {profile?.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            avatarLetter
          )}
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;

