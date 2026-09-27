const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// GET /api/users/profile — requires a valid access token
router.get('/profile', protect, userController.getProfile);

// Address routes
router.post('/address', protect, userController.addAddress);
router.put('/address/:addressId', protect, userController.updateAddress);
router.delete('/address/:addressId', protect, userController.deleteAddress);

module.exports = router;
