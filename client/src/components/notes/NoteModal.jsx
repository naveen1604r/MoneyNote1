import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Toast from '../common/Toast';
import { Tag, Calendar, FileText, Pin } from 'lucide-react';
import { formatDateToYYYYMMDD, getTodayDateString } from '../../utils/dateUtils';

const NOTE_CATEGORIES = [
  'Savings',
  'Budget',
  'Bills',
  'Shopping',
  'Investment',
  'Salary',
  'Debt',
  'Education',
  'Travel',
  'Financial Goal',
  'Reminder',
  'Personal',
  'Other',
];

const NoteModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingNote = null,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Savings');
  const [amount, setAmount] = useState('');
  const [noteDate, setNoteDate] = useState(() => getTodayDateString());
  const [isPinned, setIsPinned] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || '');
      setContent(editingNote.content || '');
      setCategory(editingNote.category || 'Savings');
      setAmount(editingNote.amount !== null && editingNote.amount !== undefined ? editingNote.amount.toString() : '');
      setNoteDate(editingNote.noteDate ? formatDateToYYYYMMDD(editingNote.noteDate) : getTodayDateString());
      setIsPinned(Boolean(editingNote.isPinned));
    } else {
      setTitle('');
      setContent('');
      setCategory('Savings');
      setAmount('');
      setNoteDate(getTodayDateString());
      setIsPinned(false);
    }
    setErrorMessage('');
  }, [editingNote, isOpen]);

  const validate = () => {
    if (!title || title.trim() === '') {
      setErrorMessage('Please enter a note title.');
      return false;
    }
    if (title.trim().length > 200) {
      setErrorMessage('Note title cannot exceed 200 characters.');
      return false;
    }
    if (!content || content.trim() === '') {
      setErrorMessage('Please enter note content.');
      return false;
    }
    if (!category) {
      setErrorMessage('Please select a category.');
      return false;
    }
    if (!noteDate) {
      setErrorMessage('Please select a valid date.');
      return false;
    }
    if (amount !== '') {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setErrorMessage('Amount must be greater than ₹0.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      amount: amount !== '' ? parseFloat(amount) : null,
      noteDate,
      isPinned,
    });
  };

  const modalTitle = editingNote ? 'Edit Finance Note' : 'Create Finance Note';
  const submitButtonText = editingNote ? 'Save Changes' : 'Create Note';
  const submittingText = editingNote ? 'Saving...' : 'Creating...';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {errorMessage && (
          <Toast
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Note Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. August Savings Target & Shopping Budget"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Category & Amount Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
                >
                  {NOTE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Amount (₹) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="20000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Date & Pin Toggle Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Date Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Note Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={noteDate}
                  onChange={(e) => setNoteDate(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Pin Toggle Switch */}
            <div className="pt-4 sm:pt-6 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  disabled={isSubmitting}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-amber-500" />
              </label>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Pin className={`w-3.5 h-3.5 ${isPinned ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                {isPinned ? 'Pinned Note' : 'Unpinned'}
              </span>
            </div>
          </div>

          {/* Content Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Note Content / Notes <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <textarea
                rows="4"
                placeholder="Write your personal financial notes, bill details, or budget goals..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? submittingText : submitButtonText}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default NoteModal;
