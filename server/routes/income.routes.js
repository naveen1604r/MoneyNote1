const express = require('express');
const router = express.Router();
const {
  createIncome,
  getIncomes,
  getIncomeSummary,
  getIncomeById,
  updateIncome,
  deleteIncome,
} = require('../controllers/income.controller');
const authMiddleware = require('../middleware/authMiddleware');

// All income routes require JWT authentication
router.use(authMiddleware);

// GET /api/incomes/summary (Must come before /:id)
router.get('/summary', getIncomeSummary);

// GET /api/incomes
router.get('/', getIncomes);

// POST /api/incomes
router.post('/', createIncome);

// GET /api/incomes/:id
router.get('/:id', getIncomeById);

// PUT /api/incomes/:id
router.put('/:id', updateIncome);

// DELETE /api/incomes/:id
router.delete('/:id', deleteIncome);

module.exports = router;
