import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coins, Menu, X, ArrowRight, User } from 'lucide-react';
import Button from '../common/Button';
import BackendStatusBadge from './BackendStatusBadge';
import NotificationDropdown from './NotificationDropdown';
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
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#E1E9E2] shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#168451] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Coins size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#17211B] flex items-center gap-1">
                Campus<span className="text-[#168451]">Coins</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-semibold tracking-wider text-[#647168] -mt-1">
                Report &bull; Resolve &bull; Earn
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#647168]">
            <a href="/#home" className="hover:text-[#168451] transition-colors">
              Home
            </a>
            <a href="/#features" className="hover:text-[#168451] transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="hover:text-[#168451] transition-colors">
              How It Works
            </a>
            <a href="/#about" className="hover:text-[#168451] transition-colors">
              About
            </a>
          </nav>

          {/* Right Area: Health badge + Notifications + CTA buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <BackendStatusBadge compact />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(getDashboardPath())}
                  rightIcon={<ArrowRight size={14} />}
                >
                  Dashboard
                </Button>
                <Link to="/profile">
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    Profile
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated && <NotificationDropdown />}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#647168] hover:text-[#17211B] hover:bg-[#EAF6EE] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E1E9E2] px-4 pt-3 pb-5 space-y-3 shadow-lg animate-fadeIn">
          <nav className="flex flex-col space-y-1.5 text-sm font-medium">
            <a
              href="/#home"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[#17211B] hover:bg-[#EAF6EE] hover:text-[#168451]"
            >
              Home
            </a>
            <a
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[#17211B] hover:bg-[#EAF6EE] hover:text-[#168451]"
            >
              Features
            </a>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[#17211B] hover:bg-[#EAF6EE] hover:text-[#168451]"
            >
              How It Works
            </a>
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-[#17211B] hover:bg-[#EAF6EE] hover:text-[#168451]"
            >
              About
            </a>
          </nav>

          <div className="pt-3 border-t border-[#E1E9E2] flex flex-col gap-2">
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
                    setMobileMenuOpen(false);
                    navigate('/profile');
                  }}
                >
                  My Profile
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-center text-[#C43D3D] hover:bg-[#FDF2F2]"
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
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center shadow-xs" rightIcon={<ArrowRight size={16} />}>
                    Get Started (Sign Up)
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Already have an account? Sign In
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
