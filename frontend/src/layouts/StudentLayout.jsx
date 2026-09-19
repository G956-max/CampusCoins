import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  Coins,
  Search,
  Sparkles,
  ChevronDown,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import BackendStatusBadge from '../components/layout/BackendStatusBadge';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../constants/roles';

const StudentLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-[#080c14] text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar role={ROLES.STUDENT} />

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
                <Coins className="text-campus-400" size={20} /> CampusCoins
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar role={ROLES.STUDENT} />
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
              <span className="font-semibold text-slate-300">Student Portal</span>
              <span>/</span>
              <span className="text-campus-400">Workspace</span>
            </div>
          </div>

          {/* Topbar right items */}
          <div className="flex items-center gap-3">
            <BackendStatusBadge />

            {/* Live CampusCoins Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Coins size={14} className="text-coin-400" />
              <span>480 Coins</span>
            </div>

            {/* Role switch helper badge */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-campus-400" />
              <span>Role: Student</span>
            </div>

            {/* Notification placeholder */}
            <button
              type="button"
              title="Notifications (Phase 5)"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-campus-500" />
            </button>

            {/* Quick Profile chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-campus-500/20 text-campus-300 border border-campus-500/30 flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <span className="hidden xl:block text-xs font-semibold text-slate-200">
                {user?.name || 'Alex Rivera'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
