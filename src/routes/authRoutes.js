const express = require('express');
const router = express.Router();
const { loginUser, checkAuth } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', loginUser);
router.get('/check', authMiddleware, checkAuth);

module.exports = router;