import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import SummaryCard from '../components/common/SummaryCard';
import EmptyState from '../components/common/EmptyState';
import Toast from '../components/common/Toast';
import { SkeletonLoader } from '../components/common/SkeletonLoader';

import NoteCard from '../components/notes/NoteCard';
import NoteModal from '../components/notes/NoteModal';
import NoteViewModal from '../components/notes/NoteViewModal';
import NoteFilters from '../components/notes/NoteFilters';
import DeleteConfirmationModal from '../components/income/DeleteConfirmationModal';

import {
  getNotes,
  getNotesSummary,
  createNote,
  updateNote,
  deleteNote,
  toggleNotePin,
} from '../services/api';

import {
  FileText,
  Pin,
  Calendar,
  DollarSign,
  Plus,
  SearchX
} from 'lucide-react';

const Notes = () => {
  // Data States
  const [notes, setNotes] = useState([]);
  const [summary, setSummary] = useState({
    totalNotes: 0,
    pinnedNotes: 0,
    thisMonth: 0,
    notesWithAmount: 0,
  });

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  // Loading & Action States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingNote, setDeletingNote] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast({ type: '', message: '' });
    }, 4000);
  };

  // Fetch Notes List & Summary
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        search: search.trim(),
        category: category === 'All Categories' ? '' : category,
        pinned: pinnedOnly ? 'true' : 'false',
        date: dateFilter,
        sort,
      };

      const [notesRes, summaryRes] = await Promise.all([
        getNotes(params),
        getNotesSummary(),
      ]);

      if (notesRes.data.success) {
        setNotes(notesRes.data.notes || []);
      }
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.summary || {
          totalNotes: 0,
          pinnedNotes: 0,
          thisMonth: 0,
          notesWithAmount: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
      showToast('error', 'Unable to load notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, pinnedOnly, dateFilter, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setPinnedOnly(false);
    setDateFilter('all');
    setSort('newest');
  };

  // Open Modal for Create Note
  const handleOpenAddModal = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit Note
  const handleOpenEditModal = (note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (note) => {
    setViewingNote(note);
    setIsViewModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (note) => {
    setDeletingNote(note);
    setIsDeleteModalOpen(true);
  };

  // Toggle Pin Action
  const handleTogglePin = async (note) => {
    try {
      const res = await toggleNotePin(note.id);
      if (res.data.success) {
        showToast('success', res.data.message);
        fetchData();
      }
    } catch (error) {
      showToast('error', 'Failed to update pin status.');
    }
  };

  // Save Note Handler (Create or Update)
  const handleSaveNote = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingNote) {
        const res = await updateNote(editingNote.id, formData);
        if (res.data.success) {
          showToast('success', 'Note updated successfully.');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await createNote(formData);
        if (res.data.success) {
          showToast('success', 'Note created successfully.');
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save note.';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingNote) return;
    setIsDeleting(true);
    try {
      const res = await deleteNote(deletingNote.id);
      if (res.data.success) {
        showToast('success', 'Note deleted successfully.');
        setIsDeleteModalOpen(false);
        setDeletingNote(null);
        fetchData();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete note.';
      showToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const isFiltered =
    search.trim() !== '' ||
    category !== 'All Categories' ||
    pinnedOnly !== false ||
    dateFilter !== 'all' ||
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
        title="Finance Notes"
        subtitle="Keep your financial thoughts, budget plans, and reminders organized."
      >
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenAddModal}
        >
          Add Note
        </Button>
      </PageHeader>

      {/* Top 4 Summary Cards */}
      {isLoading ? (
        <SkeletonLoader type="summary" count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            title="Total Notes"
            amount={summary.totalNotes.toString()}
            subtitle="Financial thoughts & reminders"
            icon={FileText}
            iconBgColor="bg-indigo-100 dark:bg-indigo-950/50"
            iconColor="text-indigo-600 dark:text-indigo-400"
          />
          <SummaryCard
            title="Pinned Notes"
            amount={summary.pinnedNotes.toString()}
            subtitle="Pinned for quick reference"
            icon={Pin}
            iconBgColor="bg-amber-100 dark:bg-amber-950/50"
            iconColor="text-amber-600 dark:text-amber-400"
          />
          <SummaryCard
            title="This Month"
            amount={summary.thisMonth.toString()}
            subtitle="Logged in current month"
            icon={Calendar}
            iconBgColor="bg-emerald-100 dark:bg-emerald-950/50"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <SummaryCard
            title="With Amount"
            amount={summary.notesWithAmount.toString()}
            subtitle="Notes with financial values"
            icon={DollarSign}
            iconBgColor="bg-violet-100 dark:bg-violet-950/50"
            iconColor="text-violet-600 dark:text-violet-400"
          />
        </div>
      )}

      {/* Filters Bar */}
      <NoteFilters
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        pinnedOnly={pinnedOnly}
        setPinnedOnly={setPinnedOnly}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        sort={sort}
        setSort={setSort}
        onResetFilters={handleResetFilters}
      />

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonLoader type="card" count={6} />
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => handleOpenViewModal(note)}
              onEdit={handleOpenEditModal}
              onPinToggle={handleTogglePin}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </div>
      ) : isFiltered ? (
        <EmptyState
          icon={SearchX}
          title="No matching notes found"
          description="We couldn't find any finance notes matching your current filter criteria."
          action={
            <Button variant="outline" onClick={handleResetFilters}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={FileText}
          title="No finance notes yet"
          description="Create your first financial note to keep your savings plans, budgets, and reminders organized."
          action={
            <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
              Add Note
            </Button>
          }
        />
      )}

      {/* Modal Dialogs */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveNote}
        editingNote={editingNote}
        isSubmitting={isSubmitting}
      />

      <NoteViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        note={viewingNote}
        onEdit={handleOpenEditModal}
        onPinToggle={handleTogglePin}
        onDelete={handleOpenDeleteModal}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        incomeItem={deletingNote ? { source: deletingNote.title, amount: deletingNote.amount || 0, date: deletingNote.noteDate } : null}
      />
    </div>
  );
};

export default Notes;
