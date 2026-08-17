import React from 'react';
import { Lightbulb, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

const FinancialInsights = ({ insights = [] }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Financial Insights
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Data-driven observations based on your actual spending patterns
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const isWarning = insight.toLowerCase().includes('warning') || insight.toLowerCase().includes('increased') || insight.toLowerCase().includes('exceed');
          
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-start gap-3 ${
                isWarning
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-100 dark:border-rose-800/40 text-rose-800 dark:text-rose-300'
                  : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-800/40 text-indigo-900 dark:text-indigo-200'
              }`}
            >
              {isWarning ? (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{insight}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FinancialInsights;
