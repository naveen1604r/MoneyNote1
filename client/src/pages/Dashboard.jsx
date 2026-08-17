import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../components/common/SummaryCard';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

import QuickActions from '../components/dashboard/QuickActions';
import IncomeVsExpenseChart from '../components/dashboard/IncomeVsExpenseChart';
import SavingsTrendChart from '../components/dashboard/SavingsTrendChart';
import ExpenseCategoryDonut from '../components/dashboard/ExpenseCategoryDonut';
import FinancialHealthCard from '../components/dashboard/FinancialHealthCard';
import DynamicInsightCard from '../components/dashboard/DynamicInsightCard';
import MonthSelector from '../components/budget/MonthSelector';

import OnboardingModal from '../components/onboarding/OnboardingModal';
import GettingStartedChecklist from '../components/dashboard/GettingStartedChecklist';

// Modals
import IncomeModal from '../components/income/IncomeModal';
import ExpenseModal from '../components/expense/ExpenseModal';
import BudgetModal from '../components/budget/BudgetModal';
import NoteModal from '../components/notes/NoteModal';
import ReminderModal from '../components/reminders/ReminderModal';

import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  getDashboardData,
  createIncome,
  createExpense,
  createBudget,
  createNote,
  createReminder,
} from '../services/api';

import {
  Wallet,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Percent,
  ArrowUpRight,
  Target,
  Repeat,
  FileText,
  Bell,
  Calendar,
  AlertTriangle,
  Pin,
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Receipt,
  Zap,
  Wifi,
  HeartPulse,
  Briefcase,
  Building2,
  Award,
  CreditCard
} from 'lucide-react';

