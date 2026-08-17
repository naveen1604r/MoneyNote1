import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import SummaryCard from '../components/common/SummaryCard';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

import MonthSelector from '../components/budget/MonthSelector';
import OverallBudgetCard from '../components/budget/OverallBudgetCard';
import BudgetCategoryCard from '../components/budget/BudgetCategoryCard';
import BudgetComparisonChart from '../components/budget/BudgetComparisonChart';
import BudgetModal from '../components/budget/BudgetModal';
import DeleteBudgetConfirmation from '../components/budget/DeleteBudgetConfirmation';

import { useSettings } from '../context/SettingsContext';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  getBudgetAnalytics,
} from '../services/api';

import {
  Target,
  TrendingDown,
  PiggyBank,
  Percent,
  Plus,
  WalletCards
} from 'lucide-react';

const Budgets = () => {
  const { formatCurrency } = useSettings();

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Data States
  const [budgetsList, setBudgetsList] = useState([]);
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    usagePercentage: 0,
  });
  const [analytics, setAnalytics] = useState([]);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState(null);

  // Toast Alerts
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: '', message: '' });
    }, 4000);
  };

  // Fetch All Budget Data for Selected Month/Year
  const fetchBudgetData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listRes, sumRes, analyticsRes] = await Promise.all([
        getBudgets(selectedMonth, selectedYear),
        getBudgetSummary(selectedMonth, selectedYear),
        getBudgetAnalytics(selectedMonth, selectedYear),
      ]);

      if (listRes.data.success) {
        setBudgetsList(listRes.data.budgets || []);
      }
      if (sumRes.data.success) {
        setSummary(sumRes.data.summary || { totalBudget: 0, totalSpent: 0, remaining: 0, usagePercentage: 0 });
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics || []);
      }
    } catch (error) {
      console.error('Failed to load budget data:', error);
      showToast('error', 'Unable to load budget data.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  const handleMonthChange = (newMonth, newYear) => {
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  // Open Modal for Create Budget
  const handleOpenAddModal = (defaultCategory = 'Overall') => {
    setEditingBudget(null);
    setIsBudgetModalOpen(true);
  };

  // Open Modal for Edit Budget
  const handleOpenEditModal = (budget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  // Open Modal for Delete Budget
  const handleOpenDeleteModal = (budget) => {
    setDeletingBudget(budget);
    setIsDeleteModalOpen(true);
  };

  // Save Budget Handler (Create / Update)
  const handleSaveBudget = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingBudget) {
        const res = await updateBudget(editingBudget.id, formData);
        if (res.data.success) {
          showToast('success', 'Budget updated successfully.');
          setIsBudgetModalOpen(false);
          fetchBudgetData();
        }
      } else {
        const res = await createBudget(formData);
        if (res.data.success) {
          showToast('success', 'Budget created successfully.');
          setIsBudgetModalOpen(false);
          fetchBudgetData();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save budget.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingBudget) return;
    setIsDeleting(true);
    try {
      const res = await deleteBudget(deletingBudget.id);
      if (res.data.success) {
        showToast('success', 'Budget deleted successfully.');
        setIsDeleteModalOpen(false);
        setDeletingBudget(null);
        fetchBudgetData();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete budget.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const overallBudget = budgetsList.find((b) => b.category === 'Overall');
  const isExceeded = summary.remaining < 0;

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
        title="Budget"
        subtitle="Set spending limits and stay in control of your money."
      >
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => handleOpenAddModal('Overall')}
        >
          Add Budget
        </Button>
      </PageHeader>

      {/* Month Selector */}
      <MonthSelector
        month={selectedMonth}
        year={selectedYear}
        onMonthChange={handleMonthChange}
      />

      {/* Top 4 Summary Cards */}
      {isLoading ? (
        <SkeletonLoader type="summary" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            title="Total Budget"
            amount={formatCurrency(summary.totalBudget)}
            subtitle="Target spending limit"
            icon={Target}
            iconBgColor="bg-indigo-100 dark:bg-indigo-950/50"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <SummaryCard
            title="Total Spent"
            amount={formatCurrency(summary.totalSpent)}
            subtitle="Actual monthly expenses"
            icon={TrendingDown}
            iconBgColor="bg-rose-100 dark:bg-rose-950/50"
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <SummaryCard
            title={isExceeded ? 'Over Budget Deficit' : 'Remaining Budget'}
            amount={`${isExceeded ? '-' : ''}${formatCurrency(Math.abs(summary.remaining))}`}
            subtitle={isExceeded ? 'Exceeded budget target' : 'Available spending surplus'}
            icon={PiggyBank}
            iconBgColor={isExceeded ? 'bg-rose-100 dark:bg-rose-950/50' : 'bg-emerald-100 dark:bg-emerald-950/50'}
            iconColor={isExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}
            tooltip="Remaining budget is your allocated budget target minus your actual spending."
          />
          <SummaryCard
            title="Budget Used"
            amount={`${summary.usagePercentage}%`}
            subtitle="(Spent / Budget) × 100"
            icon={Percent}
            iconBgColor="bg-amber-100 dark:bg-amber-950/50"
            iconColor="text-amber-600 dark:text-amber-400"
            tooltip="Budget Usage is the percentage of your monthly budget already spent."
          />
        </div>
      )}

      {/* Overall Monthly Budget Card */}
      <OverallBudgetCard
        overallBudget={overallBudget}
        totalSpent={summary.totalSpent}
        onAddOverall={() => handleOpenAddModal('Overall')}
        onEditOverall={handleOpenEditModal}
        onDeleteOverall={handleOpenDeleteModal}
      />

      {/* Recharts Budget vs Actual Comparison */}
      <BudgetComparisonChart analyticsData={analytics} />

      {/* Category Budgets Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Category Budgets ({analytics.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => handleOpenAddModal('Food')}
          >
            Add Category Budget
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonLoader type="card" count={6} />
          </div>
        ) : analytics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {analytics.map((item) => (
              <BudgetCategoryCard
                key={item.id || item.category}
                item={item}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={WalletCards}
            title="No budget created yet"
            description="Set a monthly budget to control your spending."
            action={
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => handleOpenAddModal('Food')}
              >
                + Create Budget
              </Button>
            }
          />
        )}
      </div>

      {/* Modals */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSubmit={handleSaveBudget}
        editingBudget={editingBudget}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
        isSubmitting={isSubmitting}
      />

      <DeleteBudgetConfirmation
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        budgetItem={deletingBudget}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Budgets;
