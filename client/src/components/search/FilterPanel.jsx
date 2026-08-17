import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Tag, Calendar, DollarSign, ArrowUpDown } from 'lucide-react';
import { formatDateToYYYYMMDD, getTodayDateString } from '../../utils/dateUtils';

const CATEGORIES_BY_TYPE = {
  income: ['Salary', 'Freelance', 'Business', 'Bonus', 'Investment', 'Interest', 'Gift', 'Other'],
  expense: ['Food', 'Rent', 'Transport', 'Shopping', 'Bills', 'Electricity', 'Internet', 'Mobile Recharge', 'Education', 'Healthcare', 'Entertainment', 'Travel', 'Subscriptions', 'Personal', 'Other'],
  note: ['General', 'Savings', 'Budget', 'Investment', 'Bills', 'Goals', 'Other'],
  all: ['Salary', 'Freelance', 'Food', 'Rent', 'Transport', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Subscriptions', 'General', 'Other'],
};

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Amount: High to Low', value: 'amount_desc' },
  { label: 'Amount: Low to High', value: 'amount_asc' },
  { label: 'Title: A - Z', value: 'az' },
  { label: 'Title: Z - A', value: 'za' },
];

const FilterPanel = ({
  isOpen,
  onClose,
  activeTab = 'all',
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const [category, setCategory] = React.useState(filters.category || '');
  const [startDate, setStartDate] = React.useState(filters.startDate || '');
  const [endDate, setEndDate] = React.useState(filters.endDate || '');
  const [minAmount, setMinAmount] = React.useState(filters.minAmount || '');
  const [maxAmount, setMaxAmount] = React.useState(filters.maxAmount || '');
  const [sort, setSort] = React.useState(filters.sort || 'newest');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setCategory(filters.category || '');
    setStartDate(filters.startDate || '');
    setEndDate(filters.endDate || '');
    setMinAmount(filters.minAmount || '');
    setMaxAmount(filters.maxAmount || '');
    setSort(filters.sort || 'newest');
  }, [filters, isOpen]);

  const handlePresetDate = (preset) => {
    const today = new Date();
    let start = '';
    let end = getTodayDateString();

    if (preset === 'today') {
      start = end;
    } else if (preset === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = formatDateToYYYYMMDD(d);
    } else if (preset === 'month') {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      start = formatDateToYYYYMMDD(d);
    } else if (preset === 'lastMonth') {
      const startD = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endD = new Date(today.getFullYear(), today.getMonth(), 0);
      start = formatDateToYYYYMMDD(startD);
      end = formatDateToYYYYMMDD(endD);
    } else if (preset === 'year') {
      start = `${today.getFullYear()}-01-01`;
    } else if (preset === 'all') {
      start = '';
      end = '';
    }

    setStartDate(start);
    setEndDate(end);
  };

  const handleApply = (e) => {
    e.preventDefault();

    if (startDate && endDate && endDate < startDate) {
      setError('End date cannot be before start date.');
      return;
    }

    setError('');
    onApplyFilters({
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sort,
    });
    onClose();
  };

  const availableCategories = CATEGORIES_BY_TYPE[activeTab] || CATEGORIES_BY_TYPE.all;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced Search Filters"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleApply} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Category
          </label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Quick Date Presets
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'All Dates', value: 'all' },
              { label: 'Today', value: 'today' },
              { label: 'This Week', value: 'week' },
              { label: 'This Month', value: 'month' },
              { label: 'Last Month', value: 'lastMonth' },
              { label: 'This Year', value: 'year' },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => handlePresetDate(p.value)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              End Date
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

        {/* Amount Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Min Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                placeholder="e.g. 1000"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Max Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="number"
                placeholder="e.g. 50000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sort Option */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Sort Order
          </label>
          <div className="relative">
            <ArrowUpDown className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onResetFilters}>
            Reset Filters
          </Button>
          <Button variant="primary" type="submit">
            Apply Filters
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default FilterPanel;
