import React from 'react';
import Button from '../common/Button';
import {
  Wallet,
  CreditCard,
  Target,
  PiggyBank,
  FileText,
  Repeat,
  FileSpreadsheet,
  FileType
} from 'lucide-react';

const ExportCards = ({
  onExportIncome,
  onExportExpenses,
  onExportBudgets,
  onExportGoals,
  onExportNotes,
  onExportRecurring,
  onExportPDF,
  loadingCard,
}) => {
  const cards = [
    {
      id: 'income',
      title: 'Income Records',
      description: 'Export all earned revenue, salary, and freelance incomes to CSV.',
      icon: Wallet,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
      actionLabel: 'Export CSV',
      onExport: onExportIncome,
    },
    {
      id: 'expenses',
      title: 'Expense Tracker',
      description: 'Export all categorized personal expenses and spending history to CSV.',
      icon: CreditCard,
      iconBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      actionLabel: 'Export CSV',
      onExport: onExportExpenses,
    },
    {
      id: 'budgets',
      title: 'Budget Targets',
      description: 'Export category-wise monthly spending limits and budget targets to CSV.',
      icon: Target,
      iconBg: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
      actionLabel: 'Export CSV',
      onExport: onExportBudgets,
    },
    {
      id: 'goals',
      title: 'Savings Goals',
      description: 'Export financial savings targets, progress percentages, and due dates to CSV.',
      icon: PiggyBank,
      iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      actionLabel: 'Export CSV',
      onExport: onExportGoals,
    },
    {
      id: 'notes',
      title: 'Finance Notes',
      description: 'Export personal financial notes, bill reminders, and plans to CSV.',
      icon: FileText,
      iconBg: 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400',
      actionLabel: 'Export CSV',
      onExport: onExportNotes,
    },
    {
      id: 'recurring',
      title: 'Recurring Templates',
      description: 'Export automated recurring payment rules and schedules to CSV.',
      icon: Repeat,
      iconBg: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
      actionLabel: 'Export CSV',
      onExport: onExportRecurring,
    },
    {
      id: 'pdf',
      title: 'PDF Executive Statement',
      description: 'Download a clean, formatted PDF financial report for printing or filing.',
      icon: FileType,
      iconBg: 'bg-primary/10 text-primary',
      actionLabel: 'Download PDF',
      onExport: onExportPDF,
      isPrimary: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {cards.map((card) => {
        const IconComp = card.icon;
        const isLoading = loadingCard === card.id;

        return (
          <div
            key={card.id}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-600 transition-all ${
              card.isPrimary ? 'sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800' : ''
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl ${card.iconBg} shrink-0`}>
                <IconComp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {card.description}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                variant={card.isPrimary ? 'primary' : 'outline'}
                size="sm"
                icon={card.isPrimary ? FileType : FileSpreadsheet}
                onClick={card.onExport}
                loading={isLoading}
              >
                {isLoading ? 'Exporting...' : card.actionLabel}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExportCards;
