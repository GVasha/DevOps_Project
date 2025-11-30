/**
 * Validation helper utilities
 */

const { validationResult } = require('express-validator');

/**
 * Handles validation errors from express-validator
 */
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return null;
};

module.exports = {
  handleValidationErrors
};

