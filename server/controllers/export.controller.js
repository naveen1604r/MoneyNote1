const PDFDocument = require('pdfkit');
const { getPool } = require('../config/db');

// Helper: Escape CSV Field
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
};

// Helper: Format Date string
const formatDateStr = (dateVal) => {
  if (!dateVal) return '';
  try {
    return new Date(dateVal).toISOString().split('T')[0];
  } catch (e) {
    return String(dateVal);
  }
};

// Helper: Log export event
const logExportEvent = async (userId, exportType, format) => {
  try {
    const pool = getPool();
    await pool.query(
      'INSERT INTO export_history (user_id, export_type, format) VALUES (?, ?, ?)',
      [userId, exportType, format]
    );
  } catch (e) {
    console.error('Failed to log export history:', e.message);
  }
};

// -------------------------------------------------------------
// 1. Export Income CSV
// -------------------------------------------------------------
const exportIncomeCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category } = req.query;

    const pool = getPool();
    let sql = 'SELECT source, amount, date, description FROM incomes WHERE user_id = ?';
    const params = [userId];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }
    if (category) {
      sql += ' AND source = ?';
      params.push(category);
    }
    sql += ' ORDER BY date DESC';

    const [rows] = await pool.query(sql, params);

    const headers = ['Date', 'Source', 'Category', 'Amount', 'Description'];
    const csvLines = [headers.map(escapeCSV).join(',')];

    for (const r of rows) {
      const line = [
        escapeCSV(formatDateStr(r.date)),
        escapeCSV(r.source),
        escapeCSV(r.source),
        escapeCSV(r.amount),
        escapeCSV(r.description || ''),
      ].join(',');
      csvLines.push(line);
    }

    const csvString = csvLines.join('\n');
    await logExportEvent(userId, 'Income', 'CSV');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="moneynote-income-${Date.now()}.csv"`);
    return res.status(200).send(csvString);
  } catch (err) {
    console.error('[Export Income CSV Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to export income CSV.' });
  }
};

// -------------------------------------------------------------
// 2. Export Expenses CSV
// -------------------------------------------------------------
const exportExpensesCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, category } = req.query;

    const pool = getPool();
    let sql = 'SELECT description, category, amount, date, description AS fullDesc FROM expenses WHERE user_id = ?';
    const params = [userId];

    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    sql += ' ORDER BY date DESC';

    const [rows] = await pool.query(sql, params);

    const headers = ['Date', 'Title', 'Category', 'Amount', 'Description'];
    const csvLines = [headers.map(escapeCSV).join(',')];

    for (const r of rows) {
      const line = [
        escapeCSV(formatDateStr(r.date)),
        escapeCSV(r.description || r.category),
        escapeCSV(r.category),
        escapeCSV(r.amount),
        escapeCSV(r.fullDesc || ''),
      ].join(',');
      csvLines.push(line);
    }

    const csvString = csvLines.join('\n');
    await logExportEvent(userId, 'Expenses', 'CSV');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="moneynote-expenses-${Date.now()}.csv"`);
    return res.status(200).send(csvString);
  } catch (err) {
    console.error('[Export Expenses CSV Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to export expenses CSV.' });
  }
};

