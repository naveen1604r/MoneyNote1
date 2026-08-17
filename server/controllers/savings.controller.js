const { getPool } = require('../config/db');
const { formatDateString } = require('../utils/dateHelper');

/**
 * GET /api/savings/summary
 * Dynamically calculates Total Income, Total Expenses, Total Savings, Savings Rate
 */
const getSavingsSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [incomeRows] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM incomes WHERE user_id = ?',
      [userId]
    );

    const [expenseRows] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses WHERE user_id = ?',
      [userId]
    );

    const totalIncome = parseFloat(incomeRows[0].totalIncome);
    const totalExpenses = parseFloat(expenseRows[0].totalExpenses);
    const totalSavings = totalIncome - totalExpenses;

    const savingsRate = totalIncome > 0
      ? Number(((totalSavings / totalIncome) * 100).toFixed(2))
      : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpenses,
        totalSavings,
        savingsRate,
      },
    });
  } catch (error) {
    console.error('[GetSavingsSummary Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate savings summary.',
    });
  }
};

/**
 * GET /api/savings/monthly
 * Calculates current or requested month's savings metrics
 */
const getMonthlySavings = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const requestedMonth = req.query.month || currentMonthKey;
    const pool = getPool();

    const [incomeRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS income FROM incomes WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
      [userId, requestedMonth]
    );

    const [expenseRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS expenses FROM expenses WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
      [userId, requestedMonth]
    );

    const income = parseFloat(incomeRows[0].income);
    const expenses = parseFloat(expenseRows[0].expenses);
    const savings = income - expenses;
    const savingsRate = income > 0
      ? Number(((savings / income) * 100).toFixed(2))
      : 0;

    return res.status(200).json({
      success: true,
      monthly: {
        month: requestedMonth,
        income,
        expenses,
        savings,
        savingsRate,
      },
    });
  } catch (error) {
    console.error('[GetMonthlySavings Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate monthly savings.',
    });
  }
};

/**
 * GET /api/savings/monthly-history
 * Returns month-by-month income, expense, and savings data for the last 6 months
 */
const getMonthlySavingsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    // Generate last 6 months list safely using local getters (no UTC shifting)
    const monthKeys = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthKeys.push({ key, label });
    }

    const history = [];

    for (const m of monthKeys) {
      const [incRows] = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) AS income FROM incomes WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
        [userId, m.key]
      );
      const [expRows] = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) AS expenses FROM expenses WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
        [userId, m.key]
      );

      const income = parseFloat(incRows[0].income);
      const expenses = parseFloat(expRows[0].expenses);
      const savings = income - expenses;

      history.push({
        month: m.label,
        monthKey: m.key,
        income,
        expenses,
        savings,
      });
    }

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('[GetMonthlySavingsHistory Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly savings history.',
    });
  }
};

/**
 * POST /api/savings/goals
 * Create a new savings goal
 */
const createSavingsGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalName, targetAmount, targetDate, description } = req.body;

    // Validations
    if (!goalName || goalName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Goal name is required',
      });
    }

    const numericTarget = parseFloat(targetAmount);
    if (isNaN(numericTarget) || numericTarget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than ₹0',
      });
    }

    if (!targetDate || isNaN(Date.parse(targetDate))) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid target date',
      });
    }

    const pool = getPool();
    const formattedDate = formatDateString(targetDate);
    const cleanedDescription = description ? description.trim() : null;

    const [result] = await pool.query(
      'INSERT INTO savings_goals (user_id, goal_name, target_amount, target_date, description) VALUES (?, ?, ?, ?, ?)',
      [userId, goalName.trim(), numericTarget, formattedDate, cleanedDescription]
    );

    return res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      goal: {
        id: result.insertId,
        goalName: goalName.trim(),
        targetAmount: numericTarget,
        targetDate: formattedDate,
        description: cleanedDescription,
      },
    });
  } catch (error) {
    console.error('[CreateSavingsGoal Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create savings goal. Please try again.',
    });
  }
};

/**
 * GET /api/savings/goals
 * Fetches user goals with dynamic progress calculations
 */
const getSavingsGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    // Calculate total dynamic savings for user
    const [incRows] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM incomes WHERE user_id = ?',
      [userId]
    );
    const [expRows] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses WHERE user_id = ?',
      [userId]
    );

    const totalIncome = parseFloat(incRows[0].totalIncome);
    const totalExpenses = parseFloat(expRows[0].totalExpenses);
    const dynamicSavings = Math.max(0, totalIncome - totalExpenses);

    const [rows] = await pool.query(
      'SELECT id, goal_name, target_amount, target_date, description, created_at FROM savings_goals WHERE user_id = ? ORDER BY target_date ASC',
      [userId]
    );

    const goals = rows.map((goal) => {
      const targetAmount = parseFloat(goal.target_amount);
      const currentSavings = dynamicSavings;
      const progressPercentage = Math.min(100, Math.max(0, Number(((currentSavings / targetAmount) * 100).toFixed(2))));
      const remainingAmount = Math.max(0, targetAmount - currentSavings);
      const status = currentSavings >= targetAmount ? 'Completed' : 'In Progress';

      return {
        id: goal.id,
        goalName: goal.goal_name,
        targetAmount,
        targetDate: formatDateString(goal.target_date),
        description: goal.description,
        currentSavings,
        progressPercentage,
        remainingAmount,
        status,
        createdAt: goal.created_at,
      };
    });

    return res.status(200).json({
      success: true,
      goals,
    });
  } catch (error) {
    console.error('[GetSavingsGoals Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch savings goals.',
    });
  }
};

/**
 * PUT /api/savings/goals/:id
 */
const updateSavingsGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { goalName, targetAmount, targetDate, description } = req.body;

    const pool = getPool();

    // Ownership check
    const [existing] = await pool.query(
      'SELECT id FROM savings_goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found or access denied',
      });
    }

    if (!goalName || goalName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Goal name is required',
      });
    }

    const numericTarget = parseFloat(targetAmount);
    if (isNaN(numericTarget) || numericTarget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than ₹0',
      });
    }

    if (!targetDate || isNaN(Date.parse(targetDate))) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid target date',
      });
    }

    const formattedDate = formatDateString(targetDate);
    const cleanedDescription = description ? description.trim() : null;

    await pool.query(
      'UPDATE savings_goals SET goal_name = ?, target_amount = ?, target_date = ?, description = ? WHERE id = ? AND user_id = ?',
      [goalName.trim(), numericTarget, formattedDate, cleanedDescription, goalId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully',
    });
  } catch (error) {
    console.error('[UpdateSavingsGoal Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update savings goal.',
    });
  }
};

/**
 * DELETE /api/savings/goals/:id
 */
const deleteSavingsGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;

    const pool = getPool();

    // Ownership check
    const [existing] = await pool.query(
      'SELECT id FROM savings_goals WHERE id = ? AND user_id = ?',
      [goalId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found or access denied',
      });
    }

    await pool.query('DELETE FROM savings_goals WHERE id = ? AND user_id = ?', [goalId, userId]);

    return res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully',
    });
  } catch (error) {
    console.error('[DeleteSavingsGoal Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete savings goal.',
    });
  }
};

module.exports = {
  getSavingsSummary,
  getMonthlySavings,
  getMonthlySavingsHistory,
  createSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
  deleteSavingsGoal,
};
