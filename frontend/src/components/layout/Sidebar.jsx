import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Coins,
  LogOut,
  ChevronRight,
  Shield,
  UserCheck,
  User,
  Sparkles,
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

const Sidebar = ({ role = ROLES.STUDENT }) => {
  const { user, profile, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  let navItems = STUDENT_NAV_ITEMS;
  if (role === ROLES.STAFF) navItems = STAFF_NAV_ITEMS;
  if (role === ROLES.ADMIN) navItems = ADMIN_NAV_ITEMS;

  const handleRoleChange = (newRole) => {
    switchRole(newRole);
    if (newRole === ROLES.STUDENT) navigate('/student/dashboard');
    if (newRole === ROLES.STAFF) navigate('/staff/dashboard');
    if (newRole === ROLES.ADMIN) navigate('/admin/dashboard');
  };

  const displayName = profile?.full_name || profile?.name || user?.email?.split('@')[0] || 'Campus User';
  const displayEmail = profile?.email || user?.email || 'user@campus.edu';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const getProfilePath = () => {
    if (role === ROLES.STAFF) return '/staff/profile';
    if (role === ROLES.ADMIN) return '/admin/profile';
    return '/student/profile';
  };

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col bg-slate-950/70 border-r border-slate-800/80 backdrop-blur-xl min-h-screen">
      {/* Brand & Platform Tag */}
      <div className="p-5 border-b border-slate-800/80">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-campus-500 to-coin-500 flex items-center justify-center text-slate-950 shadow-md shadow-campus-500/20">
            <Coins size={20} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">
              Campus<span className="text-campus-400">Coins</span>
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
      </div>

      {/* Phase 2 Role Switcher Helper for Testing */}
      <div className="p-3 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles size={12} className="text-coin-400" /> Phase 2 Active
          </span>
          <span className="text-slate-500 font-mono">RBAC</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => handleRoleChange(ROLES.STUDENT)}
            className={cn(
              'px-2 py-1 text-xs rounded-lg font-medium transition-all text-center',
              role === ROLES.STUDENT
                ? 'bg-campus-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            )}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange(ROLES.STAFF)}
            className={cn(
              'px-2 py-1 text-xs rounded-lg font-medium transition-all text-center',
              role === ROLES.STAFF
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            )}
          >
            Staff
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange(ROLES.ADMIN)}
            className={cn(
              'px-2 py-1 text-xs rounded-lg font-medium transition-all text-center',
              role === ROLES.ADMIN
                ? 'bg-indigo-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            )}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isPlaceholder = item.path === '#';

          if (isPlaceholder) {
            return (
              <div
                key={item.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed group"
                title={`${item.name} will be active in ${item.badge}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-slate-600" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-500 font-mono">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-slate-800 text-campus-400 font-semibold border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={isActive ? 'text-campus-400' : 'text-slate-400'}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-campus-400" />}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3">
          <Link
            to={getProfilePath()}
            className="flex items-center gap-2.5 overflow-hidden group/prof flex-1 hover:opacity-80 transition-opacity"
            title="View Profile"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-bold text-sm overflow-hidden">
              {profile?.profile_image_url ? (
                <img src={profile.profile_image_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                avatarLetter
              )}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-semibold text-slate-200 truncate group-hover/prof:text-campus-400 transition-colors">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {displayEmail}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            title="Logout"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors focus:outline-none"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
