/**
 * User Service
 * Handles business logic for user operations
 * Follows Single Responsibility Principle
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const FileStorage = require('../utils/fileStorage');
const { USER } = require('../config/constants');

class UserService {
  constructor() {
    this.storage = new FileStorage('users.json');
  }

  /**
   * Creates a new user
   */
  async createUser(email, password, name, phone) {
    // Check if user already exists
    const existingUser = this.storage.findByEmail(email);
    if (existingUser) {
      return { error: 'User already exists with this email' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, USER.PASSWORD_SALT_ROUNDS);

    // Create user
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = this.storage.append(newUser);
    return saved ? newUser : { error: 'Failed to create user account' };
  }

  /**
   * Authenticates user
   */
  async authenticateUser(email, password) {
    const user = this.storage.findByEmail(email);
    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { error: 'Invalid credentials' };
    }

    return { user };
  }

  /**
   * Gets user by ID
   */
  getUserById(userId) {
    return this.storage.findById(userId);
  }

  /**
   * Updates user profile
   */
  updateUser(userId, updateData) {
    const updatePayload = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return this.storage.update(userId, updatePayload);
  }

  /**
   * Deletes user account
   */
  deleteUser(userId) {
    return this.storage.delete(userId);
  }
}

module.exports = new UserService();

