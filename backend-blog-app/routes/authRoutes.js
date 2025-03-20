// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth routes
router.post('/login', login);
router.get('/profile', protect, getUserProfile);

module.exports = router;