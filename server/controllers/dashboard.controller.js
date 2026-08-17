const { getPool } = require('../config/db');
const { formatDateString } = require('../utils/dateHelper');

/**
 * GET /api/dashboard
 * Consolidated high-performance dashboard data using backend SQL aggregations
 */
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const targetMonth = parseInt(req.query.month, 10) || today.getMonth() + 1;
    const targetYear = parseInt(req.query.year, 10) || today.getFullYear();

    const formattedMonth = String(targetMonth).padStart(2, '0');
    const monthKey = `${targetYear}-${formattedMonth}`;

    const pool = getPool();

    // 1. All-Time Financial Summary
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
    const balance = totalIncome - totalExpenses;
    const totalSavings = balance;
    const savingsRate = totalIncome > 0 ? Number(((totalSavings / totalIncome) * 100).toFixed(2)) : 0;

    // 2. Selected Month Overview
    const [mIncRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS monthIncome FROM incomes WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
      [userId, monthKey]
    );
    const [mExpRows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS monthExpenses FROM expenses WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
      [userId, monthKey]
    );

    const monthIncome = parseFloat(mIncRows[0].monthIncome);
    const monthExpenses = parseFloat(mExpRows[0].monthExpenses);
    const monthSavings = monthIncome - monthExpenses;

    // 3. Last 6 Months Historical Trends (Income vs Expenses & Savings)
    const sixMonthsData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(targetYear, targetMonth - 1 - i, 1);
      const mStr = String(d.getMonth() + 1).padStart(2, '0');
      const yStr = d.getFullYear();
      const mKey = `${yStr}-${mStr}`;

      const [histInc] = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) AS inc FROM incomes WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
        [userId, mKey]
      );
      const [histExp] = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) AS exp FROM expenses WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
        [userId, mKey]
      );

      const incVal = parseFloat(histInc[0].inc);
      const expVal = parseFloat(histExp[0].exp);
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });

      sixMonthsData.push({
        monthKey: mKey,
        monthLabel,
        year: yStr,
        income: incVal,
        expenses: expVal,
        savings: incVal - expVal,
      });
    }

    // 4. Monthly Budget Overview & Status
    const [overallBudgetRows] = await pool.query(
      'SELECT amount FROM budgets WHERE user_id = ? AND month = ? AND year = ? AND category = "Overall"',
      [userId, targetMonth, targetYear]
    );

    let totalBudget = 0;
    if (overallBudgetRows.length > 0) {
      totalBudget = parseFloat(overallBudgetRows[0].amount);
    } else {
      const [sumBudgets] = await pool.query(
        'SELECT COALESCE(SUM(amount), 0) AS sumBudget FROM budgets WHERE user_id = ? AND month = ? AND year = ? AND category != "Overall"',
        [userId, targetMonth, targetYear]
      );
      totalBudget = parseFloat(sumBudgets[0].sumBudget);
    }

    const budgetRemaining = totalBudget - monthExpenses;
    const budgetUsagePercentage = totalBudget > 0 ? Number(((monthExpenses / totalBudget) * 100).toFixed(2)) : 0;

    let budgetStatus = 'safe';
    if (budgetUsagePercentage > 100) budgetStatus = 'exceeded';
    else if (budgetUsagePercentage >= 90) budgetStatus = 'critical';
    else if (budgetUsagePercentage >= 70) budgetStatus = 'warning';

    // 5. Top 5 Expense Categories for Selected Month
    const [catRows] = await pool.query(
      "SELECT category, SUM(amount) AS total FROM expenses WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ? GROUP BY category ORDER BY total DESC LIMIT 5",
      [userId, monthKey]
    );

    const expenseCategories = catRows.map((c) => {
      const catTotal = parseFloat(c.total);
      const percentage = monthExpenses > 0 ? Number(((catTotal / monthExpenses) * 100).toFixed(1)) : 0;
      return {
        category: c.category,
        total: catTotal,
        percentage,
      };
    });

    // 6. Recent Transactions (Latest 8 Actual Transactions)
    const [recentInc] = await pool.query(
      'SELECT id, source AS title, amount, date, description, "income" AS type FROM incomes WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 8',
      [userId]
    );
    const [recentExp] = await pool.query(
      'SELECT id, category AS category, description AS title, amount, date, "expense" AS type FROM expenses WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 8',
      [userId]
    );

    const combinedTx = [...recentInc, ...recentExp]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8)
      .map((tx) => ({
        id: tx.id,
        type: tx.type,
        title: tx.title || (tx.type === 'income' ? 'Income' : tx.category),
        category: tx.category || (tx.type === 'income' ? 'Salary' : 'General'),
        amount: parseFloat(tx.amount),
        date: formatDateString(tx.date),
      }));

    // 7. Top 3 Active Savings Goals
    const [goalsRows] = await pool.query(
      'SELECT id, goal_name, target_amount, target_date FROM savings_goals WHERE user_id = ? ORDER BY target_date ASC LIMIT 3',
      [userId]
    );

    const savingsGoals = goalsRows.map((g) => {
      const targetAmount = parseFloat(g.target_amount);
      const currentSaved = Math.max(0, Math.min(targetAmount, totalSavings));
      const percentage = targetAmount > 0 ? Number(Math.min(100, (currentSaved / targetAmount) * 100).toFixed(1)) : 0;
      const remaining = Math.max(0, targetAmount - currentSaved);
      return {
        id: g.id,
        goalName: g.goal_name,
        targetAmount,
        currentSaved,
        percentage,
        remaining,
        targetDate: formatDateString(g.target_date),
        completed: percentage >= 100,
      };
    });

    // 8. Top 5 Upcoming Recurring Transactions
    const [recurringRows] = await pool.query(
      'SELECT id, type, title, category, amount, frequency, next_occurrence FROM recurring_transactions WHERE user_id = ? AND is_active = TRUE ORDER BY next_occurrence ASC LIMIT 5',
      [userId]
    );

    const upcomingRecurring = recurringRows.map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      category: r.category,
      amount: parseFloat(r.amount),
      frequency: r.frequency,
      nextOccurrence: formatDateString(r.next_occurrence),
    }));

    // 9. Top 3 Recent Finance Notes
    const [notesRows] = await pool.query(
      'SELECT id, title, category, note_date, is_pinned FROM notes WHERE user_id = ? ORDER BY is_pinned DESC, note_date DESC, id DESC LIMIT 3',
      [userId]
    );

    const recentNotes = notesRows.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      noteDate: formatDateString(n.note_date),
      isPinned: Boolean(n.is_pinned),
    }));

    // 10. Top 3 Unread Notifications
    const [notifRows] = await pool.query(
      'SELECT id, type, title, message, created_at FROM notifications WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC LIMIT 3',
      [userId]
    );

    const notifications = notifRows.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      createdAt: n.created_at,
    }));

    // 11. Financial Health Score (0-100)
    let healthScore = 50;
    if (savingsRate >= 30) healthScore += 30;
    else if (savingsRate >= 15) healthScore += 20;
    else if (savingsRate > 0) healthScore += 10;

    if (totalBudget > 0 && budgetUsagePercentage <= 85) healthScore += 20;
    else if (totalBudget > 0 && budgetUsagePercentage <= 100) healthScore += 10;

    healthScore = Math.min(100, Math.max(0, healthScore));

    let healthStatus = 'Needs Attention';
    if (healthScore >= 80) healthStatus = 'Excellent';
    else if (healthScore >= 60) healthStatus = 'Good';

    // 12. Prioritized Dynamic Insight
    let insight = {
      type: 'neutral',
      title: 'Financial Tip',
      message: 'Keep tracking your daily expenses and income to build healthy financial habits.',
    };

    if (monthExpenses > monthIncome && monthIncome > 0) {
      insight = {
        type: 'danger',
        title: 'Spending Warning ⚠️',
        message: `Your monthly expenses (${monthExpenses.toLocaleString('en-IN')}) exceed your income this month.`,
      };
    } else if (budgetStatus === 'exceeded') {
      insight = {
        type: 'warning',
        title: 'Budget Exceeded 🚨',
        message: 'Your monthly budget limit has been exceeded. Review your highest spending categories.',
      };
    } else if (savingsRate < 10 && totalIncome > 0) {
      insight = {
        type: 'warning',
        title: 'Low Savings Rate 💡',
        message: `Your savings rate is currently ${savingsRate}%. Try reducing non-essential expenses to reach 20%.`,
      };
    } else if (savingsRate >= 30) {
      insight = {
        type: 'success',
        title: 'Great Savings Progress 🎉',
        message: `Outstanding! You saved ${savingsRate}% of your income this month.`,
      };
    } else if (expenseCategories.length > 0) {
      insight = {
        type: 'info',
        title: 'Highest Spending Category 📊',
        message: `${expenseCategories[0].category} is your highest expense category this month (${expenseCategories[0].percentage}% of total spending).`,
      };
    }

    return res.status(200).json({
      success: true,
      summary: {
        balance,
        totalIncome,
        totalExpenses,
        totalSavings,
        savingsRate,
      },
      monthlyOverview: {
        selectedMonth: targetMonth,
        selectedYear: targetYear,
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthSavings,
      },
      historicalTrends: sixMonthsData,
      budget: {
        totalBudget,
        spent: monthExpenses,
        remaining: budgetRemaining,
        usagePercentage: budgetUsagePercentage,
        status: budgetStatus,
      },
      expenseCategories,
      recentTransactions: combinedTx,
      savingsGoals,
      upcomingRecurring,
      recentNotes,
      notifications,
      financialHealth: {
        score: healthScore,
        status: healthStatus,
      },
      insight,
    });
  } catch (error) {
    console.error('[GetDashboardData Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data.',
    });
  }
};

module.exports = {
  getDashboardData,
};
