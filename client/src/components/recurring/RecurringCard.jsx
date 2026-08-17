import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
  TrendingUp, TrendingDown, Calendar, Clock, Edit3, Play, Pause, Trash2
} from 'lucide-react';

const RecurringCard = ({ item, onEdit, onTogglePause, onDelete }) => {
  const { formatCurrency, formatDate } = useSettings();

  const isIncome = item.type === 'income';

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
      {/* Top Bar: Type Badge & Status */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
          isIncome
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
        }`}>
          {isIncome ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {item.type?.toUpperCase()}
        </span>

        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
          item.isActive
            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            : 'bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400'
        }`}>
          {item.isActive ? '● Active' : '● Paused'}
        </span>
      </div>

      {/* Title & Category */}
      <div>
        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
          {item.title}
        </h4>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Category: <strong className="text-slate-700 dark:text-slate-300">{item.category}</strong>
        </span>
      </div>

      {/* Amount & Frequency */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className={`text-lg font-black ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {formatCurrency(item.amount)}
        </span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          / {item.frequency}
        </span>
      </div>

      {/* Next Occurrence & Last Generated */}
      <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> Next Due:
          </span>
          <strong className="text-slate-900 dark:text-white font-bold">
            {formatDate(item.nextOccurrence)}
          </strong>
        </div>

        {item.lastGeneratedAt && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" /> Last Generated:
            </span>
            <span className="text-slate-400">
              {formatDate(item.lastGeneratedAt)}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
        <button
          onClick={() => onTogglePause(item)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            item.isActive
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
          }`}
        >
          {item.isActive ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Resume
            </>
          )}
        </button>

        <button
          onClick={() => onEdit(item)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Edit Recurring Template"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(item)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          title="Delete Recurring Template"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RecurringCard;
