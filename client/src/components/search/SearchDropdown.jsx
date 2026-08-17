import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Wallet, CreditCard, FileText, Repeat, ArrowRight } from 'lucide-react';

const SearchDropdown = ({ query, results = [], onClose }) => {
  const navigate = useNavigate();
  const { formatCurrency, formatDate } = useSettings();

  if (!query || query.trim() === '') return null;

  const handleSelectResult = (item) => {
    onClose();
    if (item.type === 'income') navigate('/income');
    else if (item.type === 'expense') navigate('/expenses');
    else if (item.type === 'note') navigate('/notes');
    else if (item.type === 'recurring') navigate('/recurring');
  };

  const handleViewAll = () => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const getItemIcon = (type) => {
    if (type === 'income') return <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    if (type === 'expense') return <CreditCard className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
    if (type === 'note') return <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    return <Repeat className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
        <span>Quick Preview for "<strong className="text-slate-900 dark:text-white">{query}</strong>"</span>
        <span className="font-bold">{results.length} found</span>
      </div>

      {results.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
          {results.slice(0, 5).map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => handleSelectResult(item)}
              className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                  {getItemIcon(item.type)}
                </div>
                <div className="truncate">
                  <span className="font-bold text-slate-900 dark:text-white block truncate">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.category} • {formatDate(item.date)}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                {item.type === 'income' && (
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    +{formatCurrency(item.amount)}
                  </span>
                )}
                {item.type === 'expense' && (
                  <span className="font-extrabold text-rose-600 dark:text-rose-400">
                    -{formatCurrency(item.amount)}
                  </span>
                )}
                {item.type === 'note' && (
                  <span className="text-[11px] font-bold text-amber-500">Note</span>
                )}
                {item.type === 'recurring' && (
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(item.amount)} / mo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-400">
          No matching records found.
        </div>
      )}

      <button
        onClick={handleViewAll}
        className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-primary hover:text-primary-hover transition-colors flex items-center justify-center gap-1.5 border-t border-slate-100 dark:border-slate-800"
      >
        View all search results <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default SearchDropdown;
