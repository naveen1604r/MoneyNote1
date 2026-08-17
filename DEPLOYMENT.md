# MoneyNote — Production Deployment Guide

This guide details step-by-step instructions for deploying the **MoneyNote Personal Finance Tracker** application to production environments using Vercel (Frontend), Render / Railway (Backend), and a production MySQL-compatible database.

---

## 📋 Deployment Prerequisites

1. **Frontend Hosting**: Vercel or Netlify.
2. **Backend Hosting**: Render, Railway, AWS App Runner, or Heroku.
3. **Database Hosting**: PlanetScale, Aiven, Railway MySQL, AWS RDS, or DigitalOcean Managed MySQL.
4. **Git Repository**: GitHub or GitLab repository containing frontend and backend code.

---

## 1️⃣ Step 1: Database Provisioning

1. Provision a production MySQL 8.0 instance on your database provider.
2. Retrieve connection parameters:
   - `DATABASE_HOST`
   - `DATABASE_PORT` (Default: `3306` or `3307`)
   - `DATABASE_USER`
   - `DATABASE_PASSWORD`
   - `DATABASE_NAME` (e.g. `moneynote_db`)
3. MoneyNote automatically initializes all 11 required tables (`users`, `incomes`, `expenses`, `savings_goals`, `notes`, `user_settings`, `notifications`, `reminders`, `budgets`, `recurring_transactions`, `export_history`) on first server launch.

---

## 2️⃣ Step 2: Backend Deployment (Render / Railway)

1. Connect your repository to Render/Railway and select the `server` directory as root.
2. Set Environment Variables in your backend service configuration:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_HOST=your-mysql-host.com
   DATABASE_PORT=3306
   DATABASE_USER=your_db_user
   DATABASE_PASSWORD=your_secure_db_password
   DATABASE_NAME=moneynote_db
   JWT_SECRET=a_very_long_secure_random_jwt_secret_key_2026
   CLIENT_URL=https://your-frontend-app.vercel.app
   ```
3. Set Build Command: `npm install`
4. Set Start Command: `node server.js`
5. Deploy Backend Service and copy the assigned live URL (e.g., `https://moneynote-backend.onrender.com`).
6. Verify Health Check Endpoint: `GET https://moneynote-backend.onrender.com/api/health`.

---

## 3️⃣ Step 3: Frontend Deployment (Vercel)

1. Connect your repository to Vercel and set the Root Directory to `client`.
2. Set Environment Variable in Vercel settings:
   ```env
   VITE_API_URL=https://moneynote-backend.onrender.com/api
   ```
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy Frontend. Once finished, Vercel will provide your live URL (e.g. `https://moneynote-app.vercel.app`).
6. Update `CLIENT_URL` in backend environment settings with your live Vercel domain to configure CORS permissions.

---

## 4️⃣ Step 4: Post-Deployment Smoke Test Checklist

- [ ] Open live frontend application URL in web browser.
- [ ] Register a new user account.
- [ ] Log out and log in again to verify JWT authentication persistence.
- [ ] Add an Income record (e.g. ₹50,000) and Expense record (e.g. ₹15,000).
- [ ] Verify Dashboard updates balance to ₹35,000 and savings rate to 70%.
- [ ] Set a monthly Budget and verify status threshold indicators.
- [ ] Perform a Global Search query.
- [ ] Download an Expense CSV export and PDF Executive Financial Statement.
- [ ] Generate a complete JSON backup download.
- [ ] Test JSON backup restoration in Merge mode.

---

## 🔄 Rollback Strategy

1. **Database Rollback**: Take automated daily snapshots before major schema updates. Restore previous snapshot if a migration fails.
2. **Backend Rollback**: Roll back to the previous successful deployment commit in Render/Railway dashboard.
3. **Frontend Rollback**: Instant one-click rollback to the previous deployment build in Vercel dashboard.
