import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import SummaryCard from '../components/common/SummaryCard';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

import ExpenseFilters from '../components/expense/ExpenseFilters';
import ExpenseTable from '../components/expense/ExpenseTable';
import ExpenseModal from '../components/expense/ExpenseModal';
import DeleteConfirmationModal from '../components/income/DeleteConfirmationModal';

import {
  getExpenses,
  getExpenseSummary,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/api';

import {
  TrendingDown,
  Calendar,
  Layers,
  Award,
  Plus,
  CreditCard,
  SearchX
} from 'lucide-react';

const Expenses = () => {
  // Data States
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    currentMonthExpenses: 0,
    expenseCount: 0,
    highestExpense: 0,
  });

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [sort, setSort] = useState('newest');

  // Loading & Action States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  // Notification Toast State
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: '', message: '' });
    }, 4000);
  };

  // Fetch Expense Data & Summary
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        search: search.trim(),
        category: category === 'All Categories' ? '' : category,
        month: selectedMonth === 'all' ? '' : selectedMonth,
        sort,
      };

      const [expensesRes, summaryRes] = await Promise.all([
        getExpenses(params),
        getExpenseSummary(selectedMonth === 'all' ? '' : selectedMonth),
      ]);

      if (expensesRes.data.success) {
        setExpenses(expensesRes.data.expenses || []);
      }
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.summary || {
          totalExpenses: 0,
          currentMonthExpenses: 0,
          expenseCount: 0,
          highestExpense: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load expense data:', error);
      showToast('error', 'Unable to load expenses. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, selectedMonth, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setSelectedMonth('all');
    setSort('newest');
  };

  // Open Modal for Create
  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item) => {
    setEditingExpense(item);
    setIsModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDeleteModal = (item) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  // Save Expense Handler (Create or Update)
  const handleSaveExpense = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        // Edit Mode
        const res = await updateExpense(editingExpense.id, formData);
        if (res.data.success) {
          showToast('success', 'Expense updated successfully.');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        // Create Mode
        const res = await createExpense(formData);
        if (res.data.success) {
          showToast('success', 'Expense added successfully.');
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save expense record.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      const res = await deleteExpense(deletingItem.id);
      if (res.data.success) {
        showToast('success', 'Expense deleted successfully.');
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
        fetchData();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete expense record.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const isFiltered =
    search.trim() !== '' ||
    category !== 'All Categories' ||
    selectedMonth !== 'all' ||
    sort !== 'newest';

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

      {/* Page Header */}
      <PageHeader
        title="Expenses"
        subtitle="Track where your money goes."
      >
        <Button
          variant="danger"
          icon={Plus}
          onClick={handleOpenAddModal}
        >
          Add Expense
        </Button>
      </PageHeader>

      {/* Top 4 Summary Cards */}
      {isLoading ? (
        <SkeletonLoader type="summary" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            title="Total Expenses"
            amount={`₹${summary.totalExpenses.toLocaleString('en-IN')}`}
            subtitle="All-time spending recorded"
            icon={TrendingDown}
            iconBgColor="bg-rose-100 dark:bg-rose-950/50"
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <SummaryCard
            title="This Month"
            amount={`₹${summary.currentMonthExpenses.toLocaleString('en-IN')}`}
            subtitle={selectedMonth !== 'all' ? `Month: ${selectedMonth}` : 'Current month total'}
            icon={Calendar}
            iconBgColor="bg-indigo-100 dark:bg-indigo-950/50"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <SummaryCard
            title="Expense Records"
            amount={summary.expenseCount.toString()}
            subtitle="Total transactions logged"
            icon={Layers}
            iconBgColor="bg-violet-100 dark:bg-violet-950/50"
            iconColor="text-violet-600 dark:text-violet-400"
          />
          <SummaryCard
            title="Highest Expense"
            amount={`₹${summary.highestExpense.toLocaleString('en-IN')}`}
            subtitle="Single largest outflow"
            icon={Award}
            iconBgColor="bg-amber-100 dark:bg-amber-950/50"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>
      )}

      {/* Filters Bar */}
      <ExpenseFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        sort={sort}
        setSort={setSort}
        onResetFilters={handleResetFilters}
      />

      {/* Main Expense List / Table Content */}
      {isLoading ? (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 shadow-soft">
          <SkeletonLoader type="table" count={5} />
        </div>
      ) : expenses.length > 0 ? (
        <ExpenseTable
          expenses={expenses}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      ) : isFiltered ? (
        <EmptyState
          icon={SearchX}
          title="No matching expenses found"
          description="We couldn't find any expense records matching your current filter criteria."
          action={
            <Button variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={CreditCard}
          title="No expenses recorded yet"
          description="Start tracking your daily spending to understand where your money goes."
          action={
            <Button variant="danger" icon={Plus} onClick={handleOpenAddModal}>
              + Add Expense
            </Button>
          }
        />
      )}

      {/* Modal Dialogs */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveExpense}
        editingExpense={editingExpense}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        incomeItem={deletingItem ? { source: deletingItem.category, amount: deletingItem.amount, date: deletingItem.date } : null}
      />
    </div>
  );
};

export default Expenses;
