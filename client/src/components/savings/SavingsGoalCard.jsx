import React from 'react';
import { Target, Calendar, CheckCircle2, Clock, Edit2, Trash2 } from 'lucide-react';
import { formatDateOnly } from '../../utils/dateUtils';

const SavingsGoalCard = ({ goal, onEdit, onDelete }) => {
  const isCompleted = goal.status === 'Completed' || goal.progressPercentage >= 100;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            isCompleted
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              : 'bg-primary-light/50 dark:bg-indigo-950/60 text-primary dark:text-primary-light'
          }`}>
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              {goal.goalName}
            </h4>
            {goal.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                {goal.description}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full ${
          isCompleted
            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
        }`}>
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Completed
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> In Progress
            </>
          )}
        </span>
      </div>

      {/* Progress Amount Text */}
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
            Savings Saved / Target
          </span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            ₹{goal.currentSavings?.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-semibold text-slate-400">
              / ₹{goal.targetAmount?.toLocaleString('en-IN')}
            </span>
          </span>
        </div>
        <span className={`text-base font-extrabold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}>
          {goal.progressPercentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isCompleted ? 'bg-emerald-500' : 'bg-primary'
          }`}
          style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
        />
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Target: {formatDateOnly(goal.targetDate)}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            title="Edit Goal"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Goal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavingsGoalCard;
