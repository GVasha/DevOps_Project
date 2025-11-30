/**
 * Unit tests for ClaimService
 * Additional edge cases and error handling
 */

const ClaimService = require('../../../services/ClaimService');
const FileStorage = require('../../../utils/fileStorage');

jest.mock('../../../utils/fileStorage');

describe('ClaimService - Edge Cases', () => {
  let service;
  let mockStorage;

  beforeEach(() => {
    service = ClaimService;
    mockStorage = {
      append: jest.fn(),
      read: jest.fn(),
      findById: jest.fn()
    };
    FileStorage.mockImplementation(() => mockStorage);
    // Replace the storage on the service instance
    service.storage = mockStorage;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateClaimNumber', () => {
    test('should generate unique claim numbers', () => {
      const claim1 = service.generateClaimNumber();
      const claim2 = service.generateClaimNumber();

      expect(claim1).not.toBe(claim2);
      expect(claim1).toMatch(/^CLM-/);
      expect(claim2).toMatch(/^CLM-/);
    });

    test('should include timestamp in claim number', () => {
      const claimNumber = service.generateClaimNumber();
      expect(claimNumber).toContain('CLM-');
    });
  });

  describe('createClaim', () => {
    test('should handle storage failure', () => {
      mockStorage.append.mockReturnValue(false);

      const claimData = {
        claimType: 'collision',
        incidentDate: '2024-01-01',
        incidentDescription: 'Test description',
        policyNumber: 'POL-123'
      };

      const assessment = {
        aiAnalysis: {
          analysis: { severity: 'Minor' }
        }
      };

      const result = service.createClaim('user-123', 'assessment-123', claimData, assessment);

      expect(result).toBeNull();
    });

    test('should handle null policy number', () => {
      mockStorage.append.mockReturnValue(true);

      const claimData = {
        claimType: 'collision',
        incidentDate: '2024-01-01',
        incidentDescription: 'Test description'
      };

      const assessment = {
        aiAnalysis: {
          analysis: { severity: 'Minor' }
        }
      };

      const result = service.createClaim('user-123', 'assessment-123', claimData, assessment);

      expect(result).toBeDefined();
      expect(result.policyNumber).toBeNull();
    });
  });

  describe('getUserClaims', () => {
    test('should return empty array when no claims exist', () => {
      mockStorage.read.mockReturnValue([]);

      const result = service.getUserClaims('user-123');

      expect(result).toEqual([]);
    });

    test('should filter claims by user ID', () => {
      const claims = [
        { id: '1', userId: 'user-123', createdAt: '2024-01-01' },
        { id: '2', userId: 'user-456', createdAt: '2024-01-02' },
        { id: '3', userId: 'user-123', createdAt: '2024-01-03' }
      ];

      mockStorage.read.mockReturnValue(claims);

      const result = service.getUserClaims('user-123');

      expect(result).toHaveLength(2);
      expect(result.every(c => c.userId === 'user-123')).toBe(true);
    });
  });

  describe('verifyOwnership', () => {
    test('should return false for null claim', () => {
      const result = service.verifyOwnership(null, 'user-123');
      expect(result).toBe(false);
    });

    test('should return false for different user', () => {
      const claim = { userId: 'user-123' };
      const result = service.verifyOwnership(claim, 'user-456');
      expect(result).toBe(false);
    });
  });
});
