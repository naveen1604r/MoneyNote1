import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import SummaryCard from '../components/common/SummaryCard';
import Toast from '../components/common/Toast';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

import ReportDateFilters from '../components/reports/ReportDateFilters';
import IncomeVsExpenseChart from '../components/reports/IncomeVsExpenseChart';
import SavingsTrendChart from '../components/reports/SavingsTrendChart';
import ExpenseCategoryChart from '../components/reports/ExpenseCategoryChart';
import IncomeSourceChart from '../components/reports/IncomeSourceChart';
import FinancialHealthCard from '../components/reports/FinancialHealthCard';
import FinancialInsights from '../components/reports/FinancialInsights';
import TopExpensesCard from '../components/reports/TopExpensesCard';
import ReportTable from '../components/reports/ReportTable';

import { exportToCSV, triggerPDFPrint } from '../utils/exportUtils';
import {
  getReportSummary,
  getMonthlyReports,
  getReportExpenseCategories,
  getReportIncomeSources,
  getReportAnalytics,
} from '../services/api';

import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Download,
  Printer
} from 'lucide-react';

const Reports = () => {
  // Filter States
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Data States
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    savingsRate: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeSources, setIncomeSources] = useState([]);
  const [analytics, setAnalytics] = useState({
    highestExpenseCategory: null,
    highestSingleExpense: null,
    monthOverMonth: { incomeChange: 0, expenseChange: 0, savingsChange: 0 },
    financialHealth: null,
    insights: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: '', message: '' });
    }, 4000);
  };

  // Fetch Report Data
  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { startDate, endDate } = dateRange;

      const [sumRes, monthlyRes, catRes, sourceRes, analyticsRes] = await Promise.all([
        getReportSummary(startDate, endDate),
        getMonthlyReports(startDate, endDate),
        getReportExpenseCategories(startDate, endDate),
        getReportIncomeSources(startDate, endDate),
        getReportAnalytics(startDate, endDate),
      ]);

      if (sumRes.data.success) {
        setSummary(sumRes.data.summary || { totalIncome: 0, totalExpenses: 0, totalSavings: 0, savingsRate: 0 });
      }
      if (monthlyRes.data.success) {
        setMonthlyData(monthlyRes.data.monthly || []);
      }
      if (catRes.data.success) {
        setExpenseCategories(catRes.data.categories || []);
      }
      if (sourceRes.data.success) {
        setIncomeSources(sourceRes.data.sources || []);
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics || {});
      }
    } catch (error) {
      console.error('Failed to load report analytics:', error);
      showToast('error', 'Unable to generate financial report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!monthlyData || monthlyData.length === 0) {
      showToast('error', 'No report data available to export.');
      return;
    }

    const headers = ['Month', 'Income (INR)', 'Expenses (INR)', 'Savings (INR)', 'Savings Rate (%)'];
    const rows = monthlyData.map((row) => [
      row.month,
      row.income,
      row.expenses,
      row.savings,
      `${row.savingsRate}%`,
    ]);

    exportToCSV('MoneyNote_Financial_Report', headers, rows);
    showToast('success', 'Financial report exported to CSV successfully.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert Banner */}
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Page Header & Export Buttons */}
      <PageHeader
        title="Reports & Analytics"
        subtitle="Understand your financial performance and spending patterns."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={triggerPDFPrint}
          >
            Export PDF
          </Button>
        </div>
      </PageHeader>

      {/* Date Range Filters Bar */}
      <ReportDateFilters onFilterChange={setDateRange} />

      {/* Top 4 Summary Cards */}
      {isLoading ? (
        <SkeletonLoader type="summary" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            title="Total Income"
            amount={`₹${summary.totalIncome.toLocaleString('en-IN')}`}
            subtitle="Period earnings"
            icon={TrendingUp}
            iconBgColor="bg-emerald-100 dark:bg-emerald-950/50"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <SummaryCard
            title="Total Expenses"
            amount={`₹${summary.totalExpenses.toLocaleString('en-IN')}`}
            subtitle="Period spending"
            icon={TrendingDown}
            iconBgColor="bg-rose-100 dark:bg-rose-950/50"
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <SummaryCard
            title="Total Savings"
            amount={`${summary.totalSavings < 0 ? '-' : ''}₹${Math.abs(summary.totalSavings).toLocaleString('en-IN')}`}
            subtitle="Net revenue surplus"
            icon={PiggyBank}
            iconBgColor={summary.totalSavings < 0 ? 'bg-rose-100 dark:bg-rose-950/50' : 'bg-indigo-100 dark:bg-indigo-950/50'}
            iconColor={summary.totalSavings < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}
          />
          <SummaryCard
            title="Savings Rate"
            amount={`${summary.savingsRate}%`}
            subtitle="(Savings / Income) × 100"
            icon={Percent}
            iconBgColor="bg-amber-100 dark:bg-amber-950/50"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>
      )}

      {/* Charts Grid - Row 1: Income vs Expense & Monthly Savings Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeVsExpenseChart monthlyData={monthlyData} />
        <SavingsTrendChart monthlyData={monthlyData} />
      </div>

      {/* Charts Grid - Row 2: Expense Category Donut & Income Source Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseCategoryChart categories={expenseCategories} />
        <IncomeSourceChart sources={incomeSources} />
      </div>

      {/* Analytics Cards - Top Spending Category & Top Single Expense */}
      <TopExpensesCard
        topCategory={analytics.highestExpenseCategory}
        topExpense={analytics.highestSingleExpense}
      />

      {/* Health Score & Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialHealthCard health={analytics.financialHealth} />
        <FinancialInsights insights={analytics.insights} />
      </div>

      {/* Monthly Financial Report Table */}
      <ReportTable monthlyReport={monthlyData} />
    </div>
  );
};

export default Reports;
