import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import SummaryCard from '../components/common/SummaryCard';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

import RecurringCard from '../components/recurring/RecurringCard';
import RecurringModal from '../components/recurring/RecurringModal';
import UpcomingList from '../components/recurring/UpcomingList';
import DeleteConfirmationModal from '../components/income/DeleteConfirmationModal';

import { useSettings } from '../context/SettingsContext';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
  processRecurringTransactions,
} from '../services/api';

import {
  Repeat,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  Play,
  Search,
  RotateCw
} from 'lucide-react';

const Recurring = () => {
  const { formatCurrency, formatDate } = useSettings();

  // Data States
  const [recurringList, setRecurringList] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'income' | 'expense' | 'active' | 'paused'
  const [search, setSearch] = useState('');

  // Loading & Processing States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRecurring, setDeletingRecurring] = useState(null);

  // Toast Alerts
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: '', message: '' });
    }, 4000);
  };

  // Fetch Recurring List
  const fetchRecurringList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getRecurringTransactions();
      if (res.data.success) {
        setRecurringList(res.data.recurringTransactions || []);
      }
    } catch (error) {
      console.error('Failed to load recurring transactions:', error);
      showToast('error', 'Unable to load recurring transactions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecurringList();
  }, [fetchRecurringList]);

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingRecurring(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item) => {
    setEditingRecurring(item);
    setIsModalOpen(true);
  };

  // Open Modal for Delete
  const handleOpenDeleteModal = (item) => {
    setDeletingRecurring(item);
    setIsDeleteModalOpen(true);
  };

  // Toggle Pause / Resume
  const handleTogglePause = async (item) => {
    try {
      if (item.isActive) {
        const res = await pauseRecurringTransaction(item.id);
        if (res.data.success) {
          showToast('success', 'Recurring transaction paused.');
          fetchRecurringList();
        }
      } else {
        const res = await resumeRecurringTransaction(item.id);
        if (res.data.success) {
          showToast('success', 'Recurring transaction resumed.');
          fetchRecurringList();
        }
      }
    } catch (error) {
      showToast('error', 'Failed to update recurring status.');
    }
  };

  // Manual Processing Trigger
  const handleRunProcessing = async () => {
    setIsProcessing(true);
    try {
      const res = await processRecurringTransactions();
      if (res.data.success) {
        showToast('success', res.data.message);
        fetchRecurringList();
      }
    } catch (error) {
      showToast('error', 'Failed to process recurring transactions.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Handler (Create / Update)
  const handleSaveRecurring = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingRecurring) {
        const res = await updateRecurringTransaction(editingRecurring.id, formData);
        if (res.data.success) {
          showToast('success', 'Recurring template updated successfully.');
          setIsModalOpen(false);
          fetchRecurringList();
        }
      } else {
        const res = await createRecurringTransaction(formData);
        if (res.data.success) {
          showToast('success', 'Recurring template created successfully.');
          setIsModalOpen(false);
          fetchRecurringList();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save recurring template.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Confirmation Handler
  const handleConfirmDelete = async () => {
    if (!deletingRecurring) return;
    setIsDeleting(true);
    try {
      const res = await deleteRecurringTransaction(deletingRecurring.id);
      if (res.data.success) {
        showToast('success', 'Recurring template deleted (Previous transactions remain intact).');
        setIsDeleteModalOpen(false);
        setDeletingRecurring(null);
        fetchRecurringList();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete recurring template.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search Logic
  const filteredList = recurringList.filter((item) => {
    // Search
    const searchLower = search.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (filter === 'income') return item.type === 'income';
    if (filter === 'expense') return item.type === 'expense';
    if (filter === 'active') return item.isActive;
    if (filter === 'paused') return !item.isActive;
    return true;
  });

  // Calculate Summary Figures
  const activeCount = recurringList.filter((r) => r.isActive).length;

  const monthlyIncome = recurringList
    .filter((r) => r.isActive && r.type === 'income')
    .reduce((sum, r) => {
      if (r.frequency === 'monthly') return sum + r.amount;
      if (r.frequency === 'daily') return sum + r.amount * 30;
      if (r.frequency === 'weekly') return sum + r.amount * 4;
      if (r.frequency === 'yearly') return sum + r.amount / 12;
      return sum;
    }, 0);

  const monthlyExpenses = recurringList
    .filter((r) => r.isActive && r.type === 'expense')
    .reduce((sum, r) => {
      if (r.frequency === 'monthly') return sum + r.amount;
      if (r.frequency === 'daily') return sum + r.amount * 30;
      if (r.frequency === 'weekly') return sum + r.amount * 4;
      if (r.frequency === 'yearly') return sum + r.amount / 12;
      return sum;
    }, 0);

  const upcomingSorted = [...recurringList]
    .filter((r) => r.isActive)
    .sort((a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence));

  const nextUpcoming = upcomingSorted.length > 0 ? upcomingSorted[0] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Banner */}
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Recurring Transactions"
        subtitle="Automate regular income and expenses to keep your finances effortless."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RotateCw}
            onClick={handleRunProcessing}
            isLoading={isProcessing}
          >
            Run Processing
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            Add Recurring
          </Button>
        </div>
      </PageHeader>

      {/* Top 4 Summary Cards */}
      {isLoading ? (
        <SkeletonLoader type="summary" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            title="Active Recurring"
            amount={activeCount.toString()}
            subtitle="Automated templates running"
            icon={Repeat}
            iconBgColor="bg-indigo-100 dark:bg-indigo-950/50"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <SummaryCard
            title="Est. Monthly Income"
            amount={formatCurrency(monthlyIncome)}
            subtitle="Automated regular revenue"
            icon={TrendingUp}
            iconBgColor="bg-emerald-100 dark:bg-emerald-950/50"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <SummaryCard
            title="Est. Monthly Expenses"
            amount={formatCurrency(monthlyExpenses)}
            subtitle="Automated bill spending"
            icon={TrendingDown}
            iconBgColor="bg-rose-100 dark:bg-rose-950/50"
            iconColor="text-rose-600 dark:text-rose-400"
          />
          <SummaryCard
            title="Next Upcoming"
            amount={nextUpcoming ? formatDate(nextUpcoming.nextOccurrence) : 'None'}
            subtitle={nextUpcoming ? `${nextUpcoming.title} (${formatCurrency(nextUpcoming.amount)})` : 'All caught up'}
            icon={Calendar}
            iconBgColor="bg-amber-100 dark:bg-amber-950/50"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>
      )}

      {/* Upcoming List Section */}
      <UpcomingList upcomingItems={upcomingSorted.slice(0, 5)} />

      {/* Filter Bar & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { label: 'All', value: 'all' },
            { label: 'Income', value: 'income' },
            { label: 'Expense', value: 'expense' },
            { label: 'Active Only', value: 'active' },
            { label: 'Paused Only', value: 'paused' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === f.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search recurring..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Recurring Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonLoader type="card" count={6} />
        </div>
      ) : filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((item) => (
            <RecurringCard
              key={item.id}
              item={item}
              onEdit={handleOpenEditModal}
              onTogglePause={handleTogglePause}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Repeat}
          title="No recurring transactions found"
          description="Automate regular incomes like salary and recurring bill payments like rent and subscriptions."
          action={
            <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
              Add Recurring
            </Button>
          }
        />
      )}

      {/* Modals */}
      <RecurringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveRecurring}
        editingRecurring={editingRecurring}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        incomeItem={deletingRecurring ? { source: deletingRecurring.title, amount: deletingRecurring.amount, date: deletingRecurring.startDate } : null}
      />
    </div>
  );
};

export default Recurring;
