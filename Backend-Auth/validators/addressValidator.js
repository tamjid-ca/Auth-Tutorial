const { body, param } = require('express-validator');

const LABELS = ['home', 'work', 'other'];

/**
 * Builds a field chain. For creates the field is required;
 * for updates (PATCH) it is optional but validated when present.
 */
const field = (name, required) => {
  const chain = body(name);
  return required ? chain.exists({ values: 'falsy' }).withMessage(`${name} is required.`).bail() : chain.optional();
};

const rules = (required) => [
  field('label', false)
    .isIn(LABELS)
    .withMessage(`Label must be one of: ${LABELS.join(', ')}.`),
  field('fullName', required)
    .isString().withMessage('Full name must be a string.').bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be 2-100 characters.'),
  field('phone', required)
    .isString().withMessage('Phone must be a string.').bail()
    .trim()
    .matches(/^\+?[0-9\s\-()]{7,20}$/)
    .withMessage('A valid phone number is required.'),
  field('addressLine1', required)
    .isString().withMessage('Address line 1 must be a string.').bail()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Address line 1 must be 3-200 characters.'),
  body('addressLine2')
    .optional({ values: 'null' })
    .isString().withMessage('Address line 2 must be a string.').bail()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 must be at most 200 characters.'),
  field('city', required)
    .isString().withMessage('City must be a string.').bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be 2-100 characters.'),
  field('state', required)
    .isString().withMessage('State must be a string.').bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be 2-100 characters.'),
  field('postalCode', required)
    .isString().withMessage('Postal code must be a string.').bail()
    .trim()
    .matches(/^[A-Za-z0-9\s-]{3,10}$/)
    .withMessage('A valid postal code is required.'),
  field('country', required)
    .isString().withMessage('Country must be a string.').bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be 2-100 characters.'),
  body('isDefault')
    .optional()
    .isBoolean({ strict: true })
    .withMessage('isDefault must be a boolean.'),
];

const idParam = param('id').isMongoId().withMessage('Invalid address id.');

exports.createAddressValidation = rules(true);

exports.updateAddressValidation = [
  idParam,
  ...rules(false),
  // PATCH with an empty body is meaningless
  body().custom((value) => {
    const allowed = ['label', 'fullName', 'phone', 'addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country', 'isDefault'];
    if (!allowed.some((k) => value && value[k] !== undefined)) {
      throw new Error('At least one updatable field must be provided.');
    }
    return true;
  }),
];

exports.addressIdValidation = [idParam];
