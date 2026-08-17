import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowUpRight } from 'lucide-react';

const FinancialHealthCard = ({ health = { score: 75, status: 'Good' } }) => {
  const navigate = useNavigate();

  let statusBadge = {
    bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
    bar: 'bg-emerald-500',
  };

  if (health.status === 'Needs Attention') {
    statusBadge = {
      bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
      bar: 'bg-rose-500',
    };
  } else if (health.status === 'Good') {
    statusBadge = {
      bg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
      bar: 'bg-indigo-500',
    };
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Financial Health
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold inline-block mt-0.5 ${statusBadge.bg}`}>
              {health.status}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            {health.score}
          </span>
          <span className="text-xs font-bold text-slate-400"> / 100</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${statusBadge.bar}`}
            style={{ width: `${health.score}%` }}
          />
        </div>
      </div>

      <div className="pt-2 text-center">
        <button
          onClick={() => navigate('/reports')}
          className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
        >
          View Detailed Report <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default FinancialHealthCard;
