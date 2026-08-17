import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react';

const UpcomingList = ({ upcomingItems = [] }) => {
  const { formatCurrency, formatDate } = useSettings();

  if (!upcomingItems || upcomingItems.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/70">
        No upcoming recurring transactions scheduled.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Upcoming Scheduled Transactions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Next regular incomes & expenses due for automated processing
          </p>
        </div>
        <Clock className="w-5 h-5 text-indigo-500" />
      </div>

      <div className="space-y-3">
        {upcomingItems.map((item) => {
          const isIncome = item.type === 'income';
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isIncome
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                }`}>
                  {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Due {formatDate(item.nextOccurrence)}
                    </span>
                  </div>
                </div>
              </div>

              <span className={`text-xs font-black ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isIncome ? `+${formatCurrency(item.amount)}` : `-${formatCurrency(item.amount)}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingList;
