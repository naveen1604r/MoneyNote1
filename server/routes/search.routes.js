const express = require('express');
const router = express.Router();
const { searchFinance } = require('../controllers/search.controller');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', searchFinance);

module.exports = router;
