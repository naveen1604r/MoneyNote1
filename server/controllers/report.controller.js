const { getPool } = require('../config/db');

/**
 * GET /api/reports/summary
 * Total Income, Total Expenses, Total Savings, Savings Rate for date range
 */
const getReportSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let incQuery = 'SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM incomes WHERE user_id = ?';
    let expQuery = 'SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses WHERE user_id = ?';
    const incParams = [userId];
    const expParams = [userId];

    if (startDate && startDate !== '') {
      incQuery += ' AND date >= ?';
      expQuery += ' AND date >= ?';
      incParams.push(startDate);
      expParams.push(startDate);
    }
    if (endDate && endDate !== '') {
      incQuery += ' AND date <= ?';
      expQuery += ' AND date <= ?';
      incParams.push(endDate);
      expParams.push(endDate);
    }

    const pool = getPool();
    const [incRows] = await pool.query(incQuery, incParams);
    const [expRows] = await pool.query(expQuery, expParams);

    const totalIncome = parseFloat(incRows[0].totalIncome);
    const totalExpenses = parseFloat(expRows[0].totalExpenses);
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
    console.error('[GetReportSummary Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate report summary.',
    });
  }
};

/**
 * GET /api/reports/monthly
 * Returns monthly breakdown of income, expenses, and savings
 */
const getMonthlyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const pool = getPool();

    // Query distinct months in range from incomes and expenses
    let monthsQuery = `
      SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') AS monthKey, DATE_FORMAT(date, '%b %Y') AS month
      FROM (
        SELECT date FROM incomes WHERE user_id = ?
        UNION
        SELECT date FROM expenses WHERE user_id = ?
      ) AS combined_dates
    `;
    const monthsParams = [userId, userId];

    if (startDate && startDate !== '') {
      monthsQuery += ' WHERE date >= ?';
      monthsParams.push(startDate);
    }
    if (endDate && endDate !== '') {
      monthsQuery += startDate ? ' AND date <= ?' : ' WHERE date <= ?';
      monthsParams.push(endDate);
    }

    monthsQuery += ' ORDER BY monthKey ASC';

    const [monthRows] = await pool.query(monthsQuery, monthsParams);

    const monthlyReport = [];

    for (const m of monthRows) {
      const [incRows] = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) AS income FROM incomes WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
        [userId, m.monthKey]
      );
      const [expRows] = await pool.query(
        "SELECT COALESCE(SUM(amount), 0) AS expenses FROM expenses WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?",
        [userId, m.monthKey]
      );

      const income = parseFloat(incRows[0].income);
      const expenses = parseFloat(expRows[0].expenses);
      const savings = income - expenses;
      const savingsRate = income > 0 ? Number(((savings / income) * 100).toFixed(2)) : 0;

      monthlyReport.push({
        month: m.month,
        monthKey: m.monthKey,
        income,
        expenses,
        savings,
        savingsRate,
      });
    }

    return res.status(200).json({
      success: true,
      monthly: monthlyReport,
    });
  } catch (error) {
    console.error('[GetMonthlyReports Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly reports.',
    });
  }
};

/**
 * GET /api/reports/expense-categories
 * Category-wise expense breakdown with percentages
 */
const getExpenseCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const pool = getPool();

    let query = 'SELECT category, SUM(amount) AS total FROM expenses WHERE user_id = ?';
    const params = [userId];

    if (startDate && startDate !== '') {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate && endDate !== '') {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY category ORDER BY total DESC';

    const [rows] = await pool.query(query, params);

    const totalExpenseSum = rows.reduce((acc, curr) => acc + parseFloat(curr.total), 0);

    const categories = rows.map((item) => {
      const amount = parseFloat(item.total);
      const percentage = totalExpenseSum > 0 ? Number(((amount / totalExpenseSum) * 100).toFixed(2)) : 0;
      return {
        category: item.category,
        amount,
        percentage,
      };
    });

    return res.status(200).json({
      success: true,
      totalExpenses: totalExpenseSum,
      categories,
    });
  } catch (error) {
    console.error('[GetExpenseCategories Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch expense categories.',
    });
  }
};

