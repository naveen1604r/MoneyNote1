import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Repeat, DollarSign, Calendar, Tag, AlignLeft } from 'lucide-react';
import { formatDateToYYYYMMDD, getTodayDateString } from '../../utils/dateUtils';

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Bonus',
  'Investment',
  'Interest',
  'Gift',
  'Other',
];

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

const FREQUENCIES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

const RecurringModal = ({ isOpen, onClose, onSubmit, editingRecurring, isSubmitting }) => {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Rent');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingRecurring) {
      setType(editingRecurring.type || 'expense');
      setTitle(editingRecurring.title || '');
      setCategory(editingRecurring.category || 'Rent');
      setAmount(editingRecurring.amount || '');
      setFrequency(editingRecurring.frequency || 'monthly');
      setStartDate(editingRecurring.startDate ? formatDateToYYYYMMDD(editingRecurring.startDate) : getTodayDateString());
      setEndDate(editingRecurring.endDate ? formatDateToYYYYMMDD(editingRecurring.endDate) : '');
    } else {
      setType('expense');
      setTitle('');
      setCategory('Rent');
      setAmount('');
      setFrequency('monthly');
      setStartDate(getTodayDateString());
      setEndDate('');
    }
  }, [editingRecurring, isOpen]);

  // Sync category when type changes
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('Salary');
    } else {
      setCategory('Rent');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || title.trim() === '') {
      setError('Title is required.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number greater than 0.');
      return;
    }

    if (!startDate) {
      setError('Start Date is required.');
      return;
    }

    if (endDate && endDate < startDate) {
      setError('End Date must be after or equal to Start Date.');
      return;
    }

    setError('');
    onSubmit({
      type,
      title: title.trim(),
      category,
      amount: numAmount,
      frequency,
      startDate,
      endDate: endDate || null,
    });
  };

  const categoryOptions = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingRecurring ? 'Edit Recurring Template' : 'Add Recurring Transaction'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            💰 Recurring Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            💸 Recurring Expense
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Title / Source *
          </label>
          <div className="relative">
            <Repeat className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={type === 'income' ? 'e.g. Monthly Salary' : 'e.g. House Rent'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Category & Amount Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category *
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Amount *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="any"
                placeholder="e.g. 30000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Repeat Frequency *
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {FREQUENCIES.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFrequency(f.value)}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  frequency === f.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Start Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              End Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {editingRecurring ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecurringModal;
