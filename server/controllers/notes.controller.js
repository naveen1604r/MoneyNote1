const { getPool } = require('../config/db');

const ALLOWED_CATEGORIES = [
  'Savings',
  'Budget',
  'Bills',
  'Shopping',
  'Investment',
  'Salary',
  'Debt',
  'Education',
  'Travel',
  'Financial Goal',
  'Reminder',
  'Personal',
  'Other',
];

/**
 * POST /api/notes
 * Create a new finance note
 */
const createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, content, category, amount, noteDate, isPinned } = req.body;

    // 1. Validations
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please enter a note title',
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Note title cannot exceed 200 characters',
      });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please enter your note content',
      });
    }

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid note category',
      });
    }

    if (!noteDate || isNaN(Date.parse(noteDate))) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid note date',
      });
    }

    let numericAmount = null;
    if (amount !== undefined && amount !== null && amount !== '') {
      numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than ₹0',
        });
      }
    }

    const pinnedStatus = Boolean(isPinned);
    const pool = getPool();
    const formattedDate = new Date(noteDate).toISOString().split('T')[0];

    const [result] = await pool.query(
      'INSERT INTO notes (user_id, title, content, category, amount, note_date, is_pinned) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, title.trim(), content.trim(), category, numericAmount, formattedDate, pinnedStatus]
    );

    return res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note: {
        id: result.insertId,
        title: title.trim(),
        content: content.trim(),
        category,
        amount: numericAmount,
        noteDate: formattedDate,
        isPinned: pinnedStatus,
      },
    });
  } catch (error) {
    console.error('[CreateNote Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create note. Please try again.',
    });
  }
};

/**
 * GET /api/notes
 * Fetch user notes with search, category filter, pinned filter, date filter, sort
 */
