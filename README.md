# MoneyNote — Personal Finance Tracker

**MoneyNote** is a modern, full-stack personal finance command center designed to give users complete control over their incomes, expenses, budgets, savings goals, finance notes, recurring transactions, analytics reports, and data backups.

---

## 🌟 Key Features

1. **User Authentication & Privacy**: Secure JWT authentication, password hashing (`bcrypt`), profile management, and strict database user isolation.
2. **Advanced Consolidated Dashboard**: Consolidated command center (`GET /api/dashboard`) returning balance, income, expenses, savings rate, 6-month Recharts trends, budget usage, top spending categories, recent transactions, savings goals, upcoming recurring items, notes, unread notifications, financial health score (0-100), and dynamic financial insights.
3. **Income Management**: Full CRUD operations for income streams, categories (`Salary`, `Freelance`, `Business`, `Bonus`, `Investment`, `Interest`, `Gift`, `Other`), date filtering, searching, sorting, and summary metrics.
4. **Expense Management**: Full CRUD operations for expenses across 15 spending categories with category icons, search, month filtering, and spending breakdowns.
5. **Savings & Financial Calculations**: Mathematical savings calculations (`Balance = Income - Expenses`, `Savings = Income - Expenses`, `Savings Rate = (Savings / Income) * 100`), monthly savings history, and Savings Goals tracking with target dates and completion indicators.
6. **Budget Management & Spending Limits**: Monthly category budget targets, spent vs remaining calculations, budget usage percentages, and visual warning status alerts (`safe`, `warning`, `critical`, `exceeded`).
7. **Finance Notes Management**: Notes system for saving personal budget plans, investment notes, bill reminders, category tags, amounts, date filters, and pinned notes.
8. **Automated Recurring Transactions**: Idempotent daily background generation engine for recurring incomes and expenses (Daily, Weekly, Monthly, Yearly) with catch-up mode, unique key generation constraints (`uq_inc_rec`, `uq_exp_rec`), pause, and resume capabilities.
9. **Reports & Analytics**: Visual analytics powered by Recharts (Income vs Expenses, Monthly Trends, Category Distribution, Financial Health Score, CSV & PDF exports).
10. **Notifications & Reminders**: Real-time notification bell dropdown, unread count polling, bill payment reminders, and custom preferences.
11. **Global Search & Advanced Filters**: Live debounced Navbar search preview and dedicated `/search` page supporting multi-table parameterized queries (`incomes`, `expenses`, `notes`, `recurring_transactions`), URL query string persistence, filter chips, tabs, and pagination.
12. **Export & Backup System**: Single-click CSV exports for all modules, server-side PDFKit financial executive report streaming, complete version `1.0` JSON backup export, and transaction-backed restore supporting both non-destructive `Merge` mode and `Replace` mode.
13. **User Profile & Settings**: Global currency settings (`INR`, `USD`, `EUR`, `GBP`), date format preferences, theme switching (`System`, `Light`, `Dark`), and notification preferences.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Axios, Recharts, Lucide React, Tailwind CSS, Vite.
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, MySQL2 (`mysql2/promise`), `pdfkit`, `multer`, `node-cron`.
- **Database**: MySQL 8.0 instance running locally or hosted on cloud.

---

## 📁 Project Structure

```
moneynote/
├── client/                      # Frontend Application (Vite + React + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable Components
│   │   │   ├── budget/          # Budget Modals, Month Selector, Cards, Charts
│   │   │   ├── common/          # Button, Modal, Toast, ErrorBoundary, NotificationBell, Skeletons
│   │   │   ├── dashboard/       # Charts, Health Card, Quick Actions, Insight Card
│   │   │   ├── export/          # Export Cards, Filter Panel, Restore Modal
│   │   │   ├── expense/         # Expense Modals & Cards
│   │   │   ├── income/          # Income Modals & Cards
│   │   │   ├── layout/          # Navbar & Sidebar Navigation
│   │   │   ├── notes/           # Note Modals & Cards
│   │   │   ├── recurring/       # Recurring Templates & Upcoming Cards
│   │   │   ├── routes/          # Protected & Public Route Guards
│   │   │   ├── savings/         # Savings Goals Cards & Modals
│   │   │   └── search/          # Search Tabs, Dropdown, Filters, Pagination
│   │   ├── context/             # AuthContext, ThemeContext, SettingsContext
   │   ├── pages/               # 14 Full Application Pages
   │   ├── services/            # Axios API Client (`api.js`)
   │   ├── routes/              # React Router Navigation AppRoutes.jsx
   │   └── main.jsx             # Entrypoint wrapped in ErrorBoundary
   └── .env.example
├── server/                      # Backend API Application (Express + Node.js)
│   ├── config/                  # MySQL Database Pool & Schema Initialization (`db.js`)
│   ├── controllers/             # Express Controllers for 14 Modules
│   ├── middleware/              # Auth Middleware JWT verification (`authMiddleware.js`)
│   ├── routes/                  # Express Router Endpoints
│   ├── utils/                   # Idempotent Scheduler Engine (`scheduler.js`)
│   ├── server.js                # Express Application Server
│   └── .env.example
├── README.md
├── DEPLOYMENT.md
├── SECURITY.md
└── FINAL_TEST_REPORT.md
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=production
DATABASE_HOST=localhost
DATABASE_PORT=3307
DATABASE_USER=root
DATABASE_PASSWORD=
DATABASE_NAME=moneynote_db
JWT_SECRET=moneynote_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Development Quickstart

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 🛡️ Security Highlights

- **User Isolation**: All SQL queries filter strictly by `req.user.id` extracted from verified JWT tokens.
- **Prepared Statements**: Parameterized SQL queries prevent SQL injection vulnerabilities.
- **Credential Protection**: Passwords are hashed with `bcrypt` (10 rounds); JSON backups and exports strictly exclude passwords, tokens, and internal user IDs.
- **Transaction Protection**: Backup restoration uses MySQL transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) to prevent data corruption.
