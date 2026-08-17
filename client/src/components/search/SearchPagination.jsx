import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SearchPagination = ({ pagination, onPageChange, onLimitChange }) => {
  const { page = 1, totalPages = 1, total = 0, limit = 20 } = pagination || {};

  if (total === 0) return null;

  const startIdx = (page - 1) * limit + 1;
  const endIdx = Math.min(total, page * limit);

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-900 dark:text-white">{startIdx}-{endIdx}</strong> of <strong className="text-slate-900 dark:text-white">{total}</strong> results
        </span>

        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-[11px] text-slate-400 font-semibold">Per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SearchPagination;
