import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Clock, ArrowRight } from 'lucide-react';
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/api';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadNotificationCount();
      if (res.data.success) {
        setUnreadCount(res.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchNotificationsList = async () => {
    setIsLoading(true);
    try {
      const res = await getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePanel = () => {
    if (!isOpen) {
      fetchNotificationsList();
    }
    setIsOpen(!isOpen);
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={handleTogglePanel}
        aria-label="Notifications"
        className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    !n.isRead
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className={`text-xs font-bold ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {n.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                      {n.message}
                    </p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkRead(n.id, e)}
                      aria-label="Mark notification as read"
                      title="Mark as read"
                      className="text-slate-400 hover:text-primary p-1 rounded-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                You're all caught up! No notifications.
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="text-xs font-bold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
            >
              View all notifications <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
