import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { User, Phone, Image, Camera } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, onSave, user, isSubmitting }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
      setPreviewUrl(user.avatarUrl || '');
    }
  }, [user, isOpen]);

  // Handle local image file upload preview
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    // Validate image type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setError('Please upload a valid JPG, PNG, or WEBP image.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setAvatarUrl(reader.result); // Base64 data URL
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || name.trim().length < 2 || name.trim().length > 100) {
      setError('Full Name is required and must be between 2 and 100 characters.');
      return;
    }

    setError('');
    onSave({
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      avatarUrl: avatarUrl ? avatarUrl.trim() : null,
    });
  };

  const getUserInitials = (str) => {
    if (!str) return 'MN';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Avatar Upload & Preview */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="relative group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-primary shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white font-extrabold text-2xl flex items-center justify-center border-2 border-primary shadow-md">
                {getUserInitials(name)}
              </div>
            )}

            <label className="absolute bottom-0 right-0 p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-lg">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            JPG, PNG, or WEBP (Max 5MB)
          </span>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Naveen Kumar"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
