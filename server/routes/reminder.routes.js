const express = require('express');
const router = express.Router();
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleComplete,
} = require('../controllers/reminder.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getReminders);
router.post('/', createReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.patch('/:id/complete', toggleComplete);

module.exports = router;
