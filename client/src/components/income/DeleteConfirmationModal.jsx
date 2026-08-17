import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  incomeItem = null,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Income Record?"
      maxWidth="max-w-md"
    >
      <div className="space-y-4 text-center sm:text-left">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="text-sm font-semibold">
            This action cannot be undone.
          </p>
        </div>

        {incomeItem && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete the income entry for{' '}
            <strong className="text-slate-900 dark:text-white font-bold">
              {incomeItem.source} (₹{incomeItem.amount?.toLocaleString('en-IN')})
            </strong>{' '}
            received on {incomeItem.date}?
          </p>
        )}

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700/60">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? 'Deleting...' : 'Delete Income'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
