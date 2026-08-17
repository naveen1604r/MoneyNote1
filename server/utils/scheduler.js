const { getPool } = require('../config/db');

/**
 * Safely calculates next occurrence date handling month-ends (e.g. Jan 31 -> Feb 28/29)
 */
const getNextOccurrenceDate = (currentDateStr, frequency) => {
  const d = new Date(currentDateStr);
  const origDay = d.getDate();

  if (frequency === 'daily') {
    d.setDate(d.getDate() + 1);
  } else if (frequency === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else if (frequency === 'monthly') {
    d.setMonth(d.getMonth() + 1);
    // Handle month end day overflow (e.g. Jan 31 -> Feb 28)
    if (d.getDate() !== origDay) {
      d.setDate(0);
    }
  } else if (frequency === 'yearly') {
    d.setFullYear(d.getFullYear() + 1);
  }

  return d.toISOString().split('T')[0];
};

/**
 * Idempotent Recurring Generation Engine
 * Finds active templates where next_occurrence <= TODAY, generates actual incomes/expenses,
 * updates next_occurrence and last_generated_at, and handles catchup for missed occurrences.
 */
const processAllDueRecurringTransactions = async (targetUserId = null) => {
  const pool = getPool();
  const todayStr = new Date().toISOString().split('T')[0];

  let query = 'SELECT * FROM recurring_transactions WHERE is_active = TRUE AND next_occurrence <= ?';
  const params = [todayStr];

  if (targetUserId) {
    query += ' AND user_id = ?';
    params.push(targetUserId);
  }

  const [templates] = await pool.query(query, params);

  let processedCount = 0;
  let createdCount = 0;

  for (const t of templates) {
    let currOccurrence = new Date(t.next_occurrence).toISOString().split('T')[0];
    let isStillActive = true;
    let templateGeneratedCount = 0;

    // Check user notification preferences
    const [settRows] = await pool.query(
      'SELECT bill_reminders, expense_alerts FROM user_settings WHERE user_id = ?',
      [t.user_id]
    );

    const userSettings = settRows.length > 0 ? settRows[0] : { bill_reminders: true, expense_alerts: true };

    // Process all due occurrences up to current date (catchup mode)
    while (currOccurrence <= todayStr && isStillActive) {
      // Check if end_date reached
      if (t.end_date) {
        const endDateStr = new Date(t.end_date).toISOString().split('T')[0];
        if (currOccurrence > endDateStr) {
          isStillActive = false;
          break;
        }
      }

      if (t.type === 'income') {
        // Check duplicate constraint
        const [existing] = await pool.query(
          'SELECT id FROM incomes WHERE recurring_transaction_id = ? AND recurring_occurrence_date = ?',
          [t.id, currOccurrence]
        );

        if (existing.length === 0) {
          await pool.query(
            `INSERT INTO incomes (user_id, source, amount, date, description, recurring_transaction_id, recurring_occurrence_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [t.user_id, t.title, t.amount, currOccurrence, `Auto-generated recurring income: ${t.title}`, t.id, currOccurrence]
          );
          createdCount++;
          templateGeneratedCount++;
        }
      } else if (t.type === 'expense') {
        // Check duplicate constraint
        const [existing] = await pool.query(
          'SELECT id FROM expenses WHERE recurring_transaction_id = ? AND recurring_occurrence_date = ?',
          [t.id, currOccurrence]
        );

        if (existing.length === 0) {
          await pool.query(
            `INSERT INTO expenses (user_id, category, amount, date, description, recurring_transaction_id, recurring_occurrence_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [t.user_id, t.category, t.amount, currOccurrence, `Auto-generated recurring expense: ${t.title}`, t.id, currOccurrence]
          );
          createdCount++;
          templateGeneratedCount++;
        }
      }

      // Calculate next occurrence
      const nextDate = getNextOccurrenceDate(currOccurrence, t.frequency);

      // Check if end_date is reached by the next occurrence
      if (t.end_date) {
        const endDateStr = new Date(t.end_date).toISOString().split('T')[0];
        if (nextDate > endDateStr) {
          isStillActive = false;
        }
      }

      currOccurrence = nextDate;
    }

    // Update template status in DB
    await pool.query(
      `UPDATE recurring_transactions
       SET last_generated_at = NOW(), next_occurrence = ?, is_active = ?
       WHERE id = ?`,
      [currOccurrence, isStillActive, t.id]
    );

    // Create notification if records were generated and notifications enabled
    if (templateGeneratedCount > 0 && userSettings.bill_reminders) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, is_read)
         VALUES (?, 'recurring_transaction', ?, ?, FALSE)`,
        [
          t.user_id,
          'Recurring Transaction Added 🔄',
          `Recurring ${t.type} "${t.title}" of ₹${Number(t.amount).toLocaleString('en-IN')} was added automatically.`,
        ]
      );
    }

    processedCount++;
  }

  return {
    processed: processedCount,
    created: createdCount,
  };
};

/**
 * Initializes daily background scheduler
 */
const initScheduler = () => {
  console.log('[Scheduler] Initializing daily recurring transaction engine...');

  try {
    // Run on startup (5 seconds after server start)
    setTimeout(async () => {
      try {
        const res = await processAllDueRecurringTransactions();
        if (res && res.created > 0) {
          console.log(`[Scheduler Startup] Processed ${res.processed} templates and generated ${res.created} new transactions.`);
        }
      } catch (err) {
        console.error('[Scheduler Startup Error]:', err.message || err);
      }
    }, 5000);

    // Run every 24 hours (86400000 ms)
    const intervalObj = setInterval(async () => {
      try {
        const res = await processAllDueRecurringTransactions();
        if (res && res.created > 0) {
          console.log(`[Scheduler Daily] Processed ${res.processed} templates and generated ${res.created} new transactions.`);
        }
      } catch (err) {
        console.error('[Scheduler Daily Error]:', err.message || err);
      }
    }, 86400000);

    console.log('[Scheduler] Daily recurring transaction engine initialized successfully');
    return intervalObj;
  } catch (error) {
    console.error('[Scheduler] Failed to initialize recurring transaction engine:', error.message || error);
  }
};

module.exports = {
  getNextOccurrenceDate,
  processAllDueRecurringTransactions,
  initScheduler,
};
