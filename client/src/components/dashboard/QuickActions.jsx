import React from 'react';
import { Plus, Wallet, CreditCard, Target, FileText, Bell } from 'lucide-react';

const QuickActions = ({
  onAddIncome,
  onAddExpense,
  onAddBudget,
  onAddNote,
  onAddReminder,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Quick Actions
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onAddIncome}
          className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Wallet className="w-3.5 h-3.5" /> + Add Income
        </button>

        <button
          onClick={onAddExpense}
          className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <CreditCard className="w-3.5 h-3.5" /> + Add Expense
        </button>

        <button
          onClick={onAddBudget}
          className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Target className="w-3.5 h-3.5" /> + Add Budget
        </button>

        <button
          onClick={onAddNote}
          className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" /> + Add Note
        </button>

        <button
          onClick={onAddReminder}
          className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Bell className="w-3.5 h-3.5" /> + Add Reminder
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