const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, category, pinned, date, sort } = req.query;

    let query = 'SELECT id, title, content, category, amount, note_date, is_pinned, created_at, updated_at FROM notes WHERE user_id = ?';
    const params = [userId];

    // Search filter
    if (search && search.trim() !== '') {
      query += ' AND (title LIKE ? OR content LIKE ? OR category LIKE ?)';
      const searchTerm = `%${search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (category && category !== 'All' && category !== 'All Categories') {
      query += ' AND category = ?';
      params.push(category);
    }

    // Pinned filter
    if (pinned === 'true') {
      query += ' AND is_pinned = TRUE';
    }

    // Date filter
    if (date === 'today') {
      query += ' AND note_date = CURRENT_DATE()';
    } else if (date === 'week') {
      query += ' AND note_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)';
    } else if (date === 'month') {
      query += " AND DATE_FORMAT(note_date, '%Y-%m') = DATE_FORMAT(CURRENT_DATE(), '%Y-%m')";
    }

    // Sorting logic (Pinned notes stay at top unless explicitly overridden)
    switch (sort) {
      case 'oldest':
        query += ' ORDER BY is_pinned DESC, note_date ASC, id ASC';
        break;
      case 'updated':
        query += ' ORDER BY is_pinned DESC, updated_at DESC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY is_pinned DESC, note_date DESC, id DESC';
        break;
    }

    const pool = getPool();
    const [rows] = await pool.query(query, params);

    const formattedNotes = rows.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      category: item.category,
      amount: item.amount ? parseFloat(item.amount) : null,
      noteDate: new Date(item.note_date).toISOString().split('T')[0],
      isPinned: Boolean(item.is_pinned),
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return res.status(200).json({
      success: true,
      notes: formattedNotes,
    });
  } catch (error) {
    console.error('[GetNotes Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notes.',
    });
  }
};

/**
 * GET /api/notes/summary
 * Aggregates Total Notes, Pinned Notes, This Month Notes, Notes With Amount
 */
const getNotesSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();
    const currentMonth = new Date().toISOString().slice(0, 7);

    // 1. Total Notes
    const [totalRows] = await pool.query(
      'SELECT COUNT(*) AS totalNotes FROM notes WHERE user_id = ?',
      [userId]
    );

    // 2. Pinned Notes
    const [pinnedRows] = await pool.query(
      'SELECT COUNT(*) AS pinnedNotes FROM notes WHERE user_id = ? AND is_pinned = TRUE',
      [userId]
    );

    // 3. This Month Notes
    const [monthRows] = await pool.query(
      "SELECT COUNT(*) AS thisMonth FROM notes WHERE user_id = ? AND DATE_FORMAT(note_date, '%Y-%m') = ?",
      [userId, currentMonth]
    );

    // 4. Notes With Amount
    const [amountRows] = await pool.query(
      'SELECT COUNT(*) AS notesWithAmount FROM notes WHERE user_id = ? AND amount IS NOT NULL AND amount > 0',
      [userId]
    );

    return res.status(200).json({
      success: true,
      summary: {
        totalNotes: parseInt(totalRows[0].totalNotes, 10),
        pinnedNotes: parseInt(pinnedRows[0].pinnedNotes, 10),
        thisMonth: parseInt(monthRows[0].thisMonth, 10),
        notesWithAmount: parseInt(amountRows[0].notesWithAmount, 10),
      },
    });
  } catch (error) {
    console.error('[GetNotesSummary Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate notes summary.',
    });
  }
};

/**
 * GET /api/notes/:id
 */
const getNoteById = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, title, content, category, amount, note_date, is_pinned, created_at, updated_at FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied',
      });
    }

    const item = rows[0];
    return res.status(200).json({
      success: true,
      note: {
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        amount: item.amount ? parseFloat(item.amount) : null,
        noteDate: new Date(item.note_date).toISOString().split('T')[0],
        isPinned: Boolean(item.is_pinned),
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      },
    });
  } catch (error) {
    console.error('[GetNoteById Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch note details.',
    });
  }
};

/**
 * PUT /api/notes/:id
 */
const updateNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content, category, amount, noteDate, isPinned } = req.body;

    const pool = getPool();

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied',
      });
    }

    // Validations
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please enter a note title',
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Note title cannot exceed 200 characters',
      });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please enter your note content',
      });
    }

    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid note category',
      });
    }

    if (!noteDate || isNaN(Date.parse(noteDate))) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid note date',
      });
    }

    let numericAmount = null;
    if (amount !== undefined && amount !== null && amount !== '') {
      numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than ₹0',
        });
      }
    }

    const pinnedStatus = Boolean(isPinned);
    const formattedDate = new Date(noteDate).toISOString().split('T')[0];

    await pool.query(
      'UPDATE notes SET title = ?, content = ?, category = ?, amount = ?, note_date = ?, is_pinned = ? WHERE id = ? AND user_id = ?',
      [title.trim(), content.trim(), category, numericAmount, formattedDate, pinnedStatus, noteId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
    });
  } catch (error) {
    console.error('[UpdateNote Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update note.',
    });
  }
};

/**
 * DELETE /api/notes/:id
 */
const deleteNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const pool = getPool();

    // Verify ownership
    const [existing] = await pool.query(
      'SELECT id FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied',
      });
    }

    await pool.query('DELETE FROM notes WHERE id = ? AND user_id = ?', [noteId, userId]);

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('[DeleteNote Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete note.',
    });
  }
};

/**
 * PATCH /api/notes/:id/pin
 * Toggle pinned status for note
 */
const toggleNotePin = async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const pool = getPool();

    // Verify ownership & get current pin status
    const [existing] = await pool.query(
      'SELECT id, is_pinned FROM notes WHERE id = ? AND user_id = ?',
      [noteId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or access denied',
      });
    }

    const currentPinStatus = Boolean(existing[0].is_pinned);
    const newPinStatus = !currentPinStatus;

    await pool.query(
      'UPDATE notes SET is_pinned = ? WHERE id = ? AND user_id = ?',
      [newPinStatus, noteId, userId]
    );

    const message = newPinStatus ? 'Note pinned successfully' : 'Note unpinned successfully';

    return res.status(200).json({
      success: true,
      message,
      isPinned: newPinStatus,
    });
  } catch (error) {
    console.error('[ToggleNotePin Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle pin status.',
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNotesSummary,
  getNoteById,
  updateNote,
  deleteNote,
  toggleNotePin,
};
