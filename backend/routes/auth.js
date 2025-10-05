const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { generateToken, authenticateToken } = require('../middleware/auth');
const FileStorage = require('../utils/fileStorage');

const router = express.Router();
const userStorage = new FileStorage('users.json');

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
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
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, name, phone } = req.body;

    // Check if user already exists
    const existingUser = userStorage.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists with this email'
      });
    }

    // Hash password securely
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save user to file
    const saved = userStorage.append(newUser);
    if (!saved) {
      return res.status(500).json({
        error: 'Failed to create user account'
      });
    }

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.email);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error during registration'
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = userStorage.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = userStorage.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
], (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, phone } = req.body;
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;

    const updated = userStorage.update(req.user.id, updateData);
    if (!updated) {
      return res.status(500).json({
        error: 'Failed to update profile'
      });
    }

    const updatedUser = userStorage.findById(req.user.id);
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete user account
    const deleted = userStorage.delete(userId);
    
    if (!deleted) {
      return res.status(500).json({
        error: 'Failed to delete account'
      });
    }

    // Clear token (client-side will handle localStorage)
    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;
