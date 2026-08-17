import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { PieChart, ArrowUpRight } from 'lucide-react';

const ExpenseCategoryDonut = ({ categories = [] }) => {
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Where Your Money Goes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top 5 expense categories this month
            </p>
          </div>
          <PieChart className="w-5 h-5 text-rose-500" />
        </div>

        {categories.length > 0 ? (
          <div className="space-y-3.5 pt-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{cat.category}</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    {formatCurrency(cat.total)} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            No expense transactions logged for this month.
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-center">
        <button
          onClick={() => navigate('/reports')}
          className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
        >
          View Reports <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ExpenseCategoryDonut;
