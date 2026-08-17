import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { formatDateToYYYYMMDD, getTodayDateString } from '../../utils/dateUtils';

const ReportDateFilters = ({ onFilterChange }) => {
  const [selectedPreset, setSelectedPreset] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const calculateDatesForPreset = (preset) => {
    const today = new Date();
    let start = '';
    let end = getTodayDateString();

    if (preset === 'month') {
      // This Month
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      start = formatDateToYYYYMMDD(firstDay);
    } else if (preset === 'last_month') {
      // Last Month
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      start = formatDateToYYYYMMDD(firstDay);
      end = formatDateToYYYYMMDD(lastDay);
    } else if (preset === '3_months') {
      // Last 3 Months
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      start = formatDateToYYYYMMDD(firstDay);
    } else if (preset === '6_months') {
      // Last 6 Months
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      start = formatDateToYYYYMMDD(firstDay);
    } else if (preset === 'year') {
      // This Year
      const firstDay = new Date(today.getFullYear(), 0, 1);
      start = formatDateToYYYYMMDD(firstDay);
    } else if (preset === 'all') {
      start = '';
      end = '';
    }

    return { start, end };
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const { start, end } = calculateDatesForPreset(preset);
      setStartDate(start);
      setEndDate(end);
      onFilterChange({ startDate: start, endDate: end });
    }
  };

  const handleCustomApply = () => {
    if (startDate && endDate && startDate > endDate) {
      alert('Start date must be before or equal to End date.');
      return;
    }
    onFilterChange({ startDate, endDate });
  };

  const presets = [
    { label: 'This Month', value: 'month' },
    { label: 'Last Month', value: 'last_month' },
    { label: 'Last 3 Months', value: '3_months' },
    { label: 'Last 6 Months', value: '6_months' },
    { label: 'This Year', value: 'year' },
    { label: 'All Time', value: 'all' },
    { label: 'Custom Range', value: 'custom' },
  ];

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-primary" />
          <span>Report Date Range:</span>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => handlePresetSelect(p.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedPreset === p.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Range Picker */}
      {selectedPreset === 'custom' && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-end gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold"
            />
          </div>

          <button
            onClick={handleCustomApply}
            className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors"
          >
            Apply Range
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportDateFilters;
