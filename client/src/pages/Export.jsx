import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';

import ExportCards from '../components/export/ExportCards';
import ExportFilterPanel from '../components/export/ExportFilterPanel';
import RestoreModal from '../components/export/RestoreModal';

import {
  downloadIncomeCSV,
  downloadExpensesCSV,
  downloadBudgetsCSV,
  downloadGoalsCSV,
  downloadNotesCSV,
  downloadRecurringCSV,
  downloadPDFReport,
  downloadJSONBackup,
  getExportHistory,
} from '../services/api';

import { Database, Upload, FileSpreadsheet, History, Download, ShieldCheck } from 'lucide-react';

const Export = () => {
  const [loadingCard, setLoadingCard] = useState(null);
  const [isExportingFilter, setIsExportingFilter] = useState(false);
  const [isBackupDownloading, setIsBackupDownloading] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: '', message: '' }), 4000);
  };

  // Helper: Trigger browser download for Blob response
  const triggerBlobDownload = (blobData, defaultFilename) => {
    const url = window.URL.createObjectURL(new Blob([blobData]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  // Fetch Recent Export History
  const loadHistory = useCallback(async () => {
    try {
      const res = await getExportHistory();
      if (res.data.success) {
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load export history:', err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Handler for Quick Card Exports
  const handleExportQuick = async (cardId, downloadFn, filename) => {
    setLoadingCard(cardId);
    try {
      const res = await downloadFn();
      triggerBlobDownload(res.data, filename);
      showToast('success', `${cardId.toUpperCase()} export completed.`);
      loadHistory();
    } catch (err) {
      console.error(`Export ${cardId} failed:`, err);
      showToast('error', `Failed to export ${cardId}.`);
    } finally {
      setLoadingCard(null);
    }
  };

  // Handler for Custom Filter Panel Export
  const handleFilterExport = async ({ dataType, format, startDate, endDate, category }) => {
    setIsExportingFilter(true);
    try {
      const params = { startDate, endDate, category };
      let res;
      let filename = `moneynote-${dataType}-${Date.now()}.${format}`;

      if (format === 'json' || dataType === 'json') {
        res = await downloadJSONBackup();
        filename = `moneynote-backup-${Date.now()}.json`;
      } else if (format === 'pdf' || dataType === 'report') {
        res = await downloadPDFReport(params);
        filename = `moneynote-financial-report-${Date.now()}.pdf`;
      } else {
        if (dataType === 'income') res = await downloadIncomeCSV(params);
        else if (dataType === 'expenses') res = await downloadExpensesCSV(params);
        else if (dataType === 'budgets') res = await downloadBudgetsCSV();
        else if (dataType === 'goals') res = await downloadGoalsCSV();
        else if (dataType === 'notes') res = await downloadNotesCSV();
        else if (dataType === 'recurring') res = await downloadRecurringCSV();
        else res = await downloadExpensesCSV(params);
      }

      triggerBlobDownload(res.data, filename);
      showToast('success', 'Export file generated successfully.');
      loadHistory();
    } catch (err) {
      console.error('Filter export failed:', err);
      showToast('error', 'Failed to generate custom export file.');
    } finally {
      setIsExportingFilter(false);
    }
  };

  // Handler for Complete JSON Backup
  const handleDownloadFullBackup = async () => {
    setIsBackupDownloading(true);
    try {
      const res = await downloadJSONBackup();
      triggerBlobDownload(res.data, `moneynote-full-backup-${Date.now()}.json`);
      showToast('success', 'Full JSON backup created successfully.');
      loadHistory();
    } catch (err) {
      console.error('JSON backup download failed:', err);
      showToast('error', 'Failed to download JSON backup.');
    } finally {
      setIsBackupDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Banner */}
      {toast.message && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ type: '', message: '' })}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Export & Backup"
        subtitle="Download, manage, and protect your financial records."
      />

      {/* Quick Export Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          Quick Export Modules
        </h2>
        <ExportCards
          onExportIncome={() => handleExportQuick('income', downloadIncomeCSV, `moneynote-income-${Date.now()}.csv`)}
          onExportExpenses={() => handleExportQuick('expenses', downloadExpensesCSV, `moneynote-expenses-${Date.now()}.csv`)}
          onExportBudgets={() => handleExportQuick('budgets', downloadBudgetsCSV, `moneynote-budgets-${Date.now()}.csv`)}
          onExportGoals={() => handleExportQuick('goals', downloadGoalsCSV, `moneynote-goals-${Date.now()}.csv`)}
          onExportNotes={() => handleExportQuick('notes', downloadNotesCSV, `moneynote-notes-${Date.now()}.csv`)}
          onExportRecurring={() => handleExportQuick('recurring', downloadRecurringCSV, `moneynote-recurring-${Date.now()}.csv`)}
          onExportPDF={() => handleExportQuick('pdf', downloadPDFReport, `moneynote-financial-report-${Date.now()}.pdf`)}
          loadingCard={loadingCard}
        />
      </div>

      {/* Custom Export Filter Panel */}
      <ExportFilterPanel
        onTriggerFilterExport={handleFilterExport}
        isExporting={isExportingFilter}
      />

      {/* Backup & Restore Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-primary shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Complete Account Backup & Restore
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Create a portable JSON backup of all financial modules or restore from a previous backup file.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-500" /> Create Full Backup
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                Generates a single encrypted .json archive containing incomes, expenses, budgets, savings goals, finance notes, and recurring templates.
              </p>
            </div>
            <Button
              variant="primary"
              icon={Download}
              onClick={handleDownloadFullBackup}
              loading={isBackupDownloading}
            >
              {isBackupDownloading ? 'Generating Backup...' : 'Create & Download JSON Backup'}
            </Button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" /> Restore from Backup
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                Upload a MoneyNote .json backup file to restore records. Supports both non-destructive Merge mode and full Replace mode.
              </p>
            </div>
            <Button
              variant="outline"
              icon={Upload}
              onClick={() => setIsRestoreModalOpen(true)}
            >
              Restore Backup File
            </Button>
          </div>
        </div>
      </div>

      {/* Export History List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Export Activity
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">Latest 10 Events</span>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-700/60 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Export Module</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {h.export_type}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase ${
                        h.format === 'PDF'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                          : h.format === 'JSON'
                          ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                      }`}>
                        {h.format}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400 font-medium">
                      {new Date(h.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            No export history logged yet.
          </div>
        )}
      </div>

      {/* Restore Backup Modal */}
      <RestoreModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onRestoreSuccess={() => {
          loadHistory();
          showToast('success', 'Database restored successfully.');
        }}
      />
    </div>
  );
};

export default Export;
