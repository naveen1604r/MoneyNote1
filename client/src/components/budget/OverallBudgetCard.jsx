import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Target, AlertTriangle, CheckCircle, Plus, Edit3, Trash2 } from 'lucide-react';

const OverallBudgetCard = ({ overallBudget, totalSpent, onAddOverall, onEditOverall, onDeleteOverall }) => {
  const { formatCurrency } = useSettings();

  if (!overallBudget) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-primary">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Overall Monthly Budget
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set a total monthly spending limit to track overall financial health
            </p>
          </div>
        </div>

        <button
          onClick={onAddOverall}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Set Overall Budget
        </button>
      </div>
    );
  }

  const budgetAmount = overallBudget.amount;
  const remaining = budgetAmount - totalSpent;
  const usagePercentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;
  const isExceeded = totalSpent > budgetAmount;

  let statusBadge = {
    label: 'Safe',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
    bar: 'bg-emerald-500',
  };

  if (isExceeded) {
    statusBadge = {
      label: `Exceeded: ${formatCurrency(Math.abs(remaining))} over budget`,
      bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
      bar: 'bg-rose-600',
    };
  } else if (usagePercentage >= 90) {
    statusBadge = {
      label: 'Critical',
      bg: 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300',
      bar: 'bg-orange-500',
    };
  } else if (usagePercentage >= 70) {
    statusBadge = {
      label: 'Warning',
      bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
      bar: 'bg-amber-500',
    };
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-primary">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Overall Monthly Budget
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold inline-block mt-1 ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditOverall(overallBudget)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Edit Overall Budget"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteOverall(overallBudget)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Delete Overall Budget"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Figures Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Budget Limit
          </span>
          <p className="text-lg font-black text-slate-900 dark:text-white">
            {formatCurrency(budgetAmount)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Spent
          </span>
          <p className="text-lg font-black text-rose-600 dark:text-rose-400">
            {formatCurrency(totalSpent)}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {isExceeded ? 'Deficit' : 'Remaining'}
          </span>
          <p className={`text-lg font-black ${isExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {isExceeded ? `- ${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-300">Overall Budget Progress</span>
          <span className="text-slate-900 dark:text-white">{usagePercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${statusBadge.bar}`}
            style={{ width: `${Math.min(100, usagePercentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default OverallBudgetCard;
