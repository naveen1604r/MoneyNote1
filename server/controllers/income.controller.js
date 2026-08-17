const { getPool } = require('../config/db');
const { formatDateString } = require('../utils/dateHelper');

const ALLOWED_SOURCES = [
  'Salary',
  'Freelance',
  'Business',
  'Bonus',
  'Investment',
  'Interest',
  'Gift',
  'Other',
];

/**
 * POST /api/incomes
 * Add a new income entry
 */
const createIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const { source, amount, date, description } = req.body;

    // 1. Validation
    if (!source || !ALLOWED_SOURCES.includes(source)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid income source',
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Income amount must be greater than ₹0',
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
      'INSERT INTO incomes (user_id, source, amount, date, description) VALUES (?, ?, ?, ?, ?)',
      [userId, source, numericAmount, formattedDate, cleanedDescription]
    );

    const newIncomeId = result.insertId;

    return res.status(201).json({
      success: true,
      message: 'Income added successfully',
      income: {
        id: newIncomeId,
        source,
        amount: numericAmount,
        date: formattedDate,
        description: cleanedDescription,
      },
    });
  } catch (error) {
    console.error('[CreateIncome Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create income entry. Please try again.',
    });
  }
};

/**
 * GET /api/incomes
 * Fetch all income entries for logged in user with search, filter, sort
 */
const getIncomes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, source, month, sort } = req.query;

    let query = 'SELECT id, source, amount, date, description, created_at FROM incomes WHERE user_id = ?';
    const params = [userId];

    // Search filter (source or description)
    if (search && search.trim() !== '') {
      query += ' AND (source LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm);
    }

    // Source filter
    if (source && source !== 'All' && source !== 'All Sources') {
      query += ' AND source = ?';
      params.push(source);
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

    // Format amounts to numeric and dates to YYYY-MM-DD
    const formattedIncomes = rows.map((item) => ({
      ...item,
      amount: parseFloat(item.amount),
      date: formatDateString(item.date),
    }));

    return res.status(200).json({
      success: true,
      incomes: formattedIncomes,
    });
  } catch (error) {
    console.error('[GetIncomes Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch income records.',
    });
  }
};

/**
 * GET /api/incomes/summary
 * Total Income, Current Month Income, Income Count, Highest Income
 */
const getIncomeSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestedMonth = req.query.month || formatDateString(new Date()).slice(0, 7);

    const pool = getPool();

    // 1. Total Income
    const [totalRows] = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM incomes WHERE user_id = ?',
      [userId]
    );

    // 2. Current Month Income
    const [monthRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS currentMonthIncome FROM incomes WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
      [userId, requestedMonth]
    );

    // 3. Total Income Count
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS incomeCount FROM incomes WHERE user_id = ?',
      [userId]
    );

    // 4. Highest Income
    const [highestRows] = await pool.query(
      'SELECT COALESCE(MAX(amount), 0) AS highestIncome FROM incomes WHERE user_id = ?',
      [userId]
    );

    return res.status(200).json({
      success: true,
      summary: {
        totalIncome: parseFloat(totalRows[0].totalIncome),
        currentMonthIncome: parseFloat(monthRows[0].currentMonthIncome),
        incomeCount: parseInt(countRows[0].incomeCount, 10),
        highestIncome: parseFloat(highestRows[0].highestIncome),
      },
    });
  } catch (error) {
    console.error('[GetIncomeSummary Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate income summary.',
    });
  }
};

/**
 * GET /api/incomes/:id
 */
const getIncomeById = async (req, res) => {
  try {
    const userId = req.user.id;
    const incomeId = req.params.id;

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, source, amount, date, description, created_at FROM incomes WHERE id = ? AND user_id = ?',
      [incomeId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found or access denied',
      });
    }

    const item = rows[0];
    return res.status(200).json({
      success: true,
      income: {
        ...item,
        amount: parseFloat(item.amount),
        date: formatDateString(item.date),
      },
    });
  } catch (error) {
    console.error('[GetIncomeById Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch income details.',
    });
  }
};

/**
 * PUT /api/incomes/:id
 */
const updateIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const incomeId = req.params.id;
    const { source, amount, date, description } = req.body;

    const pool = getPool();

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id FROM incomes WHERE id = ? AND user_id = ?',
      [incomeId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found or access denied',
      });
    }

    // Validations
    if (!source || !ALLOWED_SOURCES.includes(source)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid income source',
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Income amount must be greater than ₹0',
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
      'UPDATE incomes SET source = ?, amount = ?, date = ?, description = ? WHERE id = ? AND user_id = ?',
      [source, numericAmount, formattedDate, cleanedDescription, incomeId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Income updated successfully',
    });
  } catch (error) {
    console.error('[UpdateIncome Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update income. Please try again.',
    });
  }
};

/**
 * DELETE /api/incomes/:id
 */
const deleteIncome = async (req, res) => {
  try {
    const userId = req.user.id;
    const incomeId = req.params.id;

    const pool = getPool();

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id FROM incomes WHERE id = ? AND user_id = ?',
      [incomeId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Income record not found or access denied',
      });
    }

    await pool.query('DELETE FROM incomes WHERE id = ? AND user_id = ?', [incomeId, userId]);

    return res.status(200).json({
      success: true,
      message: 'Income deleted successfully',
    });
  } catch (error) {
    console.error('[DeleteIncome Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete income record.',
    });
  }
};

module.exports = {
  createIncome,
  getIncomes,
  getIncomeSummary,
  getIncomeById,
  updateIncome,
  deleteIncome,
};
