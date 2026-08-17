import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import SummaryCard from '../components/common/SummaryCard';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

import IncomeFilters from '../components/income/IncomeFilters';
import IncomeTable from '../components/income/IncomeTable';
import IncomeModal from '../components/income/IncomeModal';
import DeleteConfirmationModal from '../components/income/DeleteConfirmationModal';

import {
  getIncomes,
  getIncomeSummary,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../services/api';

import {
  TrendingUp,
  Calendar,
  Layers,
  Award,
  Plus,
  Wallet,
  SearchX
} from 'lucide-react';

const Income = () => {
  // Data States
  const [incomes, setIncomes] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    currentMonthIncome: 0,
    incomeCount: 0,
    highestIncome: 0,
  });

  // Filter States
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('All Sources');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [sort, setSort] = useState('newest');

  // Loading & Action States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
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

  // Fetch Income Data & Summary
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        search: search.trim(),
        source: source === 'All Sources' ? '' : source,
        month: selectedMonth === 'all' ? '' : selectedMonth,
        sort,
      };

      const [incomesRes, summaryRes] = await Promise.all([
        getIncomes(params),
        getIncomeSummary(selectedMonth === 'all' ? '' : selectedMonth),
      ]);

      if (incomesRes.data.success) {
        setIncomes(incomesRes.data.incomes || []);
      }
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.summary || {
          totalIncome: 0,
          currentMonthIncome: 0,
          incomeCount: 0,
          highestIncome: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load income data:', error);
      showToast('error', 'Unable to load income records. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [search, source, selectedMonth, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setSource('All Sources');
    setSelectedMonth('all');
    setSort('newest');
  };

  // Open Modal for Create
  const handleOpenAddModal = () => {
    setEditingIncome(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item) => {
    setEditingIncome(item);
    setIsModalOpen(true);
  };

  // Open Delete Confirmation
  const handleOpenDeleteModal = (item) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  // Save Income Handler (Create or Update)
  const handleSaveIncome = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingIncome) {
        // Edit Mode
        const res = await updateIncome(editingIncome.id, formData);
        if (res.data.success) {
          showToast('success', 'Income updated successfully.');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        // Create Mode
        const res = await createIncome(formData);
        if (res.data.success) {
          showToast('success', 'Income added successfully.');
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save income record.';
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
      const res = await deleteIncome(deletingItem.id);
      if (res.data.success) {
        showToast('success', 'Income deleted successfully.');
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
        fetchData();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete income record.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const isFiltered =
    search.trim() !== '' ||
    source !== 'All Sources' ||
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
        title="Income Management"
        subtitle="Track and manage all your revenue streams and incoming funds."
      >
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAddModal}
        >
          Add Income
        </Button>
      </PageHeader>

      {/* Top 4 Summary Cards */}
      {isLoading ? (
        <SkeletonLoader type="summary" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            title="Total Income"
            amount={`₹${summary.totalIncome.toLocaleString('en-IN')}`}
            subtitle="All-time earnings recorded"
            icon={TrendingUp}
            iconBgColor="bg-emerald-100 dark:bg-emerald-950/50"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <SummaryCard
            title="Current Month"
            amount={`₹${summary.currentMonthIncome.toLocaleString('en-IN')}`}
            subtitle={selectedMonth !== 'all' ? `Month: ${selectedMonth}` : 'Selected period total'}
            icon={Calendar}
            iconBgColor="bg-indigo-100 dark:bg-indigo-950/50"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <SummaryCard
            title="Income Records"
            amount={summary.incomeCount.toString()}
            subtitle="Total transactions logged"
            icon={Layers}
            iconBgColor="bg-violet-100 dark:bg-violet-950/50"
            iconColor="text-violet-600 dark:text-violet-400"
          />
          <SummaryCard
            title="Highest Income"
            amount={`₹${summary.highestIncome.toLocaleString('en-IN')}`}
            subtitle="Single largest deposit"
            icon={Award}
            iconBgColor="bg-amber-100 dark:bg-amber-950/50"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>
      )}

      {/* Filters Bar */}
      <IncomeFilters
        search={search}
        setSearch={setSearch}
        source={source}
        setSource={setSource}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        sort={sort}
        setSort={setSort}
        onResetFilters={handleResetFilters}
      />

      {/* Main Income List / Table Content */}
      {isLoading ? (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 shadow-soft">
          <SkeletonLoader type="table" count={5} />
        </div>
      ) : incomes.length > 0 ? (
        <IncomeTable
          incomes={incomes}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      ) : isFiltered ? (
        <EmptyState
          icon={SearchX}
          title="No matching income found"
          description="We couldn't find any income records matching your current filter criteria."
          action={
            <Button variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={Wallet}
          title="No income added yet"
          description="Add your salary or other income sources to start tracking your money."
          action={
            <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
              + Add Income
            </Button>
          }
        />
      )}

      {/* Modal Dialogs */}
      <IncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveIncome}
        editingIncome={editingIncome}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        incomeItem={deletingItem}
      />
    </div>
  );
};

export default Income;
