import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Target, DollarSign, Calendar } from 'lucide-react';

const CATEGORIES = [
  'Overall',
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

const MONTHS = [
  { label: 'January (1)', value: 1 },
  { label: 'February (2)', value: 2 },
  { label: 'March (3)', value: 3 },
  { label: 'April (4)', value: 4 },
  { label: 'May (5)', value: 5 },
  { label: 'June (6)', value: 6 },
  { label: 'July (7)', value: 7 },
  { label: 'August (8)', value: 8 },
  { label: 'September (9)', value: 9 },
  { label: 'October (10)', value: 10 },
  { label: 'November (11)', value: 11 },
  { label: 'December (12)', value: 12 },
];

const BudgetModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingBudget,
  defaultMonth,
  defaultYear,
  isSubmitting,
}) => {
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(defaultMonth || new Date().getMonth() + 1);
  const [year, setYear] = useState(defaultYear || new Date().getFullYear());
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category || 'Food');
      setAmount(editingBudget.amount || '');
      setMonth(editingBudget.month || defaultMonth);
      setYear(editingBudget.year || defaultYear);
    } else {
      setCategory('Overall');
      setAmount('');
      setMonth(defaultMonth || new Date().getMonth() + 1);
      setYear(defaultYear || new Date().getFullYear());
    }
  }, [editingBudget, isOpen, defaultMonth, defaultYear]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid budget amount greater than 0.');
      return;
    }

    setError('');
    onSubmit({
      category,
      amount: numAmount,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    });
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBudget ? 'Edit Budget' : 'Add Monthly Budget'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Budget Category *
          </label>
          <div className="relative">
            <Target className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'Overall' ? 'Overall Monthly Budget' : `${cat} Budget`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Budget Limit Amount *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="number"
              step="any"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Month & Year Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Month *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Year *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            {editingBudget ? 'Save Changes' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetModal;
