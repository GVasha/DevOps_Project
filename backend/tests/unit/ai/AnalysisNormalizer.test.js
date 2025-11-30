/**
 * Unit tests for AnalysisNormalizer
 */

const AnalysisNormalizer = require('../../../services/ai/AnalysisNormalizer');

describe('AnalysisNormalizer', () => {
  let normalizer;

  beforeEach(() => {
    normalizer = new AnalysisNormalizer();
  });

  describe('normalize', () => {
    test('should normalize complete valid analysis', () => {
      const raw = {
        severity: 'minor',
        damageTypes: ['scratch', 'dent'],
        costCategory: 'Low: $0-500',
        affectedAreas: ['bumper', 'door'],
        safetyConcerns: 'None',
        confidence: 8,
        summary: 'Minor damage detected'
      };
      
      const result = normalizer.normalize(raw);
      
      expect(result.severity).toBe('Minor');
      expect(result.damageTypes).toEqual(['scratch', 'dent']);
      expect(result.costCategory).toBe('Low');
      expect(result.affectedAreas).toEqual(['bumper', 'door']);
      expect(result.confidence).toBe(8);
      expect(result.summary).toBe('Minor damage detected');
    });

    test('should normalize severity case variations', () => {
      expect(normalizer.normalize({ severity: 'MINOR' }).severity).toBe('Minor');
      expect(normalizer.normalize({ severity: 'severe' }).severity).toBe('Severe');
      expect(normalizer.normalize({ severity: 'TOTAL LOSS' }).severity).toBe('Total Loss');
    });

    test('should convert string damage types to array', () => {
      const raw = {
        severity: 'Minor',
        damageTypes: 'scratch, dent, paint damage',
        summary: 'Test',
        confidence: 5
      };
      
      const result = normalizer.normalize(raw);
      expect(result.damageTypes).toEqual(['scratch', 'dent', 'paint damage']);
    });

    test('should handle array damage types', () => {
      const raw = {
        severity: 'Minor',
        damageTypes: ['scratch', 'dent'],
        summary: 'Test',
        confidence: 5
      };
      
      const result = normalizer.normalize(raw);
      expect(result.damageTypes).toEqual(['scratch', 'dent']);
    });

    test('should extract cost category from various formats', () => {
      expect(normalizer.normalize({ 
        severity: 'Minor', 
        costCategory: 'Low: $0-500',
        summary: 'Test',
        confidence: 5
      }).costCategory).toBe('Low');
      
      expect(normalizer.normalize({ 
        severity: 'Minor',
        costCategory: 'Category: High: $2000-5000',
        summary: 'Test',
        confidence: 5
      }).costCategory).toBe('High');
    });

    test('should normalize confidence to valid range', () => {
      expect(normalizer.normalize({ 
        severity: 'Minor',
        summary: 'Test',
        confidence: 15
      }).confidence).toBe(10);
      
      expect(normalizer.normalize({ 
        severity: 'Minor',
        summary: 'Test',
        confidence: -5
      }).confidence).toBe(0);
      
      expect(normalizer.normalize({ 
        severity: 'Minor',
        summary: 'Test',
        confidence: '8'
      }).confidence).toBe(8);
    });

    test('should create fallback when validation fails', () => {
      const raw = {
        severity: 'Invalid',
        summary: '',
        confidence: 15
      };
      
      const result = normalizer.normalize(raw);
      expect(result.severity).toBe('Unknown');
      expect(result.confidence).toBe(0);
    });

    test('should handle null values', () => {
      const raw = {
        severity: 'Minor',
        damageTypes: null,
        affectedAreas: null,
        summary: 'Test',
        confidence: 5
      };
      
      const result = normalizer.normalize(raw);
      expect(result.damageTypes).toEqual([]);
      expect(result.affectedAreas).toEqual([]);
    });
  });

  describe('toArray', () => {
    test('should convert array to cleaned array', () => {
      expect(normalizer.toArray(['a', ' b ', ''])).toEqual(['a', 'b']);
    });

    test('should convert string to array', () => {
      expect(normalizer.toArray('a, b, c')).toEqual(['a', 'b', 'c']);
    });

    test('should return empty array for null', () => {
      expect(normalizer.toArray(null)).toEqual([]);
    });
  });

  describe('normalizeSeverity', () => {
    test('should normalize severity case', () => {
      expect(normalizer.normalizeSeverity('minor')).toBe('Minor');
      expect(normalizer.normalizeSeverity('SEVERE')).toBe('Severe');
      expect(normalizer.normalizeSeverity('total loss')).toBe('Total Loss');
    });

    test('should return Unknown for invalid severity', () => {
      expect(normalizer.normalizeSeverity('invalid')).toBe('invalid');
      expect(normalizer.normalizeSeverity(null)).toBe('Unknown');
    });
  });
});

