import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

const ReportTable = ({ monthlyReport = [] }) => {
  const [sortField, setSortField] = useState('monthKey');
  const [sortDirection, setSortDirection] = useState('desc');

  if (!monthlyReport || monthlyReport.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/70">
        Not enough monthly financial data available for table report.
      </div>
    );
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedReport = [...monthlyReport].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string') {
      return sortDirection === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return sortDirection === 'asc' ? valA - valB : valB - valA;
  });

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft overflow-hidden space-y-4 p-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Monthly Financial Report
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tabular breakdown of monthly cash flow and savings rate
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
              <th
                onClick={() => handleSort('monthKey')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1">
                  Month <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('income')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  Income <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('expenses')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  Expenses <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('savings')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  Savings <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('savingsRate')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  Savings Rate <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
            {sortedReport.map((row) => (
              <tr
                key={row.monthKey || row.month}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors font-medium"
              >
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                  {row.month}
                </td>
                <td className="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹{row.income?.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 text-right font-semibold text-rose-600 dark:text-rose-400">
                  ₹{row.expenses?.toLocaleString('en-IN')}
                </td>
                <td className={`py-3.5 px-4 text-right font-bold ${
                  row.savings < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'
                }`}>
                  {row.savings < 0 ? '-' : ''}₹{Math.abs(row.savings)?.toLocaleString('en-IN')}
                </td>
                <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                  {row.savingsRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportTable;
