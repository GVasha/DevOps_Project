/**
 * Unit tests for JsonExtractor
 */

const JsonExtractor = require('../../../services/ai/JsonExtractor');

describe('JsonExtractor', () => {
  let extractor;

  beforeEach(() => {
    extractor = new JsonExtractor();
  });

  describe('extract', () => {
    test('should return empty object for null input', () => {
      expect(extractor.extract(null)).toEqual({});
    });

    test('should return empty object for undefined input', () => {
      expect(extractor.extract(undefined)).toEqual({});
    });

    test('should extract JSON from code fences with json tag', () => {
      const text = '```json\n{"severity": "Minor", "confidence": 7}\n```';
      const result = extractor.extract(text);
      
      expect(result).toEqual({ severity: 'Minor', confidence: 7 });
    });

    test('should extract JSON from code fences without json tag', () => {
      const text = '```\n{"severity": "Moderate"}\n```';
      const result = extractor.extract(text);
      
      expect(result).toEqual({ severity: 'Moderate' });
    });

    test('should extract JSON object from plain text', () => {
      const text = 'Here is the analysis: {"severity": "Severe", "confidence": 8}';
      const result = extractor.extract(text);
      
      expect(result).toEqual({ severity: 'Severe', confidence: 8 });
    });

    test('should return summary object when no JSON found', () => {
      const text = 'This is just plain text without JSON';
      const result = extractor.extract(text);
      
      expect(result).toEqual({ summary: text });
    });

    test('should handle invalid JSON in code fences', () => {
      const text = '```json\n{invalid json}\n```';
      const result = extractor.extract(text);
      
      expect(result).toEqual({ summary: text });
    });

    test('should handle invalid JSON object', () => {
      const text = '{invalid json}';
      const result = extractor.extract(text);
      
      expect(result).toEqual({ summary: text });
    });

    test('should extract nested JSON objects', () => {
      const text = '{"analysis": {"severity": "Minor", "details": {"cost": 500}}}';
      const result = extractor.extract(text);
      
      expect(result.analysis.severity).toBe('Minor');
      expect(result.analysis.details.cost).toBe(500);
    });
  });
});

