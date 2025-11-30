/**
 * Unit tests for AIService orchestrator
 */

// Mock modules BEFORE requiring the service
jest.mock('../../../services/ai/providers/OpenAIProvider');
jest.mock('../../../services/ai/providers/BasicProvider');
jest.mock('../../../services/ai/JsonExtractor');
jest.mock('../../../services/ai/AnalysisNormalizer');

const OpenAIProvider = require('../../../services/ai/providers/OpenAIProvider');
const BasicProvider = require('../../../services/ai/providers/BasicProvider');
const JsonExtractor = require('../../../services/ai/JsonExtractor');
const AnalysisNormalizer = require('../../../services/ai/AnalysisNormalizer');

// Import after mocks are set up
const AIService = require('../../../services/aiService');

describe('AIService', () => {
  let mockOpenAIProvider;
  let mockBasicProvider;
  let mockJsonExtractor;
  let mockNormalizer;
  let mockImagePath;

  beforeEach(() => {
    mockImagePath = '/tmp/test-image.jpg';
    
    mockOpenAIProvider = {
      isConfigured: jest.fn(),
      analyzeCarDamage: jest.fn()
    };

    mockBasicProvider = {
      analyzeCarDamage: jest.fn()
    };

    mockJsonExtractor = {
      extract: jest.fn()
    };

    mockNormalizer = {
      normalize: jest.fn()
    };

    OpenAIProvider.mockImplementation(() => mockOpenAIProvider);
    BasicProvider.mockImplementation(() => mockBasicProvider);
    JsonExtractor.mockImplementation(() => mockJsonExtractor);
    AnalysisNormalizer.mockImplementation(() => mockNormalizer);

    // Replace the providers on the singleton instance
    // This works because the service is exported as an instance
    AIService.openaiProvider = mockOpenAIProvider;
    AIService.basicProvider = mockBasicProvider;
    AIService.jsonExtractor = mockJsonExtractor;
    AIService.normalizer = mockNormalizer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeCarDamage', () => {
    test('should use OpenAI provider when configured', async () => {
      mockOpenAIProvider.isConfigured.mockReturnValue(true);
      mockOpenAIProvider.analyzeCarDamage.mockResolvedValue({
        success: true,
        rawAnalysis: '{"severity": "Minor"}',
        provider: 'OpenAI GPT-4 Vision'
      });

      mockJsonExtractor.extract.mockReturnValue({ severity: 'Minor' });
      mockNormalizer.normalize.mockReturnValue({
        severity: 'Minor',
        confidence: 7
      });

      const result = await AIService.analyzeCarDamage(mockImagePath);

      expect(mockOpenAIProvider.analyzeCarDamage).toHaveBeenCalledWith(mockImagePath);
      expect(mockJsonExtractor.extract).toHaveBeenCalledWith('{"severity": "Minor"}');
      expect(mockNormalizer.normalize).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.provider).toBe('OpenAI GPT-4 Vision');
    });

    test('should fallback to basic provider when OpenAI fails', async () => {
      mockOpenAIProvider.isConfigured.mockReturnValue(true);
      mockOpenAIProvider.analyzeCarDamage.mockRejectedValue(new Error('API error'));

      mockBasicProvider.analyzeCarDamage.mockResolvedValue({
        success: true,
        rawAnalysis: { severity: 'Minor' },
        provider: 'Basic Analysis (Demo)',
        note: 'Demo note'
      });

      mockJsonExtractor.extract.mockReturnValue({ severity: 'Minor' });
      mockNormalizer.normalize.mockReturnValue({
        severity: 'Minor',
        confidence: 3
      });

      const result = await AIService.analyzeCarDamage(mockImagePath);

      expect(mockBasicProvider.analyzeCarDamage).toHaveBeenCalledWith(mockImagePath);
      expect(result.success).toBe(true);
      expect(result.provider).toBe('Basic Analysis (Demo)');
      expect(result.note).toBe('Demo note');
    });

    test('should use basic provider when OpenAI not configured', async () => {
      mockOpenAIProvider.isConfigured.mockReturnValue(false);

      mockBasicProvider.analyzeCarDamage.mockResolvedValue({
        success: true,
        rawAnalysis: { severity: 'Moderate' },
        provider: 'Basic Analysis (Demo)'
      });

      mockJsonExtractor.extract.mockReturnValue({ severity: 'Moderate' });
      mockNormalizer.normalize.mockReturnValue({
        severity: 'Moderate',
        confidence: 4
      });

      const result = await AIService.analyzeCarDamage(mockImagePath);

      expect(mockOpenAIProvider.analyzeCarDamage).not.toHaveBeenCalled();
      expect(mockBasicProvider.analyzeCarDamage).toHaveBeenCalledWith(mockImagePath);
      expect(result.success).toBe(true);
    });

    test('should handle all providers failing', async () => {
      mockOpenAIProvider.isConfigured.mockReturnValue(false);
      mockBasicProvider.analyzeCarDamage.mockRejectedValue(new Error('All failed'));

      const result = await AIService.analyzeCarDamage(mockImagePath);

      expect(result.success).toBe(false);
      expect(result.error).toBe('All failed');
      expect(result.analysis.severity).toBe('Unknown');
      expect(result.analysis.confidence).toBe(0);
    });

    test('should handle failed analysis result', async () => {
      mockOpenAIProvider.isConfigured.mockReturnValue(true);
      mockOpenAIProvider.analyzeCarDamage.mockResolvedValue({
        success: false,
        error: 'Analysis failed'
      });

      const result = await AIService.analyzeCarDamage(mockImagePath);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Analysis failed');
    });
  });

  describe('processAnalysisResult', () => {
    test('should process successful result', () => {
      // Ensure mocks are set up
      AIService.jsonExtractor = mockJsonExtractor;
      AIService.normalizer = mockNormalizer;

      const mockResult = {
        success: true,
        rawAnalysis: '{"test": "data"}',
        provider: 'Test Provider'
      };

      mockJsonExtractor.extract.mockReturnValue({ test: 'data' });
      mockNormalizer.normalize.mockReturnValue({ normalized: true });

      const processed = AIService.processAnalysisResult(mockResult);

      expect(processed.success).toBe(true);
      expect(processed.analysis).toEqual({ normalized: true });
      expect(processed.provider).toBe('Test Provider');
    });

    test('should handle failed result', () => {
      // Ensure mocks are set up
      AIService.jsonExtractor = mockJsonExtractor;
      AIService.normalizer = mockNormalizer;

      const mockResult = {
        success: false,
        error: 'Test error'
      };

      const processed = AIService.processAnalysisResult(mockResult);

      expect(processed.success).toBe(false);
      expect(processed.error).toBe('Test error');
    });

    test('should include note when present', () => {
      // Ensure mocks are set up
      AIService.jsonExtractor = mockJsonExtractor;
      AIService.normalizer = mockNormalizer;

      const mockResult = {
        success: true,
        rawAnalysis: '{}',
        provider: 'Test',
        note: 'Test note'
      };

      mockJsonExtractor.extract.mockReturnValue({});
      mockNormalizer.normalize.mockReturnValue({});

      const processed = AIService.processAnalysisResult(mockResult);

      expect(processed.note).toBe('Test note');
    });
  });

  describe('createErrorResponse', () => {
    test('should create error response', () => {
      const errorResponse = AIService.createErrorResponse('Test error');

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBe('Test error');
      expect(errorResponse.analysis.severity).toBe('Unknown');
      expect(errorResponse.analysis.confidence).toBe(0);
    });
  });
});

