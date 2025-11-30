/**
 * Claim calculation utilities
 * Follows Single Responsibility Principle
 */

const { DAMAGE } = require('../config/constants');

/**
 * Calculates estimated cost based on AI analysis
 */
function calculateEstimatedCost(aiAnalysis) {
  if (!aiAnalysis || !aiAnalysis.analysis) {
    return 'Unknown';
  }

  const costCategory = aiAnalysis.analysis.costCategory;
  if (costCategory) {
    return costCategory;
  }

  // Fallback based on severity
  const severity = aiAnalysis.analysis.severity;
  const severityToCostMap = {
    'None': 'Low',
    'Minor': 'Low',
    'Moderate': 'Medium',
    'Severe': 'High',
    'Total Loss': 'Very High'
  };

  return severityToCostMap[severity] || 'Unknown';
}

/**
 * Calculates priority based on AI analysis
 */
function calculatePriority(aiAnalysis) {
  if (!aiAnalysis || !aiAnalysis.analysis) {
    return 'Medium';
  }

  const safetyConcerns = aiAnalysis.analysis.safetyConcerns;
  if (safetyConcerns && safetyConcerns.toLowerCase().includes('safety')) {
    return 'High';
  }

  const severity = aiAnalysis.analysis.severity;
  const severityToPriorityMap = {
    'None': 'Low',
    'Minor': 'Low',
    'Moderate': 'Medium',
    'Severe': 'High',
    'Total Loss': 'High'
  };

  return severityToPriorityMap[severity] || 'Medium';
}

module.exports = {
  calculateEstimatedCost,
  calculatePriority
};

