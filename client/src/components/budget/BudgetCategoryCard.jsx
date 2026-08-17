import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
  Utensils, Home, Car, ShoppingBag, Receipt, Zap, Wifi, Smartphone,
  GraduationCap, HeartPulse, Film, Plane, Repeat, User, Wallet, Edit3, Trash2
} from 'lucide-react';

const categoryIconMap = {
  Food: { icon: Utensils, color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' },
  Rent: { icon: Home, color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' },
  Transport: { icon: Car, color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' },
  Shopping: { icon: ShoppingBag, color: 'bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400' },
  Bills: { icon: Receipt, color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' },
  Electricity: { icon: Zap, color: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400' },
  Internet: { icon: Wifi, color: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400' },
  'Mobile Recharge': { icon: Smartphone, color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' },
  Education: { icon: GraduationCap, color: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400' },
  Healthcare: { icon: HeartPulse, color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' },
  Entertainment: { icon: Film, color: 'bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-600 dark:text-fuchsia-400' },
  Travel: { icon: Plane, color: 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400' },
  Subscriptions: { icon: Repeat, color: 'bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400' },
  Personal: { icon: User, color: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400' },
  Other: { icon: Wallet, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
};

const BudgetCategoryCard = ({ item, onEdit, onDelete }) => {
  const { formatCurrency } = useSettings();

  const meta = categoryIconMap[item.category] || categoryIconMap['Other'];
  const IconComp = meta.icon;

  const isExceeded = item.spent > item.budget;

  let statusBadge = {
    label: 'Safe',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
    bar: 'bg-emerald-500',
  };

  if (item.status === 'exceeded' || isExceeded) {
    statusBadge = {
      label: 'Exceeded',
      bg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
      bar: 'bg-rose-600',
    };
  } else if (item.status === 'critical') {
    statusBadge = {
      label: 'Critical',
      bg: 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300',
      bar: 'bg-orange-500',
    };
  } else if (item.status === 'warning') {
    statusBadge = {
      label: 'Warning',
      bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
      bar: 'bg-amber-500',
    };
  }

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${meta.color}`}>
            <IconComp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {item.category}
            </h4>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold inline-block mt-0.5 ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Edit Budget"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Delete Budget"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span>Spent: {formatCurrency(item.spent)}</span>
          <span className="font-bold text-slate-900 dark:text-white">{item.usagePercentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${statusBadge.bar}`}
            style={{ width: `${Math.min(100, item.usagePercentage)}%` }}
          />
        </div>
      </div>

      {/* Figures Row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
        <span className="text-slate-500 font-medium">Limit: <strong className="text-slate-900 dark:text-white">{formatCurrency(item.budget)}</strong></span>
        <span className="font-bold">
          {isExceeded ? (
            <span className="text-rose-600 dark:text-rose-400">{formatCurrency(Math.abs(item.remaining))} over</span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(item.remaining)} left</span>
          )}
        </span>
      </div>
    </div>
  );
};

export default BudgetCategoryCard;
