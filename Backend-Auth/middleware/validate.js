const { validationResult } = require('express-validator');

/**
 * validate middleware
 *
 * Runs after express-validator chains. Short-circuits with a 400 and the
 * list of errors, so controllers only ever see valid input.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validate;
