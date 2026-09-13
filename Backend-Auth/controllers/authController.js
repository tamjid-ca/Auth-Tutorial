const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Signs a short-lived JWT access token containing the user's id and role.
 * Access tokens are intentionally short-lived (default: 15 minutes) so that
 * a compromised token has a limited blast radius.
 */
const signAccessToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

/**
 * Signs a long-lived refresh token containing only the user's id.
 * The refresh token is stored in the database so it can be revoked on logout.
 */
const signRefreshToken = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 *
 * 1. Validate request body (express-validator)
 * 2. Check if email is already in use
 * 3. Hash the password with bcryptjs (salt rounds = 12)
 * 4. Save the new user to MongoDB
 * 5. Return the created user (without the password)
 */
exports.register = async (req, res) => {
  // 1. Input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // 2. Duplicate email check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    // 3. Hash the password — never store plain-text passwords!
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Save user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5. Return user (exclude sensitive fields)
    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
};

/**
 * POST /api/auth/login
 *
 * 1. Validate request body
 * 2. Find user by email
 * 3. Compare submitted password against stored hash using bcrypt
 * 4. Sign access token + refresh token
 * 5. Save the refresh token to the user's DB record (for revocation)
 * 6. Return both tokens to the client
 */
exports.login = async (req, res) => {
  // 1. Input validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // 2. Look up user
    const user = await User.findOne({ email });
    if (!user) {
      // Use a generic message to avoid revealing whether the email exists
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    // 4. Sign tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // 5. Persist refresh token to DB for revocation support
    user.refreshToken = refreshToken;
    await user.save();

    // 6. Return tokens
    res.status(200).json({
      message: 'Login successful.',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

/**
 * POST /api/auth/refresh
 *
 * Accepts a valid refresh token and issues a brand-new access token.
 * This is the "token rotation" pattern — the client calls this endpoint
 * when their short-lived access token expires.
 *
 * 1. Extract refresh token from request body
 * 2. Verify the JWT signature using the REFRESH secret
 * 3. Find the user and confirm the stored token matches (prevents reuse after logout)
 * 4. Issue a new access token
 */
exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required.' });
  }

  try {
    // 2. Verify signature
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 3. Find user and check stored token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid or revoked refresh token.' });
    }

    // 4. Issue new access token
    const newAccessToken = signAccessToken(user);

    res.status(200).json({
      message: 'Access token refreshed.',
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};

/**
 * POST /api/auth/logout
 *
 * Revokes the refresh token by clearing it from the database.
 * After this, any attempt to use the old refresh token will be rejected
 * by the /refresh endpoint's DB check (step 3 above).
 *
 * 1. Extract refresh token from request body
 * 2. Find the user who owns it
 * 3. Clear the stored refresh token
 */
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required to logout.' });
  }

  try {
    // Find and clear token
    const user = await User.findOneAndUpdate(
      { refreshToken },
      { refreshToken: null }
    );

    if (!user) {
      // Token not found — treat as already logged out
      return res.status(200).json({ message: 'Logged out.' });
    }

    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout.', error: error.message });
  }
};
