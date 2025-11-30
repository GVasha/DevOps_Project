/**
 * Authentication routes
 * Refactored to use service layer and remove duplication
 */

const express = require('express');
const { body } = require('express-validator');
const { generateToken, authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../utils/validationHelper');
const { successResponse, errorResponse, removePassword } = require('../utils/responseHelper');
const { USER } = require('../config/constants');
const userService = require('../services/UserService');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: USER.PASSWORD_MIN_LENGTH })
    .withMessage(`Password must be at least ${USER.PASSWORD_MIN_LENGTH} characters long`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('name')
    .trim()
    .isLength({ min: USER.NAME_MIN_LENGTH, max: USER.NAME_MAX_LENGTH })
    .withMessage(`Name must be between ${USER.NAME_MIN_LENGTH} and ${USER.NAME_MAX_LENGTH} characters`),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register endpoint
router.post('/register', registerValidation, async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { email, password, name, phone } = req.body;
    const result = await userService.createUser(email, password, name, phone);

    if (result.error) {
      const statusCode = result.error.includes('already exists') ? 409 : 500;
      return errorResponse(res, statusCode, result.error);
    }

    const token = generateToken(result.id, result.email);
    return successResponse(res, 201, 'User registered successfully', {
      user: removePassword(result),
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 500, 'Internal server error during registration');
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { email, password } = req.body;
    const result = await userService.authenticateUser(email, password);

    if (result.error) {
      return errorResponse(res, 401, result.error);
    }

    const token = generateToken(result.user.id, result.user.email);
    return successResponse(res, 200, 'Login successful', {
      user: removePassword(result.user),
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Internal server error during login');
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = userService.getUserById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, null, {
      user: removePassword(user)
    });

  } catch (error) {
    console.error('Profile error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: USER.NAME_MIN_LENGTH, max: USER.NAME_MAX_LENGTH })
    .withMessage(`Name must be between ${USER.NAME_MIN_LENGTH} and ${USER.NAME_MAX_LENGTH} characters`),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
], (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { name, phone } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const updated = userService.updateUser(req.user.id, updateData);
    if (!updated) {
      return errorResponse(res, 500, 'Failed to update profile');
    }

    const updatedUser = userService.getUserById(req.user.id);
    return successResponse(res, 200, 'Profile updated successfully', {
      user: removePassword(updatedUser)
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const deleted = userService.deleteUser(req.user.id);
    
    if (!deleted) {
      return errorResponse(res, 500, 'Failed to delete account');
    }

    return successResponse(res, 200, 'Account deleted successfully');

  } catch (error) {
    console.error('Account deletion error:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
});

module.exports = router;
