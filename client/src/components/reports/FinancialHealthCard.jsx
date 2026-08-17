import React from 'react';
import { Activity, ShieldCheck, AlertTriangle, Info } from 'lucide-react';

const getStatusColor = (status) => {
  switch (status) {
    case 'Excellent':
      return {
        badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
        ring: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
      };
    case 'Good':
      return {
        badge: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
        ring: 'border-indigo-500 text-indigo-600 dark:text-indigo-400',
      };
    case 'Fair':
      return {
        badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
        ring: 'border-amber-500 text-amber-600 dark:text-amber-400',
      };
    case 'Needs Attention':
    default:
      return {
        badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
        ring: 'border-rose-500 text-rose-600 dark:text-rose-400',
      };
  }
};

const FinancialHealthCard = ({ health = null }) => {
  if (!health) return null;

  const style = getStatusColor(health.status);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Financial Health Score
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal financial performance score
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${style.badge}`}>
          {health.status}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-2">
        {/* Score Ring */}
        <div className="flex items-center justify-center shrink-0">
          <div className={`w-24 h-24 rounded-full border-4 ${style.ring} flex flex-col items-center justify-center shadow-inner`}>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {health.score}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              / 100
            </span>
          </div>
        </div>

        {/* Scoring Breakdown & Disclaimer */}
        <div className="space-y-2 flex-1">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {health.explanation}
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              This score is calculated for personal tracking purposes based on your savings rate, expense ratio, and income stability. It does not constitute professional financial advice.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthCard;
