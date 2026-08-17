import React from 'react';

const SearchTabs = ({ activeTab, counts = {}, onTabChange }) => {
  const tabs = [
    { id: 'all', label: 'All', count: counts.all || 0 },
    { id: 'income', label: 'Income', count: counts.income || 0 },
    { id: 'expense', label: 'Expenses', count: counts.expense || 0 },
    { id: 'note', label: 'Notes', count: counts.note || 0 },
    { id: 'recurring', label: 'Recurring', count: counts.recurring || 0 },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SearchTabs;
