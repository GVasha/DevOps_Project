/**
 * Unit tests for error handler middleware
 */

const { errorHandler, notFoundHandler } = require('../../../middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      path: '/test'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  describe('errorHandler', () => {
    test('should handle error with status code', () => {
      const error = new Error('Test error');
      error.status = 400;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Test error'
      });
    });

    test('should handle error with statusCode property', () => {
      const error = new Error('Test error');
      error.statusCode = 404;

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('should default to 500 for errors without status', () => {
      const error = new Error('Test error');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    test('should show generic message in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Detailed error message');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Something went wrong!'
      });
    });

    test('should show detailed message in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Detailed error message');

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Detailed error message'
      });
    });
  });

  describe('notFoundHandler', () => {
    test('should return 404 for any route', () => {
      notFoundHandler(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Route not found'
      });
    });
  });
});

