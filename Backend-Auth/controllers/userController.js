const User = require('../models/User');

/**
 * GET /api/users/profile
 *
 * Returns the authenticated user's profile.
 * The `protect` middleware has already verified the JWT and set req.user.
 * We fetch the full user from DB to return up-to-date data,
 * excluding the password and refresh token for security.
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile.', error: error.message });
  }
};

/**
 * GET /api/admin/dashboard
 *
 * Admin-only endpoint.
 * The `protect` middleware verified the JWT, and the `requireRole('admin')`
 * middleware confirmed the user has the admin role before reaching here.
 */
exports.getAdminDashboard = (req, res) => {
  res.status(200).json({
    message: 'Welcome to the admin dashboard.',
    admin: {
      id: req.user.id,
      role: req.user.role,
    },
  });
};
