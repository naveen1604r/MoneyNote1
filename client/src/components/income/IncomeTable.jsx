import React from 'react';
import {
  Wallet,
  Briefcase,
  Building2,
  Gift,
  TrendingUp,
  Percent,
  Award,
  CircleDollarSign,
  Edit2,
  Trash2
} from 'lucide-react';
import { formatDateOnly } from '../../utils/dateUtils';

const sourceIconMap = {
  Salary: { icon: Wallet, color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' },
  Freelance: { icon: Briefcase, color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' },
  Business: { icon: Building2, color: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400' },
  Bonus: { icon: Award, color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' },
  Investment: { icon: TrendingUp, color: 'bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400' },
  Interest: { icon: Percent, color: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400' },
  Gift: { icon: Gift, color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' },
  Other: { icon: CircleDollarSign, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
};

const IncomeTable = ({ incomes, onEdit, onDelete }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
              <th className="py-3.5 px-5">Source</th>
              <th className="py-3.5 px-5">Amount</th>
              <th className="py-3.5 px-5">Date</th>
              <th className="py-3.5 px-5">Description</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
            {incomes.map((item) => {
              const meta = sourceIconMap[item.source] || sourceIconMap.Other;
              const IconComp = meta.icon;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors group"
                >
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${meta.color}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.source}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-bold text-emerald-600 dark:text-emerald-400">
                    +₹{item.amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {formatDateOnly(item.date)}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {item.description || <span className="text-slate-400 italic">No notes</span>}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        title="Edit Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
        {incomes.map((item) => {
          const meta = sourceIconMap[item.source] || sourceIconMap.Other;
          const IconComp = meta.icon;

          return (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${meta.color}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {item.source}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {formatDateOnly(item.date)}
                    </span>
                  </div>
                </div>

                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">
                  +₹{item.amount?.toLocaleString('en-IN')}
                </span>
              </div>

              {item.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl">
                  {item.description}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/40">
                <button
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncomeTable;
