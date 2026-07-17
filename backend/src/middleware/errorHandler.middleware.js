const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: err.errors?.[0]?.message || 'Duplicate value violates a unique constraint',
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: err.errors?.[0]?.message || 'Invalid input',
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
  });
};

module.exports = errorHandler;
