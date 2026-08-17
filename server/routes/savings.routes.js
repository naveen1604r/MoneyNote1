const express = require('express');
const router = express.Router();
const {
  getSavingsSummary,
  getMonthlySavings,
  getMonthlySavingsHistory,
  createSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
  deleteSavingsGoal,
} = require('../controllers/savings.controller');
const authMiddleware = require('../middleware/authMiddleware');

// All savings routes require JWT authentication
router.use(authMiddleware);

// Dynamic Savings & Monthly History APIs
router.get('/summary', getSavingsSummary);
router.get('/monthly', getMonthlySavings);
router.get('/monthly-history', getMonthlySavingsHistory);

// Savings Goals APIs
router.get('/goals', getSavingsGoals);
router.post('/goals', createSavingsGoal);
router.put('/goals/:id', updateSavingsGoal);
router.delete('/goals/:id', deleteSavingsGoal);

module.exports = router;
