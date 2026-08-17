import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Upload, AlertTriangle, CheckCircle2, FileText, Database, ShieldAlert } from 'lucide-react';
import { previewBackup, restoreBackup } from '../../services/api';

const RestoreModal = ({ isOpen, onClose, onRestoreSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [mode, setMode] = useState('merge');
  const [confirmReplace, setConfirmReplace] = useState(false);

  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResults, setRestoreResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Please upload a valid .json MoneyNote backup file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Backup file exceeds the 10 MB maximum size limit.');
      return;
    }

    setError('');
    setSelectedFile(file);
    setIsLoadingPreview(true);

    const formData = new FormData();
    formData.append('backup', file);

    try {
      const res = await previewBackup(formData);
      if (res.data.success) {
        setPreviewData(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to parse backup JSON file.';
      setError(msg);
      setSelectedFile(null);
      setPreviewData(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExecuteRestore = async () => {
    if (!selectedFile || !previewData) return;

    if (mode === 'replace' && !confirmReplace) {
      setError('You must confirm replacement of your existing financial records before proceeding.');
      return;
    }

    setError('');
    setIsRestoring(true);

    const formData = new FormData();
    formData.append('backup', selectedFile);
    formData.append('mode', mode);

    try {
      const res = await restoreBackup(formData);
      if (res.data.success) {
        setRestoreResults(res.data);
        if (onRestoreSuccess) onRestoreSuccess();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to restore backup due to a database transaction error.';
      setError(msg);
    } finally {
      setIsRestoring(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setMode('merge');
    setConfirmReplace(false);
    setRestoreResults(null);
    setError('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Restore Financial Backup"
      maxWidth="max-w-lg"
    >
      {restoreResults ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Backup Restored Successfully! 🎉
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 font-medium">
                Restore mode: <strong>{restoreResults.mode?.toUpperCase()}</strong>. All database transactions committed cleanly.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Import Summary:
            </h5>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(restoreResults.summary || {}).map(([key, val]) => (
                <div key={key} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">{key}:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">
                    +{val.imported} <span className="text-[11px] font-medium text-slate-400">({val.skipped} skipped)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs font-semibold text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Upload Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select MoneyNote Backup (.json)
            </label>
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-900/40 transition-colors text-center">
              <Upload className="w-8 h-8 text-primary mb-2" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {selectedFile ? selectedFile.name : 'Click to select or drag .json backup file'}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Maximum file size: 10 MB • Official MoneyNote JSON schema
              </span>
              <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {/* Backup Preview Summary */}
          {isLoadingPreview && (
            <div className="p-4 text-center text-xs font-semibold text-slate-500">
              Parsing and validating backup JSON file...
            </div>
          )}

          {previewData && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/70 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold border-b border-slate-200 dark:border-slate-700/60 pb-2">
                <span className="text-slate-900 dark:text-white">Backup Preview (v{previewData.backupVersion})</span>
                <span className="text-slate-400">Exported: {new Date(previewData.exportedAt).toLocaleDateString()}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Income</span>
                  <span className="font-extrabold text-emerald-600">{previewData.counts.income}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Expenses</span>
                  <span className="font-extrabold text-rose-600">{previewData.counts.expenses}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Budgets</span>
                  <span className="font-extrabold text-indigo-600">{previewData.counts.budgets}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Goals</span>
                  <span className="font-extrabold text-amber-600">{previewData.counts.savingsGoals}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Notes</span>
                  <span className="font-extrabold text-violet-600">{previewData.counts.notes}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Recurring</span>
                  <span className="font-extrabold text-cyan-600">{previewData.counts.recurringTransactions}</span>
                </div>
              </div>

              {/* Restore Mode Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Restore Mode:
                </label>

                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="restoreMode"
                      value="merge"
                      checked={mode === 'merge'}
                      onChange={() => setMode('merge')}
                      className="mt-0.5 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Merge Mode (Recommended)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        Merges backup data into your existing account without deleting current records. Duplicates are automatically skipped.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 cursor-pointer">
                    <input
                      type="radio"
                      name="restoreMode"
                      value="replace"
                      checked={mode === 'replace'}
                      onChange={() => setMode('replace')}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-200 block">
                        Replace Mode (Destructive)
                      </span>
                      <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                        Replaces current user's financial records with backup data. (Your user account & password credentials are NOT touched).
                      </span>
                    </div>
                  </label>
                </div>

                {/* Explicit confirmation checkbox if REPLACE mode */}
                {mode === 'replace' && (
                  <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Destructive Operation Warning</span>
                    </div>
                    <label className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmReplace}
                        onChange={(e) => setConfirmReplace(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span>Yes, replace my current financial data</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>

            <Button
              variant={mode === 'replace' ? 'danger' : 'primary'}
              disabled={!selectedFile || !previewData || (mode === 'replace' && !confirmReplace)}
              loading={isRestoring}
              onClick={handleExecuteRestore}
            >
              {isRestoring ? 'Restoring Database...' : `Restore Data (${mode.toUpperCase()})`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RestoreModal;