const transactionIconMap = {
  Salary: { icon: Wallet, color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' },
  Freelance: { icon: Briefcase, color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' },
  Business: { icon: Building2, color: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400' },
  Bonus: { icon: Award, color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' },
  Food: { icon: Utensils, color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' },
  Rent: { icon: Home, color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' },
  Transport: { icon: Car, color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' },
  Shopping: { icon: ShoppingBag, color: 'bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400' },
  Bills: { icon: Receipt, color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' },
  Electricity: { icon: Zap, color: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400' },
  Internet: { icon: Wifi, color: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400' },
  Healthcare: { icon: HeartPulse, color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatCurrency, formatDate } = useSettings();

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Dashboard Data State
  const [dashData, setDashData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Quick Action Modal States
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast Banner
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  // Fetch Consolidated Dashboard Data
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await getDashboardData(selectedMonth, selectedYear);
      if (res.data.success) {
        setDashData(res.data);
      } else {
        setHasError(true);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Dynamic Time Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Formated Current Date (e.g. Friday, August 14, 2026)
  const currentFormattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Modal Handlers
  const handleCreateIncome = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await createIncome(formData);
      if (res.data.success) {
        showToast('success', 'Income record added successfully.');
        setIsIncomeModalOpen(false);
        loadDashboard();
      }
    } catch (err) {
      showToast('error', 'Failed to add income record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateExpense = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await createExpense(formData);
      if (res.data.success) {
        showToast('success', 'Expense record added successfully.');
        setIsExpenseModalOpen(false);
        loadDashboard();
      }
    } catch (err) {
      showToast('error', 'Failed to add expense record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBudget = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await createBudget(formData);
      if (res.data.success) {
        showToast('success', 'Budget target created successfully.');
        setIsBudgetModalOpen(false);
        loadDashboard();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create budget.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNote = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await createNote(formData);
      if (res.data.success) {
        showToast('success', 'Finance note created successfully.');
        setIsNoteModalOpen(false);
        loadDashboard();
      }
    } catch (err) {
      showToast('error', 'Failed to create note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReminder = async (formData) => {
    setIsSubmitting(true);
    try {
      const res = await createReminder(formData);
      if (res.data.success) {
        showToast('success', 'Financial reminder added successfully.');
        setIsReminderModalOpen(false);
        loadDashboard();
      }
    } catch (err) {
      showToast('error', 'Failed to create reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasError) {
    return (
      <div className="p-12 text-center space-y-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Unable to load your financial overview
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Please check your backend connection and try again.
        </p>
        <Button variant="primary" onClick={loadDashboard}>
          Try Again
        </Button>
      </div>
    );
  }

  const summary = dashData?.summary || { balance: 0, totalIncome: 0, totalExpenses: 0, totalSavings: 0, savingsRate: 0 };
  const monthlyOverview = dashData?.monthlyOverview || { income: 0, expenses: 0, savings: 0 };
  const budget = dashData?.budget || { totalBudget: 0, spent: 0, remaining: 0, usagePercentage: 0, status: 'safe' };
  const isNegativeBalance = summary.balance < 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* First-Time User Onboarding Modal */}
      <OnboardingModal />

      {/* Toast Alert Banner */}
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Header Greeting & Current Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {user?.name || 'User'} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here's your financial command center.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/70 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-soft shrink-0">
          <Calendar className="w-4 h-4 text-primary" />
          <span>{currentFormattedDate}</span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <QuickActions
        onAddIncome={() => setIsIncomeModalOpen(true)}
        onAddExpense={() => setIsExpenseModalOpen(true)}
        onAddBudget={() => setIsBudgetModalOpen(true)}
        onAddNote={() => setIsNoteModalOpen(true)}
        onAddReminder={() => setIsReminderModalOpen(true)}
      />

      {/* Getting Started Onboarding Checklist Card */}
      {!isLoading && (
        <GettingStartedChecklist
          incomeCount={dashData?.recentTransactions?.incomes?.length || 0}
          expenseCount={dashData?.recentTransactions?.expenses?.length || 0}
          goalCount={dashData?.savingsGoals?.length || 0}
          budgetCount={dashData?.budget?.totalBudget > 0 ? 1 : 0}
        />
      )}

      {/* 4 Primary Summary Cards */}
      {isLoading ? (
        <SkeletonLoader type="summary" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            title="Current Balance"
            amount={`${isNegativeBalance ? '-' : ''}${formatCurrency(Math.abs(summary.balance))}`}
            subtitle={isNegativeBalance ? 'Negative Balance Warning' : 'Total Income minus Expenses'}
            icon={Wallet}
            iconBgColor={isNegativeBalance ? 'bg-rose-100 dark:bg-rose-950/50' : 'bg-indigo-100 dark:bg-indigo-950/50'}
            iconColor={isNegativeBalance ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}
          />
          <SummaryCard
            title="Total Income"
            amount={formatCurrency(summary.totalIncome)}
            subtitle="All-time earned revenue"
            icon={TrendingUp}
            iconBgColor="bg-emerald-100 dark:bg-emerald-950/50"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <SummaryCard
            title="Total Expenses"
            amount={formatCurrency(summary.totalExpenses)}
            subtitle="All-time actual spending"
            icon={TrendingDown}
            iconBgColor="bg-rose-100 dark:bg-rose-950/50"
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <SummaryCard
            title="Total Savings"
            amount={formatCurrency(summary.totalSavings)}
            subtitle={`Savings Rate: ${summary.savingsRate}%`}
            icon={PiggyBank}
            iconBgColor="bg-amber-100 dark:bg-amber-950/50"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>
      )}

      {/* Monthly Overview Section */}
      <div className="space-y-4">
        <MonthSelector
          month={selectedMonth}
          year={selectedYear}
          onMonthChange={(m, y) => {
            setSelectedMonth(m);
            setSelectedYear(y);
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Monthly Income
            </span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(monthlyOverview.income)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Monthly Expenses
            </span>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(monthlyOverview.expenses)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Monthly Savings
            </span>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {formatCurrency(monthlyOverview.savings)}
            </p>
          </div>
        </div>
      </div>

      {/* 6-Month Recharts Section (Income vs Expenses & Savings Growth) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeVsExpenseChart trendsData={dashData?.historicalTrends || []} />
        <SavingsTrendChart trendsData={dashData?.historicalTrends || []} />
      </div>

      {/* Budget Overview & Top Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-primary">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Budget Overview
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-block mt-0.5 ${
                    budget.status === 'exceeded'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                      : budget.status === 'critical'
                      ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-600'
                      : budget.status === 'warning'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                  }`}>
                    {budget.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {budget.usagePercentage}% Used
              </span>
            </div>

            {/* Figures */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Target</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(budget.totalBudget)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Spent</span>
                <span className="text-xs font-black text-rose-500">{formatCurrency(budget.spent)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Remaining</span>
                <span className="text-xs font-black text-emerald-500">{formatCurrency(budget.remaining)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budget.status === 'exceeded' ? 'bg-rose-600' : budget.status === 'critical' ? 'bg-orange-500' : budget.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, budget.usagePercentage)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-center">
            <button
              onClick={() => navigate('/budgets')}
              className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
            >
              View Budget <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <ExpenseCategoryDonut categories={dashData?.expenseCategories || []} />
      </div>

      {/* Recent Transactions Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest 8 actual income and expense entries from database
            </p>
          </div>
          <button
            onClick={() => navigate('/expenses')}
            className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {dashData?.recentTransactions?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-700/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                {dashData.recentTransactions.map((tx) => {
                  const meta = transactionIconMap[tx.title] || {
                    icon: tx.type === 'income' ? Wallet : CreditCard,
                    color: tx.type === 'income'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
                  };
                  const IconComp = meta.icon;

                  return (
                    <tr key={`${tx.type}-${tx.id}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl ${meta.color}`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                            {tx.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {formatDate(tx.date)}
                      </td>
                      <td className={`py-3 px-3 text-right font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.type === 'income' ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-slate-400 font-medium">No transactions recorded yet.</p>
            <div className="flex justify-center gap-2">
              <Button variant="primary" size="sm" onClick={() => setIsIncomeModalOpen(true)}>+ Add Income</Button>
              <Button variant="outline" size="sm" onClick={() => setIsExpenseModalOpen(true)}>+ Add Expense</Button>
            </div>
          </div>
        )}
      </div>

      {/* Savings Goals & Upcoming Recurring (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Goals */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Savings Goals</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Top active financial targets</p>
              </div>
              <PiggyBank className="w-5 h-5 text-amber-500" />
            </div>

            {dashData?.savingsGoals?.length > 0 ? (
              <div className="space-y-4">
                {dashData.savingsGoals.map((g) => (
                  <div key={g.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 space-y-2 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white">{g.goalName}</span>
                      <span className="text-emerald-600">{g.completed ? 'Goal Completed 🎉' : `${formatCurrency(g.currentSaved)} / ${formatCurrency(g.targetAmount)}`}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${g.percentage}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>{g.percentage}% Saved</span>
                      <span>{formatCurrency(g.remaining)} remaining</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No active savings goals set.</div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-center">
            <button onClick={() => navigate('/savings')} className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1">
              View Goals <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Upcoming Recurring */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Recurring</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Next scheduled regular payments</p>
              </div>
              <Repeat className="w-5 h-5 text-indigo-500" />
            </div>

            {dashData?.upcomingRecurring?.length > 0 ? (
              <div className="space-y-3">
                {dashData.upcomingRecurring.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{r.title}</span>
                      <span className="text-[11px] text-slate-400">Due {formatDate(r.nextOccurrence)}</span>
                    </div>
                    <span className={`font-black ${r.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {r.type === 'income' ? `+${formatCurrency(r.amount)}` : `-${formatCurrency(r.amount)}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No upcoming recurring items.</div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-center">
            <button onClick={() => navigate('/recurring')} className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Finance Notes & Notifications Preview (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finance Notes */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Finance Notes</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Quick financial thoughts & reminders</p>
              </div>
              <FileText className="w-5 h-5 text-indigo-500" />
            </div>

            {dashData?.recentNotes?.length > 0 ? (
              <div className="space-y-3">
                {dashData.recentNotes.map((note) => (
                  <div key={note.id} onClick={() => navigate('/notes')} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {note.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      <span className="font-bold text-slate-900 dark:text-white">{note.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{formatDate(note.noteDate)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">No finance notes created.</div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-center">
            <button onClick={() => navigate('/notes')} className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1">
              View All Notes <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notifications Preview */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Notifications</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Latest unread alerts</p>
              </div>
              <Bell className="w-5 h-5 text-indigo-500" />
            </div>

            {dashData?.notifications?.length > 0 ? (
              <div className="space-y-3">
                {dashData.notifications.map((n) => (
                  <div key={n.id} onClick={() => navigate('/notifications')} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-slate-300 transition-all cursor-pointer space-y-0.5 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">{n.title}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{n.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">You're all caught up! No unread notifications.</div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 text-center">
            <button onClick={() => navigate('/notifications')} className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1">
              View Notifications <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Financial Insight & Financial Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DynamicInsightCard insight={dashData?.insight} />
        </div>
        <div>
          <FinancialHealthCard health={dashData?.financialHealth} />
        </div>
      </div>

      {/* Modals for Quick Actions */}
      <IncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSubmit={handleCreateIncome}
        isSubmitting={isSubmitting}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleCreateExpense}
        isSubmitting={isSubmitting}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSubmit={handleCreateBudget}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
        isSubmitting={isSubmitting}
      />

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleCreateNote}
        isSubmitting={isSubmitting}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        onSubmit={handleCreateReminder}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Dashboard;
