import React from 'react';
import { Lightbulb, AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';

const DynamicInsightCard = ({ insight }) => {
  if (!insight) return null;

  let style = {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
    icon: Lightbulb,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    titleColor: 'text-indigo-900 dark:text-indigo-200',
    textColor: 'text-indigo-700 dark:text-indigo-300',
  };

  if (insight.type === 'danger') {
    style = {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      icon: AlertCircle,
      iconColor: 'text-rose-600 dark:text-rose-400',
      titleColor: 'text-rose-900 dark:text-rose-200',
      textColor: 'text-rose-700 dark:text-rose-300',
    };
  } else if (insight.type === 'warning') {
    style = {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-900 dark:text-amber-200',
      textColor: 'text-amber-700 dark:text-amber-300',
    };
  } else if (insight.type === 'success') {
    style = {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      titleColor: 'text-emerald-900 dark:text-emerald-200',
      textColor: 'text-emerald-700 dark:text-emerald-300',
    };
  } else if (insight.type === 'info') {
    style = {
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
      icon: Info,
      iconColor: 'text-sky-600 dark:text-sky-400',
      titleColor: 'text-sky-900 dark:text-sky-200',
      textColor: 'text-sky-700 dark:text-sky-300',
    };
  }

  const IconComp = style.icon;

  return (
    <div className={`p-5 rounded-2xl border ${style.bg} flex items-start gap-4 shadow-soft`}>
      <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-xs ${style.iconColor} shrink-0`}>
        <IconComp className="w-5 h-5" />
      </div>

      <div className="space-y-1">
        <h4 className={`text-sm font-bold ${style.titleColor}`}>
          {insight.title}
        </h4>
        <p className={`text-xs font-medium leading-relaxed ${style.textColor}`}>
          {insight.message}
        </p>
      </div>
    </div>
  );
};

export default DynamicInsightCard;
