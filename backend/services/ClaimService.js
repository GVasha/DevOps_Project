/**
 * Claim Service
 * Handles business logic for insurance claims
 * Follows Single Responsibility Principle
 */

const { v4: uuidv4 } = require('uuid');
const FileStorage = require('../utils/fileStorage');
const { CLAIM } = require('../config/constants');
const { calculateEstimatedCost, calculatePriority } = require('../utils/claimHelper');

class ClaimService {
  constructor() {
    this.storage = new FileStorage('claims.json');
  }

  /**
   * Generates unique claim number
   */
  generateClaimNumber() {
    return `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  /**
   * Creates a new claim
   */
  createClaim(userId, assessmentId, claimData, assessment) {
    const claim = {
      id: uuidv4(),
      claimNumber: this.generateClaimNumber(),
      userId,
      assessmentId,
      claimType: claimData.claimType,
      incidentDate: claimData.incidentDate,
      incidentDescription: claimData.incidentDescription,
      policyNumber: claimData.policyNumber || null,
      status: CLAIM.STATUSES[0], // 'submitted'
      estimatedCost: calculateEstimatedCost(assessment.aiAnalysis),
      priority: calculatePriority(assessment.aiAnalysis),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = this.storage.append(claim);
    return saved ? claim : null;
  }

  /**
   * Gets all claims for a user
   */
  getUserClaims(userId) {
    const allClaims = this.storage.read();
    if (!Array.isArray(allClaims)) {
      return [];
    }
    return allClaims
      .filter(claim => claim.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Gets claim by ID
   */
  getClaimById(claimId) {
    return this.storage.findById(claimId);
  }

  /**
   * Verifies user owns claim
   */
  verifyOwnership(claim, userId) {
    return !!(claim && claim.userId === userId);
  }
}

module.exports = new ClaimService();

