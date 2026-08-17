import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Toast from '../common/Toast';
import { Calendar, Tag, FileText } from 'lucide-react';
import { formatDateToYYYYMMDD, getTodayDateString } from '../../utils/dateUtils';

const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Transport',
  'Shopping',
  'Bills',
  'Electricity',
  'Internet',
  'Mobile Recharge',
  'Education',
  'Healthcare',
  'Entertainment',
  'Travel',
  'Subscriptions',
  'Personal',
  'Other',
];

const ExpenseModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingExpense = null,
  isSubmitting = false,
}) => {
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => getTodayDateString());
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setCategory(editingExpense.category || 'Food');
      setAmount(editingExpense.amount ? editingExpense.amount.toString() : '');
      setDate(editingExpense.date ? formatDateToYYYYMMDD(editingExpense.date) : getTodayDateString());
      setDescription(editingExpense.description || '');
    } else {
      setCategory('Food');
      setAmount('');
      setDate(getTodayDateString());
      setDescription('');
    }
    setErrorMessage('');
  }, [editingExpense, isOpen]);

  const validate = () => {
    if (!category) {
      setErrorMessage('Please select an expense category.');
      return false;
    }
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Amount must be greater than ₹0.');
      return false;
    }
    if (!date) {
      setErrorMessage('Please select a valid date.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    onSubmit({
      category,
      amount: parseFloat(amount),
      date,
      description,
    });
  };

  const modalTitle = editingExpense ? 'Edit Expense Record' : 'Add New Expense';
  const submitButtonText = editingExpense ? 'Save Changes' : 'Add Expense';
  const submittingText = editingExpense ? 'Saving...' : 'Adding...';

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
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Expense Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-base">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="800"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Date Spent <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Description / Note <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <textarea
                rows="3"
                placeholder="e.g. Lunch and snacks with team"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
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
              variant="danger"
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

export default ExpenseModal;
