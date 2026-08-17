import React from 'react';
import { X } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const FilterChips = ({ filters, onRemoveFilter, onClearAll }) => {
  const { formatCurrency } = useSettings();

  const chips = [];

  if (filters.category) {
    chips.push({ key: 'category', label: `Category: ${filters.category}` });
  }
  if (filters.startDate || filters.endDate) {
    const startStr = filters.startDate || 'Beginning';
    const endStr = filters.endDate || 'Present';
    chips.push({ key: 'date', label: `Date: ${startStr} - ${endStr}` });
  }
  if (filters.minAmount || filters.maxAmount) {
    const minStr = filters.minAmount ? formatCurrency(filters.minAmount) : '₹0';
    const maxStr = filters.maxAmount ? formatCurrency(filters.maxAmount) : '∞';
    chips.push({ key: 'amount', label: `Amount: ${minStr} - ${maxStr}` });
  }
  if (filters.sort && filters.sort !== 'newest') {
    const sortLabels = {
      oldest: 'Oldest First',
      amount_desc: 'Amount High to Low',
      amount_asc: 'Amount Low to High',
      az: 'Title A-Z',
      za: 'Title Z-A',
    };
    chips.push({ key: 'sort', label: `Sort: ${sortLabels[filters.sort] || filters.sort}` });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        Active Filters ({chips.length}):
      </span>

      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200/80 dark:border-slate-700"
        >
          {chip.label}
          <button
            onClick={() => onRemoveFilter(chip.key)}
            className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1"
      >
        Clear All
      </button>
    </div>
  );
};

export default FilterChips;
