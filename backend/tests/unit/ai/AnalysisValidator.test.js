/**
 * Unit tests for AnalysisValidator
 */

const AnalysisValidator = require('../../../services/ai/AnalysisValidator');

describe('AnalysisValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new AnalysisValidator();
  });

  describe('validate', () => {
    test('should validate correct analysis', () => {
      const analysis = {
        severity: 'Minor',
        summary: 'Test summary',
        confidence: 7
      };
      
      expect(validator.validate(analysis)).toBe(true);
    });

    test('should reject analysis missing required fields', () => {
      const analysis = {
        severity: 'Minor',
        confidence: 7
        // Missing summary
      };
      
      expect(validator.validate(analysis)).toBe(false);
    });

    test('should reject analysis with invalid severity', () => {
      const analysis = {
        severity: 'InvalidSeverity',
        summary: 'Test',
        confidence: 7
      };
      
      expect(validator.validate(analysis)).toBe(false);
    });

    test('should reject analysis with invalid confidence (too high)', () => {
      const analysis = {
        severity: 'Minor',
        summary: 'Test',
        confidence: 11
      };
      
      expect(validator.validate(analysis)).toBe(false);
    });

    test('should reject analysis with invalid confidence (too low)', () => {
      const analysis = {
        severity: 'Minor',
        summary: 'Test',
        confidence: -1
      };
      
      expect(validator.validate(analysis)).toBe(false);
    });

    test('should reject analysis with non-numeric confidence', () => {
      const analysis = {
        severity: 'Minor',
        summary: 'Test',
        confidence: 'high'
      };
      
      expect(validator.validate(analysis)).toBe(false);
    });
  });

  describe('hasRequiredFields', () => {
    test('should return true when all required fields present', () => {
      const analysis = {
        severity: 'Minor',
        summary: 'Test',
        confidence: 7
      };
      
      expect(validator.hasRequiredFields(analysis)).toBe(true);
    });

    test('should return false when severity missing', () => {
      const analysis = {
        summary: 'Test',
        confidence: 7
      };
      
      expect(validator.hasRequiredFields(analysis)).toBe(false);
    });

    test('should return false when summary missing', () => {
      const analysis = {
        severity: 'Minor',
        confidence: 7
      };
      
      expect(validator.hasRequiredFields(analysis)).toBe(false);
    });

    test('should return false when confidence missing', () => {
      const analysis = {
        severity: 'Minor',
        summary: 'Test'
      };
      
      expect(validator.hasRequiredFields(analysis)).toBe(false);
    });
  });

  describe('hasValidSeverity', () => {
    test('should accept valid severity levels', () => {
      const validSeverities = ['None', 'Minor', 'Moderate', 'Severe', 'Total Loss', 'Unknown'];
      
      validSeverities.forEach(severity => {
        const analysis = { severity };
        expect(validator.hasValidSeverity(analysis)).toBe(true);
      });
    });

    test('should reject invalid severity', () => {
      const analysis = { severity: 'Invalid' };
      expect(validator.hasValidSeverity(analysis)).toBe(false);
    });
  });

  describe('hasValidConfidence', () => {
    test('should accept confidence in valid range', () => {
      for (let i = 0; i <= 10; i++) {
        const analysis = { confidence: i };
        expect(validator.hasValidConfidence(analysis)).toBe(true);
      }
    });

    test('should reject confidence below minimum', () => {
      const analysis = { confidence: -1 };
      expect(validator.hasValidConfidence(analysis)).toBe(false);
    });

    test('should reject confidence above maximum', () => {
      const analysis = { confidence: 11 };
      expect(validator.hasValidConfidence(analysis)).toBe(false);
    });

    test('should reject non-numeric confidence', () => {
      const analysis = { confidence: 'high' };
      expect(validator.hasValidConfidence(analysis)).toBe(false);
    });

    test('should reject null confidence', () => {
      const analysis = { confidence: null };
      expect(validator.hasValidConfidence(analysis)).toBe(false);
    });
  });
});

