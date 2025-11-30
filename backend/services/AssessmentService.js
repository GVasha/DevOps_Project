/**
 * Assessment Service
 * Handles business logic for damage assessments
 * Follows Single Responsibility Principle
 */

const { v4: uuidv4 } = require('uuid');
const FileStorage = require('../utils/fileStorage');
const { getFilePath, extractFilenameFromUrl } = require('../utils/fileHelper');
const { ASSESSMENT } = require('../config/constants');

class AssessmentService {
  constructor() {
    this.storage = new FileStorage('assessments.json');
  }

  /**
   * Creates a new assessment
   */
  createAssessment(userId, imageUrl, description, location, aiAnalysis) {
    const assessment = {
      id: uuidv4(),
      userId,
      imageUrl,
      imagePath: getFilePath(extractFilenameFromUrl(imageUrl)),
      description: description || '',
      location: location || '',
      aiAnalysis,
      status: ASSESSMENT.STATUSES[1], // 'completed'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = this.storage.append(assessment);
    return saved ? assessment : null;
  }

  /**
   * Gets all assessments for a user
   */
  getUserAssessments(userId) {
    const allAssessments = this.storage.read();
    return allAssessments
      .filter(assessment => assessment.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Gets assessment by ID
   */
  getAssessmentById(assessmentId) {
    return this.storage.findById(assessmentId);
  }

  /**
   * Verifies user owns assessment
   */
  verifyOwnership(assessment, userId) {
    return assessment && assessment.userId === userId;
  }
}

module.exports = new AssessmentService();