/**
 * GET /api/reports/income-sources
 * Source-wise income breakdown with percentages
 */
const getIncomeSources = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const pool = getPool();

    let query = 'SELECT source, SUM(amount) AS total FROM incomes WHERE user_id = ?';
    const params = [userId];

    if (startDate && startDate !== '') {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate && endDate !== '') {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY source ORDER BY total DESC';

    const [rows] = await pool.query(query, params);

    const totalIncomeSum = rows.reduce((acc, curr) => acc + parseFloat(curr.total), 0);

    const sources = rows.map((item) => {
      const amount = parseFloat(item.total);
      const percentage = totalIncomeSum > 0 ? Number(((amount / totalIncomeSum) * 100).toFixed(2)) : 0;
      return {
        source: item.source,
        amount,
        percentage,
      };
    });

    return res.status(200).json({
      success: true,
      totalIncome: totalIncomeSum,
      sources,
    });
  } catch (error) {
    console.error('[GetIncomeSources Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch income sources.',
    });
  }
};

/**
 * GET /api/reports/analytics
 * Highest spending category, Highest single expense, Month-over-Month comparison, Financial Health Score, Insights
 */
const getReportAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    const pool = getPool();

    // 1. Highest Spending Category
    let catQuery = 'SELECT category, SUM(amount) AS total FROM expenses WHERE user_id = ?';
    const catParams = [userId];
    if (startDate) { catQuery += ' AND date >= ?'; catParams.push(startDate); }
    if (endDate) { catQuery += ' AND date <= ?'; catParams.push(endDate); }
    catQuery += ' GROUP BY category ORDER BY total DESC LIMIT 1';

    const [topCatRows] = await pool.query(catQuery, catParams);
    const highestExpenseCategory = topCatRows.length > 0
      ? { category: topCatRows[0].category, amount: parseFloat(topCatRows[0].total) }
      : null;

    // 2. Highest Single Expense
    let singleQuery = 'SELECT category, amount, date, description FROM expenses WHERE user_id = ?';
    const singleParams = [userId];
    if (startDate) { singleQuery += ' AND date >= ?'; singleParams.push(startDate); }
    if (endDate) { singleQuery += ' AND date <= ?'; singleParams.push(endDate); }
    singleQuery += ' ORDER BY amount DESC LIMIT 1';

    const [singleRows] = await pool.query(singleQuery, singleParams);
    const highestSingleExpense = singleRows.length > 0
      ? {
          category: singleRows[0].category,
          amount: parseFloat(singleRows[0].amount),
          date: new Date(singleRows[0].date).toISOString().split('T')[0],
          description: singleRows[0].description,
        }
      : null;

    // 3. Month-over-Month Comparison
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonthKey = prevDate.toISOString().slice(0, 7);

    const [currInc] = await pool.query("SELECT COALESCE(SUM(amount), 0) AS val FROM incomes WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?", [userId, currentMonthKey]);
    const [prevInc] = await pool.query("SELECT COALESCE(SUM(amount), 0) AS val FROM incomes WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?", [userId, prevMonthKey]);

    const [currExp] = await pool.query("SELECT COALESCE(SUM(amount), 0) AS val FROM expenses WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?", [userId, currentMonthKey]);
    const [prevExp] = await pool.query("SELECT COALESCE(SUM(amount), 0) AS val FROM expenses WHERE user_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?", [userId, prevMonthKey]);

    const cIncVal = parseFloat(currInc[0].val);
    const pIncVal = parseFloat(prevInc[0].val);
    const cExpVal = parseFloat(currExp[0].val);
    const pExpVal = parseFloat(prevExp[0].val);

    const cSavVal = cIncVal - cExpVal;
    const pSavVal = pIncVal - pExpVal;

    const calcChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Number((((curr - prev) / Math.abs(prev)) * 100).toFixed(1));
    };

    const monthOverMonth = {
      incomeChange: calcChange(cIncVal, pIncVal),
      expenseChange: calcChange(cExpVal, pExpVal),
      savingsChange: calcChange(cSavVal, pSavVal),
    };

    // 4. Financial Health Score (0 to 100)
    const [totIncRows] = await pool.query('SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM incomes WHERE user_id = ?', [userId]);
    const [totExpRows] = await pool.query('SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses WHERE user_id = ?', [userId]);

    const overallIncome = parseFloat(totIncRows[0].totalIncome);
    const overallExpenses = parseFloat(totExpRows[0].totalExpenses);
    const overallSavings = overallIncome - overallExpenses;
    const overallSavingsRate = overallIncome > 0 ? (overallSavings / overallIncome) * 100 : 0;

    let score = 0;
    // Savings Rate (up to 40 pts)
    if (overallSavingsRate >= 30) score += 40;
    else if (overallSavingsRate >= 20) score += 30;
    else if (overallSavingsRate >= 10) score += 20;
    else if (overallSavingsRate > 0) score += 10;

    // Expense Control (up to 30 pts)
    const expenseRatio = overallIncome > 0 ? (overallExpenses / overallIncome) * 100 : 100;
    if (expenseRatio <= 70) score += 30;
    else if (expenseRatio <= 80) score += 20;
    else if (expenseRatio <= 100) score += 10;

    // Positive Savings (20 pts)
    if (overallSavings > 0) score += 20;

    // Income Stability (10 pts)
    const [stabilityRows] = await pool.query(
      "SELECT COUNT(DISTINCT DATE_FORMAT(date, '%Y-%m')) AS activeMonths FROM incomes WHERE user_id = ? AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)",
      [userId]
    );
    if (parseInt(stabilityRows[0].activeMonths, 10) >= 3) score += 10;

    let status = 'Needs Attention';
    if (score >= 85) status = 'Excellent';
    else if (score >= 70) status = 'Good';
    else if (score >= 40) status = 'Fair';

    const financialHealth = {
      score,
      status,
      explanation: `Calculated from your overall savings rate (${overallSavingsRate.toFixed(1)}%), expense control ratio (${expenseRatio.toFixed(1)}%), and income stability.`,
    };

    // 5. Dynamic Financial Insights
    const insights = [];

    if (overallSavingsRate >= 30) {
      insights.push('Your savings rate is strong! You are saving over 30% of your total income.');
    } else if (overallSavingsRate >= 20) {
      insights.push('Your savings rate is healthy (20%-30%), leaving room for investment goals.');
    } else if (overallSavingsRate >= 10) {
      insights.push('Consider reducing non-essential expenses to push your savings rate above 20%.');
    } else if (overallSavingsRate > 0) {
      insights.push('Your savings are low compared with your total income. Review spending categories.');
    } else {
      insights.push('Warning: Your overall expenses equal or exceed your total income.');
    }

    if (highestExpenseCategory) {
      insights.push(`Your highest spending category is "${highestExpenseCategory.category}" with ₹${highestExpenseCategory.amount.toLocaleString('en-IN')}.`);
    }

    if (monthOverMonth.expenseChange > 0) {
      insights.push(`Your monthly expenses increased by ${monthOverMonth.expenseChange}% compared with last month.`);
    } else if (monthOverMonth.expenseChange < 0) {
      insights.push(`Great job! Your monthly expenses decreased by ${Math.abs(monthOverMonth.expenseChange)}% compared with last month.`);
    }

    return res.status(200).json({
      success: true,
      analytics: {
        highestExpenseCategory,
        highestSingleExpense,
        monthOverMonth,
        financialHealth,
        insights,
      },
    });
  } catch (error) {
    console.error('[GetReportAnalytics Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate financial analytics.',
    });
  }
};

module.exports = {
  getReportSummary,
  getMonthlyReports,
  getExpenseCategories,
  getIncomeSources,
  getReportAnalytics,
};
