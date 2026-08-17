const { getPool } = require('../config/db');
const { processAllDueRecurringTransactions } = require('../utils/scheduler');

const ALLOWED_TYPES = ['income', 'expense'];
const ALLOWED_FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'];

/**
 * POST /api/recurring-transactions
 * Create a new recurring transaction template
 */
const createRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, title, category, amount, frequency, startDate, endDate } = req.body;

    if (!type || !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "income" or "expense".',
      });
    }

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Title is required.',
      });
    }

    if (!category || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category is required.',
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0.',
      });
    }

    if (!frequency || !ALLOWED_FREQUENCIES.includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid frequency. Allowed: daily, weekly, monthly, yearly.',
      });
    }

    if (!startDate || isNaN(Date.parse(startDate))) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid start date.',
      });
    }

    const formattedStart = new Date(startDate).toISOString().split('T')[0];
    let formattedEnd = null;

    if (endDate && endDate !== '') {
      if (isNaN(Date.parse(endDate))) {
        return res.status(400).json({ success: false, message: 'Please select a valid end date.' });
      }
      formattedEnd = new Date(endDate).toISOString().split('T')[0];
      if (formattedEnd < formattedStart) {
        return res.status(400).json({ success: false, message: 'End date must be after or equal to Start date.' });
      }
    }

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO recurring_transactions (user_id, type, title, category, amount, frequency, start_date, end_date, next_occurrence, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [userId, type, title.trim(), category.trim(), numericAmount, frequency, formattedStart, formattedEnd, formattedStart]
    );

    const newId = result.insertId;

    // Trigger instant check for processing due items
    await processAllDueRecurringTransactions(userId);

    // Re-fetch updated template row
    const [rows] = await pool.query('SELECT * FROM recurring_transactions WHERE id = ?', [newId]);
    const r = rows[0];

    return res.status(201).json({
      success: true,
      message: 'Recurring transaction created successfully',
      recurringTransaction: {
        id: r.id,
        type: r.type,
        title: r.title,
        category: r.category,
        amount: parseFloat(r.amount),
        frequency: r.frequency,
        startDate: new Date(r.start_date).toISOString().split('T')[0],
        endDate: r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : null,
        nextOccurrence: new Date(r.next_occurrence).toISOString().split('T')[0],
        lastGeneratedAt: r.last_generated_at ? r.last_generated_at : null,
        isActive: Boolean(r.is_active),
      },
    });
  } catch (error) {
    console.error('[CreateRecurringTransaction Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create recurring transaction.',
    });
  }
};

/**
 * GET /api/recurring-transactions
 * List all recurring transactions for authenticated user
 */
const getRecurringTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT * FROM recurring_transactions WHERE user_id = ? ORDER BY is_active DESC, next_occurrence ASC',
      [userId]
    );

    const formatted = rows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      category: r.category,
      amount: parseFloat(r.amount),
      frequency: r.frequency,
      startDate: new Date(r.start_date).toISOString().split('T')[0],
      endDate: r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : null,
      nextOccurrence: new Date(r.next_occurrence).toISOString().split('T')[0],
      lastGeneratedAt: r.last_generated_at ? r.last_generated_at : null,
      isActive: Boolean(r.is_active),
    }));

    return res.status(200).json({
      success: true,
      recurringTransactions: formatted,
    });
  } catch (error) {
    console.error('[GetRecurringTransactions Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch recurring transactions.',
    });
  }
};

/**
 * GET /api/recurring-transactions/:id
 */
const getRecurringTransactionById = async (req, res) => {
  try {
    const userId = req.user.id;
    const recId = req.params.id;
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM recurring_transactions WHERE id = ? AND user_id = ?', [recId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Recurring transaction not found or access denied.' });
    }

    const r = rows[0];
    return res.status(200).json({
      success: true,
      recurringTransaction: {
        id: r.id,
        type: r.type,
        title: r.title,
        category: r.category,
        amount: parseFloat(r.amount),
        frequency: r.frequency,
        startDate: new Date(r.start_date).toISOString().split('T')[0],
        endDate: r.end_date ? new Date(r.end_date).toISOString().split('T')[0] : null,
        nextOccurrence: new Date(r.next_occurrence).toISOString().split('T')[0],
        lastGeneratedAt: r.last_generated_at ? r.last_generated_at : null,
        isActive: Boolean(r.is_active),
      },
    });
  } catch (error) {
    console.error('[GetRecurringTransactionById Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch recurring transaction.' });
  }
};

