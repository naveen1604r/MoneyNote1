import React from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { FileText, Plus } from 'lucide-react';

const FinanceNotes = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Finance Notes"
        subtitle="Keep personal notes, tax reminders, budget strategies, and financial plans."
      >
        <Button variant="primary" icon={Plus}>
          New Note
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 shadow-soft">
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            TAX REMINDER
          </span>
          <h4 className="mt-3 text-base font-bold text-slate-900 dark:text-white">Q3 Tax Filing Preparation</h4>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
            Gather all investment certificates, home rent receipts, and health insurance premium documentation before filing deadline.
          </p>
          <span className="mt-4 block text-[11px] font-medium text-slate-400">Aug 14, 2026</span>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 shadow-soft">
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
            STRATEGY
          </span>
          <h4 className="mt-3 text-base font-bold text-slate-900 dark:text-white">50-30-20 Rule Alignment</h4>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
            Maintain 50% for needs, 30% for wants, and 20% directly into high-yield savings or mutual fund SIPs.
          </p>
          <span className="mt-4 block text-[11px] font-medium text-slate-400">Aug 10, 2026</span>
        </div>
      </div>

      <EmptyState
        icon={FileText}
        title="Finance Notes Module Initialized"
        description="Rich markdown finance notes, tags, and pin features ready for Step 2 integration."
      />
    </div>
  );
};

export default FinanceNotes;
