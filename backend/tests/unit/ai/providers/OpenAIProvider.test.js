/**
 * Unit tests for OpenAIProvider
 */

const axios = require('axios');
const fs = require('fs');
const OpenAIProvider = require('../../../../services/ai/providers/OpenAIProvider');
const { AI } = require('../../../../config/constants');

jest.mock('axios');
jest.mock('fs');

describe('OpenAIProvider', () => {
  let provider;
  let mockImagePath;

  beforeEach(() => {
    mockImagePath = '/tmp/test-image.jpg';
    provider = new OpenAIProvider('test-api-key');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should initialize with API key', () => {
      const providerWithKey = new OpenAIProvider('test-key');
      expect(providerWithKey.apiKey).toBe('test-key');
    });

    test('should handle null API key', () => {
      const providerNoKey = new OpenAIProvider(null);
      expect(providerNoKey.apiKey).toBeNull();
    });

    test('should trim whitespace from API key', () => {
      const providerTrimmed = new OpenAIProvider('  test-key  ');
      expect(providerTrimmed.apiKey).toBe('test-key');
    });
  });

  describe('isConfigured', () => {
    test('should return true when API key is set', () => {
      expect(provider.isConfigured()).toBe(true);
    });

    test('should return false when API key is null', () => {
      const providerNoKey = new OpenAIProvider(null);
      expect(providerNoKey.isConfigured()).toBe(false);
    });

    test('should return false when API key is empty string', () => {
      const providerEmpty = new OpenAIProvider('');
      expect(providerEmpty.isConfigured()).toBe(false);
    });
  });

  describe('getName', () => {
    test('should return provider name', () => {
      expect(provider.getName()).toBe('OpenAI GPT-4 Vision');
    });
  });

  describe('encodeImageToBase64', () => {
    test('should encode image to base64', () => {
      const mockBuffer = Buffer.from('test image data');
      fs.readFileSync.mockReturnValue(mockBuffer);

      const result = provider.encodeImageToBase64(mockImagePath);

      expect(fs.readFileSync).toHaveBeenCalledWith(mockImagePath);
      expect(result).toBe(mockBuffer.toString('base64'));
    });
  });

  describe('buildAnalysisPrompt', () => {
    test('should return analysis prompt', () => {
      const prompt = provider.buildAnalysisPrompt();
      expect(prompt).toContain('expert automotive damage assessor');
      expect(prompt).toContain('severity');
      expect(prompt).toContain('damageTypes');
      expect(prompt).toContain('costCategory');
    });
  });

  describe('makeAPIRequest', () => {
    test('should make API request successfully', async () => {
      const mockBuffer = Buffer.from('test image');
      fs.readFileSync.mockReturnValue(mockBuffer);

      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: '{"severity": "Minor", "confidence": 7}'
            }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await provider.makeAPIRequest(mockImagePath);

      expect(axios.post).toHaveBeenCalledWith(
        AI.OPENAI_API_URL,
        expect.objectContaining({
          model: AI.OPENAI_MODEL,
          messages: expect.any(Array)
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );

      expect(result).toBe('{"severity": "Minor", "confidence": 7}');
    });

    test('should handle empty response', async () => {
      fs.readFileSync.mockReturnValue(Buffer.from('test'));
      axios.post.mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: ''
            }
          }]
        }
      });

      const result = await provider.makeAPIRequest(mockImagePath);
      expect(result).toBe('');
    });
  });

  describe('analyzeCarDamage', () => {
    test('should analyze damage successfully', async () => {
      const mockBuffer = Buffer.from('test image');
      fs.readFileSync.mockReturnValue(mockBuffer);

      axios.post.mockResolvedValue({
        data: {
          choices: [{
            message: {
              content: '{"severity": "Moderate", "confidence": 8}'
            }
          }]
        }
      });

      const result = await provider.analyzeCarDamage(mockImagePath);

      expect(result.success).toBe(true);
      expect(result.rawAnalysis).toBe('{"severity": "Moderate", "confidence": 8}');
      expect(result.provider).toBe('OpenAI GPT-4 Vision');
    });

    test('should throw error when API key not configured', async () => {
      const providerNoKey = new OpenAIProvider(null);
      
      await expect(providerNoKey.analyzeCarDamage(mockImagePath))
        .rejects.toThrow('OpenAI API key not configured');
    });

    test('should handle API errors', async () => {
      const mockBuffer = Buffer.from('test image');
      fs.readFileSync.mockReturnValue(mockBuffer);

      const apiError = {
        response: {
          status: 401,
          data: {
            error: {
              message: 'Invalid API key'
            }
          }
        }
      };

      axios.post.mockRejectedValue(apiError);

      await expect(provider.analyzeCarDamage(mockImagePath))
        .rejects.toThrow('AI analysis failed: Invalid API key');
    });

    test('should handle network errors', async () => {
      const mockBuffer = Buffer.from('test image');
      fs.readFileSync.mockReturnValue(mockBuffer);

      axios.post.mockRejectedValue(new Error('Network error'));

      await expect(provider.analyzeCarDamage(mockImagePath))
        .rejects.toThrow('AI analysis failed: Network error');
    });

    test('should handle errors without response object', async () => {
      const mockBuffer = Buffer.from('test image');
      fs.readFileSync.mockReturnValue(mockBuffer);

      axios.post.mockRejectedValue(new Error('Unknown error'));

      await expect(provider.analyzeCarDamage(mockImagePath))
        .rejects.toThrow('AI analysis failed: Unknown error');
    });
  });
});

