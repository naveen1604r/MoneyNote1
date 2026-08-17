import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Wallet, CreditCard, FileText, Repeat } from 'lucide-react';

const SearchResultItem = ({ item }) => {
  const navigate = useNavigate();
  const { formatCurrency, formatDate } = useSettings();

  const handleClick = () => {
    if (item.type === 'income') navigate('/income');
    else if (item.type === 'expense') navigate('/expenses');
    else if (item.type === 'note') navigate('/notes');
    else if (item.type === 'recurring') navigate('/recurring');
  };

  const getBadgeStyle = () => {
    if (item.type === 'income') return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400';
    if (item.type === 'expense') return 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400';
    if (item.type === 'note') return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400';
    return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400';
  };

  const getItemIcon = () => {
    if (item.type === 'income') return <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (item.type === 'expense') return <CreditCard className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    if (item.type === 'note') return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    return <Repeat className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5 sm:mt-0">
          {getItemIcon()}
        </div>

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${getBadgeStyle()}`}>
              {item.type}
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {item.title}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Category: <strong className="text-slate-700 dark:text-slate-300">{item.category}</strong></span>
            <span>•</span>
            <span>Date: {formatDate(item.date)}</span>
          </div>

          {item.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic pt-0.5">
              "{item.description}"
            </p>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        {item.type === 'income' && (
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(item.amount)}
          </span>
        )}
        {item.type === 'expense' && (
          <span className="text-base font-black text-rose-600 dark:text-rose-400">
            -{formatCurrency(item.amount)}
          </span>
        )}
        {item.type === 'note' && (
          <span className="text-xs font-bold text-amber-500">
            {item.amount > 0 ? formatCurrency(item.amount) : 'Finance Note'}
          </span>
        )}
        {item.type === 'recurring' && (
          <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
            {formatCurrency(item.amount)} / mo
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchResultItem;
