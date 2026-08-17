# MoneyNote — Security Architecture Documentation

Security, privacy, and data protection are fundamental pillars of the **MoneyNote Personal Finance Tracker**.

---

## 🔒 Security Core Principles

### 1. Authentication & Session Management
- **Password Hashing**: User passwords are encrypted using `bcryptjs` with 10 salt rounds prior to storage. Plaintext passwords are never logged or stored.
- **JWT Authorization**: Requests to protected financial endpoints require a valid `Bearer` JSON Web Token signed with a secure secret.
- **Header Guards**: Tokens are automatically validated by `authMiddleware.js` on every request.

---

### 2. Strict User Data Isolation
- **No Cross-User Leakage**: User ID (`req.user.id`) is strictly extracted server-side from the verified JWT token. The server never accepts `user_id` parameters from request body or query parameters.
- **Database Boundary Isolation**: Every SQL query (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) enforces `WHERE user_id = req.user.id`. User A cannot view, modify, or export User B's financial data.

---

### 3. SQL Injection Prevention
- All database queries interact with MySQL via `mysql2/promise` prepared statements with parameterized placeholders (`?`).
- User input is never concatenated directly into raw SQL strings.

---

### 4. Backup & Export Security
- **Credential Exclusion**: Passwords, JWT secrets, and internal database keys are strictly excluded from JSON backups, CSV exports, and PDF reports.
- **Transaction Safety**: Backup restoration uses MySQL connection transactions (`BEGIN`, `COMMIT`, `ROLLBACK`). If any record fails validation during restore, the entire operation rolls back safely.
- **Safe Replace Mode**: `Replace` mode only deletes financial application records (`incomes`, `expenses`, `budgets`, `savings_goals`, `notes`, `recurring_transactions`). User authentication credentials in `users` are preserved.

---

### 5. Input Validation & XSS Defense
- User-supplied inputs (names, note contents, titles, descriptions) are rendered safely by React without using `dangerouslySetInnerHTML`.
- Max upload limits (10 MB) prevent memory overflow attacks.

---

### 6. CORS & Environment Security
- CORS origin permissions restrict API access exclusively to the authorized frontend domain.
- All database credentials, secrets, and keys are stored in backend `.env` files and excluded from Git via `.gitignore`.
