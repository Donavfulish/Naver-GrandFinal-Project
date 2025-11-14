import { ErrorCodes, ErrorStatusCodes } from '../constants/errorCodes.js';

/**
 * Validation Middleware
 * Validates request body, params, or query against a schema
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: 'Validation failed',
          details: errors,
        },
      });
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

export default validate;

