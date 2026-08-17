import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthSelector = ({ month, year, onMonthChange }) => {
  const handlePrev = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange(newMonth, newYear);
  };

  const handleNext = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onMonthChange(newMonth, newYear);
  };

  const handleCurrent = () => {
    const today = new Date();
    onMonthChange(today.getMonth() + 1, today.getFullYear());
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return month === today.getMonth() + 1 && year === today.getFullYear();
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          {MONTH_NAMES[month - 1]} {year}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {!isCurrentMonth() && (
          <button
            onClick={handleCurrent}
            className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            This Month
          </button>
        )}

        <button
          onClick={handlePrev}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={handleNext}
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MonthSelector;
