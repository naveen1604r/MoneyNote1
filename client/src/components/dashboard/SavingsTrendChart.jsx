import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl space-y-1 text-xs font-semibold">
        <p className="text-slate-900 dark:text-white font-bold border-b border-slate-100 dark:border-slate-800 pb-1">
          {label}
        </p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-emerald-500">Savings:</span>
          <span className="text-slate-900 dark:text-white font-bold">
            {formatCurrency ? formatCurrency(payload[0].value) : `₹${payload[0].value}`}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const SavingsTrendChart = ({ trendsData = [] }) => {
  const { formatCurrency } = useSettings();

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          6-Month Savings Growth
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Monthly surplus trajectory (Income - Expenses)
        </p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendsData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
            <XAxis
              dataKey="monthLabel"
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
            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
            <Line
              type="monotone"
              dataKey="savings"
              name="Savings"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SavingsTrendChart;
