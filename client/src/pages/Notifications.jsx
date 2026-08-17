import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/api';
import { Bell, CheckCheck, Clock, Check, Inbox } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: '', message: '' });
    }, 4000);
  };

  const fetchNotificationsList = async () => {
    setIsLoading(true);
    try {
      const res = await getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      showToast('error', 'Unable to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationsList();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      showToast('success', 'Notification marked as read.');
    } catch (error) {
      showToast('error', 'Failed to mark notification as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast('success', 'All notifications marked as read.');
    } catch (error) {
      showToast('error', 'Failed to mark all notifications as read.');
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with system alerts, bill reminders, and savings updates."
      >
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </Button>
        )}
      </PageHeader>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'unread'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonLoader type="card" count={4} />
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition-all ${
                !n.isRead
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60 shadow-sm'
                  : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700/70'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${
                  !n.isRead
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {n.message}
                  </p>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium pt-1">
                    <Clock className="w-3 h-3" /> {formatTime(n.createdAt)}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors shrink-0 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            You're all caught up!
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {filter === 'unread'
              ? 'No unread notifications right now.'
              : 'You have no system or financial notifications at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
