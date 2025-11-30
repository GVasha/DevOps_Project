/**
 * Unit tests for AssessmentService
 * Additional edge cases and error handling
 */

const fs = require('fs');
const path = require('path');
const AssessmentService = require('../../../services/AssessmentService');
const FileStorage = require('../../../utils/fileStorage');

jest.mock('../../../utils/fileStorage');

describe('AssessmentService - Edge Cases', () => {
  let service;
  let mockStorage;

  beforeEach(() => {
    service = AssessmentService;
    mockStorage = {
      append: jest.fn(),
      read: jest.fn(),
      findById: jest.fn()
    };
    FileStorage.mockImplementation(() => mockStorage);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAssessment', () => {
    test('should handle storage failure', () => {
      mockStorage.append.mockReturnValue(false);

      const result = service.createAssessment(
        'user-123',
        '/uploads/test.jpg',
        'description',
        'location',
        { success: true }
      );

      expect(result).toBeNull();
    });

    test('should handle empty description and location', () => {
      mockStorage.append.mockReturnValue(true);

      const result = service.createAssessment(
        'user-123',
        '/uploads/test.jpg',
        null,
        null,
        { success: true }
      );

      expect(result).toBeDefined();
      expect(result.description).toBe('');
      expect(result.location).toBe('');
    });
  });

  describe('getUserAssessments', () => {
    test('should return empty array when no assessments exist', () => {
      mockStorage.read.mockReturnValue([]);

      const result = service.getUserAssessments('user-123');

      expect(result).toEqual([]);
    });

    test('should filter assessments by user ID', () => {
      const assessments = [
        { id: '1', userId: 'user-123', createdAt: '2024-01-01' },
        { id: '2', userId: 'user-456', createdAt: '2024-01-02' },
        { id: '3', userId: 'user-123', createdAt: '2024-01-03' }
      ];

      mockStorage.read.mockReturnValue(assessments);

      const result = service.getUserAssessments('user-123');

      expect(result).toHaveLength(2);
      expect(result.every(a => a.userId === 'user-123')).toBe(true);
    });

    test('should sort assessments by date descending', () => {
      const assessments = [
        { id: '1', userId: 'user-123', createdAt: '2024-01-01' },
        { id: '2', userId: 'user-123', createdAt: '2024-01-03' },
        { id: '3', userId: 'user-123', createdAt: '2024-01-02' }
      ];

      mockStorage.read.mockReturnValue(assessments);

      const result = service.getUserAssessments('user-123');

      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('1');
    });
  });

  describe('getAssessmentById', () => {
    test('should return null for non-existent assessment', () => {
      mockStorage.findById.mockReturnValue(null);

      const result = service.getAssessmentById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('verifyOwnership', () => {
    test('should return false for null assessment', () => {
      const result = service.verifyOwnership(null, 'user-123');
      expect(result).toBe(false);
    });

    test('should return false for different user', () => {
      const assessment = { userId: 'user-123' };
      const result = service.verifyOwnership(assessment, 'user-456');
      expect(result).toBe(false);
    });

    test('should return true for same user', () => {
      const assessment = { userId: 'user-123' };
      const result = service.verifyOwnership(assessment, 'user-123');
      expect(result).toBe(true);
    });
  });
});
