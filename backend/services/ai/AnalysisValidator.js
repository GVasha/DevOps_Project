/**
 * Validates AI analysis results
 * Follows Single Responsibility Principle
 */

const { DAMAGE, AI } = require('../../config/constants');

class AnalysisValidator {
  /**
   * Validates if analysis result meets quality standards
   */
  validate(analysis) {
    return this.hasRequiredFields(analysis) &&
           this.hasValidSeverity(analysis) &&
           this.hasValidConfidence(analysis);
  }

  /**
   * Checks for required fields
   */
  hasRequiredFields(analysis) {
    const requiredFields = ['severity', 'summary', 'confidence'];
    return requiredFields.every(field => 
      analysis.hasOwnProperty(field)
    );
  }

  /**
   * Validates severity level
   */
  hasValidSeverity(analysis) {
    return DAMAGE.SEVERITY_LEVELS.includes(analysis.severity);
  }

  /**
   * Validates confidence score
   */
  hasValidConfidence(analysis) {
    return typeof analysis.confidence === 'number' && 
           analysis.confidence >= AI.CONFIDENCE_MIN && 
           analysis.confidence <= AI.CONFIDENCE_MAX;
  }
}

module.exports = AnalysisValidator;