// -------------------------------------------------------------
// 3. Export Budgets CSV
// -------------------------------------------------------------
const exportBudgetsCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT month, year, category, amount FROM budgets WHERE user_id = ? ORDER BY year DESC, month DESC',
      [userId]
    );

    const headers = ['Month', 'Year', 'Category', 'Budget Amount'];
    const csvLines = [headers.map(escapeCSV).join(',')];

    for (const r of rows) {
      csvLines.push(
        [escapeCSV(r.month), escapeCSV(r.year), escapeCSV(r.category), escapeCSV(r.amount)].join(',')
      );
    }

    const csvString = csvLines.join('\n');
    await logExportEvent(userId, 'Budgets', 'CSV');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="moneynote-budgets-${Date.now()}.csv"`);
    return res.status(200).send(csvString);
  } catch (err) {
    console.error('[Export Budgets CSV Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to export budgets CSV.' });
  }
};

// -------------------------------------------------------------
// 4. Export Savings Goals CSV
// -------------------------------------------------------------
const exportGoalsCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [goals] = await pool.query(
      'SELECT goal_name, target_amount, target_date, description FROM savings_goals WHERE user_id = ? ORDER BY target_date ASC',
      [userId]
    );

    const [expensesSum] = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = ?', [userId]);
    const [incomesSum] = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM incomes WHERE user_id = ?', [userId]);

    const totalSavings = Math.max(0, parseFloat(incomesSum[0].total) - parseFloat(expensesSum[0].total));

    const headers = ['Goal Name', 'Target Amount', 'Current Saved', 'Progress', 'Target Date', 'Status'];
    const csvLines = [headers.map(escapeCSV).join(',')];

    for (const g of goals) {
      const target = parseFloat(g.target_amount);
      const current = Math.min(target, totalSavings);
      const progress = target > 0 ? `${((current / target) * 100).toFixed(1)}%` : '0%';
      const status = current >= target ? 'Completed' : 'In Progress';

      csvLines.push(
        [
          escapeCSV(g.goal_name),
          escapeCSV(target),
          escapeCSV(current),
          escapeCSV(progress),
          escapeCSV(formatDateStr(g.target_date)),
          escapeCSV(status),
        ].join(',')
      );
    }

    const csvString = csvLines.join('\n');
    await logExportEvent(userId, 'Savings Goals', 'CSV');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="moneynote-goals-${Date.now()}.csv"`);
    return res.status(200).send(csvString);
  } catch (err) {
    console.error('[Export Goals CSV Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to export savings goals CSV.' });
  }
};

// -------------------------------------------------------------
// 5. Export Notes CSV
// -------------------------------------------------------------
const exportNotesCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT note_date, title, category, content, amount, is_pinned FROM notes WHERE user_id = ? ORDER BY note_date DESC',
      [userId]
    );

    const headers = ['Date', 'Title', 'Category', 'Amount', 'Pinned', 'Content'];
    const csvLines = [headers.map(escapeCSV).join(',')];

    for (const r of rows) {
      csvLines.push(
        [
          escapeCSV(formatDateStr(r.note_date)),
          escapeCSV(r.title),
          escapeCSV(r.category),
          escapeCSV(r.amount !== null ? r.amount : ''),
          escapeCSV(r.is_pinned ? 'Yes' : 'No'),
          escapeCSV(r.content || ''),
        ].join(',')
      );
    }

    const csvString = csvLines.join('\n');
    await logExportEvent(userId, 'Notes', 'CSV');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="moneynote-notes-${Date.now()}.csv"`);
    return res.status(200).send(csvString);
  } catch (err) {
    console.error('[Export Notes CSV Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to export notes CSV.' });
  }
};

// -------------------------------------------------------------
// 6. Export Recurring CSV
// -------------------------------------------------------------
const exportRecurringCSV = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT type, title, category, amount, frequency, start_date, end_date, next_occurrence, is_active FROM recurring_transactions WHERE user_id = ? ORDER BY next_occurrence ASC',
      [userId]
    );

    const headers = ['Type', 'Title', 'Category', 'Amount', 'Frequency', 'Start Date', 'End Date', 'Next Occurrence', 'Status'];
    const csvLines = [headers.map(escapeCSV).join(',')];

    for (const r of rows) {
      csvLines.push(
        [
          escapeCSV(r.type?.toUpperCase()),
          escapeCSV(r.title),
          escapeCSV(r.category),
          escapeCSV(r.amount),
          escapeCSV(r.frequency?.toUpperCase()),
          escapeCSV(formatDateStr(r.start_date)),
          escapeCSV(formatDateStr(r.end_date) || 'None'),
          escapeCSV(formatDateStr(r.next_occurrence)),
          escapeCSV(r.is_active ? 'Active' : 'Paused'),
        ].join(',')
      );
    }

    const csvString = csvLines.join('\n');
    await logExportEvent(userId, 'Recurring', 'CSV');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="moneynote-recurring-${Date.now()}.csv"`);
    return res.status(200).send(csvString);
  } catch (err) {
    console.error('[Export Recurring CSV Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to export recurring transactions CSV.' });
  }
};

