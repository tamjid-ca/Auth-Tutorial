const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
});

/**
 * User Schema
 *
 * - email is stored lowercase and must be unique
 * - password is NEVER stored as plain text — it is hashed by bcryptjs in the controller
 * - refreshToken stores the latest issued refresh token for revocation on logout
 * - role supports 'user' (default) and 'admin' for role-based authorization
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Stored so we can invalidate it server-side on logout
    refreshToken: {
      type: String,
      default: null,
    },
    // Array of user addresses
    addresses: [addressSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
