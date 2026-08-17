const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./config/db');
const { initScheduler } = require('./utils/scheduler');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const incomeRoutes = require('./routes/income.routes');
const expenseRoutes = require('./routes/expense.routes');
const savingsRoutes = require('./routes/savings.routes');
const notesRoutes = require('./routes/notes.routes');
const reportRoutes = require('./routes/report.routes');
const profileRoutes = require('./routes/profile.routes');
const settingsRoutes = require('./routes/settings.routes');
const notificationRoutes = require('./routes/notification.routes');
const reminderRoutes = require('./routes/reminder.routes');
const budgetRoutes = require('./routes/budget.routes');
const recurringRoutes = require('./routes/recurring.routes');
const searchRoutes = require('./routes/search.routes');
const exportRoutes = require('./routes/export.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware with 10MB payload limit for profile avatar uploads & JSON backups
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recurring-transactions', recurringRoutes);
app.use('/api/search', searchRoutes);
app.use('/api', exportRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('MoneyNote Backend Server');
});

// Start Server & Init DB & Scheduler
const startServer = async () => {
  try {
    await initializeDatabase();
    initScheduler();

    const server = app.listen(PORT, () => {
      console.log(`[Server] Running on port ${PORT}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
      } else {
        console.error('[Server Error] HTTP Server error:', error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server due to database error:', error.message);
    process.exit(1);
  }
};

startServer();
