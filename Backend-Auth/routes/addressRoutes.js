const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const addressController = require('../controllers/addressController');
const {
  createAddressValidation,
  updateAddressValidation,
  addressIdValidation,
} = require('../validators/addressValidator');

// All address routes require a valid access token
router.use(protect);

router
  .route('/')
  .get(addressController.getAddresses)
  .post(createAddressValidation, validate, addressController.createAddress);

router
  .route('/:id')
  .get(addressIdValidation, validate, addressController.getAddressById)
  .patch(updateAddressValidation, validate, addressController.updateAddress)
  .delete(addressIdValidation, validate, addressController.deleteAddress);

module.exports = router;
