import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Toast from '../common/Toast';
import { Target, Calendar, FileText } from 'lucide-react';
import { formatDateToYYYYMMDD, getTodayDateString } from '../../utils/dateUtils';

const SavingsGoalModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingGoal = null,
  isSubmitting = false,
}) => {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState(() => getTodayDateString());
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (editingGoal) {
      setGoalName(editingGoal.goalName || '');
      setTargetAmount(editingGoal.targetAmount ? editingGoal.targetAmount.toString() : '');
      setTargetDate(editingGoal.targetDate ? formatDateToYYYYMMDD(editingGoal.targetDate) : getTodayDateString());
      setDescription(editingGoal.description || '');
    } else {
      setGoalName('');
      setTargetAmount('');
      setTargetDate(getTodayDateString());
      setDescription('');
    }
    setErrorMessage('');
  }, [editingGoal, isOpen]);

  const validate = () => {
    if (!goalName || goalName.trim() === '') {
      setErrorMessage('Please enter a goal name.');
      return false;
    }
    const numTarget = parseFloat(targetAmount);
    if (!targetAmount || isNaN(numTarget) || numTarget <= 0) {
      setErrorMessage('Target amount must be greater than ₹0.');
      return false;
    }
    if (!targetDate) {
      setErrorMessage('Please select a valid target date.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    onSubmit({
      goalName: goalName.trim(),
      targetAmount: parseFloat(targetAmount),
      targetDate,
      description: description.trim(),
    });
  };

  const modalTitle = editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal';
  const submitButtonText = editingGoal ? 'Save Changes' : 'Create Goal';
  const submittingText = editingGoal ? 'Saving...' : 'Creating...';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {errorMessage && (
          <Toast
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Goal Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Goal Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Target className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Emergency Fund, New Laptop"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50 font-medium"
              />
            </div>
          </div>

          {/* Target Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Target Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-base">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="100000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Target Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Target Completion Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Description / Goal Purpose <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <textarea
                rows="3"
                placeholder="e.g. Save 6 months of living expenses"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? submittingText : submitButtonText}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SavingsGoalModal;
