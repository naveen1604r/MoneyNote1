const express = require('express');
const router = express.Router();
const {
  createRecurringTransaction,
  getRecurringTransactions,
  getRecurringTransactionById,
  updateRecurringTransaction,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
  deleteRecurringTransaction,
  processRecurringTransactionsApi,
} = require('../controllers/recurring.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getRecurringTransactions);
router.post('/', createRecurringTransaction);
router.post('/process', processRecurringTransactionsApi);
router.get('/:id', getRecurringTransactionById);
router.put('/:id', updateRecurringTransaction);
router.delete('/:id', deleteRecurringTransaction);
router.patch('/:id/pause', pauseRecurringTransaction);
router.patch('/:id/resume', resumeRecurringTransaction);

module.exports = router;
