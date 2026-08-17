import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Bell, Calendar, Clock, AlignLeft } from 'lucide-react';
import { formatDateToYYYYMMDD, getTodayDateString } from '../../utils/dateUtils';

const ReminderModal = ({ isOpen, onClose, onSave, editingReminder, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingReminder) {
      setTitle(editingReminder.title || '');
      setDescription(editingReminder.description || '');
      setReminderDate(editingReminder.reminderDate ? formatDateToYYYYMMDD(editingReminder.reminderDate) : getTodayDateString());
      setReminderTime(editingReminder.reminderTime || '');
    } else {
      setTitle('');
      setDescription('');
      setReminderDate(getTodayDateString());
      setReminderTime('09:00');
    }
  }, [editingReminder, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || title.trim() === '') {
      setError('Reminder title is required.');
      return;
    }

    if (!reminderDate) {
      setError('Please select a valid reminder date.');
      return;
    }

    setError('');
    onSave({
      title: title.trim(),
      description: description ? description.trim() : '',
      reminderDate,
      reminderTime: reminderTime || '',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingReminder ? 'Edit Financial Reminder' : 'Add Financial Reminder'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Reminder Title *
          </label>
          <div className="relative">
            <Bell className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Pay Electricity Bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reminder Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Time (Optional)
            </label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Description / Notes (Optional)
          </label>
          <div className="relative">
            <AlignLeft className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <textarea
              rows={3}
              placeholder="e.g. Check account balance before payment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {editingReminder ? 'Update Reminder' : 'Add Reminder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReminderModal;
