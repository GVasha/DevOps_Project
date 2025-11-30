/**
 * Assessment routes
 * Refactored to use service layer and remove duplication
 */

const express = require('express');
const fs = require('fs');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { handleValidationErrors } = require('../utils/validationHelper');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { getFilePath, extractFilenameFromUrl } = require('../utils/fileHelper');
const { USER } = require('../config/constants');
const assessmentService = require('../services/AssessmentService');
const claimService = require('../services/ClaimService');
const aiService = require('../services/aiService');

const router = express.Router();

// Create new damage assessment
router.post('/analyze', authenticateToken, [
  body('imageUrl').notEmpty().withMessage('Image URL is required'),
  body('description').optional().isLength({ max: USER.DESCRIPTION_MAX_LENGTH })
    .withMessage(`Description must not exceed ${USER.DESCRIPTION_MAX_LENGTH} characters`),
  body('location').optional().isLength({ max: USER.LOCATION_MAX_LENGTH })
    .withMessage(`Location must not exceed ${USER.LOCATION_MAX_LENGTH} characters`)
], async (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { imageUrl, description, location } = req.body;
    const filename = extractFilenameFromUrl(imageUrl);
    const imagePath = getFilePath(filename);

    // Verify file exists
    if (!fs.existsSync(imagePath)) {
      return errorResponse(res, 404, 'Image file not found');
    }

    // Perform AI analysis
    const aiResult = await aiService.analyzeCarDamage(imagePath);

    // Create assessment record
    const assessment = assessmentService.createAssessment(
      req.user.id,
      imageUrl,
      description,
      location,
      aiResult
    );

    if (!assessment) {
      return errorResponse(res, 500, 'Failed to save assessment');
    }

    return successResponse(res, 201, 'Damage assessment completed successfully', {
      assessment
    });

  } catch (error) {
    console.error('Assessment analysis error:', error);
    return errorResponse(res, 500, 'Failed to analyze damage', error.message);
  }
});

// Get all assessments for current user
router.get('/my-assessments', authenticateToken, (req, res) => {
  try {
    const assessments = assessmentService.getUserAssessments(req.user.id);
    return successResponse(res, 200, null, {
      assessments,
      total: assessments.length
    });

  } catch (error) {
    console.error('Get assessments error:', error);
    return errorResponse(res, 500, 'Failed to retrieve assessments');
  }
});

// Get specific assessment by ID
router.get('/assessment/:id', authenticateToken, (req, res) => {
  try {
    const assessment = assessmentService.getAssessmentById(req.params.id);

    if (!assessment) {
      return errorResponse(res, 404, 'Assessment not found');
    }

    if (!assessmentService.verifyOwnership(assessment, req.user.id)) {
      return errorResponse(res, 403, 'Access denied to this assessment');
    }

    return successResponse(res, 200, null, { assessment });

  } catch (error) {
    console.error('Get assessment error:', error);
    return errorResponse(res, 500, 'Failed to retrieve assessment');
  }
});

// Create insurance claim from assessment
router.post('/create-claim', authenticateToken, [
  body('assessmentId').notEmpty().withMessage('Assessment ID is required'),
  body('claimType').isIn(['collision', 'comprehensive', 'liability']).withMessage('Invalid claim type'),
  body('incidentDate').isISO8601().withMessage('Valid incident date is required'),
  body('incidentDescription')
    .isLength({ min: USER.INCIDENT_DESCRIPTION_MIN_LENGTH, max: USER.INCIDENT_DESCRIPTION_MAX_LENGTH })
    .withMessage(`Incident description must be between ${USER.INCIDENT_DESCRIPTION_MIN_LENGTH} and ${USER.INCIDENT_DESCRIPTION_MAX_LENGTH} characters`),
  body('policyNumber')
    .optional()
    .isLength({ min: USER.POLICY_NUMBER_MIN_LENGTH, max: USER.POLICY_NUMBER_MAX_LENGTH })
    .withMessage(`Policy number must be between ${USER.POLICY_NUMBER_MIN_LENGTH} and ${USER.POLICY_NUMBER_MAX_LENGTH} characters`)
], (req, res) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return validationError;

    const { assessmentId, claimType, incidentDate, incidentDescription, policyNumber } = req.body;

    // Verify assessment exists and belongs to user
    const assessment = assessmentService.getAssessmentById(assessmentId);
    if (!assessment) {
      return errorResponse(res, 404, 'Assessment not found');
    }

    if (!assessmentService.verifyOwnership(assessment, req.user.id)) {
      return errorResponse(res, 403, 'Access denied to this assessment');
    }

    // Create claim record
    const claim = claimService.createClaim(
      req.user.id,
      assessmentId,
      { claimType, incidentDate, incidentDescription, policyNumber },
      assessment
    );

    if (!claim) {
      return errorResponse(res, 500, 'Failed to create claim');
    }

    return successResponse(res, 201, 'Insurance claim created successfully', {
      claim
    });

  } catch (error) {
    console.error('Create claim error:', error);
    return errorResponse(res, 500, 'Failed to create claim', error.message);
  }
});

// Get all claims for current user
router.get('/my-claims', authenticateToken, (req, res) => {
  try {
    const claims = claimService.getUserClaims(req.user.id);
    return successResponse(res, 200, null, {
      claims,
      total: claims.length
    });

  } catch (error) {
    console.error('Get claims error:', error);
    return errorResponse(res, 500, 'Failed to retrieve claims');
  }
});

// Get specific claim by ID
router.get('/claim/:id', authenticateToken, (req, res) => {
  try {
    const claim = claimService.getClaimById(req.params.id);

    if (!claim) {
      return errorResponse(res, 404, 'Claim not found');
    }

    if (!claimService.verifyOwnership(claim, req.user.id)) {
      return errorResponse(res, 403, 'Access denied to this claim');
    }

    const assessment = assessmentService.getAssessmentById(claim.assessmentId);

    return successResponse(res, 200, null, {
      claim,
      assessment
    });

  } catch (error) {
    console.error('Get claim error:', error);
    return errorResponse(res, 500, 'Failed to retrieve claim');
  }
});

module.exports = router;
