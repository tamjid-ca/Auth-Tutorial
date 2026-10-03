const Address = require('../models/Address');

const MAX_ADDRESSES_PER_USER = 10;

// Only these fields can be set by the client (prevents mass-assignment of `user`, etc.)
const ALLOWED_FIELDS = [
  'label', 'fullName', 'phone', 'addressLine1', 'addressLine2',
  'city', 'state', 'postalCode', 'country', 'isDefault',
];

const pick = (source) =>
  ALLOWED_FIELDS.reduce((acc, key) => {
    if (source[key] !== undefined) acc[key] = source[key];
    return acc;
  }, {});

/**
 * POST /api/users/addresses
 *
 * Creates an address for the authenticated user.
 * The first address is always the default; setting isDefault=true unsets the previous one.
 */
exports.createAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const count = await Address.countDocuments({ user: userId });
    if (count >= MAX_ADDRESSES_PER_USER) {
      return res.status(400).json({
        message: `You can save at most ${MAX_ADDRESSES_PER_USER} addresses.`,
      });
    }

    const data = pick(req.body);
    if (count === 0) data.isDefault = true;
    if (data.isDefault) {
      await Address.updateMany({ user: userId, isDefault: true }, { isDefault: false });
    }

    const address = await Address.create({ ...data, user: userId });
    res.status(201).json({ message: 'Address created successfully.', address });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/addresses
 *
 * Lists the user's addresses, default first, then newest first.
 */
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({ count: addresses.length, addresses });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/addresses/:id
 *
 * Returns 404 for both missing addresses and addresses owned by others,
 * so ids of other users' addresses are never leaked.
 */
exports.getAddressById = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: 'Address not found.' });
    res.status(200).json({ address });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/addresses/:id
 *
 * Partially updates an address owned by the user.
 */
exports.updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const address = await Address.findOne({ _id: req.params.id, user: userId });
    if (!address) return res.status(404).json({ message: 'Address not found.' });

    const updates = pick(req.body);

    if (updates.isDefault === true && !address.isDefault) {
      await Address.updateMany({ user: userId, isDefault: true }, { isDefault: false });
    } else if (updates.isDefault === false && address.isDefault) {
      return res.status(400).json({
        message: 'Cannot unset the default address. Set another address as default instead.',
      });
    }

    address.set(updates);
    await address.save();
    res.status(200).json({ message: 'Address updated successfully.', address });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/addresses/:id
 *
 * Deletes an owned address. If it was the default, the most recent
 * remaining address is promoted to default.
 */
exports.deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: userId });
    if (!address) return res.status(404).json({ message: 'Address not found.' });

    if (address.isDefault) {
      const replacement = await Address.findOne({ user: userId }).sort({ createdAt: -1 });
      if (replacement) {
        replacement.isDefault = true;
        await replacement.save();
      }
    }

    res.status(200).json({ message: 'Address deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