// -------------------------------------------------------------
// 7. Export PDF Financial Report
// -------------------------------------------------------------
const generatePDFReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    const pool = getPool();

    // Query User Details
    const [userRows] = await pool.query('SELECT name, email FROM users WHERE id = ?', [userId]);
    const userName = userRows[0]?.name || 'Valued User';

    // Query Aggregations
    let incomeSql = 'SELECT COALESCE(SUM(amount), 0) AS total FROM incomes WHERE user_id = ?';
    let expenseSql = 'SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = ?';
    const params = [userId];

    if (startDate) {
      incomeSql += ' AND date >= ?';
      expenseSql += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      incomeSql += ' AND date <= ?';
      expenseSql += ' AND date <= ?';
      params.push(endDate);
    }

    const [incRes] = await pool.query(incomeSql, params);
    const [expRes] = await pool.query(expenseSql, params);

    const totalIncome = parseFloat(incRes[0].total);
    const totalExpenses = parseFloat(expRes[0].total);
    const totalSavings = Math.max(0, totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : '0.0';

    // Top Expense Categories
    const [topCategories] = await pool.query(
      'SELECT category, SUM(amount) AS total FROM expenses WHERE user_id = ? GROUP BY category ORDER BY total DESC LIMIT 5',
      [userId]
    );

    // Recent Transactions
    const [recentTx] = await pool.query(
      `SELECT description AS title, category, amount, date, 'Expense' AS type FROM expenses WHERE user_id = ?
       UNION ALL
       SELECT source AS title, 'Income' AS category, amount, date, 'Income' AS type FROM incomes WHERE user_id = ?
       ORDER BY date DESC LIMIT 8`,
      [userId, userId]
    );

    // PDFKit Document Creation
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    await logExportEvent(userId, 'PDF Financial Report', 'PDF');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="moneynote-financial-report-${Date.now()}.pdf"`);

    doc.pipe(res);

    // Document Header
    doc
      .fillColor('#4f46e5')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('MoneyNote Personal Finance Report', { align: 'center' });

    doc.moveDown(0.3);
    doc
      .fillColor('#64748b')
      .fontSize(10)
      .font('Helvetica')
      .text(`Generated for: ${userName} (${userRows[0]?.email || ''}) | Date: ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.moveDown(1.5);

    // Financial Summary Cards Box
    doc.rect(40, 100, 515, 75).fillAndStroke('#f8fafc', '#e2e8f0');

    doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text('Financial Executive Summary', 55, 112);

    doc.fontSize(10).font('Helvetica');
    doc.fillColor('#059669').text(`Total Income: ₹${totalIncome.toLocaleString()}`, 55, 135);
    doc.fillColor('#e11d48').text(`Total Expenses: ₹${totalExpenses.toLocaleString()}`, 200, 135);
    doc.fillColor('#4f46e5').text(`Net Savings: ₹${totalSavings.toLocaleString()}`, 350, 135);
    doc.fillColor('#d97706').text(`Savings Rate: ${savingsRate}%`, 55, 153);

    doc.moveDown(3);

    // Top Expense Categories Section
    doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Top Spending Categories', 40, 200);
    doc.moveDown(0.5);

    let yPos = 220;
    if (topCategories.length === 0) {
      doc.fillColor('#64748b').fontSize(10).font('Helvetica').text('No expense category records available.', 40, yPos);
      yPos += 20;
    } else {
      topCategories.forEach((cat) => {
        const pct = totalExpenses > 0 ? ((parseFloat(cat.total) / totalExpenses) * 100).toFixed(1) : '0';
        doc.fillColor('#334155').fontSize(10).font('Helvetica').text(`• ${cat.category}: ₹${parseFloat(cat.total).toLocaleString()} (${pct}%)`, 50, yPos);
        yPos += 18;
      });
    }

    yPos += 15;

    // Recent Transactions Section
    doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('Recent Financial Transactions', 40, yPos);
    yPos += 22;

    // Table Header
    doc.rect(40, yPos, 515, 20).fill('#e2e8f0');
    doc.fillColor('#0f172a').fontSize(9).font('Helvetica-Bold');
    doc.text('Date', 50, yPos + 5);
    doc.text('Title / Category', 130, yPos + 5);
    doc.text('Type', 340, yPos + 5);
    doc.text('Amount', 450, yPos + 5);

    yPos += 22;

    recentTx.forEach((tx) => {
      doc.fillColor('#334155').fontSize(9).font('Helvetica');
      doc.text(formatDateStr(tx.date), 50, yPos);
      doc.text(`${tx.title} (${tx.category})`, 130, yPos, { width: 200, ellipsis: true });
      doc.text(tx.type, 340, yPos);
      if (tx.type === 'Income') {
        doc.fillColor('#059669').text(`+₹${parseFloat(tx.amount).toLocaleString()}`, 450, yPos);
      } else {
        doc.fillColor('#e11d48').text(`-₹${parseFloat(tx.amount).toLocaleString()}`, 450, yPos);
      }
      yPos += 20;
    });

    // Footer
    doc
      .fontSize(8)
      .fillColor('#94a3b8')
      .text('MoneyNote Finance Tracker — Confidential Personal Statement', 40, 780, { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('[Export PDF Report Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF financial report.' });
  }
};

