/**
 * Main AI Service orchestrator
 * Follows Dependency Inversion Principle - depends on abstractions (AIProvider)
 */

const OpenAIProvider = require('./ai/providers/OpenAIProvider');
const BasicProvider = require('./ai/providers/BasicProvider');
const JsonExtractor = require('./ai/JsonExtractor');
const AnalysisNormalizer = require('./ai/AnalysisNormalizer');

class AIService {
  constructor() {
    this.openaiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY);
    this.basicProvider = new BasicProvider();
    this.jsonExtractor = new JsonExtractor();
    this.normalizer = new AnalysisNormalizer();
  }

  /**
   * Main analysis method that tries different providers
   */
  async analyzeCarDamage(imagePath) {
    try {
      // Try OpenAI first if configured
      if (this.openaiProvider.isConfigured()) {
        try {
          const result = await this.openaiProvider.analyzeCarDamage(imagePath);
          return this.processAnalysisResult(result);
        } catch (openaiError) {
          console.warn('OpenAI analysis failed, falling back to basic analysis:', openaiError.message);
        }
      }

      // Fallback to basic analysis
      const result = await this.basicProvider.analyzeCarDamage(imagePath);
      return this.processAnalysisResult(result);

    } catch (error) {
      console.error('All analysis methods failed:', error);
      return this.createErrorResponse(error.message);
    }
  }

  /**
   * Processes raw analysis result from provider
   */
  processAnalysisResult(result) {
    if (!result.success) {
      return this.createErrorResponse(result.error || 'Analysis failed');
    }

    // Extract JSON from raw analysis
    const extracted = this.jsonExtractor.extract(result.rawAnalysis);
    
    // Normalize to consistent format
    const normalized = this.normalizer.normalize(extracted);

    return {
      success: true,
      analysis: normalized,
      provider: result.provider,
      ...(result.note && { note: result.note })
    };
  }

  /**
   * Creates error response
   */
  createErrorResponse(errorMessage) {
    return {
      success: false,
      error: errorMessage,
      analysis: {
        severity: 'Unknown',
        summary: 'Analysis failed. Please try again or contact support.',
        confidence: 0
      }
    };
  }
}

module.exports = new AIService();
