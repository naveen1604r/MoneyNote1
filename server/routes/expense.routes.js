const express = require('express');
const router = express.Router();
const {
  createExpense,
  getExpenses,
  getExpenseSummary,
  getCategorySummary,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require('../controllers/expense.controller');
const authMiddleware = require('../middleware/authMiddleware');

// All expense routes require JWT authentication
router.use(authMiddleware);

// GET /api/expenses/summary (Must come before /:id)
router.get('/summary', getExpenseSummary);

// GET /api/expenses/categories (Must come before /:id)
router.get('/categories', getCategorySummary);

// GET /api/expenses
router.get('/', getExpenses);

// POST /api/expenses
router.post('/', createExpense);

// GET /api/expenses/:id
router.get('/:id', getExpenseById);

// PUT /api/expenses/:id
router.put('/:id', updateExpense);

// DELETE /api/expenses/:id
router.delete('/:id', deleteExpense);

module.exports = router;
