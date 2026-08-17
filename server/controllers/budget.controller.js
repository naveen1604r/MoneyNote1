const { getPool } = require('../config/db');

const ALLOWED_CATEGORIES = [
  'Overall',
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
 * POST /api/budgets
 * Create a new monthly budget
 */
const createBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, amount, month, year } = req.body;

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid budget category.',
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be a positive number greater than 0.',
      });
    }

    const currentYear = new Date().getFullYear();
    const targetMonth = parseInt(month, 10) || new Date().getMonth() + 1;
    const targetYear = parseInt(year, 10) || currentYear;

    if (targetMonth < 1 || targetMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month specified. Must be between 1 and 12.',
      });
    }

    const pool = getPool();

    // Check duplicate constraint
    const [existing] = await pool.query(
      'SELECT id FROM budgets WHERE user_id = ? AND category = ? AND month = ? AND year = ?',
      [userId, category, targetMonth, targetYear]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `A ${category} budget already exists for ${targetMonth}/${targetYear}.`,
        existingId: existing[0].id,
      });
    }

    const [result] = await pool.query(
      'INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?)',
      [userId, category, numericAmount, targetMonth, targetYear]
    );

    return res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget: {
        id: result.insertId,
        category,
        amount: numericAmount,
        month: targetMonth,
        year: targetYear,
      },
    });
  } catch (error) {
    console.error('[CreateBudget Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create budget.',
    });
  }
};

/**
 * GET /api/budgets
 * Get budgets for specified month and year
 */
const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const targetMonth = parseInt(req.query.month, 10) || today.getMonth() + 1;
    const targetYear = parseInt(req.query.year, 10) || today.getFullYear();

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, category, amount, month, year FROM budgets WHERE user_id = ? AND month = ? AND year = ? ORDER BY (category = "Overall") DESC, category ASC',
      [userId, targetMonth, targetYear]
    );

    const formatted = rows.map((b) => ({
      id: b.id,
      category: b.category,
      amount: parseFloat(b.amount),
      month: b.month,
      year: b.year,
    }));

    return res.status(200).json({
      success: true,
      month: targetMonth,
      year: targetYear,
      budgets: formatted,
    });
  } catch (error) {
    console.error('[GetBudgets Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets.',
    });
  }
};

/**
 * PUT /api/budgets/:id
 * Update an existing budget
 */
const updateBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const { category, amount, month, year } = req.body;

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [budgetId, userId]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or access denied.',
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be a positive number greater than 0.',
      });
    }

    const targetMonth = parseInt(month, 10) || new Date().getMonth() + 1;
    const targetYear = parseInt(year, 10) || new Date().getFullYear();

    await pool.query(
      'UPDATE budgets SET category = ?, amount = ?, month = ?, year = ? WHERE id = ? AND user_id = ?',
      [category, numericAmount, targetMonth, targetYear, budgetId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
    });
  } catch (error) {
    console.error('[UpdateBudget Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update budget.',
    });
  }
};

/**
 * DELETE /api/budgets/:id
 * Delete a budget record (Does NOT delete expenses!)
 */
const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM budgets WHERE id = ? AND user_id = ?', [budgetId, userId]);

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or access denied.',
      });
    }

    await pool.query('DELETE FROM budgets WHERE id = ? AND user_id = ?', [budgetId, userId]);

    return res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('[DeleteBudget Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete budget.',
    });
  }
};

/**
 * GET /api/budgets/summary
 * Total budget, Total actual spent, Remaining surplus/deficit, Usage %
 */
const getBudgetSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const targetMonth = parseInt(req.query.month, 10) || today.getMonth() + 1;
    const targetYear = parseInt(req.query.year, 10) || today.getFullYear();

    const pool = getPool();

    // 1. Get Overall Budget or Sum of Category Budgets
    const [overallRows] = await pool.query(
      'SELECT amount FROM budgets WHERE user_id = ? AND month = ? AND year = ? AND category = "Overall"',
      [userId, targetMonth, targetYear]
    );

    let totalBudget = 0;

    if (overallRows.length > 0) {
      totalBudget = parseFloat(overallRows[0].amount);
    } else {
      const [sumRows] = await pool.query(
        'SELECT COALESCE(SUM(amount), 0) AS total FROM budgets WHERE user_id = ? AND month = ? AND year = ? AND category != "Overall"',
        [userId, targetMonth, targetYear]
      );
      totalBudget = parseFloat(sumRows[0].total);
    }

    // 2. Get Actual Spent from expenses table for target month/year
    const formattedMonth = String(targetMonth).padStart(2, '0');
    const monthKey = `${targetYear}-${formattedMonth}`;

    const [expRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS totalSpent FROM expenses WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
      [userId, monthKey]
    );

    const totalSpent = parseFloat(expRows[0].totalSpent);
    const remaining = totalBudget - totalSpent;
    const usagePercentage = totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalBudget,
        totalSpent,
        remaining,
        usagePercentage,
      },
    });
  } catch (error) {
    console.error('[GetBudgetSummary Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch budget summary.',
    });
  }
};

/**
 * GET /api/budgets/analytics
 * Category-wise budget vs actual spending breakdown
 */
const getBudgetAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const targetMonth = parseInt(req.query.month, 10) || today.getMonth() + 1;
    const targetYear = parseInt(req.query.year, 10) || today.getFullYear();

    const formattedMonth = String(targetMonth).padStart(2, '0');
    const monthKey = `${targetYear}-${formattedMonth}`;

    const pool = getPool();

    // 1. Get all category budgets for target month/year
    const [budgets] = await pool.query(
      'SELECT id, category, amount FROM budgets WHERE user_id = ? AND month = ? AND year = ? AND category != "Overall" ORDER BY category ASC',
      [userId, targetMonth, targetYear]
    );

    // 2. Get actual expenses grouped by category
    const [expenses] = await pool.query(
      "SELECT category, SUM(amount) AS spent FROM expenses WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ? GROUP BY category",
      [userId, monthKey]
    );

    const expenseMap = {};
    expenses.forEach((e) => {
      expenseMap[e.category] = parseFloat(e.spent);
    });

    const analytics = budgets.map((b) => {
      const budgetAmount = parseFloat(b.amount);
      const spent = expenseMap[b.category] || 0;
      const remaining = budgetAmount - spent;
      const usagePercentage = budgetAmount > 0 ? Number(((spent / budgetAmount) * 100).toFixed(2)) : 0;

      let status = 'safe';
      if (usagePercentage > 100) status = 'exceeded';
      else if (usagePercentage >= 90) status = 'critical';
      else if (usagePercentage >= 70) status = 'warning';

      return {
        id: b.id,
        category: b.category,
        budget: budgetAmount,
        spent,
        remaining,
        usagePercentage,
        status,
      };
    });

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('[GetBudgetAnalytics Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch budget analytics.',
    });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
  getBudgetAnalytics,
};
