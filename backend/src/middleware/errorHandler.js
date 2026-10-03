const { Prisma } = require('@prisma/client');
const { ApiError } = require('../lib/errors');
const { env } = require('../config/env');

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A record with that value already exists',
        errorCode: 'CONFLICT',
      });
    }
    if (err.code === 'P2034') {
      return res.status(409).json({
        success: false,
        message: 'Please retry the request',
        errorCode: 'CONFLICT',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        errorCode: 'NOT_FOUND',
      });
    }
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      errorCode: 'VALIDATION_ERROR',
    });
  }

  if (env.nodeEnv !== 'production') {
    console.error(err);
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    errorCode: 'INTERNAL_ERROR',
  });
}

module.exports = errorHandler;
