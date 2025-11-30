/**
 * Normalizes various shapes of AI output into a consistent schema
 * Follows Single Responsibility Principle
 */

const { DAMAGE, AI } = require('../../config/constants');
const AnalysisValidator = require('./AnalysisValidator');

class AnalysisNormalizer {
  constructor() {
    this.validator = new AnalysisValidator();
  }

  /**
   * Normalizes raw AI analysis into consistent format
   */
  normalize(raw) {
    const normalized = {
      severity: this.normalizeSeverity(raw.severity),
      damageTypes: this.toArray(raw.damageTypes),
      costCategory: this.pickCategory(raw.costCategory),
      affectedAreas: this.toArray(raw.affectedAreas),
      safetyConcerns: this.normalizeSafetyConcerns(raw.safetyConcerns),
      confidence: this.normalizeConfidence(raw.confidence),
      summary: this.normalizeSummary(raw.summary)
    };

    // Add cost range if available
    const costRange = this.extractCostRange(raw.costCategory);
    if (costRange) {
      normalized.costRange = costRange;
    }

    // Validate and apply fallback if needed
    if (!this.validator.validate(normalized)) {
      return this.createFallbackAnalysis(normalized, raw);
    }

    return normalized;
  }

  /**
   * Converts value to array
   */
  toArray(value) {
    if (Array.isArray(value)) {
      return value.map(v => String(v).trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(Boolean);
    }
    if (value == null) {
      return [];
    }
    return [String(value).trim()].filter(Boolean);
  }

  /**
   * Normalizes severity level
   */
  normalizeSeverity(value) {
    if (!value) return 'Unknown';
    const map = {
      'none': 'None',
      'minor': 'Minor',
      'moderate': 'Moderate',
      'severe': 'Severe',
      'total loss': 'Total Loss',
      'unknown': 'Unknown'
    };
    const key = String(value).toLowerCase();
    return map[key] || String(value);
  }

  /**
   * Extracts cost category from various formats
   */
  pickCategory(value) {
    if (!value) return 'Unknown';
    const str = String(value).trim();
    
    // Handle "Category: Very High: $5000+" format
    if (str.toLowerCase().startsWith('category:')) {
      return this.extractCategoryFromPrefixed(str);
    }
    
    // Standard format like "Very High: $5000+"
    const beforeColon = str.split(':')[0].trim();
    return DAMAGE.COST_CATEGORIES.includes(beforeColon) ? beforeColon : 'Unknown';
  }

  /**
   * Extracts category from "Category: ..." format
   */
  extractCategoryFromPrefixed(str) {
    const parts = str.split(':').map(p => p.trim());
    
    // Check if second part is a valid category
    if (parts.length > 1 && DAMAGE.COST_CATEGORIES.includes(parts[1])) {
      return parts[1];
    }
    
    // Map dollar range to category
    const dollarPart = parts.slice(1).join(':');
    return this.mapDollarRangeToCategory(dollarPart);
  }

  /**
   * Maps dollar range string to category
   */
  mapDollarRangeToCategory(dollarPart) {
    if (dollarPart.includes('5000+') || dollarPart.includes('$5000')) {
      return 'Very High';
    }
    if (dollarPart.includes('2000') && dollarPart.includes('5000')) {
      return 'High';
    }
    if (dollarPart.includes('500') && dollarPart.includes('2000')) {
      return 'Medium';
    }
    if (dollarPart.includes('$0') || dollarPart.includes('500')) {
      return 'Low';
    }
    return 'Unknown';
  }

  /**
   * Extracts cost range from cost category string
   */
  extractCostRange(costCategory) {
    if (typeof costCategory !== 'string' || !costCategory.includes(':')) {
      return null;
    }
    
    const parts = costCategory.split(':').map(p => p.trim());
    const dollarPart = parts.find(p => p.includes('$'));
    
    if (dollarPart) {
      return dollarPart;
    }
    
    if (parts.length > 1) {
      return parts[parts.length - 1];
    }
    
    return null;
  }

  /**
   * Normalizes safety concerns
   */
  normalizeSafetyConcerns(value) {
    const safetyList = this.toArray(value);
    if (safetyList.length > 0) {
      return safetyList.join(', ');
    }
    if (typeof value === 'string' && value) {
      return value;
    }
    return null;
  }

  /**
   * Normalizes confidence score
   */
  normalizeConfidence(value) {
    const n = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(n)) return 0;
    return Math.max(AI.CONFIDENCE_MIN, Math.min(AI.CONFIDENCE_MAX, Math.round(n)));
  }

  /**
   * Normalizes summary text
   */
  normalizeSummary(value) {
    return (value && String(value).trim()) || '';
  }

  /**
   * Creates fallback analysis when validation fails
   */
  createFallbackAnalysis(normalized, raw) {
    return {
      severity: 'Unknown',
      damageTypes: normalized.damageTypes,
      costCategory: normalized.costCategory,
      ...(normalized.costRange ? { costRange: normalized.costRange } : {}),
      affectedAreas: normalized.affectedAreas,
      safetyConcerns: normalized.safetyConcerns,
      confidence: 0,
      summary: normalized.summary || 'Analysis normalized with missing fields.'
    };
  }
}

module.exports = AnalysisNormalizer;

