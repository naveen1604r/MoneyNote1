import React, { useState, useEffect } from 'react';
import { Search, Filter, Pin, Calendar, ArrowUpDown, X } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
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

const DATE_OPTIONS = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Recently Updated', value: 'updated' },
];

const NoteFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  pinnedOnly,
  setPinnedOnly,
  dateFilter,
  setDateFilter,
  sort,
  setSort,
  onResetFilters,
}) => {
  const [searchInput, setSearchInput] = useState(search);

  // Debounced search input sync
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, setSearch]);

  const isFiltered =
    search.trim() !== '' ||
    category !== 'All Categories' ||
    pinnedOnly !== false ||
    dateFilter !== 'all' ||
    sort !== 'newest';

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Bar */}
        <div className="relative lg:col-span-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search your finance notes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Pinned Filter */}
        <div className="relative">
          <Pin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <select
            value={pinnedOnly ? 'true' : 'false'}
            onChange={(e) => setPinnedOnly(e.target.value === 'true')}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="false">All Notes</option>
            <option value="true">Pinned Notes Only</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {DATE_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Bar */}
      {isFiltered && (
        <div className="flex justify-end pt-1">
          <button
            onClick={() => {
              setSearchInput('');
              onResetFilters();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteFilters;