// -------------------------------------------------------------
// 8. Export Complete JSON Backup
// -------------------------------------------------------------
const exportFullJSONBackup = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [incomes] = await pool.query('SELECT source, amount, date, description FROM incomes WHERE user_id = ?', [userId]);
    const [expenses] = await pool.query('SELECT category, amount, date, description FROM expenses WHERE user_id = ?', [userId]);
    const [budgets] = await pool.query('SELECT category, amount, month, year FROM budgets WHERE user_id = ?', [userId]);
    const [goals] = await pool.query('SELECT goal_name, target_amount, target_date, description FROM savings_goals WHERE user_id = ?', [userId]);
    const [notes] = await pool.query('SELECT title, content, category, amount, note_date, is_pinned FROM notes WHERE user_id = ?', [userId]);
    const [recurring] = await pool.query('SELECT type, title, category, amount, frequency, start_date, end_date, next_occurrence, is_active FROM recurring_transactions WHERE user_id = ?', [userId]);

    const backupPayload = {
      app: 'MoneyNote',
      backupVersion: '1.0',
      exportedAt: new Date().toISOString(),
      metadata: {
        incomeCount: incomes.length,
        expenseCount: expenses.length,
        budgetCount: budgets.length,
        goalCount: goals.length,
        noteCount: notes.length,
        recurringCount: recurring.length,
      },
      data: {
        income: incomes.map((r) => ({ ...r, date: formatDateStr(r.date), amount: parseFloat(r.amount) })),
        expenses: expenses.map((r) => ({ ...r, date: formatDateStr(r.date), amount: parseFloat(r.amount) })),
        budgets: budgets.map((r) => ({ ...r, amount: parseFloat(r.amount) })),
        savingsGoals: goals.map((r) => ({ ...r, target_date: formatDateStr(r.target_date), target_amount: parseFloat(r.target_amount) })),
        notes: notes.map((r) => ({ ...r, note_date: formatDateStr(r.note_date), amount: r.amount !== null ? parseFloat(r.amount) : null, is_pinned: Boolean(r.is_pinned) })),
        recurringTransactions: recurring.map((r) => ({
          ...r,
          amount: parseFloat(r.amount),
          start_date: formatDateStr(r.start_date),
          end_date: formatDateStr(r.end_date),
          next_occurrence: formatDateStr(r.next_occurrence),
          is_active: Boolean(r.is_active),
        })),
      },
    };

    await logExportEvent(userId, 'Full Backup', 'JSON');

    const jsonString = JSON.stringify(backupPayload, null, 2);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="moneynote-backup-${Date.now()}.json"`);
    return res.status(200).send(jsonString);
  } catch (err) {
    console.error('[Export Full Backup JSON Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate JSON backup.' });
  }
};

// -------------------------------------------------------------
// 9. Preview Uploaded Backup JSON
// -------------------------------------------------------------
const previewBackupJSON = async (req, res) => {
  try {
    let backupObj = req.body;

    if (req.file) {
      try {
        backupObj = JSON.parse(req.file.buffer.toString('utf-8'));
      } catch (e) {
        return res.status(400).json({ success: false, message: 'Invalid JSON file format.' });
      }
    }

    if (!backupObj || backupObj.app !== 'MoneyNote') {
      return res.status(400).json({ success: false, message: 'Invalid backup file: Not a MoneyNote backup.' });
    }

    if (backupObj.backupVersion !== '1.0') {
      return res.status(400).json({ success: false, message: `Unsupported backup version "${backupObj.backupVersion || 'Unknown'}". Minimum required: "1.0".` });
    }

    const data = backupObj.data || {};

    return res.status(200).json({
      success: true,
      exportedAt: backupObj.exportedAt || 'Unknown',
      backupVersion: backupObj.backupVersion,
      counts: {
        income: data.income?.length || 0,
        expenses: data.expenses?.length || 0,
        budgets: data.budgets?.length || 0,
        savingsGoals: data.savingsGoals?.length || 0,
        notes: data.notes?.length || 0,
        recurringTransactions: data.recurringTransactions?.length || 0,
      },
    });
  } catch (err) {
    console.error('[Preview Backup JSON Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to parse backup preview.' });
  }
};

// -------------------------------------------------------------
// 10. Restore Backup JSON (Merge vs Replace Mode with Transactions)
// -------------------------------------------------------------
const restoreBackupJSON = async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;
    let backupObj = req.body;

    if (req.file) {
      try {
        backupObj = JSON.parse(req.file.buffer.toString('utf-8'));
      } catch (e) {
        connection.release();
        return res.status(400).json({ success: false, message: 'Invalid JSON backup file.' });
      }
    }

    const mode = req.body.mode === 'replace' ? 'replace' : 'merge';

    if (!backupObj || backupObj.app !== 'MoneyNote' || backupObj.backupVersion !== '1.0') {
      connection.release();
      return res.status(400).json({ success: false, message: 'Invalid or unsupported MoneyNote backup payload.' });
    }

    const data = backupObj.data || {};

    await connection.beginTransaction();

    const summary = {
      income: { imported: 0, skipped: 0 },
      expenses: { imported: 0, skipped: 0 },
      budgets: { imported: 0, skipped: 0 },
      savingsGoals: { imported: 0, skipped: 0 },
      notes: { imported: 0, skipped: 0 },
      recurringTransactions: { imported: 0, skipped: 0 },
    };

    // If REPLACE mode: delete user's financial records first (NEVER touch users table!)
    if (mode === 'replace') {
      await connection.query('DELETE FROM incomes WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM expenses WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM budgets WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM savings_goals WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM notes WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM recurring_transactions WHERE user_id = ?', [userId]);
    }

    // 1. Restore Incomes
    if (Array.isArray(data.income)) {
      for (const item of data.income) {
        if (!item.source || !item.amount || !item.date) {
          summary.income.skipped++;
          continue;
        }

        if (mode === 'merge') {
          const [exists] = await connection.query(
            'SELECT id FROM incomes WHERE user_id = ? AND source = ? AND amount = ? AND date = ?',
            [userId, item.source, item.amount, formatDateStr(item.date)]
          );
          if (exists.length > 0) {
            summary.income.skipped++;
            continue;
          }
        }

        await connection.query(
          'INSERT INTO incomes (user_id, source, amount, date, description) VALUES (?, ?, ?, ?, ?)',
          [userId, item.source, parseFloat(item.amount), formatDateStr(item.date), item.description || null]
        );
        summary.income.imported++;
      }
    }

    // 2. Restore Expenses
    if (Array.isArray(data.expenses)) {
      for (const item of data.expenses) {
        if (!item.category || !item.amount || !item.date) {
          summary.expenses.skipped++;
          continue;
        }

        if (mode === 'merge') {
          const [exists] = await connection.query(
            'SELECT id FROM expenses WHERE user_id = ? AND category = ? AND amount = ? AND date = ?',
            [userId, item.category, item.amount, formatDateStr(item.date)]
          );
          if (exists.length > 0) {
            summary.expenses.skipped++;
            continue;
          }
        }

        await connection.query(
          'INSERT INTO expenses (user_id, category, amount, date, description) VALUES (?, ?, ?, ?, ?)',
          [userId, item.category, parseFloat(item.amount), formatDateStr(item.date), item.description || null]
        );
        summary.expenses.imported++;
      }
    }

    // 3. Restore Budgets
    if (Array.isArray(data.budgets)) {
      for (const item of data.budgets) {
        if (!item.category || !item.amount || !item.month || !item.year) {
          summary.budgets.skipped++;
          continue;
        }

        if (mode === 'merge') {
          const [exists] = await connection.query(
            'SELECT id FROM budgets WHERE user_id = ? AND category = ? AND month = ? AND year = ?',
            [userId, item.category, item.month, item.year]
          );
          if (exists.length > 0) {
            summary.budgets.skipped++;
            continue;
          }
        }

        await connection.query(
          'INSERT INTO budgets (user_id, category, amount, month, year) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE amount = VALUES(amount)',
          [userId, item.category, parseFloat(item.amount), item.month, item.year]
        );
        summary.budgets.imported++;
      }
    }

    // 4. Restore Savings Goals
    if (Array.isArray(data.savingsGoals)) {
      for (const item of data.savingsGoals) {
        if (!item.goal_name || !item.target_amount || !item.target_date) {
          summary.savingsGoals.skipped++;
          continue;
        }

        if (mode === 'merge') {
          const [exists] = await connection.query(
            'SELECT id FROM savings_goals WHERE user_id = ? AND goal_name = ? AND target_amount = ?',
            [userId, item.goal_name, item.target_amount]
          );
          if (exists.length > 0) {
            summary.savingsGoals.skipped++;
            continue;
          }
        }

        await connection.query(
          'INSERT INTO savings_goals (user_id, goal_name, target_amount, target_date, description) VALUES (?, ?, ?, ?, ?)',
          [userId, item.goal_name, parseFloat(item.target_amount), formatDateStr(item.target_date), item.description || null]
        );
        summary.savingsGoals.imported++;
      }
    }

    // 5. Restore Notes
    if (Array.isArray(data.notes)) {
      for (const item of data.notes) {
        if (!item.title || !item.content || !item.category || !item.note_date) {
          summary.notes.skipped++;
          continue;
        }

        if (mode === 'merge') {
          const [exists] = await connection.query(
            'SELECT id FROM notes WHERE user_id = ? AND title = ? AND note_date = ?',
            [userId, item.title, formatDateStr(item.note_date)]
          );
          if (exists.length > 0) {
            summary.notes.skipped++;
            continue;
          }
        }

        await connection.query(
          'INSERT INTO notes (user_id, title, content, category, amount, note_date, is_pinned) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            userId,
            item.title,
            item.content,
            item.category,
            item.amount !== null && item.amount !== undefined ? parseFloat(item.amount) : null,
            formatDateStr(item.note_date),
            item.is_pinned ? 1 : 0,
          ]
        );
        summary.notes.imported++;
      }
    }

    // 6. Restore Recurring Transactions
    if (Array.isArray(data.recurringTransactions)) {
      for (const item of data.recurringTransactions) {
        if (!item.type || !item.title || !item.category || !item.amount || !item.frequency || !item.next_occurrence) {
          summary.recurringTransactions.skipped++;
          continue;
        }

        if (mode === 'merge') {
          const [exists] = await connection.query(
            'SELECT id FROM recurring_transactions WHERE user_id = ? AND title = ? AND type = ? AND amount = ?',
            [userId, item.title, item.type, item.amount]
          );
          if (exists.length > 0) {
            summary.recurringTransactions.skipped++;
            continue;
          }
        }

        await connection.query(
          'INSERT INTO recurring_transactions (user_id, type, title, category, amount, frequency, start_date, end_date, next_occurrence, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            userId,
            item.type.toLowerCase(),
            item.title,
            item.category,
            parseFloat(item.amount),
            item.frequency.toLowerCase(),
            formatDateStr(item.start_date || item.next_occurrence),
            item.end_date ? formatDateStr(item.end_date) : null,
            formatDateStr(item.next_occurrence),
            item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
          ]
        );
        summary.recurringTransactions.imported++;
      }
    }

    await connection.commit();
    connection.release();

    return res.status(200).json({
      success: true,
      mode,
      summary,
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('[Restore Backup JSON Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to restore backup due to database transaction error.' });
  }
};

// -------------------------------------------------------------
// 11. Get Recent Export History
// -------------------------------------------------------------
const getExportHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT id, export_type, format, created_at FROM export_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    return res.status(200).json({
      success: true,
      history: rows,
    });
  } catch (err) {
    console.error('[Get Export History Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch export history.' });
  }
};

module.exports = {
  exportIncomeCSV,
  exportExpensesCSV,
  exportBudgetsCSV,
  exportGoalsCSV,
  exportNotesCSV,
  exportRecurringCSV,
  generatePDFReport,
  exportFullJSONBackup,
  previewBackupJSON,
  restoreBackupJSON,
  getExportHistory,
};
