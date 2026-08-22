/**
 * requireRole middleware factory
 *
 * Returns a middleware function that checks whether the authenticated user's
 * role is included in the allowed roles list.
 *
 * Must be used AFTER the `protect` middleware (which sets req.user).
 *
 * Usage:
 *   router.get('/dashboard', protect, requireRole('admin'), controller.fn);
 *   router.get('/reports',   protect, requireRole('admin', 'manager'), controller.fn);
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Required role(s): ${roles.join(', ')}.`,
      });
    }
    next();
  };
};

module.exports = { requireRole };
