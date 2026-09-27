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

/**
 * POST /api/users/address
 * Add a new address
 */
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const newAddress = req.body;
    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ message: 'Address added successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error adding address.', error: error.message });
  }
};

/**
 * PUT /api/users/address/:addressId
 * Update an existing address
 */
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found.' });

    // Update fields
    const { street, city, state, zip, country } = req.body;
    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zip) address.zip = zip;
    if (country) address.country = country;

    await user.save();

    res.status(200).json({ message: 'Address updated successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating address.', error: error.message });
  }
};

/**
 * DELETE /api/users/address/:addressId
 * Delete an address
 */
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found.' });

    user.addresses.pull(req.params.addressId);
    await user.save();

    res.status(200).json({ message: 'Address deleted successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting address.', error: error.message });
  }
};
