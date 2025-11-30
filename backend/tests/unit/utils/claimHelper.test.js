/**
 * Unit tests for claimHelper utilities
 */

const { calculateEstimatedCost, calculatePriority } = require('../../../utils/claimHelper');

describe('claimHelper', () => {
  describe('calculateEstimatedCost', () => {
    test('should return cost category when available', () => {
      const aiAnalysis = {
        analysis: {
          costCategory: 'High',
          severity: 'Moderate'
        }
      };
      
      expect(calculateEstimatedCost(aiAnalysis)).toBe('High');
    });

    test('should fallback to severity mapping when cost category missing', () => {
      const aiAnalysis = {
        analysis: {
          severity: 'Severe'
        }
      };
      
      expect(calculateEstimatedCost(aiAnalysis)).toBe('High');
    });

    test('should map None severity to Low', () => {
      const aiAnalysis = {
        analysis: { severity: 'None' }
      };
      
      expect(calculateEstimatedCost(aiAnalysis)).toBe('Low');
    });

    test('should map Minor severity to Low', () => {
      const aiAnalysis = {
        analysis: { severity: 'Minor' }
      };
      
      expect(calculateEstimatedCost(aiAnalysis)).toBe('Low');
    });

    test('should map Moderate severity to Medium', () => {
      const aiAnalysis = {
        analysis: { severity: 'Moderate' }
      };
      
      expect(calculateEstimatedCost(aiAnalysis)).toBe('Medium');
    });

    test('should map Total Loss severity to Very High', () => {
      const aiAnalysis = {
        analysis: { severity: 'Total Loss' }
      };
      
      expect(calculateEstimatedCost(aiAnalysis)).toBe('Very High');
    });

    test('should return Unknown for invalid severity', () => {
      const aiAnalysis = {
        analysis: { severity: 'Invalid' }
      };
      
      expect(calculateEstimatedCost(aiAnalysis)).toBe('Unknown');
    });

    test('should return Unknown for null aiAnalysis', () => {
      expect(calculateEstimatedCost(null)).toBe('Unknown');
    });

    test('should return Unknown for missing analysis', () => {
      expect(calculateEstimatedCost({})).toBe('Unknown');
    });
  });

  describe('calculatePriority', () => {
    test('should return High when safety concerns present', () => {
      const aiAnalysis = {
        analysis: {
          safetyConcerns: 'Safety issues identified',
          severity: 'Minor'
        }
      };
      
      expect(calculatePriority(aiAnalysis)).toBe('High');
    });

    test('should return High for safety concerns with different casing', () => {
      const aiAnalysis = {
        analysis: {
          safetyConcerns: 'SAFETY concerns',
          severity: 'Minor'
        }
      };
      
      expect(calculatePriority(aiAnalysis)).toBe('High');
    });

    test('should map severity to priority when no safety concerns', () => {
      const aiAnalysis = {
        analysis: {
          severity: 'Severe',
          safetyConcerns: 'No immediate concerns'
        }
      };
      
      expect(calculatePriority(aiAnalysis)).toBe('High');
    });

    test('should map None severity to Low priority', () => {
      const aiAnalysis = {
        analysis: { severity: 'None' }
      };
      
      expect(calculatePriority(aiAnalysis)).toBe('Low');
    });

    test('should map Minor severity to Low priority', () => {
      const aiAnalysis = {
        analysis: { severity: 'Minor' }
      };
      
      expect(calculatePriority(aiAnalysis)).toBe('Low');
    });

    test('should map Moderate severity to Medium priority', () => {
      const aiAnalysis = {
        analysis: { severity: 'Moderate' }
      };
      
      expect(calculatePriority(aiAnalysis)).toBe('Medium');
    });

    test('should map Total Loss severity to High priority', () => {
      const aiAnalysis = {
        analysis: { severity: 'Total Loss' }
      };
      
      expect(calculatePriority(aiAnalysis)).toBe('High');
    });

    test('should return Medium for invalid severity', () => {
      const aiAnalysis = {
        analysis: { severity: 'Invalid' }
      };
      
      expect(calculatePriority(aiAnalysis)).toBe('Medium');
    });

    test('should return Medium for null aiAnalysis', () => {
      expect(calculatePriority(null)).toBe('Medium');
    });

    test('should return Medium for missing analysis', () => {
      expect(calculatePriority({})).toBe('Medium');
    });
  });
});

