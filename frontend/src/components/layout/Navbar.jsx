import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coins, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import BackendStatusBadge from './BackendStatusBadge';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (role === ROLES.STAFF) return '/staff/dashboard';
    if (role === ROLES.ADMIN) return '/admin/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-campus-500 to-coin-500 flex items-center justify-center text-slate-950 shadow-lg shadow-campus-500/25 group-hover:scale-105 transition-transform">
              <Coins size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Campus<span className="text-campus-400">Coins</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-widest text-slate-400 -mt-1">
                Report &bull; Resolve &bull; Earn
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="/#home" className="hover:text-campus-400 transition-colors">
              Home
            </a>
            <a href="/#features" className="hover:text-campus-400 transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="hover:text-campus-400 transition-colors">
              How It Works
            </a>
            <a href="/#about" className="hover:text-campus-400 transition-colors">
              About
            </a>
          </nav>

          {/* Right Area: Health badge + CTA buttons */}
          <div className="hidden sm:flex items-center gap-4">
            <BackendStatusBadge compact />

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(getDashboardPath())}
                  rightIcon={<ArrowRight size={14} />}
                >
                  Go to Dashboard
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <BackendStatusBadge compact />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-dropdown border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <a
              href="/#home"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
            >
              Home
            </a>
            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
            >
              How It Works
            </a>
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800"
            >
              About
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getDashboardPath());
                  }}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center" rightIcon={<ArrowRight size={16} />}>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
