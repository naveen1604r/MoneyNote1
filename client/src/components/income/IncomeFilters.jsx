import React from 'react';
import { Search, Filter, Calendar, ArrowUpDown, X } from 'lucide-react';

const SOURCES = [
  'All Sources',
  'Salary',
  'Freelance',
  'Business',
  'Bonus',
  'Investment',
  'Interest',
  'Gift',
  'Other',
];

const SORTS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Amount', value: 'highest' },
  { label: 'Lowest Amount', value: 'lowest' },
];

const generateMonthOptions = () => {
  const options = [{ label: 'All Time', value: 'all' }];
  const currentDate = new Date();
  
  for (let i = 0; i < 12; i++) {
    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth() - i;
    const d = new Date(year, monthIndex, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const value = `${yyyy}-${mm}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    options.push({ label, value });
  }

  return options;
};

const IncomeFilters = ({
  search,
  setSearch,
  source,
  setSource,
  selectedMonth,
  setSelectedMonth,
  sort,
  setSort,
  onResetFilters,
}) => {
  const monthOptions = generateMonthOptions();

  const isFiltered =
    search.trim() !== '' ||
    (source !== 'All Sources' && source !== 'All') ||
    selectedMonth !== 'all' ||
    sort !== 'newest';

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search source or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Source Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {SOURCES.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div className="relative">
          <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Selector */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Indicator */}
      {isFiltered && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default IncomeFilters;
