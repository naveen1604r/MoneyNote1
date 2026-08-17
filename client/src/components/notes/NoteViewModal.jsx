import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Pin, Calendar, Edit2, Trash2, Tag, Clock } from 'lucide-react';
import { categoryIconMap } from './NoteCard';
import { formatDateOnly } from '../../utils/dateUtils';

const NoteViewModal = ({
  isOpen,
  onClose,
  note = null,
  onEdit,
  onPinToggle,
  onDelete,
}) => {
  if (!note) return null;

  const categoryMeta = categoryIconMap[note.category] || categoryIconMap.Other;
  const IconComp = categoryMeta.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Finance Note Details"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Header Badges & Pin Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${categoryMeta.color}`}>
              <IconComp className="w-3.5 h-3.5" />
              {note.category}
            </span>

            {note.amount !== null && note.amount !== undefined && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                ₹{note.amount.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={() => onPinToggle(note)}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              note.isPinned
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-500'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
            {note.isPinned ? 'Pinned Note' : 'Pin Note'}
          </button>
        </div>

        {/* Note Title */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {note.title}
          </h2>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date: {formatDateOnly(note.noteDate)}
            </span>
            {note.updatedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Updated: {formatDateOnly(note.updatedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Full Content Body */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
          {note.content}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-700/60">
          <Button
            type="button"
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => {
              onClose();
              onDelete(note);
            }}
          >
            Delete Note
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Edit2}
              onClick={() => {
                onClose();
                onEdit(note);
              }}
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NoteViewModal;
