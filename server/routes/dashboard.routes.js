const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getDashboardData);

module.exports = router;
