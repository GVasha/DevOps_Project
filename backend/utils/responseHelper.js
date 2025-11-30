/**
 * Response formatting utilities
 */

/**
 * Formats success response
 */
const successResponse = (res, statusCode, message, data = null) => {
  const response = { message };
  if (data !== null) {
    if (Array.isArray(data)) {
      response[data.length === 1 ? 'item' : 'items'] = data;
    } else {
      Object.assign(response, data);
    }
  }
  return res.status(statusCode).json(response);
};

/**
 * Formats error response
 */
const errorResponse = (res, statusCode, error, details = null) => {
  const response = { error };
  if (details) {
    response.details = details;
  }
  return res.status(statusCode).json(response);
};

/**
 * Removes password from user object
 */
const removePassword = (user) => {
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  successResponse,
  errorResponse,
  removePassword
};

