import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl space-y-1.5 text-xs font-semibold">
        <p className="text-slate-900 dark:text-white font-bold border-b border-slate-100 dark:border-slate-800 pb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="text-slate-900 dark:text-white font-bold">
              ₹{entry.value?.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlySavingsChart = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        No monthly savings history recorded yet. Add incomes and expenses to render chart.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Monthly Financial Flow & Savings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time monthly Income, Expenses, and Net Savings breakdown
          </p>
        </div>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={history}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(value) => <span className="text-slate-600 dark:text-slate-300 font-medium">{value}</span>}
            />
            <Bar dataKey="income" name="Income" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="savings" name="Savings" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlySavingsChart;