/**
 * PUT /api/recurring-transactions/:id
 * Update template for future occurrences (historical transactions remain unchanged!)
 */
const updateRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const recId = req.params.id;
    const { type, title, category, amount, frequency, startDate, endDate } = req.body;

    const pool = getPool();
    const [existing] = await pool.query('SELECT id, next_occurrence FROM recurring_transactions WHERE id = ? AND user_id = ?', [recId, userId]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recurring transaction not found or access denied.' });
    }

    if (!type || !ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid type.' });
    }

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    if (!category || category.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
    }

    if (!frequency || !ALLOWED_FREQUENCIES.includes(frequency)) {
      return res.status(400).json({ success: false, message: 'Invalid frequency.' });
    }

    const formattedStart = new Date(startDate).toISOString().split('T')[0];
    let formattedEnd = null;

    if (endDate && endDate !== '') {
      formattedEnd = new Date(endDate).toISOString().split('T')[0];
      if (formattedEnd < formattedStart) {
        return res.status(400).json({ success: false, message: 'End date must be after or equal to Start date.' });
      }
    }

    await pool.query(
      `UPDATE recurring_transactions
       SET type = ?, title = ?, category = ?, amount = ?, frequency = ?, start_date = ?, end_date = ?
       WHERE id = ? AND user_id = ?`,
      [type, title.trim(), category.trim(), numericAmount, frequency, formattedStart, formattedEnd, recId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Recurring transaction updated successfully (affects future occurrences only)',
    });
  } catch (error) {
    console.error('[UpdateRecurringTransaction Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update recurring transaction.' });
  }
};

/**
 * PATCH /api/recurring-transactions/:id/pause
 */
const pauseRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const recId = req.params.id;
    const pool = getPool();

    const [existing] = await pool.query('SELECT id FROM recurring_transactions WHERE id = ? AND user_id = ?', [recId, userId]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recurring transaction not found or access denied.' });
    }

    await pool.query('UPDATE recurring_transactions SET is_active = FALSE WHERE id = ? AND user_id = ?', [recId, userId]);

    return res.status(200).json({
      success: true,
      message: 'Recurring transaction paused.',
      isActive: false,
    });
  } catch (error) {
    console.error('[PauseRecurringTransaction Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to pause recurring transaction.' });
  }
};

/**
 * PATCH /api/recurring-transactions/:id/resume
 */
const resumeRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const recId = req.params.id;
    const pool = getPool();

    const [existing] = await pool.query('SELECT id FROM recurring_transactions WHERE id = ? AND user_id = ?', [recId, userId]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recurring transaction not found or access denied.' });
    }

    await pool.query('UPDATE recurring_transactions SET is_active = TRUE WHERE id = ? AND user_id = ?', [recId, userId]);

    // Trigger immediate process check
    await processAllDueRecurringTransactions(userId);

    return res.status(200).json({
      success: true,
      message: 'Recurring transaction resumed.',
      isActive: true,
    });
  } catch (error) {
    console.error('[ResumeRecurringTransaction Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to resume recurring transaction.' });
  }
};

/**
 * DELETE /api/recurring-transactions/:id
 * Delete template (Does NOT delete previously generated income/expense records!)
 */
const deleteRecurringTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const recId = req.params.id;
    const pool = getPool();

    const [existing] = await pool.query('SELECT id FROM recurring_transactions WHERE id = ? AND user_id = ?', [recId, userId]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Recurring transaction not found or access denied.' });
    }

    await pool.query('DELETE FROM recurring_transactions WHERE id = ? AND user_id = ?', [recId, userId]);

    return res.status(200).json({
      success: true,
      message: 'Recurring transaction deleted (Previous transactions remain intact)',
    });
  } catch (error) {
    console.error('[DeleteRecurringTransaction Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete recurring transaction.' });
  }
};

/**
 * POST /api/recurring-transactions/process
 * Endpoint to trigger execution of due recurring transactions
 */
const processRecurringTransactionsApi = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await processAllDueRecurringTransactions(userId);

    return res.status(200).json({
      success: true,
      message: `Processed ${result.processed} template(s), created ${result.created} transaction(s).`,
      processed: result.processed,
      created: result.created,
    });
  } catch (error) {
    console.error('[ProcessRecurringTransactionsApi Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to process recurring transactions.' });
  }
};

module.exports = {
  createRecurringTransaction,
  getRecurringTransactions,
  getRecurringTransactionById,
  updateRecurringTransaction,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
  deleteRecurringTransaction,
  processRecurringTransactionsApi,
};
