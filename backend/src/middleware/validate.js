const { body, validationResult } = require('express-validator');
const { ApiError } = require('./errorHandler');
const { isValidTrait, isValidPValue, isValidWindowSize } = require('../utils/validators');

/**
 * Validation rules for the find-targets endpoint
 */
exports.targetFindingRules = [
  body('trait')
    .notEmpty().withMessage('Trait is required')
    .isString().withMessage('Trait must be a string')
    .custom(isValidTrait).withMessage('Invalid trait format. Please provide a valid EFO ID (e.g., EFO_0001360) or trait name.'),
  
  body('p_value')
    .optional()
    .isFloat({ min: 0, max: 1 }).withMessage('P-value must be between 0 and 1')
    .custom(isValidPValue).withMessage('Invalid p-value. Please provide a number between 0 and 1.'),
  
  body('window_kb')
    .optional()
    .isInt({ min: 1, max: 1000 }).withMessage('Window size must be between 1 and 1000 kb')
    .custom(isValidWindowSize).withMessage('Invalid window size. Please provide a number between 1 and 1000 kb.')
];

/**
 * Middleware to handle validation results
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw new ApiError(`Validation error: ${errorMessages.join(', ')}`, 400);
  }
  
  next();
};
