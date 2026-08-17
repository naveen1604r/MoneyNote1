const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  completeOnboarding,
  changePassword,
  deleteAccount,
} = require('../controllers/profile.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/complete-onboarding', completeOnboarding);
router.post('/change-password', changePassword);
router.delete('/account', deleteAccount);

module.exports = router;
