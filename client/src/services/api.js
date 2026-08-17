import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('moneynote_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('moneynote_token');
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Export & Backup API Service methods
export const downloadIncomeCSV = (params = {}) => api.get('/export/income/csv', { params, responseType: 'blob' });
export const downloadExpensesCSV = (params = {}) => api.get('/export/expenses/csv', { params, responseType: 'blob' });
export const downloadBudgetsCSV = () => api.get('/export/budgets/csv', { responseType: 'blob' });
export const downloadGoalsCSV = () => api.get('/export/savings-goals/csv', { responseType: 'blob' });
export const downloadNotesCSV = () => api.get('/export/notes/csv', { responseType: 'blob' });
export const downloadRecurringCSV = () => api.get('/export/recurring/csv', { responseType: 'blob' });
export const downloadPDFReport = (params = {}) => api.get('/export/report/pdf', { params, responseType: 'blob' });
export const downloadJSONBackup = () => api.get('/backup/export', { responseType: 'blob' });

export const previewBackup = (formData) => api.post('/backup/preview', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const restoreBackup = (formData) => api.post('/backup/restore', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const getExportHistory = () => api.get('/export/history');

// Consolidated Search API Service method
export const searchFinance = (params = {}) => api.get('/search', { params });

// Consolidated Dashboard API Service method
export const getDashboardData = (month = '', year = '') => api.get('/dashboard', { params: { month, year } });

// Income API Service methods
export const getIncomes = (params = {}) => api.get('/incomes', { params });
export const getIncomeSummary = (month = '') => api.get('/incomes/summary', { params: { month } });
export const getIncome = (id) => api.get(`/incomes/${id}`);
export const createIncome = (data) => api.post('/incomes', data);
export const updateIncome = (id, data) => api.put(`/incomes/${id}`, data);
export const deleteIncome = (id) => api.delete(`/incomes/${id}`);

// Expense API Service methods
export const getExpenses = (params = {}) => api.get('/expenses', { params });
export const getExpenseSummary = (month = '') => api.get('/expenses/summary', { params: { month } });
export const getExpenseCategories = (month = '') => api.get('/expenses/categories', { params: { month } });
export const getExpense = (id) => api.get(`/expenses/${id}`);
export const createExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// Savings API Service methods
export const getSavingsSummary = () => api.get('/savings/summary');
export const getMonthlySavings = (month = '') => api.get('/savings/monthly', { params: { month } });
export const getMonthlySavingsHistory = () => api.get('/savings/monthly-history');
export const getSavingsGoals = () => api.get('/savings/goals');
export const createSavingsGoal = (data) => api.post('/savings/goals', data);
export const updateSavingsGoal = (id, data) => api.put(`/savings/goals/${id}`, data);
export const deleteSavingsGoal = (id) => api.delete(`/savings/goals/${id}`);

// Notes API Service methods
export const getNotes = (params = {}) => api.get('/notes', { params });
export const getNotesSummary = () => api.get('/notes/summary');
export const getNote = (id) => api.get(`/notes/${id}`);
export const createNote = (data) => api.post('/notes', data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}`);
export const toggleNotePin = (id) => api.patch(`/notes/${id}/pin`);

// Report API Service methods
export const getReportSummary = (startDate = '', endDate = '') => api.get('/reports/summary', { params: { startDate, endDate } });
export const getMonthlyReports = (startDate = '', endDate = '') => api.get('/reports/monthly', { params: { startDate, endDate } });
export const getReportExpenseCategories = (startDate = '', endDate = '') => api.get('/reports/expense-categories', { params: { startDate, endDate } });
export const getReportIncomeSources = (startDate = '', endDate = '') => api.get('/reports/income-sources', { params: { startDate, endDate } });
export const getReportAnalytics = (startDate = '', endDate = '') => api.get('/reports/analytics', { params: { startDate, endDate } });

// Profile API Service methods
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const completeOnboarding = () => api.post('/profile/complete-onboarding');
export const changePassword = (data) => api.post('/profile/change-password', data);
export const deleteAccount = (data) => api.delete('/profile/account', { data });

// Settings API Service methods
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);

// Notification API Service methods
export const getNotifications = () => api.get('/notifications');
export const getUnreadNotificationCount = () => api.get('/notifications/unread-count');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

// Reminder API Service methods
export const getReminders = () => api.get('/reminders');
export const createReminder = (data) => api.post('/reminders', data);
export const updateReminder = (id, data) => api.put(`/reminders/${id}`, data);
export const deleteReminder = (id) => api.delete(`/reminders/${id}`);
export const completeReminder = (id) => api.patch(`/reminders/${id}/complete`);

// Budget API Service methods
export const getBudgets = (month = '', year = '') => api.get('/budgets', { params: { month, year } });
export const createBudget = (data) => api.post('/budgets', data);
export const updateBudget = (id, data) => api.put(`/budgets/${id}`, data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);
export const getBudgetSummary = (month = '', year = '') => api.get('/budgets/summary', { params: { month, year } });
export const getBudgetAnalytics = (month = '', year = '') => api.get('/budgets/analytics', { params: { month, year } });

// Recurring Transaction API Service methods
export const getRecurringTransactions = () => api.get('/recurring-transactions');
export const createRecurringTransaction = (data) => api.post('/recurring-transactions', data);
export const updateRecurringTransaction = (id, data) => api.put(`/recurring-transactions/${id}`, data);
export const deleteRecurringTransaction = (id) => api.delete(`/recurring-transactions/${id}`);
export const pauseRecurringTransaction = (id) => api.patch(`/recurring-transactions/${id}/pause`);
export const resumeRecurringTransaction = (id) => api.patch(`/recurring-transactions/${id}/resume`);
export const processRecurringTransactions = () => api.post('/recurring-transactions/process');

export default api;
