const { getPool } = require('../config/db');

const ALLOWED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];
const ALLOWED_DATE_FORMATS = ['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY'];
const ALLOWED_THEMES = ['system', 'light', 'dark'];

/**
 * GET /api/settings
 * Fetch user preferences from user_settings table
 */
const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    let [rows] = await pool.query(
      'SELECT currency, date_format, theme, email_notifications, expense_alerts, savings_updates, bill_reminders, financial_tips FROM user_settings WHERE user_id = ?',
      [userId]
    );

    // If settings row does not exist for user, insert default settings row
    if (rows.length === 0) {
      await pool.query(
        `INSERT INTO user_settings (user_id, currency, date_format, theme, email_notifications, expense_alerts, savings_updates, bill_reminders, financial_tips)
         VALUES (?, 'INR', 'DD MMM YYYY', 'system', TRUE, TRUE, TRUE, TRUE, FALSE)`,
        [userId]
      );

      [rows] = await pool.query(
        'SELECT currency, date_format, theme, email_notifications, expense_alerts, savings_updates, bill_reminders, financial_tips FROM user_settings WHERE user_id = ?',
        [userId]
      );
    }

    const s = rows[0];
    return res.status(200).json({
      success: true,
      settings: {
        currency: s.currency,
        dateFormat: s.date_format,
        theme: s.theme,
        emailNotifications: Boolean(s.email_notifications),
        expenseAlerts: Boolean(s.expense_alerts),
        savingsUpdates: Boolean(s.savings_updates),
        billReminders: Boolean(s.bill_reminders),
        financialTips: Boolean(s.financial_tips),
      },
    });
  } catch (error) {
    console.error('[GetSettings Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user settings.',
    });
  }
};

/**
 * PUT /api/settings
 * Update user preferences
 */
const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      currency,
      dateFormat,
      theme,
      emailNotifications,
      expenseAlerts,
      savingsUpdates,
      billReminders,
      financialTips,
    } = req.body;

    const pool = getPool();

    // Validations
    const validCurrency = ALLOWED_CURRENCIES.includes(currency) ? currency : 'INR';
    const validDateFormat = ALLOWED_DATE_FORMATS.includes(dateFormat) ? dateFormat : 'DD MMM YYYY';
    const validTheme = ALLOWED_THEMES.includes(theme) ? theme : 'system';

    const eNotif = emailNotifications !== undefined ? Boolean(emailNotifications) : true;
    const eAlerts = expenseAlerts !== undefined ? Boolean(expenseAlerts) : true;
    const sUpdates = savingsUpdates !== undefined ? Boolean(savingsUpdates) : true;
    const bRemind = billReminders !== undefined ? Boolean(billReminders) : true;
    const fTips = financialTips !== undefined ? Boolean(financialTips) : false;

    // UPSERT settings
    await pool.query(
      `INSERT INTO user_settings (user_id, currency, date_format, theme, email_notifications, expense_alerts, savings_updates, bill_reminders, financial_tips)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       currency = VALUES(currency),
       date_format = VALUES(date_format),
       theme = VALUES(theme),
       email_notifications = VALUES(email_notifications),
       expense_alerts = VALUES(expense_alerts),
       savings_updates = VALUES(savings_updates),
       bill_reminders = VALUES(bill_reminders),
       financial_tips = VALUES(financial_tips)`,
      [userId, validCurrency, validDateFormat, validTheme, eNotif, eAlerts, sUpdates, bRemind, fTips]
    );

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        currency: validCurrency,
        dateFormat: validDateFormat,
        theme: validTheme,
        emailNotifications: eNotif,
        expenseAlerts: eAlerts,
        savingsUpdates: sUpdates,
        billReminders: bRemind,
        financialTips: fTips,
      },
    });
  } catch (error) {
    console.error('[UpdateSettings Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings.',
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
