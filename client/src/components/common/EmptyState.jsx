import React from 'react';
import { FolderOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No data available',
  description = 'There are no records to display at this moment.',
  action = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700/60 ${className}`}>
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
        {title}
      </h4>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
