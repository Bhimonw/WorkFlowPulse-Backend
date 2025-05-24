const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Route untuk register dan login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Route protected yang memerlukan autentikasi
router.get('/me', protect, getUserProfile);

module.exports = router;