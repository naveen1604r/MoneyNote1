import React from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, Sparkles, HeartHandshake } from 'lucide-react';

const getHealthStatus = (savingsRate, totalSavings) => {
  if (totalSavings <= 0) {
    return {
      title: 'Expenses Exceed Income',
      subtitle: 'Your monthly expenses are equal to or higher than your income. Review your outflow to avoid debt.',
      badge: 'Critical Warning',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60',
      badgeColor: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300',
      icon: AlertTriangle,
      iconColor: 'text-rose-600 dark:text-rose-400',
    };
  }

  if (savingsRate >= 30) {
    return {
      title: 'Excellent Savings Rate',
      subtitle: `Awesome job! You're saving ${savingsRate}% of your income. You're well on track for financial freedom.`,
      badge: 'Tier 1 • Outstanding',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    };
  }

  if (savingsRate >= 20) {
    return {
      title: 'Good Savings Rate',
      subtitle: `Great financial discipline! You're saving ${savingsRate}% of your income. Keep up the consistent habit.`,
      badge: 'Tier 2 • Healthy',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300',
      icon: Sparkles,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    };
  }

  if (savingsRate >= 10) {
    return {
      title: 'Moderate Savings Rate',
      subtitle: `You're saving ${savingsRate}% of your income. Consider boosting your savings rate towards 20%.`,
      badge: 'Tier 3 • Moderate',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      badgeColor: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
      icon: TrendingUp,
      iconColor: 'text-amber-600 dark:text-amber-400',
    };
  }

  return {
    title: 'Try to Increase Savings',
    subtitle: `You're currently saving ${savingsRate}% of your income. Look for small expenses to trim each month.`,
    badge: 'Tier 4 • Action Required',
    bgColor: 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40',
    badgeColor: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
    icon: HeartHandshake,
    iconColor: 'text-rose-500 dark:text-rose-400',
  };
};

const SavingsHealth = ({ savingsRate = 0, totalSavings = 0 }) => {
  const status = getHealthStatus(savingsRate, totalSavings);
  const IconComp = status.icon;

  return (
    <div className={`p-5 rounded-2xl border ${status.bgColor} shadow-soft transition-all duration-300`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm shrink-0`}>
          <IconComp className={`w-6 h-6 ${status.iconColor}`} />
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {status.title}
            </h3>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${status.badgeColor}`}>
              {status.badge}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {status.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SavingsHealth;
