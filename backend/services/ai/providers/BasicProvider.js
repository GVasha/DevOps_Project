/**
 * Basic rule-based damage detection provider (fallback)
 * Follows Single Responsibility Principle
 */

const fs = require('fs');
const AIProvider = require('./AIProvider');
const { AI, DAMAGE } = require('../../../config/constants');

class BasicProvider extends AIProvider {
  /**
   * Gets provider name
   */
  getName() {
    return 'Basic Analysis (Demo)';
  }

  /**
   * Determines severity based on file size
   */
  determineSeverityByFileSize(fileSize) {
    if (fileSize > AI.FILE_SIZE_THRESHOLD_SEVERE) {
      return { severity: 'Severe', confidence: 5 };
    }
    if (fileSize > AI.FILE_SIZE_THRESHOLD_MODERATE) {
      return { severity: 'Moderate', confidence: 4 };
    }
    return { severity: 'Minor', confidence: 3 };
  }

  /**
   * Maps severity to cost category
   */
  mapSeverityToCostCategory(severity) {
    const mapping = {
      'Minor': 'Low',
      'Moderate': 'Medium',
      'Severe': 'High',
      'Total Loss': 'Very High',
      'None': 'Low'
    };
    return mapping[severity] || 'Unknown';
  }

  /**
   * Analyzes car damage using basic file characteristics
   */
  async analyzeCarDamage(imagePath) {
    try {
      const fileStats = fs.statSync(imagePath);
      const fileSize = fileStats.size;
      
      return this.performAnalysis(fileSize);
    } catch (error) {
      console.error('Basic analysis error:', error);
      throw new Error(`Basic analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyzes car damage from buffer (no file saving)
   */
  async analyzeCarDamageFromBuffer(imageBuffer, mimeType) {
    try {
      const fileSize = imageBuffer.length;
      
      return this.performAnalysis(fileSize);
    } catch (error) {
      console.error('Basic analysis error:', error);
      throw new Error(`Basic analysis failed: ${error.message}`);
    }
  }

  /**
   * Performs the analysis based on file size
   */
  performAnalysis(fileSize) {
    const { severity, confidence } = this.determineSeverityByFileSize(fileSize);
    const costCategory = this.mapSeverityToCostCategory(severity);

    return {
      success: true,
      rawAnalysis: {
        severity,
        damageTypes: ['Surface scratches', 'Possible dents'],
        costCategory,
        affectedAreas: ['Unknown - requires manual inspection'],
        safetyConcerns: 'Manual inspection recommended',
        confidence,
        summary: `Basic analysis suggests ${severity.toLowerCase()} damage. Professional inspection recommended for accurate assessment.`
      },
      provider: this.getName(),
      note: 'This is a demonstration. Configure AI API keys for accurate analysis.'
    };
  }
}

module.exports = BasicProvider;

