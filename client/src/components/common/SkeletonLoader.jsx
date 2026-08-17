import React from 'react';

export const SummaryCardSkeleton = () => (
  <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
      <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
    </div>
    <div className="mt-4 h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
    <div className="mt-2 h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="animate-pulse border-b border-slate-100 dark:border-slate-700/50">
    <td className="py-4 px-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
      </div>
    </td>
    <td className="py-4 px-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
    </td>
    <td className="py-4 px-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" />
    </td>
    <td className="py-4 px-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
    </td>
    <td className="py-4 px-4 text-right">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto" />
    </td>
  </tr>
);

export const SkeletonLoader = ({ type = 'table', count = 3 }) => {
  if (type === 'summary') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {Array.from({ length: count }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
