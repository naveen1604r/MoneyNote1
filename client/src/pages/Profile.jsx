import React, { useState, useEffect } from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import EditProfileModal from '../components/profile/EditProfileModal';
import { getProfile, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Calendar, Edit3, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const { user: authUser, updateUser: updateAuthUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: '', message: '' });
    }, 4000);
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const res = await getProfile();
      if (res.data.success) {
        setProfile(res.data.user);
        if (updateAuthUser) {
          updateAuthUser(res.data.user);
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      showToast('error', 'Unable to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSaveProfile = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await updateProfile(formData);
      if (res.data.success) {
        showToast('success', 'Profile updated successfully.');
        setIsModalOpen(false);
        fetchProfileData();
        if (updateAuthUser) {
          updateAuthUser({
            name: formData.name,
            phone: formData.phone,
            avatarUrl: formData.avatarUrl,
          });
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'MN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatMemberSince = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Toast Banner */}
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information and account preferences."
      >
        <Button
          variant="primary"
          icon={Edit3}
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
        >
          Edit Profile
        </Button>
      </PageHeader>

      {/* Main Profile Card */}
      {isLoading ? (
        <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
          Loading profile...
        </div>
      ) : profile ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-8">
          {/* Avatar & Header Identity */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-700/60">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-slate-100 dark:border-slate-700 shadow-md shrink-0"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-primary to-secondary text-white font-black text-3xl flex items-center justify-center border-4 border-slate-100 dark:border-slate-700 shadow-md shrink-0">
                {getUserInitials(profile.name)}
              </div>
            )}

            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {profile.name}
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {profile.email}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified User
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5" /> Joined {formatMemberSince(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Info Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> Full Name
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {profile.name}
              </p>
            </div>

            {/* Email Address */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> Account Email
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {profile.email}
              </p>
            </div>

            {/* Phone Number */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" /> Phone Number
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {profile.phone || 'Not provided'}
              </p>
            </div>

            {/* Member Since */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Member Since
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatMemberSince(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProfile}
        user={profile}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Profile;
