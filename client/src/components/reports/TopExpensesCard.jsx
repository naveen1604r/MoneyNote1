import React from 'react';
import { Award, ShoppingBag, Calendar } from 'lucide-react';
import { formatDateOnly } from '../../utils/dateUtils';

const TopExpensesCard = ({ topCategory = null, topExpense = null }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {/* Highest Spending Category */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Highest Spending Category
          </span>
          {topCategory ? (
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {topCategory.category}
              </h4>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                ₹{topCategory.amount?.toLocaleString('en-IN')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No expense data available.</p>
          )}
        </div>
      </div>

      {/* Highest Single Expense */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Highest Single Expense
          </span>
          {topExpense ? (
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                {topExpense.category}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  ₹{topExpense.amount?.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDateOnly(topExpense.date)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No expense data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopExpensesCard;
