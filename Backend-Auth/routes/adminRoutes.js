const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const userController = require('../controllers/userController');

// GET /api/admin/dashboard — requires valid token AND role = 'admin'
router.get('/dashboard', protect, requireRole('admin'), userController.getAdminDashboard);

module.exports = router;
