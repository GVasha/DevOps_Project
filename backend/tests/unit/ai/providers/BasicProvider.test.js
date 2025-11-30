/**
 * Unit tests for BasicProvider
 */

const fs = require('fs');
const BasicProvider = require('../../../services/ai/providers/BasicProvider');
const { AI } = require('../../../config/constants');

describe('BasicProvider', () => {
  let provider;
  let mockImagePath;

  beforeEach(() => {
    provider = new BasicProvider();
    mockImagePath = '/tmp/test-image.jpg';
    
    // Mock fs.statSync
    jest.spyOn(fs, 'statSync').mockReturnValue({
      size: 1024 * 1024 // 1MB
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getName', () => {
    test('should return provider name', () => {
      expect(provider.getName()).toBe('Basic Analysis (Demo)');
    });
  });

  describe('analyzeCarDamage', () => {
    test('should analyze small file as Minor damage', async () => {
      fs.statSync.mockReturnValue({ size: 1024 * 1024 }); // 1MB
      
      const result = await provider.analyzeCarDamage(mockImagePath);
      
      expect(result.success).toBe(true);
      expect(result.rawAnalysis.severity).toBe('Minor');
      expect(result.rawAnalysis.confidence).toBe(3);
      expect(result.provider).toBe('Basic Analysis (Demo)');
    });

    test('should analyze medium file as Moderate damage', async () => {
      fs.statSync.mockReturnValue({ 
        size: AI.FILE_SIZE_THRESHOLD_MODERATE + 1 
      });
      
      const result = await provider.analyzeCarDamage(mockImagePath);
      
      expect(result.success).toBe(true);
      expect(result.rawAnalysis.severity).toBe('Moderate');
      expect(result.rawAnalysis.confidence).toBe(4);
    });

    test('should analyze large file as Severe damage', async () => {
      fs.statSync.mockReturnValue({ 
        size: AI.FILE_SIZE_THRESHOLD_SEVERE + 1 
      });
      
      const result = await provider.analyzeCarDamage(mockImagePath);
      
      expect(result.success).toBe(true);
      expect(result.rawAnalysis.severity).toBe('Severe');
      expect(result.rawAnalysis.confidence).toBe(5);
    });

    test('should include note about demonstration', async () => {
      const result = await provider.analyzeCarDamage(mockImagePath);
      
      expect(result.note).toContain('demonstration');
    });

    test('should handle file read errors', async () => {
      fs.statSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      
      await expect(provider.analyzeCarDamage(mockImagePath))
        .rejects.toThrow('Basic analysis failed: File not found');
    });

    test('should map severity to cost category', async () => {
      fs.statSync.mockReturnValue({ size: 1024 * 1024 });
      const minorResult = await provider.analyzeCarDamage(mockImagePath);
      expect(minorResult.rawAnalysis.costCategory).toBe('Low');
      
      fs.statSync.mockReturnValue({ 
        size: AI.FILE_SIZE_THRESHOLD_MODERATE + 1 
      });
      const moderateResult = await provider.analyzeCarDamage(mockImagePath);
      expect(moderateResult.rawAnalysis.costCategory).toBe('Medium');
      
      fs.statSync.mockReturnValue({ 
        size: AI.FILE_SIZE_THRESHOLD_SEVERE + 1 
      });
      const severeResult = await provider.analyzeCarDamage(mockImagePath);
      expect(severeResult.rawAnalysis.costCategory).toBe('High');
    });
  });
});

