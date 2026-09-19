import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Coins, ShieldCheck, User } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import BackendStatusBadge from '../components/layout/BackendStatusBadge';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.full_name || profile?.name || user?.email?.split('@')[0] || 'Dr. Eleanor Vance';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#080c14] text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar role={ROLES.ADMIN} />

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 bg-slate-950 flex flex-col h-full border-r border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-2">
                <Coins className="text-indigo-400" size={20} /> Admin Portal
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar role={ROLES.ADMIN} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Campus Administration</span>
              <span>/</span>
              <span className="text-indigo-400">Executive Control</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BackendStatusBadge />

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Role: Administrator</span>
            </div>

            <button
              type="button"
              title="Notifications"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
            </button>

            <Link
              to="/admin/profile"
              className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-80 transition-opacity"
              title="View Admin Profile"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs overflow-hidden">
                {profile?.profile_image_url ? (
                  <img src={profile.profile_image_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  avatarLetter
                )}
              </div>
              <span className="hidden xl:block text-xs font-semibold text-slate-200">
                {displayName}
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
