const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');

const {
  exportIncomeCSV,
  exportExpensesCSV,
  exportBudgetsCSV,
  exportGoalsCSV,
  exportNotesCSV,
  exportRecurringCSV,
  generatePDFReport,
  exportFullJSONBackup,
  previewBackupJSON,
  restoreBackupJSON,
  getExportHistory,
} = require('../controllers/export.controller');

// Configure Multer for JSON file upload in memory (10MB Max)
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(authMiddleware);

// CSV Exports
router.get('/export/income/csv', exportIncomeCSV);
router.get('/export/expenses/csv', exportExpensesCSV);
router.get('/export/budgets/csv', exportBudgetsCSV);
router.get('/export/savings-goals/csv', exportGoalsCSV);
router.get('/export/notes/csv', exportNotesCSV);
router.get('/export/recurring/csv', exportRecurringCSV);

// PDF Report
router.get('/export/report/pdf', generatePDFReport);

// Backup & Restore
router.get('/backup/export', exportFullJSONBackup);
router.post('/backup/preview', upload.single('backup'), previewBackupJSON);
router.post('/backup/restore', upload.single('backup'), restoreBackupJSON);

// Export History
router.get('/export/history', getExportHistory);

module.exports = router;
