const express = require('express');
const router = express.Router();
const {
  getReportSummary,
  getMonthlyReports,
  getExpenseCategories,
  getIncomeSources,
  getReportAnalytics,
} = require('../controllers/report.controller');
const authMiddleware = require('../middleware/authMiddleware');

// All report routes require JWT authentication
router.use(authMiddleware);

router.get('/summary', getReportSummary);
router.get('/monthly', getMonthlyReports);
router.get('/expense-categories', getExpenseCategories);
router.get('/income-sources', getIncomeSources);
router.get('/analytics', getReportAnalytics);

module.exports = router;
