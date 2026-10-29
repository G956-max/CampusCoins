import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Coins,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS, ROLE_BADGE_VARIANTS } from '../../constants/roles';
import {
  STUDENT_NAV_ITEMS,
  STAFF_NAV_ITEMS,
  ADMIN_NAV_ITEMS,
} from '../../constants/navigation';
import Badge from '../common/Badge';
import { cn } from '../../utils/cn';

const Sidebar = ({ role = ROLES.STUDENT, isMobile = false, onClose }) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  let navItems = STUDENT_NAV_ITEMS;
  if (role === ROLES.STAFF) navItems = STAFF_NAV_ITEMS;
  if (role === ROLES.ADMIN) navItems = ADMIN_NAV_ITEMS;

  const displayName = profile?.full_name || profile?.name || user?.email?.split('@')[0] || 'Campus User';
  const displayEmail = profile?.email || user?.email || 'user@campus.edu';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const getProfilePath = () => {
    if (role === ROLES.STAFF) return '/staff/profile';
    if (role === ROLES.ADMIN) return '/admin/profile';
    return '/student/profile';
  };

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col bg-white border-r border-[#E1E9E2] text-[#17211B]',
        isMobile ? 'w-full h-full' : 'w-64 shrink-0 hidden lg:flex min-h-screen'
      )}
    >
      {/* Brand & Platform Tag */}
      <div className="p-4 sm:p-5 border-b border-[#E1E9E2] flex items-center justify-between">
        <NavLink to="/" onClick={handleNavClick} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#168451] flex items-center justify-center text-white shadow-sm">
            <Coins size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold text-[#17211B] tracking-tight">
              Campus<span className="text-[#168451]">Coins</span>
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant={ROLE_BADGE_VARIANTS[role] || 'default'}
                size="sm"
                withDot
              >
                {ROLE_LABELS[role] || 'Portal'}
              </Badge>
            </div>
          </div>
        </NavLink>

        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#647168] hover:text-[#17211B] hover:bg-[#F7FAF7]"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#647168] uppercase">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path.split('/').length <= 3}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-[#EAF6EE] text-[#168451] font-semibold shadow-xs'
                    : 'text-[#647168] hover:text-[#17211B] hover:bg-[#F7FAF7]'
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className="shrink-0 transition-transform group-hover:scale-105"
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Profile at Bottom */}
      <div className="p-3 border-t border-[#E1E9E2] bg-[#F7FAF7]/60">
        <Link
          to={getProfilePath()}
          onClick={handleNavClick}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:shadow-xs transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#EAF6EE] border border-[#CBE7D4] flex items-center justify-center text-[#168451] font-bold text-xs shrink-0">
              {avatarLetter}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#17211B] truncate group-hover:text-[#168451] transition-colors">
                {displayName}
              </p>
              <p className="text-[11px] text-[#647168] truncate">
                {displayEmail}
              </p>
            </div>
          </div>
          <ChevronRight size={14} className="text-[#647168] group-hover:text-[#168451] shrink-0" />
        </Link>

        <button
          type="button"
          onClick={() => {
            if (isMobile && onClose) onClose();
            logout();
          }}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-[#C43D3D] hover:bg-[#FDF2F2] rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
