const { ApiError } = require('../lib/errors');

function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((issue) => issue.message).join('; ');
      return next(new ApiError(400, message, 'VALIDATION_ERROR'));
    }
    req.body = parsed.data;
    return next();
  };
}

module.exports = { validateBody };
