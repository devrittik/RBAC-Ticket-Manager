const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let message = err.message || 'Internal Server Error';
  let statusCode = err.statusCode || 500;

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((e) => e.message).join(', ');
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token.';
    statusCode = 401;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('💥 Error:', err);
  }

  return sendError(res, statusCode, message);
};

module.exports = errorHandler;
