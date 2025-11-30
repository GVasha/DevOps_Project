/**
 * Unit tests for validation helper
 */

const { handleValidationErrors } = require('../../../utils/validationHelper');
const { validationResult } = require('express-validator');

jest.mock('express-validator');

describe('Validation Helper', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return null when no validation errors', () => {
    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });

    const result = handleValidationErrors(mockReq, mockRes);

    expect(result).toBeNull();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  test('should return error response when validation fails', () => {
    const mockErrors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Password too short' }
    ];

    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => mockErrors
    });

    const result = handleValidationErrors(mockReq, mockRes);

    expect(result).not.toBeNull();
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Validation failed',
      details: mockErrors
    });
  });
});

