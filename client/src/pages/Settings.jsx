import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import DeleteAccountModal from '../components/settings/DeleteAccountModal';
import ReminderModal from '../components/reminders/ReminderModal';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  changePassword,
  deleteAccount,
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
} from '../services/api';

import {
  Sun,
  Moon,
  Laptop,
  DollarSign,
  Calendar,
  Bell,
  CheckCircle2,
  Lock,
  Trash2,
  Plus,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateUserSettings, formatCurrency } = useSettings();
  const { theme, changeTheme } = useTheme();
  const { user, logout } = useAuth();

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Financial Reminders State
  const [reminders, setReminders] = useState([]);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [isSubmittingReminder, setIsSubmittingReminder] = useState(false);

  // Delete Account State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: '', message: '' });
    }, 4000);
  };

  // Fetch Reminders
  const fetchRemindersList = async () => {
    try {
      const res = await getReminders();
      if (res.data.success) {
        setReminders(res.data.reminders || []);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  useEffect(() => {
    fetchRemindersList();
  }, []);

  // Update Settings Handler
  const handleSettingChange = async (key, value) => {
    try {
      await updateUserSettings({ [key]: value });
      if (key === 'theme' && changeTheme) {
        changeTheme(value);
      }
      showToast('success', 'Preferences updated successfully.');
    } catch (error) {
      showToast('error', 'Failed to update preferences.');
    }
  };

  // Change Password Handler
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('error', 'All password fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      showToast('error', 'New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('error', 'New password and confirm password do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword({ currentPassword, newPassword });
      if (res.data.success) {
        showToast('success', 'Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to change password.';
      showToast('error', msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Save Reminder Handler
  const handleSaveReminder = async (formData) => {
    setIsSubmittingReminder(true);
    try {
      if (editingReminder) {
        const res = await updateReminder(editingReminder.id, formData);
        if (res.data.success) {
          showToast('success', 'Reminder updated successfully.');
          setIsReminderModalOpen(false);
          fetchRemindersList();
        }
      } else {
        const res = await createReminder(formData);
        if (res.data.success) {
          showToast('success', 'Financial reminder added successfully.');
          setIsReminderModalOpen(false);
          fetchRemindersList();
        }
      }
    } catch (error) {
      showToast('error', 'Failed to save reminder.');
    } finally {
      setIsSubmittingReminder(false);
    }
  };

  // Toggle Complete Reminder
  const handleToggleReminderComplete = async (id) => {
    try {
      const res = await completeReminder(id);
      if (res.data.success) {
        fetchRemindersList();
      }
    } catch (error) {
      showToast('error', 'Failed to update reminder.');
    }
  };

  // Delete Reminder
  const handleDeleteReminder = async (id) => {
    try {
      const res = await deleteReminder(id);
      if (res.data.success) {
        showToast('success', 'Reminder deleted.');
        fetchRemindersList();
      }
    } catch (error) {
      showToast('error', 'Failed to delete reminder.');
    }
  };

  // Account Deletion Handler
  const handleConfirmDeleteAccount = async (password) => {
    setIsDeletingAccount(true);
    try {
      const res = await deleteAccount({ password });
      if (res.data.success) {
        showToast('success', 'Account permanently deleted.');
        setTimeout(() => {
          logout();
          navigate('/register');
        }, 1500);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Incorrect password verification.';
      showToast('error', msg);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
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
        title="Settings"
        subtitle="Customize your MoneyNote experience, notifications, and security preferences."
      />

      {/* SECTION 1: APPEARANCE */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Appearance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose how MoneyNote looks on your device
          </p>
        </div>

        {/* Theme Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'System', value: 'system', icon: Laptop },
            { label: 'Light', value: 'light', icon: Sun },
            { label: 'Dark', value: 'dark', icon: Moon },
          ].map((t) => {
            const IconComp = t.icon;
            const isSelected = settings.theme === t.value;
            return (
              <button
                key={t.value}
                onClick={() => handleSettingChange('theme', t.value)}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-medium'
                }`}
              >
                <div className="flex items-center gap-3 text-xs">
                  <IconComp className="w-4 h-4" />
                  <span>{t.label}</span>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>

        {/* Date Format Setting */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Date Format
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select how dates are formatted across your application
            </p>
          </div>
          <select
            value={settings.dateFormat}
            onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="DD MMM YYYY">DD MMM YYYY (14 Aug 2026)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (14/08/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (08/14/2026)</option>
          </select>
        </div>
      </div>

      {/* SECTION 2: CURRENCY */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Currency Preference
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your primary currency symbol for financial display
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'INR (₹)', value: 'INR', symbol: '₹' },
            { label: 'USD ($)', value: 'USD', symbol: '$' },
            { label: 'EUR (€)', value: 'EUR', symbol: '€' },
            { label: 'GBP (£)', value: 'GBP', symbol: '£' },
          ].map((c) => {
            const isSelected = settings.currency === c.value;
            return (
              <button
                key={c.value}
                onClick={() => handleSettingChange('currency', c.value)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-medium'
                }`}
              >
                <span className="text-lg font-black block">{c.symbol}</span>
                <span className="text-xs">{c.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Note: Changing currency affects display formatting only and does not automatically convert stored transaction amounts.</span>
        </div>
      </div>

      {/* SECTION 3: NOTIFICATION PREFERENCES */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Notification Preferences
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control what notifications and alerts you receive
          </p>
        </div>

        <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-700/60">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important account and security notifications via email.' },
            { key: 'expenseAlerts', label: 'Expense Alerts', desc: 'Get real-time alerts related to high spending activity.' },
            { key: 'savingsUpdates', label: 'Savings Goal Updates', desc: 'Receive updates about savings goals progress.' },
            { key: 'billReminders', label: 'Bill Reminders', desc: 'Receive reminders about upcoming scheduled bill payments.' },
            { key: 'financialTips', label: 'Financial Tips & Observations', desc: 'Receive occasional personal finance advice and tips.' },
          ].map((item, idx) => (
            <div key={item.key} className={`pt-4 flex items-center justify-between ${idx === 0 ? 'pt-0 border-t-0' : ''}`}>
              <div className="space-y-0.5 max-w-lg">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {item.label}
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleSettingChange(item.key, !settings[item.key])}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings[item.key] ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: FINANCIAL REMINDERS */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Financial Reminders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Schedule payment alerts and financial task reminders
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingReminder(null);
              setIsReminderModalOpen(true);
            }}
          >
            Add Reminder
          </Button>
        </div>

        {reminders.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  rem.isCompleted
                    ? 'bg-slate-50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800 opacity-60 line-through'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rem.isCompleted}
                    onChange={() => handleToggleReminderComplete(rem.id)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {rem.title}
                    </h5>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {rem.reminderDate}
                      </span>
                      {rem.reminderTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {rem.reminderTime}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteReminder(rem.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No financial reminders created yet. Click "Add Reminder" above.
          </div>
        )}
      </div>

      {/* SECTION 5: SECURITY (CHANGE PASSWORD) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Security & Password
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update your account password
          </p>
        </div>

        <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Password * (Min 8 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <Button variant="primary" type="submit" isLoading={isChangingPassword}>
            Change Password
          </Button>
        </form>
      </div>

      {/* SECTION 6: DANGER ZONE (ACCOUNT DELETION) */}
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 shadow-soft space-y-4">
        <div>
          <h3 className="text-base font-bold text-rose-900 dark:text-rose-300">
            Danger Zone
          </h3>
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Permanently delete your account and all associated data
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
            Once deleted, all income records, expenses, savings goals, finance notes, and settings will be permanently erased.
          </p>
          <Button
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSave={handleSaveReminder}
        editingReminder={editingReminder}
        isSubmitting={isSubmittingReminder}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteAccount}
        isDeleting={isDeletingAccount}
      />
    </div>
  );
};

export default Settings;
