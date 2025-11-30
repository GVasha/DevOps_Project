/**
 * Unit tests for auth middleware
 */

const jwt = require('jsonwebtoken');
const { authenticateToken, generateToken } = require('../../../middleware/auth');
const UserService = require('../../../services/UserService');
const { JWT } = require('../../../config/constants');

jest.mock('../../../services/UserService');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    test('should authenticate valid token', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@test.com',
        name: 'Test User'
      };

      UserService.getUserById.mockReturnValue(mockUser);

      const token = jwt.sign(
        { userId: mockUser.id, email: mockUser.email },
        process.env.JWT_SECRET
      );

      mockReq.headers.authorization = `Bearer ${token}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name
      });
    });

    test('should reject request without token', () => {
      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access token required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject invalid token', () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should reject token for non-existent user', () => {
      UserService.getUserById.mockReturnValue(null);

      const token = jwt.sign(
        { userId: 'non-existent', email: 'test@test.com' },
        process.env.JWT_SECRET
      );

      mockReq.headers.authorization = `Bearer ${token}`;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle token without Bearer prefix', () => {
      const token = jwt.sign(
        { userId: 'user-123', email: 'test@test.com' },
        process.env.JWT_SECRET
      );

      mockReq.headers.authorization = token;

      authenticateToken(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe('generateToken', () => {
    test('should generate valid JWT token', () => {
      const userId = 'user-123';
      const email = 'test@test.com';

      const token = generateToken(userId, email);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
    });

    test('should use correct expiration time', () => {
      const token = generateToken('user-123', 'test@test.com');
      const decoded = jwt.decode(token);

      expect(decoded.exp).toBeDefined();
      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(24 * 60 * 60); // 24 hours in seconds
    });
  });
});

