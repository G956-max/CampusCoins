import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Clock, ShieldAlert, Award, Gift, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { cn } from '../../utils/cn';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data?.success) {
        setUnreadCount(res.data.data?.unread_count || 0);
      }
    } catch {
      // Non-blocking notification count check
    }
  };

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data?.notifications || []);
        setUnreadCount(res.data.data?.unreadCount || 0);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Non-blocking
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // Non-blocking
    }
  };

  const getNotificationIcon = (type) => {
    if (type?.includes('coin') || type?.includes('reward')) {
      return <Gift size={16} className="text-[#168451]" />;
    }
    if (type?.includes('sla') || type?.includes('escalat')) {
      return <ShieldAlert size={16} className="text-[#B7791F]" />;
    }
    if (type?.includes('badge') || type?.includes('mission')) {
      return <Award size={16} className="text-[#168451]" />;
    }
    return <AlertCircle size={16} className="text-[#1E6091]" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-[#647168] hover:text-[#17211B] hover:bg-[#EAF6EE] transition-colors focus:outline-none focus:ring-2 focus:ring-[#168451]/30 cursor-pointer"
        aria-label="View notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#168451] rounded-full border-2 border-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E1E9E2] rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-[#E1E9E2] flex items-center justify-between bg-[#F7FAF7]/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#17211B]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#EAF6EE] text-[#168451] border border-[#CBE7D4]">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-[#168451] hover:text-[#116B42] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E1E9E2]">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#647168]">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={28} className="mx-auto text-[#647168]/40 mb-2" />
                <p className="text-xs text-[#647168] font-medium">No notifications yet</p>
                <p className="text-[11px] text-[#647168]/70 mt-0.5">
                  Updates on complaints, missions, and coins appear here.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'p-3.5 flex items-start gap-3 transition-colors hover:bg-[#F7FAF7]',
                    !item.is_read ? 'bg-[#EAF6EE]/30' : 'bg-white'
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E1E9E2] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="text-xs font-semibold text-[#17211B] truncate">
                        {item.title}
                      </h5>
                      {!item.is_read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(item.id)}
                          title="Mark as read"
                          className="text-[#647168] hover:text-[#168451] p-0.5 shrink-0"
                        >
                          <Check size={13} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-[#647168] mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-[#647168]/60 mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {item.created_at
                        ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Just now'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
