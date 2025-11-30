/**
 * Authentication middleware
 * Refactored to use service layer and constants
 */

const jwt = require('jsonwebtoken');
const userService = require('../services/UserService');
const { JWT } = require('../config/constants');

/**
 * Authenticates JWT token and verifies user exists
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verify user still exists
    const user = userService.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: user.name
    };
    
    next();
  });
};

/**
 * Generates JWT token
 */
const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: JWT.EXPIRES_IN }
  );
};

module.exports = {
  authenticateToken,
  generateToken
};
