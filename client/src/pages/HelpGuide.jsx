import React, { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart,
  Target,
  FileText,
  Repeat,
  BarChart3,
  Search,
  Download,
  Database,
  UserCheck,
  HelpCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

const guideSections = [
  {
    id: 'dashboard',
    title: '1. Dashboard',
    icon: LayoutDashboard,
    whatIsIt: 'Your personal finance command center giving a complete real-time summary of your money.',
    howToUse: 'View your net balance, total monthly income, expenses, savings rate, and recent transactions at a glance.',
    example: 'Balance = Income - Expenses. Savings Rate = (Net Savings / Income) * 100%.',
  },
  {
    id: 'income',
    title: '2. Income Management',
    icon: TrendingUp,
    whatIsIt: 'Module to log and organize all money flowing into your accounts.',
    howToUse: 'Click "+ Add Income", enter the source name, amount, date, and description.',
    example: 'Monthly Salary (₹50,000), Freelance Project (₹15,000), Rental Income (₹10,000).',
  },
  {
    id: 'expenses',
    title: '3. Expense Tracker',
    icon: TrendingDown,
    whatIsIt: 'Module to record everyday spending and track category allocations.',
    howToUse: 'Click "+ Add Expense", select category, amount, date, and description.',
    example: 'Food & Dining (₹5,000), House Rent (₹15,000), Electricity Bill (₹2,500).',
  },
  {
    id: 'savings',
    title: '4. Savings',
    icon: PiggyBank,
    whatIsIt: 'Automated calculation of net money retained after deducting total expenses from income.',
    howToUse: 'Monitor your monthly net savings trend and health indicator bars on the Savings page.',
    example: 'Income = ₹50,000, Expenses = ₹30,000 → Net Savings = ₹20,000 (40% Savings Rate).',
  },
  {
    id: 'budget',
    title: '5. Budget Management',
    icon: PieChart,
    whatIsIt: 'System for setting monthly category spending limits to prevent overspending.',
    howToUse: 'Set maximum monthly limits per category. Visual warning bars alert you when reaching 80% or exceeding 100%.',
    example: 'Food Budget = ₹5,000. Spent = ₹4,200 (84% Usage - Warning State).',
  },
  {
    id: 'savings-goals',
    title: '6. Savings Goals',
    icon: Target,
    whatIsIt: 'Target tracking for financial milestones and future major purchases.',
    howToUse: 'Create a goal with a target amount and date. MoneyNote calculates live progress percentages.',
    example: 'Goal: Emergency Fund | Target: ₹60,000 | Current: ₹20,000 | Progress: 33.3%.',
  },
  {
    id: 'notes',
    title: '7. Finance Notes',
    icon: FileText,
    whatIsIt: 'Digital financial notepad to store billing reminders, tax thoughts, and money ideas.',
    howToUse: 'Add notes with optional amounts and pin urgent notes to top of your board.',
    example: 'Pin note: "Remember to submit tax investment proofs by March 25".',
  },
  {
    id: 'recurring',
    title: '8. Recurring Transactions',
    icon: Repeat,
    whatIsIt: 'Automated engine to repeat fixed bills and salary entries on fixed frequencies.',
    howToUse: 'Set frequency (Daily, Weekly, Monthly, Yearly). MoneyNote generates entries automatically.',
    example: 'Monthly Netflix Subscription (₹649) scheduled every 1st of the month.',
  },
  {
    id: 'reports',
    title: '9. Reports & Analytics',
    icon: BarChart3,
    whatIsIt: 'Visual analytics breakdown with Recharts pie charts, trend lines, and monthly comparisons.',
    howToUse: 'Filter by date range to analyze category distribution and compare income vs expense trends.',
    example: 'Pie chart shows Food & Dining accounts for 35% of total monthly expenses.',
  },
  {
    id: 'search',
    title: '10. Search & Advanced Filters',
    icon: Search,
    whatIsIt: 'Global search engine across all transactions, notes, and budgets.',
    howToUse: 'Type keywords or filter by date range, category, and minimum/maximum amounts.',
    example: 'Search "Rent" to instantly find all past rent payments across all months.',
  },
  {
    id: 'export',
    title: '11. Export System',
    icon: Download,
    whatIsIt: 'Download financial records into standard formats for offline storage and auditing.',
    howToUse: 'Export data to CSV spreadsheets or print full formatted PDF reports.',
    example: 'Download CSV of all July 2026 expenses for income tax submission.',
  },
  {
    id: 'backup',
    title: '12. Backup & Restore',
    icon: Database,
    whatIsIt: 'Complete JSON data snapshot system to safeguard all your financial records.',
    howToUse: 'Download a JSON backup anytime. Upload JSON backup to restore complete database state.',
    example: '⚠️ Always keep a fresh JSON backup before restoring or replacing existing records.',
  },
  {
    id: 'profile',
    title: '13. Profile & Settings',
    icon: UserCheck,
    whatIsIt: 'User account preferences, password security, currency formatting, and theme options.',
    howToUse: 'Change avatar photo, update password, select currency (₹, $, €, £), and switch Light/Dark/System theme.',
    example: 'Select Light mode for day usage and Dark mode for night viewing.',
  },
];

const HelpGuide = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = guideSections.filter((section) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      section.title.toLowerCase().includes(q) ||
      section.whatIsIt.toLowerCase().includes(q) ||
      section.howToUse.toLowerCase().includes(q) ||
      section.example.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="MoneyNote Guide"
        subtitle="Learn how to make the most of MoneyNote personal finance tracking."
      />

      {/* Search Input Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search guide topics (e.g. Savings, Budget, Export, Backup)..."
          className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-xs font-medium focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Guide Cards Grid */}
      <div className="space-y-4">
        {filteredSections.length > 0 ? (
          filteredSections.map((sec) => {
            const IconComp = sec.icon;
            return (
              <div
                key={sec.id}
                id={sec.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {sec.title}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* What is it */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[10px] text-primary">
                      What is it?
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {sec.whatIsIt}
                    </p>
                  </div>

                  {/* How to use */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[10px] text-emerald-600 dark:text-emerald-400">
                      How to use it?
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {sec.howToUse}
                    </p>
                  </div>

                  {/* Example */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-900 dark:text-white block uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400">
                      Example
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                      {sec.example}
                    </p>
                  </div>
                </div>

                {sec.id === 'backup' && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Always download a JSON backup before restoring or replacing existing data.</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            No guide topics matching "{searchQuery}". Try searching for Income, Expense, Budget, or Backup.
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpGuide;
