const { getPool } = require('../config/db');
const { formatDateString } = require('../utils/dateHelper');

const ALLOWED_CATEGORIES = [
  'Food',
  'Rent',
  'Transport',
  'Shopping',
  'Bills',
  'Electricity',
  'Internet',
  'Mobile Recharge',
  'Education',
  'Healthcare',
  'Entertainment',
  'Travel',
  'Subscriptions',
  'Personal',
  'Other',
];

/**
 * POST /api/expenses
 * Add a new expense entry
 */
const createExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount, date, description } = req.body;

    // 1. Validations
    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid expense category',
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense amount must be greater than ₹0',
      });
    }

    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date',
      });
    }

    const pool = getPool();
    const formattedDate = formatDateString(date);
    const cleanedDescription = description ? description.trim() : null;

    // 2. Insert record
    const [result] = await pool.query(
      'INSERT INTO expenses (user_id, category, amount, date, description) VALUES (?, ?, ?, ?, ?)',
      [userId, category, numericAmount, formattedDate, cleanedDescription]
    );

    const newExpenseId = result.insertId;

    return res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense: {
        id: newExpenseId,
        category,
        amount: numericAmount,
        date: formattedDate,
        description: cleanedDescription,
      },
    });
  } catch (error) {
    console.error('[CreateExpense Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create expense entry. Please try again.',
    });
  }
};

/**
 * GET /api/expenses
 * Fetch all expense entries for logged in user with search, filter, sort
 */
const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, category, month, sort } = req.query;

    let query = 'SELECT id, category, amount, date, description, created_at FROM expenses WHERE user_id = ?';
    const params = [userId];

    // Search filter (category or description)
    if (search && search.trim() !== '') {
      query += ' AND (category LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    // Category filter
    if (category && category !== 'All' && category !== 'All Categories') {
      query += ' AND category = ?';
      params.push(category);
    }

    // Month filter (format: YYYY-MM)
    if (month && month !== 'all' && month !== 'All Time') {
      query += " AND DATE_FORMAT(date, '%Y-%m') = ?";
      params.push(month);
    }

    // Sorting
    switch (sort) {
      case 'oldest':
        query += ' ORDER BY date ASC, id ASC';
        break;
      case 'highest':
        query += ' ORDER BY amount DESC, date DESC';
        break;
      case 'lowest':
        query += ' ORDER BY amount ASC, date DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY date DESC, id DESC';
        break;
    }

    const pool = getPool();
    const [rows] = await pool.query(query, params);

    const formattedExpenses = rows.map((item) => ({
      ...item,
      amount: parseFloat(item.amount),
      date: formatDateString(item.date),
    }));

    return res.status(200).json({
      success: true,
      expenses: formattedExpenses,
    });
  } catch (error) {
    console.error('[GetExpenses Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch expense records.',
    });
  }
};

/**
 * GET /api/expenses/summary
 * Total Expenses, Current Month Expenses, Expense Count, Highest Expense
 */
const getExpenseSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestedMonth = req.query.month || formatDateString(new Date()).slice(0, 7);

    const pool = getPool();

    // 1. Total Expenses
    const [totalRows] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses WHERE user_id = ?',
      [userId]
    );

    // 2. Current Month Expenses
    const [monthRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS currentMonthExpenses FROM expenses WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
      [userId, requestedMonth]
    );

    // 3. Total Expense Count
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS expenseCount FROM expenses WHERE user_id = ?',
      [userId]
    );

    // 4. Highest Expense
    const [highestRows] = await pool.query(
      'SELECT COALESCE(MAX(amount), 0) AS highestExpense FROM expenses WHERE user_id = ?',
      [userId]
    );

    return res.status(200).json({
      success: true,
      summary: {
        totalExpenses: parseFloat(totalRows[0].totalExpenses),
        currentMonthExpenses: parseFloat(monthRows[0].currentMonthExpenses),
        expenseCount: parseInt(countRows[0].expenseCount, 10),
        highestExpense: parseFloat(highestRows[0].highestExpense),
      },
    });
  } catch (error) {
    console.error('[GetExpenseSummary Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate expense summary.',
    });
  }
};

/**
 * GET /api/expenses/categories
 * Category-wise totals breakdown for authenticated user
 */
const getCategorySummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestedMonth = req.query.month;

    let query = 'SELECT category, COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = ?';
    const params = [userId];

    if (requestedMonth && requestedMonth !== 'all') {
      query += " AND DATE_FORMAT(date, '%Y-%m') = ?";
      params.push(requestedMonth);
    }

    query += ' GROUP BY category ORDER BY total DESC';

    const pool = getPool();
    const [rows] = await pool.query(query, params);

    const formattedCategories = rows.map((item) => ({
      category: item.category,
      total: parseFloat(item.total),
    }));

    return res.status(200).json({
      success: true,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error('[GetCategorySummary Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch category distribution.',
    });
  }
};

/**
 * GET /api/expenses/:id
 */
const getExpenseById = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, category, amount, date, description, created_at FROM expenses WHERE id = ? AND user_id = ?',
      [expenseId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found or access denied',
      });
    }

    const item = rows[0];
    return res.status(200).json({
      success: true,
      expense: {
        ...item,
        amount: parseFloat(item.amount),
        date: formatDateString(item.date),
      },
    });
  } catch (error) {
    console.error('[GetExpenseById Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch expense details.',
    });
  }
};

/**
 * PUT /api/expenses/:id
 */
const updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;
    const { category, amount, date, description } = req.body;

    const pool = getPool();

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
      [expenseId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found or access denied',
      });
    }

    // Validations
    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid expense category',
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense amount must be greater than ₹0',
      });
    }

    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date',
      });
    }

    const formattedDate = formatDateString(date);
    const cleanedDescription = description ? description.trim() : null;

    await pool.query(
      'UPDATE expenses SET category = ?, amount = ?, date = ?, description = ? WHERE id = ? AND user_id = ?',
      [category, numericAmount, formattedDate, cleanedDescription, expenseId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
    });
  } catch (error) {
    console.error('[UpdateExpense Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update expense. Please try again.',
    });
  }
};

/**
 * DELETE /api/expenses/:id
 */
const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;

    const pool = getPool();

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
      [expenseId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found or access denied',
      });
    }

    await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [expenseId, userId]);

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('[DeleteExpense Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete expense record.',
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseSummary,
  getCategorySummary,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
