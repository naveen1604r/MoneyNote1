import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

const COLORS = [
  '#6366f1', // indigo
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#ec4899', // pink
  '#14b8a6', // teal
  '#64748b', // slate
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl space-y-1 text-xs font-semibold">
        <p className="text-slate-900 dark:text-white font-bold">{data.source}</p>
        <p className="text-emerald-600 dark:text-emerald-400 font-extrabold">
          ₹{data.amount?.toLocaleString('en-IN')}
        </p>
        <p className="text-slate-500 font-medium">{data.percentage}% of total income</p>
      </div>
    );
  }
  return null;
};

const IncomeSourceChart = ({ sources = [] }) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Income analysis unavailable. No income records logged for this period.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Income by Source
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Source distribution of total revenue
        </p>
      </div>

      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sources}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.15} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <YAxis
              dataKey="source"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {sources.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeSourceChart;
