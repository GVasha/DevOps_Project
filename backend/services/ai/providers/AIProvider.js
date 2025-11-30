/**
 * Abstract base class for AI providers
 * Follows Dependency Inversion Principle
 */

class AIProvider {
  /**
   * Analyzes car damage from image
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeCarDamage(imagePath) {
    throw new Error('analyzeCarDamage must be implemented by subclass');
  }

  /**
   * Gets provider name
   * @returns {string} Provider name
   */
  getName() {
    throw new Error('getName must be implemented by subclass');
  }
}

module.exports = AIProvider;

