/**
 * Unit tests for UserService
 * Additional edge cases and error handling
 */

const bcrypt = require('bcryptjs');
const UserService = require('../../../services/UserService');
const FileStorage = require('../../../utils/fileStorage');

jest.mock('../../../utils/fileStorage');
jest.mock('bcryptjs');

describe('UserService - Edge Cases', () => {
  let service;
  let mockStorage;

  beforeEach(() => {
    service = UserService;
    mockStorage = {
      append: jest.fn(),
      read: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    FileStorage.mockImplementation(() => mockStorage);
    // Replace the storage on the service instance
    service.storage = mockStorage;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    test('should return error when user already exists', async () => {
      mockStorage.findByEmail.mockReturnValue({ id: 'existing-user' });

      const result = await service.createUser(
        'existing@test.com',
        'Password123!',
        'Test User'
      );

      expect(result.error).toBe('User already exists with this email');
      expect(mockStorage.append).not.toHaveBeenCalled();
    });

    test('should handle storage failure', async () => {
      mockStorage.findByEmail.mockReturnValue(null);
      mockStorage.append.mockReturnValue(false);
      bcrypt.hash.mockResolvedValue('hashed-password');

      const result = await service.createUser(
        'new@test.com',
        'Password123!',
        'Test User'
      );

      expect(result.error).toBe('Failed to create user account');
    });

    test('should handle null phone number', async () => {
      mockStorage.findByEmail.mockReturnValue(null);
      mockStorage.append.mockReturnValue(true);
      bcrypt.hash.mockResolvedValue('hashed-password');

      const result = await service.createUser(
        'new@test.com',
        'Password123!',
        'Test User',
        null
      );

      expect(result.phone).toBeNull();
    });
  });

  describe('authenticateUser', () => {
    test('should return error for non-existent user', async () => {
      mockStorage.findByEmail.mockReturnValue(null);

      const result = await service.authenticateUser('nonexistent@test.com', 'password');

      expect(result.error).toBe('Invalid credentials');
    });

    test('should return error for wrong password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        password: 'hashed-password'
      };

      mockStorage.findByEmail.mockReturnValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const result = await service.authenticateUser('test@test.com', 'wrong-password');

      expect(result.error).toBe('Invalid credentials');
    });

    test('should return user for correct credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        password: 'hashed-password'
      };

      mockStorage.findByEmail.mockReturnValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await service.authenticateUser('test@test.com', 'correct-password');

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeUndefined();
    });
  });

  describe('updateUser', () => {
    test('should return false when update fails', () => {
      mockStorage.update.mockReturnValue(false);

      const result = service.updateUser('user-123', { name: 'New Name' });

      expect(result).toBe(false);
    });

    test('should handle empty update data', () => {
      mockStorage.update.mockReturnValue(true);

      const result = service.updateUser('user-123', {});

      expect(result).toBe(true);
      expect(mockStorage.update).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    test('should return false when deletion fails', () => {
      mockStorage.delete.mockReturnValue(false);

      const result = service.deleteUser('user-123');

      expect(result).toBe(false);
    });
  });
});
