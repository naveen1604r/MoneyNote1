import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  X
} from 'lucide-react';

const GettingStartedChecklist = ({
  incomeCount = 0,
  expenseCount = 0,
  goalCount = 0,
  budgetCount = 0,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('moneynote_checklist_dismissed') === 'true';
  });

  if (isDismissed) {
    return null;
  }

  // Detect real completion state
  const isProfileComplete = !!(user && user.name && user.email);
  const isIncomeComplete = incomeCount > 0;
  const isExpenseComplete = expenseCount > 0;
  const isGoalComplete = goalCount > 0;
  const isBudgetComplete = budgetCount > 0;

  const checklistItems = [
    {
      id: 'profile',
      label: 'Create your profile',
      isComplete: isProfileComplete,
      path: '/profile',
      icon: UserCheck,
    },
    {
      id: 'income',
      label: 'Add your monthly income',
      isComplete: isIncomeComplete,
      path: '/income',
      icon: TrendingUp,
    },
    {
      id: 'expense',
      label: 'Add your first expense',
      isComplete: isExpenseComplete,
      path: '/expenses',
      icon: TrendingDown,
    },
    {
      id: 'goal',
      label: 'Set a savings goal',
      isComplete: isGoalComplete,
      path: '/savings',
      icon: Target,
    },
    {
      id: 'budget',
      label: 'Create a monthly budget',
      isComplete: isBudgetComplete,
      path: '/budgets',
      icon: PieChart,
    },
  ];

  const completedCount = checklistItems.filter((i) => i.isComplete).length;
  const totalCount = checklistItems.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);
  const isAllComplete = completedCount === totalCount;

  const handleDismiss = () => {
    localStorage.setItem('moneynote_checklist_dismissed', 'true');
    setIsDismissed(true);
  };

  if (isAllComplete) {
    return (
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-primary/10 border border-emerald-500/30 dark:border-emerald-500/20 shadow-soft space-y-4 animate-in fade-in duration-300 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Dismiss Checklist"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1 pr-6">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              🎉 You're all set!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Your MoneyNote account is ready. Keep tracking your finances consistently to understand your financial progress.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="sm" onClick={handleDismiss}>
            Got it, thanks!
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-5 animate-in fade-in duration-300 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        title="Dismiss Checklist"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header & Progress Info */}
      <div className="space-y-3 pr-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Let's set up your MoneyNote
          </h3>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            {completedCount} of {totalCount} completed ({progressPercentage}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        {checklistItems.map((item) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => !item.isComplete && navigate(item.path)}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                item.isComplete
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                  : 'bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 hover:border-primary/50 text-slate-700 dark:text-slate-300 cursor-pointer group shadow-sm hover:shadow'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`p-2 rounded-xl text-xs ${
                    item.isComplete
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-primary group-hover:text-white'
                  } transition-colors`}
                >
                  <IconComp className="w-4 h-4" />
                </div>
                {item.isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-primary shrink-0 transition-colors" />
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold block leading-snug">
                  {item.label}
                </span>
                {!item.isComplete && (
                  <span className="text-[10px] text-primary font-semibold flex items-center gap-1 group-hover:underline">
                    Action <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GettingStartedChecklist;
