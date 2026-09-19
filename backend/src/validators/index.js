/**
 * Backend Validation Helpers
 * Prepared for Phase 2 Request Payloads (Zod / Joi / Express-validator)
 */

const validate = (schema) => (req, res, next) => {
  try {
    if (schema && typeof schema.parse === 'function') {
      req.validatedBody = schema.parse(req.body);
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validate
};
