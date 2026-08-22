const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// GET /api/users/profile — requires a valid access token
router.get('/profile', protect, userController.getProfile);

module.exports = router;
