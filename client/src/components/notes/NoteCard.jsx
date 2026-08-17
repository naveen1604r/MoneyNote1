import React from 'react';
import {
  PiggyBank,
  Calculator,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Wallet,
  CreditCard,
  GraduationCap,
  Plane,
  Target,
  Bell,
  User,
  FileText,
  Pin,
  Edit2,
  Trash2,
  Calendar
} from 'lucide-react';
import { formatDateOnly } from '../../utils/dateUtils';

export const categoryIconMap = {
  Savings: { icon: PiggyBank, color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' },
  Budget: { icon: Calculator, color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' },
  Bills: { icon: Receipt, color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' },
  Shopping: { icon: ShoppingBag, color: 'bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400' },
  Investment: { icon: TrendingUp, color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' },
  Salary: { icon: Wallet, color: 'bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400' },
  Debt: { icon: CreditCard, color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' },
  Education: { icon: GraduationCap, color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' },
  Travel: { icon: Plane, color: 'bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400' },
  'Financial Goal': { icon: Target, color: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400' },
  Reminder: { icon: Bell, color: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-600 dark:text-yellow-400' },
  Personal: { icon: User, color: 'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400' },
  Other: { icon: FileText, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
};

const NoteCard = ({ note, onClick, onEdit, onPinToggle, onDelete }) => {
  const categoryMeta = categoryIconMap[note.category] || categoryIconMap.Other;
  const IconComp = categoryMeta.icon;

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white dark:bg-slate-800/90 border ${
        note.isPinned
          ? 'border-amber-300 dark:border-amber-600/80 shadow-md ring-1 ring-amber-400/30'
          : 'border-slate-200/80 dark:border-slate-700/70 shadow-soft'
      } cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between space-y-4 group`}
    >
      <div className="space-y-3">
        {/* Category Header & Pin Toggle */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${categoryMeta.color}`}>
            <IconComp className="w-3.5 h-3.5" />
            {note.category}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPinToggle(note);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isPinned
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Note Title */}
        <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-primary transition-colors">
          {note.title}
        </h3>

        {/* Note Content Preview */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
          {note.content}
        </p>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formatDateOnly(note.noteDate)}
          </span>

          {note.amount !== null && note.amount !== undefined && (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              ₹{note.amount.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            title="Edit Note"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
