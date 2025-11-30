/**
 * Unit tests for responseHelper utilities
 */

const { successResponse, errorResponse, removePassword } = require('../../../utils/responseHelper');

describe('responseHelper', () => {
  describe('successResponse', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    test('should format success response with message only', () => {
      successResponse(mockRes, 200, 'Success');
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Success' });
    });

    test('should format success response with single item array', () => {
      successResponse(mockRes, 201, 'Created', [{ id: 1 }]);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Created',
        item: [{ id: 1 }]
      });
    });

    test('should format success response with multiple items array', () => {
      successResponse(mockRes, 200, 'Found', [{ id: 1 }, { id: 2 }]);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Found',
        items: [{ id: 1 }, { id: 2 }]
      });
    });

    test('should format success response with object data', () => {
      successResponse(mockRes, 200, 'Found', { user: { id: 1, name: 'Test' } });
      
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Found',
        user: { id: 1, name: 'Test' }
      });
    });

    test('should handle null data', () => {
      successResponse(mockRes, 200, 'Success', null);
      
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Success' });
    });
  });

  describe('errorResponse', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
    });

    test('should format error response without details', () => {
      errorResponse(mockRes, 400, 'Bad Request');
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Bad Request' });
    });

    test('should format error response with details', () => {
      errorResponse(mockRes, 400, 'Validation failed', ['Field is required']);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Field is required']
      });
    });
  });

  describe('removePassword', () => {
    test('should remove password from user object', () => {
      const user = {
        id: '1',
        email: 'test@test.com',
        password: 'hashedpassword',
        name: 'Test User'
      };
      
      const result = removePassword(user);
      
      expect(result).toEqual({
        id: '1',
        email: 'test@test.com',
        name: 'Test User'
      });
      expect(result.password).toBeUndefined();
    });

    test('should return null for null input', () => {
      expect(removePassword(null)).toBeNull();
    });

    test('should return null for undefined input', () => {
      expect(removePassword(undefined)).toBeNull();
    });

    test('should handle user without password field', () => {
      const user = { id: '1', email: 'test@test.com' };
      const result = removePassword(user);
      
      expect(result).toEqual(user);
    });
  });
});

