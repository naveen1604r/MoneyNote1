import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Tooltip from './Tooltip';

const SummaryCard = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-indigo-100 dark:bg-indigo-900/40',
  iconColor = 'text-primary dark:text-indigo-400',
  trend = null, // { value: '+12%', isPositive: true }
  tooltip = null,
  className = ''
}) => {
  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft hover:shadow-soft-lg transition-all duration-300 group ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </span>
          {tooltip && <Tooltip content={tooltip} />}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {amount}
        </h3>
        {trend && (
          <div
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-semibold rounded-full ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SummaryCard;
