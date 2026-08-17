const { getPool } = require('../config/db');

const ALLOWED_TYPES = ['all', 'income', 'expense', 'note', 'recurring'];
const ALLOWED_SORTS = ['newest', 'oldest', 'amount_desc', 'amount_asc', 'az', 'za'];

const formatDateSafe = (dateVal) => {
  if (!dateVal) return new Date().toISOString().split('T')[0];
  try {
    return new Date(dateVal).toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * GET /api/search
 * High-performance, parameterized multi-table search across incomes, expenses, notes, and recurring_transactions
 */
const searchFinance = async (req, res) => {
  try {
    const userId = req.user.id;
    let {
      q = '',
      type = 'all',
      category = '',
      startDate = '',
      endDate = '',
      minAmount = '',
      maxAmount = '',
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    // Sanitize & Validate Inputs
    const queryTerm = typeof q === 'string' ? q.trim().slice(0, 100) : '';
    const selectedType = ALLOWED_TYPES.includes(type) ? type : 'all';
    const selectedSort = ALLOWED_SORTS.includes(sort) ? sort : 'newest';

    let pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;

    let limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1) limitNum = 20;
    if (limitNum > 50) limitNum = 50;

    const offset = (pageNum - 1) * limitNum;
    const searchPattern = `%${queryTerm}%`;

    const pool = getPool();

    // Arrays to collect items from tables
    let incomeItems = [];
    let expenseItems = [];
    let noteItems = [];
    let recurringItems = [];

    const minAmtNum = minAmount !== '' ? parseFloat(minAmount) : null;
    const maxAmtNum = maxAmount !== '' ? parseFloat(maxAmount) : null;

    // -------------------------------------------------------------
    // 1. Query INCOMES if type is 'all' or 'income'
    // -------------------------------------------------------------
    if (selectedType === 'all' || selectedType === 'income') {
      let sql = 'SELECT id, source AS title, source AS category, amount, date, description FROM incomes WHERE user_id = ?';
      const params = [userId];

      if (queryTerm !== '') {
        sql += ' AND (source LIKE ? OR description LIKE ?)';
        params.push(searchPattern, searchPattern);
      }
      if (category !== '') {
        sql += ' AND source = ?';
        params.push(category);
      }
      if (startDate !== '') {
        sql += ' AND date >= ?';
        params.push(startDate);
      }
      if (endDate !== '') {
        sql += ' AND date <= ?';
        params.push(endDate);
      }
      if (minAmtNum !== null && !isNaN(minAmtNum)) {
        sql += ' AND amount >= ?';
        params.push(minAmtNum);
      }
      if (maxAmtNum !== null && !isNaN(maxAmtNum)) {
        sql += ' AND amount <= ?';
        params.push(maxAmtNum);
      }

      const [rows] = await pool.query(sql, params);
      incomeItems = rows.map((r) => ({
        id: r.id,
        type: 'income',
        title: r.title || 'Income',
        category: r.category || 'Salary',
        amount: parseFloat(r.amount),
        date: formatDateSafe(r.date),
        description: r.description || null,
      }));
    }

    // -------------------------------------------------------------
    // 2. Query EXPENSES if type is 'all' or 'expense'
    // -------------------------------------------------------------
    if (selectedType === 'all' || selectedType === 'expense') {
      let sql = 'SELECT id, category, description AS title, amount, date, description FROM expenses WHERE user_id = ?';
      const params = [userId];

      if (queryTerm !== '') {
        sql += ' AND (category LIKE ? OR description LIKE ?)';
        params.push(searchPattern, searchPattern);
      }
      if (category !== '') {
        sql += ' AND category = ?';
        params.push(category);
      }
      if (startDate !== '') {
        sql += ' AND date >= ?';
        params.push(startDate);
      }
      if (endDate !== '') {
        sql += ' AND date <= ?';
        params.push(endDate);
      }
      if (minAmtNum !== null && !isNaN(minAmtNum)) {
        sql += ' AND amount >= ?';
        params.push(minAmtNum);
      }
      if (maxAmtNum !== null && !isNaN(maxAmtNum)) {
        sql += ' AND amount <= ?';
        params.push(maxAmtNum);
      }

      const [rows] = await pool.query(sql, params);
      expenseItems = rows.map((r) => ({
        id: r.id,
        type: 'expense',
        title: r.title || r.category,
        category: r.category,
        amount: parseFloat(r.amount),
        date: formatDateSafe(r.date),
        description: r.description || null,
      }));
    }

    // -------------------------------------------------------------
    // 3. Query NOTES if type is 'all' or 'note'
    // -------------------------------------------------------------
    if (selectedType === 'all' || selectedType === 'note') {
      let sql = 'SELECT id, title, content, category, amount, note_date FROM notes WHERE user_id = ?';
      const params = [userId];

      if (queryTerm !== '') {
        sql += ' AND (title LIKE ? OR content LIKE ? OR category LIKE ?)';
        params.push(searchPattern, searchPattern, searchPattern);
      }
      if (category !== '') {
        sql += ' AND category = ?';
        params.push(category);
      }
      if (startDate !== '') {
        sql += ' AND note_date >= ?';
        params.push(startDate);
      }
      if (endDate !== '') {
        sql += ' AND note_date <= ?';
        params.push(endDate);
      }
      if (minAmtNum !== null && !isNaN(minAmtNum)) {
        sql += ' AND amount >= ?';
        params.push(minAmtNum);
      }
      if (maxAmtNum !== null && !isNaN(maxAmtNum)) {
        sql += ' AND amount <= ?';
        params.push(maxAmtNum);
      }

      const [rows] = await pool.query(sql, params);
      noteItems = rows.map((r) => ({
        id: r.id,
        type: 'note',
        title: r.title,
        category: r.category,
        amount: r.amount !== null ? parseFloat(r.amount) : 0,
        date: formatDateSafe(r.note_date),
        description: r.content ? r.content.slice(0, 100) : null,
      }));
    }

    // -------------------------------------------------------------
    // 4. Query RECURRING TRANSACTIONS if type is 'all' or 'recurring'
    // -------------------------------------------------------------
    if (selectedType === 'all' || selectedType === 'recurring') {
      let sql = 'SELECT id, type AS recType, title, category, amount, frequency, next_occurrence, is_active FROM recurring_transactions WHERE user_id = ?';
      const params = [userId];

      if (queryTerm !== '') {
        sql += ' AND (title LIKE ? OR category LIKE ?)';
        params.push(searchPattern, searchPattern);
      }
      if (category !== '') {
        sql += ' AND category = ?';
        params.push(category);
      }
      if (minAmtNum !== null && !isNaN(minAmtNum)) {
        sql += ' AND amount >= ?';
        params.push(minAmtNum);
      }
      if (maxAmtNum !== null && !isNaN(maxAmtNum)) {
        sql += ' AND amount <= ?';
        params.push(maxAmtNum);
      }

      const [rows] = await pool.query(sql, params);
      recurringItems = rows.map((r) => ({
        id: r.id,
        type: 'recurring',
        recType: r.recType,
        title: r.title,
        category: r.category,
        amount: parseFloat(r.amount),
        frequency: r.frequency,
        date: formatDateSafe(r.next_occurrence),
        description: `${r.recType?.toUpperCase()} • ${r.frequency?.toUpperCase()}`,
        isActive: Boolean(r.is_active),
      }));
    }

    // Calculate tab counts
    const counts = {
      all: incomeItems.length + expenseItems.length + noteItems.length + recurringItems.length,
      income: incomeItems.length,
      expense: expenseItems.length,
      note: noteItems.length,
      recurring: recurringItems.length,
    };

    // Combine items based on selected tab
    let allResults = [];
    if (selectedType === 'income') allResults = incomeItems;
    else if (selectedType === 'expense') allResults = expenseItems;
    else if (selectedType === 'note') allResults = noteItems;
    else if (selectedType === 'recurring') allResults = recurringItems;
    else allResults = [...incomeItems, ...expenseItems, ...noteItems, ...recurringItems];

    // Apply Sorting
    allResults.sort((a, b) => {
      if (selectedSort === 'newest') return new Date(b.date) - new Date(a.date);
      if (selectedSort === 'oldest') return new Date(a.date) - new Date(b.date);
      if (selectedSort === 'amount_desc') return b.amount - a.amount;
      if (selectedSort === 'amount_asc') return a.amount - b.amount;
      if (selectedSort === 'az') return a.title.localeCompare(b.title);
      if (selectedSort === 'za') return b.title.localeCompare(a.title);
      return 0;
    });

    // Apply Pagination
    const total = allResults.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const paginatedResults = allResults.slice(offset, offset + limitNum);

    return res.status(200).json({
      success: true,
      query: queryTerm,
      type: selectedType,
      results: paginatedResults,
      counts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[SearchFinance Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to search your finances.',
    });
  }
};

module.exports = {
  searchFinance,
};
