const express = require('express');
const router = express.Router();
const {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  getBudgetAnalytics,
} = require('../controllers/budget.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getBudgets);
router.post('/', createBudget);
router.get('/summary', getBudgetSummary);
router.get('/analytics', getBudgetAnalytics);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
