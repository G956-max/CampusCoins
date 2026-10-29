import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  AlertCircle,
  Plus,
  MapPin,
  Gift,
  QrCode,
  BarChart3,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';

const MobileBottomNav = () => {
  const location = useLocation();
  const { role } = useAuth();
  const currentPath = location.pathname.toLowerCase();

  if (role === ROLES.STAFF) {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E1E9E2] shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
        <div className="w-full max-w-md mx-auto h-16 px-2 flex items-center justify-around">
          <NavLink
            to="/staff"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-[#168451] font-bold' : 'text-[#647168] font-medium'
              }`
            }
          >
            <Home size={20} />
            <span className="text-[10px] mt-0.5">Home</span>
          </NavLink>

          <NavLink
            to="/staff/complaints"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-[#168451] font-bold' : 'text-[#647168] font-medium'
              }`
            }
          >
            <AlertCircle size={20} />
            <span className="text-[10px] mt-0.5">Tasks</span>
          </NavLink>

          <NavLink
            to="/staff/verify-voucher"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95`
            }
          >
            <div className="w-12 h-12 rounded-full bg-[#168451] text-white flex items-center justify-center shadow-md">
              <QrCode size={22} />
            </div>
            <span className="text-[10px] font-bold text-[#168451] mt-0.5">Scan QR</span>
          </NavLink>

          <NavLink
            to="/student/map"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-[#168451] font-bold' : 'text-[#647168] font-medium'
              }`
            }
          >
            <MapPin size={20} />
            <span className="text-[10px] mt-0.5">Map</span>
          </NavLink>

          <NavLink
            to="/staff/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-[#168451] font-bold' : 'text-[#647168] font-medium'
              }`
            }
          >
            <User size={20} />
            <span className="text-[10px] mt-0.5">Profile</span>
          </NavLink>
        </div>
      </nav>
    );
  }

  if (role === ROLES.ADMIN) {
    return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E1E9E2] shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
        <div className="w-full max-w-md mx-auto h-16 px-2 flex items-center justify-around">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-[#168451] font-bold' : 'text-[#647168] font-medium'
              }`
            }
          >
            <Home size={20} />
            <span className="text-[10px] mt-0.5">Home</span>
          </NavLink>

          <NavLink
            to="/admin/complaints"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-[#168451] font-bold' : 'text-[#647168] font-medium'
              }`
            }
          >
            <AlertCircle size={20} />
            <span className="text-[10px] mt-0.5">Tickets</span>
          </NavLink>

          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95`
            }
          >
            <div className="w-12 h-12 rounded-full bg-[#168451] text-white flex items-center justify-center shadow-md">
              <BarChart3 size={22} />
            </div>
            <span className="text-[10px] font-bold text-[#168451] mt-0.5">Stats</span>
          </NavLink>

          <NavLink
            to="/student/map"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-[#168451] font-bold' : 'text-[#647168] font-medium'
              }`
            }
          >
            <MapPin size={20} />
            <span className="text-[10px] mt-0.5">Map</span>
          </NavLink>

          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-[#168451] font-bold' : 'text-[#647168] font-medium'
              }`
            }
          >
            <User size={20} />
            <span className="text-[10px] mt-0.5">Profile</span>
          </NavLink>
        </div>
      </nav>
    );
  }

  // Student Default Navigation
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E1E9E2] shadow-lg pb-[env(safe-area-inset-bottom,0px)]">
      <div className="w-full max-w-md mx-auto h-16 px-2 flex items-center justify-around">
        {/* Tab 1: Home */}
        <NavLink
          to="/student"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive || currentPath === '/student/dashboard'
                ? 'text-[#168451] font-bold'
                : 'text-[#647168] font-medium'
            }`
          }
        >
          <Home size={20} />
          <span className="text-[10px] mt-0.5">Home</span>
        </NavLink>

        {/* Tab 2: Issues */}
        <NavLink
          to="/student/complaints"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-[#168451] font-bold' : 'text-[#647168] font-medium'
            }`
          }
        >
          <AlertCircle size={20} />
          <span className="text-[10px] mt-0.5">Issues</span>
        </NavLink>

        {/* Tab 3: Center Elevated Action Button (+) */}
        <NavLink
          to="/student/report"
          className="flex flex-col items-center justify-center -mt-5 transition-transform active:scale-95"
          title="Report Campus Issue"
        >
          <div className="w-12 h-12 rounded-full bg-[#168451] text-white flex items-center justify-center shadow-lg hover:bg-[#116B42] transition-colors">
            <Plus size={24} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-bold text-[#168451] mt-0.5">Report</span>
        </NavLink>

        {/* Tab 4: Map */}
        <NavLink
          to="/student/map"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-[#168451] font-bold' : 'text-[#647168] font-medium'
            }`
          }
        >
          <MapPin size={20} />
          <span className="text-[10px] mt-0.5">Map</span>
        </NavLink>

        {/* Tab 5: Rewards Store */}
        <NavLink
          to="/student/rewards"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive || currentPath.includes('/student/wallet')
                ? 'text-[#168451] font-bold'
                : 'text-[#647168] font-medium'
            }`
          }
        >
          <Gift size={20} />
          <span className="text-[10px] mt-0.5">Rewards</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileBottomNav;

