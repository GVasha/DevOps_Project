/**
 * Centralized error handling middleware
 */

const { errorResponse } = require('../utils/responseHelper');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : err.message;

  return errorResponse(res, statusCode, message);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  return errorResponse(res, 404, 'Route not found');
};

module.exports = {
  errorHandler,
  notFoundHandler
};

