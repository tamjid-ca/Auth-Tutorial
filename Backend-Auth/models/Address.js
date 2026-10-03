const mongoose = require('mongoose');

/**
 * Address Schema
 *
 * - Each address belongs to exactly one user (`user` reference, indexed)
 * - A user may have at most one default address (enforced in the controller
 *   and backed by a partial unique index here)
 */
const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home',
    },
    fullName: { type: String, required: [true, 'Full name is required'], trim: true, maxlength: 100 },
    phone: { type: String, required: [true, 'Phone is required'], trim: true },
    addressLine1: { type: String, required: [true, 'Address line 1 is required'], trim: true, maxlength: 200 },
    addressLine2: { type: String, trim: true, maxlength: 200, default: '' },
    city: { type: String, required: [true, 'City is required'], trim: true, maxlength: 100 },
    state: { type: String, required: [true, 'State is required'], trim: true, maxlength: 100 },
    postalCode: { type: String, required: [true, 'Postal code is required'], trim: true },
    country: { type: String, required: [true, 'Country is required'], trim: true, maxlength: 100 },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Guarantees at most one default address per user, even under concurrent requests
addressSchema.index(
  { user: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

module.exports = mongoose.model('Address', addressSchema);
