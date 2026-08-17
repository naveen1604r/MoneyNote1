import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

const COLORS = [
  '#f43f5e', // rose
  '#6366f1', // indigo
  '#3b82f6', // blue
  '#ec4899', // pink
  '#a855f7', // purple
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#14b8a6', // teal
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#0284c7', // sky
  '#d946ef', // fuchsia
  '#f97316', // orange
  '#64748b', // slate
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl space-y-1 text-xs font-semibold">
        <p className="text-slate-900 dark:text-white font-bold">{data.category}</p>
        <p className="text-rose-600 dark:text-rose-400 font-extrabold">
          ₹{data.amount?.toLocaleString('en-IN')}
        </p>
        <p className="text-slate-500 font-medium">{data.percentage}% of total expenses</p>
      </div>
    );
  }
  return null;
};

const ExpenseCategoryChart = ({ categories = [] }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Expense analysis unavailable. No expense records logged for this period.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Expense by Category
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Percentage breakdown of total spending
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Donut Chart */}
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="amount"
                nameKey="category"
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category Legend List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {categories.map((cat, idx) => (
            <div
              key={cat.category}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="text-slate-700 dark:text-slate-300">{cat.category}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-900 dark:text-white font-bold block">
                  ₹{cat.amount?.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategoryChart;
