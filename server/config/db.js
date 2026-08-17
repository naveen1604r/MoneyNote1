const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DATABASE_HOST || 'localhost';
const dbPort = Number(process.env.DATABASE_PORT) || 3306;
const dbUser = process.env.DATABASE_USER || 'root';
const dbPassword = process.env.DATABASE_PASSWORD || '';
const dbName = process.env.DATABASE_NAME || 'moneynote_db';

let pool;

const initializeDatabase = async () => {
  try {
    // 1. Connect without database selected to ensure DB exists
    const rootConnection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
    });

    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await rootConnection.end();

    // 2. Create connection pool using target database
    pool = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true,
    });

    // 3. Create users table if not exists
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NULL,
        avatar_url TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createUsersTableSQL);

    try {
      await pool.query('ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER password;');
    } catch (e) { /* Column already exists */ }
    try {
      await pool.query('ALTER TABLE users ADD COLUMN avatar_url TEXT NULL AFTER phone;');
    } catch (e) { /* Column already exists */ }
    try {
      await pool.query('ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE AFTER avatar_url;');
    } catch (e) { /* Column already exists */ }

    // 4. Create incomes table with recurring columns & unique constraint
    const createIncomesTableSQL = `
      CREATE TABLE IF NOT EXISTS incomes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        source VARCHAR(100) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        date DATE NOT NULL,
        description TEXT NULL,
        recurring_transaction_id INT NULL,
        recurring_occurrence_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createIncomesTableSQL);

    try {
      await pool.query('ALTER TABLE incomes ADD COLUMN recurring_transaction_id INT NULL AFTER description;');
    } catch (e) { /* Column already exists */ }
    try {
      await pool.query('ALTER TABLE incomes ADD COLUMN recurring_occurrence_date DATE NULL AFTER recurring_transaction_id;');
    } catch (e) { /* Column already exists */ }
    try {
      await pool.query('ALTER TABLE incomes ADD UNIQUE KEY uq_inc_rec (recurring_transaction_id, recurring_occurrence_date);');
    } catch (e) { /* Key already exists */ }

    // 5. Create expenses table with recurring columns & unique constraint
    const createExpensesTableSQL = `
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        date DATE NOT NULL,
        description TEXT NULL,
        recurring_transaction_id INT NULL,
        recurring_occurrence_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date_cat (user_id, date, category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createExpensesTableSQL);

    try {
      await pool.query('ALTER TABLE expenses ADD COLUMN recurring_transaction_id INT NULL AFTER description;');
    } catch (e) { /* Column already exists */ }
    try {
      await pool.query('ALTER TABLE expenses ADD COLUMN recurring_occurrence_date DATE NULL AFTER recurring_transaction_id;');
    } catch (e) { /* Column already exists */ }
    try {
      await pool.query('ALTER TABLE expenses ADD UNIQUE KEY uq_exp_rec (recurring_transaction_id, recurring_occurrence_date);');
    } catch (e) { /* Key already exists */ }

    // 6. Create savings_goals table
    const createSavingsGoalsTableSQL = `
      CREATE TABLE IF NOT EXISTS savings_goals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        goal_name VARCHAR(150) NOT NULL,
        target_amount DECIMAL(12,2) NOT NULL,
        target_date DATE NOT NULL,
        description TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_target (user_id, target_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createSavingsGoalsTableSQL);

    // 7. Create notes table
    const createNotesTableSQL = `
      CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(12,2) NULL,
        note_date DATE NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_cat_date_pin (user_id, category, note_date, is_pinned)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createNotesTableSQL);

    // 8. Create user_settings table
    const createUserSettingsTableSQL = `
      CREATE TABLE IF NOT EXISTS user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        currency VARCHAR(10) DEFAULT 'INR',
        date_format VARCHAR(30) DEFAULT 'DD MMM YYYY',
        theme VARCHAR(20) DEFAULT 'system',
        email_notifications BOOLEAN DEFAULT TRUE,
        expense_alerts BOOLEAN DEFAULT TRUE,
        savings_updates BOOLEAN DEFAULT TRUE,
        bill_reminders BOOLEAN DEFAULT TRUE,
        financial_tips BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createUserSettingsTableSQL);

    // 9. Create notifications table
    const createNotificationsTableSQL = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_read (user_id, is_read, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createNotificationsTableSQL);

    // 10. Create reminders table
    const createRemindersTableSQL = `
      CREATE TABLE IF NOT EXISTS reminders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NULL,
        reminder_date DATE NOT NULL,
        reminder_time TIME NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_rem (user_id, reminder_date, is_completed)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createRemindersTableSQL);

    // 11. Create budgets table
    const createBudgetsTableSQL = `
      CREATE TABLE IF NOT EXISTS budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uq_user_cat_month_year (user_id, category, month, year),
        INDEX idx_user_month_year_cat (user_id, month, year, category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createBudgetsTableSQL);

    // 12. Create recurring_transactions table
    const createRecurringTransactionsTableSQL = `
      CREATE TABLE IF NOT EXISTS recurring_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(20) NOT NULL,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        frequency VARCHAR(30) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NULL,
        next_occurrence DATE NOT NULL,
        last_generated_at DATETIME NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_type_next_active (user_id, type, next_occurrence, is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createRecurringTransactionsTableSQL);

    // 13. Create export_history table
    const createExportHistoryTableSQL = `
      CREATE TABLE IF NOT EXISTS export_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        export_type VARCHAR(50) NOT NULL,
        format VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_export (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    await pool.query(createExportHistoryTableSQL);

    console.log('[Database] MySQL connection successful');
    console.log('[Database] 11 tables verified');
    return pool;
  } catch (error) {
    console.error('[Database Error] Failed to connect to MySQL:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error(`[Database Hint] Make sure MySQL is running on ${dbHost}:${dbPort}. You can start local MySQL with: npm run db:start`);
    }
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database pool has not been initialized. Call initializeDatabase first.');
  }
  return pool;
};

module.exports = {
  initializeDatabase,
  getPool,
};
