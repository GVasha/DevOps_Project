/**
 * OpenAI GPT-4 Vision API provider
 * Follows Single Responsibility Principle
 */

const axios = require('axios');
const fs = require('fs');
const AIProvider = require('./AIProvider');
const { getMimeType } = require('../../../utils/fileHelper');
const { AI } = require('../../../config/constants');

class OpenAIProvider extends AIProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey?.trim() || null;
  }

  /**
   * Checks if provider is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Gets provider name
   */
  getName() {
    return 'OpenAI GPT-4 Vision';
  }

  /**
   * Reads and encodes image to base64 from file path
   */
  encodeImageToBase64(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  }

  /**
   * Encodes image buffer to base64
   */
  encodeBufferToBase64(imageBuffer) {
    return imageBuffer.toString('base64');
  }

  /**
   * Builds the analysis prompt
   */
  buildAnalysisPrompt() {
    return `You are an expert automotive damage assessor. Analyze this car image thoroughly and provide a complete damage assessment.

**IMPORTANT: You must provide ALL fields, even if uncertain. Make your best professional estimate.**

Assess and categorize the damage:

1. **Severity** (choose one): None, Minor, Moderate, Severe, Total Loss
2. **Damage Types** (list all visible): scratches, dents, broken parts, missing components, paint damage, glass damage, structural damage, etc.
3. **Cost Category** (format as "Category: Range"): 
   - Low: $0-500
   - Medium: $500-2000
   - High: $2000-5000
   - Very High: $5000+
4. **Affected Areas** (list all): front bumper, rear bumper, hood, roof, doors, fenders, headlights, taillights, windshield, wheels, etc.
5. **Safety Concerns** (describe any safety issues or state "No immediate safety concerns identified")
6. **Confidence** (1-10): Your confidence level in this assessment
7. **Summary** (2-3 sentences): Professional assessment explanation

**You must respond in valid JSON format with ALL fields filled:**
{
  "severity": "one of: None, Minor, Moderate, Severe, Total Loss",
  "damageTypes": ["array of damage types"],
  "costCategory": "Category: $range",
  "affectedAreas": ["array of affected areas"],
  "safetyConcerns": "description or none identified",
  "confidence": 1-10,
  "summary": "detailed explanation"
}

Provide your complete assessment now.`;
  }

  /**
   * Makes API request to OpenAI with file path
   */
  async makeAPIRequest(imagePath) {
    const base64Image = this.encodeImageToBase64(imagePath);
    const mimeType = getMimeType(imagePath);

    return this.makeAPIRequestWithBase64(base64Image, mimeType);
  }

  /**
   * Makes API request to OpenAI with base64 image
   */
  async makeAPIRequestWithBase64(base64Image, mimeType) {
    const response = await axios.post(
      AI.OPENAI_API_URL,
      {
        model: AI.OPENAI_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: this.buildAnalysisPrompt()
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: AI.OPENAI_MAX_TOKENS
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content || '';
  }

  /**
   * Analyzes car damage using OpenAI Vision API from file path
   */
  async analyzeCarDamage(imagePath) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const analysis = await this.makeAPIRequest(imagePath);
      return {
        success: true,
        rawAnalysis: analysis,
        provider: this.getName()
      };
    } catch (error) {
      const status = error.response?.status;
      const providerMsg = error.response?.data?.error?.message || error.message;
      console.error('OpenAI analysis error:', { status, message: providerMsg });
      throw new Error(`AI analysis failed: ${providerMsg}`);
    }
  }

  /**
   * Analyzes car damage using OpenAI Vision API from buffer
   */
  async analyzeCarDamageFromBuffer(imageBuffer, mimeType) {
    if (!this.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const base64Image = this.encodeBufferToBase64(imageBuffer);
      const analysis = await this.makeAPIRequestWithBase64(base64Image, mimeType);
      return {
        success: true,
        rawAnalysis: analysis,
        provider: this.getName()
      };
    } catch (error) {
      const status = error.response?.status;
      const providerMsg = error.response?.data?.error?.message || error.message;
      console.error('OpenAI analysis error:', { status, message: providerMsg });
      throw new Error(`AI analysis failed: ${providerMsg}`);
    }
  }
}

module.exports = OpenAIProvider;

