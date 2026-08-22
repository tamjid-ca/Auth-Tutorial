const jwt = require('jsonwebtoken');

/**
 * protect middleware
 *
 * Validates the Bearer access token from the Authorization header.
 * On success, attaches the decoded payload ({ id, role }) to req.user
 * so downstream controllers and role middleware can use it.
 *
 * Usage:
 *   router.get('/profile', protect, userController.getProfile);
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Expect: "Authorization: Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired access token.' });
  }
};

module.exports = { protect };
