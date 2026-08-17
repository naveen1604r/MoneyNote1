import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const DeleteBudgetConfirmation = ({ isOpen, onClose, onConfirm, budgetItem, isDeleting }) => {
  const { formatCurrency } = useSettings();

  if (!budgetItem) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Budget?"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-900 dark:text-amber-200">
              Note: Expense records will remain untouched.
            </h4>
            <p className="text-amber-700 dark:text-amber-300 leading-relaxed font-medium">
              Deleting this budget limit will only remove the spending target. Your actual recorded expense transactions will NOT be deleted.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Category:</span>
            <span className="text-slate-900 dark:text-white font-bold">{budgetItem.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Target Amount:</span>
            <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(budgetItem.amount)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
            Delete Budget
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteBudgetConfirmation;
