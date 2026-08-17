import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import SummaryCard from '../components/common/SummaryCard';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

import SavingsHealth from '../components/savings/SavingsHealth';
import SavingsGoalCard from '../components/savings/SavingsGoalCard';
import SavingsGoalModal from '../components/savings/SavingsGoalModal';
import MonthlySavingsChart from '../components/savings/MonthlySavingsChart';
import DeleteConfirmationModal from '../components/income/DeleteConfirmationModal';

import {
  getSavingsSummary,
  getMonthlySavings,
  getMonthlySavingsHistory,
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
} from '../services/api';

import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Plus,
  Target,
  Calendar
} from 'lucide-react';

const generateMonthOptions = () => {
  const options = [{ label: 'All Time Summary', value: 'all' }];
  const currentDate = new Date();

  for (let i = 0; i < 12; i++) {
    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth() - i;
    const d = new Date(year, monthIndex, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const value = `${yyyy}-${mm}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    options.push({ label, value });
  }

  return options;
};

const Savings = () => {
  // Data States
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    savingsRate: 0,
  });
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [goals, setGoals] = useState([]);

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Loading & Action States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingGoal, setDeletingGoal] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: '', message: '' });
    }, 4000);
  };

  const monthOptions = generateMonthOptions();

  // Fetch Summary, Monthly History & Savings Goals
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const summaryPromise = selectedMonth === 'all'
        ? getSavingsSummary()
        : getMonthlySavings(selectedMonth);

      const [sumRes, historyRes, goalsRes] = await Promise.all([
        summaryPromise,
        getMonthlySavingsHistory(),
        getSavingsGoals(),
      ]);

      if (sumRes.data.success) {
        if (selectedMonth === 'all') {
          setSummary(sumRes.data.summary || { totalIncome: 0, totalExpenses: 0, totalSavings: 0, savingsRate: 0 });
        } else {
          const m = sumRes.data.monthly || {};
          setSummary({
            totalIncome: m.income || 0,
            totalExpenses: m.expenses || 0,
            totalSavings: m.savings || 0,
            savingsRate: m.savingsRate || 0,
          });
        }
      }

      if (historyRes.data.success) {
        setMonthlyHistory(historyRes.data.history || []);
      }

      if (goalsRes.data.success) {
        setGoals(goalsRes.data.goals || []);
      }
    } catch (error) {
      console.error('Failed to load savings data:', error);
      showToast('error', 'Unable to load savings metrics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Modal for Create Goal
  const handleOpenAddModal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit Goal
  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (goal) => {
    setDeletingGoal(goal);
    setIsDeleteModalOpen(true);
  };

  // Save Goal Handler (Create or Update)
  const handleSaveGoal = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingGoal) {
        const res = await updateSavingsGoal(editingGoal.id, formData);
        if (res.data.success) {
          showToast('success', 'Savings goal updated successfully.');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await createSavingsGoal(formData);
        if (res.data.success) {
          showToast('success', 'Savings goal created successfully.');
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save savings goal.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete Goal Handler
  const handleConfirmDelete = async () => {
    if (!deletingGoal) return;
    setIsDeleting(true);
    try {
      const res = await deleteSavingsGoal(deletingGoal.id);
      if (res.data.success) {
        showToast('success', 'Savings goal deleted successfully.');
        setIsDeleteModalOpen(false);
        setDeletingGoal(null);
        fetchData();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete savings goal.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Savings & Goals"
        subtitle="Monitor net savings, track financial growth, and manage custom targets."
      >
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAddModal}
        >
          New Savings Goal
        </Button>
      </PageHeader>

      {/* Month Filter Selector Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Savings Period Filter:</span>
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
        >
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Top 4 Summary Cards */}
      {isLoading ? (
        <SkeletonLoader type="summary" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            title="Total Income"
            amount={`₹${summary.totalIncome.toLocaleString('en-IN')}`}
            subtitle={selectedMonth !== 'all' ? `Period Income (${selectedMonth})` : 'All-time income logged'}
            icon={TrendingUp}
            iconBgColor="bg-emerald-100 dark:bg-emerald-950/50"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <SummaryCard
            title="Total Expenses"
            amount={`₹${summary.totalExpenses.toLocaleString('en-IN')}`}
            subtitle={selectedMonth !== 'all' ? `Period Expenses (${selectedMonth})` : 'All-time expenses logged'}
            icon={TrendingDown}
            iconBgColor="bg-rose-100 dark:bg-rose-950/50"
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <SummaryCard
            title="Net Savings"
            amount={`₹${summary.totalSavings.toLocaleString('en-IN')}`}
            subtitle="Income minus expenses"
            icon={PiggyBank}
            iconBgColor="bg-indigo-100 dark:bg-indigo-950/50"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <SummaryCard
            title="Savings Rate"
            amount={`${summary.savingsRate}%`}
            subtitle="Percentage of income saved"
            icon={Percent}
            iconBgColor="bg-amber-100 dark:bg-amber-950/50"
            iconColor="text-amber-600 dark:text-amber-400"
            tooltip="Savings Rate is the percentage of your total income retained after paying all expenses."
          />
        </div>
      )}

      {/* Financial Flow & Savings Recharts Breakdown */}
      {isLoading ? (
        <SkeletonLoader type="card" count={1} />
      ) : (
        <MonthlySavingsChart history={monthlyHistory} />
      )}

      {/* Financial Health & Advice Section */}
      {!isLoading && (
        <SavingsHealth
          savingsRate={summary.savingsRate}
          totalSavings={summary.totalSavings}
          goalsCount={goals.length}
        />
      )}

      {/* Savings Goals Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Savings Goals ({goals.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track progress toward your specific financial targets
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            Add Goal
          </Button>
        </div>

        {isLoading ? (
          <SkeletonLoader type="card" count={3} />
        ) : goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="No savings goals yet"
            description="Create a goal and track your progress toward it."
            action={
              <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
                + Create Goal
              </Button>
            }
          />
        )}
      </div>

      {/* Modal Dialogs */}
      <SavingsGoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveGoal}
        editingGoal={editingGoal}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        incomeItem={deletingGoal ? { source: deletingGoal.goalName } : null}
      />
    </div>
  );
};

export default Savings;
