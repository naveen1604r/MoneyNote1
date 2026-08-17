import React, { useState } from 'react';
import Button from '../common/Button';
import { Download, Calendar, Tag, FileSpreadsheet, FileType, Database } from 'lucide-react';
import { formatDateToYYYYMMDD, getTodayDateString } from '../../utils/dateUtils';

const CATEGORY_OPTIONS = [
  'All Categories',
  'Salary',
  'Freelance',
  'Business',
  'Bonus',
  'Food',
  'Rent',
  'Transport',
  'Shopping',
  'Bills',
  'Electricity',
  'Internet',
  'Healthcare',
  'Education',
  'Subscriptions',
  'General',
];

const ExportFilterPanel = ({ onTriggerFilterExport, isExporting }) => {
  const [dataType, setDataType] = useState('expenses');
  const [format, setFormat] = useState('csv');
  const [datePreset, setDatePreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  const handleDatePresetChange = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    let start = '';
    let end = getTodayDateString();

    if (preset === 'month') {
      start = formatDateToYYYYMMDD(new Date(today.getFullYear(), today.getMonth(), 1));
    } else if (preset === 'lastMonth') {
      start = formatDateToYYYYMMDD(new Date(today.getFullYear(), today.getMonth() - 1, 1));
      end = formatDateToYYYYMMDD(new Date(today.getFullYear(), today.getMonth(), 0));
    } else if (preset === 'quarter') {
      const d = new Date();
      d.setMonth(d.getMonth() - 3);
      start = formatDateToYYYYMMDD(d);
    } else if (preset === 'year') {
      start = `${today.getFullYear()}-01-01`;
    } else if (preset === 'all') {
      start = '';
      end = '';
    }

    setStartDate(start);
    setEndDate(end);
  };

  const handleExport = (e) => {
    e.preventDefault();

    if (startDate && endDate && endDate < startDate) {
      setError('End date cannot be before start date.');
      return;
    }

    setError('');
    onTriggerFilterExport({
      dataType,
      format,
      startDate,
      endDate,
      category: category === 'All Categories' ? '' : category,
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Custom Export Filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Filter your financial records by date range, category, and file format.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <form onSubmit={handleExport} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Data Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Data Module
          </label>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="income">Income Records</option>
            <option value="expenses">Expenses Records</option>
            <option value="budgets">Budget Targets</option>
            <option value="goals">Savings Goals</option>
            <option value="notes">Finance Notes</option>
            <option value="recurring">Recurring Templates</option>
            <option value="report">Executive PDF Report</option>
            <option value="json">Full Backup (JSON)</option>
          </select>
        </div>

        {/* Format */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Export Format
          </label>
          <div className="flex items-center gap-2">
            {[
              { id: 'csv', label: 'CSV', icon: FileSpreadsheet },
              { id: 'pdf', label: 'PDF', icon: FileType },
              { id: 'json', label: 'JSON', icon: Database },
            ].map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = format === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormat(fmt.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {fmt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Preset */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Date Range
          </label>
          <select
            value={datePreset}
            onChange={(e) => handleDatePresetChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Category Filter
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Start / End Dates if custom preset */}
        {datePreset === 'custom' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </>
        )}

        <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-2">
          <Button variant="primary" icon={Download} type="submit" loading={isExporting}>
            {isExporting ? 'Preparing Download...' : 'Download Export File'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExportFilterPanel;
