const express = require('express');
const router = express.Router();
const { getUsers, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Route protected yang memerlukan autentikasi
router.get('/', protect, getUsers);
router.put('/profile', protect, updateUserProfile);

module.exports = router;