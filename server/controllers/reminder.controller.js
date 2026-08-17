const { getPool } = require('../config/db');

/**
 * GET /api/reminders
 */
const getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT id, title, description, reminder_date, reminder_time, is_completed FROM reminders WHERE user_id = ? ORDER BY is_completed ASC, reminder_date ASC',
      [userId]
    );

    const formatted = rows.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      reminderDate: new Date(item.reminder_date).toISOString().split('T')[0],
      reminderTime: item.reminder_time || '',
      isCompleted: Boolean(item.is_completed),
    }));

    return res.status(200).json({
      success: true,
      reminders: formatted,
    });
  } catch (error) {
    console.error('[GetReminders Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch financial reminders.',
    });
  }
};

/**
 * POST /api/reminders
 */
const createReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, reminderDate, reminderTime } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reminder title is required',
      });
    }

    if (!reminderDate || isNaN(Date.parse(reminderDate))) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid reminder date',
      });
    }

    const pool = getPool();
    const formattedDate = new Date(reminderDate).toISOString().split('T')[0];
    const cleanedDesc = description ? description.trim() : null;
    const cleanedTime = reminderTime ? reminderTime.trim() : null;

    const [result] = await pool.query(
      'INSERT INTO reminders (user_id, title, description, reminder_date, reminder_time) VALUES (?, ?, ?, ?, ?)',
      [userId, title.trim(), cleanedDesc, formattedDate, cleanedTime]
    );

    return res.status(201).json({
      success: true,
      message: 'Financial reminder created successfully',
      reminder: {
        id: result.insertId,
        title: title.trim(),
        description: cleanedDesc,
        reminderDate: formattedDate,
        reminderTime: cleanedTime,
        isCompleted: false,
      },
    });
  } catch (error) {
    console.error('[CreateReminder Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create financial reminder.',
    });
  }
};

/**
 * PUT /api/reminders/:id
 */
const updateReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminderId = req.params.id;
    const { title, description, reminderDate, reminderTime } = req.body;

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM reminders WHERE id = ? AND user_id = ?', [reminderId, userId]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Reminder not found or access denied' });
    }

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Reminder title is required' });
    }

    if (!reminderDate || isNaN(Date.parse(reminderDate))) {
      return res.status(400).json({ success: false, message: 'Please select a valid reminder date' });
    }

    const formattedDate = new Date(reminderDate).toISOString().split('T')[0];
    const cleanedDesc = description ? description.trim() : null;
    const cleanedTime = reminderTime ? reminderTime.trim() : null;

    await pool.query(
      'UPDATE reminders SET title = ?, description = ?, reminder_date = ?, reminder_time = ? WHERE id = ? AND user_id = ?',
      [title.trim(), cleanedDesc, formattedDate, cleanedTime, reminderId, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Reminder updated successfully',
    });
  } catch (error) {
    console.error('[UpdateReminder Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update reminder.',
    });
  }
};

/**
 * DELETE /api/reminders/:id
 */
const deleteReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminderId = req.params.id;

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM reminders WHERE id = ? AND user_id = ?', [reminderId, userId]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Reminder not found or access denied' });
    }

    await pool.query('DELETE FROM reminders WHERE id = ? AND user_id = ?', [reminderId, userId]);

    return res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  } catch (error) {
    console.error('[DeleteReminder Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete reminder.',
    });
  }
};

/**
 * PATCH /api/reminders/:id/complete
 */
const toggleComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    const reminderId = req.params.id;

    const pool = getPool();
    const [existing] = await pool.query('SELECT id, is_completed FROM reminders WHERE id = ? AND user_id = ?', [reminderId, userId]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Reminder not found or access denied' });
    }

    const newStatus = !existing[0].is_completed;
    await pool.query('UPDATE reminders SET is_completed = ? WHERE id = ? AND user_id = ?', [newStatus, reminderId, userId]);

    return res.status(200).json({
      success: true,
      message: newStatus ? 'Reminder marked as completed' : 'Reminder marked as incomplete',
      isCompleted: newStatus,
    });
  } catch (error) {
    console.error('[ToggleComplete Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update reminder completion status.',
    });
  }
};

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleComplete,
};
