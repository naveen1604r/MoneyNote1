import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle, Lock } from 'lucide-react';

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your password to confirm account deletion.');
      return;
    }

    setError('');
    onConfirm(password);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account permanently?"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-rose-900 dark:text-rose-200">
              Warning: This action cannot be undone.
            </h4>
            <p className="text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
              This will permanently delete your MoneyNote account and erase all associated financial records including incomes, expenses, savings goals, finance notes, and reminders.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Confirm Password to Proceed *
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              placeholder="Enter your current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            isLoading={isDeleting}
          >
            Permanently Delete Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DeleteAccountModal;
